"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Wrench,
  X,
  Loader2,
  Plus,
  Truck,
  Building,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { crearMantenimientoAction } from "@/lib/actions/mantenimiento";
import { toast } from "sonner";

interface UnidadOption {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  odometroActualKm: number;
  estado: string;
}

interface SemirremolqueOption {
  id: string;
  placa: string;
  tipoCarroceria: string;
  marca: string | null;
  estado: string;
}

interface ModalNuevoMantenimientoProps {
  unidades: UnidadOption[];
  semirremolques: SemirremolqueOption[];
  onCreated?: () => void;
}

const PRESETS_MANTENIMIENTO = [
  {
    titulo: "Preventivo 15,000 km (Aceite + Filtros)",
    tipo: "preventivo" as const,
    manoObra: 450,
    repuestos: 1800,
  },
  {
    titulo: "Frenos de aire comprimido & zapatas (3 ejes)",
    tipo: "preventivo" as const,
    manoObra: 600,
    repuestos: 1200,
  },
  {
    titulo: "Alineación y rotación de neumáticos (10 llantas)",
    tipo: "preventivo" as const,
    manoObra: 350,
    repuestos: 200,
  },
  {
    titulo: "Engrase general de chasis y quinta rueda",
    tipo: "preventivo" as const,
    manoObra: 200,
    repuestos: 150,
  },
  {
    titulo: "Reparación correctiva: Sistema de embrague",
    tipo: "correctivo" as const,
    manoObra: 1200,
    repuestos: 3400,
  },
];

export function ModalNuevoMantenimiento({
  unidades,
  semirremolques,
  onCreated,
}: ModalNuevoMantenimientoProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const [entidadTipo, setEntidadTipo] = useState<"unidad" | "semirremolque">("unidad");
  const [entidadId, setEntidadId] = useState(unidades[0]?.id || "");
  const [tipo, setTipo] = useState<"preventivo" | "correctivo">("preventivo");
  const [descripcion, setDescripcion] = useState(PRESETS_MANTENIMIENTO[0].titulo);
  const [odometroRegistro, setOdometroRegistro] = useState(
    unidades[0] ? String(unidades[0].odometroActualKm) : "0"
  );
  const [fechaProgramada, setFechaProgramada] = useState(todayStr);
  const [taller, setTaller] = useState<"propio" | "tercero">("propio");
  const [nombreTaller, setNombreTaller] = useState("Taller Central Patio Callao");
  const [costoManoObra, setCostoManoObra] = useState("450.00");
  const [costoRepuestos, setCostoRepuestos] = useState("1800.00");
  const [estado, setEstado] = useState<"pendiente" | "en_proceso">("pendiente");
  const [observaciones, setObservaciones] = useState(
    "Control regular según programa de mantenimiento de flota pesada."
  );

  const handleEntidadTipoChange = (nuevoTipo: "unidad" | "semirremolque") => {
    setEntidadTipo(nuevoTipo);
    if (nuevoTipo === "unidad") {
      const u = unidades[0];
      setEntidadId(u?.id || "");
      setOdometroRegistro(u ? String(u.odometroActualKm) : "0");
    } else {
      setEntidadId(semirremolques[0]?.id || "");
      setOdometroRegistro("0");
    }
  };

  const handleSelectUnidad = (id: string) => {
    setEntidadId(id);
    const u = unidades.find((item) => item.id === id);
    if (u) {
      setOdometroRegistro(String(u.odometroActualKm));
    }
  };

  const handlePresetSelect = (p: (typeof PRESETS_MANTENIMIENTO)[number]) => {
    setDescripcion(p.titulo);
    setTipo(p.tipo);
    setCostoManoObra(p.manoObra.toFixed(2));
    setCostoRepuestos(p.repuestos.toFixed(2));
  };

  const moNum = parseFloat(costoManoObra) || 0;
  const repNum = parseFloat(costoRepuestos) || 0;
  const totalCalculado = (moNum + repNum).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!entidadId) {
      toast.error("Debe seleccionar una unidad o carreta");
      return;
    }
    if (!descripcion || descripcion.trim().length < 5) {
      toast.error("La descripción debe tener al menos 5 caracteres");
      return;
    }

    setLoading(true);
    try {
      const res = await crearMantenimientoAction({
        entidadTipo,
        entidadId,
        tipo,
        descripcion,
        odometroRegistro: entidadTipo === "unidad" ? parseInt(odometroRegistro, 10) || undefined : undefined,
        fechaProgramada,
        taller,
        nombreTaller,
        costoManoObra: moNum,
        costoRepuestos: repNum,
        costoTotal: parseFloat(totalCalculado),
        estado,
        observaciones,
      });

      if (res.success) {
        toast.success(res.message || "Orden de trabajo creada.");
        if (estado === "en_proceso") {
          toast.warning("La unidad ha sido marcada como 'En Mantenimiento' y está bloqueada para despachos.");
        }
        setOpen(false);
        router.refresh();
        onCreated?.();
      } else {
        toast.error(res.error || "No se pudo registrar la orden.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión al registrar mantenimiento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="h-9 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-amber-500/10"
      >
        <Plus className="h-4 w-4" />
        <span>Nueva Orden de Trabajo (OT)</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#111827] border border-[#1F2937] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
            {/* Header */}
            <div className="p-5 border-b border-[#1F2937] flex items-center justify-between bg-[#0B1220]/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-[family-name:var(--font-sora)]">
                    Nueva Orden de Trabajo Mecánico
                  </h3>
                  <p className="text-xs text-slate-400">
                    Intervención técnica preventiva o correctiva para tracto-camiones y semirremolques
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Presets Rápidos */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                  Plantillas de Mantenimiento Frecuentes
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESETS_MANTENIMIENTO.map((p) => (
                    <button
                      key={p.titulo}
                      type="button"
                      onClick={() => handlePresetSelect(p)}
                      className={`text-[11px] px-2.5 py-1 rounded-md border transition-all ${
                        descripcion === p.titulo
                          ? "bg-amber-500/20 border-amber-500 text-amber-300 font-semibold"
                          : "bg-slate-900 border-[#1F2937] text-slate-400 hover:text-slate-200 hover:border-slate-700"
                      }`}
                    >
                      {p.titulo.split(" (")[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selector de Tipo de Entidad y Equipo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Tipo de Equipo *
                  </label>
                  <div className="grid grid-cols-2 gap-1 bg-[#0B1220] p-1 border border-[#1F2937] rounded-lg text-xs">
                    <button
                      type="button"
                      onClick={() => handleEntidadTipoChange("unidad")}
                      className={`py-1.5 px-2 rounded font-medium transition-colors ${
                        entidadTipo === "unidad"
                          ? "bg-amber-500 text-slate-950 font-bold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Tracto / Rígido
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEntidadTipoChange("semirremolque")}
                      className={`py-1.5 px-2 rounded font-medium transition-colors ${
                        entidadTipo === "semirremolque"
                          ? "bg-amber-500 text-slate-950 font-bold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Semirremolque
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Seleccionar {entidadTipo === "unidad" ? "Tracto Vehicular" : "Semirremolque / Carreta"} *
                  </label>
                  {entidadTipo === "unidad" ? (
                    <select
                      value={entidadId}
                      onChange={(e) => handleSelectUnidad(e.target.value)}
                      className="w-full bg-[#0B1220] border border-[#1F2937] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      required
                    >
                      <option value="">-- Seleccionar Tracto --</option>
                      {unidades.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.placa} ({u.marca} {u.modelo}) - {u.odometroActualKm.toLocaleString()} km [{u.estado}]
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select
                      value={entidadId}
                      onChange={(e) => setEntidadId(e.target.value)}
                      className="w-full bg-[#0B1220] border border-[#1F2937] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      required
                    >
                      <option value="">-- Seleccionar Semirremolque --</option>
                      {semirremolques.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.placa} ({s.tipoCarroceria} - {s.marca}) [{s.estado}]
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Tipo de Mantenimiento y Odómetro */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Naturaleza *
                  </label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as "preventivo" | "correctivo")}
                    className="w-full bg-[#0B1220] border border-[#1F2937] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="preventivo">Preventivo Programado</option>
                    <option value="correctivo">Correctivo / Avería en Ruta</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Odómetro Intervención (Km)
                  </label>
                  <input
                    type="number"
                    value={odometroRegistro}
                    onChange={(e) => setOdometroRegistro(e.target.value)}
                    disabled={entidadTipo === "semirremolque"}
                    placeholder="84000"
                    className="w-full bg-[#0B1220] border border-[#1F2937] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500 disabled:opacity-40"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Fecha Programada *
                  </label>
                  <input
                    type="date"
                    value={fechaProgramada}
                    onChange={(e) => setFechaProgramada(e.target.value)}
                    className="w-full bg-[#0B1220] border border-[#1F2937] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              {/* Descripción del Servicio */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Descripción Detallada de los Trabajos *
                </label>
                <textarea
                  rows={2}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Detalle los repuestos a sustituir, fluidos y componentes inspeccionados..."
                  className="w-full bg-[#0B1220] border border-[#1F2937] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              {/* Taller y Nombre */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Tipo de Taller *
                  </label>
                  <select
                    value={taller}
                    onChange={(e) => {
                      const nuevoTaller = e.target.value as "propio" | "tercero";
                      setTaller(nuevoTaller);
                      if (nuevoTaller === "propio") {
                        setNombreTaller("Taller Central Patio Callao");
                      } else {
                        setNombreTaller("Scania Perú - Concesionario Huachipa");
                      }
                    }}
                    className="w-full bg-[#0B1220] border border-[#1F2937] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="propio">Taller Propio</option>
                    <option value="tercero">Taller Externo / Concesionario</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Nombre del Taller / Sede *
                  </label>
                  <input
                    type="text"
                    value={nombreTaller}
                    onChange={(e) => setNombreTaller(e.target.value)}
                    placeholder="Ej: Scania Huachipa o Patio Callao"
                    className="w-full bg-[#0B1220] border border-[#1F2937] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              {/* Costos: Mano de Obra, Repuestos y Total */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Mano de Obra (S/)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={costoManoObra}
                    onChange={(e) => setCostoManoObra(e.target.value)}
                    className="w-full bg-[#0B1220] border border-[#1F2937] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Repuestos / Insumos (S/)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={costoRepuestos}
                    onChange={(e) => setCostoRepuestos(e.target.value)}
                    className="w-full bg-[#0B1220] border border-[#1F2937] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Presupuesto Total (S/)
                  </label>
                  <div className="w-full bg-[#0B1220] border border-slate-700 rounded-lg px-3 py-2 text-xs text-amber-400 font-mono font-bold flex items-center justify-between">
                    <span>S/ {totalCalculado}</span>
                    <DollarSign className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                </div>
              </div>

              {/* Estado Inicial de la OT */}
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">
                    Estado de Apertura de la OT
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {estado === "en_proceso"
                      ? "La unidad pasará de inmediato al estado 'Mantenimiento' (No despachable)."
                      : "La orden queda programada para su ejecución en la fecha agendada."}
                  </span>
                </div>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as "pendiente" | "en_proceso")}
                  className="bg-[#0B1220] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-amber-500"
                >
                  <option value="pendiente">Programado (Pendiente)</option>
                  <option value="en_proceso">En Taller Ahora (En Proceso)</option>
                </select>
              </div>

              {/* Botones de acción */}
              <div className="pt-3 border-t border-[#1F2937] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold flex items-center gap-2 transition-colors shadow-lg shadow-amber-500/10"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Generando orden...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Crear Orden de Trabajo</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

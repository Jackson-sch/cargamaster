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
  Container,
  Activity,
  Tag,
} from "lucide-react";
import { crearMantenimientoAction } from "@/lib/actions/mantenimiento";
import { toast } from "sonner";
import {
  FormFieldset,
  FormSelect,
  FormInput,
  FormTextarea,
} from "@/components/ui/form-controls";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";

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
        className="h-9 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-amber-500/10"
      >
        <Plus className="h-4 w-4" />
        <span>Nueva Orden de Trabajo (OT)</span>
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl md:max-w-3xl p-0 flex flex-col h-full bg-[#0E1524] border-l border-[#1F2937] text-left"
        >
          {/* Header */}
          <SheetHeader className="p-5 border-b border-[#1F2937] bg-[#0B1220]/90 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <SheetTitle className="text-base font-bold text-white font-[family-name:var(--font-sora)]">
                  Nueva Orden de Trabajo Mecánico (OT)
                </SheetTitle>
                <SheetDescription className="text-xs text-slate-400">
                  Intervención técnica preventiva o correctiva para tracto-camiones y semirremolques
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
            <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              {/* Presets Rápidos */}
              <div className="bg-[#0B1220] p-3.5 rounded-xl border border-[#1F2937]">
                <label className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-2 font-[family-name:var(--font-sora)]">
                  ⚡ Plantillas Pre-configuradas de Mantenimiento
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESETS_MANTENIMIENTO.map((p) => (
                    <button
                      key={p.titulo}
                      type="button"
                      onClick={() => handlePresetSelect(p)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                        descripcion === p.titulo
                          ? "bg-amber-500/20 border-amber-500 text-amber-300 font-semibold shadow-sm"
                          : "bg-[#0E1524] border-[#1F2937] text-slate-400 hover:text-slate-200 hover:border-slate-700"
                      }`}
                    >
                      {p.titulo.split(" (")[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selector de Tipo de Entidad y Equipo */}
              <FormFieldset
                title="1. Asignación de Unidad y Kilometraje"
                description="Selecciona si la OT aplica al tracto motriz o a la carreta de carga"
                icon={Truck}
              >
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Tipo de Flota *
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 bg-[#070C16] p-1 border border-[#1F2937] rounded-xl text-xs">
                      <button
                        type="button"
                        onClick={() => handleEntidadTipoChange("unidad")}
                        className={`py-2 px-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                          entidadTipo === "unidad"
                            ? "bg-amber-500 text-slate-950 font-bold shadow"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <Truck className="h-4 w-4" />
                        <span>Tracto / Rígido</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEntidadTipoChange("semirremolque")}
                        className={`py-2 px-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                          entidadTipo === "semirremolque"
                            ? "bg-amber-500 text-slate-950 font-bold shadow"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <Container className="h-4 w-4" />
                        <span>Semirremolque / Carreta</span>
                      </button>
                    </div>
                  </div>

                  {entidadTipo === "unidad" ? (
                    <FormSelect
                      label="Tracto Vehicular MTC"
                      required
                      icon={Truck}
                      value={entidadId}
                      onChange={(e) => handleSelectUnidad(e.target.value)}
                    >
                      <option value="">-- Seleccionar Tracto --</option>
                      {unidades.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.placa} ({u.marca} {u.modelo}) - {u.odometroActualKm.toLocaleString()} km [{u.estado}]
                        </option>
                      ))}
                    </FormSelect>
                  ) : (
                    <FormSelect
                      label="Semirremolque / Carreta MTC"
                      required
                      icon={Container}
                      value={entidadId}
                      onChange={(e) => setEntidadId(e.target.value)}
                    >
                      <option value="">-- Seleccionar Semirremolque --</option>
                      {semirremolques.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.placa} ({s.tipoCarroceria} - {s.marca || "Carreta"}) [{s.estado}]
                        </option>
                      ))}
                    </FormSelect>
                  )}
                </div>
              </FormFieldset>

              {/* Naturaleza, Odómetro y Fecha */}
              <FormFieldset
                title="2. Alcance & Programación"
                description="Clasificación de mantenimiento y fecha de ingreso al taller"
                icon={Calendar}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <FormSelect
                    label="Naturaleza *"
                    required
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as "preventivo" | "correctivo")}
                  >
                    <option value="preventivo">Preventivo Programado</option>
                    <option value="correctivo">Correctivo / Avería en Ruta</option>
                  </FormSelect>

                  <FormInput
                    label="Odómetro (Km)"
                    type="number"
                    icon={Activity}
                    suffix="Km"
                    disabled={entidadTipo === "semirremolque"}
                    value={odometroRegistro}
                    onChange={(e) => setOdometroRegistro(e.target.value)}
                  />

                  <FormInput
                    label="Fecha Programada"
                    type="date"
                    required
                    icon={Calendar}
                    value={fechaProgramada}
                    onChange={(e) => setFechaProgramada(e.target.value)}
                  />
                </div>

                <FormTextarea
                  label="Descripción Detallada de los Trabajos"
                  required
                  rows={2}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Detalle los repuestos a sustituir, fluidos y componentes inspeccionados..."
                />
              </FormFieldset>

              {/* Taller y Costos */}
              <FormFieldset
                title="3. Taller Asignado & Presupuesto"
                description="Estimación de costos de mano de obra y repuestos"
                icon={DollarSign}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <FormSelect
                    label="Tipo de Taller"
                    required
                    icon={Building}
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
                  >
                    <option value="propio">Taller Propio</option>
                    <option value="tercero">Taller Externo / Concesionario</option>
                  </FormSelect>

                  <div className="md:col-span-2">
                    <FormInput
                      label="Nombre del Taller / Sede"
                      required
                      placeholder="Ej: Scania Huachipa o Patio Callao"
                      value={nombreTaller}
                      onChange={(e) => setNombreTaller(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <FormInput
                    label="Mano de Obra"
                    type="number"
                    step="0.01"
                    suffix="PEN"
                    value={costoManoObra}
                    onChange={(e) => setCostoManoObra(e.target.value)}
                  />

                  <FormInput
                    label="Repuestos / Insumos"
                    type="number"
                    step="0.01"
                    suffix="PEN"
                    value={costoRepuestos}
                    onChange={(e) => setCostoRepuestos(e.target.value)}
                  />

                  <div className="space-y-1.5 text-xs w-full">
                    <label className="block text-slate-300 font-semibold tracking-wide">
                      Presupuesto Total
                    </label>
                    <div className="h-10 bg-[#0E1524] border border-amber-500/40 rounded-xl px-3.5 flex items-center justify-between text-amber-400 font-mono font-bold">
                      <span>S/ {totalCalculado}</span>
                      <DollarSign className="h-4 w-4 text-amber-500" />
                    </div>
                  </div>
                </div>
              </FormFieldset>

              {/* Estado Inicial de la OT */}
              <div className="p-4 rounded-xl border border-slate-800 bg-[#0B1220]/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-200 block font-[family-name:var(--font-sora)]">
                    Estado de Apertura de la OT
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {estado === "en_proceso"
                      ? "⚠️ La unidad pasará de inmediato al estado 'Mantenimiento' (No despachable en viajes)."
                      : "📅 La orden queda agendada para su ejecución en la fecha prevista."}
                  </span>
                </div>
                <div className="w-full md:w-56">
                  <FormSelect
                    value={estado}
                    onChange={(e) => setEstado(e.target.value as "pendiente" | "en_proceso")}
                  >
                    <option value="pendiente">Programado (Pendiente)</option>
                    <option value="en_proceso">En Taller Ahora (En Proceso)</option>
                  </FormSelect>
                </div>
              </div>

            </div>

            {/* Botones de acción */}
            <SheetFooter className="p-4 bg-[#0B1220] border-t border-[#1F2937] flex flex-row items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold flex items-center gap-2 transition-colors shadow-lg shadow-amber-500/10"
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
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}

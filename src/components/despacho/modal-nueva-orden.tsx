"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, ClipboardList, Loader2, AlertCircle, ShieldAlert, DollarSign } from "lucide-react";
import { crearOrdenServicioAction } from "@/lib/actions/ordenes-servicio";
import { toast } from "sonner";

interface ModalNuevaOrdenProps {
  clientes: Array<{ id: string; razonSocial: string; numeroDocumento: string }>;
  rutas: Array<{ id: string; codigoRuta: string; nombre: string; distanciaEstimadaKm: string }>;
  unidades: Array<{ id: string; placa: string; marca: string; modelo: string; estado: string }>;
  semirremolques: Array<{ id: string; placa: string; tipoCarroceria: string; estado: string }>;
  conductores: Array<{ id: string; nombres: string; apellidos: string; estado: string }>;
  onCreated?: () => void;
}

export function ModalNuevaOrden({
  clientes,
  rutas,
  unidades,
  semirremolques,
  conductores,
  onCreated,
}: ModalNuevaOrdenProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    clienteId: "",
    rutaId: "",
    unidadId: "",
    semirremolqueId: "",
    conductorId: "",
    conductorSecundarioId: "",
    tipoCarga: "general" as "general" | "perecible" | "matpel" | "granel" | "maquinaria" | "refrigerada",
    descripcionCarga: "",
    pesoBrutoKg: "28000.00",
    unidadMedida: "KGM" as "KGM" | "TNE",
    fechaHoraProgramada: new Date().toISOString().slice(0, 16),
    fletePactadoMoneda: "PEN" as "PEN" | "USD",
    fletePactadoMonto: "6500.00",
    adelantoViaticos: "1000.00",
    observaciones: "",
  });

  const detraccionCalculada = (
    (parseFloat(formData.fletePactadoMonto) || 0) * 0.04
  ).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clienteId || !formData.rutaId || !formData.unidadId || !formData.conductorId) {
      toast.error("Selecciona cliente, ruta, unidad y conductor.");
      return;
    }

    setLoading(true);
    const res = await crearOrdenServicioAction(formData);
    setLoading(false);

    if (res.success) {
      toast.success("¡Orden de servicio programada exitosamente!");
      setOpen(false);
      router.refresh();
      if (onCreated) onCreated();
    } else {
      toast.error(res.error || "No se pudo registrar la orden de servicio.");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="h-9 px-4 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
      >
        <Plus className="h-4 w-4" />
        <span>Nueva Orden de Servicio</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#111827] border border-[#1F2937] rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-[#0E1524] border-b border-[#1F2937] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-amber-400" />
                <div>
                  <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
                    Programar Nueva Orden de Servicio (Viaje)
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Validación regulatoria MTC automática previa a la asignación
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
              {/* Bloque 1: Cliente y Ruta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Cliente Dador de Carga *
                  </label>
                  <select
                    required
                    value={formData.clienteId}
                    onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">-- Seleccionar cliente --</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.razonSocial} (RUC {c.numeroDocumento})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Ruta Nacional de Transporte *
                  </label>
                  <select
                    required
                    value={formData.rutaId}
                    onChange={(e) => setFormData({ ...formData, rutaId: e.target.value })}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">-- Seleccionar ruta --</option>
                    {rutas.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.codigoRuta}: {r.nombre} ({r.distanciaEstimadaKm} km)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bloque 2: Asignación Vehicular y Chofer */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#0B1220] p-3 rounded-lg border border-[#1F2937]">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Tracto-Camión *
                  </label>
                  <select
                    required
                    value={formData.unidadId}
                    onChange={(e) => setFormData({ ...formData, unidadId: e.target.value })}
                    className="w-full h-9 bg-[#111827] border border-[#1F2937] rounded px-3 text-white font-mono font-bold focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">-- Tracto --</option>
                    {unidades.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.placa} ({u.marca} {u.modelo})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Semirremolque
                  </label>
                  <select
                    value={formData.semirremolqueId}
                    onChange={(e) =>
                      setFormData({ ...formData, semirremolqueId: e.target.value })
                    }
                    className="w-full h-9 bg-[#111827] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">-- Opcional (Rígido / Carreta) --</option>
                    {semirremolques.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.placa} ({s.tipoCarroceria})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Conductor Principal *
                  </label>
                  <select
                    required
                    value={formData.conductorId}
                    onChange={(e) => setFormData({ ...formData, conductorId: e.target.value })}
                    className="w-full h-9 bg-[#111827] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">-- Conductor --</option>
                    {conductores.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombres} {c.apellidos}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bloque 3: Carga */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Tipo de Carga *
                  </label>
                  <select
                    value={formData.tipoCarga}
                    onChange={(e) =>
                      setFormData({ ...formData, tipoCarga: e.target.value as any })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="general">Carga General</option>
                    <option value="maquinaria">Maquinaria Pesada</option>
                    <option value="granel">Granel / Minerales</option>
                    <option value="matpel">MATPEL (Mercancías Peligrosas)</option>
                    <option value="perecible">Perecibles</option>
                    <option value="refrigerada">Refrigerada</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-medium mb-1">
                    Descripción de la Carga *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Bolas de acero para molienda en big bags"
                    value={formData.descripcionCarga}
                    onChange={(e) =>
                      setFormData({ ...formData, descripcionCarga: e.target.value })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Peso Bruto (Kg) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.pesoBrutoKg}
                    onChange={(e) =>
                      setFormData({ ...formData, pesoBrutoKg: e.target.value })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Fecha/Hora Programada *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.fechaHoraProgramada}
                    onChange={(e) =>
                      setFormData({ ...formData, fechaHoraProgramada: e.target.value })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Adelanto de Viáticos (S/)
                  </label>
                  <input
                    type="text"
                    value={formData.adelantoViaticos}
                    onChange={(e) =>
                      setFormData({ ...formData, adelantoViaticos: e.target.value })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Bloque 4: Flete & Detracción Legal SUNAT */}
              <div className="p-3 bg-[#0B1220] rounded-lg border border-[#1F2937] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Flete Pactado (S/):</span>
                  <input
                    type="text"
                    required
                    value={formData.fletePactadoMonto}
                    onChange={(e) =>
                      setFormData({ ...formData, fletePactadoMonto: e.target.value })
                    }
                    className="w-32 h-8 bg-[#111827] border border-[#1F2937] rounded px-2 text-white font-mono font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 text-amber-400 font-medium">
                  <span>Detracción SUNAT (4%):</span>
                  <span className="font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    S/ {detraccionCalculada}
                  </span>
                </div>
              </div>

              {/* Regulatory Alert Warning Box */}
              <div className="p-2.5 rounded bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  El sistema verificará en milisegundos que el tracto cuente con SOAT y
                  Revisión Técnica vigentes y que el chofer posea Licencia A-III válida
                  antes de emitir la orden.
                </span>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-[#1F2937] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-9 px-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="h-9 px-5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Programar Viaje</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

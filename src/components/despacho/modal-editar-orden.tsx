"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, X, Truck, Loader2, DollarSign, Scale } from "lucide-react";
import { actualizarOrdenServicioAction } from "@/lib/actions/ordenes-servicio";
import { toast } from "sonner";

export interface OrdenParaEdicion {
  id: string;
  codigoViaje: string;
  clienteId: string;
  rutaId: string;
  unidadId: string;
  semirremolqueId?: string | null;
  conductorId: string;
  conductorSecundarioId?: string | null;
  tipoCarga: "general" | "perecible" | "matpel" | "granel" | "maquinaria" | "refrigerada";
  descripcionCarga: string;
  pesoBrutoKg: string | number;
  unidadMedida: "KGM" | "TNE";
  fechaHoraProgramada?: Date | string | null;
  fletePactadoMoneda: "PEN" | "USD";
  fletePactadoMonto: string | number;
  adelantoViaticos?: string | number | null;
  observaciones?: string | null;
}

interface ModalEditarOrdenProps {
  orden: OrdenParaEdicion;
  clientes: Array<{ id: string; razonSocial: string; numeroDocumento: string }>;
  rutas: Array<{ id: string; nombre: string; codigoRuta: string }>;
  unidades: Array<{ id: string; placa: string; marca: string; modelo: string }>;
  semirremolques: Array<{ id: string; placa: string; tipoCarroceria: string }>;
  conductores: Array<{ id: string; nombres: string; apellidos: string }>;
  onUpdated?: () => void;
}

export function ModalEditarOrden({
  orden,
  clientes,
  rutas,
  unidades,
  semirremolques,
  conductores,
  onUpdated,
}: ModalEditarOrdenProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatFechaHora = (d: Date | string | null | undefined) => {
    if (!d) return new Date().toISOString().slice(0, 16);
    const dateObj = new Date(d);
    return isNaN(dateObj.getTime())
      ? new Date().toISOString().slice(0, 16)
      : dateObj.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    id: orden.id,
    clienteId: orden.clienteId,
    rutaId: orden.rutaId,
    unidadId: orden.unidadId,
    semirremolqueId: orden.semirremolqueId || "",
    conductorId: orden.conductorId,
    conductorSecundarioId: orden.conductorSecundarioId || "",
    tipoCarga: orden.tipoCarga || "general",
    descripcionCarga: orden.descripcionCarga || "",
    pesoBrutoKg: String(orden.pesoBrutoKg || "28000"),
    unidadMedida: orden.unidadMedida || "KGM",
    fechaHoraProgramada: formatFechaHora(orden.fechaHoraProgramada),
    fletePactadoMoneda: orden.fletePactadoMoneda || "PEN",
    fletePactadoMonto: String(orden.fletePactadoMonto || "0"),
    adelantoViaticos: String(orden.adelantoViaticos || "0"),
    observaciones: orden.observaciones || "",
  });

  const handleSubmit = async () => {
    if (!formData.clienteId || !formData.rutaId || !formData.unidadId || !formData.conductorId) {
      toast.error("Por favor completa los campos obligatorios (*).");
      return;
    }

    setLoading(true);
    const res = await actualizarOrdenServicioAction({
      id: formData.id,
      clienteId: formData.clienteId,
      rutaId: formData.rutaId,
      unidadId: formData.unidadId,
      semirremolqueId: formData.semirremolqueId || undefined,
      conductorId: formData.conductorId,
      conductorSecundarioId: formData.conductorSecundarioId || undefined,
      tipoCarga: formData.tipoCarga as any,
      descripcionCarga: formData.descripcionCarga,
      pesoBrutoKg: formData.pesoBrutoKg,
      unidadMedida: formData.unidadMedida as any,
      fechaHoraProgramada: formData.fechaHoraProgramada,
      fletePactadoMoneda: formData.fletePactadoMoneda as any,
      fletePactadoMonto: formData.fletePactadoMonto,
      adelantoViaticos: formData.adelantoViaticos,
      observaciones: formData.observaciones,
    });
    setLoading(false);

    if (res.success) {
      toast.success(`Orden ${orden.codigoViaje} actualizada exitosamente.`);
      setOpen(false);
      router.refresh();
      if (onUpdated) onUpdated();
    } else {
      toast.error(res.error || "No se pudo actualizar la orden de servicio.");
    }
  };

  const detraccionCalculada = (parseFloat(formData.fletePactadoMonto || "0") * 0.04).toFixed(2);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Editar Orden de Servicio"
        className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 border border-slate-700 transition-colors"
      >
        <Edit2 className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-2xl bg-[#111827] border border-[#1F2937] rounded-xl shadow-2xl overflow-hidden text-left"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          >
            {/* Header */}
            <div className="p-4 bg-[#0E1524] border-b border-[#1F2937] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-amber-400" />
                <div>
                  <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
                    Editar Despacho ({orden.codigoViaje})
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Modificación de asignación vehicular, flete pactado y pesos
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              {/* Cliente y Ruta */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Cliente Dador de Carga *</label>
                  <select
                    value={formData.clienteId}
                    onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                  >
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.razonSocial} (RUC {c.numeroDocumento})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Ruta Maestra Asignada *</label>
                  <select
                    value={formData.rutaId}
                    onChange={(e) => setFormData({ ...formData, rutaId: e.target.value })}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                  >
                    {rutas.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.codigoRuta} - {r.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Asignación T3S3 */}
              <div className="p-3 bg-[#0B1220] border border-[#1F2937] rounded-lg space-y-3">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                  Configuración Vehicular & Tripulación MTC
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">Tracto (Placa) *</label>
                    <select
                      value={formData.unidadId}
                      onChange={(e) => setFormData({ ...formData, unidadId: e.target.value })}
                      className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                    >
                      {unidades.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.placa} ({u.marca})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">Semirremolque</label>
                    <select
                      value={formData.semirremolqueId}
                      onChange={(e) => setFormData({ ...formData, semirremolqueId: e.target.value })}
                      className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                    >
                      <option value="">(Ninguno / Camión Simple)</option>
                      {semirremolques.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.placa} ({s.tipoCarroceria})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">Conductor Principal *</label>
                    <select
                      value={formData.conductorId}
                      onChange={(e) => setFormData({ ...formData, conductorId: e.target.value })}
                      className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2 text-white focus:border-amber-500 focus:outline-none"
                    >
                      {conductores.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.apellidos}, {c.nombres}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Carga y Pesos */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Tipo de Carga *</label>
                  <select
                    value={formData.tipoCarga}
                    onChange={(e) => setFormData({ ...formData, tipoCarga: e.target.value as any })}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="general">Carga General</option>
                    <option value="granel">Mineral / Granel</option>
                    <option value="matpel">Materiales Peligrosos (MATPEL)</option>
                    <option value="perecible">Perecible / Agro</option>
                    <option value="refrigerada">Refrigerada</option>
                    <option value="maquinaria">Maquinaria Pesada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Peso Bruto (Kg) *</label>
                  <input
                    type="number"
                    value={formData.pesoBrutoKg}
                    onChange={(e) => setFormData({ ...formData, pesoBrutoKg: e.target.value })}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Fecha Programada *</label>
                  <input
                    type="datetime-local"
                    value={formData.fechaHoraProgramada}
                    onChange={(e) => setFormData({ ...formData, fechaHoraProgramada: e.target.value })}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Descripción de la Mercancía *</label>
                <input
                  type="text"
                  required
                  value={formData.descripcionCarga}
                  onChange={(e) => setFormData({ ...formData, descripcionCarga: e.target.value })}
                  className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Flete & SPOT */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Flete Pactado (S/)*</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.fletePactadoMonto}
                    onChange={(e) => setFormData({ ...formData, fletePactadoMonto: e.target.value })}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono font-bold text-amber-300 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Detracción SPOT 4% (S/)</label>
                  <div className="h-9 bg-[#0B1220] border border-amber-500/30 rounded px-3 flex items-center font-mono font-bold text-amber-400">
                    S/ {detraccionCalculada}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Anticipo de Viáticos (S/)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.adelantoViaticos}
                    onChange={(e) => setFormData({ ...formData, adelantoViaticos: e.target.value })}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#1F2937] bg-[#0E1524] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-9 px-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="h-9 px-5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

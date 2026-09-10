"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Wrench,
  X,
  Loader2,
  CheckCircle2,
  Clock,
  Ban,
  Calendar,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { cambiarEstadoMantenimientoAction } from "@/lib/actions/mantenimiento";
import { toast } from "sonner";

interface MantenimientoItem {
  id: string;
  placa: string;
  entidadTipo: string;
  tipo: string;
  descripcion: string;
  taller: string;
  nombreTaller: string | null;
  fechaProgramada: string;
  costoTotal: string;
  estado: "pendiente" | "en_proceso" | "completado" | "cancelado";
}

interface ModalCambiarEstadoMantenimientoProps {
  mantenimiento: MantenimientoItem;
  trigger?: React.ReactNode;
  onUpdated?: () => void;
}

export function ModalCambiarEstadoMantenimiento({
  mantenimiento,
  trigger,
  onUpdated,
}: ModalCambiarEstadoMantenimientoProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const [estado, setEstado] = useState<"pendiente" | "en_proceso" | "completado" | "cancelado">(
    mantenimiento.estado
  );
  const [fechaEjecucion, setFechaEjecucion] = useState(todayStr);
  const [costoFinal, setCostoFinal] = useState(mantenimiento.costoTotal || "0");
  const [observaciones, setObservaciones] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await cambiarEstadoMantenimientoAction({
        id: mantenimiento.id,
        estado,
        fechaEjecucion: estado === "completado" ? fechaEjecucion : undefined,
        costoFinal: parseFloat(costoFinal) || undefined,
        observaciones,
      });

      if (res.success) {
        toast.success(res.message);
        if (estado === "completado") {
          toast.success("La unidad ha sido liberada y está DISPONIBLE para nuevos despachos.");
        } else if (estado === "en_proceso") {
          toast.warning("La unidad se encuentra EN TALLER y está bloqueada para despachos.");
        }
        setOpen(false);
        router.refresh();
        onUpdated?.();
      } else {
        toast.error(res.error || "No se pudo actualizar el estado.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al actualizar la orden de trabajo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)} className="cursor-pointer">
          {trigger}
        </span>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
        >
          Gestionar OT
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#111827] border border-[#1F2937] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl my-8">
            <div className="p-5 border-b border-[#1F2937] flex items-center justify-between bg-[#0B1220]/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-[family-name:var(--font-sora)]">
                    Actualizar Orden de Trabajo
                  </h3>
                  <p className="text-xs text-slate-400">
                    Unidad: <strong className="text-amber-400 font-mono">{mantenimiento.placa}</strong> • {mantenimiento.tipo.toUpperCase()}
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

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-xs text-slate-300">
                <p className="font-semibold text-white mb-1">{mantenimiento.descripcion}</p>
                <p className="text-slate-400">
                  Taller: <span className="text-slate-200">{mantenimiento.nombreTaller || "Taller propio"}</span> |
                  Programado: <span className="text-slate-200">{mantenimiento.fechaProgramada}</span>
                </p>
              </div>

              {/* Selector de Nuevo Estado */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Cambiar Estado de la Intervención *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEstado("pendiente")}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all ${
                      estado === "pendiente"
                        ? "bg-sky-500/20 border-sky-500 text-sky-300"
                        : "bg-[#0B1220] border-[#1F2937] text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Clock className="h-4 w-4" />
                    <span>Programado</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEstado("en_proceso")}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all ${
                      estado === "en_proceso"
                        ? "bg-amber-500/20 border-amber-500 text-amber-300 font-semibold"
                        : "bg-[#0B1220] border-[#1F2937] text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Wrench className="h-4 w-4" />
                    <span>En Taller (Bloquear)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEstado("completado")}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all ${
                      estado === "completado"
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold"
                        : "bg-[#0B1220] border-[#1F2937] text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Completado (Liberar)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEstado("cancelado")}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all ${
                      estado === "cancelado"
                        ? "bg-rose-500/20 border-rose-500 text-rose-300"
                        : "bg-[#0B1220] border-[#1F2937] text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Ban className="h-4 w-4" />
                    <span>Cancelar Orden</span>
                  </button>
                </div>
              </div>

              {/* Si es completado, pedir fecha de finalización y costo final */}
              {estado === "completado" && (
                <div className="space-y-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Cierre Técnico de la Orden de Trabajo</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Fecha de Ejecución / Salida *
                      </label>
                      <input
                        type="date"
                        value={fechaEjecucion}
                        onChange={(e) => setFechaEjecucion(e.target.value)}
                        className="w-full bg-[#0B1220] border border-emerald-500/30 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Costo Liquidado Total (S/)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={costoFinal}
                        onChange={(e) => setCostoFinal(e.target.value)}
                        className="w-full bg-[#0B1220] border border-emerald-500/30 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Observaciones de Cierre / Trabajo */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Informe de Trabajo Mecánico / Observaciones
                </label>
                <textarea
                  rows={3}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Detalle los repuestos reemplazados, pruebas en ruta y visto bueno del jefe de taller..."
                  className="w-full bg-[#0B1220] border border-[#1F2937] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Footer Buttons */}
              <div className="pt-3 border-t border-[#1F2937] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold flex items-center gap-2 transition-colors shadow-lg shadow-amber-500/10"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Actualizando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Guardar Cambios</span>
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

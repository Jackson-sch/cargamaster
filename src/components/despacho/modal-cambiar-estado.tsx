"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, X, Loader2, Navigation, CheckCircle2 } from "lucide-react";
import { FormSelect, FormInput } from "@/components/ui/form-controls";
import { cambiarEstadoViajeAction } from "@/lib/actions/ordenes-servicio";
import { toast } from "sonner";

interface ModalCambiarEstadoProps {
  ordenId: string;
  codigoViaje: string;
  estadoActual: string;
  onUpdated?: () => void;
}

export function ModalCambiarEstado({
  ordenId,
  codigoViaje,
  estadoActual,
  onUpdated,
}: ModalCambiarEstadoProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [nuevoEstado, setNuevoEstado] = useState(estadoActual);
  const [odometro, setOdometro] = useState("");
  const [observacion, setObservacion] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await cambiarEstadoViajeAction({
      ordenServicioId: ordenId,
      nuevoEstado: nuevoEstado as any,
      odometro: odometro ? parseInt(odometro) : undefined,
      observacion,
    });
    setLoading(false);

    if (res.success) {
      toast.success(`Viaje ${codigoViaje} actualizado a "${nuevoEstado.toUpperCase()}".`);
      setOpen(false);
      router.refresh();
      if (onUpdated) onUpdated();
    } else {
      toast.error(res.error || "No se pudo actualizar el estado.");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-2.5 py-1 rounded bg-[#0B1220] border border-[#1F2937] hover:border-amber-500 text-slate-300 hover:text-amber-400 text-xs font-medium flex items-center gap-1 transition-colors"
      >
        <RefreshCw className="h-3 w-3" />
        {/* <span>Actualizar Estado</span> */}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#111827] border border-[#1F2937] rounded-xl shadow-2xl overflow-hidden text-left">
            {/* Header */}
            <div className="p-4 bg-[#0E1524] border-b border-[#1F2937] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-amber-400" />
                <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
                  Ciclo de Estados: {codigoViaje}
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-4 text-xs">
                <FormSelect
                  label="Nuevo Estado Operativo"
                  required
                  icon={Navigation}
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value)}
                  className="font-bold text-amber-300"
                >
                  <option value="programado">1. Programado (En espera de carga)</option>
                  <option value="cargando">2. Cargando en almacén/puerto</option>
                  <option value="en_ruta">3. En Ruta (Inicia trayecto en carretera)</option>
                  <option value="en_destino">4. En Destino (Garita del cliente)</option>
                  <option value="descargado">5. Descargado</option>
                  <option value="entregado">6. Entregado (Conformidad receptor)</option>
                  <option value="cancelado">Cancelado</option>
                </FormSelect>

                <FormInput
                  label="Lectura de Odómetro en Hito"
                  type="number"
                  suffix="Km"
                  placeholder="Ej. 84520"
                  value={odometro}
                  onChange={(e) => setOdometro(e.target.value)}
                  helperText="Opcional: registra el odómetro exacto al iniciar o finalizar ruta"
                />

                <div className="space-y-1.5">
                  <label className="block text-slate-300 font-semibold tracking-wide">
                    Observaciones / Incidencia de Hito
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ej. Precinto de seguridad colocado, sin novedades en carretera..."
                    value={observacion}
                    onChange={(e) => setObservacion(e.target.value)}
                    className="w-full bg-[#0E1524] border border-[#1F2937] hover:border-slate-600 focus:border-amber-500 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all leading-relaxed"
                  />
                </div>
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
                  <span>Actualizar Hito</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

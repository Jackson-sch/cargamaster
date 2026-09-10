"use client";

import { useState } from "react";
import { ShieldAlert, X, Loader2, AlertTriangle, Send } from "lucide-react";
import { reportarIncidenciaEmergenciaAction } from "@/lib/actions/alertas";
import { toast } from "sonner";

export function ModalReportarIncidencia() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [categoria, setCategoria] = useState<
    "parada_no_autorizada" | "desvio_geocerca" | "exceso_velocidad_sutran" | "mantenimiento_preventivo"
  >("parada_no_autorizada");
  const [severidad, setSeveridad] = useState<"warning" | "critical">("warning");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !mensaje.trim()) {
      toast.error("Por favor completa el título y detalle de la incidencia.");
      return;
    }

    setLoading(true);
    try {
      const res = await reportarIncidenciaEmergenciaAction({
        titulo,
        mensaje,
        categoria,
        severidad,
      });

      if (res.success) {
        toast.success("Incidencia reportada a torre de control.");
        setOpen(false);
        setTitulo("");
        setMensaje("");
      } else {
        toast.error(res.error || "No se pudo reportar la incidencia.");
      }
    } catch {
      toast.error("Error al registrar incidencia.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold transition-colors"
        title="Reportar Incidencia Operativa o Emergencia en Carretera"
      >
        <ShieldAlert className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Reportar Incidencia</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[#111827] border border-rose-500/40 rounded-2xl shadow-2xl overflow-hidden text-left flex flex-col">
            {/* Header */}
            <div className="p-4 bg-[#0B1220] border-b border-[#1F2937] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
                    Reportar Incidencia Operativa / SOS
                  </h3>
                  <p className="text-xs text-slate-400">
                    Notificación inmediata al Centro de Control y Monitoreo
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Severidad de la Emergencia *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSeveridad("warning")}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      severidad === "warning"
                        ? "bg-amber-500/15 border-amber-500 text-amber-300 font-bold"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span className="block text-xs">Advertencia / Retraso</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      Tráfico, desvío o control rutinario
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSeveridad("critical")}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      severidad === "critical"
                        ? "bg-rose-500/15 border-rose-500 text-rose-300 font-bold"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span className="block text-xs">Crítica / Emergencia</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      Falla mecánica, siniestro, robo
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Categoría de Incidencia *
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value as any)}
                  className="w-full bg-[#0B1220] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="parada_no_autorizada">Parada no autorizada en ruta</option>
                  <option value="desvio_geocerca">Desvío de ruta / Geocerca no programada</option>
                  <option value="exceso_velocidad_sutran">Fiscalización SUTRAN / Balanza de pesaje</option>
                  <option value="mantenimiento_preventivo">Avería mecánica en carretera</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Título Breve de la Incidencia *
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: Retención en garita SUTRAN de Nazca por verificación de pesos"
                  className="w-full bg-[#0B1220] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Detalle Operativo / Acciones en Curso *
                </label>
                <textarea
                  rows={3}
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  placeholder="Describe la ubicación exacta (km de la vía), placa de la unidad afectada y requerimiento de asistencia..."
                  className="w-full bg-[#0B1220] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="pt-3 border-t border-[#1F2937] flex items-center justify-end gap-2.5">
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
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/20 transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Reportando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Emitir Alerta Operativa</span>
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

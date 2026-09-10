"use client";

import { useState, useEffect } from "react";
import { Bell, ShieldAlert, CheckCircle2, AlertTriangle, X, ExternalLink } from "lucide-react";
import { obtenerAlertasSistemaAction, resolverAlertaSistemaAction } from "@/lib/actions/alertas";
import { toast } from "sonner";
import Link from "next/link";

export function PanelNotificacionesNavbar() {
  const [open, setOpen] = useState(false);
  const [alertas, setAlertas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAlertas = async () => {
    try {
      const res = await obtenerAlertasSistemaAction();
      if (res.success && res.alertas) {
        setAlertas(res.alertas);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAlertas();
    const interval = setInterval(fetchAlertas, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleResolver = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await resolverAlertaSistemaAction(id);
      if (res.success) {
        toast.success(res.message);
        setAlertas((prev) => prev.filter((a) => a.id !== id));
      }
    } catch {
      toast.error("Error al actualizar la alerta.");
    }
  };

  const criticasCount = alertas.filter((a) => a.severidad === "critical").length;

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) fetchAlertas();
        }}
        title="Centro de Alertas SUTRAN y Vencimientos"
        className="relative h-9 w-9 rounded-lg bg-[#111827] border border-[#1F2937] hover:border-amber-500/50 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
      >
        <Bell className="h-4 w-4" />
        {alertas.length > 0 && (
          <span
            className={`absolute top-1 right-1 h-2.5 w-2.5 rounded-full ring-2 ring-[#0E1524] ${
              criticasCount > 0 ? "bg-rose-500 animate-pulse" : "bg-amber-500"
            }`}
          />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#111827] border border-[#1F2937] rounded-xl shadow-2xl z-50 overflow-hidden text-left flex flex-col animate-in fade-in duration-150">
            {/* Header */}
            <div className="p-3 bg-[#0B1220] border-b border-[#1F2937] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-bold text-white font-[family-name:var(--font-sora)]">
                  Notificaciones & Alertas SUTRAN
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
                {alertas.length} activa{alertas.length === 1 ? "" : "s"}
              </span>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-[#1F2937]">
              {alertas.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs">
                  <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-emerald-400 opacity-60" />
                  No hay incidentes ni alertas regulatorias pendientes.
                </div>
              ) : (
                alertas.map((a) => (
                  <div
                    key={a.id}
                    className="p-3 hover:bg-slate-800/40 transition-colors flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`h-2 w-2 rounded-full shrink-0 ${
                            a.severidad === "critical" ? "bg-rose-500" : "bg-amber-400"
                          }`}
                        />
                        <h4 className="font-bold text-white text-[11px] truncate">
                          {a.titulo}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
                        {a.mensaje}
                      </p>
                      <span className="text-[10px] text-slate-500 font-mono block">
                        {new Date(a.createdAt).toLocaleTimeString("es-PE", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })} · {a.categoria.replace(/_/g, " ")}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleResolver(a.id, e)}
                      className="p-1 rounded text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors shrink-0"
                      title="Marcar como atendida"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-2.5 bg-[#0B1220] border-t border-[#1F2937] flex items-center justify-between text-xs">
              <Link
                href="/documentos"
                onClick={() => setOpen(false)}
                className="text-amber-400 hover:text-amber-300 text-[11px] font-semibold inline-flex items-center gap-1"
              >
                Auditoría Vencimientos MTC <ExternalLink className="h-3 w-3" />
              </Link>
              <Link
                href="/tracking"
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white text-[11px]"
              >
                Telemetría GPS
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

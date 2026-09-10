"use client";

import { Radio } from "lucide-react";
import { useState, useEffect } from "react";
import { SelectorSedeNavbar } from "@/components/navbar/selector-sede";
import { BuscadorGlobalNavbar } from "@/components/navbar/buscador-global";
import { PanelNotificacionesNavbar } from "@/components/navbar/panel-notificaciones";
import { ModalReportarIncidencia } from "@/components/navbar/modal-reportar-incidencia";

export function AppHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("es-PE", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 shrink-0 bg-[#0E1524] border-b border-[#1F2937] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Title / Section */}
      <div className="min-w-0 pr-2">
        <h1 className="text-sm sm:text-base font-bold text-white tracking-tight font-[family-name:var(--font-sora)] truncate">
          {title || "Centro de Control Logístico"}
        </h1>
        {subtitle && (
          <p className="text-[11px] sm:text-xs text-slate-400 font-medium truncate hidden sm:block">
            {subtitle}
          </p>
        )}
      </div>

      {/* Center / Global Search & Live Radio */}
      <div className="hidden md:flex items-center gap-3">
        <BuscadorGlobalNavbar />

        {/* Live GPS Feed pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium shrink-0">
          <Radio className="h-3 w-3 animate-pulse text-emerald-400" />
          <span className="text-[11px] font-semibold tracking-wide uppercase">SUTRAN GPS</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Peruvian Official Clock */}
        <div className="hidden xl:flex flex-col text-right font-mono text-xs text-slate-400">
          <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold">Hora Oficial (PET)</span>
          <span className="font-bold text-slate-200" suppressHydrationWarning>{time || "00:00:00"}</span>
        </div>

        <div className="h-6 w-[1px] bg-[#1F2937] hidden xl:block" />

        {/* Sede selector funcional */}
        <SelectorSedeNavbar />

        {/* Alertas y Notificaciones en Vivo */}
        <PanelNotificacionesNavbar />

        {/* SOS / Reportar Incidencia Operativa */}
        <ModalReportarIncidencia />
      </div>
    </header>
  );
}

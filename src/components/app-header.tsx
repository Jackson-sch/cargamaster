"use client";

import { Bell, ShieldAlert, Search, Building, RefreshCw, Radio } from "lucide-react";
import { useState, useEffect } from "react";

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
    <header className="h-16 shrink-0 bg-[#0E1524] border-b border-[#1F2937] px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Title / Section */}
      <div>
        <h1 className="text-base font-bold text-white tracking-tight font-[family-name:var(--font-sora)]">
          {title || "Centro de Control Logístico"}
        </h1>
        {subtitle && (
          <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
        )}
      </div>

      {/* Center / Search & Live Radio */}
      <div className="hidden md:flex items-center gap-3">
        <div className="relative">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar placa, chofer, guía o viaje (OS)..."
            className="w-80 h-9 bg-[#111827] border border-[#1F2937] rounded-md pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Live GPS Feed pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <Radio className="h-3 w-3 animate-pulse text-emerald-400" />
          <span className="text-[11px] font-semibold tracking-wide uppercase">GPS Activo</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Peruvian Official Clock */}
        <div className="hidden sm:flex flex-col text-right font-mono text-xs text-slate-400">
          <span className="text-[11px] text-slate-500 uppercase font-sans font-semibold">Hora Perú (PET)</span>
          <span className="font-bold text-slate-200" suppressHydrationWarning>{time || "00:00:00"}</span>
        </div>

        <div className="h-6 w-[1px] bg-[#1F2937] hidden sm:block" />

        {/* Sede selector */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#111827] border border-[#1F2937] text-xs text-slate-300">
          <Building className="h-3.5 w-3.5 text-amber-400" />
          <span className="font-medium">Callao (Principal)</span>
        </div>

        {/* Alertas Bell */}
        <button
          title="Ver alertas de vencimiento"
          className="relative h-9 w-9 rounded-md bg-[#111827] border border-[#1F2937] flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-[#0E1524]" />
        </button>

        {/* SOS / Incidencia Button */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold transition-colors">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Reportar Incidencia</span>
        </button>
      </div>
    </header>
  );
}

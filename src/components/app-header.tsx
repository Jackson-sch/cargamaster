"use client";

import { Radio, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { SelectorSedeNavbar } from "@/components/navbar/selector-sede";
import { BuscadorGlobalNavbar } from "@/components/navbar/buscador-global";
import { PanelNotificacionesNavbar } from "@/components/navbar/panel-notificaciones";
import { ModalReportarIncidencia } from "@/components/navbar/modal-reportar-incidencia";
import { UserMenu } from "@/components/auth/user-menu";

const RUTA_NOMBRES: Record<string, string> = {
  "/": "Centro de Control",
  "/despacho": "Despacho de Viajes",
  "/tracking": "Monitoreo GPS",
  "/flota": "Flota de Carga",
  "/conductores": "Conductores MTC",
  "/documentos": "Vencimientos & CITV",
  "/combustible": "Control Combustible",
  "/mantenimiento": "Taller Mecánico",
  "/liquidaciones": "Liquidaciones",
  "/rutas": "Rutas & Peajes",
  "/clientes": "Directorio Clientes",
  "/facturacion": "Facturación UBL 2.1",
  "/configuracion": "Configuración",
};

export function AppHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
  const pathname = usePathname();
  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("es-PE", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );

      // Formatear fecha: ej. "Jue, 10 Set 2026"
      const rawDate = now.toLocaleDateString("es-PE", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const cleanDate = rawDate
        .replace(/\./g, "")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      setDate(cleanDate);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const moduloActual = RUTA_NOMBRES[pathname] || title || "Operaciones";

  return (
    <header className="h-16 shrink-0 bg-[#0E1524] border-b border-[#1F2937] px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Ubicación / Breadcrumb compacto */}
      <div className="flex items-center gap-2 text-xs shrink-0 min-w-0">
        <span className="hidden sm:inline text-slate-500 font-medium">Módulo</span>
        <ChevronRight className="h-3 w-3 text-slate-600 hidden sm:inline shrink-0" />
        <span className="font-semibold text-slate-200 font-[family-name:var(--font-sora)] tracking-tight truncate max-w-[140px] sm:max-w-[190px]">
          {moduloActual}
        </span>
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
        {/* Fecha y Hora Oficial Perú */}
        <div className="hidden xl:flex flex-col text-right font-mono text-xs text-slate-400 shrink-0">
          <span
            className="text-[10px] text-amber-400/90 font-sans font-semibold tracking-tight"
            suppressHydrationWarning
          >
            {date || "Fecha Oficial"}
          </span>
          <span
            className="font-bold text-slate-100 tracking-wider"
            suppressHydrationWarning
          >
            {time || "00:00:00"}
          </span>
        </div>

        <div className="h-6 w-[1px] bg-[#1F2937] hidden xl:block shrink-0" />

        {/* Sede selector funcional */}
        <SelectorSedeNavbar />

        {/* Alertas y Notificaciones en Vivo */}
        <PanelNotificacionesNavbar />

        {/* SOS / Reportar Incidencia Operativa */}
        <ModalReportarIncidencia />

        <div className="h-6 w-[1px] bg-[#1F2937] hidden sm:block shrink-0" />

        {/* Perfil de Usuario & Cerrar Sesión */}
        <UserMenu variant="header" />
      </div>
    </header>
  );
}

import Link from "next/link";
import {
  Truck,
  Layers,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";

interface KpiCardsProps {
  totalUnidades: number;
  enRuta: number;
  disponibles: number;
  enTaller: number;
  porcentajeOperativo: number;
  totalToneladasEnTransito: number;
  totalViajesActivos: number;
  montoFletesDisplay: number;
  detraccionCalculada: number;
  alertasVencimiento: number;
  alertasCriticas: number;
}

export function KpiCards({
  totalUnidades,
  enRuta,
  disponibles,
  enTaller,
  porcentajeOperativo,
  totalToneladasEnTransito,
  totalViajesActivos,
  montoFletesDisplay,
  detraccionCalculada,
  alertasVencimiento,
  alertasCriticas,
}: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Flota Operativa */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4 shadow-sm relative overflow-hidden group hover:border-amber-500/50 transition-all">
        <div className="absolute top-0 right-0 h-16 w-16 bg-amber-500/5 rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Flota Operativa
          </span>
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Truck className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white font-[family-name:var(--font-sora)]">
            {enRuta + disponibles} / {totalUnidades}
          </span>
          <span
            className={`text-xs font-semibold ${
              porcentajeOperativo >= 80 ? "text-emerald-400" : "text-amber-400"
            }`}
          >
            {porcentajeOperativo}% activa
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-[#1F2937]/80 pt-2.5">
          <span>
            {enRuta} en ruta · {disponibles} libres
            {enTaller > 0 && ` · ${enTaller} taller`}
          </span>
          <Link
            href="/flota"
            className="text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-0.5"
          >
            Ver flota <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Card 2: Carga en Tránsito */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4 shadow-sm relative overflow-hidden group hover:border-emerald-500/50 transition-all">
        <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Carga en Tránsito
          </span>
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Layers className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white font-[family-name:var(--font-sora)]">
            {totalToneladasEnTransito > 0
              ? totalToneladasEnTransito.toFixed(1)
              : "0.0"}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            Toneladas Netas
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-[#1F2937]/80 pt-2.5">
          <span>{totalViajesActivos} viaje(s) en curso</span>
          <Link
            href="/despacho"
            className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-0.5"
          >
            Despachos <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Card 3: Fletes Operativos */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4 shadow-sm relative overflow-hidden group hover:border-sky-500/50 transition-all">
        <div className="absolute top-0 right-0 h-16 w-16 bg-sky-500/5 rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Fletes Operativos
          </span>
          <div className="h-8 w-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white font-[family-name:var(--font-sora)]">
            S/ {montoFletesDisplay.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
          </span>
          <span className="text-xs font-semibold text-emerald-400 inline-flex items-center">
            +SPOT 4% <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-[#1F2937]/80 pt-2.5">
          <span>
            Detracción 4%: S/ {detraccionCalculada.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
          </span>
          <Link
            href="/facturacion"
            className="text-sky-400 hover:text-sky-300 font-medium inline-flex items-center gap-0.5"
          >
            GRE & Facturas <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Card 4: Semáforo Normativo MTC */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4 shadow-sm relative overflow-hidden group hover:border-amber-500/50 transition-all">
        <div className="absolute top-0 right-0 h-16 w-16 bg-amber-500/5 rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Vencimientos Próximos
          </span>
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertTriangle className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className={`text-2xl font-bold font-[family-name:var(--font-sora)] ${
              alertasCriticas > 0 ? "text-rose-400" : "text-amber-400"
            }`}
          >
            {alertasVencimiento}
          </span>
          <span className="text-xs text-amber-300 font-medium">
            alertas activas
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-[#1F2937]/80 pt-2.5">
          <span>
            {alertasCriticas > 0
              ? `${alertasCriticas} vencido(s) crítico(s)`
              : "SOAT & Rev. Técnicas"}
          </span>
          <Link
            href="/documentos"
            className="text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-0.5"
          >
            Auditar <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

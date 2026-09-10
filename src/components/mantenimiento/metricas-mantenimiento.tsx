import { Wrench, Clock, DollarSign, Truck } from "lucide-react";

interface MetricasMantenimientoProps {
  otsEnProceso: number;
  otsProgramadas: number;
  costoTotalInvertido: number;
  preventivosCount: number;
  correctivosCount: number;
}

export function MetricasMantenimiento({
  otsEnProceso,
  otsProgramadas,
  costoTotalInvertido,
  preventivosCount,
  correctivosCount,
}: MetricasMantenimientoProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase">
            En Taller / En Proceso
          </span>
          <Wrench className="h-4 w-4 text-amber-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-amber-400 font-[family-name:var(--font-sora)]">
            {otsEnProceso}
          </span>
          <span className="text-xs text-slate-400">unidades retenidas</span>
        </div>
      </div>

      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase">
            Programados Pendientes
          </span>
          <Clock className="h-4 w-4 text-sky-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white font-[family-name:var(--font-sora)]">
            {otsProgramadas}
          </span>
          <span className="text-xs text-slate-400">OTs en cola</span>
        </div>
      </div>

      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase">
            Gasto Acumulado Flota
          </span>
          <DollarSign className="h-4 w-4 text-emerald-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-400 font-[family-name:var(--font-sora)]">
            S/ {costoTotalInvertido.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase">
            Mix Preventivo / Correctivo
          </span>
          <Truck className="h-4 w-4 text-indigo-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white font-[family-name:var(--font-sora)]">
            {preventivosCount}
          </span>
          <span className="text-xs text-slate-400">prev / {correctivosCount} corr</span>
        </div>
      </div>
    </div>
  );
}

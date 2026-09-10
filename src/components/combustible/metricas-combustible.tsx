import { Fuel, Gauge, DollarSign, Calendar } from "lucide-react";

interface MetricasCombustibleProps {
  totalGalones: number;
  totalGasto: number;
  promedioRendimiento: string;
  totalVales: number;
}

export function MetricasCombustible({
  totalGalones,
  totalGasto,
  promedioRendimiento,
  totalVales,
}: MetricasCombustibleProps) {
  const rendimientoNum = parseFloat(promedioRendimiento);
  const esOptimo = rendimientoNum >= 9.5;
  const esAlerta = rendimientoNum > 0 && rendimientoNum < 7.5;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase">
            Consumo Total Flota
          </span>
          <Fuel className="h-4 w-4 text-sky-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-sky-400 font-[family-name:var(--font-sora)]">
            {totalGalones.toLocaleString("es-PE", { maximumFractionDigits: 1 })}
          </span>
          <span className="text-xs text-slate-400">galones Diesel B5</span>
        </div>
      </div>

      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase">
            Inversión en Combustible
          </span>
          <DollarSign className="h-4 w-4 text-emerald-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-400 font-[family-name:var(--font-sora)]">
            S/ {totalGasto.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase">
            Eficiencia Térmica Promedio
          </span>
          <Gauge className={`h-4 w-4 ${esAlerta ? "text-rose-400" : esOptimo ? "text-amber-400" : "text-emerald-400"}`} />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className={`text-2xl font-bold font-[family-name:var(--font-sora)] ${esAlerta ? "text-rose-400" : esOptimo ? "text-amber-400" : "text-white"}`}>
            {promedioRendimiento}
          </span>
          <span className="text-xs text-slate-400">km / galón</span>
        </div>
      </div>

      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase">
            Vales Registrados
          </span>
          <Calendar className="h-4 w-4 text-indigo-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white font-[family-name:var(--font-sora)]">
            {totalVales}
          </span>
          <span className="text-xs text-slate-400">cargas auditadas</span>
        </div>
      </div>
    </div>
  );
}

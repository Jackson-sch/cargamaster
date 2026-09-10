import { Wallet, DollarSign, ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface MetricasLiquidacionesProps {
  totalViaticos: number;
  totalPeajes: number;
  totalSaldosChofer: number;
  totalSaldosEmpresa: number;
}

export function MetricasLiquidaciones({
  totalViaticos,
  totalPeajes,
  totalSaldosChofer,
  totalSaldosEmpresa,
}: MetricasLiquidacionesProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase">
            Total Anticipos Viáticos
          </span>
          <Wallet className="h-4 w-4 text-sky-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white font-[family-name:var(--font-sora)]">
            S/ {totalViaticos.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase">
            Peajes y Gastos Rendidos
          </span>
          <DollarSign className="h-4 w-4 text-amber-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-amber-400 font-[family-name:var(--font-sora)]">
            S/ {totalPeajes.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase">
            Saldos a Pagar a Chofer
          </span>
          <ArrowUpRight className="h-4 w-4 text-emerald-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-400 font-[family-name:var(--font-sora)]">
            S/ {totalSaldosChofer.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase">
            Devolución a Empresa
          </span>
          <ArrowDownLeft className="h-4 w-4 text-indigo-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-indigo-400 font-[family-name:var(--font-sora)]">
            S/ {totalSaldosEmpresa.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
}

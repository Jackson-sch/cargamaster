interface FacturacionMetricasProps {
  totalFacturadoSoles: number;
  totalDetraccionesSoles: number;
  greAceptadas: number;
}

export function FacturacionMetricas({
  totalFacturadoSoles,
  totalDetraccionesSoles,
  greAceptadas,
}: FacturacionMetricasProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-3">
        <span className="text-[11px] text-slate-400 block mb-1">Total Facturado (PEN)</span>
        <span className="text-xl font-bold font-mono text-white">
          S/ {totalFacturadoSoles.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
        </span>
      </div>

      <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-3">
        <span className="text-[11px] text-amber-400 block mb-1">Detracciones SPOT (4%)</span>
        <span className="text-xl font-bold font-mono text-amber-400">
          S/ {totalDetraccionesSoles.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
        </span>
      </div>

      <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-3">
        <span className="text-[11px] text-emerald-400 block mb-1">GRE Transportista Aceptadas</span>
        <span className="text-xl font-bold font-mono text-emerald-400">
          {greAceptadas} guías
        </span>
      </div>

      <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-3">
        <span className="text-[11px] text-sky-400 block mb-1">Eficacia CDR SUNAT</span>
        <span className="text-xl font-bold font-mono text-sky-400">
          100.0%
        </span>
      </div>
    </div>
  );
}

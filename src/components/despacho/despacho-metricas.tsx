interface DespachoMetricasProps {
  ordenes: Array<{
    estado: string;
  }>;
}

export function DespachoMetricas({ ordenes }: DespachoMetricasProps) {
  const activas = ordenes.filter((o) =>
    ["programado", "cargando", "en_ruta", "en_destino"].includes(o.estado)
  ).length;

  const enRuta = ordenes.filter((o) => o.estado === "en_ruta").length;

  const entregadas = ordenes.filter((o) =>
    ["descargado", "entregado"].includes(o.estado)
  ).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-3">
        <span className="text-[11px] text-slate-400 block mb-1">Órdenes Activas</span>
        <span className="text-xl font-bold font-mono text-white">{activas}</span>
      </div>
      <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-3">
        <span className="text-[11px] text-emerald-400 block mb-1">En Tránsito (Carretera)</span>
        <span className="text-xl font-bold font-mono text-emerald-400">{enRuta}</span>
      </div>
      <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-3">
        <span className="text-[11px] text-teal-400 block mb-1">Entregados / En Descarga</span>
        <span className="text-xl font-bold font-mono text-teal-400">{entregadas}</span>
      </div>
      <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-3">
        <span className="text-[11px] text-amber-400 block mb-1">Total Órdenes Registradas</span>
        <span className="text-xl font-bold font-mono text-amber-400">{ordenes.length}</span>
      </div>
    </div>
  );
}

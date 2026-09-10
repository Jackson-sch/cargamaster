import { LayoutShell } from "@/components/layout-shell";
import { Fuel, Gauge, DollarSign, Calendar, Truck } from "lucide-react";
import {
  obtenerConsumosCombustible,
  obtenerDatosParaRegistroCombustible,
} from "@/lib/actions/combustible";
import { ModalNuevoConsumo } from "@/components/combustible/modal-nuevo-consumo";

export const dynamic = "force-dynamic";

export default async function CombustiblePage() {
  const [consumosData, maestrosData] = await Promise.all([
    obtenerConsumosCombustible(),
    obtenerDatosParaRegistroCombustible(),
  ]);

  const consumos = consumosData.consumos || [];
  const unidades = maestrosData.unidades || [];
  const conductores = maestrosData.conductores || [];
  const ordenes = maestrosData.ordenes || [];

  // Cálculos de KPI
  const totalGalones = consumos.reduce(
    (acc, c) => acc + (parseFloat(c.galonesCargados) || 0),
    0
  );
  const totalGasto = consumos.reduce(
    (acc, c) => acc + (parseFloat(c.totalMonto) || 0),
    0
  );

  const consumosConRatio = consumos.filter(
    (c) => c.rendimientoKmGalonCalculado && parseFloat(c.rendimientoKmGalonCalculado) > 0
  );
  const promedioRendimiento =
    consumosConRatio.length > 0
      ? (
          consumosConRatio.reduce(
            (acc, c) => acc + parseFloat(c.rendimientoKmGalonCalculado!),
            0
          ) / consumosConRatio.length
        ).toFixed(2)
      : "5.10";

  return (
    <LayoutShell
      title="Control de Combustible & Rendimiento Térmico"
      subtitle="Registro de vales de grifo, odómetros, costo por galón y ratio de eficiencia km/galón"
    >
      <div className="space-y-6">
        {/* KPI Mini Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase">
                Consumo Total Flota
              </span>
              <Fuel className="h-4 w-4 text-sky-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white font-[family-name:var(--font-sora)]">
                {totalGalones.toLocaleString("es-PE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </span>
              <span className="text-xs text-slate-400">galones Diesel B5</span>
            </div>
          </div>

          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase">
                Gasto Acumulado
              </span>
              <DollarSign className="h-4 w-4 text-amber-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-400 font-[family-name:var(--font-sora)]">
                S/ {totalGasto.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase">
                Rendimiento Promedio
              </span>
              <Gauge className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-400 font-[family-name:var(--font-sora)]">
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
              <Truck className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white font-[family-name:var(--font-sora)]">
                {consumos.length}
              </span>
              <span className="text-xs text-slate-400">comprobantes</span>
            </div>
          </div>
        </div>

        {/* Consumptions Table Card */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-[#1F2937] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Fuel className="h-4 w-4 text-sky-400" />
              <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
                Vales de Carga de Combustible
              </h2>
            </div>
            <ModalNuevoConsumo
              unidades={unidades}
              conductores={conductores}
              ordenes={ordenes}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#0B1220] text-slate-400 uppercase tracking-wider text-[10px] border-b border-[#1F2937]">
                <tr>
                  <th className="px-4 py-3 font-semibold">N° Vale / Factura</th>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Tracto</th>
                  <th className="px-4 py-3 font-semibold">Conductor</th>
                  <th className="px-4 py-3 font-semibold">Estación de Servicio</th>
                  <th className="px-4 py-3 font-semibold">Odómetro</th>
                  <th className="px-4 py-3 font-semibold">Galones</th>
                  <th className="px-4 py-3 font-semibold">Precio / Gal</th>
                  <th className="px-4 py-3 font-semibold">Monto Total</th>
                  <th className="px-4 py-3 font-semibold">Rendimiento Estimado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937]">
                {consumos.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-slate-400">
                      <Fuel className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                      <p className="font-semibold">No hay cargas de combustible registradas.</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Haga clic en &quot;Registrar Carga de Combustible&quot; para ingresar un nuevo vale.
                      </p>
                    </td>
                  </tr>
                ) : (
                  consumos.map((c) => {
                    const ratio = c.rendimientoKmGalonCalculado
                      ? parseFloat(c.rendimientoKmGalonCalculado)
                      : null;

                    return (
                      <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3.5 font-mono font-bold text-white">
                          {c.numeroValeComprobante}
                        </td>
                        <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap">
                          {c.createdAt
                            ? new Date(c.createdAt).toLocaleDateString("es-PE", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })
                            : "--"}
                        </td>
                        <td className="px-4 py-3.5 font-mono font-bold text-amber-400">
                          {c.unidad?.placa || "N/A"}
                          <span className="block text-[10px] font-sans font-normal text-slate-400">
                            {c.unidad?.marca} {c.unidad?.modelo}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-200">
                          {c.conductor
                            ? `${c.conductor.nombres} ${c.conductor.apellidos}`
                            : "N/A"}
                        </td>
                        <td className="px-4 py-3.5 text-slate-300">
                          <span className="block font-medium">{c.grifoNombre}</span>
                          {c.grifoRuc && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              RUC: {c.grifoRuc}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-300 whitespace-nowrap">
                          {c.odometroAlCargar?.toLocaleString()} km
                        </td>
                        <td className="px-4 py-3.5 font-mono font-semibold text-slate-200 whitespace-nowrap">
                          {parseFloat(c.galonesCargados).toFixed(1)} gal
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-400 whitespace-nowrap">
                          S/ {parseFloat(c.precioPorGalon).toFixed(2)}
                        </td>
                        <td className="px-4 py-3.5 font-mono font-bold text-amber-300 whitespace-nowrap">
                          S/ {parseFloat(c.totalMonto).toFixed(2)}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {ratio ? (
                            <>
                              <span
                                className={`font-mono font-bold block ${
                                  ratio >= 5.0
                                    ? "text-emerald-400"
                                    : ratio >= 3.8
                                    ? "text-amber-400"
                                    : "text-rose-400"
                                }`}
                              >
                                {ratio.toFixed(2)} km/gal
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {ratio >= 5.0
                                  ? "Óptimo (Costa)"
                                  : ratio >= 3.8
                                  ? "Exigencia Sierra"
                                  : "Consumo Elevado"}
                              </span>
                            </>
                          ) : (
                            <span className="text-slate-500 font-mono text-[11px]">
                              Primer registro
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}

import { LayoutShell } from "@/components/layout-shell";
import { Wallet, CheckCircle2, DollarSign, Clock, Receipt, AlertCircle } from "lucide-react";
import { obtenerLiquidacionesCompletas } from "@/lib/actions/liquidaciones";
import { obtenerOrdenesServicioCompletas } from "@/lib/actions/ordenes-servicio";
import { ModalNuevaLiquidacion } from "@/components/liquidaciones/modal-nueva-liquidacion";
import { BotonExportarExcel } from "@/components/reportes/boton-exportar-excel";

export default async function LiquidacionesPage() {
  const [liquidacionesRes, ordenesRes] = await Promise.all([
    obtenerLiquidacionesCompletas(),
    obtenerOrdenesServicioCompletas(),
  ]);

  const liquidaciones = liquidacionesRes.liquidaciones || [];
  const ordenes = ordenesRes.ordenes || [];

  const totalViaticos = liquidaciones.reduce(
    (acc, l) => acc + parseFloat(l.viaticosAsignados || "0"),
    0
  );
  const totalPeajes = liquidaciones.reduce(
    (acc, l) => acc + parseFloat(l.gastosPeajesDeclarados || "0"),
    0
  );
  const totalSaldosChofer = liquidaciones.reduce(
    (acc, l) => acc + parseFloat(l.saldoAFavorConductor || "0"),
    0
  );

  return (
    <LayoutShell
      title="Liquidaciones de Conductores & Rendición de Gastos"
      subtitle="Liquidación por flete realizado, rendición de peajes con boleta, viáticos y saldos netos"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            Control de anticipos, gastos justificados con comprobante y balance final por viaje.
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            <BotonExportarExcel
              endpoint="/api/reportes/liquidaciones"
              label="Exportar Liquidaciones (.xlsx)"
            />
            <ModalNuevaLiquidacion
            ordenesDisponibles={ordenes.map((o) => ({
              id: o.id,
              codigoViaje: o.codigoViaje,
              fletePactadoMonto: o.fletePactadoMonto?.toString() || "0",
              adelantoViaticos: o.adelantoViaticos?.toString() || "0",
              conductorId: o.conductorId,
              conductor: o.conductor
                ? {
                    nombres: o.conductor.nombres,
                    apellidos: o.conductor.apellidos,
                    numeroDocumento: o.conductor.numeroDocumento,
                  }
                : null,
              cliente: o.cliente ? { razonSocial: o.cliente.razonSocial } : null,
            }))}
          />
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4">
            <span className="text-xs font-semibold text-slate-400 uppercase">
              Total Anticipos Viáticos
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white font-[family-name:var(--font-sora)]">
                S/ {totalViaticos.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4">
            <span className="text-xs font-semibold text-slate-400 uppercase">
              Peajes y Gastos Rendidos
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-400 font-[family-name:var(--font-sora)]">
                S/ {totalPeajes.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4">
            <span className="text-xs font-semibold text-slate-400 uppercase">
              Saldos Netos a Choferes
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-400 font-[family-name:var(--font-sora)]">
                S/ {totalSaldosChofer.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#1F2937] flex items-center justify-between">
            <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
              Historial de Liquidaciones de Flete
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              {liquidaciones.length} liquidaci{liquidaciones.length === 1 ? "ón" : "ones"}
            </span>
          </div>

          {liquidaciones.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Wallet className="h-8 w-8 mx-auto mb-2 text-slate-600" />
              <p className="text-xs">No hay liquidaciones de chofer registradas aún.</p>
              <p className="text-[11px] text-slate-600">Haz clic en &ldquo;Nueva Liquidación de Chofer&rdquo; al finalizar un viaje.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#0B1220] text-slate-400 uppercase tracking-wider text-[10px] border-b border-[#1F2937]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Viaje (OS)</th>
                    <th className="px-4 py-3 font-semibold">Conductor</th>
                    <th className="px-4 py-3 font-semibold">Flete Base</th>
                    <th className="px-4 py-3 font-semibold">Adelanto Viáticos</th>
                    <th className="px-4 py-3 font-semibold">Peajes Rendidos</th>
                    <th className="px-4 py-3 font-semibold">Cochera / Otros</th>
                    <th className="px-4 py-3 font-semibold">Saldo Chofer</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F2937]">
                  {liquidaciones.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-slate-200">
                        <span className="font-bold text-amber-400 block">
                          {l.ordenServicio?.codigoViaje || "OS-General"}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {l.ordenServicio?.ruta?.nombre ? `${l.ordenServicio.ruta.codigoRuta}` : ""}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-slate-200 font-medium">
                        <span className="block">
                          {l.conductor?.nombres} {l.conductor?.apellidos}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          DNI {l.conductor?.numeroDocumento}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-slate-300">
                        S/ {parseFloat(l.fleteBase || "0").toFixed(2)}
                      </td>

                      <td className="px-4 py-3.5 font-mono text-slate-300">
                        S/ {parseFloat(l.viaticosAsignados || "0").toFixed(2)}
                      </td>

                      <td className="px-4 py-3.5 font-mono text-amber-400 font-semibold">
                        S/ {parseFloat(l.gastosPeajesDeclarados || "0").toFixed(2)}
                      </td>

                      <td className="px-4 py-3.5 font-mono text-slate-300">
                        S/ {(parseFloat(l.gastosCocheraDeclarados || "0") + parseFloat(l.otrosGastos || "0")).toFixed(2)}
                      </td>

                      <td className="px-4 py-3.5 font-mono font-bold text-emerald-400">
                        S/ {parseFloat(l.saldoAFavorConductor || "0").toFixed(2)}
                      </td>

                      <td className="px-4 py-3.5">
                        {l.estado === "pagado" ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="h-3 w-3" /> Pagado
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="h-3 w-3" /> Aprobado
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </LayoutShell>
  );
}

import { LayoutShell } from "@/components/layout-shell";
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Truck,
  Building,
  Calendar,
} from "lucide-react";
import {
  obtenerMantenimientos,
  obtenerEntidadesParaMantenimiento,
} from "@/lib/actions/mantenimiento";
import { ModalNuevoMantenimiento } from "@/components/mantenimiento/modal-nuevo-mantenimiento";
import { ModalCambiarEstadoMantenimiento } from "@/components/mantenimiento/modal-cambiar-estado-mantenimiento";

export const dynamic = "force-dynamic";

export default async function MantenimientoPage() {
  const [mantData, entData] = await Promise.all([
    obtenerMantenimientos(),
    obtenerEntidadesParaMantenimiento(),
  ]);

  const mantenimientos = mantData.mantenimientos || [];
  const unidades = entData.unidades || [];
  const semirremolques = entData.semirremolques || [];

  // Cálculos de KPI
  const otsEnProceso = mantenimientos.filter((m) => m.estado === "en_proceso").length;
  const otsProgramadas = mantenimientos.filter((m) => m.estado === "pendiente").length;
  const preventivosCount = mantenimientos.filter((m) => m.tipo === "preventivo").length;
  const correctivosCount = mantenimientos.filter((m) => m.tipo === "correctivo").length;

  const costoTotalInvertido = mantenimientos.reduce(
    (acc, m) => acc + (parseFloat(m.costoTotal) || 0),
    0
  );

  return (
    <LayoutShell
      title="Mantenimiento Preventivo & Correctivo de Flota"
      subtitle="Órdenes de trabajo por kilometraje, control de repuestos, talleres y costos por unidad"
    >
      <div className="space-y-6">
        {/* KPI Grid */}
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

        {/* Tabla de Órdenes de Mantenimiento */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-[#1F2937] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
                Órdenes de Trabajo Mecánico (OT)
              </h2>
            </div>
            <ModalNuevoMantenimiento
              unidades={unidades}
              semirremolques={semirremolques}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#0B1220] text-slate-400 uppercase tracking-wider text-[10px] border-b border-[#1F2937]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Equipo</th>
                  <th className="px-4 py-3 font-semibold">Tipo</th>
                  <th className="px-4 py-3 font-semibold">Descripción del Servicio</th>
                  <th className="px-4 py-3 font-semibold">Taller</th>
                  <th className="px-4 py-3 font-semibold">Fecha Prog.</th>
                  <th className="px-4 py-3 font-semibold">Presupuesto (S/)</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937]">
                {mantenimientos.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                      <Wrench className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                      <p className="font-semibold">No hay órdenes de mantenimiento registradas.</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Haga clic en &quot;Nueva Orden de Trabajo (OT)&quot; para programar una intervención técnica.
                      </p>
                    </td>
                  </tr>
                ) : (
                  mantenimientos.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-mono font-bold text-white block">
                          {m.placa}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {m.entidadDetalle}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            m.tipo === "preventivo"
                              ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {m.tipo}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 max-w-[260px]">
                        <span className="text-slate-200 font-medium line-clamp-2">
                          {m.descripcion}
                        </span>
                        {m.odometroRegistro && (
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                            Odóm: {m.odometroRegistro.toLocaleString()} km
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-slate-300">
                        <span className="block font-medium">
                          {m.nombreTaller || (m.taller === "propio" ? "Taller Propio" : "Taller Externo")}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase">
                          {m.taller}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-slate-300 whitespace-nowrap font-mono">
                        {m.fechaProgramada}
                        {m.fechaEjecucion && (
                          <span className="block text-[10px] text-emerald-400 font-sans">
                            Ejecutado: {m.fechaEjecucion}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 font-mono font-bold text-amber-300 whitespace-nowrap">
                        S/ {parseFloat(m.costoTotal).toFixed(2)}
                        <span className="block text-[10px] text-slate-500 font-normal font-sans">
                          MO: S/ {parseFloat(m.costoManoObra).toFixed(0)} | Rep: S/ {parseFloat(m.costoRepuestos).toFixed(0)}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {m.estado === "completado" ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Completado
                          </span>
                        ) : m.estado === "en_proceso" ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            En Taller
                          </span>
                        ) : m.estado === "cancelado" ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase bg-slate-800 text-slate-400 border border-slate-700">
                            Cancelado
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase bg-sky-500/15 text-sky-400 border border-sky-500/30">
                            Programado
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <ModalCambiarEstadoMantenimiento
                          mantenimiento={{
                            id: m.id,
                            placa: m.placa,
                            entidadTipo: m.entidadTipo,
                            tipo: m.tipo,
                            descripcion: m.descripcion,
                            taller: m.taller,
                            nombreTaller: m.nombreTaller,
                            fechaProgramada: m.fechaProgramada,
                            costoTotal: m.costoTotal,
                            estado: m.estado,
                          }}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}

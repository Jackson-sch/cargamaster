import { LayoutShell } from "@/components/layout-shell";
import { obtenerLiquidacionesCompletas } from "@/lib/actions/liquidaciones";
import { obtenerOrdenesServicioCompletas } from "@/lib/actions/ordenes-servicio";
import { ModalNuevaLiquidacion } from "@/components/liquidaciones/modal-nueva-liquidacion";
import { MetricasLiquidaciones } from "@/components/liquidaciones/metricas-liquidaciones";
import { TablaLiquidaciones } from "@/components/liquidaciones/tabla-liquidaciones";
import { BotonExportarExcel } from "@/components/reportes/boton-exportar-excel";

export const dynamic = "force-dynamic";

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
  const totalSaldosEmpresa = liquidaciones.reduce(
    (acc, l) => acc + parseFloat(l.saldoAFavorEmpresa || "0"),
    0
  );

  return (
    <LayoutShell
      title="Liquidaciones de Conductores & Rendición de Gastos"
      subtitle="Liquidación por flete realizado, rendición de peajes con boleta, viáticos y saldos netos"
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <MetricasLiquidaciones
          totalViaticos={totalViaticos}
          totalPeajes={totalPeajes}
          totalSaldosChofer={totalSaldosChofer}
          totalSaldosEmpresa={totalSaldosEmpresa}
        />

        {/* Header Actions */}
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

        {/* Tabla Modular */}
        <TablaLiquidaciones liquidaciones={liquidaciones as any} />
      </div>
    </LayoutShell>
  );
}

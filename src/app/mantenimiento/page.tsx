import { LayoutShell } from "@/components/layout-shell";
import {
  obtenerMantenimientos,
  obtenerEntidadesParaMantenimiento,
} from "@/lib/actions/mantenimiento";
import { ModalNuevoMantenimiento } from "@/components/mantenimiento/modal-nuevo-mantenimiento";
import { MetricasMantenimiento } from "@/components/mantenimiento/metricas-mantenimiento";
import { TablaMantenimiento } from "@/components/mantenimiento/tabla-mantenimiento";
import { BotonExportarExcel } from "@/components/reportes/boton-exportar-excel";

export const dynamic = "force-dynamic";

export default async function MantenimientoPage() {
  const [mantData, entData] = await Promise.all([
    obtenerMantenimientos(),
    obtenerEntidadesParaMantenimiento(),
  ]);

  const mantenimientos = mantData.mantenimientos || [];
  const unidades = entData.unidades || [];
  const semirremolques = entData.semirremolques || [];

  // Métricas operativas
  const otsEnProceso = mantenimientos.filter((m) => m.estado === "en_proceso").length;
  const otsProgramadas = mantenimientos.filter((m) => m.estado === "pendiente").length;
  const preventivosCount = mantenimientos.filter((m) => m.tipo === "preventivo").length;
  const correctivosCount = mantenimientos.filter((m) => m.tipo === "correctivo").length;

  const costoTotalInvertido = mantenimientos.reduce(
    (acc, m) => acc + (parseFloat(m.costoTotal || "0") || 0),
    0
  );

  return (
    <LayoutShell
      title="Mantenimiento Preventivo & Correctivo de Flota"
      subtitle="Órdenes de trabajo por kilometraje, control de repuestos, talleres y costos por unidad"
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <MetricasMantenimiento
          otsEnProceso={otsEnProceso}
          otsProgramadas={otsProgramadas}
          costoTotalInvertido={costoTotalInvertido}
          preventivosCount={preventivosCount}
          correctivosCount={correctivosCount}
        />

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            Control integral del ciclo de taller: apertura de OT, cotización de repuestos y liberación a ruta.
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            <BotonExportarExcel
              endpoint="/api/reportes/mantenimiento"
              label="Exportar Mantenimiento (.xlsx)"
            />
            <ModalNuevoMantenimiento
              unidades={unidades}
              semirremolques={semirremolques}
            />
          </div>
        </div>

        {/* Tabla Modular */}
        <TablaMantenimiento mantenimientos={mantenimientos as any} />
      </div>
    </LayoutShell>
  );
}

import { LayoutShell } from "@/components/layout-shell";
import {
  obtenerConsumosCombustible,
  obtenerDatosParaRegistroCombustible,
} from "@/lib/actions/combustible";
import { ModalNuevoConsumo } from "@/components/combustible/modal-nuevo-consumo";
import { MetricasCombustible } from "@/components/combustible/metricas-combustible";
import { TablaCombustible } from "@/components/combustible/tabla-combustible";
import { BotonExportarExcel } from "@/components/reportes/boton-exportar-excel";

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
        <MetricasCombustible
          totalGalones={totalGalones}
          totalGasto={totalGasto}
          promedioRendimiento={promedioRendimiento}
          totalVales={consumos.length}
        />

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            Control volumétrico de Diesel B5, auditoría de precios por estación y telemetría de consumo.
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            <BotonExportarExcel
              endpoint="/api/reportes/combustible"
              label="Exportar Consumo Diesel (.xlsx)"
            />
            <ModalNuevoConsumo
              unidades={unidades}
              conductores={conductores}
              ordenes={ordenes}
            />
          </div>
        </div>

        {/* Tabla Modular con Edición y Anulación */}
        <TablaCombustible consumos={consumos as any} />
      </div>
    </LayoutShell>
  );
}

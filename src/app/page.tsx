import { LayoutShell } from "@/components/layout-shell";
import { obtenerFlotaCompleta } from "@/lib/actions/flota";
import { obtenerDocumentosYAlertas } from "@/lib/actions/documentos";
import { obtenerOrdenesServicioCompletas } from "@/lib/actions/ordenes-servicio";
import { obtenerComprobantesCompletos } from "@/lib/actions/facturacion";
import { obtenerTelemetriaEnVivoAction } from "@/lib/actions/telemetria";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { ViajeMonitoreoCard } from "@/components/dashboard/viaje-monitoreo-card";
import { SemaforoAlertasCard } from "@/components/dashboard/semaforo-alertas-card";
import { TablaFlotaResumen } from "@/components/dashboard/tabla-flota-resumen";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [flotaRes, docsRes, ordenesRes, comprobantesRes, telemetriaRes] =
    await Promise.all([
      obtenerFlotaCompleta(),
      obtenerDocumentosYAlertas(),
      obtenerOrdenesServicioCompletas(),
      obtenerComprobantesCompletos(),
      obtenerTelemetriaEnVivoAction(),
    ]);

  const unidades = flotaRes.unidades || [];
  const semirremolques = flotaRes.semirremolques || [];
  const documentos = docsRes.documentos || [];
  const ordenes = ordenesRes.ordenes || [];
  const comprobantes = comprobantesRes.comprobantes || [];
  const telemetria = telemetriaRes.telemetria || [];

  // Métricas de Flota
  const totalUnidades = unidades.length;
  const enRuta = unidades.filter((u) => u.estado === "en_ruta").length;
  const disponibles = unidades.filter((u) => u.estado === "disponible").length;
  const enTaller = unidades.filter((u) => u.estado === "mantenimiento").length;
  const porcentajeOperativo =
    totalUnidades > 0
      ? Math.round(((disponibles + enRuta) / totalUnidades) * 100)
      : 100;

  // Carga en Tránsito
  const ordenesActivas = ordenes.filter(
    (o) => o.estado === "en_ruta" || o.estado === "cargando"
  );
  const totalToneladasEnTransito = ordenesActivas.reduce((acc, o) => {
    const kg = parseFloat(String(o.pesoBrutoKg || 0));
    return acc + (isNaN(kg) ? 0 : kg / 1000);
  }, 0);

  // Fletes Facturados / Operativos
  const facturadoTotal = comprobantes
    .filter((c) => c.estadoSunat === "aceptado")
    .reduce((acc, c) => acc + parseFloat(String(c.montoTotal || 0)), 0);

  const montoFletesDisplay =
    facturadoTotal > 0
      ? facturadoTotal
      : ordenes.reduce(
          (acc, o) => acc + parseFloat(String(o.fletePactadoMonto || 0)),
          0
        );

  const detraccionCalculada = montoFletesDisplay * 0.04;

  // Semáforo Normativo de Documentos
  const alertasVencimiento = documentos.filter(
    (d) =>
      d.estadoAlertaCalculado === "por_vencer" ||
      d.estadoAlertaCalculado === "vencido"
  ).length;

  const alertasCriticas = documentos.filter(
    (d) => d.estadoAlertaCalculado === "vencido"
  ).length;

  // Viaje en Curso Activo
  const viajeActivo =
    ordenes.find((o) => o.estado === "en_ruta") ||
    ordenes.find((o) => o.estado === "cargando") ||
    ordenes[0];

  const telemActiva = viajeActivo
    ? telemetria.find((t) => t.unidad.id === viajeActivo.unidadId)
    : null;
  const velocidadActual = telemActiva?.ultimaPosicion?.velocidadKmh || "72.4";
  const ubicacionActual = viajeActivo?.ruta?.nombre
    ? `${viajeActivo.ruta.nombre} (En Ruta)`
    : "Panamericana Sur (Km 480)";

  return (
    <LayoutShell
      title="Centro de Control y Monitoreo Logístico"
      subtitle="Monitoreo en tiempo real de flota, viajes en ruta, cumplimiento MTC/SUTRAN y operaciones"
    >
      <div className="space-y-6">
        {/* 1. KPIs Principales */}
        <KpiCards
          totalUnidades={totalUnidades}
          enRuta={enRuta}
          disponibles={disponibles}
          enTaller={enTaller}
          porcentajeOperativo={porcentajeOperativo}
          totalToneladasEnTransito={totalToneladasEnTransito}
          totalViajesActivos={ordenesActivas.length}
          montoFletesDisplay={montoFletesDisplay}
          detraccionCalculada={detraccionCalculada}
          alertasVencimiento={alertasVencimiento}
          alertasCriticas={alertasCriticas}
        />

        {/* 2. Sección de Monitoreo en Vivo & Alertas Regulatorias */}
        {viajeActivo ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ViajeMonitoreoCard
              viajeActivo={viajeActivo}
              velocidadActual={velocidadActual}
              ubicacionActual={ubicacionActual}
            />
            <SemaforoAlertasCard documentos={documentos as any} />
          </div>
        ) : null}

        {/* 3. Padrón General de Flota y Odómetros */}
        <TablaFlotaResumen
          unidades={unidades as any}
          semirremolques={semirremolques as any}
        />
      </div>
    </LayoutShell>
  );
}

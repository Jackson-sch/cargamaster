import { LayoutShell } from "@/components/layout-shell";
import { obtenerOrdenesServicioCompletas } from "@/lib/actions/ordenes-servicio";
import { obtenerClientes } from "@/lib/actions/clientes";
import { obtenerRutas } from "@/lib/actions/rutas";
import { obtenerFlotaCompleta } from "@/lib/actions/flota";
import { obtenerConductoresCompletos } from "@/lib/actions/conductores";
import { ModalNuevaOrden } from "@/components/despacho/modal-nueva-orden";
import { DespachoMetricas } from "@/components/despacho/despacho-metricas";
import { TablaDespacho } from "@/components/despacho/tabla-despacho";
import { BotonExportarExcel } from "@/components/reportes/boton-exportar-excel";

export default async function DespachoPage() {
  const [ordenesRes, clientesRes, rutasRes, flotaRes, conductoresRes] =
    await Promise.all([
      obtenerOrdenesServicioCompletas(),
      obtenerClientes(),
      obtenerRutas(),
      obtenerFlotaCompleta(),
      obtenerConductoresCompletos(),
    ]);

  const ordenes = ordenesRes.ordenes || [];
  const clientes = clientesRes.clientes || [];
  const rutas = rutasRes.rutas || [];
  const unidades = flotaRes.unidades || [];
  const semirremolques = flotaRes.semirremolques || [];
  const conductores = conductoresRes.conductores || [];

  const clientesFormateados = clientes.map((c) => ({
    id: c.id,
    razonSocial: c.razonSocial,
    numeroDocumento: c.numeroDocumento,
  }));

  const rutasFormateadas = rutas.map((r) => ({
    id: r.id,
    codigoRuta: r.codigoRuta,
    nombre: r.nombre,
    distanciaEstimadaKm: Number(r.distanciaEstimadaKm) || 0,
  }));

  const unidadesFormateadas = unidades.map((u) => ({
    id: u.id,
    placa: u.placa,
    marca: u.marca,
    modelo: u.modelo,
    estado: u.estado,
  }));

  const semirremolquesFormateados = semirremolques.map((s) => ({
    id: s.id,
    placa: s.placa,
    tipoCarroceria: s.tipoCarroceria,
    estado: s.estado,
  }));

  const conductoresFormateados = conductores.map((c) => ({
    id: c.id,
    nombres: c.nombres,
    apellidos: c.apellidos,
    numeroDocumento: c.numeroDocumento,
    estado: c.estado,
  }));

  return (
    <LayoutShell
      title="Despacho de Viajes y Órdenes de Servicio"
      subtitle="Creación, asignación vehicular, control de carga y ciclo de estados de transporte"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            Control de flota pesada en ruta, manifiestos de pesaje, cartas de porte y guías electrónicas.
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            <BotonExportarExcel
              endpoint="/api/reportes/despacho"
              label="Exportar Despacho (.xlsx)"
            />
            <ModalNuevaOrden
              clientes={clientesFormateados}
              rutas={rutas.map((r) => ({
                id: r.id,
                codigoRuta: r.codigoRuta,
                nombre: r.nombre,
                distanciaEstimadaKm: r.distanciaEstimadaKm?.toString() || "0",
              }))}
              unidades={unidadesFormateadas}
              semirremolques={semirremolquesFormateados}
              conductores={conductoresFormateados}
            />
          </div>
        </div>

        {/* Resumen de Métricas */}
        <DespachoMetricas ordenes={ordenes as any} />

        {/* Tabla Maestra de Despacho con Búsqueda, Filtros, Edición y Cancelación */}
        <TablaDespacho
          ordenes={ordenes as any}
          clientes={clientesFormateados}
          rutas={rutasFormateadas}
          unidades={unidadesFormateadas}
          semirremolques={semirremolquesFormateados}
          conductores={conductoresFormateados}
        />
      </div>
    </LayoutShell>
  );
}

import { LayoutShell } from "@/components/layout-shell";
import { Search, Filter } from "lucide-react";
import { obtenerOrdenesServicioCompletas } from "@/lib/actions/ordenes-servicio";
import { obtenerClientes } from "@/lib/actions/clientes";
import { obtenerRutas } from "@/lib/actions/rutas";
import { obtenerFlotaCompleta } from "@/lib/actions/flota";
import { obtenerConductoresCompletos } from "@/lib/actions/conductores";
import { ModalNuevaOrden } from "@/components/despacho/modal-nueva-orden";
import { DespachoMetricas } from "@/components/despacho/despacho-metricas";
import { TablaDespacho } from "@/components/despacho/tabla-despacho";

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

  return (
    <LayoutShell
      title="Despacho de Viajes y Órdenes de Servicio"
      subtitle="Creación, asignación vehicular, control de carga y ciclo de estados de transporte"
    >
      <div className="space-y-6">
        {/* Header Actions & Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-80">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por código OS, cliente o placa..."
                className="w-full h-9 bg-[#111827] border border-[#1F2937] rounded-md pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <button className="h-9 px-3 bg-[#111827] border border-[#1F2937] hover:border-slate-600 rounded-md text-xs text-slate-300 flex items-center gap-1.5 transition-colors">
              <Filter className="h-3.5 w-3.5" />
              <span>Filtros</span>
            </button>
          </div>

          <ModalNuevaOrden
            clientes={clientes.map((c) => ({
              id: c.id,
              razonSocial: c.razonSocial,
              numeroDocumento: c.numeroDocumento,
            }))}
            rutas={rutas.map((r) => ({
              id: r.id,
              codigoRuta: r.codigoRuta,
              nombre: r.nombre,
              distanciaEstimadaKm: r.distanciaEstimadaKm?.toString() || "0",
            }))}
            unidades={unidades.map((u) => ({
              id: u.id,
              placa: u.placa,
              marca: u.marca,
              modelo: u.modelo,
              estado: u.estado,
            }))}
            semirremolques={semirremolques.map((s) => ({
              id: s.id,
              placa: s.placa,
              tipoCarroceria: s.tipoCarroceria,
              estado: s.estado,
            }))}
            conductores={conductores.map((c) => ({
              id: c.id,
              nombres: c.nombres,
              apellidos: c.apellidos,
              estado: c.estado,
            }))}
          />
        </div>

        {/* Resumen de Métricas */}
        <DespachoMetricas ordenes={ordenes as any} />

        {/* Tabla Maestra de Despacho */}
        <TablaDespacho ordenes={ordenes as any} />
      </div>
    </LayoutShell>
  );
}

import { Calendar, ClipboardList } from "lucide-react";
import { ModalDocumentosViaje } from "@/components/despacho/modal-documentos-viaje";
import { ModalCambiarEstado } from "@/components/despacho/modal-cambiar-estado";
import { ModalEvidenciaPod } from "@/components/despacho/modal-evidencia-pod";

export interface OrdenItem {
  id: string;
  codigoViaje: string;
  fechaHoraProgramada?: Date | string | null;
  descripcionCarga: string;
  pesoBrutoKg: string | number;
  tipoCarga: string;
  fletePactadoMoneda: string;
  fletePactadoMonto: string;
  detraccionMonto?: string | null;
  estado: string;
  cliente?: {
    razonSocial: string;
    numeroDocumento: string;
  } | null;
  ruta?: {
    codigoRuta: string;
    nombre: string;
    distanciaEstimadaKm: number;
    origenDistrito?: string | null;
    origenDepartamento?: string | null;
    destinoDistrito?: string | null;
    destinoDepartamento?: string | null;
  } | null;
  unidad?: {
    placa: string;
  } | null;
  semirremolque?: {
    placa: string;
  } | null;
  conductor?: {
    nombres: string;
    apellidos: string;
    numeroDocumento?: string | null;
  } | null;
  guias?: Array<{
    serie: string;
    numeroCorrelativo: number;
  }>;
  comprobantes?: Array<{
    serie: string;
    numeroCorrelativo: number;
  }>;
}

interface TablaDespachoProps {
  ordenes: OrdenItem[];
}

export function TablaDespacho({ ordenes }: TablaDespachoProps) {
  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "programado":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
            Programado
          </span>
        );
      case "cargando":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-sky-500/15 text-sky-400 border border-sky-500/30">
            Cargando
          </span>
        );
      case "en_ruta":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 animate-pulse">
            En Ruta
          </span>
        );
      case "en_destino":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            En Destino
          </span>
        );
      case "descargado":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-purple-500/15 text-purple-400 border border-purple-500/30">
            Descargado
          </span>
        );
      case "entregado":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-teal-500/15 text-teal-400 border border-teal-500/30">
            Entregado
          </span>
        );
      case "liquidado":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-slate-800 text-slate-300 border border-slate-700">
            Liquidado
          </span>
        );
      case "cancelado":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-red-500/15 text-red-400 border border-red-500/30">
            Cancelado
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-slate-800 text-slate-400 border border-slate-700">
            {estado}
          </span>
        );
    }
  };

  if (ordenes.length === 0) {
    return (
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-12 text-center">
        <ClipboardList className="h-10 w-10 text-slate-600 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-slate-300 mb-1">
          No hay órdenes de servicio registradas
        </h3>
        <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
          Crea una nueva orden de servicio para asignar unidad, semirremolque y chofer para comenzar un flete.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-[#1F2937] flex items-center justify-between">
        <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
          Listado Maestro de Órdenes de Servicio (Despacho)
        </h2>
        <span className="text-xs text-slate-400">
          {ordenes.length} orden{ordenes.length === 1 ? "" : "es"} en base de datos
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#0B1220] text-slate-400 uppercase tracking-wider text-[10px] border-b border-[#1F2937]">
            <tr>
              <th className="px-4 py-3 font-semibold">Código OS</th>
              <th className="px-4 py-3 font-semibold">Cliente Dador</th>
              <th className="px-4 py-3 font-semibold">Ruta (Origen ➔ Destino)</th>
              <th className="px-4 py-3 font-semibold">Tracto / Carreta</th>
              <th className="px-4 py-3 font-semibold">Conductor</th>
              <th className="px-4 py-3 font-semibold">Carga & Peso</th>
              <th className="px-4 py-3 font-semibold">Flete & Detracción</th>
              <th className="px-4 py-3 font-semibold">Doc. SUNAT</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold text-right">Acciones de Hito</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2937]">
            {ordenes.map((orden) => (
              <tr
                key={orden.id}
                className="hover:bg-slate-800/30 transition-colors"
              >
                <td className="px-4 py-3.5">
                  <span className="font-mono font-bold text-amber-400 block">
                    {orden.codigoViaje}
                  </span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <Calendar className="h-3 w-3" />
                    {orden.fechaHoraProgramada
                      ? new Date(orden.fechaHoraProgramada).toLocaleDateString("es-PE")
                      : "S/F"}
                  </span>
                </td>

                <td className="px-4 py-3.5">
                  <span className="font-semibold text-slate-200 block truncate max-w-[180px]">
                    {orden.cliente?.razonSocial || "Cliente no especificado"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    RUC {orden.cliente?.numeroDocumento}
                  </span>
                </td>

                <td className="px-4 py-3.5">
                  <span className="text-slate-200 block truncate max-w-[200px] font-medium">
                    {orden.ruta?.origenDistrito || orden.ruta?.origenDepartamento} ➔{" "}
                    {orden.ruta?.destinoDistrito || orden.ruta?.destinoDepartamento}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {orden.ruta?.distanciaEstimadaKm} km ({orden.ruta?.codigoRuta})
                  </span>
                </td>

                <td className="px-4 py-3.5 font-mono">
                  <span className="text-white font-bold block">
                    {orden.unidad?.placa}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    {orden.semirremolque ? `+ ${orden.semirremolque.placa}` : "Solo tracto / rígido"}
                  </span>
                </td>

                <td className="px-4 py-3.5">
                  <span className="text-slate-200 block font-medium">
                    {orden.conductor?.nombres} {orden.conductor?.apellidos}
                  </span>
                  <span className="text-emerald-400 text-[10px] font-mono">
                    {orden.conductor?.numeroDocumento ? `DNI ${orden.conductor.numeroDocumento}` : "A-IIIc"}
                  </span>
                </td>

                <td className="px-4 py-3.5">
                  <span className="text-slate-300 block font-medium truncate max-w-[140px]">
                    {orden.descripcionCarga}
                  </span>
                  <span className="text-slate-400 text-[10px] font-mono">
                    {orden.pesoBrutoKg} kg ({orden.tipoCarga})
                  </span>
                </td>

                <td className="px-4 py-3.5">
                  <span className="font-mono font-bold text-slate-100 block">
                    {orden.fletePactadoMoneda === "USD" ? "$ " : "S/ "}
                    {parseFloat(orden.fletePactadoMonto || "0").toLocaleString("es-PE", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono">
                    Detr. (4%): S/ {parseFloat(orden.detraccionMonto || "0").toFixed(2)}
                  </span>
                </td>

                <td className="px-4 py-3.5">
                  <div className="space-y-1">
                    {orden.guias && orden.guias.length > 0 ? (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px] border border-emerald-500/20 block w-fit">
                        GRE: {orden.guias[0].serie}-{String(orden.guias[0].numeroCorrelativo).padStart(6, "0")}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono block">
                        Sin GRE
                      </span>
                    )}
                    {orden.comprobantes && orden.comprobantes.length > 0 ? (
                      <span className="px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 font-mono text-[10px] border border-sky-500/20 block w-fit">
                        FT: {orden.comprobantes[0].serie}-{String(orden.comprobantes[0].numeroCorrelativo).padStart(6, "0")}
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-500/70 font-mono block">
                        Sin Facturar
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-4 py-3.5">
                  {getEstadoBadge(orden.estado)}
                </td>

                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <ModalDocumentosViaje
                      ordenId={orden.id}
                      codigoViaje={orden.codigoViaje}
                      placaTracto={orden.unidad?.placa}
                      placaCarreta={orden.semirremolque?.placa}
                      conductorNombre={
                        orden.conductor
                          ? `${orden.conductor.nombres} ${orden.conductor.apellidos}`
                          : null
                      }
                      rutaNombre={orden.ruta?.nombre}
                    />
                    <ModalCambiarEstado
                      ordenId={orden.id}
                      codigoViaje={orden.codigoViaje}
                      estadoActual={orden.estado}
                    />
                    <ModalEvidenciaPod
                      ordenId={orden.id}
                      codigoViaje={orden.codigoViaje}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

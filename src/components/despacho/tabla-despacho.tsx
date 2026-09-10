"use client";

import { useState, useTransition } from "react";
import { Calendar, ClipboardList, Search, Ban } from "lucide-react";
import { ModalDocumentosViaje } from "@/components/despacho/modal-documentos-viaje";
import { ModalCambiarEstado } from "@/components/despacho/modal-cambiar-estado";
import { ModalEvidenciaPod } from "@/components/despacho/modal-evidencia-pod";
import { ModalEditarOrden } from "@/components/despacho/modal-editar-orden";
import { cancelarOrdenServicioAction } from "@/lib/actions/ordenes-servicio";
import { toast } from "sonner";

export interface OrdenItem {
  id: string;
  codigoViaje: string;
  clienteId?: string;
  rutaId?: string;
  unidadId?: string;
  semirremolqueId?: string | null;
  conductorId?: string;
  conductorSecundarioId?: string | null;
  fechaHoraProgramada?: Date | string | null;
  descripcionCarga: string;
  pesoBrutoKg: string | number;
  tipoCarga: string;
  unidadMedida?: string;
  fletePactadoMoneda: string;
  fletePactadoMonto: string;
  adelantoViaticos?: string | number | null;
  detraccionMonto?: string | null;
  observaciones?: string | null;
  estado: string;
  cliente?: {
    id?: string;
    razonSocial: string;
    numeroDocumento: string;
  } | null;
  ruta?: {
    id?: string;
    codigoRuta: string;
    nombre: string;
    distanciaEstimadaKm: number;
    origenDistrito?: string | null;
    origenDepartamento?: string | null;
    destinoDistrito?: string | null;
    destinoDepartamento?: string | null;
  } | null;
  unidad?: {
    id?: string;
    placa: string;
    marca?: string;
    modelo?: string;
  } | null;
  semirremolque?: {
    id?: string;
    placa: string;
    tipoCarroceria?: string;
  } | null;
  conductor?: {
    id?: string;
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
  clientes?: Array<{ id: string; razonSocial: string; numeroDocumento: string }>;
  rutas?: Array<{ id: string; nombre: string; codigoRuta: string }>;
  unidades?: Array<{ id: string; placa: string; marca: string; modelo: string }>;
  semirremolques?: Array<{ id: string; placa: string; tipoCarroceria: string }>;
  conductores?: Array<{ id: string; nombres: string; apellidos: string }>;
}

export function TablaDespacho({
  ordenes,
  clientes = [],
  rutas = [],
  unidades = [],
  semirremolques = [],
  conductores = [],
}: TablaDespachoProps) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [isPending, startTransition] = useTransition();

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
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-rose-500/15 text-rose-400 border border-rose-500/30">
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

  const ordenesFiltradas = ordenes.filter((o) => {
    const q = busqueda.toLowerCase();
    const matchBusqueda =
      o.codigoViaje.toLowerCase().includes(q) ||
      (o.cliente?.razonSocial && o.cliente.razonSocial.toLowerCase().includes(q)) ||
      (o.unidad?.placa && o.unidad.placa.toLowerCase().includes(q)) ||
      (o.conductor && `${o.conductor.nombres} ${o.conductor.apellidos}`.toLowerCase().includes(q)) ||
      o.descripcionCarga.toLowerCase().includes(q);

    const matchEstado = filtroEstado === "todos" ? true : o.estado === filtroEstado;

    return matchBusqueda && matchEstado;
  });

  const handleCancelar = (o: OrdenItem) => {
    if (o.estado === "cancelado" || o.estado === "liquidado" || o.estado === "facturado") {
      toast.error(`No se puede cancelar una orden en estado ${o.estado}.`);
      return;
    }

    if (!confirm(`¿Estás seguro de cancelar el viaje ${o.codigoViaje}? Se liberarán el tracto y semirremolque asignados.`)) return;

    startTransition(async () => {
      const res = await cancelarOrdenServicioAction(o.id);
      if (res.success) {
        toast.success(res.message || "Orden cancelada exitosamente.");
      } else {
        toast.error(res.error || "No se pudo cancelar la orden.");
      }
    });
  };

  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden shadow-xl space-y-0">
      {/* Header Filters Bar */}
      <div className="p-4 border-b border-[#1F2937] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0B1220]">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-semibold text-slate-300">
            {ordenesFiltradas.length} de {ordenes.length} órdenes registradas
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por código OS, cliente o placa..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded pl-8 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="h-8 bg-[#111827] border border-[#1F2937] rounded px-2.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="todos">Todos los Estados</option>
            <option value="programado">🟡 Programado</option>
            <option value="cargando">🔵 Cargando</option>
            <option value="en_ruta">🟢 En Ruta</option>
            <option value="en_destino">🟣 En Destino</option>
            <option value="entregado">🩵 Entregado</option>
            <option value="liquidado">⚪ Liquidado</option>
            <option value="cancelado">🔴 Cancelado</option>
          </select>
        </div>
      </div>

      {ordenesFiltradas.length === 0 ? (
        <div className="p-12 text-center text-slate-500">
          <ClipboardList className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300 mb-1">
            No se encontraron órdenes de servicio
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Prueba cambiando los filtros de búsqueda o programa una nueva orden de servicio.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#0B1220] text-slate-400 uppercase tracking-wider text-[10px] border-b border-[#1F2937]">
              <tr>
                <th className="px-4 py-3 font-semibold">Código Viaje</th>
                <th className="px-4 py-3 font-semibold">Cliente / Dador</th>
                <th className="px-4 py-3 font-semibold">Ruta / Destino</th>
                <th className="px-4 py-3 font-semibold">Configuración T3S3</th>
                <th className="px-4 py-3 font-semibold">Carga & Peso</th>
                <th className="px-4 py-3 font-semibold">Flete & SPOT</th>
                <th className="px-4 py-3 font-semibold">Docs Electrónicos</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]">
              {ordenesFiltradas.map((orden) => (
                <tr key={orden.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="font-mono font-bold text-amber-400 block">
                      {orden.codigoViaje}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="h-2.5 w-2.5" />
                      {orden.fechaHoraProgramada
                        ? new Date(orden.fechaHoraProgramada).toLocaleDateString("es-PE", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Por coordinar"}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 min-w-[160px] max-w-[220px]">
                    <span
                      className="font-medium text-white block break-words whitespace-normal leading-tight"
                      title={orden.cliente?.razonSocial}
                    >
                      {orden.cliente?.razonSocial}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                      RUC {orden.cliente?.numeroDocumento}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 min-w-[170px] max-w-[240px]">
                    <span className="text-slate-200 block font-medium break-words whitespace-normal leading-tight">
                      {orden.ruta?.origenDistrito || orden.ruta?.origenDepartamento} &rarr;{" "}
                      {orden.ruta?.destinoDistrito || orden.ruta?.destinoDepartamento}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                      {orden.ruta?.distanciaEstimadaKm} km ({orden.ruta?.codigoRuta})
                    </span>
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 text-[11px] font-bold">
                        {orden.unidad?.placa || "S/T"}
                      </span>
                      <span className="text-slate-500">+</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                        {orden.semirremolque?.placa || "S/C"}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {orden.conductor
                        ? `${orden.conductor.apellidos}, ${orden.conductor.nombres.charAt(0)}.`
                        : "Sin asignar"}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 min-w-[140px] max-w-[200px]">
                    <span
                      className="text-slate-200 block break-words whitespace-normal leading-tight font-medium"
                      title={orden.descripcionCarga}
                    >
                      {orden.descripcionCarga}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                      {(parseFloat(String(orden.pesoBrutoKg)) / 1000).toFixed(1)} Tn ({orden.tipoCarga})
                    </span>
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap font-mono">
                    <span className="font-bold text-white block">
                      {orden.fletePactadoMoneda === "USD" ? "$" : "S/"}{" "}
                      {parseFloat(orden.fletePactadoMonto).toLocaleString("es-PE", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                    {orden.detraccionMonto && (
                      <span className="text-[10px] text-amber-400 block">
                        SPOT 4%: S/ {parseFloat(orden.detraccionMonto).toFixed(2)}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap">
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

                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
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

                      {orden.estado !== "liquidado" && orden.estado !== "facturado" && orden.estado !== "cancelado" && (
                        <ModalEditarOrden
                          orden={{
                            id: orden.id,
                            codigoViaje: orden.codigoViaje,
                            clienteId: orden.clienteId || orden.cliente?.id || "",
                            rutaId: orden.rutaId || orden.ruta?.id || "",
                            unidadId: orden.unidadId || orden.unidad?.id || "",
                            semirremolqueId: orden.semirremolqueId || orden.semirremolque?.id,
                            conductorId: orden.conductorId || orden.conductor?.id || "",
                            conductorSecundarioId: orden.conductorSecundarioId,
                            tipoCarga: orden.tipoCarga as any,
                            descripcionCarga: orden.descripcionCarga,
                            pesoBrutoKg: orden.pesoBrutoKg,
                            unidadMedida: (orden.unidadMedida as any) || "KGM",
                            fechaHoraProgramada: orden.fechaHoraProgramada,
                            fletePactadoMoneda: (orden.fletePactadoMoneda as any) || "PEN",
                            fletePactadoMonto: orden.fletePactadoMonto,
                            adelantoViaticos: orden.adelantoViaticos,
                            observaciones: orden.observaciones,
                          }}
                          clientes={clientes}
                          rutas={rutas}
                          unidades={unidades}
                          semirremolques={semirremolques}
                          conductores={conductores}
                        />
                      )}

                      {orden.estado !== "liquidado" && orden.estado !== "facturado" && orden.estado !== "cancelado" && (
                        <button
                          type="button"
                          onClick={() => handleCancelar(orden)}
                          disabled={isPending}
                          title="Cancelar Viaje"
                          className="p-1.5 rounded bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors disabled:opacity-30"
                        >
                          <Ban className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

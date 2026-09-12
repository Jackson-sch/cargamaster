"use client";

import { useState, useTransition, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Calendar, ClipboardList, Ban } from "lucide-react";
import { ModalDocumentosViaje } from "@/components/despacho/modal-documentos-viaje";
import { ModalCambiarEstado } from "@/components/despacho/modal-cambiar-estado";
import { ModalEvidenciaPod } from "@/components/despacho/modal-evidencia-pod";
import { ModalEditarOrden } from "@/components/despacho/modal-editar-orden";
import { cancelarOrdenServicioAction } from "@/lib/actions/ordenes-servicio";
import { toast } from "sonner";
import { DataTable, DataTableColumnHeader } from "@/components/ui/data-table";

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

  const handleCancelar = (o: OrdenItem) => {
    if (o.estado === "cancelado" || o.estado === "liquidado" || o.estado === "facturado") {
      toast.error(`No se puede cancelar una orden en estado ${o.estado}.`);
      return;
    }

    if (
      !confirm(
        `¿Estás seguro de cancelar el viaje ${o.codigoViaje}? Se liberarán el tracto y semirremolque asignados.`
      )
    )
      return;

    startTransition(async () => {
      const res = await cancelarOrdenServicioAction(o.id);
      if (res.success) {
        toast.success(res.message || "Orden cancelada exitosamente.");
      } else {
        toast.error(res.error || "No se pudo cancelar la orden.");
      }
    });
  };

  const filteredData = useMemo(() => {
    if (filtroEstado === "todos") return ordenes;
    return ordenes.filter((o) => o.estado === filtroEstado);
  }, [ordenes, filtroEstado]);

  const columns = useMemo<ColumnDef<OrdenItem>[]>(
    () => [
      {
        accessorKey: "codigoViaje",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Código Viaje" />
        ),
        cell: ({ row }) => {
          const o = row.original;
          return (
            <div className="whitespace-nowrap">
              <span className="font-mono font-bold text-amber-400 block">
                {o.codigoViaje}
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                <Calendar className="h-2.5 w-2.5" />
                {o.fechaHoraProgramada
                  ? new Date(o.fechaHoraProgramada).toLocaleDateString("es-PE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Por coordinar"}
              </span>
            </div>
          );
        },
      },
      {
        id: "cliente",
        accessorFn: (row) => row.cliente?.razonSocial || "",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Cliente / Dador" />
        ),
        cell: ({ row }) => {
          const o = row.original;
          return (
            <div className="min-w-[150px] max-w-[220px]">
              <span
                className="font-medium text-white block break-words whitespace-normal leading-tight"
                title={o.cliente?.razonSocial}
              >
                {o.cliente?.razonSocial || "Sin cliente"}
              </span>
              <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                RUC {o.cliente?.numeroDocumento || "—"}
              </span>
            </div>
          );
        },
      },
      {
        id: "ruta",
        accessorFn: (row) => row.ruta?.nombre || "",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Ruta / Destino" />
        ),
        cell: ({ row }) => {
          const o = row.original;
          return (
            <div className="min-w-[160px] max-w-[220px]">
              <span className="text-slate-200 block font-medium break-words whitespace-normal leading-tight">
                {o.ruta?.origenDistrito || o.ruta?.origenDepartamento || "Origen"} &rarr;{" "}
                {o.ruta?.destinoDistrito || o.ruta?.destinoDepartamento || "Destino"}
              </span>
              <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                {o.ruta?.distanciaEstimadaKm ? `${o.ruta.distanciaEstimadaKm} km` : ""}{" "}
                {o.ruta?.codigoRuta ? `(${o.ruta.codigoRuta})` : ""}
              </span>
            </div>
          );
        },
      },
      {
        id: "configuracion",
        header: "Configuración T3S3",
        cell: ({ row }) => {
          const o = row.original;
          return (
            <div className="whitespace-nowrap">
              <div className="flex items-center gap-1.5 font-mono">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 text-[11px] font-bold">
                  {o.unidad?.placa || "S/T"}
                </span>
                <span className="text-slate-500">+</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                  {o.semirremolque?.placa || "S/C"}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {o.conductor
                  ? `${o.conductor.apellidos}, ${o.conductor.nombres.charAt(0)}.`
                  : "Sin asignar"}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "descripcionCarga",
        header: "Carga & Peso",
        cell: ({ row }) => {
          const o = row.original;
          return (
            <div className="min-w-[130px] max-w-[190px]">
              <span
                className="text-slate-200 block break-words whitespace-normal leading-tight font-medium"
                title={o.descripcionCarga}
              >
                {o.descripcionCarga}
              </span>
              <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                {(parseFloat(String(o.pesoBrutoKg)) / 1000).toFixed(1)} Tn ({o.tipoCarga})
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "fletePactadoMonto",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Flete & SPOT" />
        ),
        sortingFn: (rowA, rowB) => {
          const a = parseFloat(rowA.original.fletePactadoMonto) || 0;
          const b = parseFloat(rowB.original.fletePactadoMonto) || 0;
          return a - b;
        },
        cell: ({ row }) => {
          const o = row.original;
          return (
            <div className="whitespace-nowrap font-mono">
              <span className="font-bold text-white block">
                {o.fletePactadoMoneda === "USD" ? "$" : "S/"}{" "}
                {parseFloat(o.fletePactadoMonto).toLocaleString("es-PE", {
                  minimumFractionDigits: 2,
                })}
              </span>
              {o.detraccionMonto && (
                <span className="text-[10px] text-amber-400 block">
                  SPOT 4%: S/ {parseFloat(o.detraccionMonto).toFixed(2)}
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: "documentos",
        header: "Docs Electrónicos",
        cell: ({ row }) => {
          const o = row.original;
          return (
            <div className="whitespace-nowrap space-y-1">
              {o.guias && o.guias.length > 0 ? (
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px] border border-emerald-500/20 block w-fit">
                  GRE: {o.guias[0].serie}-{String(o.guias[0].numeroCorrelativo).padStart(6, "0")}
                </span>
              ) : (
                <span className="text-[10px] text-slate-500 font-mono block">
                  Sin GRE
                </span>
              )}
              {o.comprobantes && o.comprobantes.length > 0 ? (
                <span className="px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 font-mono text-[10px] border border-sky-500/20 block w-fit">
                  FT: {o.comprobantes[0].serie}-{String(o.comprobantes[0].numeroCorrelativo).padStart(6, "0")}
                </span>
              ) : (
                <span className="text-[10px] text-amber-500/70 font-mono block">
                  Sin Facturar
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "estado",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Estado" />
        ),
        cell: ({ row }) => getEstadoBadge(row.original.estado),
      },
      {
        id: "acciones",
        header: () => <div className="text-right">Acciones</div>,
        cell: ({ row }) => {
          const orden = row.original;
          const isOperative =
            orden.estado !== "liquidado" &&
            orden.estado !== "facturado" &&
            orden.estado !== "cancelado";

          return (
            <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
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

              {isOperative && (
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

              {isOperative && (
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
          );
        },
      },
    ],
    [clientes, rutas, unidades, semirremolques, conductores, isPending]
  );

  return (
    <DataTable
      columns={columns}
      data={filteredData}
      searchPlaceholder="Buscar por OS, cliente, placa, conductor..."
      initialPageSize={10}
      toolbarLeft={
        <div className="flex items-center gap-2">
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

          <span className="text-xs text-slate-500 hidden sm:inline">
            ({filteredData.length} de {ordenes.length})
          </span>
        </div>
      }
      emptyTitle="No se encontraron órdenes de servicio"
      emptyDescription="Prueba cambiando los filtros de búsqueda o programa una nueva orden de servicio."
      emptyIcon={ClipboardList}
    />
  );
}

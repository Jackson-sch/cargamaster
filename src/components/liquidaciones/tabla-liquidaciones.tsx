"use client";

import { useState, useTransition } from "react";
import { Wallet, Search, CheckCircle2, DollarSign, Trash2, Clock, Check } from "lucide-react";
import { ModalEditarLiquidacion } from "./modal-editar-liquidacion";
import {
  cambiarEstadoLiquidacionAction,
  pagarLiquidacionAction,
  eliminarLiquidacionAction,
} from "@/lib/actions/liquidaciones";
import { toast } from "sonner";

export interface LiquidacionRow {
  id: string;
  fleteBase: string;
  bonoPuntualidad: string;
  viaticosAsignados: string;
  gastosPeajesDeclarados: string;
  gastosCocheraDeclarados: string;
  otrosGastos: string;
  saldoAFavorConductor: string;
  saldoAFavorEmpresa: string;
  estado: "pendiente_rendicion" | "aprobado" | "pagado";
  observaciones?: string | null;
  conductor?: {
    nombres: string;
    apellidos: string;
    numeroDocumento?: string | null;
  } | null;
  ordenServicio?: {
    id: string;
    codigoViaje: string;
    ruta?: {
      codigoRuta: string;
      nombre: string;
    } | null;
    cliente?: {
      razonSocial: string;
    } | null;
  } | null;
}

interface TablaLiquidacionesProps {
  liquidaciones: LiquidacionRow[];
}

export function TablaLiquidaciones({ liquidaciones }: TablaLiquidacionesProps) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"todos" | "aprobado" | "pagado" | "pendiente_rendicion">("todos");
  const [isPending, startTransition] = useTransition();

  const liquidacionesFiltradas = liquidaciones.filter((l) => {
    const q = busqueda.toLowerCase();
    const codigo = l.ordenServicio?.codigoViaje?.toLowerCase() || "";
    const chofer = l.conductor ? `${l.conductor.nombres} ${l.conductor.apellidos}`.toLowerCase() : "";
    const dni = l.conductor?.numeroDocumento?.toLowerCase() || "";
    const cliente = l.ordenServicio?.cliente?.razonSocial?.toLowerCase() || "";

    const matchBusqueda =
      codigo.includes(q) || chofer.includes(q) || dni.includes(q) || cliente.includes(q);

    const matchEstado = filtroEstado === "todos" ? true : l.estado === filtroEstado;

    return matchBusqueda && matchEstado;
  });

  const handlePagar = (l: LiquidacionRow) => {
    startTransition(async () => {
      const res = await pagarLiquidacionAction(l.id);
      if (res.success) {
        toast.success(`Liquidación del viaje ${l.ordenServicio?.codigoViaje} marcada como pagada.`);
      } else {
        toast.error(res.error || "No se pudo actualizar a pagado.");
      }
    });
  };

  const handleRevertir = (l: LiquidacionRow) => {
    startTransition(async () => {
      const res = await cambiarEstadoLiquidacionAction({
        id: l.id,
        estado: "aprobado",
      });
      if (res.success) {
        toast.success(`Liquidación revertida a estado aprobado.`);
      } else {
        toast.error(res.error || "No se pudo revertir el estado.");
      }
    });
  };

  const handleEliminar = (l: LiquidacionRow) => {
    if (!confirm(`¿Estás seguro de eliminar la liquidación del viaje ${l.ordenServicio?.codigoViaje}? El viaje volverá a estado "entregado".`)) return;

    startTransition(async () => {
      const res = await eliminarLiquidacionAction(l.id);
      if (res.success) {
        toast.success(res.message || "Liquidación eliminada.");
      } else {
        toast.error(res.error || "No se pudo eliminar la liquidación.");
      }
    });
  };

  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden shadow-xl space-y-0">
      {/* Filters Bar */}
      <div className="p-4 border-b border-[#1F2937] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0B1220]">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-semibold text-slate-300">
            {liquidacionesFiltradas.length} de {liquidaciones.length} liquidaciones registradas
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por OS, conductor o cliente..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded pl-8 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as any)}
            className="h-8 bg-[#111827] border border-[#1F2937] rounded px-2.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="todos">Todos los Estados</option>
            <option value="aprobado">🔵 Aprobado</option>
            <option value="pagado">🟢 Pagado</option>
            <option value="pendiente_rendicion">⚪ Pendiente</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#0B1220] text-slate-400 uppercase tracking-wider text-[10px] border-b border-[#1F2937]">
            <tr>
              <th className="px-4 py-3 font-semibold">Viaje (OS)</th>
              <th className="px-4 py-3 font-semibold">Conductor</th>
              <th className="px-4 py-3 font-semibold">Flete Base</th>
              <th className="px-4 py-3 font-semibold">Anticipo Viáticos</th>
              <th className="px-4 py-3 font-semibold">Peajes Rendidos</th>
              <th className="px-4 py-3 font-semibold">Cochera / Otros</th>
              <th className="px-4 py-3 font-semibold">Balance Liquidación</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2937]">
            {liquidacionesFiltradas.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                  <Wallet className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                  <p className="font-semibold">No se encontraron liquidaciones de viaje.</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Prueba cambiando los filtros de búsqueda o registra una nueva liquidación de conductor.
                  </p>
                </td>
              </tr>
            ) : (
              liquidacionesFiltradas.map((l) => {
                const choferNombre = l.conductor ? `${l.conductor.nombres} ${l.conductor.apellidos}` : "N/A";
                const saldoChofer = parseFloat(l.saldoAFavorConductor || "0");
                const saldoEmpresa = parseFloat(l.saldoAFavorEmpresa || "0");

                return (
                  <tr key={l.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3.5 font-mono whitespace-nowrap">
                      <span className="font-bold text-amber-400 block">
                        {l.ordenServicio?.codigoViaje || "OS-General"}
                      </span>
                      <span className="text-[10px] text-slate-400 block max-w-[140px] truncate">
                        {l.ordenServicio?.cliente?.razonSocial || l.ordenServicio?.ruta?.nombre || ""}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="text-slate-200 font-medium block">
                        {choferNombre}
                      </span>
                      {l.conductor?.numeroDocumento && (
                        <span className="text-[10px] text-slate-500 font-mono block">
                          DNI {l.conductor.numeroDocumento}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 font-mono text-slate-300 whitespace-nowrap">
                      S/ {parseFloat(l.fleteBase || "0").toFixed(2)}
                    </td>

                    <td className="px-4 py-3.5 font-mono text-slate-300 whitespace-nowrap">
                      S/ {parseFloat(l.viaticosAsignados || "0").toFixed(2)}
                    </td>

                    <td className="px-4 py-3.5 font-mono text-amber-400 font-semibold whitespace-nowrap">
                      S/ {parseFloat(l.gastosPeajesDeclarados || "0").toFixed(2)}
                    </td>

                    <td className="px-4 py-3.5 font-mono text-slate-300 whitespace-nowrap">
                      S/ {(parseFloat(l.gastosCocheraDeclarados || "0") + parseFloat(l.otrosGastos || "0")).toFixed(2)}
                    </td>

                    <td className="px-4 py-3.5 font-mono whitespace-nowrap">
                      {saldoChofer > 0 ? (
                        <span className="font-bold text-emerald-400 block">
                          + S/ {saldoChofer.toFixed(2)}
                          <span className="text-[10px] font-normal text-slate-400 block font-sans">
                            A favor del Chofer
                          </span>
                        </span>
                      ) : saldoEmpresa > 0 ? (
                        <span className="font-bold text-indigo-400 block">
                          - S/ {saldoEmpresa.toFixed(2)}
                          <span className="text-[10px] font-normal text-slate-400 block font-sans">
                            A devolver a Empresa
                          </span>
                        </span>
                      ) : (
                        <span className="font-bold text-slate-400">S/ 0.00 (Equilibrado)</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {l.estado === "pagado" ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="h-3 w-3" /> Pagado
                        </span>
                      ) : l.estado === "aprobado" ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center gap-1 w-fit">
                          <Clock className="h-3 w-3" /> Aprobado
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1 w-fit">
                          Pendiente
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <ModalEditarLiquidacion
                          liquidacion={{
                            id: l.id,
                            codigoViaje: l.ordenServicio?.codigoViaje || "OS",
                            conductorNombre: choferNombre,
                            viaticosAsignados: l.viaticosAsignados,
                            bonoPuntualidad: l.bonoPuntualidad,
                            gastosPeajesDeclarados: l.gastosPeajesDeclarados,
                            gastosCocheraDeclarados: l.gastosCocheraDeclarados,
                            otrosGastos: l.otrosGastos,
                            saldoAFavorConductor: l.saldoAFavorConductor,
                            saldoAFavorEmpresa: l.saldoAFavorEmpresa,
                            observaciones: l.observaciones,
                          }}
                        />

                        {l.estado === "aprobado" && (
                          <button
                            type="button"
                            onClick={() => handlePagar(l)}
                            disabled={isPending}
                            title="Marcar como Pagado"
                            className="p-1.5 rounded bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-700 transition-colors disabled:opacity-30"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        )}

                        {l.estado === "pagado" && (
                          <button
                            type="button"
                            onClick={() => handleRevertir(l)}
                            disabled={isPending}
                            title="Revertir a Aprobado"
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-sky-400 border border-slate-700 transition-colors disabled:opacity-30"
                          >
                            <Clock className="h-3.5 w-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleEliminar(l)}
                          disabled={isPending}
                          title="Eliminar Liquidación"
                          className="p-1.5 rounded bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors disabled:opacity-30"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Wrench, Search, Trash2, Calendar, AlertTriangle } from "lucide-react";
import { ModalCambiarEstadoMantenimiento } from "./modal-cambiar-estado-mantenimiento";
import { ModalEditarMantenimiento } from "./modal-editar-mantenimiento";
import { eliminarMantenimientoAction } from "@/lib/actions/mantenimiento";
import { toast } from "sonner";

export interface MantenimientoRow {
  id: string;
  entidadTipo: "unidad" | "semirremolque";
  entidadId: string;
  placa: string;
  entidadDetalle: string;
  tipo: "preventivo" | "correctivo";
  descripcion: string;
  odometroRegistro?: number | null;
  fechaProgramada: string;
  fechaEjecucion?: string | null;
  taller: "propio" | "tercero";
  nombreTaller: string;
  costoManoObra: string | number;
  costoRepuestos: string | number;
  costoTotal: string;
  estado: "pendiente" | "en_proceso" | "completado" | "cancelado";
  observaciones?: string | null;
}

interface TablaMantenimientoProps {
  mantenimientos: MantenimientoRow[];
}

export function TablaMantenimiento({ mantenimientos }: TablaMantenimientoProps) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "preventivo" | "correctivo">("todos");
  const [filtroEstado, setFiltroEstado] = useState<
    "todos" | "pendiente" | "en_proceso" | "completado" | "cancelado"
  >("todos");
  const [isPending, startTransition] = useTransition();

  const mantenimientosFiltrados = mantenimientos.filter((m) => {
    const query = busqueda.toLowerCase();
    const matchBusqueda =
      m.placa.toLowerCase().includes(query) ||
      m.descripcion.toLowerCase().includes(query) ||
      (m.nombreTaller && m.nombreTaller.toLowerCase().includes(query)) ||
      m.entidadDetalle.toLowerCase().includes(query);

    const matchTipo = filtroTipo === "todos" ? true : m.tipo === filtroTipo;
    const matchEstado = filtroEstado === "todos" ? true : m.estado === filtroEstado;

    return matchBusqueda && matchTipo && matchEstado;
  });

  const handleEliminar = (m: MantenimientoRow) => {
    if (m.estado === "en_proceso") {
      toast.error("No puedes eliminar una orden en taller. Primero cambia su estado o cancela la OT.");
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar la OT de la placa ${m.placa}?`)) return;

    startTransition(async () => {
      const res = await eliminarMantenimientoAction(m.id);
      if (res.success) {
        toast.success(res.message || "Orden de mantenimiento eliminada.");
      } else {
        toast.error(res.error || "No se pudo eliminar la orden de mantenimiento.");
      }
    });
  };

  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden shadow-xl space-y-0">
      {/* Filters Bar */}
      <div className="p-4 border-b border-[#1F2937] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0B1220]">
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-semibold text-slate-300">
            {mantenimientosFiltrados.length} de {mantenimientos.length} órdenes registradas
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por placa, taller o avería..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded pl-8 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as any)}
            className="h-8 bg-[#111827] border border-[#1F2937] rounded px-2.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="todos">Todos los Tipos</option>
            <option value="preventivo">Preventivos</option>
            <option value="correctivo">Correctivos</option>
          </select>

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as any)}
            className="h-8 bg-[#111827] border border-[#1F2937] rounded px-2.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="todos">Todos los Estados</option>
            <option value="en_proceso">🟡 En Taller</option>
            <option value="pendiente">🔵 Programados</option>
            <option value="completado">🟢 Completados</option>
            <option value="cancelado">⚪ Cancelados</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#0B1220] text-slate-400 uppercase tracking-wider text-[10px] border-b border-[#1F2937]">
            <tr>
              <th className="px-4 py-3 font-semibold">Equipo</th>
              <th className="px-4 py-3 font-semibold">Tipo</th>
              <th className="px-4 py-3 font-semibold">Descripción del Servicio</th>
              <th className="px-4 py-3 font-semibold">Taller</th>
              <th className="px-4 py-3 font-semibold">Fecha Prog.</th>
              <th className="px-4 py-3 font-semibold">Presupuesto (S/)</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2937]">
            {mantenimientosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                  <Wrench className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                  <p className="font-semibold">No se encontraron órdenes de trabajo.</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Prueba cambiando los filtros de búsqueda o registra una nueva intervención.
                  </p>
                </td>
              </tr>
            ) : (
              mantenimientosFiltrados.map((m) => (
                <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="font-mono font-bold text-white block">
                      {m.placa}
                    </span>
                    <span className="text-[10px] text-slate-400 block max-w-[160px] truncate">
                      {m.entidadDetalle}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        m.tipo === "preventivo"
                          ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {m.tipo}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 max-w-[260px]">
                    <span className="text-slate-200 font-medium line-clamp-2">
                      {m.descripcion}
                    </span>
                    {m.odometroRegistro && (
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                        Odóm: {Number(m.odometroRegistro).toLocaleString()} km
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 text-slate-300">
                    <span className="block font-medium">
                      {m.nombreTaller || (m.taller === "propio" ? "Taller Propio" : "Taller Externo")}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">
                      {m.taller}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-slate-300 whitespace-nowrap font-mono">
                    {m.fechaProgramada}
                    {m.fechaEjecucion && (
                      <span className="block text-[10px] text-emerald-400 font-sans">
                        Ejecutado: {m.fechaEjecucion}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 font-mono font-bold text-amber-300 whitespace-nowrap">
                    S/ {parseFloat(m.costoTotal || "0").toFixed(2)}
                    <span className="block text-[10px] text-slate-500 font-normal font-sans">
                      MO: S/ {parseFloat(m.costoManoObra?.toString() || "0").toFixed(0)} | Rep: S/ {parseFloat(m.costoRepuestos?.toString() || "0").toFixed(0)}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {m.estado === "completado" ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        Completado
                      </span>
                    ) : m.estado === "en_proceso" ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        En Taller
                      </span>
                    ) : m.estado === "cancelado" ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase bg-slate-800 text-slate-400 border border-slate-700">
                        Cancelado
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase bg-sky-500/15 text-sky-400 border border-sky-500/30">
                        Programado
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <ModalEditarMantenimiento mantenimiento={m} />
                      <ModalCambiarEstadoMantenimiento
                        mantenimiento={{
                          id: m.id,
                          placa: m.placa,
                          entidadTipo: m.entidadTipo,
                          tipo: m.tipo,
                          descripcion: m.descripcion,
                          taller: m.taller,
                          nombreTaller: m.nombreTaller,
                          fechaProgramada: m.fechaProgramada,
                          costoTotal: m.costoTotal,
                          estado: m.estado,
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleEliminar(m)}
                        disabled={isPending || m.estado === "en_proceso"}
                        title={
                          m.estado === "en_proceso"
                            ? "No se puede eliminar en taller"
                            : "Eliminar Orden de Trabajo"
                        }
                        className="p-1.5 rounded bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors disabled:opacity-30 disabled:hover:text-slate-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

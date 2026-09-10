"use client";

import { useState, useTransition } from "react";
import {
  Layers,
  Search,
  Wrench,
  PowerOff,
  RefreshCw,
} from "lucide-react";
import { ModalEditarSemirremolque } from "./modal-editar-semirremolque";
import { cambiarEstadoSemirremolqueAction, darDeBajaSemirremolqueAction } from "@/lib/actions/flota";
import { toast } from "sonner";

interface SemirremolqueItem {
  id: string;
  placa: string;
  tipoCarroceria:
    | "plataforma"
    | "cama_baja"
    | "cisterna"
    | "furgon"
    | "tolva_granelera"
    | "portacontenedor";
  marca?: string | null;
  anioFabricacion?: number | null;
  ejes: number;
  pesoNetoTn?: string | null;
  cargaUtilMaxTn: string;
  volumenM3?: string | null;
  estado: "disponible" | "acoplado" | "mantenimiento" | "inactivo";
  activo: boolean;
}

interface TablaSemirremolquesProps {
  semirremolques: SemirremolqueItem[];
}

export function TablaSemirremolques({ semirremolques }: TablaSemirremolquesProps) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [isPending, startTransition] = useTransition();

  const semirremolquesFiltrados = semirremolques.filter((s) => {
    const matchBusqueda =
      s.placa.toLowerCase().includes(busqueda.toLowerCase()) ||
      s.tipoCarroceria.toLowerCase().includes(busqueda.toLowerCase()) ||
      (s.marca && s.marca.toLowerCase().includes(busqueda.toLowerCase()));

    const matchEstado =
      filtroEstado === "todos"
        ? true
        : filtroEstado === "activos"
        ? s.activo && s.estado !== "inactivo"
        : s.estado === filtroEstado;

    return matchBusqueda && matchEstado;
  });

  const handleToggleMantenimiento = (s: SemirremolqueItem) => {
    const nuevoEstado = s.estado === "mantenimiento" ? "disponible" : "mantenimiento";
    startTransition(async () => {
      const res = await cambiarEstadoSemirremolqueAction(s.id, nuevoEstado);
      if (res.success) {
        toast.success(
          `Semirremolque ${s.placa} ${
            nuevoEstado === "mantenimiento" ? "enviado a taller" : "marcado como disponible"
          }.`
        );
      } else {
        toast.error(res.error || "No se pudo cambiar el estado.");
      }
    });
  };

  const handleBaja = (s: SemirremolqueItem) => {
    if (
      !confirm(
        `¿Seguro que deseas dar de baja el semirremolque ${s.placa}? Si está acoplado, se desacoplará automáticamente.`
      )
    ) {
      return;
    }
    startTransition(async () => {
      const res = await darDeBajaSemirremolqueAction(s.id);
      if (res.success) {
        toast.success(`Semirremolque ${s.placa} dado de baja exitosamente.`);
      } else {
        toast.error(res.error || "No se pudo dar de baja el semirremolque.");
      }
    });
  };

  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden">
      {/* Header & Filters */}
      <div className="p-4 border-b border-[#1F2937] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
            Semirremolques y Carretas de Carga
          </h2>
          <span className="text-xs text-slate-400">
            ({semirremolquesFiltrados.length} de {semirremolques.length})
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-48">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar carreta..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full h-8 bg-[#0B1220] border border-[#1F2937] rounded pl-8 pr-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="h-8 bg-[#0B1220] border border-[#1F2937] rounded px-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="todos">Todos los Estados</option>
            <option value="disponible">🔵 Disponibles</option>
            <option value="acoplado">🟡 Acoplados</option>
            <option value="mantenimiento">🟠 En Taller</option>
            <option value="inactivo">🔴 Inactivos / Baja</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#0B1220] text-slate-400 uppercase tracking-wider text-[10px] border-b border-[#1F2937]">
            <tr>
              <th className="px-4 py-3 font-semibold">Placa Carreta</th>
              <th className="px-4 py-3 font-semibold">Tipo de Carrocería</th>
              <th className="px-4 py-3 font-semibold">Fabricante</th>
              <th className="px-4 py-3 font-semibold">Ejes</th>
              <th className="px-4 py-3 font-semibold">Carga Útil Máxima</th>
              <th className="px-4 py-3 font-semibold">Volumen (m³)</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2937]">
            {semirremolquesFiltrados.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-slate-500">
                  No se encontraron semirremolques con los filtros actuales.
                </td>
              </tr>
            ) : (
              semirremolquesFiltrados.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-white text-sm">
                    {s.placa}
                  </td>
                  <td className="px-4 py-3 text-slate-200 font-medium capitalize">
                    {s.tipoCarroceria.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{s.marca || "—"}</td>
                  <td className="px-4 py-3 font-mono text-slate-300">{s.ejes} ejes</td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-200">
                    {s.cargaUtilMaxTn} Tn
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-300">
                    {s.volumenM3 ? `${s.volumenM3} m³` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {s.estado === "acoplado" ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        Acoplado
                      </span>
                    ) : s.estado === "mantenimiento" ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-orange-500/15 text-orange-400 border border-orange-500/30">
                        Taller
                      </span>
                    ) : s.estado === "inactivo" ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-rose-500/15 text-rose-400 border border-rose-500/30">
                        De Baja
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-blue-500/15 text-blue-400 border border-blue-500/30">
                        Disponible
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <ModalEditarSemirremolque semirremolque={s} />
                      {s.estado !== "inactivo" && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleToggleMantenimiento(s)}
                            disabled={isPending || s.estado === "acoplado"}
                            title={
                              s.estado === "acoplado"
                                ? "Desacople primero para enviar a taller"
                                : s.estado === "mantenimiento"
                                ? "Retornar a Disponible"
                                : "Enviar a Taller"
                            }
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            {s.estado === "mantenimiento" ? (
                              <RefreshCw className="h-3.5 w-3.5 text-blue-400" />
                            ) : (
                              <Wrench className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBaja(s)}
                            disabled={isPending}
                            title="Dar de Baja"
                            className="p-1.5 rounded bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors disabled:opacity-50"
                          >
                            <PowerOff className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
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

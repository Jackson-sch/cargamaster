"use client";

import { useState, useTransition } from "react";
import {
  Truck,
  Search,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  PowerOff,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { ModalEditarUnidad } from "./modal-editar-unidad";
import { cambiarEstadoUnidadAction, darDeBajaUnidadAction } from "@/lib/actions/flota";
import { toast } from "sonner";

interface UnidadItem {
  id: string;
  placa: string;
  tipoUnidad: "tracto" | "rigido" | "camioneta";
  marca: string;
  modelo: string;
  anioFabricacion: number;
  color?: string | null;
  vinChasis?: string | null;
  numeroMotor?: string | null;
  ejes: number;
  capacidadArrastreTn?: string | null;
  pesoSecoTn?: string | null;
  tipoCombustible: "diesel_b5" | "gnv" | "glp";
  odometroActualKm: number;
  idDispositivoGps?: string | null;
  estado: "disponible" | "en_ruta" | "mantenimiento" | "inactivo";
  activo: boolean;
  acoplamientos?: Array<{
    id: string;
    semirremolqueId: string;
    activo: boolean;
  }>;
}

interface SemirremolqueRef {
  id: string;
  placa: string;
  tipoCarroceria: string;
}

interface DocumentoRef {
  id: string;
  entidadTipo: string;
  entidadId: string;
  estadoAlerta: string;
}

interface TablaUnidadesProps {
  unidades: UnidadItem[];
  semirremolques: SemirremolqueRef[];
  documentos: DocumentoRef[];
}

export function TablaUnidades({ unidades, semirremolques, documentos }: TablaUnidadesProps) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [isPending, startTransition] = useTransition();

  const getDocumentosInfo = (unidadId: string) => {
    const docs = documentos.filter(
      (d) => d.entidadTipo === "unidad" && d.entidadId === unidadId
    );
    const hasExpired = docs.some((d) => d.estadoAlerta === "vencido");
    const hasWarning = docs.some((d) => d.estadoAlerta === "por_vencer");

    if (hasExpired) {
      return { label: "Doc. Vencido", variant: "destructive" as const };
    }
    if (hasWarning) {
      return { label: "Por Vencer", variant: "warning" as const };
    }
    return { label: "Al día", variant: "success" as const };
  };

  const unidadesFiltradas = unidades.filter((u) => {
    const matchBusqueda =
      u.placa.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.marca.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.modelo.toLowerCase().includes(busqueda.toLowerCase());

    const matchEstado =
      filtroEstado === "todos"
        ? true
        : filtroEstado === "activos"
        ? u.activo && u.estado !== "inactivo"
        : u.estado === filtroEstado;

    return matchBusqueda && matchEstado;
  });

  const handleToggleMantenimiento = (u: UnidadItem) => {
    const nuevoEstado = u.estado === "mantenimiento" ? "disponible" : "mantenimiento";
    startTransition(async () => {
      const res = await cambiarEstadoUnidadAction(u.id, nuevoEstado);
      if (res.success) {
        toast.success(
          `Unidad ${u.placa} ${
            nuevoEstado === "mantenimiento" ? "enviada a taller" : "marcada como disponible"
          }.`
        );
      } else {
        toast.error(res.error || "No se pudo cambiar el estado.");
      }
    });
  };

  const handleBaja = (u: UnidadItem) => {
    if (
      !confirm(
        `¿Seguro que deseas dar de baja la unidad ${u.placa}? Si tiene acople activo, se desacoplará automáticamente.`
      )
    ) {
      return;
    }
    startTransition(async () => {
      const res = await darDeBajaUnidadAction(u.id);
      if (res.success) {
        toast.success(`Unidad ${u.placa} dada de baja exitosamente.`);
      } else {
        toast.error(res.error || "No se pudo dar de baja la unidad.");
      }
    });
  };

  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden">
      {/* Header & Filters */}
      <div className="p-4 border-b border-[#1F2937] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
            Tracto-Camiones y Rígidos
          </h2>
          <span className="text-xs text-slate-400">
            ({unidadesFiltradas.length} de {unidades.length})
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Filter */}
          <div className="relative w-48">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar unidad..."
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
            <option value="en_ruta">🟢 En Ruta</option>
            <option value="mantenimiento">🟡 En Taller</option>
            <option value="inactivo">🔴 Inactivos / Baja</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#0B1220] text-slate-400 uppercase tracking-wider text-[10px] border-b border-[#1F2937]">
            <tr>
              <th className="px-4 py-3 font-semibold">Placa MTC</th>
              <th className="px-4 py-3 font-semibold">Marca & Modelo</th>
              <th className="px-4 py-3 font-semibold">Año / Ejes</th>
              <th className="px-4 py-3 font-semibold">Cap. Arrastre</th>
              <th className="px-4 py-3 font-semibold">Odómetro Actual</th>
              <th className="px-4 py-3 font-semibold">Semirremolque</th>
              <th className="px-4 py-3 font-semibold">Vigencias MTC</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2937]">
            {unidadesFiltradas.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-6 text-center text-slate-500">
                  No se encontraron tracto-camiones con los filtros actuales.
                </td>
              </tr>
            ) : (
              unidadesFiltradas.map((u) => {
                const acopleActivo = u.acoplamientos?.[0];
                const carreta = acopleActivo
                  ? semirremolques.find((s) => s.id === acopleActivo.semirremolqueId)
                  : null;
                const docInfo = getDocumentosInfo(u.id);

                return (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-white text-sm">
                      {u.placa}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-200 block">{u.marca}</span>
                      <span className="text-[11px] text-slate-400">{u.modelo}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {u.anioFabricacion} · <span className="font-mono">{u.ejes} ejes</span>
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-slate-200">
                      {u.capacidadArrastreTn || 0} Tn
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300">
                      {u.odometroActualKm?.toLocaleString()} km
                    </td>
                    <td className="px-4 py-3">
                      {carreta ? (
                        <div>
                          <span className="font-mono font-bold text-amber-400">
                            {carreta.placa}
                          </span>{" "}
                          <span className="text-slate-400 text-[10px]">
                            ({carreta.tipoCarroceria})
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Sin acople</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {docInfo.variant === "warning" ? (
                        <span className="text-amber-400 font-semibold flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> {docInfo.label}
                        </span>
                      ) : docInfo.variant === "destructive" ? (
                        <span className="text-rose-400 font-bold flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> {docInfo.label}
                        </span>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="h-3 w-3" /> {docInfo.label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.estado === "en_ruta" ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          En Ruta
                        </span>
                      ) : u.estado === "mantenimiento" ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          Taller
                        </span>
                      ) : u.estado === "inactivo" ? (
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
                        <ModalEditarUnidad unidad={u} />
                        {u.estado !== "inactivo" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleToggleMantenimiento(u)}
                              disabled={isPending}
                              title={
                                u.estado === "mantenimiento"
                                  ? "Retornar a Disponible"
                                  : "Enviar a Taller"
                              }
                              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors disabled:opacity-50"
                            >
                              {u.estado === "mantenimiento" ? (
                                <RefreshCw className="h-3.5 w-3.5 text-blue-400" />
                              ) : (
                                <Wrench className="h-3.5 w-3.5" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleBaja(u)}
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
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

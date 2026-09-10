"use client";

import { useState, useTransition } from "react";
import { Fuel, Search, Trash2 } from "lucide-react";
import { ModalEditarConsumo } from "./modal-editar-consumo";
import { eliminarConsumoCombustibleAction } from "@/lib/actions/combustible";
import { toast } from "sonner";

export interface ConsumoRow {
  id: string;
  unidadId: string;
  conductorId: string;
  ordenServicioId?: string | null;
  grifoNombre: string;
  grifoRuc?: string | null;
  numeroValeComprobante: string;
  galonesCargados: string;
  precioPorGalon: string;
  totalMonto: string;
  odometroAlCargar: number;
  rendimientoKmGalonCalculado?: string | null;
  fotoTicketUrl?: string | null;
  createdAt: Date | string;
  unidad?: {
    placa: string;
    marca: string;
    modelo: string;
  } | null;
  conductor?: {
    nombres: string;
    apellidos: string;
  } | null;
  ordenServicio?: {
    codigoViaje: string;
    ruta?: {
      nombre: string;
    } | null;
    cliente?: {
      razonSocial: string;
    } | null;
  } | null;
}

interface TablaCombustibleProps {
  consumos: ConsumoRow[];
}

export function TablaCombustible({ consumos }: TablaCombustibleProps) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEficiencia, setFiltroEficiencia] = useState<
    "todos" | "optimo" | "sierra" | "elevado" | "sin_ratio"
  >("todos");
  const [isPending, startTransition] = useTransition();

  const consumosFiltrados = consumos.filter((c) => {
    const q = busqueda.toLowerCase();
    const conductorNombre = c.conductor ? `${c.conductor.nombres} ${c.conductor.apellidos}`.toLowerCase() : "";
    const placa = c.unidad?.placa?.toLowerCase() || "";
    const grifo = c.grifoNombre.toLowerCase();
    const vale = c.numeroValeComprobante.toLowerCase();

    const matchBusqueda =
      placa.includes(q) ||
      conductorNombre.includes(q) ||
      grifo.includes(q) ||
      vale.includes(q);

    const ratio = c.rendimientoKmGalonCalculado
      ? parseFloat(c.rendimientoKmGalonCalculado)
      : null;

    let matchEficiencia = true;
    if (filtroEficiencia === "optimo") {
      matchEficiencia = ratio !== null && ratio >= 5.0;
    } else if (filtroEficiencia === "sierra") {
      matchEficiencia = ratio !== null && ratio >= 3.8 && ratio < 5.0;
    } else if (filtroEficiencia === "elevado") {
      matchEficiencia = ratio !== null && ratio < 3.8;
    } else if (filtroEficiencia === "sin_ratio") {
      matchEficiencia = ratio === null;
    }

    return matchBusqueda && matchEficiencia;
  });

  const handleEliminar = (c: ConsumoRow) => {
    if (!confirm(`¿Estás seguro de anular el vale ${c.numeroValeComprobante} de la placa ${c.unidad?.placa || ""}?`)) return;

    startTransition(async () => {
      const res = await eliminarConsumoCombustibleAction(c.id);
      if (res.success) {
        toast.success(res.message || "Vale de combustible eliminado.");
      } else {
        toast.error(res.error || "No se pudo eliminar el vale.");
      }
    });
  };

  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden shadow-xl space-y-0">
      {/* Filters Bar */}
      <div className="p-4 border-b border-[#1F2937] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0B1220]">
        <div className="flex items-center gap-2">
          <Fuel className="h-4 w-4 text-sky-400" />
          <span className="text-xs font-semibold text-slate-300">
            {consumosFiltrados.length} de {consumos.length} vales registrados
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por placa, chofer, grifo o vale..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded pl-8 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <select
            value={filtroEficiencia}
            onChange={(e) => setFiltroEficiencia(e.target.value as any)}
            className="h-8 bg-[#111827] border border-[#1F2937] rounded px-2.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="todos">Todos los Ratios</option>
            <option value="optimo">🟢 Óptimo (≥ 5.0 km/gal)</option>
            <option value="sierra">🟡 Sierra / Exigencia (3.8 - 4.9)</option>
            <option value="elevado">🔴 Sobreconsumo (&lt; 3.8)</option>
            <option value="sin_ratio">⚪ Primer Registro</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#0B1220] text-slate-400 uppercase tracking-wider text-[10px] border-b border-[#1F2937]">
            <tr>
              <th className="px-4 py-3 font-semibold">N° Vale / Factura</th>
              <th className="px-4 py-3 font-semibold">Fecha</th>
              <th className="px-4 py-3 font-semibold">Tracto</th>
              <th className="px-4 py-3 font-semibold">Conductor</th>
              <th className="px-4 py-3 font-semibold">Estación de Servicio</th>
              <th className="px-4 py-3 font-semibold">Odómetro</th>
              <th className="px-4 py-3 font-semibold">Galones</th>
              <th className="px-4 py-3 font-semibold">Precio / Gal</th>
              <th className="px-4 py-3 font-semibold">Monto Total</th>
              <th className="px-4 py-3 font-semibold">Rendimiento Estimado</th>
              <th className="px-4 py-3 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2937]">
            {consumosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-12 text-center text-slate-400">
                  <Fuel className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                  <p className="font-semibold">No se encontraron vales de combustible.</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Prueba cambiando los filtros de búsqueda o registra una nueva carga.
                  </p>
                </td>
              </tr>
            ) : (
              consumosFiltrados.map((c) => {
                const ratio = c.rendimientoKmGalonCalculado
                  ? parseFloat(c.rendimientoKmGalonCalculado)
                  : null;

                return (
                  <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-white whitespace-nowrap">
                      {c.numeroValeComprobante}
                    </td>

                    <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap">
                      {c.createdAt
                        ? new Date(c.createdAt).toLocaleDateString("es-PE", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "—"}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-mono font-bold text-amber-400 block">
                        {c.unidad?.placa || "N/A"}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {c.unidad?.marca} {c.unidad?.modelo}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-200 whitespace-nowrap">
                      {c.conductor
                        ? `${c.conductor.nombres} ${c.conductor.apellidos}`
                        : "N/A"}
                    </td>

                    <td className="px-4 py-3.5 text-slate-300">
                      <span className="block font-medium">{c.grifoNombre}</span>
                      {c.grifoRuc && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          RUC: {c.grifoRuc}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 font-mono text-slate-300 whitespace-nowrap">
                      {c.odometroAlCargar?.toLocaleString()} km
                    </td>

                    <td className="px-4 py-3.5 font-mono font-semibold text-slate-200 whitespace-nowrap">
                      {parseFloat(c.galonesCargados).toFixed(1)} gal
                    </td>

                    <td className="px-4 py-3.5 font-mono text-slate-400 whitespace-nowrap">
                      S/ {parseFloat(c.precioPorGalon).toFixed(2)}
                    </td>

                    <td className="px-4 py-3.5 font-mono font-bold text-amber-300 whitespace-nowrap">
                      S/ {parseFloat(c.totalMonto).toFixed(2)}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {ratio ? (
                        <>
                          <span
                            className={`font-mono font-bold block ${
                              ratio >= 5.0
                                ? "text-emerald-400"
                                : ratio >= 3.8
                                ? "text-amber-400"
                                : "text-rose-400"
                            }`}
                          >
                            {ratio.toFixed(2)} km/gal
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {ratio >= 5.0
                              ? "Óptimo (Costa)"
                              : ratio >= 3.8
                              ? "Exigencia Sierra"
                              : "Sobreconsumo"}
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-500 font-mono text-[11px]">
                          Primer registro
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <ModalEditarConsumo
                          consumo={{
                            id: c.id,
                            placa: c.unidad?.placa || "N/A",
                            conductorNombre: c.conductor ? `${c.conductor.nombres} ${c.conductor.apellidos}` : null,
                            grifoNombre: c.grifoNombre,
                            grifoRuc: c.grifoRuc,
                            numeroValeComprobante: c.numeroValeComprobante,
                            galonesCargados: c.galonesCargados,
                            precioPorGalon: c.precioPorGalon,
                            totalMonto: c.totalMonto,
                            odometroAlCargar: c.odometroAlCargar,
                            fotoTicketUrl: c.fotoTicketUrl,
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleEliminar(c)}
                          disabled={isPending}
                          title="Anular Vale de Combustible"
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

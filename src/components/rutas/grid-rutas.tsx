"use client";

import { useState, useTransition } from "react";
import { Route as RouteIcon, Search, MapPin, Clock, DollarSign, Fuel, PowerOff, CheckCircle2, AlertTriangle } from "lucide-react";
import { ModalEditarRuta } from "./modal-editar-ruta";
import { cambiarEstadoRutaAction, darDeBajaRutaAction } from "@/lib/actions/rutas";
import { toast } from "sonner";

interface RutaItem {
  id: string;
  codigoRuta: string;
  nombre: string;
  origenDepartamento: string;
  origenProvincia: string;
  origenDistrito: string;
  origenUbigeo: string;
  origenDireccion: string;
  destinoDepartamento: string;
  destinoProvincia: string;
  destinoDistrito: string;
  destinoUbigeo: string;
  destinoDireccion: string;
  distanciaEstimadaKm: string;
  tiempoEstimadoHoras: string;
  peajesEstimadosMonto: string;
  galonesEstimados?: string | null;
  activo: boolean;
}

interface GridRutasProps {
  rutas: RutaItem[];
}

export function GridRutas({ rutas }: GridRutasProps) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"todas" | "activas" | "inactivas">("todas");
  const [isPending, startTransition] = useTransition();

  const rutasFiltradas = rutas.filter((r) => {
    const matchBusqueda =
      r.codigoRuta.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.origenDistrito.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.destinoDistrito.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.origenDepartamento.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.destinoDepartamento.toLowerCase().includes(busqueda.toLowerCase());

    const matchEstado =
      filtroEstado === "todas" ? true : filtroEstado === "activas" ? r.activo : !r.activo;

    return matchBusqueda && matchEstado;
  });

  const handleToggleEstado = (r: RutaItem) => {
    startTransition(async () => {
      const res = await cambiarEstadoRutaAction(r.id, !r.activo);
      if (res.success) {
        toast.success(`Ruta ${r.codigoRuta} ${!r.activo ? "activada" : "desactivada"}.`);
      } else {
        toast.error(res.error || "No se pudo cambiar el estado de la ruta.");
      }
    });
  };

  const handleBaja = (r: RutaItem) => {
    if (!confirm(`¿Seguro que deseas dar de baja la ruta ${r.codigoRuta}?`)) return;
    startTransition(async () => {
      const res = await darDeBajaRutaAction(r.id);
      if (res.success) {
        toast.success(`Ruta ${r.codigoRuta} dada de baja.`);
      } else {
        toast.error(res.error || "No se pudo dar de baja la ruta.");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111827] border border-[#1F2937] p-3 rounded-xl">
        <div className="flex items-center gap-2">
          <RouteIcon className="h-4 w-4 text-amber-400" />
          <span className="text-xs text-slate-300 font-semibold">
            {rutasFiltradas.length} de {rutas.length} rutas registradas
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por código, ciudad o nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full h-8 bg-[#0B1220] border border-[#1F2937] rounded pl-8 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as any)}
            className="h-8 bg-[#0B1220] border border-[#1F2937] rounded px-2.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="todas">Todas las Rutas</option>
            <option value="activas">🟢 Activas</option>
            <option value="inactivas">🔴 Inactivas</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rutasFiltradas.length === 0 ? (
          <div className="col-span-2 bg-[#111827] border border-[#1F2937] rounded-xl p-8 text-center text-slate-500 text-xs">
            No se encontraron rutas con los filtros seleccionados.
          </div>
        ) : (
          rutasFiltradas.map((r) => (
            <div
              key={r.id}
              className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 hover:border-slate-700 transition-colors flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                        {r.codigoRuta}
                      </span>
                      {r.activo ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Activa
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          Inactiva
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-white mt-1.5">{r.nombre}</h3>
                  </div>

                  <span className="text-xs font-mono font-bold text-slate-200">
                    {r.distanciaEstimadaKm} km
                  </span>
                </div>

                {/* Itinerary Details */}
                <div className="bg-[#0B1220] border border-[#1F2937] rounded-lg p-3 space-y-2 text-xs mb-3">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-400 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-amber-400" /> Origen:
                    </span>
                    <span className="font-medium text-slate-200">
                      {r.origenDistrito || r.origenProvincia} ({r.origenUbigeo})
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-400 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-emerald-400" /> Destino:
                    </span>
                    <span className="font-medium text-slate-200">
                      {r.destinoDistrito || r.destinoProvincia} ({r.destinoUbigeo})
                    </span>
                  </div>
                </div>

                {/* Operational Metrics Badges */}
                <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                  <div className="bg-[#0B1220] border border-[#1F2937] p-2 rounded flex flex-col">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5 text-slate-400" /> Tiempo
                    </span>
                    <span className="font-mono font-bold text-slate-200 mt-0.5">
                      {r.tiempoEstimadoHoras} hrs
                    </span>
                  </div>

                  <div className="bg-[#0B1220] border border-[#1F2937] p-2 rounded flex flex-col">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <DollarSign className="h-2.5 w-2.5 text-slate-400" /> Peajes
                    </span>
                    <span className="font-mono font-bold text-slate-200 mt-0.5">
                      S/ {parseFloat(r.peajesEstimadosMonto || "0").toFixed(2)}
                    </span>
                  </div>

                  <div className="bg-[#0B1220] border border-[#1F2937] p-2 rounded flex flex-col">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Fuel className="h-2.5 w-2.5 text-slate-400" /> Diesel
                    </span>
                    <span className="font-mono font-bold text-slate-200 mt-0.5">
                      {r.galonesEstimados ? `${r.galonesEstimados} gln` : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#1F2937] flex items-center justify-end gap-2">
                <ModalEditarRuta ruta={r} />
                <button
                  type="button"
                  onClick={() => handleToggleEstado(r)}
                  disabled={isPending}
                  title={r.activo ? "Suspender Ruta" : "Activar Ruta"}
                  className={`p-1.5 rounded text-xs font-semibold border transition-colors ${
                    r.activo
                      ? "bg-slate-800 text-slate-400 hover:text-amber-400 hover:bg-slate-700 border-slate-700"
                      : "bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/60 border-emerald-700"
                  }`}
                >
                  {r.activo ? "Suspender" : "Activar"}
                </button>
                <button
                  type="button"
                  onClick={() => handleBaja(r)}
                  disabled={isPending}
                  title="Dar de Baja"
                  className="p-1.5 rounded bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors disabled:opacity-50"
                >
                  <PowerOff className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

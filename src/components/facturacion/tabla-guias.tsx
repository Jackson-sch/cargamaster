"use client";

import { useState, useMemo } from "react";
import {
  FileText,
  Ban,
  CheckCircle2,
  Search,
  Printer,
  ExternalLink,
} from "lucide-react";
import { ModalVerCpe } from "@/components/facturacion/modal-ver-cpe";
import { ModalAnularComprobante } from "@/components/facturacion/modal-anular-comprobante";

export interface GuiaItem {
  id: string;
  serie: string;
  numeroCorrelativo: number;
  fechaEmision: string;
  fechaInicioTraslado: string;
  estadoSunat: string;
  hashCpe?: string | null;
  qrCode?: string | null;
  sunatTicketId?: string | null;
  ordenServicioId?: string | null;
  ordenServicio?: {
    id?: string;
    codigoViaje: string;
    descripcionCarga?: string | null;
    pesoBrutoKg?: string | number | null;
    cliente?: {
      razonSocial: string;
      numeroDocumento: string;
    } | null;
    unidad?: {
      placa: string;
    } | null;
    conductor?: {
      nombres: string;
      apellidos: string;
      numeroDocumento?: string | null;
    } | null;
    ruta?: {
      origenDistrito?: string | null;
      destinoDistrito?: string | null;
    } | null;
  } | null;
}

interface TablaGuiasProps {
  guias: GuiaItem[];
}

export function TablaGuias({ guias }: TablaGuiasProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroSunat, setFiltroSunat] = useState<"todas" | "aceptado" | "anulado">("todas");

  const totalGuias = guias.length;
  const aceptadasCount = guias.filter((g) => g.estadoSunat !== "anulado").length;
  const anuladasCount = guias.filter((g) => g.estadoSunat === "anulado").length;

  const filtradas = useMemo(() => {
    return guias.filter((g) => {
      // Filtro por estado SUNAT
      if (filtroSunat === "aceptado" && g.estadoSunat === "anulado") return false;
      if (filtroSunat === "anulado" && g.estadoSunat !== "anulado") return false;

      // Filtro por búsqueda
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const correlativo = `${g.serie}-${String(g.numeroCorrelativo).padStart(8, "0")}`.toLowerCase();
      const codigoViaje = (g.ordenServicio?.codigoViaje || "").toLowerCase();
      const clienteNombre = (g.ordenServicio?.cliente?.razonSocial || "").toLowerCase();
      const clienteRuc = (g.ordenServicio?.cliente?.numeroDocumento || "").toLowerCase();
      const placa = (g.ordenServicio?.unidad?.placa || "").toLowerCase();
      const conductor = `${g.ordenServicio?.conductor?.nombres || ""} ${g.ordenServicio?.conductor?.apellidos || ""}`.toLowerCase();

      return (
        correlativo.includes(term) ||
        codigoViaje.includes(term) ||
        clienteNombre.includes(term) ||
        clienteRuc.includes(term) ||
        placa.includes(term) ||
        conductor.includes(term)
      );
    });
  }, [guias, filtroSunat, searchTerm]);

  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden shadow-sm">
      {/* Header & Filtros */}
      <div className="p-4 border-b border-[#1F2937] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
            Guías de Remisión Electrónica - Transportista (SUNAT Tipo 31)
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            ({filtradas.length} de {totalGuias})
          </span>
        </div>

        {/* Buscador y Tabs */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar guía, viaje, placa, chofer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0B1220] border border-[#1F2937] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="flex items-center bg-[#0B1220] p-0.5 rounded-lg border border-[#1F2937] text-xs">
            <button
              onClick={() => setFiltroSunat("todas")}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                filtroSunat === "todas"
                  ? "bg-amber-500 text-slate-950 font-bold shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Todas ({totalGuias})
            </button>
            <button
              onClick={() => setFiltroSunat("aceptado")}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                filtroSunat === "aceptado"
                  ? "bg-emerald-600 text-white font-bold shadow"
                  : "text-emerald-400/80 hover:text-emerald-300"
              }`}
            >
              Aceptadas SUNAT ({aceptadasCount})
            </button>
            <button
              onClick={() => setFiltroSunat("anulado")}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                filtroSunat === "anulado"
                  ? "bg-rose-600 text-white font-bold shadow"
                  : "text-rose-400/80 hover:text-rose-300"
              }`}
            >
              Anuladas ({anuladasCount})
            </button>
          </div>
        </div>
      </div>

      {filtradas.length === 0 ? (
        <div className="p-10 text-center text-slate-500">
          <FileText className="h-8 w-8 mx-auto mb-2 text-slate-600" />
          <p className="text-xs">No se encontraron guías con los criterios seleccionados.</p>
          <p className="text-[11px] text-slate-600 mt-1">
            Intenta cambiar el filtro de búsqueda o el estado SUNAT.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#0B1220] text-slate-400 uppercase tracking-wider text-[10px] border-b border-[#1F2937]">
              <tr>
                <th className="px-4 py-3 font-semibold">Serie - Correlativo</th>
                <th className="px-4 py-3 font-semibold">Fecha Traslado</th>
                <th className="px-4 py-3 font-semibold">Orden de Servicio</th>
                <th className="px-4 py-3 font-semibold">Dador / Remitente</th>
                <th className="px-4 py-3 font-semibold">Tracto</th>
                <th className="px-4 py-3 font-semibold">Conductor MTC</th>
                <th className="px-4 py-3 font-semibold">Hash CPE</th>
                <th className="px-4 py-3 font-semibold">Estado SUNAT</th>
                <th className="px-4 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]">
              {filtradas.map((g) => {
                const ordenId = g.ordenServicio?.id || g.ordenServicioId;

                return (
                  <tr key={g.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-amber-400">
                      {g.serie}-{String(g.numeroCorrelativo).padStart(8, "0")}
                    </td>

                    <td className="px-4 py-3.5 text-slate-300 font-mono">
                      {g.fechaInicioTraslado}
                    </td>

                    <td className="px-4 py-3.5 font-mono text-slate-200">
                      {g.ordenServicio?.codigoViaje}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-slate-200 block truncate max-w-[180px]">
                        {g.ordenServicio?.cliente?.razonSocial}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        RUC {g.ordenServicio?.cliente?.numeroDocumento}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-white font-bold">
                      {g.ordenServicio?.unidad?.placa || "---"}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="text-slate-200 block">
                        {g.ordenServicio?.conductor?.nombres} {g.ordenServicio?.conductor?.apellidos}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-slate-400 text-[11px] truncate max-w-[120px]">
                      {g.hashCpe || "---"}
                    </td>

                    <td className="px-4 py-3.5">
                      {g.estadoSunat === "anulado" ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1 w-fit">
                          <Ban className="h-3 w-3" /> Anulado
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="h-3.5 w-3.5" /> {g.estadoSunat}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Imprimir PDF Oficial GRE-Transportista */}
                        {ordenId && (
                          <a
                            href={`/api/ordenes/${ordenId}/gre-transportista`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 text-purple-300 transition-colors inline-flex items-center gap-1 text-[11px]"
                            title="Descargar PDF Oficial Guía de Remisión Transportista SUNAT"
                          >
                            <Printer className="h-3.5 w-3.5" />
                            <span>PDF SUNAT</span>
                          </a>
                        )}

                        <ModalVerCpe
                          cpe={{
                            tipo: "gre",
                            serieCorrelativo: `${g.serie}-${String(g.numeroCorrelativo).padStart(8, "0")}`,
                            fechaEmision: g.fechaEmision,
                            clienteRuc: g.ordenServicio?.cliente?.numeroDocumento || "",
                            clienteRazonSocial: g.ordenServicio?.cliente?.razonSocial || "",
                            descripcion: g.ordenServicio?.descripcionCarga || "Carga pesada general",
                            placaTracto: g.ordenServicio?.unidad?.placa || undefined,
                            conductorNombre: g.ordenServicio?.conductor
                              ? `${g.ordenServicio.conductor.nombres} ${g.ordenServicio.conductor.apellidos}`
                              : undefined,
                            conductorDni: g.ordenServicio?.conductor?.numeroDocumento || undefined,
                            origen: g.ordenServicio?.ruta?.origenDistrito || undefined,
                            destino: g.ordenServicio?.ruta?.destinoDistrito || undefined,
                            pesoKg: g.ordenServicio?.pesoBrutoKg?.toString() || undefined,
                            hashCpe: g.hashCpe || undefined,
                            qrCode: g.qrCode || undefined,
                            estadoSunat: g.estadoSunat,
                            ticketSunat: g.sunatTicketId || undefined,
                          }}
                        />

                        <ModalAnularComprobante
                          id={g.id}
                          tipo="gre"
                          serieCorrelativo={`${g.serie}-${String(g.numeroCorrelativo).padStart(8, "0")}`}
                          clienteODador={g.ordenServicio?.cliente?.razonSocial || "Dador"}
                          montoOInfo={`Tracto: ${g.ordenServicio?.unidad?.placa || "N/A"}`}
                          yaAnulado={g.estadoSunat === "anulado"}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

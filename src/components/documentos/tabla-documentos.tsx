"use client";

import { useState, useMemo } from "react";
import {
  ShieldCheck,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  AlertTriangle,
  FileCheck2,
  Clock,
  Ban,
  CheckCircle2,
} from "lucide-react";
import { ModalRenovarDocumento } from "@/components/documentos/modal-renovar-documento";
import { eliminarDocumentoVehiculoAction } from "@/lib/actions/documentos";
import { toast } from "sonner";

export interface DocumentoItem {
  id: string;
  tipoDocumento: string;
  entidadTipo: string;
  entidadId: string;
  entidadNombre: string;
  numeroDocumento: string;
  empresaEmisora?: string | null;
  fechaEmision: string;
  fechaVencimiento: string;
  archivoAdjuntoUrl?: string | null;
  diasRestantes: number;
  estadoAlertaCalculado: string;
}

interface TablaDocumentosProps {
  documentos: DocumentoItem[];
}

export function TablaDocumentos({ documentos }: TablaDocumentosProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"todos" | "vigente" | "por_vencer" | "vencido">("todos");
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  const total = documentos.length;
  const vigentesCount = documentos.filter((d) => d.estadoAlertaCalculado === "vigente").length;
  const porVencerCount = documentos.filter((d) => d.estadoAlertaCalculado === "por_vencer").length;
  const vencidosCount = documentos.filter((d) => d.estadoAlertaCalculado === "vencido").length;

  const filtrados = useMemo(() => {
    return documentos.filter((d) => {
      // Filtro por tab de estado
      if (filtroEstado !== "todos" && d.estadoAlertaCalculado !== filtroEstado) {
        return false;
      }

      // Filtro por búsqueda
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const tipo = d.tipoDocumento.replace(/_/g, " ").toLowerCase();
      const entidad = d.entidadNombre.toLowerCase();
      const num = d.numeroDocumento.toLowerCase();
      const emisor = (d.empresaEmisora || "").toLowerCase();

      return (
        tipo.includes(term) ||
        entidad.includes(term) ||
        num.includes(term) ||
        emisor.includes(term)
      );
    });
  }, [documentos, filtroEstado, searchTerm]);

  const handleEliminar = async (id: string, tipo: string) => {
    if (!confirm(`¿Estás seguro de eliminar el documento "${tipo.replace(/_/g, " ").toUpperCase()}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setEliminandoId(id);
    try {
      const res = await eliminarDocumentoVehiculoAction(id);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.error || "No se pudo eliminar el documento.");
      }
    } catch {
      toast.error("Error al eliminar el documento.");
    } finally {
      setEliminandoId(null);
    }
  };

  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden shadow-sm">
      {/* Header & Controls */}
      <div className="p-4 border-b border-[#1F2937] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
            Documentos Vehiculares & Pólizas de Carga
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            ({filtrados.length} de {total})
          </span>
        </div>

        {/* Buscador y Tabs */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar SOAT, placa, póliza..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0B1220] border border-[#1F2937] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="flex items-center bg-[#0B1220] p-0.5 rounded-lg border border-[#1F2937] text-xs">
            <button
              onClick={() => setFiltroEstado("todos")}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                filtroEstado === "todos"
                  ? "bg-amber-500 text-slate-950 font-bold shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Todos ({total})
            </button>
            <button
              onClick={() => setFiltroEstado("vigente")}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                filtroEstado === "vigente"
                  ? "bg-emerald-600 text-white font-bold shadow"
                  : "text-emerald-400/80 hover:text-emerald-300"
              }`}
            >
              Vigentes ({vigentesCount})
            </button>
            <button
              onClick={() => setFiltroEstado("por_vencer")}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                filtroEstado === "por_vencer"
                  ? "bg-amber-600 text-white font-bold shadow"
                  : "text-amber-400/80 hover:text-amber-300"
              }`}
            >
              Por Vencer ({porVencerCount})
            </button>
            <button
              onClick={() => setFiltroEstado("vencido")}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                filtroEstado === "vencido"
                  ? "bg-rose-600 text-white font-bold shadow"
                  : "text-rose-400/80 hover:text-rose-300"
              }`}
            >
              Vencidos ({vencidosCount})
            </button>
          </div>
        </div>
      </div>

      {filtrados.length === 0 ? (
        <div className="p-10 text-center text-slate-500">
          <FileCheck2 className="h-8 w-8 mx-auto mb-2 text-slate-600" />
          <p className="text-xs">No se encontraron documentos con los filtros seleccionados.</p>
          <p className="text-[11px] text-slate-600 mt-1">
            Intenta cambiar el criterio de búsqueda o el estado de vigencia.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#0B1220] text-slate-400 uppercase tracking-wider text-[10px] border-b border-[#1F2937]">
              <tr>
                <th className="px-4 py-3 font-semibold">Tipo de Obligación</th>
                <th className="px-4 py-3 font-semibold">Unidad / Carreta</th>
                <th className="px-4 py-3 font-semibold">N° de Documento</th>
                <th className="px-4 py-3 font-semibold">Emisor</th>
                <th className="px-4 py-3 font-semibold">Fecha Vencimiento</th>
                <th className="px-4 py-3 font-semibold">Días Restantes</th>
                <th className="px-4 py-3 font-semibold">Estado Semáforo</th>
                <th className="px-4 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]">
              {filtrados.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3.5 font-semibold text-white capitalize">
                    {doc.tipoDocumento.replace(/_/g, " ")}
                  </td>

                  <td className="px-4 py-3.5 font-mono text-slate-200 font-bold">
                    {doc.entidadNombre}
                  </td>

                  <td className="px-4 py-3.5 font-mono text-slate-400">
                    {doc.numeroDocumento}
                  </td>

                  <td className="px-4 py-3.5 text-slate-300">
                    {doc.empresaEmisora || "—"}
                  </td>

                  <td className="px-4 py-3.5 text-slate-200 font-mono">
                    {doc.fechaVencimiento}
                  </td>

                  <td className="px-4 py-3.5 font-mono font-bold">
                    {doc.diasRestantes <= 0 ? (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {Math.abs(doc.diasRestantes)} días vencido
                      </span>
                    ) : doc.diasRestantes <= 30 ? (
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {doc.diasRestantes} días
                      </span>
                    ) : (
                      <span className="text-emerald-400">
                        {doc.diasRestantes} días
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3.5">
                    {doc.estadoAlertaCalculado === "vencido" ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1 w-fit">
                        <Ban className="h-3 w-3" /> Vencido
                      </span>
                    ) : doc.estadoAlertaCalculado === "por_vencer" ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1 w-fit">
                        <AlertTriangle className="h-3 w-3" /> Por Vencer
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="h-3 w-3" /> Vigente
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Ver Adjunto Digital si existe */}
                      {doc.archivoAdjuntoUrl && (
                        <a
                          href={doc.archivoAdjuntoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded bg-[#0B1220] border border-slate-700 hover:border-slate-500 text-slate-300 transition-colors inline-flex items-center gap-1 text-[11px]"
                          title="Ver archivo digital del certificado"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>PDF</span>
                        </a>
                      )}

                      {/* Modal Renovar Documento */}
                      <ModalRenovarDocumento
                        id={doc.id}
                        tipoDocumento={doc.tipoDocumento}
                        entidadNombre={doc.entidadNombre}
                        numeroDocumentoActual={doc.numeroDocumento}
                        fechaEmisionActual={doc.fechaEmision}
                        fechaVencimientoActual={doc.fechaVencimiento}
                        empresaEmisoraActual={doc.empresaEmisora}
                      />

                      {/* Botón Eliminar Documento */}
                      <button
                        onClick={() => handleEliminar(doc.id, doc.tipoDocumento)}
                        disabled={eliminandoId === doc.id}
                        className="p-1.5 rounded bg-[#0B1220] border border-[#1F2937] hover:border-rose-500 text-slate-400 hover:text-rose-400 transition-colors inline-flex items-center gap-1 text-[11px] disabled:opacity-50"
                        title="Eliminar registro de documento"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Eliminar</span>
                      </button>
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, X, Loader2, Calendar, FileText, CheckCircle2 } from "lucide-react";
import { renovarDocumentoVehiculoAction } from "@/lib/actions/documentos";
import { toast } from "sonner";

interface ModalRenovarDocumentoProps {
  id: string;
  tipoDocumento: string;
  entidadNombre: string;
  numeroDocumentoActual: string;
  fechaEmisionActual: string;
  fechaVencimientoActual: string;
  empresaEmisoraActual?: string | null;
}

export function ModalRenovarDocumento({
  id,
  tipoDocumento,
  entidadNombre,
  numeroDocumentoActual,
  fechaEmisionActual,
  fechaVencimientoActual,
  empresaEmisoraActual,
}: ModalRenovarDocumentoProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [numeroDocumento, setNumeroDocumento] = useState(numeroDocumentoActual);
  const [empresaEmisora, setEmpresaEmisora] = useState(empresaEmisoraActual || "");
  const [fechaEmision, setFechaEmision] = useState(
    new Date().toISOString().split("T")[0]
  );
  // Por defecto 1 año después
  const defaultNextYear = new Date();
  defaultNextYear.setFullYear(defaultNextYear.getFullYear() + 1);
  const [fechaVencimiento, setFechaVencimiento] = useState(
    defaultNextYear.toISOString().split("T")[0]
  );
  const [archivoAdjuntoUrl, setArchivoAdjuntoUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await renovarDocumentoVehiculoAction({
        id,
        numeroDocumento,
        fechaEmision,
        fechaVencimiento,
        empresaEmisora,
        archivoAdjuntoUrl: archivoAdjuntoUrl || undefined,
      });

      if (res.success) {
        toast.success(res.message || "Documento renovado exitosamente.");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "No se pudo renovar el documento.");
      }
    } catch {
      toast.error("Error al procesar renovación.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 rounded bg-[#0B1220] border border-amber-500/30 hover:border-amber-400 text-amber-300 hover:bg-amber-500/10 transition-colors inline-flex items-center gap-1 text-[11px]"
        title="Renovar vigencia del documento ante MTC / Aseguradora"
      >
        <RefreshCw className="h-3 w-3" />
        <span>Renovar</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[#111827] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden text-left flex flex-col">
            {/* Header */}
            <div className="p-4 bg-[#0B1220] border-b border-[#1F2937] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <RefreshCw className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
                    Renovación de Documento Vehicular
                  </h3>
                  <p className="text-xs text-slate-400">
                    Actualización de póliza, inspección técnica o certificado MTC
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              {/* Info Card */}
              <div className="p-3 rounded-xl bg-[#0B1220] border border-[#1F2937] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Tipo de Obligación:</span>
                  <span className="font-bold text-white uppercase">
                    {tipoDocumento.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Unidad / Carreta:</span>
                  <span className="font-mono font-bold text-amber-400">
                    {entidadNombre}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-[#1F2937]">
                  <span>Vencimiento anterior:</span>
                  <span className="font-mono text-slate-400">{fechaVencimientoActual}</span>
                </div>
              </div>

              {/* Form Inputs */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Nuevo N° de Documento / Póliza / Certificado *
                </label>
                <input
                  type="text"
                  value={numeroDocumento}
                  onChange={(e) => setNumeroDocumento(e.target.value)}
                  placeholder="Ej: POL-2026-981249"
                  className="w-full bg-[#0B1220] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Compañía Emisora / Entidad Certificadora
                </label>
                <input
                  type="text"
                  value={empresaEmisora}
                  onChange={(e) => setEmpresaEmisora(e.target.value)}
                  placeholder="Ej: Rímac Seguros, La Positiva, Farenet, MTC"
                  className="w-full bg-[#0B1220] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Fecha de Emisión *
                  </label>
                  <input
                    type="date"
                    value={fechaEmision}
                    onChange={(e) => setFechaEmision(e.target.value)}
                    className="w-full bg-[#0B1220] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Nueva Fecha de Vencimiento *
                  </label>
                  <input
                    type="date"
                    value={fechaVencimiento}
                    onChange={(e) => setFechaVencimiento(e.target.value)}
                    className="w-full bg-[#0B1220] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Enlace al Certificado Digital o PDF (Opcional)
                </label>
                <input
                  type="url"
                  value={archivoAdjuntoUrl}
                  onChange={(e) => setArchivoAdjuntoUrl(e.target.value)}
                  placeholder="https://almacen.empresa.pe/soat-v7a890.pdf"
                  className="w-full bg-[#0B1220] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-[#1F2937] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Actualizando vigencia...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Confirmar Renovación</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

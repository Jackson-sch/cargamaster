"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, X, Loader2, FileCheck2 } from "lucide-react";
import { registrarEvidenciaPodAction } from "@/lib/actions/ordenes-servicio";
import { toast } from "sonner";

interface ModalEvidenciaPodProps {
  ordenId: string;
  codigoViaje: string;
  onAdded?: () => void;
}

export function ModalEvidenciaPod({
  ordenId,
  codigoViaje,
  onAdded,
}: ModalEvidenciaPodProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [tipoEvidencia, setTipoEvidencia] = useState<
    | "foto_carga"
    | "foto_descarga"
    | "guia_firmada_remitente"
    | "firma_digital_cliente"
    | "incidencia"
  >("guia_firmada_remitente");
  const [archivoUrl, setArchivoUrl] = useState("");
  const [receptorNombre, setReceptorNombre] = useState("");
  const [receptorDni, setReceptorDni] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!archivoUrl) {
      toast.error("Ingresa la URL o identificador del archivo adjunto.");
      return;
    }

    setLoading(true);
    const res = await registrarEvidenciaPodAction({
      ordenServicioId: ordenId,
      tipoEvidencia,
      archivoUrl,
      receptorNombre,
      receptorDni,
      observaciones,
    });
    setLoading(false);

    if (res.success) {
      toast.success("Evidencia de entrega (POD) registrada exitosamente.");
      setOpen(false);
      setArchivoUrl("");
      setReceptorNombre("");
      setReceptorDni("");
      setObservaciones("");
      router.refresh();
      if (onAdded) onAdded();
    } else {
      toast.error(res.error || "No se pudo adjuntar la evidencia.");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-2.5 py-1 rounded bg-[#0B1220] border border-[#1F2937] hover:border-emerald-500 text-slate-300 hover:text-emerald-400 text-xs font-medium flex items-center gap-1 transition-colors"
      >
        <Camera className="h-3 w-3" />
        <span>Subir POD</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#111827] border border-[#1F2937] rounded-xl shadow-2xl overflow-hidden text-left">
            {/* Header */}
            <div className="p-4 bg-[#0E1524] border-b border-[#1F2937] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-emerald-400" />
                <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
                  Adjuntar Evidencia POD: {codigoViaje}
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Tipo de Evidencia / Conformidad *
                  </label>
                  <select
                    value={tipoEvidencia}
                    onChange={(e) => setTipoEvidencia(e.target.value as any)}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="guia_firmada_remitente">
                      Guía de Remisión Firmada y Sellada
                    </option>
                    <option value="foto_descarga">
                      Fotografía de Descarga en Almacén Cliente
                    </option>
                    <option value="foto_carga">
                      Fotografía de Carga y Amarre
                    </option>
                    <option value="firma_digital_cliente">
                      Constancia de Entrega Digital
                    </option>
                    <option value="incidencia">Reporte de Avería o Incidencia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    URL de Imagen o Documento Escaneado *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://... o archivo-pod-001.jpg"
                    value={archivoUrl}
                    onChange={(e) => setArchivoUrl(e.target.value)}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono placeholder:text-slate-600 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Nombre de Receptor en Destino
                    </label>
                    <input
                      type="text"
                      placeholder="Ing. Almacenero"
                      value={receptorNombre}
                      onChange={(e) => setReceptorNombre(e.target.value)}
                      className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      DNI Receptor
                    </label>
                    <input
                      type="text"
                      placeholder="8 dígitos"
                      value={receptorDni}
                      onChange={(e) => setReceptorDni(e.target.value)}
                      className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Notas de Conformidad
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Bultos completos y precinto conforme..."
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    className="w-full bg-[#0B1220] border border-[#1F2937] rounded p-2.5 text-white placeholder:text-slate-600 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-[#1F2937] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-9 px-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !archivoUrl}
                  className="h-9 px-5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Guardar POD</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, FileCheck2, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { registrarDocumentoVehiculoAction } from "@/lib/actions/documentos";
import { toast } from "sonner";

interface ModalNuevoDocumentoProps {
  unidades: Array<{ id: string; placa: string; marca: string }>;
  semirremolques: Array<{ id: string; placa: string; tipoCarroceria: string }>;
  onCreated?: () => void;
}

export function ModalNuevoDocumento({
  unidades,
  semirremolques,
  onCreated,
}: ModalNuevoDocumentoProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    entidadTipo: "unidad" as "unidad" | "semirremolque",
    entidadId: "",
    tipoDocumento: "soat" as
      | "soat"
      | "revision_tecnica"
      | "tarjeta_circulacion_mtc"
      | "permiso_operacion_mtc"
      | "poliza_seguro_carga"
      | "certificacion_pesos_medidas",
    numeroDocumento: "",
    empresaEmisora: "Rímac Seguros",
    fechaEmision: new Date().toISOString().split("T")[0],
    fechaVencimiento: "",
    archivoAdjuntoUrl: "",
  });

  const getDiasCalculados = () => {
    if (!formData.fechaVencimiento) return null;
    const venc = new Date(formData.fechaVencimiento + "T00:00:00");
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return Math.ceil((venc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  };

  const dias = getDiasCalculados();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.entidadId || !formData.fechaVencimiento) {
      toast.error("Completa todos los campos obligatorios.");
      return;
    }

    setLoading(true);
    const res = await registrarDocumentoVehiculoAction(formData);
    setLoading(false);

    if (res.success) {
      toast.success("Documento registrado en el semáforo regulatorio.");
      setOpen(false);
      router.refresh();
      setFormData({
        entidadTipo: "unidad",
        entidadId: "",
        tipoDocumento: "soat",
        numeroDocumento: "",
        empresaEmisora: "Rímac Seguros",
        fechaEmision: new Date().toISOString().split("T")[0],
        fechaVencimiento: "",
        archivoAdjuntoUrl: "",
      });
      if (onCreated) onCreated();
    } else {
      toast.error(res.error || "No se pudo registrar el documento.");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="h-9 px-4 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
      >
        <Plus className="h-4 w-4" />
        <span>Registrar Documento MTC</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#111827] border border-[#1F2937] rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-[#0E1524] border-b border-[#1F2937] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-amber-400" />
                <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
                  Registrar Documento de Vehículo
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Tipo de Entidad *
                    </label>
                    <select
                      value={formData.entidadTipo}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          entidadTipo: e.target.value as any,
                          entidadId: "",
                        })
                      }
                      className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                    >
                      <option value="unidad">Tracto-Camión</option>
                      <option value="semirremolque">Semirremolque</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Vehículo Asociado *
                    </label>
                    <select
                      required
                      value={formData.entidadId}
                      onChange={(e) =>
                        setFormData({ ...formData, entidadId: e.target.value })
                      }
                      className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                    >
                      <option value="">-- Selecciona --</option>
                      {formData.entidadTipo === "unidad"
                        ? unidades.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.placa} ({u.marca})
                            </option>
                          ))
                        : semirremolques.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.placa} ({s.tipoCarroceria})
                            </option>
                          ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Tipo de Documento Obligatorio *
                  </label>
                  <select
                    value={formData.tipoDocumento}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tipoDocumento: e.target.value as any,
                      })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-semibold focus:border-amber-500 focus:outline-none"
                  >
                    <option value="soat">SOAT Vehicular Obligatorio</option>
                    <option value="revision_tecnica">
                      Revisión Técnica Vehicular (CITV)
                    </option>
                    <option value="tarjeta_circulacion_mtc">
                      Tarjeta Única de Circulación (TUC MTC)
                    </option>
                    <option value="permiso_operacion_mtc">
                      Permiso de Operación de Transporte
                    </option>
                    <option value="poliza_seguro_carga">
                      Póliza de Seguro de Carga y Responsabilidad
                    </option>
                    <option value="certificacion_pesos_medidas">
                      Bonificación de Pesos y Medidas MTC
                    </option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      N° de Certificado / Póliza *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. CITV-2026-991"
                      value={formData.numeroDocumento}
                      onChange={(e) =>
                        setFormData({ ...formData, numeroDocumento: e.target.value })
                      }
                      className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Empresa / Centro Emisor
                    </label>
                    <input
                      type="text"
                      placeholder="Lidercon, Rímac, Pacífico..."
                      value={formData.empresaEmisora}
                      onChange={(e) =>
                        setFormData({ ...formData, empresaEmisora: e.target.value })
                      }
                      className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Fecha de Emisión *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.fechaEmision}
                      onChange={(e) =>
                        setFormData({ ...formData, fechaEmision: e.target.value })
                      }
                      className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Fecha de Vencimiento *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.fechaVencimiento}
                      onChange={(e) =>
                        setFormData({ ...formData, fechaVencimiento: e.target.value })
                      }
                      className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Days remaining live preview pill */}
                {dias !== null && (
                  <div className="p-2.5 rounded bg-[#0B1220] border border-[#1F2937] flex items-center justify-between text-xs">
                    <span className="text-slate-400">Vigencia calculada:</span>
                    {dias <= 0 ? (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5" /> Vencido ({Math.abs(dias)} días de mora)
                      </span>
                    ) : dias <= 30 ? (
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5" /> Por vencer ({dias} días restantes)
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Vigente ({dias} días restantes)
                      </span>
                    )}
                  </div>
                )}
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
                  disabled={loading || !formData.entidadId || !formData.fechaVencimiento}
                  className="h-9 px-5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Guardar Documento</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

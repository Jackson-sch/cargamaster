"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Award, X, Plus, CheckCircle2, AlertTriangle, Loader2, ShieldCheck } from "lucide-react";
import { agregarOActualizarCertificacionAction } from "@/lib/actions/conductores";
import { toast } from "sonner";

interface CertificacionItem {
  id: string;
  tipo: string;
  entidadCapacitadora: string;
  numeroCertificado?: string | null;
  fechaEmision: string;
  fechaVencimiento: string;
  estado: string;
}

interface ModalCertificacionesConductorProps {
  conductorId: string;
  conductorNombre: string;
  certificaciones: CertificacionItem[];
  trigger?: React.ReactNode;
  onUpdated?: () => void;
}

export function ModalCertificacionesConductor({
  conductorId,
  conductorNombre,
  certificaciones,
  trigger,
  onUpdated,
}: ModalCertificacionesConductorProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    conductorId,
    tipo: "mercancias_peligrosas_matpel" as
      | "curso_seguridad_vial_mtc"
      | "mercancias_peligrosas_matpel"
      | "examen_medico_anual"
      | "psicosensometrico"
      | "induccion_mina",
    entidadCapacitadora: "ESCUELA DE CONDUCTORES INTEGRAL DEL PERÚ",
    numeroCertificado: "",
    fechaEmision: new Date().toISOString().split("T")[0],
    fechaVencimiento: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    estado: "vigente" as "vigente" | "por_vencer" | "vencido",
  });

  const handleOpen = () => {
    setShowForm(false);
    setOpen(true);
  };

  const handleSaveCert = async () => {
    setLoading(true);

    const res = await agregarOActualizarCertificacionAction({
      conductorId,
      tipo: formData.tipo,
      entidadCapacitadora: formData.entidadCapacitadora,
      numeroCertificado: formData.numeroCertificado || null,
      fechaEmision: formData.fechaEmision,
      fechaVencimiento: formData.fechaVencimiento,
      estado: formData.estado,
    });

    setLoading(false);

    if (res.success) {
      toast.success("Certificación registrada / renovada con éxito.");
      setShowForm(false);
      router.refresh();
      if (onUpdated) onUpdated();
    } else {
      toast.error(res.error || "No se pudo registrar la certificación.");
    }
  };

  return (
    <>
      {trigger ? (
        <div onClick={handleOpen} className="inline-block cursor-pointer">
          {trigger}
        </div>
      ) : (
        <button
          type="button"
          onClick={handleOpen}
          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors text-xs flex items-center gap-1 font-medium"
          title="Certificaciones MTC y MATPEL"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
          <span>Certificaciones ({certificaciones.length})</span>
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[#111827] border border-[#1F2937] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="p-4 bg-[#0E1524] border-b border-[#1F2937] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-amber-400" />
                <div>
                  <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
                    Certificaciones Viales & MATPEL
                  </h2>
                  <p className="text-[11px] text-slate-400">{conductorNombre}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* List and form */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {/* Existing certs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Certificaciones Registradas ({certificaciones.length})
                  </h3>
                  {!showForm && (
                    <button
                      type="button"
                      onClick={() => setShowForm(true)}
                      className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" /> Agregar o Renovar
                    </button>
                  )}
                </div>

                {certificaciones.length === 0 ? (
                  <div className="p-4 rounded-lg bg-[#0B1220] border border-[#1F2937] text-center text-xs text-slate-500">
                    No cuenta con certificaciones vigentes registradas.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {certificaciones.map((cert) => (
                      <div
                        key={cert.id}
                        className="p-3 bg-[#0B1220] border border-[#1F2937] rounded-lg flex items-start justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                              {cert.tipo.replace(/_/g, " ")}
                            </span>
                            {cert.estado === "vigente" ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                Vigente
                              </span>
                            ) : cert.estado === "por_vencer" ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                Por vencer
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                Vencido
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {cert.entidadCapacitadora}
                            {cert.numeroCertificado ? ` · N° ${cert.numeroCertificado}` : ""}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400 font-mono">
                            <span>Emisión: {cert.fechaEmision}</span>
                            <span>·</span>
                            <span className="text-amber-300">Vence: {cert.fechaVencimiento}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form to add or renew */}
              {showForm && (
                <div className="p-4 bg-[#0B1220] border border-amber-500/30 rounded-xl space-y-3 text-xs animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-[#1F2937] pb-2">
                    <span className="font-bold text-amber-400">
                      Registrar Nueva Certificación / Renovación
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="text-slate-400 hover:text-white text-xs"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Tipo de Certificación *
                    </label>
                    <select
                      value={formData.tipo}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tipo: e.target.value as any,
                          entidadCapacitadora:
                            e.target.value === "mercancias_peligrosas_matpel"
                              ? "ESCUELA DE CONDUCTORES INTEGRAL DEL PERÚ"
                              : e.target.value === "curso_seguridad_vial_mtc"
                              ? "CENTRO DE CAPACITACION SUTRAN - MTC"
                              : "POLICLÍNICO AUTORIZADO MTC",
                        })
                      }
                      className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2.5 text-white font-medium focus:border-amber-500 focus:outline-none"
                    >
                      <option value="mercancias_peligrosas_matpel">
                        Mercancías Peligrosas (MATPEL)
                      </option>
                      <option value="curso_seguridad_vial_mtc">
                        Curso de Seguridad Vial SUTRAN / MTC
                      </option>
                      <option value="examen_medico_anual">Examen Médico Anual MTC</option>
                      <option value="psicosensometrico">Evaluación Psicosensométrica</option>
                      <option value="induccion_mina">Inducción de Seguridad Minera</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Entidad Emisora / Escuela de Manejo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.entidadCapacitadora}
                      onChange={(e) =>
                        setFormData({ ...formData, entidadCapacitadora: e.target.value })
                      }
                      className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2.5 text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        N° Certificado
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: MATPEL-2026-098"
                        value={formData.numeroCertificado}
                        onChange={(e) =>
                          setFormData({ ...formData, numeroCertificado: e.target.value })
                        }
                        className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2.5 text-white font-mono focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Estado</label>
                      <select
                        value={formData.estado}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            estado: e.target.value as any,
                          })
                        }
                        className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2.5 text-white focus:border-amber-500 focus:outline-none"
                      >
                        <option value="vigente">🟢 Vigente</option>
                        <option value="por_vencer">🟡 Por Vencer</option>
                        <option value="vencido">🔴 Vencido</option>
                      </select>
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
                        className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2.5 text-white font-mono focus:border-amber-500 focus:outline-none"
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
                        className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2.5 text-white font-mono font-bold focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveCert}
                      disabled={loading}
                      className="h-8 px-4 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>Guardando...</span>
                        </>
                      ) : (
                        <span>Guardar Certificación</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-[#0E1524] border-t border-[#1F2937] flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-8 px-4 rounded text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

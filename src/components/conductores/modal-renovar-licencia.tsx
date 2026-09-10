"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Award, X, ShieldAlert, Loader2, Calendar } from "lucide-react";
import { renovarLicenciaConductorAction } from "@/lib/actions/conductores";
import { toast } from "sonner";

interface LicenciaData {
  id?: string;
  categoria: "A-IIb" | "A-IIIa" | "A-IIIb" | "A-IIIc";
  numeroLicencia: string;
  fechaExpedicion: string;
  fechaRevalidacion: string;
  puntosAcumuladosMtc: number;
  estado: "vigente" | "por_vencer" | "vencida" | "suspendida";
}

interface ModalRenovarLicenciaProps {
  conductorId: string;
  conductorNombre: string;
  licencia?: LicenciaData | null;
  trigger?: React.ReactNode;
  onUpdated?: () => void;
}

export function ModalRenovarLicencia({
  conductorId,
  conductorNombre,
  licencia,
  trigger,
  onUpdated,
}: ModalRenovarLicenciaProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    conductorId,
    categoria: (licencia?.categoria || "A-IIIc") as "A-IIb" | "A-IIIa" | "A-IIIb" | "A-IIIc",
    numeroLicencia: licencia?.numeroLicencia || "",
    fechaExpedicion: licencia?.fechaExpedicion || new Date().toISOString().split("T")[0],
    fechaRevalidacion:
      licencia?.fechaRevalidacion ||
      new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    puntosAcumuladosMtc: licencia?.puntosAcumuladosMtc ?? 0,
    estado: (licencia?.estado || "vigente") as "vigente" | "por_vencer" | "vencida" | "suspendida",
  });

  const handleOpen = () => {
    setFormData({
      conductorId,
      categoria: (licencia?.categoria || "A-IIIc") as any,
      numeroLicencia: licencia?.numeroLicencia || "",
      fechaExpedicion: licencia?.fechaExpedicion || new Date().toISOString().split("T")[0],
      fechaRevalidacion:
        licencia?.fechaRevalidacion ||
        new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      puntosAcumuladosMtc: licencia?.puntosAcumuladosMtc ?? 0,
      estado: (licencia?.estado || "vigente") as any,
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    setLoading(true);

    const res = await renovarLicenciaConductorAction({
      conductorId: formData.conductorId,
      categoria: formData.categoria,
      numeroLicencia: formData.numeroLicencia,
      fechaExpedicion: formData.fechaExpedicion,
      fechaRevalidacion: formData.fechaRevalidacion,
      puntosAcumuladosMtc: Number(formData.puntosAcumuladosMtc),
      estado: formData.estado,
    });

    setLoading(false);

    if (res.success) {
      toast.success(`Licencia MTC de ${conductorNombre} actualizada exitosamente.`);
      setOpen(false);
      router.refresh();
      if (onUpdated) onUpdated();
    } else {
      toast.error(res.error || "No se pudo actualizar la licencia.");
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
          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 transition-colors text-xs flex items-center gap-1 font-medium"
          title="Renovar Licencia MTC"
        >
          <Award className="h-3.5 w-3.5" />
          <span>Renovar Licencia</span>
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#111827] border border-[#1F2937] rounded-xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 bg-[#0E1524] border-b border-[#1F2937] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-400" />
                <div>
                  <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
                    Revalidación de Licencia MTC
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

            {/* Form */}
            <div
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              className="p-5 space-y-4 text-xs"
            >
              {/* Categoria y Nro de Licencia */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Categoría MTC *
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        categoria: e.target.value as any,
                      })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono font-bold focus:border-amber-500 focus:outline-none"
                  >
                    <option value="A-IIIc">A-IIIc (Tracto + Semirremolque)</option>
                    <option value="A-IIIb">A-IIIb (Remolcador Pesado)</option>
                    <option value="A-IIIa">A-IIIa (Ómnibus / Rígidos)</option>
                    <option value="A-IIb">A-IIb (Camión Mediano)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Número de Licencia *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Q-12345678"
                    value={formData.numeroLicencia}
                    onChange={(e) =>
                      setFormData({ ...formData, numeroLicencia: e.target.value.toUpperCase() })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Fechas Expedicion y Revalidacion */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    Fecha Expedición *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fechaExpedicion}
                    onChange={(e) =>
                      setFormData({ ...formData, fechaExpedicion: e.target.value })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-amber-400" />
                    Fecha Revalidación *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fechaRevalidacion}
                    onChange={(e) =>
                      setFormData({ ...formData, fechaRevalidacion: e.target.value })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Puntos Acumulados y Estado */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1">
                    <ShieldAlert className="h-3 w-3 text-rose-400" />
                    Puntos SUTRAN (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.puntosAcumuladosMtc}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        puntosAcumuladosMtc: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono font-bold focus:border-amber-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500">
                    A los 100 pts se suspende la licencia
                  </span>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Estado Legal de Licencia
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estado: e.target.value as any,
                      })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="vigente">🟢 Vigente</option>
                    <option value="por_vencer">🟡 Por Vencer</option>
                    <option value="vencida">🔴 Vencida</option>
                    <option value="suspendida">⛔ Suspendida SUTRAN</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-[#0E1524] border-t border-[#1F2937] flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-8 px-4 rounded text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="h-8 px-4 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <span>Guardar Licencia</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, X, Wrench, Loader2 } from "lucide-react";
import { actualizarMantenimientoAction } from "@/lib/actions/mantenimiento";
import { toast } from "sonner";

export interface MantenimientoItemForEdit {
  id: string;
  placa: string;
  entidadTipo: "unidad" | "semirremolque";
  tipo: "preventivo" | "correctivo";
  descripcion: string;
  odometroRegistro?: number | null;
  fechaProgramada: string;
  taller: "propio" | "tercero";
  nombreTaller: string;
  costoManoObra: string | number;
  costoRepuestos: string | number;
  costoTotal: string | number;
  observaciones?: string | null;
}

interface ModalEditarMantenimientoProps {
  mantenimiento: MantenimientoItemForEdit;
  onUpdated?: () => void;
}

export function ModalEditarMantenimiento({
  mantenimiento,
  onUpdated,
}: ModalEditarMantenimientoProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    id: mantenimiento.id,
    tipo: mantenimiento.tipo,
    descripcion: mantenimiento.descripcion,
    odometroRegistro: mantenimiento.odometroRegistro || "",
    fechaProgramada: mantenimiento.fechaProgramada,
    taller: mantenimiento.taller,
    nombreTaller: mantenimiento.nombreTaller,
    costoManoObra: parseFloat(mantenimiento.costoManoObra?.toString() || "0"),
    costoRepuestos: parseFloat(mantenimiento.costoRepuestos?.toString() || "0"),
    costoTotal: parseFloat(mantenimiento.costoTotal?.toString() || "0"),
    observaciones: mantenimiento.observaciones || "",
  });

  const handleCostoChange = (field: "costoManoObra" | "costoRepuestos", value: number) => {
    const mo = field === "costoManoObra" ? value : formData.costoManoObra;
    const rep = field === "costoRepuestos" ? value : formData.costoRepuestos;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      costoTotal: Number((mo + rep).toFixed(2)),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.descripcion.trim()) {
      toast.error("La descripción del servicio es obligatoria.");
      return;
    }
    if (!formData.nombreTaller.trim()) {
      toast.error("El nombre del taller es obligatorio.");
      return;
    }

    setLoading(true);
    const res = await actualizarMantenimientoAction({
      id: formData.id,
      tipo: formData.tipo,
      descripcion: formData.descripcion,
      odometroRegistro: formData.odometroRegistro ? Number(formData.odometroRegistro) : undefined,
      fechaProgramada: formData.fechaProgramada,
      taller: formData.taller,
      nombreTaller: formData.nombreTaller,
      costoManoObra: formData.costoManoObra,
      costoRepuestos: formData.costoRepuestos,
      costoTotal: formData.costoTotal,
      observaciones: formData.observaciones,
    });
    setLoading(false);

    if (res.success) {
      toast.success(res.message || "Orden de mantenimiento actualizada.");
      setOpen(false);
      router.refresh();
      if (onUpdated) onUpdated();
    } else {
      toast.error(res.error || "No se pudo actualizar la orden de trabajo.");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Editar Orden de Trabajo"
        className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 border border-slate-700 transition-colors"
      >
        <Edit2 className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg bg-[#111827] border border-[#1F2937] rounded-xl shadow-2xl overflow-hidden text-left"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          >
            {/* Header */}
            <div className="p-4 bg-[#0E1524] border-b border-[#1F2937] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-amber-400" />
                <div>
                  <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
                    Editar Orden de Trabajo ({mantenimiento.placa})
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Modificación de rutina técnica y presupuesto operativo
                  </p>
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

            {/* Body */}
            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Tipo de Mantenimiento *
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) =>
                      setFormData({ ...formData, tipo: e.target.value as any })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="preventivo">Preventivo (Programado)</option>
                    <option value="correctivo">Correctivo (Avería)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Fecha Programada *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fechaProgramada}
                    onChange={(e) =>
                      setFormData({ ...formData, fechaProgramada: e.target.value })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Descripción del Servicio / Rutina *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                  className="w-full bg-[#0B1220] border border-[#1F2937] rounded p-2.5 text-white focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Tipo de Taller *
                  </label>
                  <select
                    value={formData.taller}
                    onChange={(e) =>
                      setFormData({ ...formData, taller: e.target.value as any })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="propio">Taller Propio</option>
                    <option value="tercero">Taller Tercero / Externo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Nombre del Taller / Sede *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombreTaller}
                    onChange={(e) =>
                      setFormData({ ...formData, nombreTaller: e.target.value })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Odómetro al Ingreso (Km)
                </label>
                <input
                  type="number"
                  placeholder="Ej. 185200"
                  value={formData.odometroRegistro}
                  onChange={(e) =>
                    setFormData({ ...formData, odometroRegistro: e.target.value })
                  }
                  className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Financial breakdown */}
              <div className="p-3 bg-[#0B1220] border border-[#1F2937] rounded-lg space-y-3">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                  Presupuesto & Costos (Soles PEN)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">Mano de Obra</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.costoManoObra}
                      onChange={(e) =>
                        handleCostoChange("costoManoObra", parseFloat(e.target.value) || 0)
                      }
                      className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">Repuestos</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.costoRepuestos}
                      onChange={(e) =>
                        handleCostoChange("costoRepuestos", parseFloat(e.target.value) || 0)
                      }
                      className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-amber-400 font-bold text-[10px] mb-1">Total (S/)</label>
                    <div className="h-8 bg-[#111827] border border-amber-500/40 rounded px-2 flex items-center font-mono font-bold text-amber-300">
                      S/ {formData.costoTotal.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Observaciones Técnicas
                </label>
                <input
                  type="text"
                  placeholder="Garantía, repuestos cambiados, etc."
                  value={formData.observaciones}
                  onChange={(e) =>
                    setFormData({ ...formData, observaciones: e.target.value })
                  }
                  className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#1F2937] bg-[#0E1524] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-9 px-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="h-9 px-5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

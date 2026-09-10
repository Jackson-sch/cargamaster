"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, X, Layers, Loader2 } from "lucide-react";
import { actualizarSemirremolqueAction } from "@/lib/actions/flota";
import { toast } from "sonner";

interface SemirremolqueData {
  id: string;
  placa: string;
  tipoCarroceria:
    | "plataforma"
    | "cama_baja"
    | "cisterna"
    | "furgon"
    | "tolva_granelera"
    | "portacontenedor";
  marca?: string | null;
  anioFabricacion?: number | null;
  ejes: number;
  pesoNetoTn?: string | null;
  cargaUtilMaxTn: string;
  volumenM3?: string | null;
  estado: "disponible" | "acoplado" | "mantenimiento" | "inactivo";
  activo: boolean;
}

interface ModalEditarSemirremolqueProps {
  semirremolque: SemirremolqueData;
  trigger?: React.ReactNode;
  onUpdated?: () => void;
}

export function ModalEditarSemirremolque({
  semirremolque,
  trigger,
  onUpdated,
}: ModalEditarSemirremolqueProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    id: semirremolque.id,
    placa: semirremolque.placa,
    tipoCarroceria: semirremolque.tipoCarroceria,
    marca: semirremolque.marca || "",
    anioFabricacion: semirremolque.anioFabricacion || new Date().getFullYear(),
    ejes: semirremolque.ejes,
    pesoNetoTn: semirremolque.pesoNetoTn || "7.50",
    cargaUtilMaxTn: semirremolque.cargaUtilMaxTn,
    volumenM3: semirremolque.volumenM3 || "",
    estado: semirremolque.estado,
    activo: semirremolque.activo,
  });

  const handleOpen = () => {
    setFormData({
      id: semirremolque.id,
      placa: semirremolque.placa,
      tipoCarroceria: semirremolque.tipoCarroceria,
      marca: semirremolque.marca || "",
      anioFabricacion: semirremolque.anioFabricacion || new Date().getFullYear(),
      ejes: semirremolque.ejes,
      pesoNetoTn: semirremolque.pesoNetoTn || "7.50",
      cargaUtilMaxTn: semirremolque.cargaUtilMaxTn,
      volumenM3: semirremolque.volumenM3 || "",
      estado: semirremolque.estado,
      activo: semirremolque.activo,
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    setLoading(true);

    const res = await actualizarSemirremolqueAction({
      id: formData.id,
      placa: formData.placa,
      tipoCarroceria: formData.tipoCarroceria,
      marca: formData.marca || null,
      anioFabricacion: formData.anioFabricacion ? Number(formData.anioFabricacion) : null,
      ejes: Number(formData.ejes),
      pesoNetoTn: formData.pesoNetoTn || null,
      cargaUtilMaxTn: formData.cargaUtilMaxTn,
      volumenM3: formData.volumenM3 || null,
      estado: formData.estado,
      activo: formData.activo,
    });

    setLoading(false);

    if (res.success) {
      toast.success(`Semirremolque ${formData.placa} actualizado exitosamente.`);
      setOpen(false);
      router.refresh();
      if (onUpdated) onUpdated();
    } else {
      toast.error(res.error || "No se pudo actualizar el semirremolque.");
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
          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          title="Editar Semirremolque"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[#111827] border border-[#1F2937] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-4 bg-[#0E1524] border-b border-[#1F2937] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-amber-400" />
                <div>
                  <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)] flex items-center gap-2">
                    Editar Semirremolque / Carreta
                    <span className="font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded text-xs">
                      {formData.placa}
                    </span>
                  </h2>
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

            {/* Content Form Container */}
            <div
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              className="p-5 space-y-4 overflow-y-auto"
            >
              {/* Row 1: Placa y Tipo de Carrocería */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Placa Carreta MTC *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.placa}
                    onChange={(e) =>
                      setFormData({ ...formData, placa: e.target.value.toUpperCase() })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Tipo de Carrocería
                  </label>
                  <select
                    value={formData.tipoCarroceria}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tipoCarroceria: e.target.value as any,
                      })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-slate-200 focus:border-amber-500 focus:outline-none capitalize"
                  >
                    <option value="plataforma">Plataforma Baranda / Plana</option>
                    <option value="cama_baja">Cama Baja (Lowboy)</option>
                    <option value="cisterna">Cisterna / Tanque de Combustible</option>
                    <option value="furgon">Furgón Cerrado / Seco</option>
                    <option value="tolva_granelera">Tolva Granelera / Volquete</option>
                    <option value="portacontenedor">Portacontenedor</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Marca, Año y Ejes */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Marca / Fabricante</label>
                  <input
                    type="text"
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Año Fab.</label>
                  <input
                    type="number"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    value={formData.anioFabricacion}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        anioFabricacion: parseInt(e.target.value) || 2020,
                      })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Número de Ejes</label>
                  <select
                    value={formData.ejes}
                    onChange={(e) =>
                      setFormData({ ...formData, ejes: parseInt(e.target.value) || 3 })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                  >
                    <option value={1}>1 Eje</option>
                    <option value={2}>2 Ejes</option>
                    <option value={3}>3 Ejes (Estándar)</option>
                    <option value={4}>4 Ejes</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Capacidades MTC */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Carga Útil Máx. (Tn) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.cargaUtilMaxTn}
                    onChange={(e) =>
                      setFormData({ ...formData, cargaUtilMaxTn: e.target.value })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Peso Neto / Tara (Tn)</label>
                  <input
                    type="text"
                    value={formData.pesoNetoTn}
                    onChange={(e) => setFormData({ ...formData, pesoNetoTn: e.target.value })}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Volumen (m³)</label>
                  <input
                    type="text"
                    placeholder="Opcional"
                    value={formData.volumenM3}
                    onChange={(e) => setFormData({ ...formData, volumenM3: e.target.value })}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 4: Estado Operativo */}
              <div className="p-3 bg-[#0B1220] border border-[#1F2937] rounded-lg text-xs space-y-2">
                <label className="block text-slate-300 font-semibold">
                  Estado Operativo del Semirremolque
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, estado: "disponible" })}
                    className={`py-2 px-3 rounded text-xs font-semibold border transition-all ${
                      formData.estado === "disponible"
                        ? "bg-blue-500/20 text-blue-400 border-blue-500"
                        : "bg-slate-900 text-slate-400 border-[#1F2937] hover:border-slate-600"
                    }`}
                  >
                    🔵 Disponible
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, estado: "acoplado" })}
                    className={`py-2 px-3 rounded text-xs font-semibold border transition-all ${
                      formData.estado === "acoplado"
                        ? "bg-amber-500/20 text-amber-400 border-amber-500"
                        : "bg-slate-900 text-slate-400 border-[#1F2937] hover:border-slate-600"
                    }`}
                  >
                    🟡 Acoplado
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, estado: "mantenimiento" })}
                    className={`py-2 px-3 rounded text-xs font-semibold border transition-all ${
                      formData.estado === "mantenimiento"
                        ? "bg-orange-500/20 text-orange-400 border-orange-500"
                        : "bg-slate-900 text-slate-400 border-[#1F2937] hover:border-slate-600"
                    }`}
                  >
                    🟠 Taller / Mant.
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, estado: "inactivo" })}
                    className={`py-2 px-3 rounded text-xs font-semibold border transition-all ${
                      formData.estado === "inactivo"
                        ? "bg-rose-500/20 text-rose-400 border-rose-500"
                        : "bg-slate-900 text-slate-400 border-[#1F2937] hover:border-slate-600"
                    }`}
                  >
                    🔴 Inactivo / Baja
                  </button>
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
                  <span>Guardar Cambios</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Layers, Loader2 } from "lucide-react";
import { crearSemirremolqueAction } from "@/lib/actions/flota";
import { toast } from "sonner";

export function ModalNuevoSemirremolque({ onCreated }: { onCreated?: () => void }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    placa: "",
    tipoCarroceria: "plataforma" as
      | "plataforma"
      | "cama_baja"
      | "cisterna"
      | "furgon"
      | "tolva_granelera"
      | "portacontenedor",
    marca: "Montenegro",
    anioFabricacion: new Date().getFullYear(),
    ejes: 3,
    cargaUtilMaxTn: "32.00",
    pesoNetoTn: "6.80",
    volumenM3: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await crearSemirremolqueAction(formData);
    setLoading(false);

    if (res.success) {
      toast.success(`Semirremolque ${formData.placa.toUpperCase()} registrado exitosamente.`);
      setOpen(false);
      router.refresh();
      setFormData({
        placa: "",
        tipoCarroceria: "plataforma",
        marca: "Montenegro",
        anioFabricacion: new Date().getFullYear(),
        ejes: 3,
        cargaUtilMaxTn: "32.00",
        pesoNetoTn: "6.80",
        volumenM3: "",
      });
      if (onCreated) onCreated();
    } else {
      toast.error(res.error || "Error al registrar el semirremolque.");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="h-9 px-3 rounded-md bg-[#111827] border border-[#1F2937] hover:border-slate-600 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
      >
        <Layers className="h-3.5 w-3.5 text-amber-400" />
        <span>Nuevo Semirremolque</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#111827] border border-[#1F2937] rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-[#0E1524] border-b border-[#1F2937] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-amber-400" />
                <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
                  Registrar Semirremolque / Carreta
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
                    Placa Carreta MTC *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Z1A-987"
                    value={formData.placa}
                    onChange={(e) =>
                      setFormData({ ...formData, placa: e.target.value.toUpperCase() })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono font-bold placeholder:text-slate-600 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Tipo de Carrocería *
                  </label>
                  <select
                    value={formData.tipoCarroceria}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tipoCarroceria: e.target.value as any,
                      })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="plataforma">Plataforma Abierta</option>
                    <option value="cama_baja">Cama Baja (Lowboy)</option>
                    <option value="cisterna">Cisterna (Líquidos / Combustible)</option>
                    <option value="furgon">Furgón Seco / Refrigerado</option>
                    <option value="tolva_granelera">Tolva Granelera / Volquete</option>
                    <option value="portacontenedor">Portacontenedor</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Marca Fabricante
                    </label>
                    <input
                      type="text"
                      placeholder="Montenegro, Randon..."
                      value={formData.marca}
                      onChange={(e) =>
                        setFormData({ ...formData, marca: e.target.value })
                      }
                      className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      N° de Ejes
                    </label>
                    <select
                      value={formData.ejes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ejes: parseInt(e.target.value) || 3,
                        })
                      }
                      className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                    >
                      <option value={2}>2 Ejes</option>
                      <option value={3}>3 Ejes</option>
                      <option value={4}>4 Ejes</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Carga Útil Máx (Tn) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.cargaUtilMaxTn}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cargaUtilMaxTn: e.target.value,
                        })
                      }
                      className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Volumen (m³)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. 90 m3"
                      value={formData.volumenM3}
                      onChange={(e) =>
                        setFormData({ ...formData, volumenM3: e.target.value })
                      }
                      className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>
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
                  disabled={loading}
                  className="h-9 px-5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Guardar Semirremolque</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

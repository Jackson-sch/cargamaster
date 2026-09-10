"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Truck, Loader2 } from "lucide-react";
import { crearUnidadAction } from "@/lib/actions/flota";
import { toast } from "sonner";

export function ModalNuevaUnidad({ onCreated }: { onCreated?: () => void }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    placa: "",
    tipoUnidad: "tracto" as "tracto" | "rigido" | "camioneta",
    marca: "Volvo",
    modelo: "",
    anioFabricacion: new Date().getFullYear(),
    color: "",
    vinChasis: "",
    numeroMotor: "",
    ejes: 3,
    capacidadArrastreTn: "48.00",
    pesoSecoTn: "8.90",
    tipoCombustible: "diesel_b5" as "diesel_b5" | "gnv" | "glp",
    odometroActualKm: 0,
    idDispositivoGps: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await crearUnidadAction(formData);
    setLoading(false);

    if (res.success) {
      toast.success(`Unidad ${formData.placa.toUpperCase()} registrada exitosamente.`);
      setOpen(false);
      router.refresh();
      setFormData({
        placa: "",
        tipoUnidad: "tracto",
        marca: "Volvo",
        modelo: "",
        anioFabricacion: new Date().getFullYear(),
        color: "",
        vinChasis: "",
        numeroMotor: "",
        ejes: 3,
        capacidadArrastreTn: "48.00",
        pesoSecoTn: "8.90",
        tipoCombustible: "diesel_b5",
        odometroActualKm: 0,
        idDispositivoGps: "",
      });
      if (onCreated) onCreated();
    } else {
      toast.error(res.error || "Error al registrar la unidad.");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="h-9 px-4 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
      >
        <Plus className="h-4 w-4" />
        <span>Registrar Unidad (Tracto)</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#111827] border border-[#1F2937] rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-[#0E1524] border-b border-[#1F2937] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-amber-400" />
                <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
                  Registrar Nueva Unidad Vehicular
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
            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Placa MTC *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="V7A-890 o ABC-123"
                    value={formData.placa}
                    onChange={(e) =>
                      setFormData({ ...formData, placa: e.target.value.toUpperCase() })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono font-bold placeholder:text-slate-600 focus:border-amber-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500">
                    Formato estándar peruano de 6 caracteres
                  </span>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Tipo de Unidad *
                  </label>
                  <select
                    value={formData.tipoUnidad}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tipoUnidad: e.target.value as any,
                      })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="tracto">Tracto-Camión</option>
                    <option value="rigido">Camión Rígido</option>
                    <option value="camioneta">Camioneta de Apoyo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Marca *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Volvo, Scania, Freightliner..."
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Modelo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="FH 540, R500, Cascadia..."
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Año de Fabricación *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.anioFabricacion}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        anioFabricacion: parseInt(e.target.value) || 2024,
                      })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Configuración de Ejes *
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
                    <option value={2}>2 ejes (4x2)</option>
                    <option value={3}>3 ejes (6x2 / 6x4)</option>
                    <option value={4}>4 ejes (8x4 pesado)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Capacidad de Arrastre (Tn) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.capacidadArrastreTn}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        capacidadArrastreTn: e.target.value,
                      })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Odómetro Actual (Km) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.odometroActualKm}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        odometroActualKm: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Tipo de Combustible
                  </label>
                  <select
                    value={formData.tipoCombustible}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tipoCombustible: e.target.value as any,
                      })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="diesel_b5">Diesel B5 S-50</option>
                    <option value="gnv">GNV (Gas Natural)</option>
                    <option value="glp">GLP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Dispositivo GPS / IMEI
                  </label>
                  <input
                    type="text"
                    placeholder="IMEI o ID rastreador"
                    value={formData.idDispositivoGps}
                    onChange={(e) =>
                      setFormData({ ...formData, idDispositivoGps: e.target.value })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono placeholder:text-slate-600 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Footer Buttons */}
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
                  <span>Guardar Unidad</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

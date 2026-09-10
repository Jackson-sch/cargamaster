"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, X, Truck, Loader2, Gauge } from "lucide-react";
import { actualizarUnidadAction } from "@/lib/actions/flota";
import { toast } from "sonner";

interface UnidadData {
  id: string;
  placa: string;
  tipoUnidad: "tracto" | "rigido" | "camioneta";
  marca: string;
  modelo: string;
  anioFabricacion: number;
  color?: string | null;
  vinChasis?: string | null;
  numeroMotor?: string | null;
  ejes: number;
  capacidadArrastreTn?: string | null;
  pesoSecoTn?: string | null;
  tipoCombustible: "diesel_b5" | "gnv" | "glp";
  odometroActualKm: number;
  idDispositivoGps?: string | null;
  estado: "disponible" | "en_ruta" | "mantenimiento" | "inactivo";
  activo: boolean;
}

interface ModalEditarUnidadProps {
  unidad: UnidadData;
  trigger?: React.ReactNode;
  onUpdated?: () => void;
}

export function ModalEditarUnidad({ unidad, trigger, onUpdated }: ModalEditarUnidadProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    id: unidad.id,
    placa: unidad.placa,
    tipoUnidad: unidad.tipoUnidad,
    marca: unidad.marca,
    modelo: unidad.modelo,
    anioFabricacion: unidad.anioFabricacion,
    color: unidad.color || "",
    vinChasis: unidad.vinChasis || "",
    numeroMotor: unidad.numeroMotor || "",
    ejes: unidad.ejes,
    capacidadArrastreTn: unidad.capacidadArrastreTn || "48.00",
    pesoSecoTn: unidad.pesoSecoTn || "8.90",
    tipoCombustible: unidad.tipoCombustible,
    odometroActualKm: unidad.odometroActualKm,
    idDispositivoGps: unidad.idDispositivoGps || "",
    estado: unidad.estado,
    activo: unidad.activo,
  });

  const handleOpen = () => {
    setFormData({
      id: unidad.id,
      placa: unidad.placa,
      tipoUnidad: unidad.tipoUnidad,
      marca: unidad.marca,
      modelo: unidad.modelo,
      anioFabricacion: unidad.anioFabricacion,
      color: unidad.color || "",
      vinChasis: unidad.vinChasis || "",
      numeroMotor: unidad.numeroMotor || "",
      ejes: unidad.ejes,
      capacidadArrastreTn: unidad.capacidadArrastreTn || "48.00",
      pesoSecoTn: unidad.pesoSecoTn || "8.90",
      tipoCombustible: unidad.tipoCombustible,
      odometroActualKm: unidad.odometroActualKm,
      idDispositivoGps: unidad.idDispositivoGps || "",
      estado: unidad.estado,
      activo: unidad.activo,
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    setLoading(true);

    const res = await actualizarUnidadAction({
      id: formData.id,
      placa: formData.placa,
      tipoUnidad: formData.tipoUnidad,
      marca: formData.marca,
      modelo: formData.modelo,
      anioFabricacion: Number(formData.anioFabricacion),
      color: formData.color || null,
      vinChasis: formData.vinChasis || null,
      numeroMotor: formData.numeroMotor || null,
      ejes: Number(formData.ejes),
      capacidadArrastreTn: formData.capacidadArrastreTn,
      pesoSecoTn: formData.pesoSecoTn || null,
      tipoCombustible: formData.tipoCombustible,
      odometroActualKm: Number(formData.odometroActualKm),
      idDispositivoGps: formData.idDispositivoGps || null,
      estado: formData.estado,
      activo: formData.activo,
    });

    setLoading(false);

    if (res.success) {
      toast.success(`Unidad ${formData.placa} actualizada correctamente.`);
      setOpen(false);
      router.refresh();
      if (onUpdated) onUpdated();
    } else {
      toast.error(res.error || "No se pudo actualizar la unidad.");
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
          title="Editar Unidad"
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
                <Truck className="h-5 w-5 text-amber-400" />
                <div>
                  <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)] flex items-center gap-2">
                    Editar Unidad Vehicular
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

            {/* Content Container (avoiding nested <form>) */}
            <div
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              className="p-5 space-y-4 overflow-y-auto"
            >
              {/* Row 1: Placa y Tipo */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Placa MTC *</label>
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
                  <label className="block text-slate-300 font-medium mb-1">Tipo de Unidad</label>
                  <select
                    value={formData.tipoUnidad}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tipoUnidad: e.target.value as "tracto" | "rigido" | "camioneta",
                      })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-slate-200 focus:border-amber-500 focus:outline-none capitalize"
                  >
                    <option value="tracto">Tractocamión (Remolcador)</option>
                    <option value="rigido">Camión Rígido</option>
                    <option value="camioneta">Camioneta Escolta / Auxilio</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Marca, Modelo y Año */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Marca</label>
                  <input
                    type="text"
                    required
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Modelo</label>
                  <input
                    type="text"
                    required
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
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
                      setFormData({ ...formData, anioFabricacion: parseInt(e.target.value) || 2020 })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 3: Configuración de Ejes y Capacidades MTC */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Ejes (MTC)</label>
                  <select
                    value={formData.ejes}
                    onChange={(e) =>
                      setFormData({ ...formData, ejes: parseInt(e.target.value) || 3 })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                  >
                    <option value={2}>2 Ejes (4x2)</option>
                    <option value={3}>3 Ejes (6x2 / 6x4)</option>
                    <option value={4}>4 Ejes (8x4)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Cap. Arrastre (Tn)</label>
                  <input
                    type="text"
                    value={formData.capacidadArrastreTn}
                    onChange={(e) =>
                      setFormData({ ...formData, capacidadArrastreTn: e.target.value })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Peso Seco / Tara (Tn)</label>
                  <input
                    type="text"
                    value={formData.pesoSecoTn}
                    onChange={(e) => setFormData({ ...formData, pesoSecoTn: e.target.value })}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 4: Odómetro actual y Combustible */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1">
                    <Gauge className="h-3 w-3 text-amber-400" />
                    Odómetro Actual (Km)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.odometroActualKm}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        odometroActualKm: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Tipo de Combustible</label>
                  <select
                    value={formData.tipoCombustible}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tipoCombustible: e.target.value as "diesel_b5" | "gnv" | "glp",
                      })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-slate-200 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="diesel_b5">Diesel B5 S-50 (Estándar)</option>
                    <option value="gnv">Gas Natural Vehicular (GNV)</option>
                    <option value="glp">Gas Licuado de Petróleo (GLP)</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Dispositivo GPS e ID de Rastreador */}
              <div className="text-xs">
                <label className="block text-slate-300 font-medium mb-1">
                  ID Dispositivo GPS / IMEI SUTRAN
                </label>
                <input
                  type="text"
                  placeholder="Ej: GPS-TK103-89021"
                  value={formData.idDispositivoGps}
                  onChange={(e) =>
                    setFormData({ ...formData, idDispositivoGps: e.target.value })
                  }
                  className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Row 6: Estado Operativo */}
              <div className="p-3 bg-[#0B1220] border border-[#1F2937] rounded-lg text-xs space-y-2">
                <label className="block text-slate-300 font-semibold">
                  Estado Operativo de la Unidad
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
                    onClick={() => setFormData({ ...formData, estado: "mantenimiento" })}
                    className={`py-2 px-3 rounded text-xs font-semibold border transition-all ${
                      formData.estado === "mantenimiento"
                        ? "bg-amber-500/20 text-amber-400 border-amber-500"
                        : "bg-slate-900 text-slate-400 border-[#1F2937] hover:border-slate-600"
                    }`}
                  >
                    🟡 En Taller / Mant.
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, estado: "en_ruta" })}
                    className={`py-2 px-3 rounded text-xs font-semibold border transition-all ${
                      formData.estado === "en_ruta"
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500"
                        : "bg-slate-900 text-slate-400 border-[#1F2937] hover:border-slate-600"
                    }`}
                  >
                    🟢 En Ruta
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

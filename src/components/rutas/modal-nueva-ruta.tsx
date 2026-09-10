"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Route, Loader2 } from "lucide-react";
import { crearRutaAction } from "@/lib/actions/rutas";
import { toast } from "sonner";

export function ModalNuevaRuta({ onCreated }: { onCreated?: () => void }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    codigoRuta: "",
    nombre: "",
    origenDepartamento: "Lima",
    origenProvincia: "Lima",
    origenDistrito: "Callao",
    origenUbigeo: "070101",
    origenDireccion: "",
    destinoDepartamento: "Arequipa",
    destinoProvincia: "Arequipa",
    destinoDistrito: "Uchumayo",
    destinoUbigeo: "040126",
    destinoDireccion: "",
    distanciaEstimadaKm: "1000.00",
    tiempoEstimadoHoras: "17.00",
    peajesEstimadosMonto: "300.00",
    galonesEstimados: "160.00",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await crearRutaAction(formData);
    setLoading(false);

    if (res.success) {
      toast.success(`Ruta ${formData.codigoRuta} registrada exitosamente.`);
      setOpen(false);
      setFormData({
        codigoRuta: "",
        nombre: "",
        origenDepartamento: "Lima",
        origenProvincia: "Lima",
        origenDistrito: "Callao",
        origenUbigeo: "070101",
        origenDireccion: "",
        destinoDepartamento: "Arequipa",
        destinoProvincia: "Arequipa",
        destinoDistrito: "Uchumayo",
        destinoUbigeo: "040126",
        destinoDireccion: "",
        distanciaEstimadaKm: "1000.00",
        tiempoEstimadoHoras: "17.00",
        peajesEstimadosMonto: "300.00",
        galonesEstimados: "160.00",
      });
      router.refresh();
      if (onCreated) onCreated();
    } else {
      toast.error(res.error || "No se pudo registrar la ruta.");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="h-9 px-4 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
      >
        <Plus className="h-4 w-4" />
        <span>Nueva Ruta</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#111827] border border-[#1F2937] rounded-xl shadow-2xl overflow-hidden text-left">
            {/* Header */}
            <div className="p-4 bg-[#0E1524] border-b border-[#1F2937] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Route className="h-5 w-5 text-amber-400" />
                <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
                  Registrar Nueva Ruta de Transporte
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
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Código Ruta *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="LIM-TRU-01"
                      value={formData.codigoRuta}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          codigoRuta: e.target.value.toUpperCase(),
                        })
                      }
                      className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono font-bold focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-slate-300 font-medium mb-1">
                      Nombre Comercial de la Ruta *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Lima ➔ Trujillo por Panamericana Norte"
                      value={formData.nombre}
                      onChange={(e) =>
                        setFormData({ ...formData, nombre: e.target.value })
                      }
                      className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Origen */}
                <div className="p-3 bg-[#0B1220] rounded-lg border border-[#1F2937] space-y-2">
                  <span className="font-semibold text-amber-400 block">
                    Punto de Partida / Origen
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-0.5">Dep. Origen</label>
                      <input
                        type="text"
                        required
                        value={formData.origenDepartamento}
                        onChange={(e) =>
                          setFormData({ ...formData, origenDepartamento: e.target.value })
                        }
                        className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-0.5">Ubigeo (6)</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={formData.origenUbigeo}
                        onChange={(e) =>
                          setFormData({ ...formData, origenUbigeo: e.target.value })
                        }
                        className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-0.5">Distrito</label>
                      <input
                        type="text"
                        required
                        value={formData.origenDistrito}
                        onChange={(e) =>
                          setFormData({ ...formData, origenDistrito: e.target.value })
                        }
                        className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2 text-white"
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Dirección exacta de partida (ej. Terminal Portuario Callao)"
                    value={formData.origenDireccion}
                    onChange={(e) =>
                      setFormData({ ...formData, origenDireccion: e.target.value })
                    }
                    className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2 text-white"
                  />
                </div>

                {/* Destino */}
                <div className="p-3 bg-[#0B1220] rounded-lg border border-[#1F2937] space-y-2">
                  <span className="font-semibold text-emerald-400 block">
                    Punto de Llegada / Destino
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-0.5">Dep. Destino</label>
                      <input
                        type="text"
                        required
                        value={formData.destinoDepartamento}
                        onChange={(e) =>
                          setFormData({ ...formData, destinoDepartamento: e.target.value })
                        }
                        className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-0.5">Ubigeo (6)</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={formData.destinoUbigeo}
                        onChange={(e) =>
                          setFormData({ ...formData, destinoUbigeo: e.target.value })
                        }
                        className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-0.5">Distrito</label>
                      <input
                        type="text"
                        required
                        value={formData.destinoDistrito}
                        onChange={(e) =>
                          setFormData({ ...formData, destinoDistrito: e.target.value })
                        }
                        className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2 text-white"
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Dirección exacta de llegada (ej. Mina / Planta)"
                    value={formData.destinoDireccion}
                    onChange={(e) =>
                      setFormData({ ...formData, destinoDireccion: e.target.value })
                    }
                    className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2 text-white"
                  />
                </div>

                {/* Costos Estimados */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Distancia (Km) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.distanciaEstimadaKm}
                      onChange={(e) =>
                        setFormData({ ...formData, distanciaEstimadaKm: e.target.value })
                      }
                      className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Peajes Est. (S/)
                    </label>
                    <input
                      type="text"
                      value={formData.peajesEstimadosMonto}
                      onChange={(e) =>
                        setFormData({ ...formData, peajesEstimadosMonto: e.target.value })
                      }
                      className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Galones Est.
                    </label>
                    <input
                      type="text"
                      value={formData.galonesEstimados}
                      onChange={(e) =>
                        setFormData({ ...formData, galonesEstimados: e.target.value })
                      }
                      className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono"
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
                  <span>Guardar Ruta</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

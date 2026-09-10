"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, X, Route as RouteIcon, Loader2, MapPin, Clock, DollarSign, Fuel } from "lucide-react";
import { actualizarRutaAction } from "@/lib/actions/rutas";
import { toast } from "sonner";

interface RutaData {
  id: string;
  codigoRuta: string;
  nombre: string;
  origenDepartamento: string;
  origenProvincia: string;
  origenDistrito: string;
  origenUbigeo: string;
  origenDireccion: string;
  destinoDepartamento: string;
  destinoProvincia: string;
  destinoDistrito: string;
  destinoUbigeo: string;
  destinoDireccion: string;
  distanciaEstimadaKm: string;
  tiempoEstimadoHoras: string;
  peajesEstimadosMonto: string;
  galonesEstimados?: string | null;
  activo: boolean;
}

interface ModalEditarRutaProps {
  ruta: RutaData;
  trigger?: React.ReactNode;
  onUpdated?: () => void;
}

export function ModalEditarRuta({ ruta, trigger, onUpdated }: ModalEditarRutaProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    id: ruta.id,
    codigoRuta: ruta.codigoRuta,
    nombre: ruta.nombre,
    origenDepartamento: ruta.origenDepartamento,
    origenProvincia: ruta.origenProvincia,
    origenDistrito: ruta.origenDistrito,
    origenUbigeo: ruta.origenUbigeo,
    origenDireccion: ruta.origenDireccion,
    destinoDepartamento: ruta.destinoDepartamento,
    destinoProvincia: ruta.destinoProvincia,
    destinoDistrito: ruta.destinoDistrito,
    destinoUbigeo: ruta.destinoUbigeo,
    destinoDireccion: ruta.destinoDireccion,
    distanciaEstimadaKm: ruta.distanciaEstimadaKm,
    tiempoEstimadoHoras: ruta.tiempoEstimadoHoras,
    peajesEstimadosMonto: ruta.peajesEstimadosMonto,
    galonesEstimados: ruta.galonesEstimados || "",
    activo: ruta.activo,
  });

  const handleOpen = () => {
    setFormData({
      id: ruta.id,
      codigoRuta: ruta.codigoRuta,
      nombre: ruta.nombre,
      origenDepartamento: ruta.origenDepartamento,
      origenProvincia: ruta.origenProvincia,
      origenDistrito: ruta.origenDistrito,
      origenUbigeo: ruta.origenUbigeo,
      origenDireccion: ruta.origenDireccion,
      destinoDepartamento: ruta.destinoDepartamento,
      destinoProvincia: ruta.destinoProvincia,
      destinoDistrito: ruta.destinoDistrito,
      destinoUbigeo: ruta.destinoUbigeo,
      destinoDireccion: ruta.destinoDireccion,
      distanciaEstimadaKm: ruta.distanciaEstimadaKm,
      tiempoEstimadoHoras: ruta.tiempoEstimadoHoras,
      peajesEstimadosMonto: ruta.peajesEstimadosMonto,
      galonesEstimados: ruta.galonesEstimados || "",
      activo: ruta.activo,
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    setLoading(true);

    const res = await actualizarRutaAction({
      id: formData.id,
      codigoRuta: formData.codigoRuta,
      nombre: formData.nombre,
      origenDepartamento: formData.origenDepartamento,
      origenProvincia: formData.origenProvincia,
      origenDistrito: formData.origenDistrito,
      origenUbigeo: formData.origenUbigeo,
      origenDireccion: formData.origenDireccion,
      destinoDepartamento: formData.destinoDepartamento,
      destinoProvincia: formData.destinoProvincia,
      destinoDistrito: formData.destinoDistrito,
      destinoUbigeo: formData.destinoUbigeo,
      destinoDireccion: formData.destinoDireccion,
      distanciaEstimadaKm: formData.distanciaEstimadaKm,
      tiempoEstimadoHoras: formData.tiempoEstimadoHoras,
      peajesEstimadosMonto: formData.peajesEstimadosMonto,
      galonesEstimados: formData.galonesEstimados || null,
      activo: formData.activo,
    });

    setLoading(false);

    if (res.success) {
      toast.success(`Ruta ${formData.codigoRuta} actualizada exitosamente.`);
      setOpen(false);
      router.refresh();
      if (onUpdated) onUpdated();
    } else {
      toast.error(res.error || "No se pudo actualizar la ruta.");
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
          title="Editar Ruta"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-[#111827] border border-[#1F2937] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-4 bg-[#0E1524] border-b border-[#1F2937] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <RouteIcon className="h-5 w-5 text-amber-400" />
                <div>
                  <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)] flex items-center gap-2">
                    Editar Ruta de Transporte
                    <span className="font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded text-xs">
                      {formData.codigoRuta}
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

            {/* Form Content */}
            <div
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              className="p-5 space-y-4 overflow-y-auto text-xs"
            >
              {/* Row 1: Codigo y Nombre */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Código Ruta *</label>
                  <input
                    type="text"
                    required
                    value={formData.codigoRuta}
                    onChange={(e) =>
                      setFormData({ ...formData, codigoRuta: e.target.value.toUpperCase() })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-300 font-medium mb-1">Nombre Comercial de Ruta *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-medium focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Seccion Origen */}
              <div className="p-3 bg-[#0B1220] border border-[#1F2937] rounded-lg space-y-2">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-amber-400">
                  <MapPin className="h-3.5 w-3.5" /> Punto de Origen / Despacho
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-slate-400 text-[10px] block mb-0.5">Departamento</label>
                    <input
                      type="text"
                      required
                      value={formData.origenDepartamento}
                      onChange={(e) => setFormData({ ...formData, origenDepartamento: e.target.value })}
                      className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2.5 text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] block mb-0.5">Provincia / Distrito</label>
                    <input
                      type="text"
                      required
                      value={formData.origenDistrito}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          origenDistrito: e.target.value,
                          origenProvincia: e.target.value,
                        })
                      }
                      className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2.5 text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] block mb-0.5">Ubigeo INEI (6 dígitos)</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={formData.origenUbigeo}
                      onChange={(e) => setFormData({ ...formData, origenUbigeo: e.target.value })}
                      className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2.5 text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] block mb-0.5">Dirección / Base de Salida</label>
                  <input
                    type="text"
                    required
                    value={formData.origenDireccion}
                    onChange={(e) => setFormData({ ...formData, origenDireccion: e.target.value })}
                    className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2.5 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Seccion Destino */}
              <div className="p-3 bg-[#0B1220] border border-[#1F2937] rounded-lg space-y-2">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-emerald-400">
                  <MapPin className="h-3.5 w-3.5" /> Punto de Destino / Entrega
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-slate-400 text-[10px] block mb-0.5">Departamento</label>
                    <input
                      type="text"
                      required
                      value={formData.destinoDepartamento}
                      onChange={(e) => setFormData({ ...formData, destinoDepartamento: e.target.value })}
                      className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2.5 text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] block mb-0.5">Provincia / Distrito</label>
                    <input
                      type="text"
                      required
                      value={formData.destinoDistrito}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          destinoDistrito: e.target.value,
                          destinoProvincia: e.target.value,
                        })
                      }
                      className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2.5 text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] block mb-0.5">Ubigeo INEI (6 dígitos)</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={formData.destinoUbigeo}
                      onChange={(e) => setFormData({ ...formData, destinoUbigeo: e.target.value })}
                      className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2.5 text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] block mb-0.5">Dirección / Punto de Entrega</label>
                  <input
                    type="text"
                    required
                    value={formData.destinoDireccion}
                    onChange={(e) => setFormData({ ...formData, destinoDireccion: e.target.value })}
                    className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2.5 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Parametros Operativos */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Distancia (km) *</label>
                  <input
                    type="text"
                    required
                    value={formData.distanciaEstimadaKm}
                    onChange={(e) => setFormData({ ...formData, distanciaEstimadaKm: e.target.value })}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Tiempo Est. (Hrs)</label>
                  <input
                    type="text"
                    required
                    value={formData.tiempoEstimadoHoras}
                    onChange={(e) => setFormData({ ...formData, tiempoEstimadoHoras: e.target.value })}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Peajes Est. (S/.)</label>
                  <input
                    type="text"
                    required
                    value={formData.peajesEstimadosMonto}
                    onChange={(e) => setFormData({ ...formData, peajesEstimadosMonto: e.target.value })}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Diesel Base (Gln)</label>
                  <input
                    type="text"
                    value={formData.galonesEstimados}
                    onChange={(e) => setFormData({ ...formData, galonesEstimados: e.target.value })}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Estado */}
              <div className="p-3 bg-[#0B1220] border border-[#1F2937] rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">Estado de Operatividad</span>
                  <span className="text-[11px] text-slate-400">
                    {formData.activo ? "Ruta activa para despachos" : "Ruta suspendida / inactiva"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, activo: !formData.activo })}
                  className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${
                    formData.activo
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                  }`}
                >
                  {formData.activo ? "Activa" : "Inactiva"}
                </button>
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

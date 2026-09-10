"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  X,
  Loader2,
  Plus,
  Building,
  CheckCircle2,
} from "lucide-react";
import { crearSedeAction } from "@/lib/actions/sedes";
import { toast } from "sonner";

interface ModalNuevaSedeProps {
  onCreated?: () => void;
}

export function ModalNuevaSede({ onCreated }: ModalNuevaSedeProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [nombre, setNombre] = useState("");
  const [codigoSunat, setCodigoSunat] = useState("0002");
  const [direccion, setDireccion] = useState("");
  const [departamento, setDepartamento] = useState("Lima");
  const [provincia, setProvincia] = useState("Lima");
  const [distrito, setDistrito] = useState("Lurín");
  const [ubigeo, setUbigeo] = useState("150119");
  const [telefono, setTelefono] = useState("");
  const [esPrincipal, setEsPrincipal] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!nombre.trim()) {
      toast.error("Ingrese el nombre de la sede o terminal");
      return;
    }
    if (!codigoSunat.trim() || codigoSunat.length !== 4) {
      toast.error("El código SUNAT debe tener 4 dígitos (ej: 0002)");
      return;
    }
    if (!ubigeo.trim() || ubigeo.length !== 6) {
      toast.error("El ubigeo debe tener 6 dígitos numéricos");
      return;
    }

    setLoading(true);
    try {
      const res = await crearSedeAction({
        nombre,
        codigoSunat,
        direccion,
        departamento,
        provincia,
        distrito,
        ubigeo,
        telefono,
        esPrincipal,
      });

      if (res.success) {
        toast.success(res.message || "Terminal creado exitosamente.");
        setOpen(false);
        // Reset
        setNombre("");
        setDireccion("");
        setTelefono("");
        router.refresh();
        onCreated?.();
      } else {
        toast.error(res.error || "No se pudo registrar el terminal.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-8 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
      >
        <Plus className="h-3.5 w-3.5" />
        <span>Agregar Terminal</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#111827] border border-[#1F2937] rounded-2xl shadow-2xl overflow-hidden text-left flex flex-col my-8">
            {/* Header */}
            <div className="p-4 bg-[#0B1220] border-b border-[#1F2937] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
                    Nuevo Terminal / Patio de Maniobras
                  </h3>
                  <p className="text-xs text-slate-400">
                    Establecimiento anexo para inicio o término de viajes de carga pesada
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div
              className="p-5 space-y-4 text-xs"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-slate-300 font-semibold block mb-1">
                    Nombre del Terminal / Patio *
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: Patio Lurín Sur o Terminal Chiclayo"
                    className="w-full bg-[#0B1220] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Cód. Anexo SUNAT *
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={codigoSunat}
                    onChange={(e) => setCodigoSunat(e.target.value)}
                    placeholder="0002"
                    className="w-full bg-[#0B1220] border border-[#1F2937] rounded-lg px-3 py-2 text-white font-mono text-center font-bold focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Dirección Exacta *
                </label>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Ej: Panamericana Sur Km 36.5, Complejo Logístico Megacentro"
                  className="w-full bg-[#0B1220] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Departamento *
                  </label>
                  <input
                    type="text"
                    value={departamento}
                    onChange={(e) => setDepartamento(e.target.value)}
                    placeholder="Lima"
                    className="w-full bg-[#0B1220] border border-[#1F2937] rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Provincia *
                  </label>
                  <input
                    type="text"
                    value={provincia}
                    onChange={(e) => setProvincia(e.target.value)}
                    placeholder="Lima"
                    className="w-full bg-[#0B1220] border border-[#1F2937] rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Distrito *
                  </label>
                  <input
                    type="text"
                    value={distrito}
                    onChange={(e) => setDistrito(e.target.value)}
                    placeholder="Lurín"
                    className="w-full bg-[#0B1220] border border-[#1F2937] rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Ubigeo INEI *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={ubigeo}
                    onChange={(e) => setUbigeo(e.target.value)}
                    placeholder="150119"
                    className="w-full bg-[#0B1220] border border-[#1F2937] rounded-lg px-2 text-white font-mono text-center font-bold focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Teléfono de Contacto (Opcional)
                </label>
                <input
                  type="text"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="01-452-9810"
                  className="w-full bg-[#0B1220] border border-[#1F2937] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Checkbox Base Principal */}
              <div className="p-3 rounded-lg bg-[#0B1220] border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">Marcar como Base Principal</span>
                  <span className="text-[11px] text-slate-400">
                    Aparecerá en el encabezado de documentos y como punto de partida por defecto
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={esPrincipal}
                  onChange={(e) => setEsPrincipal(e.target.checked)}
                  className="h-4 w-4 rounded accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-[#1F2937] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={loading}
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/10 transition-colors cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Registrar Sede</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

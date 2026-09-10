"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, X, UserCheck, Loader2, Phone } from "lucide-react";
import { actualizarConductorAction } from "@/lib/actions/conductores";
import { toast } from "sonner";

interface ConductorData {
  id: string;
  tipoDocumento: "dni" | "ce";
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  contactoEmergencia?: string | null;
  telefonoEmergencia?: string | null;
  fechaNacimiento?: string | null;
  grupoSanguineo?: string | null;
  estado: "disponible" | "en_viaje" | "descanso_medico" | "vacaciones" | "inactivo";
  activo: boolean;
}

interface ModalEditarConductorProps {
  conductor: ConductorData;
  trigger?: React.ReactNode;
  onUpdated?: () => void;
}

export function ModalEditarConductor({ conductor, trigger, onUpdated }: ModalEditarConductorProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    id: conductor.id,
    nombres: conductor.nombres,
    apellidos: conductor.apellidos,
    telefono: conductor.telefono,
    contactoEmergencia: conductor.contactoEmergencia || "",
    telefonoEmergencia: conductor.telefonoEmergencia || "",
    fechaNacimiento: conductor.fechaNacimiento || "",
    grupoSanguineo: conductor.grupoSanguineo || "O+",
    estado: conductor.estado,
    activo: conductor.activo,
  });

  const handleOpen = () => {
    setFormData({
      id: conductor.id,
      nombres: conductor.nombres,
      apellidos: conductor.apellidos,
      telefono: conductor.telefono,
      contactoEmergencia: conductor.contactoEmergencia || "",
      telefonoEmergencia: conductor.telefonoEmergencia || "",
      fechaNacimiento: conductor.fechaNacimiento || "",
      grupoSanguineo: conductor.grupoSanguineo || "O+",
      estado: conductor.estado,
      activo: conductor.activo,
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    setLoading(true);

    const res = await actualizarConductorAction({
      id: formData.id,
      nombres: formData.nombres,
      apellidos: formData.apellidos,
      telefono: formData.telefono,
      contactoEmergencia: formData.contactoEmergencia || null,
      telefonoEmergencia: formData.telefonoEmergencia || null,
      fechaNacimiento: formData.fechaNacimiento || null,
      grupoSanguineo: formData.grupoSanguineo || null,
      estado: formData.estado,
      activo: formData.activo,
    });

    setLoading(false);

    if (res.success) {
      toast.success(`Conductor ${formData.nombres} ${formData.apellidos} actualizado.`);
      setOpen(false);
      router.refresh();
      if (onUpdated) onUpdated();
    } else {
      toast.error(res.error || "No se pudo actualizar el conductor.");
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
          title="Editar Conductor"
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
                <UserCheck className="h-5 w-5 text-amber-400" />
                <div>
                  <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)] flex items-center gap-2">
                    Editar Datos del Conductor
                    <span className="font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded text-xs">
                      {conductor.tipoDocumento.toUpperCase()}: {conductor.numeroDocumento}
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
              {/* Row 1: Nombres y Apellidos */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Nombres *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombres}
                    onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Apellidos *</label>
                  <input
                    type="text"
                    required
                    value={formData.apellidos}
                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Teléfono Celular y Grupo Sanguíneo */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1">
                    <Phone className="h-3 w-3 text-amber-400" />
                    Teléfono Celular *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Grupo Sanguíneo</label>
                  <select
                    value={formData.grupoSanguineo}
                    onChange={(e) => setFormData({ ...formData, grupoSanguineo: e.target.value })}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                  >
                    <option value="O+">O Positivo (O+)</option>
                    <option value="O-">O Negativo (O-)</option>
                    <option value="A+">A Positivo (A+)</option>
                    <option value="A-">A Negativo (A-)</option>
                    <option value="B+">B Positivo (B+)</option>
                    <option value="B-">B Negativo (B-)</option>
                    <option value="AB+">AB Positivo (AB+)</option>
                    <option value="AB-">AB Negativo (AB-)</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Contacto y Teléfono de Emergencia */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Contacto de Emergencia
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Esposa - Rosa Quispe"
                    value={formData.contactoEmergencia}
                    onChange={(e) =>
                      setFormData({ ...formData, contactoEmergencia: e.target.value })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Teléfono de Emergencia
                  </label>
                  <input
                    type="tel"
                    placeholder="999-999-999"
                    value={formData.telefonoEmergencia}
                    onChange={(e) =>
                      setFormData({ ...formData, telefonoEmergencia: e.target.value })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 4: Estado Operativo */}
              <div className="p-3 bg-[#0B1220] border border-[#1F2937] rounded-lg text-xs space-y-2">
                <label className="block text-slate-300 font-semibold">
                  Estado Operativo del Conductor
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, estado: "disponible" })}
                    className={`py-2 px-2.5 rounded text-xs font-semibold border transition-all text-left ${
                      formData.estado === "disponible"
                        ? "bg-blue-500/20 text-blue-400 border-blue-500"
                        : "bg-slate-900 text-slate-400 border-[#1F2937] hover:border-slate-600"
                    }`}
                  >
                    🔵 Disponible
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, estado: "en_viaje" })}
                    className={`py-2 px-2.5 rounded text-xs font-semibold border transition-all text-left ${
                      formData.estado === "en_viaje"
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500"
                        : "bg-slate-900 text-slate-400 border-[#1F2937] hover:border-slate-600"
                    }`}
                  >
                    🟢 En Viaje / Ruta
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, estado: "descanso_medico" })}
                    className={`py-2 px-2.5 rounded text-xs font-semibold border transition-all text-left ${
                      formData.estado === "descanso_medico"
                        ? "bg-amber-500/20 text-amber-400 border-amber-500"
                        : "bg-slate-900 text-slate-400 border-[#1F2937] hover:border-slate-600"
                    }`}
                  >
                    🟡 Descanso Méd.
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, estado: "vacaciones" })}
                    className={`py-2 px-2.5 rounded text-xs font-semibold border transition-all text-left ${
                      formData.estado === "vacaciones"
                        ? "bg-purple-500/20 text-purple-400 border-purple-500"
                        : "bg-slate-900 text-slate-400 border-[#1F2937] hover:border-slate-600"
                    }`}
                  >
                    🟣 Vacaciones
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, estado: "inactivo" })}
                    className={`py-2 px-2.5 rounded text-xs font-semibold border transition-all text-left col-span-2 sm:col-span-1 ${
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

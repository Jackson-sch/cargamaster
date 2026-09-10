"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, UserCheck, Loader2, Award } from "lucide-react";
import { crearConductorAction } from "@/lib/actions/conductores";
import { toast } from "sonner";

export function ModalNuevoConductor({ onCreated }: { onCreated?: () => void }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tipoDocumento: "dni" as "dni" | "ce",
    numeroDocumento: "",
    nombres: "",
    apellidos: "",
    telefono: "",
    contactoEmergencia: "",
    telefonoEmergencia: "",
    fechaNacimiento: "",
    grupoSanguineo: "O+",
    categoriaLicencia: "A-IIIc" as "A-IIb" | "A-IIIa" | "A-IIIb" | "A-IIIc",
    numeroLicencia: "",
    fechaExpedicion: new Date().toISOString().split("T")[0],
    fechaRevalidacion: "",
    puntosAcumuladosMtc: 0,
    certificacionMatpel: true,
    certificacionSeguridadVial: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fechaRevalidacion) {
      toast.error("Ingresa la fecha de revalidación de la licencia MTC.");
      return;
    }

    setLoading(true);
    const res = await crearConductorAction(formData);
    setLoading(false);

    if (res.success) {
      toast.success(`Conductor ${formData.nombres} registrado con éxito.`);
      setOpen(false);
      router.refresh();
      setFormData({
        tipoDocumento: "dni",
        numeroDocumento: "",
        nombres: "",
        apellidos: "",
        telefono: "",
        contactoEmergencia: "",
        telefonoEmergencia: "",
        fechaNacimiento: "",
        grupoSanguineo: "O+",
        categoriaLicencia: "A-IIIc",
        numeroLicencia: "",
        fechaExpedicion: new Date().toISOString().split("T")[0],
        fechaRevalidacion: "",
        puntosAcumuladosMtc: 0,
        certificacionMatpel: true,
        certificacionSeguridadVial: true,
      });
      if (onCreated) onCreated();
    } else {
      toast.error(res.error || "No se pudo registrar al conductor.");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="h-9 px-4 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
      >
        <Plus className="h-4 w-4" />
        <span>Registrar Conductor</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#111827] border border-[#1F2937] rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-[#0E1524] border-b border-[#1F2937] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-amber-400" />
                <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
                  Registrar Nuevo Conductor Profesional
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
                    DNI / Documento *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="8 dígitos"
                    value={formData.numeroDocumento}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numeroDocumento: e.target.value,
                        numeroLicencia: formData.numeroLicencia || `Q${e.target.value}`,
                      })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Teléfono Celular *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="999 123 456"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Nombres *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombres}
                    onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.apellidos}
                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Categoría Licencia MTC *
                  </label>
                  <select
                    value={formData.categoriaLicencia}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        categoriaLicencia: e.target.value as any,
                      })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-semibold focus:border-amber-500 focus:outline-none"
                  >
                    <option value="A-IIIc">A-IIIc (Articulado Pesado - Tracto)</option>
                    <option value="A-IIIb">A-IIIb (Pesado Rígido)</option>
                    <option value="A-IIIa">A-IIIa (Ómnibus)</option>
                    <option value="A-IIb">A-IIb (Camionetas / Camiones medianos)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    N° Licencia MTC *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Q42819204"
                    value={formData.numeroLicencia}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numeroLicencia: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Fecha Revalidación MTC *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fechaRevalidacion}
                    onChange={(e) =>
                      setFormData({ ...formData, fechaRevalidacion: e.target.value })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Puntos Acumulados MTC
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.puntosAcumuladosMtc}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        puntosAcumuladosMtc: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Certifications Switches */}
              <div className="bg-[#0B1220] p-3 rounded-lg border border-[#1F2937] space-y-2 text-xs">
                <span className="font-semibold text-slate-200 block mb-1">
                  Certificaciones y Cursos MTC Activos
                </span>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.certificacionMatpel}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        certificacionMatpel: e.target.checked,
                      })
                    }
                    className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Certificación MATPEL (Mercancías Peligrosas / Minería)</span>
                </label>

                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.certificacionSeguridadVial}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        certificacionSeguridadVial: e.target.checked,
                      })
                    }
                    className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Curso Anual de Seguridad Vial y Normativa SUTRAN</span>
                </label>
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
                  <span>Guardar Conductor</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

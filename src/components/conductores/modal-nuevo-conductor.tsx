"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit2,
  UserCheck,
  Loader2,
  Phone,
  Calendar,
  HeartPulse,
  Award,
  IdCard,
  AlertTriangle,
  User,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { crearConductorAction, actualizarConductorAction } from "@/lib/actions/conductores";
import { toast } from "sonner";
import { FormFieldset, FormSelect, FormInput } from "@/components/ui/form-controls";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";

export interface ConductorItem {
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

export interface ModalConductorProps {
  conductor?: ConductorItem | null;
  trigger?: React.ReactNode;
  onCreated?: () => void;
  onUpdated?: () => void;
}

export function ModalNuevoConductor({
  conductor,
  trigger,
  onCreated,
  onUpdated,
}: ModalConductorProps) {
  const router = useRouter();
  const isEditing = Boolean(conductor);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const getInitialForm = () => ({
    tipoDocumento: conductor?.tipoDocumento || ("dni" as "dni" | "ce"),
    numeroDocumento: conductor?.numeroDocumento || "",
    nombres: conductor?.nombres || "",
    apellidos: conductor?.apellidos || "",
    telefono: conductor?.telefono || "",
    contactoEmergencia: conductor?.contactoEmergencia || "",
    telefonoEmergencia: conductor?.telefonoEmergencia || "",
    fechaNacimiento: conductor?.fechaNacimiento || "",
    grupoSanguineo: conductor?.grupoSanguineo || "O+",
    estado: conductor?.estado || ("disponible" as const),
    activo: conductor?.activo ?? true,
    // Licencia inicial (creación)
    categoriaLicencia: "A-IIIc" as "A-IIb" | "A-IIIa" | "A-IIIb" | "A-IIIc",
    numeroLicencia: "",
    fechaExpedicion: new Date().toISOString().split("T")[0],
    fechaRevalidacion: "",
    puntosAcumuladosMtc: 0,
    certificacionMatpel: true,
    certificacionSeguridadVial: true,
  });

  const [formData, setFormData] = useState(getInitialForm());

  useEffect(() => {
    if (open) {
      setFormData(getInitialForm());
    }
  }, [open, conductor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditing && !formData.fechaRevalidacion) {
      toast.error("Ingresa la fecha de revalidación de la licencia MTC.");
      return;
    }

    setLoading(true);

    if (isEditing && conductor) {
      const res = await actualizarConductorAction({
        id: conductor.id,
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
        toast.success(`Conductor ${formData.nombres} actualizado con éxito.`);
        setOpen(false);
        router.refresh();
        if (onUpdated) onUpdated();
      } else {
        toast.error(res.error || "No se pudo actualizar el conductor.");
      }
    } else {
      const res = await crearConductorAction({
        tipoDocumento: formData.tipoDocumento,
        numeroDocumento: formData.numeroDocumento,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        telefono: formData.telefono,
        contactoEmergencia: formData.contactoEmergencia || undefined,
        telefonoEmergencia: formData.telefonoEmergencia || undefined,
        fechaNacimiento: formData.fechaNacimiento || undefined,
        grupoSanguineo: formData.grupoSanguineo || undefined,
        categoriaLicencia: formData.categoriaLicencia,
        numeroLicencia: formData.numeroLicencia,
        fechaExpedicion: formData.fechaExpedicion,
        fechaRevalidacion: formData.fechaRevalidacion,
        puntosAcumuladosMtc: formData.puntosAcumuladosMtc,
        certificacionMatpel: formData.certificacionMatpel,
        certificacionSeguridadVial: formData.certificacionSeguridadVial,
      });

      setLoading(false);

      if (res.success) {
        toast.success(`Conductor ${formData.nombres} registrado con éxito.`);
        setOpen(false);
        router.refresh();
        setFormData(getInitialForm());
        if (onCreated) onCreated();
      } else {
        toast.error(res.error || "No se pudo registrar al conductor.");
      }
    }
  };

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)} className="inline-block cursor-pointer">
          {trigger}
        </div>
      ) : isEditing ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          title="Editar Conductor"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="h-9 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Registrar Conductor</span>
        </button>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl md:max-w-2xl bg-[#0E1524] border-l border-[#1F2937] p-0 flex flex-col h-full shadow-2xl text-slate-100"
        >
          {/* Header */}
          <SheetHeader className="p-5 bg-[#0B1220] border-b border-[#1F2937] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <SheetTitle className="text-base font-bold text-white font-[family-name:var(--font-sora)] flex items-center gap-2">
                  {isEditing ? "Editar Conductor" : "Registrar Nuevo Conductor Profesional"}
                  {isEditing && (
                    <span className="font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded text-xs border border-amber-400/20">
                      {formData.numeroDocumento}
                    </span>
                  )}
                </SheetTitle>
                <SheetDescription className="text-xs text-slate-400 mt-0.5">
                  {isEditing
                    ? "Actualice los datos personales, contacto de auxilio y estado operativo"
                    : "Habilitación de nómina de pilotos homologados MTC y SUTRAN"}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
              <FormFieldset
                title="1. Identificación & Datos Personales"
                description="Documento de identidad, nombres y datos médicos"
                icon={User}
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <FormSelect
                    label="Tipo Doc."
                    required
                    disabled={isEditing}
                    value={formData.tipoDocumento}
                    onChange={(e) =>
                      setFormData({ ...formData, tipoDocumento: e.target.value as "dni" | "ce" })
                    }
                  >
                    <option value="dni">DNI (Perú)</option>
                    <option value="ce">Carné Extranjería</option>
                  </FormSelect>

                  <FormInput
                    label="N° Documento"
                    required
                    disabled={isEditing}
                    icon={IdCard}
                    placeholder="8 dígitos"
                    maxLength={10}
                    value={formData.numeroDocumento}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numeroDocumento: e.target.value,
                        numeroLicencia: formData.numeroLicencia || `Q${e.target.value}`,
                      })
                    }
                  />

                  <FormInput
                    label="Teléfono Celular"
                    required
                    icon={Phone}
                    placeholder="999 123 456"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormInput
                    label="Nombres"
                    required
                    placeholder="Juan Carlos"
                    value={formData.nombres}
                    onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                  />

                  <FormInput
                    label="Apellidos"
                    required
                    placeholder="Pérez Mendoza"
                    value={formData.apellidos}
                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormInput
                    label="Fecha de Nacimiento"
                    type="date"
                    icon={Calendar}
                    value={formData.fechaNacimiento}
                    onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                  />

                  <FormSelect
                    label="Grupo Sanguíneo"
                    icon={HeartPulse}
                    value={formData.grupoSanguineo}
                    onChange={(e) => setFormData({ ...formData, grupoSanguineo: e.target.value })}
                  >
                    <option value="O+">O Positivo (O+)</option>
                    <option value="O-">O Negativo (O-)</option>
                    <option value="A+">A Positivo (A+)</option>
                    <option value="A-">A Negativo (A-)</option>
                    <option value="B+">B Positivo (B+)</option>
                    <option value="B-">B Negativo (B-)</option>
                    <option value="AB+">AB Positivo (AB+)</option>
                  </FormSelect>
                </div>
              </FormFieldset>

              <FormFieldset
                title="2. Contacto de Emergencia"
                description="Persona y teléfono de contacto para auxilio o accidentes en ruta"
                icon={Phone}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormInput
                    label="Nombre de Contacto"
                    placeholder="Familiar / Cónyuge"
                    value={formData.contactoEmergencia}
                    onChange={(e) =>
                      setFormData({ ...formData, contactoEmergencia: e.target.value })
                    }
                  />

                  <FormInput
                    label="Teléfono de Emergencia"
                    icon={Phone}
                    placeholder="987 654 321"
                    value={formData.telefonoEmergencia}
                    onChange={(e) =>
                      setFormData({ ...formData, telefonoEmergencia: e.target.value })
                    }
                  />
                </div>
              </FormFieldset>

              {!isEditing && (
                <>
                  <FormFieldset
                    title="3. Licencia de Conducir MTC"
                    description="Datos iniciales de brevete profesional y puntos acumulados"
                    icon={ShieldCheck}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FormSelect
                        label="Categoría Licencia MTC"
                        required
                        value={formData.categoriaLicencia}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            categoriaLicencia: e.target.value as any,
                          })
                        }
                      >
                        <option value="A-IIIc">A-IIIc (Articulado Pesado - Tracto)</option>
                        <option value="A-IIIb">A-IIIb (Pesado Rígido)</option>
                        <option value="A-IIIa">A-IIIa (Ómnibus)</option>
                        <option value="A-IIb">A-IIb (Camionetas / Camiones medianos)</option>
                      </FormSelect>

                      <FormInput
                        label="N° Licencia MTC"
                        required
                        placeholder="Q42819204"
                        value={formData.numeroLicencia}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            numeroLicencia: e.target.value.toUpperCase(),
                          })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <FormInput
                        label="Fecha Expedición"
                        type="date"
                        value={formData.fechaExpedicion}
                        onChange={(e) =>
                          setFormData({ ...formData, fechaExpedicion: e.target.value })
                        }
                      />

                      <FormInput
                        label="Fecha Revalidación MTC"
                        required
                        type="date"
                        value={formData.fechaRevalidacion}
                        onChange={(e) =>
                          setFormData({ ...formData, fechaRevalidacion: e.target.value })
                        }
                      />

                      <FormInput
                        label="Puntos Acumulados"
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
                      />
                    </div>
                  </FormFieldset>

                  <FormFieldset
                    title="4. Certificaciones Obligatorias MTC"
                    description="Homologaciones técnicas para transporte de carga especial"
                    icon={Award}
                  >
                    <div className="space-y-2 text-xs">
                      <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0B1220] border border-[#1F2937] text-slate-300 cursor-pointer hover:border-slate-600 transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.certificacionMatpel}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              certificacionMatpel: e.target.checked,
                            })
                          }
                          className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 h-4 w-4"
                        />
                        <div>
                          <span className="font-semibold text-white block">
                            Certificación MATPEL (Materiales Peligrosos / Minería)
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Autoriza el transporte de insumos químicos, combustibles y concentrados
                          </span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0B1220] border border-[#1F2937] text-slate-300 cursor-pointer hover:border-slate-600 transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.certificacionSeguridadVial}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              certificacionSeguridadVial: e.target.checked,
                            })
                          }
                          className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 h-4 w-4"
                        />
                        <div>
                          <span className="font-semibold text-white block">
                            Curso Anual de Seguridad Vial y Normativa SUTRAN
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Acreditación vigente de inducción de manejo defensivo y jornadas máximas
                          </span>
                        </div>
                      </label>
                    </div>
                  </FormFieldset>
                </>
              )}

              {isEditing && (
                <FormFieldset
                  title="3. Estado Operativo del Conductor"
                  description="Disponibilidad para asignación de ruta y viajes en despacho"
                  icon={Activity}
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, estado: "disponible" })}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
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
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                        formData.estado === "en_viaje"
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500"
                          : "bg-slate-900 text-slate-400 border-[#1F2937] hover:border-slate-600"
                      }`}
                    >
                      🟢 En Viaje
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, estado: "descanso_medico" })}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
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
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
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
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                        formData.estado === "inactivo"
                          ? "bg-rose-500/20 text-rose-400 border-rose-500"
                          : "bg-slate-900 text-slate-400 border-[#1F2937] hover:border-slate-600"
                      }`}
                    >
                      🔴 Inactivo / Baja
                    </button>
                  </div>
                </FormFieldset>
              )}
            </div>

            {/* Footer Buttons */}
            <SheetFooter className="p-4 bg-[#0B1220] border-t border-[#1F2937] flex flex-row items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-9 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="h-9 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>{isEditing ? "Guardar Cambios" : "Guardar Conductor"}</span>
              </button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}

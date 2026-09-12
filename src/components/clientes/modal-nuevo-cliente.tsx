"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit2,
  Building2,
  Loader2,
  FileText,
  MapPin,
  User,
  Phone,
  Mail,
  CreditCard,
  Briefcase,
} from "lucide-react";
import { crearClienteAction, actualizarClienteAction } from "@/lib/actions/clientes";
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

export interface ClienteItem {
  id: string;
  tipoDocumento: "ruc" | "dni";
  numeroDocumento: string;
  razonSocial: string;
  direccionFiscal: string;
  departamento?: string | null;
  provincia?: string | null;
  distrito?: string | null;
  ubigeo?: string | null;
  contactoNombre?: string | null;
  contactoTelefono?: string | null;
  contactoEmail?: string | null;
  condicionPagoDias: "contado" | "15_dias" | "30_dias" | "45_dias" | "60_dias";
  activo?: boolean;
}

export interface ModalClienteProps {
  cliente?: ClienteItem | null;
  onCreated?: () => void;
  onUpdated?: () => void;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function ModalNuevoCliente({
  cliente,
  onCreated,
  onUpdated,
  onSuccess,
  trigger,
}: ModalClienteProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(cliente && cliente.id);

  const getInitialState = () => {
    if (cliente) {
      return {
        id: cliente.id,
        tipoDocumento: cliente.tipoDocumento || "ruc",
        numeroDocumento: cliente.numeroDocumento || "",
        razonSocial: cliente.razonSocial || "",
        direccionFiscal: cliente.direccionFiscal || "",
        departamento: cliente.departamento || "Lima",
        provincia: cliente.provincia || "Lima",
        distrito: cliente.distrito || "",
        ubigeo: cliente.ubigeo || "",
        contactoNombre: cliente.contactoNombre || "",
        contactoTelefono: cliente.contactoTelefono || "",
        contactoEmail: cliente.contactoEmail || "",
        condicionPagoDias: cliente.condicionPagoDias || "30_dias",
      };
    }
    return {
      id: "",
      tipoDocumento: "ruc" as "ruc" | "dni",
      numeroDocumento: "",
      razonSocial: "",
      direccionFiscal: "",
      departamento: "Lima",
      provincia: "Lima",
      distrito: "",
      ubigeo: "",
      contactoNombre: "",
      contactoTelefono: "",
      contactoEmail: "",
      condicionPagoDias: "30_dias" as "contado" | "15_dias" | "30_dias" | "45_dias" | "60_dias",
    };
  };

  const [formData, setFormData] = useState(getInitialState);

  useEffect(() => {
    if (open) {
      setFormData(getInitialState());
    }
  }, [open, cliente]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.numeroDocumento || !formData.razonSocial || !formData.direccionFiscal) {
      toast.error("Por favor completa los campos obligatorios (*).");
      return;
    }

    setLoading(true);
    try {
      if (isEdit && cliente) {
        const res = await actualizarClienteAction({
          ...formData,
          id: cliente.id,
        });

        if (res.success) {
          toast.success(`Cliente ${formData.razonSocial} actualizado exitosamente.`);
          setOpen(false);
          router.refresh();
          onUpdated?.();
          onSuccess?.();
        } else {
          toast.error(res.error || "No se pudo actualizar el cliente.");
        }
      } else {
        const res = await crearClienteAction(formData);

        if (res.success) {
          toast.success(`Cliente ${formData.razonSocial} registrado exitosamente.`);
          setOpen(false);
          router.refresh();
          onCreated?.();
          onSuccess?.();
        } else {
          toast.error(res.error || "No se pudo registrar al cliente.");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al procesar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)} className="cursor-pointer">
          {trigger}
        </span>
      ) : isEdit ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          title="Editar Cliente"
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 border border-slate-700 transition-colors"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="h-9 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Registrar Cliente</span>
        </button>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl md:max-w-2xl p-0 flex flex-col h-full bg-[#0E1524] border-l border-[#1F2937] text-left"
        >
          {/* Header */}
          <SheetHeader className="p-5 bg-[#0B1220] border-b border-[#1F2937] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <SheetTitle className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
                  {isEdit ? `Editar Cliente: ${cliente?.razonSocial}` : "Registrar Cliente Dador de Carga"}
                </SheetTitle>
                <SheetDescription className="text-[11px] text-slate-400">
                  {isEdit
                    ? "Actualización tributaria SUNAT y condiciones comerciales de flete"
                    : "Información tributaria SUNAT y términos comerciales de despacho"}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
            <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              <FormFieldset
                title="1. Datos Tributarios & SUNAT"
                description="RUC verificado ante SUNAT para emisión de GRE y facturas electrónicas UBL 2.1"
                icon={FileText}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <FormSelect
                    label="Tipo Doc."
                    required
                    value={formData.tipoDocumento}
                    onChange={(e) =>
                      setFormData({ ...formData, tipoDocumento: e.target.value as any })
                    }
                  >
                    <option value="ruc">RUC (Empresa)</option>
                    <option value="dni">DNI (Persona)</option>
                  </FormSelect>

                  <div className="md:col-span-2">
                    <FormInput
                      label="Número de RUC / DNI"
                      required
                      icon={Briefcase}
                      placeholder={formData.tipoDocumento === "ruc" ? "11 dígitos (20...)" : "8 dígitos"}
                      value={formData.numeroDocumento}
                      onChange={(e) =>
                        setFormData({ ...formData, numeroDocumento: e.target.value })
                      }
                    />
                  </div>
                </div>

                <FormInput
                  label="Razón Social / Nombre Comercial"
                  required
                  icon={Building2}
                  placeholder="Ej. MINERA LAS BAMBAS S.A."
                  value={formData.razonSocial}
                  onChange={(e) =>
                    setFormData({ ...formData, razonSocial: e.target.value })
                  }
                />

                <FormInput
                  label="Dirección Fiscal Completa"
                  required
                  icon={MapPin}
                  placeholder="Av. Principal N° 123, Distrito, Lima"
                  value={formData.direccionFiscal}
                  onChange={(e) =>
                    setFormData({ ...formData, direccionFiscal: e.target.value })
                  }
                />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  <FormInput
                    label="Departamento"
                    placeholder="Ej. Lima"
                    value={formData.departamento || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, departamento: e.target.value })
                    }
                  />
                  <FormInput
                    label="Provincia"
                    placeholder="Ej. Lima"
                    value={formData.provincia || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, provincia: e.target.value })
                    }
                  />
                  <FormInput
                    label="Distrito"
                    placeholder="Ej. Callao"
                    value={formData.distrito || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, distrito: e.target.value })
                    }
                  />
                  <FormInput
                    label="Ubigeo"
                    placeholder="150101"
                    value={formData.ubigeo || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, ubigeo: e.target.value })
                    }
                  />
                </div>
              </FormFieldset>

              <FormFieldset
                title="2. Contacto & Coordinación de Despacho"
                description="Personal asignado para confirmación de carga y recepción en destino"
                icon={User}
              >
                <FormInput
                  label="Nombre Contacto Logístico"
                  icon={User}
                  placeholder="Ej. Ing. Carlos Mendoza - Jefe Despacho"
                  value={formData.contactoNombre}
                  onChange={(e) =>
                    setFormData({ ...formData, contactoNombre: e.target.value })
                  }
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormInput
                    label="Teléfono / Celular"
                    icon={Phone}
                    placeholder="999 123 456"
                    value={formData.contactoTelefono}
                    onChange={(e) =>
                      setFormData({ ...formData, contactoTelefono: e.target.value })
                    }
                  />

                  <FormInput
                    label="Correo Facturación / Alertas"
                    icon={Mail}
                    type="email"
                    placeholder="logistica@empresa.pe"
                    value={formData.contactoEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, contactoEmail: e.target.value })
                    }
                  />
                </div>
              </FormFieldset>

              <FormFieldset
                title="3. Condiciones Comerciales"
                description="Acuerdos de crédito y cobranza para liquidación de fletes SPOT"
                icon={CreditCard}
              >
                <FormSelect
                  label="Condición Comercial de Pago"
                  required
                  icon={CreditCard}
                  value={formData.condicionPagoDias}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      condicionPagoDias: e.target.value as any,
                    })
                  }
                >
                  <option value="contado">Contado (Contra Entrega / Pre-pago)</option>
                  <option value="15_dias">Crédito a 15 días</option>
                  <option value="30_dias">Crédito a 30 días (Estándar)</option>
                  <option value="45_dias">Crédito a 45 días</option>
                  <option value="60_dias">Crédito a 60 días (Corporativo)</option>
                </FormSelect>
              </FormFieldset>
            </div>

            {/* Footer */}
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
                className="h-9 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>{isEdit ? "Guardar Cambios" : "Guardar Cliente"}</span>
              </button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}

// Alias de exportación para máxima compatibilidad
export const ModalEditarCliente = ModalNuevoCliente;

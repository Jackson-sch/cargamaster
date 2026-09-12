"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Edit2,
  Wrench,
  Loader2,
  Calendar,
  DollarSign,
  Truck,
  Building,
  Gauge,
  FileText,
} from "lucide-react";
import { actualizarMantenimientoAction } from "@/lib/actions/mantenimiento";
import { toast } from "sonner";
import {
  FormFieldset,
  FormSelect,
  FormInput,
  FormTextarea,
} from "@/components/ui/form-controls";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";

export interface MantenimientoItemForEdit {
  id: string;
  placa: string;
  entidadTipo: "unidad" | "semirremolque";
  tipo: "preventivo" | "correctivo";
  descripcion: string;
  odometroRegistro?: number | null;
  fechaProgramada: string;
  taller: "propio" | "tercero";
  nombreTaller: string;
  costoManoObra: string | number;
  costoRepuestos: string | number;
  costoTotal: string | number;
  observaciones?: string | null;
}

interface ModalEditarMantenimientoProps {
  mantenimiento: MantenimientoItemForEdit;
  onUpdated?: () => void;
}

export function ModalEditarMantenimiento({
  mantenimiento,
  onUpdated,
}: ModalEditarMantenimientoProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    id: mantenimiento.id,
    tipo: mantenimiento.tipo,
    descripcion: mantenimiento.descripcion,
    odometroRegistro: mantenimiento.odometroRegistro || "",
    fechaProgramada: mantenimiento.fechaProgramada,
    taller: mantenimiento.taller,
    nombreTaller: mantenimiento.nombreTaller,
    costoManoObra: parseFloat(mantenimiento.costoManoObra?.toString() || "0"),
    costoRepuestos: parseFloat(mantenimiento.costoRepuestos?.toString() || "0"),
    costoTotal: parseFloat(mantenimiento.costoTotal?.toString() || "0"),
    observaciones: mantenimiento.observaciones || "",
  });

  const handleCostoChange = (field: "costoManoObra" | "costoRepuestos", value: number) => {
    const mo = field === "costoManoObra" ? value : formData.costoManoObra;
    const rep = field === "costoRepuestos" ? value : formData.costoRepuestos;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      costoTotal: Number((mo + rep).toFixed(2)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.descripcion.trim()) {
      toast.error("La descripción del servicio es obligatoria.");
      return;
    }
    if (!formData.nombreTaller.trim()) {
      toast.error("El nombre del taller es obligatorio.");
      return;
    }

    setLoading(true);
    const res = await actualizarMantenimientoAction({
      id: formData.id,
      tipo: formData.tipo,
      descripcion: formData.descripcion,
      odometroRegistro: formData.odometroRegistro ? Number(formData.odometroRegistro) : undefined,
      fechaProgramada: formData.fechaProgramada,
      taller: formData.taller,
      nombreTaller: formData.nombreTaller,
      costoManoObra: formData.costoManoObra,
      costoRepuestos: formData.costoRepuestos,
      costoTotal: formData.costoTotal,
      observaciones: formData.observaciones,
    });
    setLoading(false);

    if (res.success) {
      toast.success(res.message || "Orden de mantenimiento actualizada.");
      setOpen(false);
      router.refresh();
      if (onUpdated) onUpdated();
    } else {
      toast.error(res.error || "No se pudo actualizar la orden de trabajo.");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Editar Orden de Trabajo"
        className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 border border-slate-700 transition-colors"
      >
        <Edit2 className="h-3.5 w-3.5" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl md:max-w-2xl bg-[#0E1524] border-l border-[#1F2937] p-0 flex flex-col h-full shadow-2xl text-slate-100"
        >
          {/* Header */}
          <SheetHeader className="p-5 bg-[#0B1220] border-b border-[#1F2937] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <SheetTitle className="text-base font-bold text-white font-[family-name:var(--font-sora)] flex items-center gap-2">
                  Editar Orden de Trabajo
                  <span className="font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded text-xs border border-amber-400/20">
                    {mantenimiento.placa}
                  </span>
                </SheetTitle>
                <SheetDescription className="text-xs text-slate-400 mt-0.5">
                  Modificación de rutina técnica y presupuesto operativo
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
              <FormFieldset
                title="1. Rutina Técnica & Programación"
                description="Clasificación de servicio y fecha programada de ingreso"
                icon={Wrench}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormSelect
                    label="Tipo de Mantenimiento"
                    required
                    value={formData.tipo}
                    onChange={(e) =>
                      setFormData({ ...formData, tipo: e.target.value as any })
                    }
                  >
                    <option value="preventivo">Preventivo (Programado)</option>
                    <option value="correctivo">Correctivo (Avería / Auxilio)</option>
                  </FormSelect>

                  <FormInput
                    label="Fecha Programada"
                    required
                    type="date"
                    icon={Calendar}
                    value={formData.fechaProgramada}
                    onChange={(e) =>
                      setFormData({ ...formData, fechaProgramada: e.target.value })
                    }
                  />
                </div>

                <FormTextarea
                  label="Descripción del Servicio / Rutina"
                  required
                  rows={3}
                  placeholder="Detalle de actividades preventivas o correctivas a realizar..."
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                />
              </FormFieldset>

              <FormFieldset
                title="2. Ubicación & Taller Autorizado"
                description="Sede de intervención y kilometraje de ingreso"
                icon={Building}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormSelect
                    label="Tipo de Taller"
                    required
                    value={formData.taller}
                    onChange={(e) =>
                      setFormData({ ...formData, taller: e.target.value as any })
                    }
                  >
                    <option value="propio">Taller Propio / Base Principal</option>
                    <option value="tercero">Taller Tercero / Concesionario Homologado</option>
                  </FormSelect>

                  <FormInput
                    label="Nombre del Taller / Sede"
                    required
                    placeholder="Ej. Taller Central Lurín / Divemotor"
                    value={formData.nombreTaller}
                    onChange={(e) =>
                      setFormData({ ...formData, nombreTaller: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormInput
                    label="Odómetro al Ingreso"
                    type="number"
                    suffix="Km"
                    icon={Gauge}
                    placeholder="185200"
                    value={formData.odometroRegistro}
                    onChange={(e) =>
                      setFormData({ ...formData, odometroRegistro: e.target.value })
                    }
                  />

                  <FormInput
                    label="Observaciones Técnicas"
                    icon={FileText}
                    placeholder="Garantía, repuestos, notas de taller..."
                    value={formData.observaciones}
                    onChange={(e) =>
                      setFormData({ ...formData, observaciones: e.target.value })
                    }
                  />
                </div>
              </FormFieldset>

              <FormFieldset
                title="3. Presupuesto & Liquidación de Costos"
                description="Desglose en Soles (PEN) para control contable y coste por kilómetro"
                icon={DollarSign}
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <FormInput
                    label="Mano de Obra (S/)"
                    type="number"
                    step="0.01"
                    min="0"
                    prefix="S/"
                    value={formData.costoManoObra}
                    onChange={(e) =>
                      handleCostoChange("costoManoObra", parseFloat(e.target.value) || 0)
                    }
                  />

                  <FormInput
                    label="Repuestos & Insumos (S/)"
                    type="number"
                    step="0.01"
                    min="0"
                    prefix="S/"
                    value={formData.costoRepuestos}
                    onChange={(e) =>
                      handleCostoChange("costoRepuestos", parseFloat(e.target.value) || 0)
                    }
                  />

                  <div>
                    <label className="block text-xs font-medium text-amber-400 mb-1">
                      Total Liquidado (S/)
                    </label>
                    <div className="h-10 px-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center font-mono font-bold text-amber-300 text-sm">
                      S/ {formData.costoTotal.toFixed(2)}
                    </div>
                  </div>
                </div>
              </FormFieldset>
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
                <span>Guardar Cambios</span>
              </button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit2,
  Layers,
  Loader2,
  Tag,
  Calendar,
  Weight,
  Box,
  Activity,
} from "lucide-react";
import { crearSemirremolqueAction, actualizarSemirremolqueAction } from "@/lib/actions/flota";
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

export interface SemirremolqueItem {
  id: string;
  placa: string;
  tipoCarroceria:
    | "plataforma"
    | "cama_baja"
    | "cisterna"
    | "furgon"
    | "tolva_granelera"
    | "portacontenedor";
  marca?: string | null;
  anioFabricacion?: number | null;
  ejes: number;
  pesoNetoTn?: string | null;
  cargaUtilMaxTn: string;
  volumenM3?: string | null;
  estado: "disponible" | "acoplado" | "mantenimiento" | "inactivo";
  activo: boolean;
}

export interface ModalSemirremolqueProps {
  semirremolque?: SemirremolqueItem | null;
  trigger?: React.ReactNode;
  onCreated?: () => void;
  onUpdated?: () => void;
}

export function ModalNuevoSemirremolque({
  semirremolque,
  trigger,
  onCreated,
  onUpdated,
}: ModalSemirremolqueProps) {
  const router = useRouter();
  const isEditing = Boolean(semirremolque);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const getInitialForm = () => ({
    placa: semirremolque?.placa || "",
    tipoCarroceria: semirremolque?.tipoCarroceria || ("plataforma" as const),
    marca: semirremolque?.marca || "Montenegro",
    anioFabricacion: semirremolque?.anioFabricacion || new Date().getFullYear(),
    ejes: semirremolque?.ejes ?? 3,
    cargaUtilMaxTn: semirremolque?.cargaUtilMaxTn || "32.00",
    pesoNetoTn: semirremolque?.pesoNetoTn || "6.80",
    volumenM3: semirremolque?.volumenM3 || "",
    estado: semirremolque?.estado || ("disponible" as const),
    activo: semirremolque?.activo ?? true,
  });

  const [formData, setFormData] = useState(getInitialForm());

  useEffect(() => {
    if (open) {
      setFormData(getInitialForm());
    }
  }, [open, semirremolque]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isEditing && semirremolque) {
      const res = await actualizarSemirremolqueAction({
        id: semirremolque.id,
        placa: formData.placa,
        tipoCarroceria: formData.tipoCarroceria,
        marca: formData.marca || null,
        anioFabricacion: Number(formData.anioFabricacion) || null,
        ejes: Number(formData.ejes),
        pesoNetoTn: formData.pesoNetoTn || null,
        cargaUtilMaxTn: formData.cargaUtilMaxTn,
        volumenM3: formData.volumenM3 || null,
        estado: formData.estado,
        activo: formData.activo,
      });

      setLoading(false);

      if (res.success) {
        toast.success(`Semirremolque ${formData.placa.toUpperCase()} actualizado exitosamente.`);
        setOpen(false);
        router.refresh();
        if (onUpdated) onUpdated();
      } else {
        toast.error(res.error || "Error al actualizar el semirremolque.");
      }
    } else {
      const res = await crearSemirremolqueAction({
        placa: formData.placa,
        tipoCarroceria: formData.tipoCarroceria,
        marca: formData.marca,
        anioFabricacion: formData.anioFabricacion,
        ejes: formData.ejes,
        cargaUtilMaxTn: formData.cargaUtilMaxTn,
        pesoNetoTn: formData.pesoNetoTn,
        volumenM3: formData.volumenM3 || undefined,
      });

      setLoading(false);

      if (res.success) {
        toast.success(`Semirremolque ${formData.placa.toUpperCase()} registrado exitosamente.`);
        setOpen(false);
        router.refresh();
        setFormData(getInitialForm());
        if (onCreated) onCreated();
      } else {
        toast.error(res.error || "Error al registrar el semirremolque.");
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
          title="Editar Semirremolque"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="h-9 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-2 border border-slate-700 shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4 text-amber-400" />
          <span>Registrar Semirremolque (Carreta)</span>
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
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <SheetTitle className="text-base font-bold text-white font-[family-name:var(--font-sora)] flex items-center gap-2">
                  {isEditing ? "Editar Semirremolque" : "Registrar Nuevo Semirremolque"}
                  {isEditing && (
                    <span className="font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded text-xs border border-amber-400/20">
                      {formData.placa}
                    </span>
                  )}
                </SheetTitle>
                <SheetDescription className="text-xs text-slate-400 mt-0.5">
                  {isEditing
                    ? "Actualice las especificaciones técnicas o estado de acople MTC"
                    : "Inscripción en flota no motorizada (carreta/furgón/cisterna)"}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
              <FormFieldset
                title="1. Datos de Identificación & Carrocería"
                description="Placa oficial y tipología de tolva o furgón"
                icon={Layers}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormInput
                    label="Placa Semirremolque (MTC)"
                    required
                    icon={Tag}
                    placeholder="Z1A-987"
                    helperText="Formato oficial de 6 caracteres con guion"
                    value={formData.placa}
                    onChange={(e) =>
                      setFormData({ ...formData, placa: e.target.value.toUpperCase() })
                    }
                  />

                  <FormSelect
                    label="Tipo de Carrocería"
                    required
                    value={formData.tipoCarroceria}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tipoCarroceria: e.target.value as any,
                      })
                    }
                  >
                    <option value="plataforma">Plataforma Baranda / Plana</option>
                    <option value="cama_baja">Cama Baja (Lowboy)</option>
                    <option value="cisterna">Cisterna de Combustible / Líquidos</option>
                    <option value="furgon">Furgón Cerrado / Seco</option>
                    <option value="tolva_granelera">Tolva Granelera / Volquete</option>
                    <option value="portacontenedor">Portacontenedor</option>
                  </FormSelect>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <FormInput
                    label="Marca Fabricante"
                    placeholder="Montenegro, Randon..."
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                  />

                  <FormInput
                    label="Año Fab."
                    type="number"
                    icon={Calendar}
                    value={formData.anioFabricacion}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        anioFabricacion: parseInt(e.target.value) || 2024,
                      })
                    }
                  />

                  <FormSelect
                    label="Ejes (MTC)"
                    required
                    value={formData.ejes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ejes: parseInt(e.target.value) || 3,
                      })
                    }
                  >
                    <option value={1}>1 eje</option>
                    <option value={2}>2 ejes</option>
                    <option value={3}>3 ejes (Estándar)</option>
                    <option value={4}>4 ejes</option>
                  </FormSelect>
                </div>
              </FormFieldset>

              <FormFieldset
                title="2. Capacidades de Carga MTC"
                description="Pesos y volumen reglamentario para balanzas de pesaje"
                icon={Weight}
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <FormInput
                    label="Carga Útil Máx."
                    required
                    suffix="Tn"
                    icon={Weight}
                    value={formData.cargaUtilMaxTn}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cargaUtilMaxTn: e.target.value,
                      })
                    }
                  />

                  <FormInput
                    label="Tara / Peso Neto"
                    suffix="Tn"
                    icon={Weight}
                    value={formData.pesoNetoTn}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pesoNetoTn: e.target.value,
                      })
                    }
                  />

                  <FormInput
                    label="Volumen Útil (Opcional)"
                    suffix="m³"
                    icon={Box}
                    placeholder="Ej. 35.0"
                    value={formData.volumenM3}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        volumenM3: e.target.value,
                      })
                    }
                  />
                </div>
              </FormFieldset>

              {isEditing && (
                <FormFieldset
                  title="3. Estado Operativo"
                  description="Estado de disponibilidad o acoplamiento a tracto"
                  icon={Activity}
                >
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, estado: "disponible" })}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                        formData.estado === "disponible"
                          ? "bg-blue-500/20 text-blue-400 border-blue-500"
                          : "bg-slate-900 text-slate-400 border-[#1F2937] hover:border-slate-600"
                      }`}
                    >
                      🔵 Libre / Disp.
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, estado: "acoplado" })}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                        formData.estado === "acoplado"
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500"
                          : "bg-slate-900 text-slate-400 border-[#1F2937] hover:border-slate-600"
                      }`}
                    >
                      🟢 Acoplado
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, estado: "mantenimiento" })}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                        formData.estado === "mantenimiento"
                          ? "bg-amber-500/20 text-amber-400 border-amber-500"
                          : "bg-slate-900 text-slate-400 border-[#1F2937] hover:border-slate-600"
                      }`}
                    >
                      🟡 En Taller
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
                      🔴 Inactivo
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
                <span>{isEditing ? "Guardar Cambios" : "Guardar Semirremolque"}</span>
              </button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}

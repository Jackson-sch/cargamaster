"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit2,
  Truck,
  Loader2,
  Gauge,
  Fuel,
  Radio,
  Calendar,
  Layers,
  Weight,
  Tag,
  Palette,
  Binary,
  Activity,
} from "lucide-react";
import { crearUnidadAction, actualizarUnidadAction } from "@/lib/actions/flota";
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

export interface UnidadItem {
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

export interface ModalUnidadProps {
  unidad?: UnidadItem | null;
  trigger?: React.ReactNode;
  onCreated?: () => void;
  onUpdated?: () => void;
}

export function ModalNuevaUnidad({
  unidad,
  trigger,
  onCreated,
  onUpdated,
}: ModalUnidadProps) {
  const router = useRouter();
  const isEditing = Boolean(unidad);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const getInitialForm = () => ({
    placa: unidad?.placa || "",
    tipoUnidad: unidad?.tipoUnidad || ("tracto" as "tracto" | "rigido" | "camioneta"),
    marca: unidad?.marca || "Volvo",
    modelo: unidad?.modelo || "",
    anioFabricacion: unidad?.anioFabricacion || new Date().getFullYear(),
    color: unidad?.color || "",
    vinChasis: unidad?.vinChasis || "",
    numeroMotor: unidad?.numeroMotor || "",
    ejes: unidad?.ejes ?? 3,
    capacidadArrastreTn: unidad?.capacidadArrastreTn || "48.00",
    pesoSecoTn: unidad?.pesoSecoTn || "8.90",
    tipoCombustible: unidad?.tipoCombustible || ("diesel_b5" as "diesel_b5" | "gnv" | "glp"),
    odometroActualKm: unidad?.odometroActualKm ?? 0,
    idDispositivoGps: unidad?.idDispositivoGps || "",
    estado: unidad?.estado || ("disponible" as "disponible" | "en_ruta" | "mantenimiento" | "inactivo"),
    activo: unidad?.activo ?? true,
  });

  const [formData, setFormData] = useState(getInitialForm());

  useEffect(() => {
    if (open) {
      setFormData(getInitialForm());
    }
  }, [open, unidad]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isEditing && unidad) {
      const res = await actualizarUnidadAction({
        id: unidad.id,
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
        toast.success(`Unidad ${formData.placa.toUpperCase()} actualizada correctamente.`);
        setOpen(false);
        router.refresh();
        if (onUpdated) onUpdated();
      } else {
        toast.error(res.error || "Error al actualizar la unidad vehicular.");
      }
    } else {
      const res = await crearUnidadAction(formData);
      setLoading(false);

      if (res.success) {
        toast.success(`Unidad ${formData.placa.toUpperCase()} registrada exitosamente.`);
        setOpen(false);
        router.refresh();
        setFormData(getInitialForm());
        if (onCreated) onCreated();
      } else {
        toast.error(res.error || "Error al registrar la unidad.");
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
          title="Editar Unidad"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="h-9 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Registrar Unidad (Tracto)</span>
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
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <SheetTitle className="text-base font-bold text-white font-[family-name:var(--font-sora)] flex items-center gap-2">
                  {isEditing ? "Editar Unidad Vehicular" : "Registrar Nueva Unidad Vehicular"}
                  {isEditing && (
                    <span className="font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded text-xs border border-amber-400/20">
                      {formData.placa}
                    </span>
                  )}
                </SheetTitle>
                <SheetDescription className="text-xs text-slate-400 mt-0.5">
                  {isEditing
                    ? "Actualice las especificaciones técnicas o estado operativo MTC"
                    : "Inscripción en flota motriz y homologación técnica MTC"}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
              <FormFieldset
                title="1. Identificación & Homologación MTC"
                description="Placa oficial, tipología y datos del fabricante"
                icon={Truck}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormInput
                    label="Placa Vehicular MTC"
                    required
                    icon={Tag}
                    placeholder="V7A-890"
                    helperText="Formato oficial de 6 caracteres (ej. V7A-890)"
                    value={formData.placa}
                    onChange={(e) =>
                      setFormData({ ...formData, placa: e.target.value.toUpperCase() })
                    }
                  />

                  <FormSelect
                    label="Tipo de Unidad"
                    required
                    value={formData.tipoUnidad}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tipoUnidad: e.target.value as "tracto" | "rigido" | "camioneta",
                      })
                    }
                  >
                    <option value="tracto">Tracto-Camión (Semirremolque)</option>
                    <option value="rigido">Camión Rígido</option>
                    <option value="camioneta">Camioneta de Escolta / Apoyo</option>
                  </FormSelect>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormInput
                    label="Marca"
                    required
                    placeholder="Volvo, Scania, Freightliner..."
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                  />

                  <FormInput
                    label="Modelo"
                    required
                    placeholder="FH 540, R500, Cascadia..."
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormInput
                    label="Año de Fabricación"
                    required
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
                    label="Configuración de Ejes MTC"
                    required
                    icon={Layers}
                    value={formData.ejes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ejes: parseInt(e.target.value) || 3,
                      })
                    }
                  >
                    <option value={2}>2 ejes (4x2)</option>
                    <option value={3}>3 ejes (6x2 / 6x4)</option>
                    <option value={4}>4 ejes (8x4 pesado)</option>
                  </FormSelect>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <FormInput
                    label="Color"
                    icon={Palette}
                    placeholder="Blanco, Rojo..."
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />

                  <FormInput
                    label="VIN / Chasis"
                    icon={Binary}
                    placeholder="17 dígitos"
                    value={formData.vinChasis}
                    onChange={(e) => setFormData({ ...formData, vinChasis: e.target.value })}
                  />

                  <FormInput
                    label="N° Motor"
                    icon={Binary}
                    placeholder="Serial motor"
                    value={formData.numeroMotor}
                    onChange={(e) => setFormData({ ...formData, numeroMotor: e.target.value })}
                  />
                </div>
              </FormFieldset>

              <FormFieldset
                title="2. Especificaciones Técnicas & Telemetría"
                description="Capacidades de arrastre, combustible y enlace GPS"
                icon={Gauge}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormInput
                    label="Capacidad de Arrastre"
                    required
                    suffix="Tn"
                    icon={Weight}
                    value={formData.capacidadArrastreTn}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        capacidadArrastreTn: e.target.value,
                      })
                    }
                  />

                  <FormInput
                    label="Peso Seco / Tara"
                    suffix="Tn"
                    icon={Weight}
                    value={formData.pesoSecoTn}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pesoSecoTn: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <FormInput
                    label="Odómetro Actual"
                    required
                    type="number"
                    suffix="Km"
                    icon={Gauge}
                    value={formData.odometroActualKm}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        odometroActualKm: parseInt(e.target.value) || 0,
                      })
                    }
                  />

                  <FormSelect
                    label="Tipo de Combustible"
                    icon={Fuel}
                    value={formData.tipoCombustible}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tipoCombustible: e.target.value as "diesel_b5" | "gnv" | "glp",
                      })
                    }
                  >
                    <option value="diesel_b5">Diesel B5 S-50</option>
                    <option value="gnv">GNV (Gas Natural)</option>
                    <option value="glp">GLP</option>
                  </FormSelect>

                  <FormInput
                    label="Dispositivo GPS / IMEI"
                    icon={Radio}
                    placeholder="IMEI o ID rastreador"
                    value={formData.idDispositivoGps}
                    onChange={(e) =>
                      setFormData({ ...formData, idDispositivoGps: e.target.value })
                    }
                  />
                </div>
              </FormFieldset>

              {isEditing && (
                <FormFieldset
                  title="3. Estado Operativo"
                  description="Disponibilidad para asignación de despachos y manifiestos"
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
                      🔵 Disponible
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
                      onClick={() => setFormData({ ...formData, estado: "en_ruta" })}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
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
                <span>{isEditing ? "Guardar Cambios" : "Guardar Unidad"}</span>
              </button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}

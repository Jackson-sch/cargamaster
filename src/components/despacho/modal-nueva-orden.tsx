"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit2,
  X,
  ClipboardList,
  Loader2,
  ShieldAlert,
  Building2,
  MapPin,
  Truck,
  Navigation,
  UserCheck,
  Package,
  Banknote,
} from "lucide-react";
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
import {
  crearOrdenServicioAction,
  actualizarOrdenServicioAction,
} from "@/lib/actions/ordenes-servicio";
import { toast } from "sonner";

export interface OrdenParaEdicion {
  id: string;
  codigoViaje: string;
  clienteId: string;
  rutaId: string;
  unidadId: string;
  semirremolqueId?: string | null;
  conductorId: string;
  conductorSecundarioId?: string | null;
  tipoCarga: "general" | "perecible" | "matpel" | "granel" | "maquinaria" | "refrigerada";
  descripcionCarga: string;
  pesoBrutoKg: string | number;
  unidadMedida: "KGM" | "TNE";
  fechaHoraProgramada?: Date | string | null;
  fletePactadoMoneda: "PEN" | "USD";
  fletePactadoMonto: string | number;
  adelantoViaticos?: string | number | null;
  observaciones?: string | null;
}

export interface ModalOrdenServicioProps {
  orden?: OrdenParaEdicion | null;
  clientes: Array<{ id: string; razonSocial: string; numeroDocumento: string }>;
  rutas: Array<{ id: string; codigoRuta: string; nombre: string; distanciaEstimadaKm?: string | null }>;
  unidades: Array<{ id: string; placa: string; marca: string; modelo: string; estado?: string }>;
  semirremolques: Array<{ id: string; placa: string; tipoCarroceria: string; estado?: string }>;
  conductores: Array<{ id: string; nombres: string; apellidos: string; estado?: string }>;
  onCreated?: () => void;
  onUpdated?: () => void;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function ModalNuevaOrden({
  orden,
  clientes,
  rutas,
  unidades,
  semirremolques,
  conductores,
  onCreated,
  onUpdated,
  onSuccess,
  trigger,
}: ModalOrdenServicioProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(orden && orden.id);

  const formatFechaHora = (d: Date | string | null | undefined) => {
    if (!d) return new Date().toISOString().slice(0, 16);
    const dateObj = new Date(d);
    return isNaN(dateObj.getTime())
      ? new Date().toISOString().slice(0, 16)
      : dateObj.toISOString().slice(0, 16);
  };

  const getInitialState = () => {
    if (orden) {
      return {
        clienteId: orden.clienteId || "",
        rutaId: orden.rutaId || "",
        unidadId: orden.unidadId || "",
        semirremolqueId: orden.semirremolqueId || "",
        conductorId: orden.conductorId || "",
        conductorSecundarioId: orden.conductorSecundarioId || "",
        tipoCarga: orden.tipoCarga || ("general" as const),
        descripcionCarga: orden.descripcionCarga || "",
        pesoBrutoKg: String(orden.pesoBrutoKg || "28000.00"),
        unidadMedida: orden.unidadMedida || ("KGM" as const),
        fechaHoraProgramada: formatFechaHora(orden.fechaHoraProgramada),
        fletePactadoMoneda: orden.fletePactadoMoneda || ("PEN" as const),
        fletePactadoMonto: String(orden.fletePactadoMonto || "6500.00"),
        adelantoViaticos: String(orden.adelantoViaticos || "1000.00"),
        observaciones: orden.observaciones || "",
      };
    }
    return {
      clienteId: "",
      rutaId: "",
      unidadId: "",
      semirremolqueId: "",
      conductorId: "",
      conductorSecundarioId: "",
      tipoCarga: "general" as const,
      descripcionCarga: "",
      pesoBrutoKg: "28000.00",
      unidadMedida: "KGM" as const,
      fechaHoraProgramada: new Date().toISOString().slice(0, 16),
      fletePactadoMoneda: "PEN" as const,
      fletePactadoMonto: "6500.00",
      adelantoViaticos: "1000.00",
      observaciones: "",
    };
  };

  const [formData, setFormData] = useState(getInitialState);

  // Re-sincronizar formulario cada vez que se abra o cambie la orden
  useEffect(() => {
    if (open) {
      setFormData(getInitialState());
    }
  }, [open, orden]);

  const detraccionCalculada = (
    (parseFloat(formData.fletePactadoMonto) || 0) * 0.04
  ).toFixed(2);

  const netoCalculado = (
    (parseFloat(formData.fletePactadoMonto) || 0) - parseFloat(detraccionCalculada)
  ).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clienteId || !formData.rutaId || !formData.unidadId || !formData.conductorId) {
      toast.error("Selecciona cliente, ruta, unidad y conductor obligatorios (*).");
      return;
    }

    setLoading(true);
    try {
      if (isEdit && orden) {
        const res = await actualizarOrdenServicioAction({
          id: orden.id,
          clienteId: formData.clienteId,
          rutaId: formData.rutaId,
          unidadId: formData.unidadId,
          semirremolqueId: formData.semirremolqueId || undefined,
          conductorId: formData.conductorId,
          conductorSecundarioId: formData.conductorSecundarioId || undefined,
          tipoCarga: formData.tipoCarga,
          descripcionCarga: formData.descripcionCarga,
          pesoBrutoKg: formData.pesoBrutoKg,
          unidadMedida: formData.unidadMedida,
          fechaHoraProgramada: formData.fechaHoraProgramada,
          fletePactadoMoneda: formData.fletePactadoMoneda,
          fletePactadoMonto: formData.fletePactadoMonto,
          adelantoViaticos: formData.adelantoViaticos,
          observaciones: formData.observaciones,
        });

        if (res.success) {
          toast.success(`Orden ${orden.codigoViaje} actualizada exitosamente.`);
          setOpen(false);
          router.refresh();
          onUpdated?.();
          onSuccess?.();
        } else {
          toast.error(res.error || "No se pudo actualizar la orden de servicio.");
        }
      } else {
        const res = await crearOrdenServicioAction(formData);

        if (res.success) {
          toast.success("¡Orden de servicio programada exitosamente!");
          setOpen(false);
          router.refresh();
          onCreated?.();
          onSuccess?.();
        } else {
          toast.error(res.error || "No se pudo registrar la orden de servicio.");
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
      {/* Botón desencadenador personalizable o por defecto */}
      {trigger ? (
        <span onClick={() => setOpen(true)} className="cursor-pointer">
          {trigger}
        </span>
      ) : isEdit ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          title="Editar Orden"
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 border border-slate-700 transition-colors"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="h-9 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Nueva Orden de Servicio</span>
        </button>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl md:max-w-3xl p-0 flex flex-col h-full bg-[#0E1524] border-l border-[#1F2937] text-left"
        >
          {/* Header */}
          <SheetHeader className="p-5 bg-[#0B1220] border-b border-[#1F2937] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                {isEdit ? <Edit2 className="h-4 w-4" /> : <ClipboardList className="h-4 w-4" />}
              </div>
              <div>
                <SheetTitle className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
                  {isEdit
                    ? `Editar Orden de Servicio: ${orden?.codigoViaje}`
                    : "Programar Nueva Orden de Servicio (Viaje)"}
                </SheetTitle>
                <SheetDescription className="text-[11px] text-slate-400">
                  {isEdit
                    ? "Modificación técnica de flota, conductor, ruta o flete acordado"
                    : "Validación regulatoria MTC previa a la asignación en ruta nacional"}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
            <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              {/* Bloque 1: Cliente y Ruta */}
              <FormFieldset
                icon={Building2}
                title="1. Dador de Carga & Ruta Nacional"
                description="Selecciona la empresa cliente contratante y el tramo logístico autorizado"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormSelect
                    label="Cliente Dador de Carga"
                    required
                    icon={Building2}
                    value={formData.clienteId}
                    onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
                  >
                    <option value="">-- Seleccionar cliente corporativo --</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.razonSocial} (RUC {c.numeroDocumento})
                      </option>
                    ))}
                  </FormSelect>

                  <FormSelect
                    label="Ruta Nacional de Transporte"
                    required
                    icon={MapPin}
                    value={formData.rutaId}
                    onChange={(e) => setFormData({ ...formData, rutaId: e.target.value })}
                  >
                    <option value="">-- Seleccionar itinerario --</option>
                    {rutas.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.codigoRuta}: {r.nombre} {r.distanciaEstimadaKm ? `(${r.distanciaEstimadaKm} km)` : ""}
                      </option>
                    ))}
                  </FormSelect>
                </div>
              </FormFieldset>

              {/* Bloque 2: Asignación Vehicular y Chofer */}
              <FormFieldset
                icon={Truck}
                title="2. Asignación Técnica de Flota & Conductor MTC"
                description="Configuración T3S3 con validación automática de SOAT, CITV y Licencia A-IIIc"
                badge="Semáforo MTC"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <FormSelect
                    label="Tracto-Camión"
                    required
                    icon={Truck}
                    value={formData.unidadId}
                    onChange={(e) => setFormData({ ...formData, unidadId: e.target.value })}
                  >
                    <option value="">-- Tracto principal --</option>
                    {unidades.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.placa} ({u.marca} {u.modelo})
                      </option>
                    ))}
                  </FormSelect>

                  <FormSelect
                    label="Semirremolque"
                    icon={Navigation}
                    value={formData.semirremolqueId}
                    onChange={(e) =>
                      setFormData({ ...formData, semirremolqueId: e.target.value })
                    }
                  >
                    <option value="">-- Opcional (Carreta/Furgón) --</option>
                    {semirremolques.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.placa} ({s.tipoCarroceria})
                      </option>
                    ))}
                  </FormSelect>

                  <FormSelect
                    label="Conductor Principal"
                    required
                    icon={UserCheck}
                    value={formData.conductorId}
                    onChange={(e) => setFormData({ ...formData, conductorId: e.target.value })}
                  >
                    <option value="">-- Chofer profesional --</option>
                    {conductores.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombres} {c.apellidos}
                      </option>
                    ))}
                  </FormSelect>
                </div>
              </FormFieldset>

              {/* Bloque 3: Carga y Pesaje */}
              <FormFieldset
                icon={Package}
                title="3. Especificación de Carga & Itinerario"
                description="Detalle de mercancía para Guía de Remisión Electrónica GRE Tipo 31"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <FormSelect
                    label="Tipo de Mercancía"
                    required
                    icon={Package}
                    value={formData.tipoCarga}
                    onChange={(e) =>
                      setFormData({ ...formData, tipoCarga: e.target.value as any })
                    }
                  >
                    <option value="general">Carga General</option>
                    <option value="maquinaria">Maquinaria Pesada</option>
                    <option value="granel">Granel / Minerales</option>
                    <option value="matpel">MATPEL (Peligrosas)</option>
                    <option value="perecible">Perecibles</option>
                    <option value="refrigerada">Refrigerada</option>
                  </FormSelect>

                  <div className="sm:col-span-2">
                    <FormInput
                      label="Descripción Detallada de la Carga"
                      required
                      placeholder="Ej. Bolas de acero para molienda en big bags"
                      value={formData.descripcionCarga}
                      onChange={(e) =>
                        setFormData({ ...formData, descripcionCarga: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <FormInput
                    label="Peso Bruto Combinado"
                    required
                    suffix="Kg"
                    placeholder="28000"
                    value={formData.pesoBrutoKg}
                    onChange={(e) =>
                      setFormData({ ...formData, pesoBrutoKg: e.target.value })
                    }
                  />

                  <FormInput
                    label="Fecha/Hora de Despacho"
                    required
                    type="datetime-local"
                    value={formData.fechaHoraProgramada}
                    onChange={(e) =>
                      setFormData({ ...formData, fechaHoraProgramada: e.target.value })
                    }
                  />

                  <FormInput
                    label="Adelanto de Viáticos"
                    suffix="S/"
                    placeholder="800.00"
                    value={formData.adelantoViaticos}
                    onChange={(e) =>
                      setFormData({ ...formData, adelantoViaticos: e.target.value })
                    }
                  />
                </div>

                <FormTextarea
                  label="Observaciones Operativas"
                  rows={2}
                  placeholder="Instrucciones especiales de carguío, precintos de seguridad, requisitos EPP..."
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                />
              </FormFieldset>

              {/* Bloque 4: Flete & Detracción Legal SUNAT */}
              <FormFieldset
                icon={Banknote}
                title="4. Flete Pactado & Retención SPOT"
                description="Cálculo automático de detracción Banco de la Nación (4% para transporte de carga)"
              >
                <div className="p-3 bg-[#0B1220] rounded-xl border border-[#1F2937] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <FormInput
                      label="Flete Acordado (Moneda Nacional)"
                      required
                      suffix="PEN (S/)"
                      value={formData.fletePactadoMonto}
                      onChange={(e) =>
                        setFormData({ ...formData, fletePactadoMonto: e.target.value })
                      }
                      className="w-44 font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1 sm:text-right">
                    <span className="text-[11px] text-slate-400 block">Detracción SUNAT Banco de la Nación (4%):</span>
                    <span className="font-mono text-base font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/30 inline-block">
                      S/ {detraccionCalculada}
                    </span>
                    <span className="text-[10px] text-emerald-400 block font-medium">
                      Neto a liquidar: S/ {netoCalculado}
                    </span>
                  </div>
                </div>
              </FormFieldset>

              {/* Regulatory Alert Warning Box */}
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-2.5">
                <ShieldAlert className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  <strong>Validación Inteligente MTC:</strong> El sistema verificará en tiempo real que el tracto cuente con SOAT y CITV vigentes y que el conductor posea Licencia profesional A-III válida antes de emitir la orden.
                </span>
              </div>

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
                <span>{isEdit ? "Guardar Cambios" : "Programar Viaje"}</span>
              </button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}

// Alias de exportación para máxima compatibilidad
export const ModalEditarOrden = ModalNuevaOrden;

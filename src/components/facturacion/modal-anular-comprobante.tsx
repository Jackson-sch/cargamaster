"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Ban,
  X,
  Loader2,
  AlertTriangle,
  FileX2,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { anularComprobantePagoAction } from "@/lib/actions/facturacion";
import { anularGuiaRemisionAction } from "@/lib/actions/guias-remision";
import { toast } from "sonner";

interface ModalAnularComprobanteProps {
  id: string;
  tipo: "factura" | "gre";
  serieCorrelativo: string;
  clienteODador: string;
  montoOInfo?: string;
  yaAnulado?: boolean;
}

const MOTIVOS_ANULACION_SUNAT = [
  "01 - Anulación de la operación comercial",
  "02 - Anulación por error en el RUC del cliente",
  "03 - Corrección de descripción o tipo de flete",
  "06 - Cancelación del servicio de transporte por el dador",
  "Cancelación del servicio antes de inicio de traslado",
  "Otros motivos operativos justificados",
];

export function ModalAnularComprobante({
  id,
  tipo,
  serieCorrelativo,
  clienteODador,
  montoOInfo,
  yaAnulado,
}: ModalAnularComprobanteProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [tipoBaja, setTipoBaja] = useState<"comunicacion_baja" | "nota_credito">("comunicacion_baja");
  const [motivoSelect, setMotivoSelect] = useState(MOTIVOS_ANULACION_SUNAT[0]);
  const [detalleMotivo, setDetalleMotivo] = useState("");

  if (yaAnulado) {
    return (
      <span className="p-1 rounded bg-rose-500/10 text-rose-400 text-[10px] font-bold px-2 py-0.5 border border-rose-500/20">
        ANULADO
      </span>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const motivoFinal = `${motivoSelect}${detalleMotivo ? `: ${detalleMotivo.trim()}` : ""}`;

    setLoading(true);
    try {
      if (tipo === "factura") {
        const res = await anularComprobantePagoAction(id, motivoFinal, tipoBaja);
        if (res.success) {
          toast.success(res.message);
          toast.info("La orden de servicio vinculada ha sido liberada para refacturación si procede.");
          setOpen(false);
          router.refresh();
        } else {
          toast.error(res.error || "No se pudo anular la factura.");
        }
      } else {
        const res = await anularGuiaRemisionAction(id, motivoFinal);
        if (res.success) {
          toast.success(res.message);
          setOpen(false);
          router.refresh();
        } else {
          toast.error(res.error || "No se pudo anular la guía de remisión.");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al procesar la anulación.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 rounded bg-[#0B1220] border border-[#1F2937] hover:border-rose-500 text-slate-400 hover:text-rose-400 transition-colors inline-flex items-center gap-1 text-[11px]"
        title={tipo === "factura" ? "Anular Factura / Nota de Crédito" : "Dar de baja GRE Transportista"}
      >
        <Ban className="h-3.5 w-3.5 text-rose-500" />
        <span>Anular</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-[#111827] border border-rose-500/30 rounded-2xl shadow-2xl overflow-hidden text-left flex flex-col">
            {/* Header */}
            <div className="p-4 bg-[#0B1220] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
                  <FileX2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
                    Anular {tipo === "factura" ? "Comprobante de Pago" : "Guía de Remisión"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Procedimiento oficial de baja ante SUNAT
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              {/* Resumen del Documento */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Documento a Anular:</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    {serieCorrelativo}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-slate-400 font-medium shrink-0">Cliente / Dador:</span>
                  <span className="font-semibold text-slate-200 text-right break-words max-w-[340px] leading-tight">
                    {clienteODador}
                  </span>
                </div>
                {montoOInfo && (
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                    <span className="text-slate-400 font-medium">Importe / Detalle:</span>
                    <span className="font-mono font-bold text-white">
                      {montoOInfo}
                    </span>
                  </div>
                )}
              </div>

              {/* Advertencia SUNAT */}
              <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-2.5">
                <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed break-words">
                  <strong>Aviso Normativo SUNAT:</strong> La anulación dejará sin efecto tributario este comprobante.
                  {tipo === "factura"
                    ? " Se registrará la Comunicación de Baja o Nota de Crédito y la Orden de Servicio quedará liberada para refacturación."
                    : " La GRE quedará marcada como anulada ante el sistema de fiscalización SUTRAN/SUNAT."}
                </div>
              </div>

              {/* Mecanismo de Baja (si es Factura) */}
              {tipo === "factura" && (
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Mecanismo Legal SUNAT
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTipoBaja("comunicacion_baja")}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        tipoBaja === "comunicacion_baja"
                          ? "bg-rose-500/15 border-rose-500 text-rose-300 font-semibold"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <span className="block text-xs">Comunicación de Baja</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        Plazo legal: hasta 7 días
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTipoBaja("nota_credito")}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        tipoBaja === "nota_credito"
                          ? "bg-rose-500/15 border-rose-500 text-rose-300 font-semibold"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <span className="block text-xs">Nota de Crédito (01)</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        Anulación de la operación
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Motivo SUNAT */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Motivo de Anulación (Catálogo SUNAT) *
                </label>
                <select
                  value={motivoSelect}
                  onChange={(e) => setMotivoSelect(e.target.value)}
                  className="w-full bg-[#0B1220] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  required
                >
                  {MOTIVOS_ANULACION_SUNAT.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Justificación / Sustento */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Justificación o Sustento de la Anulación (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={detalleMotivo}
                  onChange={(e) => setDetalleMotivo(e.target.value)}
                  placeholder="Ej: El cliente solicitó corregir la orden de compra o flete acordado..."
                  className="w-full bg-[#0B1220] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Acciones */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/20 transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Procesando baja...</span>
                    </>
                  ) : (
                    <>
                      <Ban className="h-4 w-4" />
                      <span>Confirmar Anulación</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

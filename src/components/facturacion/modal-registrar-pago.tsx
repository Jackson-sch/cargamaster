"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  X,
  Loader2,
  CheckCircle2,
  Building2,
  Landmark,
  FileCheck,
} from "lucide-react";
import { cambiarEstadoPagoFacturaAction } from "@/lib/actions/facturacion";
import { toast } from "sonner";

interface ModalRegistrarPagoProps {
  id: string;
  serieCorrelativo: string;
  clienteRazonSocial: string;
  clienteRuc: string;
  moneda: string;
  montoTotal: string;
  detraccionMonto: string;
  estadoPagoActual: string;
  observaciones?: string | null;
}

export function ModalRegistrarPago({
  id,
  serieCorrelativo,
  clienteRazonSocial,
  clienteRuc,
  moneda,
  montoTotal,
  detraccionMonto,
  estadoPagoActual,
  observaciones,
}: ModalRegistrarPagoProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [estadoPago, setEstadoPago] = useState<"pendiente" | "pagado">(
    estadoPagoActual === "pagado" ? "pagado" : "pagado"
  );
  const [nroConstanciaSpot, setNroConstanciaSpot] = useState("");

  const totalNum = parseFloat(montoTotal || "0");
  const detraccionNum = parseFloat(detraccionMonto || "0");
  const saldoNeto = Math.max(0, totalNum - detraccionNum);
  const simbolo = moneda === "USD" ? "$ " : "S/ ";

  const handleOpen = () => {
    // Extraer constancia previa si existía en observaciones
    const match = observaciones?.match(/DEPÓSITO SPOT BN:\s*([A-Za-z0-9-]+)/);
    if (match && match[1]) {
      setNroConstanciaSpot(match[1]);
    }
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await cambiarEstadoPagoFacturaAction(
        id,
        estadoPago,
        nroConstanciaSpot
      );

      if (res.success) {
        toast.success(res.message || "Estado de pago actualizado.");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "No se pudo actualizar el pago.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al procesar el pago.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className={`p-1.5 rounded border transition-colors inline-flex items-center gap-1 text-[11px] ${
          estadoPagoActual === "pagado"
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
            : "bg-[#0B1220] border-amber-500/40 hover:border-amber-400 text-amber-300 hover:bg-amber-500/10"
        }`}
        title="Conciliación de Pago y Depósito de Detracción SPOT"
      >
        <CreditCard className="h-3.5 w-3.5" />
        <span>{estadoPagoActual === "pagado" ? "Pago SPOT" : "Conciliar"}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#111827] border border-[#1F2937] rounded-2xl shadow-2xl overflow-hidden text-left flex flex-col">
            {/* Header */}
            <div className="p-4 bg-[#0B1220] border-b border-[#1F2937] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Landmark className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
                    Conciliación de Pago & Depósito SPOT
                  </h3>
                  <p className="text-xs text-slate-400">
                    Control de Cobranza y Cta. Cte. Banco de la Nación (Código 027)
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

            {/* Content Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              {/* Tarjeta de Resumen Financiero */}
              <div className="p-4 rounded-xl bg-[#0B1220] border border-[#1F2937] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#1F2937]">
                  <span className="text-slate-400 font-medium">Factura Electrónica:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {serieCorrelativo}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-400 font-medium shrink-0">Dador de Carga:</span>
                  <span className="text-slate-200 font-semibold text-right truncate max-w-[280px]">
                    {clienteRazonSocial}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">RUC Cliente:</span>
                  <span className="text-slate-300 font-mono">{clienteRuc}</span>
                </div>

                {/* Desglose de Flete y SPOT */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1F2937] text-center">
                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Total Facturado
                    </span>
                    <span className="font-mono font-bold text-white text-xs">
                      {simbolo}{totalNum.toFixed(2)}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <span className="text-[10px] text-amber-400 uppercase font-semibold block">
                      SPOT 4% (Banco Nación)
                    </span>
                    <span className="font-mono font-bold text-amber-300 text-xs">
                      S/ {detraccionNum.toFixed(2)}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-[10px] text-emerald-400 uppercase font-semibold block">
                      Neto a Transferir
                    </span>
                    <span className="font-mono font-bold text-emerald-300 text-xs">
                      {simbolo}{saldoNeto.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Parámetros de Conciliación */}
              <div className="space-y-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Estado de Cobranza *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEstadoPago("pagado")}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        estadoPago === "pagado"
                          ? "bg-emerald-500/15 border-emerald-500 text-emerald-300 font-bold"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs">Cobrado / Liquidado</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal block mt-0.5">
                        Flete y detracción recibidos
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEstadoPago("pendiente")}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        estadoPago === "pendiente"
                          ? "bg-amber-500/15 border-amber-500 text-amber-300 font-bold"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="h-4 w-4 text-amber-400" />
                        <span className="text-xs">Pendiente de Pago</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal block mt-0.5">
                        A crédito / Cobranza en curso
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    N° Constancia / Operación Banco de la Nación (SPOT 4%)
                  </label>
                  <div className="relative">
                    <Landmark className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={nroConstanciaSpot}
                      onChange={(e) => setNroConstanciaSpot(e.target.value)}
                      placeholder="Ej: 002938192 o N° de Operación BN"
                      className="w-full bg-[#0B1220] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Cuenta Cte. SPOT BN de la empresa: <strong>00-018-294819</strong> (Servicio de Transporte Terrestre)
                  </p>
                </div>
              </div>

              {/* Botones de Acción */}
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
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Guardando conciliación...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck className="h-4 w-4" />
                      <span>Guardar Conciliación</span>
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, X, Wallet, Loader2, DollarSign } from "lucide-react";
import { actualizarLiquidacionAction } from "@/lib/actions/liquidaciones";
import { toast } from "sonner";

export interface LiquidacionItemForEdit {
  id: string;
  codigoViaje: string;
  conductorNombre: string;
  viaticosAsignados: string | number;
  bonoPuntualidad: string | number;
  gastosPeajesDeclarados: string | number;
  gastosCocheraDeclarados: string | number;
  otrosGastos: string | number;
  saldoAFavorConductor: string | number;
  saldoAFavorEmpresa: string | number;
  observaciones?: string | null;
}

interface ModalEditarLiquidacionProps {
  liquidacion: LiquidacionItemForEdit;
  onUpdated?: () => void;
}

export function ModalEditarLiquidacion({
  liquidacion,
  onUpdated,
}: ModalEditarLiquidacionProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const viaticos = parseFloat(liquidacion.viaticosAsignados?.toString() || "0");

  const [formData, setFormData] = useState({
    id: liquidacion.id,
    bonoPuntualidad: parseFloat(liquidacion.bonoPuntualidad?.toString() || "0"),
    gastosPeajesDeclarados: parseFloat(liquidacion.gastosPeajesDeclarados?.toString() || "0"),
    gastosCocheraDeclarados: parseFloat(liquidacion.gastosCocheraDeclarados?.toString() || "0"),
    otrosGastos: parseFloat(liquidacion.otrosGastos?.toString() || "0"),
    saldoAFavorConductor: parseFloat(liquidacion.saldoAFavorConductor?.toString() || "0"),
    saldoAFavorEmpresa: parseFloat(liquidacion.saldoAFavorEmpresa?.toString() || "0"),
    observaciones: liquidacion.observaciones || "",
  });

  const recalcularSaldos = (
    peajes: number,
    cochera: number,
    otros: number,
    bono: number
  ) => {
    const totalGastos = peajes + cochera + otros;
    let saldoChofer = 0;
    let saldoEmpresa = 0;

    if (totalGastos > viaticos) {
      saldoChofer = (totalGastos - viaticos) + bono;
      saldoEmpresa = 0;
    } else {
      saldoEmpresa = viaticos - totalGastos;
      saldoChofer = bono;
    }

    setFormData((prev) => ({
      ...prev,
      gastosPeajesDeclarados: peajes,
      gastosCocheraDeclarados: cochera,
      otrosGastos: otros,
      bonoPuntualidad: bono,
      saldoAFavorConductor: Number(saldoChofer.toFixed(2)),
      saldoAFavorEmpresa: Number(saldoEmpresa.toFixed(2)),
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const res = await actualizarLiquidacionAction(formData);
    setLoading(false);

    if (res.success) {
      toast.success("Rendición de liquidación actualizada.");
      setOpen(false);
      router.refresh();
      if (onUpdated) onUpdated();
    } else {
      toast.error(res.error || "No se pudo actualizar la liquidación.");
    }
  };

  const totalGastosActual =
    formData.gastosPeajesDeclarados +
    formData.gastosCocheraDeclarados +
    formData.otrosGastos;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Editar Rendición de Gastos"
        className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 border border-slate-700 transition-colors"
      >
        <Edit2 className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg bg-[#111827] border border-[#1F2937] rounded-xl shadow-2xl overflow-hidden text-left"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          >
            {/* Header */}
            <div className="p-4 bg-[#0E1524] border-b border-[#1F2937] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-amber-400" />
                <div>
                  <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
                    Editar Rendición de Gastos ({liquidacion.codigoViaje})
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Conductor: {liquidacion.conductorNombre} · Anticipo: S/ {viaticos.toFixed(2)}
                  </p>
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

            {/* Body */}
            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Peajes Declarados con Boleta (S/) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.gastosPeajesDeclarados}
                    onChange={(e) =>
                      recalcularSaldos(
                        parseFloat(e.target.value) || 0,
                        formData.gastosCocheraDeclarados,
                        formData.otrosGastos,
                        formData.bonoPuntualidad
                      )
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Cochera y Estacionamiento (S/)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.gastosCocheraDeclarados}
                    onChange={(e) =>
                      recalcularSaldos(
                        formData.gastosPeajesDeclarados,
                        parseFloat(e.target.value) || 0,
                        formData.otrosGastos,
                        formData.bonoPuntualidad
                      )
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Otros Gastos de Ruta (S/)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.otrosGastos}
                    onChange={(e) =>
                      recalcularSaldos(
                        formData.gastosPeajesDeclarados,
                        formData.gastosCocheraDeclarados,
                        parseFloat(e.target.value) || 0,
                        formData.bonoPuntualidad
                      )
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Bono de Puntualidad (S/)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.bonoPuntualidad}
                    onChange={(e) =>
                      recalcularSaldos(
                        formData.gastosPeajesDeclarados,
                        formData.gastosCocheraDeclarados,
                        formData.otrosGastos,
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Real-time balance review card */}
              <div className="p-3.5 bg-[#0B1220] border border-[#1F2937] rounded-lg space-y-2">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Anticipo Asignado:</span>
                  <span className="font-mono font-bold text-white">S/ {viaticos.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Total Gastos Rendidos:</span>
                  <span className="font-mono font-bold text-amber-400">
                    S/ {totalGastosActual.toFixed(2)}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#1F2937] flex justify-between items-center">
                  {formData.saldoAFavorConductor > 0 ? (
                    <>
                      <span className="font-semibold text-emerald-400">Saldo a Pagar al Conductor:</span>
                      <span className="font-mono font-bold text-sm text-emerald-400">
                        S/ {formData.saldoAFavorConductor.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-indigo-400">Saldo a Devolver a Empresa:</span>
                      <span className="font-mono font-bold text-sm text-indigo-400">
                        S/ {formData.saldoAFavorEmpresa.toFixed(2)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Observaciones / Sustento de Comprobantes
                </label>
                <textarea
                  rows={2}
                  value={formData.observaciones}
                  onChange={(e) =>
                    setFormData({ ...formData, observaciones: e.target.value })
                  }
                  placeholder="Detalle de tickets, números de recibos..."
                  className="w-full bg-[#0B1220] border border-[#1F2937] rounded p-2 text-white focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#1F2937] bg-[#0E1524] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-9 px-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="h-9 px-5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Guardar Rendición</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

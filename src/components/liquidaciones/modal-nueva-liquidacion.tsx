"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  X,
  Loader2,
  DollarSign,
  Plus,
  Receipt,
  FileCheck2,
} from "lucide-react";
import { crearLiquidacionViajeAction } from "@/lib/actions/liquidaciones";
import { toast } from "sonner";

interface OrdenParaLiquidacion {
  id: string;
  codigoViaje: string;
  fletePactadoMonto: string;
  adelantoViaticos: string;
  conductorId: string;
  conductor: {
    nombres: string;
    apellidos: string;
    numeroDocumento: string;
  } | null;
  cliente: {
    razonSocial: string;
  } | null;
}

interface ModalNuevaLiquidacionProps {
  ordenesDisponibles: OrdenParaLiquidacion[];
  onCreated?: () => void;
}

export function ModalNuevaLiquidacion({
  ordenesDisponibles,
  onCreated,
}: ModalNuevaLiquidacionProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [ordenId, setOrdenId] = useState("");
  const [conductorId, setConductorId] = useState("");
  const [fleteBase, setFleteBase] = useState("0");
  const [bonoPuntualidad, setBonoPuntualidad] = useState("0");
  const [viaticosAdelanto, setViaticosAdelanto] = useState("0");
  const [peajes, setPeajes] = useState("340.00");
  const [cochera, setCochera] = useState("80.00");
  const [otrosGastos, setOtrosGastos] = useState("50.00");
  const [observaciones, setObservaciones] = useState(
    "Comprobantes de peaje verificados según ticket concesionaria Covinca / Coviperu"
  );

  const handleSelectOrden = (id: string) => {
    setOrdenId(id);
    const ord = ordenesDisponibles.find((o) => o.id === id);
    if (ord) {
      setConductorId(ord.conductorId);
      setFleteBase(ord.fletePactadoMonto || "0");
      setViaticosAdelanto(ord.adelantoViaticos || "0");
    }
  };

  // Cálculos matemáticos de liquidación
  const viaticosNum = parseFloat(viaticosAdelanto) || 0;
  const peajesNum = parseFloat(peajes) || 0;
  const cocheraNum = parseFloat(cochera) || 0;
  const otrosNum = parseFloat(otrosGastos) || 0;
  const bonoNum = parseFloat(bonoPuntualidad) || 0;

  const totalGastosJustificados = peajesNum + cocheraNum + otrosNum;
  const balance = totalGastosJustificados - viaticosNum; // Positivo = reembolso a chofer, Negativo = reintegro a empresa

  const saldoAFavorConductor = balance > 0 ? balance + bonoNum : bonoNum;
  const saldoAFavorEmpresa = balance < 0 ? Math.abs(balance) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ordenId || !conductorId) {
      toast.error("Selecciona la orden de servicio a liquidar.");
      return;
    }

    setLoading(true);
    const res = await crearLiquidacionViajeAction({
      ordenServicioId: ordenId,
      conductorId,
      fleteBase: parseFloat(fleteBase) || 0,
      bonoPuntualidad: bonoNum,
      viaticosAsignados: viaticosNum,
      gastosPeajesDeclarados: peajesNum,
      gastosCocheraDeclarados: cocheraNum,
      otrosGastos: otrosNum,
      saldoAFavorConductor,
      saldoAFavorEmpresa,
      observaciones,
    });
    setLoading(false);

    if (res.success) {
      toast.success("¡Liquidación de viaje aprobada exitosamente!");
      setOpen(false);
      router.refresh();
      if (onCreated) onCreated();
    } else {
      toast.error(res.error || "No se pudo registrar la liquidación.");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="h-9 px-4 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
      >
        <Plus className="h-4 w-4" />
        <span>Nueva Liquidación de Chofer</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#111827] border border-[#1F2937] rounded-xl shadow-2xl overflow-hidden text-left text-xs">
            {/* Header */}
            <div className="p-4 bg-[#0E1524] border-b border-[#1F2937] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-amber-400" />
                <div>
                  <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
                    Liquidación de Viáticos y Gastos por Viaje
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Cierre de flete y balance entre anticipos entregados y peajes rendidos
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
              {/* Selector de Orden */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Orden de Servicio (Viaje a Liquidar) *
                </label>
                <select
                  required
                  value={ordenId}
                  onChange={(e) => handleSelectOrden(e.target.value)}
                  className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                >
                  <option value="">-- Seleccionar viaje --</option>
                  {ordenesDisponibles.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.codigoViaje} · {o.conductor?.nombres} {o.conductor?.apellidos} · Anticipo: S/ {o.adelantoViaticos}
                    </option>
                  ))}
                </select>
              </div>

              {/* Anticipo de Viáticos */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#0B1220] rounded-lg border border-[#1F2937]">
                  <span className="text-slate-400 block text-[11px] mb-1">
                    Adelanto de Viáticos Entregado:
                  </span>
                  <div className="flex items-center gap-1 font-mono font-bold text-sm text-white">
                    <span>S/</span>
                    <input
                      type="text"
                      value={viaticosAdelanto}
                      onChange={(e) => setViaticosAdelanto(e.target.value)}
                      className="w-full bg-[#111827] border border-[#1F2937] rounded px-2 h-7 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="p-3 bg-[#0B1220] rounded-lg border border-[#1F2937]">
                  <span className="text-slate-400 block text-[11px] mb-1">
                    Bono Puntualidad / Cumplimiento:
                  </span>
                  <div className="flex items-center gap-1 font-mono font-bold text-sm text-emerald-400">
                    <span>S/</span>
                    <input
                      type="text"
                      value={bonoPuntualidad}
                      onChange={(e) => setBonoPuntualidad(e.target.value)}
                      className="w-full bg-[#111827] border border-[#1F2937] rounded px-2 h-7 text-emerald-400 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Desglose de Gastos Justificados con Boleta */}
              <div className="p-3 bg-[#0B1220] rounded-lg border border-[#1F2937] space-y-2.5">
                <span className="font-semibold text-amber-400 block">
                  Gastos en Ruta con Comprobante (Rendición)
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-0.5">Peajes (S/)</label>
                    <input
                      type="text"
                      required
                      value={peajes}
                      onChange={(e) => setPeajes(e.target.value)}
                      className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2 text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-0.5">Cochera (S/)</label>
                    <input
                      type="text"
                      value={cochera}
                      onChange={(e) => setCochera(e.target.value)}
                      className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-0.5">Otros / Estiba</label>
                    <input
                      type="text"
                      value={otrosGastos}
                      onChange={(e) => setOtrosGastos(e.target.value)}
                      className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Balance Card */}
              <div className="p-3 bg-[#0B1220] rounded-lg border border-[#1F2937] space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Total Gastos Declarados:</span>
                  <span className="font-mono font-bold text-white">
                    S/ {totalGastosJustificados.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-400 text-[11px] pt-1 border-t border-[#1F2937]">
                  <span>Anticipo entregado al chofer:</span>
                  <span className="font-mono text-slate-300">S/ {viaticosNum.toFixed(2)}</span>
                </div>

                {balance >= 0 ? (
                  <div className="flex justify-between items-center text-sm font-bold text-emerald-400 pt-2 border-t border-[#1F2937]">
                    <span>Saldo Neto a Pagar al Conductor:</span>
                    <span className="font-mono text-base">
                      S/ {saldoAFavorConductor.toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center text-sm font-bold text-amber-400 pt-2 border-t border-[#1F2937]">
                    <span>Reintegro a Favor de Empresa:</span>
                    <span className="font-mono text-base">
                      S/ {saldoAFavorEmpresa.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-slate-400 mb-1">Notas / Sustentos</label>
                <textarea
                  rows={2}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full bg-[#0B1220] border border-[#1F2937] rounded p-2 text-white placeholder:text-slate-600 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-[#1F2937] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-9 px-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="h-9 px-5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Aprobar Liquidación</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

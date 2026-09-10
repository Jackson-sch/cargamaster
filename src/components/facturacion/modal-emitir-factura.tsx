"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ReceiptText,
  X,
  Loader2,
  DollarSign,
  Building2,
  AlertCircle,
  FileCheck2,
  Plus,
} from "lucide-react";
import { emitirFacturaFleteAction } from "@/lib/actions/facturacion";
import { toast } from "sonner";

interface ClienteParaFactura {
  id: string;
  razonSocial: string;
  numeroDocumento: string;
  direccionFiscal?: string;
}

interface OrdenParaFactura {
  id: string;
  codigoViaje: string;
  clienteId: string;
  fletePactadoMonto: string;
  fletePactadoMoneda: string;
  descripcionCarga: string;
}

interface ModalEmitirFacturaProps {
  clientes: ClienteParaFactura[];
  ordenesDisponibles?: OrdenParaFactura[];
  preselectedOrdenId?: string;
  onCreated?: () => void;
}

export function ModalEmitirFactura({
  clientes,
  ordenesDisponibles = [],
  preselectedOrdenId,
  onCreated,
}: ModalEmitirFacturaProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [tipoComprobante, setTipoComprobante] = useState<"01" | "03">("01");
  const [serie, setSerie] = useState("F001");
  const [clienteId, setClienteId] = useState("");
  const [ordenServicioId, setOrdenServicioId] = useState(preselectedOrdenId || "");
  const [moneda, setMoneda] = useState<"PEN" | "USD">("PEN");
  const [subtotal, setSubtotal] = useState("7203.39");
  const [descripcionServicio, setDescripcionServicio] = useState(
    "Servicio de transporte terrestre de carga pesada según flete pactado"
  );
  const [fechaEmision, setFechaEmision] = useState(new Date().toISOString().slice(0, 10));
  const [fechaVencimiento, setFechaVencimiento] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );

  // Cálculos tributarios IGV 18% y Detracción 4%
  const subtotalNum = parseFloat(subtotal) || 0;
  const igvNum = subtotalNum * 0.18;
  const totalNum = subtotalNum + igvNum;
  const aplicaDetraccion = totalNum > 400; // Umbral SPOT transporte carga en Perú
  const montoDetraccion = aplicaDetraccion ? totalNum * 0.04 : 0;
  const netoACobrar = totalNum - montoDetraccion;

  const handleSelectOrden = (ordId: string) => {
    setOrdenServicioId(ordId);
    const ord = ordenesDisponibles.find((o) => o.id === ordId);
    if (ord) {
      setClienteId(ord.clienteId);
      const totalPactado = parseFloat(ord.fletePactadoMonto) || 0;
      // Total flete pactado es precio final (con IGV)
      const baseCalc = (totalPactado / 1.18).toFixed(2);
      setSubtotal(baseCalc);
      setDescripcionServicio(
        `Servicio de transporte de flete terrestre: ${ord.codigoViaje} - Carga: ${ord.descripcionCarga}`
      );
    }
  };

  const handleTipoChange = (tipo: "01" | "03") => {
    setTipoComprobante(tipo);
    setSerie(tipo === "01" ? "F001" : "B001");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId) {
      toast.error("Selecciona el cliente a facturar.");
      return;
    }

    setLoading(true);
    const res = await emitirFacturaFleteAction({
      ordenServicioId: ordenServicioId || undefined,
      clienteId,
      tipoComprobante,
      serie,
      fechaEmision,
      fechaVencimiento: fechaVencimiento || undefined,
      moneda,
      descripcionServicio,
      montoSubtotal: subtotalNum.toFixed(2),
      montoIgv: igvNum.toFixed(2),
      montoTotal: totalNum.toFixed(2),
      detraccionAplica: aplicaDetraccion,
      detraccionPorcentaje: "4.00",
      detraccionMonto: montoDetraccion.toFixed(2),
    });
    setLoading(false);

    if (res.success) {
      toast.success(`¡Comprobante ${res.serieCorrelativo} emitido con éxito a SUNAT!`);
      setOpen(false);
      router.refresh();
      if (onCreated) onCreated();
    } else {
      toast.error(res.error || "No se pudo emitir la factura electrónica.");
    }
  };

  return (
    <>
      <button
        onClick={() => {
          if (preselectedOrdenId) handleSelectOrden(preselectedOrdenId);
          setOpen(true);
        }}
        className="h-9 px-4 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
      >
        <ReceiptText className="h-4 w-4" />
        <span>Emitir Factura Electrónica</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-[#111827] border border-[#1F2937] rounded-xl shadow-2xl overflow-hidden text-left">
            {/* Header */}
            <div className="p-4 bg-[#0E1524] border-b border-[#1F2937] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ReceiptText className="h-5 w-5 text-emerald-400" />
                <div>
                  <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
                    Emitir Factura Electrónica UBL 2.1 (SUNAT 01)
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Cálculo automático de IGV (18%) y Detracción SPOT (4%) Banco de la Nación
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
            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[82vh] overflow-y-auto text-xs">
              {/* Tipo y Serie */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Tipo Comprobante *
                  </label>
                  <select
                    value={tipoComprobante}
                    onChange={(e) => handleTipoChange(e.target.value as any)}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-semibold focus:border-amber-500 focus:outline-none"
                  >
                    <option value="01">Factura (01)</option>
                    <option value="03">Boleta (03)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Serie SUNAT *
                  </label>
                  <input
                    type="text"
                    required
                    value={serie}
                    onChange={(e) => setSerie(e.target.value.toUpperCase())}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Moneda *
                  </label>
                  <select
                    value={moneda}
                    onChange={(e) => setMoneda(e.target.value as any)}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                  >
                    <option value="PEN">PEN (Soles)</option>
                    <option value="USD">USD (Dólares)</option>
                  </select>
                </div>
              </div>

              {/* Orden vinculada opcional */}
              {ordenesDisponibles.length > 0 && (
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Vincular a Orden de Servicio (Opcional)
                  </label>
                  <select
                    value={ordenServicioId}
                    onChange={(e) => handleSelectOrden(e.target.value)}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">-- Facturación directa o general --</option>
                    {ordenesDisponibles.map((ord) => (
                      <option key={ord.id} value={ord.id}>
                        {ord.codigoViaje} - Flete: S/ {ord.fletePactadoMonto} ({ord.descripcionCarga})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Cliente */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Cliente Dador de Carga *
                </label>
                <select
                  required
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                  className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="">-- Seleccionar cliente receptor --</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.razonSocial} (RUC {c.numeroDocumento})
                    </option>
                  ))}
                </select>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Fecha de Emisión *
                  </label>
                  <input
                    type="date"
                    required
                    value={fechaEmision}
                    onChange={(e) => setFechaEmision(e.target.value)}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Fecha de Vencimiento
                  </label>
                  <input
                    type="date"
                    value={fechaVencimiento}
                    onChange={(e) => setFechaVencimiento(e.target.value)}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white"
                  />
                </div>
              </div>

              {/* Descripción del flete */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Descripción del Servicio Facturado *
                </label>
                <textarea
                  rows={2}
                  required
                  value={descripcionServicio}
                  onChange={(e) => setDescripcionServicio(e.target.value)}
                  className="w-full bg-[#0B1220] border border-[#1F2937] rounded p-2.5 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Importes Monetarios */}
              <div className="p-4 bg-[#0B1220] rounded-xl border border-[#1F2937] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Valor Venta (Subtotal sin IGV):</span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 font-mono">S/</span>
                    <input
                      type="text"
                      required
                      value={subtotal}
                      onChange={(e) => setSubtotal(e.target.value)}
                      className="w-28 h-8 bg-[#111827] border border-[#1F2937] rounded px-2 text-white font-mono font-bold text-right"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span>I.G.V. (18%):</span>
                  <span className="font-mono font-semibold">S/ {igvNum.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-sm font-bold text-white pt-2 border-t border-[#1F2937]">
                  <span>Total Facturado:</span>
                  <span className="font-mono text-amber-400">S/ {totalNum.toFixed(2)}</span>
                </div>

                {/* Bloque Detracción Legal SPOT */}
                <div className="pt-2 border-t border-[#1F2937] mt-2 space-y-1 text-slate-300">
                  <div className="flex items-center justify-between text-amber-400 font-semibold">
                    <span>Detracción SPOT (4% D.L. 940):</span>
                    <span className="font-mono">S/ {montoDetraccion.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-400 font-bold">
                    <span>Neto a Pagar por Cliente:</span>
                    <span className="font-mono">S/ {netoACobrar.toFixed(2)}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block pt-1">
                    Depósito en Cta. Cte. Banco de la Nación N° 00-018-294819 (Cód. 027)
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-[#1F2937] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-9 px-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="h-9 px-5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Emitir Factura Electrónica</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

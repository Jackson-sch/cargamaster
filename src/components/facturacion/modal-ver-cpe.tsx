"use client";

import { useState } from "react";
import {
  FileText,
  X,
  Printer,
  Download,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  Building2,
  Calendar,
  DollarSign,
  Eye,
} from "lucide-react";

interface CpeDetalle {
  tipo: "factura" | "gre";
  serieCorrelativo: string;
  fechaEmision: string;
  fechaVencimiento?: string;
  clienteRuc: string;
  clienteRazonSocial: string;
  clienteDireccion?: string;
  descripcion: string;
  moneda?: string;
  montoSubtotal?: string;
  montoIgv?: string;
  montoTotal?: string;
  detraccionMonto?: string;
  cuentaBancoNacion?: string;
  hashCpe?: string;
  qrCode?: string;
  estadoSunat: string;
  sunatDescripcion?: string;
  ticketSunat?: string;
  // Si es GRE:
  placaTracto?: string;
  placaCarreta?: string;
  conductorNombre?: string;
  conductorDni?: string;
  conductorLicencia?: string;
  origen?: string;
  destino?: string;
  pesoKg?: string;
}

export function ModalVerCpe({ cpe }: { cpe: CpeDetalle }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 rounded bg-[#0B1220] border border-[#1F2937] hover:border-amber-500 text-slate-300 hover:text-amber-400 transition-colors inline-flex items-center gap-1 text-[11px]"
        title="Ver representación impresa y CDR"
      >
        <Eye className="h-3.5 w-3.5" />
        <span>Ver CPE</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-left flex flex-col max-h-[90vh]">
            {/* Action Bar */}
            <div className="p-3 bg-[#0B1220] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300">
                  Comprobante de Pago Electrónico SUNAT
                </span>
                {cpe.estadoSunat === "anulado" ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-rose-500" /> ANULADO ANTE SUNAT
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Aceptado SUNAT (Código 0)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Imprimir</span>
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-md"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Document Printable Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-200 bg-white dark:bg-[#0E1524]">
              {cpe.estadoSunat === "anulado" && (
                <div className="py-2.5 px-4 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold text-center text-xs uppercase leading-snug break-words">
                  ⚠ ESTE COMPROBANTE HA SIDO ANULADO FORMALMENTE ANTE SUNAT (COMUNICACIÓN DE BAJA / NOTA DE CRÉDITO)
                </div>
              )}

              {/* Header: Emisor & Voucher Box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-b border-slate-700 pb-5 items-start">
                <div className="sm:col-span-2 space-y-1.5 pr-2">
                  <span className="text-base sm:text-lg font-black text-amber-500 font-[family-name:var(--font-sora)] block leading-tight break-words">
                    TRANSPORTES Y LOGÍSTICA TRANSANDINA S.A.C.
                  </span>
                  <p className="text-slate-300 text-xs leading-normal">
                    Servicio Integral de Transporte de Carga Pesada Nacional e Internacional
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Av. Néstor Gambetta Km 8.5, Callao · Tel: (01) 489-3200
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Email: facturacion@transandina.pe · Web: www.transandina.pe
                  </p>
                </div>

                <div className={`p-4 rounded-xl border text-center flex flex-col justify-center space-y-1 shrink-0 ${
                  cpe.estadoSunat === "anulado"
                    ? "bg-rose-950/20 border-rose-500/40"
                    : "bg-[#111827] border-amber-500/40"
                }`}>
                  <span className="text-xs font-mono font-bold text-slate-300">
                    R.U.C. 20601234567
                  </span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">
                    {cpe.tipo === "factura" ? "FACTURA ELECTRÓNICA" : "GUÍA DE REMISIÓN ELECTRÓNICA"}
                  </span>
                  <span className="text-sm font-mono font-black text-amber-400 block">
                    {cpe.serieCorrelativo}
                  </span>
                  {cpe.estadoSunat === "anulado" && (
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block mt-1">
                      [ ANULADO ]
                    </span>
                  )}
                </div>
              </div>

              {/* Receptor Details */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-[#0B1220] rounded-xl border border-slate-800 text-[11px]">
                <div>
                  <span className="text-slate-400 block mb-0.5">Señor(es):</span>
                  <span className="font-bold text-white block">{cpe.clienteRazonSocial}</span>
                  <span className="text-slate-400 mt-1 block">RUC: {cpe.clienteRuc}</span>
                  <span className="text-slate-400 block truncate">
                    Dirección: {cpe.clienteDireccion || "Domicilio fiscal legal"}
                  </span>
                </div>
                <div className="space-y-1 text-right">
                  <div>
                    <span className="text-slate-400">Fecha de Emisión: </span>
                    <span className="font-medium text-white">{cpe.fechaEmision}</span>
                  </div>
                  {cpe.fechaVencimiento && (
                    <div>
                      <span className="text-slate-400">Fecha de Vencimiento: </span>
                      <span className="font-medium text-white">{cpe.fechaVencimiento}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-400">Moneda: </span>
                    <span className="font-bold text-amber-400">{cpe.moneda || "PEN"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Condición: </span>
                    <span className="text-slate-200 font-medium">Crédito Comercial</span>
                  </div>
                </div>
              </div>

              {/* Special Section for GRE Transportista */}
              {cpe.tipo === "gre" && (
                <div className="space-y-3">
                  <div className="p-3 bg-[#0B1220] rounded-xl border border-slate-800 space-y-2">
                    <span className="font-bold text-amber-400 block text-xs">
                      Datos de la Unidad y Conductor de Carga Pesada (MTC)
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-400 block">Tracto:</span>
                        <span className="font-mono font-bold text-white">{cpe.placaTracto || "V7A-890"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Semirremolque:</span>
                        <span className="font-mono text-white">{cpe.placaCarreta || "Z1A-987"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Chofer:</span>
                        <span className="text-white font-medium">{cpe.conductorNombre || "Wilfredo Quispe"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Licencia:</span>
                        <span className="font-mono text-emerald-400 font-bold">{cpe.conductorLicencia || "Q45829103 (A-IIIc)"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div className="p-2.5 bg-[#0B1220] rounded-lg border border-slate-800">
                      <span className="text-slate-400 block">Punto de Partida:</span>
                      <span className="text-white font-medium">{cpe.origen || "Callao (070101)"}</span>
                    </div>
                    <div className="p-2.5 bg-[#0B1220] rounded-lg border border-slate-800">
                      <span className="text-slate-400 block">Punto de Llegada:</span>
                      <span className="text-white font-medium">{cpe.destino || "Arequipa (040126)"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Items Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-[#0B1220] text-slate-400 uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="px-3 py-2">Item</th>
                      <th className="px-3 py-2">Descripción del Servicio / Carga</th>
                      <th className="px-3 py-2 text-right">Cant.</th>
                      <th className="px-3 py-2 text-right">Valor Venta</th>
                      <th className="px-3 py-2 text-right">Importe Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    <tr>
                      <td className="px-3 py-2.5 font-mono text-slate-400">1</td>
                      <td className="px-3 py-2.5 text-white font-medium break-words max-w-[380px] leading-relaxed">
                        {cpe.descripcion}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-300">
                        {cpe.tipo === "gre" ? `${cpe.pesoKg || "28,000"} kg` : "1 SER"}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-300">
                        {cpe.montoSubtotal ? `S/ ${cpe.montoSubtotal}` : "---"}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-100">
                        {cpe.montoTotal ? `S/ ${cpe.montoTotal}` : "---"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Totals & SPOT Block for Factura */}
              {cpe.tipo === "factura" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-[#0B1220] rounded-xl border border-slate-800 space-y-1.5 text-[11px]">
                    <span className="font-bold text-amber-400 block">
                      Operación Sujeta al SPOT (D.L. 940)
                    </span>
                    <p className="text-slate-400 text-[10px]">
                      Tasa de detracción: 4.00% · Código de Servicio: 027 (Transporte de carga)
                    </p>
                    <div className="flex justify-between font-mono pt-1 text-amber-300">
                      <span>Monto Detracción (4%):</span>
                      <span className="font-bold">S/ {cpe.detraccionMonto || "0.00"}</span>
                    </div>
                    <div className="flex justify-between font-mono text-slate-400">
                      <span>Cta. Banco de la Nación:</span>
                      <span className="font-bold text-white">00-018-294819</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 p-3 bg-[#0B1220] rounded-xl border border-slate-800 text-[11px]">
                    <div className="flex justify-between text-slate-400">
                      <span>Op. Gravadas (Base):</span>
                      <span className="font-mono text-white">S/ {cpe.montoSubtotal || "0.00"}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>I.G.V. (18%):</span>
                      <span className="font-mono text-white">S/ {cpe.montoIgv || "0.00"}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-amber-400 pt-1 border-t border-slate-800">
                      <span>Importe Total:</span>
                      <span className="font-mono">S/ {cpe.montoTotal || "0.00"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer: QR Code & Hash */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-400">
                <div className="flex items-center gap-3">
                  {/* Visual QR Simulator */}
                  <div className="h-16 w-16 bg-white p-1 rounded-lg shrink-0 flex items-center justify-center">
                    <QrCode className="h-14 w-14 text-slate-950" />
                  </div>
                  <div>
                    <span className="font-mono text-slate-300 block font-semibold">
                      Hash CPE: {cpe.hashCpe || "UBL21-SHA256-D78A09B2E"}
                    </span>
                    <span className="text-slate-500 block mt-0.5">
                      Representación impresa del Comprobante de Pago Electrónico generado según estándar UBL 2.1
                    </span>
                    <span className="text-emerald-400 font-semibold block mt-0.5">
                      Autorizado mediante Resolución SUNAT / SUTRAN
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-slate-500 block">Ticket SUNAT:</span>
                  <span className="font-mono text-slate-300">{cpe.ticketSunat || "TK-SUNAT-99823"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

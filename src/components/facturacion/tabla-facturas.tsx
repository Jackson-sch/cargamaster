"use client";

import { useState, useMemo } from "react";
import {
  ReceiptText,
  Ban,
  CheckCircle2,
  Search,
  Filter,
  CreditCard,
  Clock,
  Landmark,
} from "lucide-react";
import { ModalVerCpe } from "@/components/facturacion/modal-ver-cpe";
import { ModalAnularComprobante } from "@/components/facturacion/modal-anular-comprobante";
import { ModalRegistrarPago } from "@/components/facturacion/modal-registrar-pago";

export interface ComprobanteItem {
  id: string;
  serie: string;
  numeroCorrelativo: number;
  tipoComprobante: string;
  fechaEmision: string;
  fechaVencimiento?: string | null;
  moneda: string;
  montoSubtotal?: string | null;
  montoIgv?: string | null;
  montoTotal?: string | null;
  detraccionMonto?: string | null;
  estadoPago: string;
  estadoSunat: string;
  hashCpe?: string | null;
  qrCode?: string | null;
  sunatTicketId?: string | null;
  observaciones?: string | null;
  cliente?: {
    razonSocial: string;
    numeroDocumento: string;
    direccionFiscal?: string | null;
  } | null;
  ordenServicio?: {
    codigoViaje: string;
  } | null;
}

interface TablaFacturasProps {
  comprobantes: ComprobanteItem[];
}

export function TablaFacturas({ comprobantes }: TablaFacturasProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroPago, setFiltroPago] = useState<"todos" | "pendiente" | "pagado" | "anulado">("todos");

  const totalComprobantes = comprobantes.length;
  const pendientesCount = comprobantes.filter((c) => c.estadoPago === "pendiente" && c.estadoSunat !== "anulado").length;
  const pagadosCount = comprobantes.filter((c) => c.estadoPago === "pagado").length;
  const anuladosCount = comprobantes.filter((c) => c.estadoSunat === "anulado" || c.estadoPago === "anulado").length;

  const filtrados = useMemo(() => {
    return comprobantes.filter((c) => {
      // Filtro por tab de estado de pago
      if (filtroPago === "pendiente" && (c.estadoPago !== "pendiente" || c.estadoSunat === "anulado")) return false;
      if (filtroPago === "pagado" && c.estadoPago !== "pagado") return false;
      if (filtroPago === "anulado" && c.estadoSunat !== "anulado" && c.estadoPago !== "anulado") return false;

      // Filtro por término de búsqueda
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const correlativo = `${c.serie}-${String(c.numeroCorrelativo).padStart(8, "0")}`.toLowerCase();
      const clienteNombre = (c.cliente?.razonSocial || "").toLowerCase();
      const clienteRuc = (c.cliente?.numeroDocumento || "").toLowerCase();
      const codigoViaje = (c.ordenServicio?.codigoViaje || "").toLowerCase();

      return (
        correlativo.includes(term) ||
        clienteNombre.includes(term) ||
        clienteRuc.includes(term) ||
        codigoViaje.includes(term)
      );
    });
  }, [comprobantes, filtroPago, searchTerm]);

  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden shadow-sm">
      {/* Header & Filtros */}
      <div className="p-4 border-b border-[#1F2937] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ReceiptText className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
            Facturas y Comprobantes de Pago Electrónicos (UBL 2.1)
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            ({filtrados.length} de {totalComprobantes})
          </span>
        </div>

        {/* Buscador y Tabs */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar serie, RUC, cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0B1220] border border-[#1F2937] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex items-center bg-[#0B1220] p-0.5 rounded-lg border border-[#1F2937] text-xs">
            <button
              onClick={() => setFiltroPago("todos")}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                filtroPago === "todos"
                  ? "bg-emerald-500 text-slate-950 font-bold shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Todos ({totalComprobantes})
            </button>
            <button
              onClick={() => setFiltroPago("pendiente")}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                filtroPago === "pendiente"
                  ? "bg-amber-500 text-slate-950 font-bold shadow"
                  : "text-amber-400/80 hover:text-amber-300"
              }`}
            >
              Pendientes ({pendientesCount})
            </button>
            <button
              onClick={() => setFiltroPago("pagado")}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                filtroPago === "pagado"
                  ? "bg-emerald-600 text-white font-bold shadow"
                  : "text-emerald-400/80 hover:text-emerald-300"
              }`}
            >
              Pagados ({pagadosCount})
            </button>
            <button
              onClick={() => setFiltroPago("anulado")}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                filtroPago === "anulado"
                  ? "bg-rose-600 text-white font-bold shadow"
                  : "text-rose-400/80 hover:text-rose-300"
              }`}
            >
              Anulados ({anuladosCount})
            </button>
          </div>
        </div>
      </div>

      {filtrados.length === 0 ? (
        <div className="p-10 text-center text-slate-500">
          <ReceiptText className="h-8 w-8 mx-auto mb-2 text-slate-600" />
          <p className="text-xs">No se encontraron facturas con los criterios seleccionados.</p>
          <p className="text-[11px] text-slate-600 mt-1">
            Intenta cambiar el filtro de búsqueda o el estado de cobranza.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#0B1220] text-slate-400 uppercase tracking-wider text-[10px] border-b border-[#1F2937]">
              <tr>
                <th className="px-4 py-3 font-semibold">Comprobante</th>
                <th className="px-4 py-3 font-semibold">Fecha Emisión</th>
                <th className="px-4 py-3 font-semibold">Cliente Dador</th>
                <th className="px-4 py-3 font-semibold">Viaje Vinculado</th>
                <th className="px-4 py-3 font-semibold">Total Facturado</th>
                <th className="px-4 py-3 font-semibold">Detracción 4% SPOT</th>
                <th className="px-4 py-3 font-semibold">Estado Pago</th>
                <th className="px-4 py-3 font-semibold">Estado SUNAT</th>
                <th className="px-4 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]">
              {filtrados.map((c) => {
                const tieneSpotRegistrado = c.observaciones?.includes("DEPÓSITO SPOT BN:");
                const matchSpot = c.observaciones?.match(/DEPÓSITO SPOT BN:\s*([A-Za-z0-9-]+)/);
                const nroConstanciaSpot = matchSpot ? matchSpot[1] : null;

                return (
                  <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-mono font-bold text-emerald-400 block">
                        {c.serie}-{String(c.numeroCorrelativo).padStart(8, "0")}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {c.tipoComprobante === "01" ? "Factura Electrónica" : "Boleta de Venta"}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-300 font-mono">
                      {c.fechaEmision}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-slate-200 block truncate max-w-[180px]">
                        {c.cliente?.razonSocial}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        RUC {c.cliente?.numeroDocumento}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-slate-200">
                      {c.ordenServicio?.codigoViaje || "General"}
                    </td>

                    <td className="px-4 py-3.5 font-mono font-bold text-white">
                      {c.moneda === "USD" ? "$ " : "S/ "}
                      {parseFloat(c.montoTotal || "0").toLocaleString("es-PE", {
                        minimumFractionDigits: 2,
                      })}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="font-mono text-amber-400 font-semibold block">
                        S/ {parseFloat(c.detraccionMonto || "0").toFixed(2)}
                      </span>
                      {nroConstanciaSpot ? (
                        <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5" title="Constancia de depósito en Banco de la Nación">
                          <Landmark className="h-3 w-3" /> BN: {nroConstanciaSpot}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 block">
                          Cta BN 00-018-294819
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      {c.estadoPago === "pagado" ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="h-3 w-3" /> Pagado
                        </span>
                      ) : c.estadoPago === "anulado" || c.estadoSunat === "anulado" ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-slate-800 text-slate-500 border border-slate-700">
                          Anulado
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1 w-fit">
                          <Clock className="h-3 w-3" /> Pendiente
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      {c.estadoSunat === "anulado" ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1 w-fit">
                          <Ban className="h-3 w-3" /> Anulado
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="h-3 w-3" /> {c.estadoSunat}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Conciliación de Pago y SPOT */}
                        {c.estadoSunat !== "anulado" && (
                          <ModalRegistrarPago
                            id={c.id}
                            serieCorrelativo={`${c.serie}-${String(c.numeroCorrelativo).padStart(8, "0")}`}
                            clienteRazonSocial={c.cliente?.razonSocial || "Cliente"}
                            clienteRuc={c.cliente?.numeroDocumento || ""}
                            moneda={c.moneda}
                            montoTotal={c.montoTotal || "0"}
                            detraccionMonto={c.detraccionMonto || "0"}
                            estadoPagoActual={c.estadoPago}
                            observaciones={c.observaciones}
                          />
                        )}

                        <ModalVerCpe
                          cpe={{
                            tipo: "factura",
                            serieCorrelativo: `${c.serie}-${String(c.numeroCorrelativo).padStart(8, "0")}`,
                            fechaEmision: c.fechaEmision,
                            fechaVencimiento: c.fechaVencimiento || undefined,
                            clienteRuc: c.cliente?.numeroDocumento || "",
                            clienteRazonSocial: c.cliente?.razonSocial || "",
                            clienteDireccion: c.cliente?.direccionFiscal || undefined,
                            descripcion: c.observaciones || "Servicio de flete de carga pesada nacional",
                            moneda: c.moneda,
                            montoSubtotal: c.montoSubtotal || undefined,
                            montoIgv: c.montoIgv || undefined,
                            montoTotal: c.montoTotal || undefined,
                            detraccionMonto: c.detraccionMonto || undefined,
                            hashCpe: c.hashCpe || undefined,
                            qrCode: c.qrCode || undefined,
                            estadoSunat: c.estadoSunat,
                            ticketSunat: c.sunatTicketId || undefined,
                          }}
                        />

                        <ModalAnularComprobante
                          id={c.id}
                          tipo="factura"
                          serieCorrelativo={`${c.serie}-${String(c.numeroCorrelativo).padStart(8, "0")}`}
                          clienteODador={c.cliente?.razonSocial || "Cliente"}
                          montoOInfo={`${c.moneda === "USD" ? "$ " : "S/ "} ${parseFloat(c.montoTotal || "0").toFixed(2)}`}
                          yaAnulado={c.estadoSunat === "anulado"}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

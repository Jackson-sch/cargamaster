import { ReceiptText, Ban, CheckCircle2 } from "lucide-react";
import { ModalVerCpe } from "@/components/facturacion/modal-ver-cpe";
import { ModalAnularComprobante } from "@/components/facturacion/modal-anular-comprobante";

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
  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-[#1F2937] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ReceiptText className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
            Facturas y Comprobantes de Pago Electrónicos (UBL 2.1)
          </h2>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {comprobantes.length} comprobante{comprobantes.length === 1 ? "" : "s"}
        </span>
      </div>

      {comprobantes.length === 0 ? (
        <div className="p-10 text-center text-slate-500">
          <ReceiptText className="h-8 w-8 mx-auto mb-2 text-slate-600" />
          <p className="text-xs">No hay facturas electrónicas registradas aún.</p>
          <p className="text-[11px] text-slate-600">
            Haz clic en &ldquo;Emitir Factura Electrónica&rdquo; para liquidar y facturar fletes.
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
                <th className="px-4 py-3 font-semibold">Detracción 4%</th>
                <th className="px-4 py-3 font-semibold">Estado Pago</th>
                <th className="px-4 py-3 font-semibold">Estado SUNAT</th>
                <th className="px-4 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]">
              {comprobantes.map((c) => (
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

                  <td className="px-4 py-3.5 font-mono text-amber-400 font-semibold">
                    S/ {parseFloat(c.detraccionMonto || "0").toFixed(2)}
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {c.estadoPago}
                    </span>
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

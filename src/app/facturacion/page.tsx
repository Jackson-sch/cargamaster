import { LayoutShell } from "@/components/layout-shell";
import { ReceiptText } from "lucide-react";
import { obtenerComprobantesCompletos } from "@/lib/actions/facturacion";
import { obtenerGuiasRemisionCompletas } from "@/lib/actions/guias-remision";
import { obtenerOrdenesServicioCompletas } from "@/lib/actions/ordenes-servicio";
import { obtenerClientes } from "@/lib/actions/clientes";
import { ModalEmitirGre } from "@/components/facturacion/modal-emitir-gre";
import { ModalEmitirFactura } from "@/components/facturacion/modal-emitir-factura";
import { FacturacionMetricas } from "@/components/facturacion/facturacion-metricas";
import { TablaFacturas } from "@/components/facturacion/tabla-facturas";
import { TablaGuias } from "@/components/facturacion/tabla-guias";
import { BotonExportarExcel } from "@/components/reportes/boton-exportar-excel";

export default async function FacturacionPage() {
  const [comprobantesRes, guiasRes, ordenesRes, clientesRes] = await Promise.all([
    obtenerComprobantesCompletos(),
    obtenerGuiasRemisionCompletas(),
    obtenerOrdenesServicioCompletas(),
    obtenerClientes(),
  ]);

  const comprobantes = comprobantesRes.comprobantes || [];
  const guias = guiasRes.guias || [];
  const ordenes = ordenesRes.ordenes || [];
  const clientes = clientesRes.clientes || [];

  // Métricas financieras y tributarias
  const totalFacturadoSoles = comprobantes
    .filter((c) => c.estadoSunat === "aceptado" && c.moneda === "PEN")
    .reduce((acc, c) => acc + parseFloat(c.montoTotal || "0"), 0);

  const totalDetraccionesSoles = comprobantes
    .filter((c) => c.estadoSunat === "aceptado" && c.moneda === "PEN")
    .reduce((acc, c) => acc + parseFloat(c.detraccionMonto || "0"), 0);

  const greAceptadas = guias.filter((g) => g.estadoSunat === "aceptado").length;

  return (
    <LayoutShell
      title="Guías de Remisión Electrónica & Facturación SUNAT"
      subtitle="Emisión centralizada de GRE-Transportista y Facturas UBL 2.1 con detracción legal del 4% SPOT"
    >
      <div className="space-y-6">
        {/* Banner with Actions & API Status */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ReceiptText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
                  Facturador & Servidor UBL 2.1 SUNAT
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30 uppercase flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Conectado SUNAT
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Certificado Digital Tributario activo · Cta. Detracciones BN: 00-018-294819 (Cód. 027)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <BotonExportarExcel
              endpoint="/api/reportes/detracciones"
              label="Exportar SPOT (.xlsx)"
            />
            <ModalEmitirGre
              ordenesDisponibles={ordenes.map((o) => ({
                id: o.id,
                codigoViaje: o.codigoViaje,
                descripcionCarga: o.descripcionCarga,
                pesoBrutoKg: o.pesoBrutoKg?.toString() || "28000",
                cliente: o.cliente
                  ? {
                      razonSocial: o.cliente.razonSocial,
                      numeroDocumento: o.cliente.numeroDocumento,
                      direccionFiscal: o.cliente.direccionFiscal,
                    }
                  : null,
                ruta: o.ruta
                  ? {
                      origenDepartamento: o.ruta.origenDepartamento,
                      origenUbigeo: o.ruta.origenUbigeo,
                      origenDireccion: o.ruta.origenDireccion,
                      destinoDepartamento: o.ruta.destinoDepartamento,
                      destinoUbigeo: o.ruta.destinoUbigeo,
                      destinoDireccion: o.ruta.destinoDireccion,
                    }
                  : null,
                unidad: o.unidad ? { placa: o.unidad.placa } : null,
                semirremolque: o.semirremolque ? { placa: o.semirremolque.placa } : null,
                conductor: o.conductor
                  ? {
                      nombres: o.conductor.nombres,
                      apellidos: o.conductor.apellidos,
                      numeroDocumento: o.conductor.numeroDocumento,
                    }
                  : null,
              }))}
            />

            <ModalEmitirFactura
              clientes={clientes.map((c) => ({
                id: c.id,
                razonSocial: c.razonSocial,
                numeroDocumento: c.numeroDocumento,
                direccionFiscal: c.direccionFiscal,
              }))}
              ordenesDisponibles={ordenes.map((o) => ({
                id: o.id,
                codigoViaje: o.codigoViaje,
                clienteId: o.clienteId,
                fletePactadoMonto: o.fletePactadoMonto?.toString() || "0",
                fletePactadoMoneda: o.fletePactadoMoneda,
                descripcionCarga: o.descripcionCarga,
              }))}
            />
          </div>
        </div>

        {/* Resumen de Métricas Financieras y SPOT */}
        <FacturacionMetricas
          totalFacturadoSoles={totalFacturadoSoles}
          totalDetraccionesSoles={totalDetraccionesSoles}
          greAceptadas={greAceptadas}
        />

        {/* Tabla de Facturas Electrónicas */}
        <TablaFacturas comprobantes={comprobantes as any} />

        {/* Tabla de Guías de Remisión Electrónica */}
        <TablaGuias guias={guias as any} />
      </div>
    </LayoutShell>
  );
}

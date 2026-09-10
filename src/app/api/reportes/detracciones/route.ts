import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comprobantesPago, empresas } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { generarExcelCorporativo, type ColumnaExcel } from "@/lib/excel/excel-builder";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const empresa = await db.query.empresas.findFirst({
      where: eq(empresas.activo, true),
    });

    if (!empresa) {
      return NextResponse.json({ error: "Empresa no configurada" }, { status: 404 });
    }

    const comprobantes = await db.query.comprobantesPago.findMany({
      where: eq(comprobantesPago.empresaId, empresa.id),
      orderBy: [desc(comprobantesPago.fechaEmision)],
      with: {
        cliente: true,
        ordenServicio: {
          with: {
            ruta: true,
          },
        },
      },
    });

    const columnas: ColumnaExcel[] = [
      { header: "N°", key: "item", width: 6, align: "center" },
      { header: "Fecha Emisión", key: "fechaEmision", width: 14, align: "center", formato: "fecha" },
      { header: "Tipo Comprobante", key: "tipo", width: 20, align: "center" },
      { header: "Serie - Correlativo", key: "serieNumero", width: 18, align: "center" },
      { header: "RUC / Doc Cliente", key: "rucCliente", width: 16, align: "center" },
      { header: "Razón Social Cliente", key: "razonSocial", width: 32, align: "left" },
      { header: "Bien / Servicio SUNAT", key: "codigoSunat", width: 28, align: "left" },
      { header: "Moneda", key: "moneda", width: 10, align: "center" },
      { header: "Flete Total", key: "montoTotal", width: 16, formato: "moneda" },
      { header: "Tasa SPOT", key: "tasaSpot", width: 12, formato: "porcentaje" },
      { header: "Monto Detracción (4%)", key: "detraccionMonto", width: 20, formato: "moneda" },
      { header: "Neto a Cobrar", key: "montoNeto", width: 16, formato: "moneda" },
      { header: "Cta Cte Banco Nación", key: "cuentaDetraccion", width: 22, align: "center" },
      { header: "Estado SUNAT", key: "estadoSunat", width: 16, align: "center" },
    ];

    let totalFlete = 0;
    let totalDetraccion = 0;
    let totalNeto = 0;

    const filas = comprobantes.map((c, idx) => {
      const flete = parseFloat(c.montoTotal?.toString() || "0");
      const detraccion = parseFloat(c.detraccionMonto?.toString() || (flete * 0.04).toFixed(2));
      const neto = flete - detraccion;

      totalFlete += flete;
      totalDetraccion += detraccion;
      totalNeto += neto;

      const tipoNombre =
        c.tipoComprobante === "01"
          ? "FACTURA ELECTRÓNICA (01)"
          : c.tipoComprobante === "03"
          ? "BOLETA ELECTRÓNICA (03)"
          : "COMPROBANTE ELECTRÓNICO";

      return {
        item: idx + 1,
        fechaEmision: c.fechaEmision,
        tipo: tipoNombre,
        serieNumero: `${c.serie}-${String(c.numeroCorrelativo).padStart(8, "0")}`,
        rucCliente: c.cliente?.numeroDocumento || "—",
        razonSocial: c.cliente?.razonSocial || "—",
        codigoSunat: "027 - Transp. Terrestre Carga",
        moneda: c.moneda || "PEN",
        montoTotal: flete,
        tasaSpot: 0.04,
        detraccionMonto: detraccion,
        montoNeto: neto,
        cuentaDetraccion: c.cuentaBancoNacion || "00-018-294819",
        estadoSunat: c.estadoSunat?.toUpperCase() || "ACEPTADO",
      };
    });

    const filaTotales = {
      item: "TOTAL",
      razonSocial: "TOTALES GENERALES CONSOLIDADOS",
      montoTotal: totalFlete,
      detraccionMonto: totalDetraccion,
      montoNeto: totalNeto,
    };

    const buffer = await generarExcelCorporativo({
      titulo: "Reporte Tributario de Detracciones SPOT (4%) - SUNAT",
      subtitulo: "Control y registro para abonos en cuenta corriente del Banco de la Nación",
      nombreHoja: "Detracciones SPOT 4%",
      columnas,
      filas,
      filaTotales,
    });

    const fechaHoy = new Date().toISOString().split("T")[0];

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Reporte_Detracciones_SPOT_${fechaHoy}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Error al generar reporte de detracciones:", error);
    return NextResponse.json(
      { error: "Error interno al generar el reporte en Excel" },
      { status: 500 }
    );
  }
}

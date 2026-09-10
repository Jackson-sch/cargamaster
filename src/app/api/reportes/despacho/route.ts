import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ordenesServicio, empresas } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { generarExcelCorporativo, type ColumnaExcel } from "@/lib/excel/excel-builder";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const empresa = await db.query.empresas.findFirst({
      where: eq(empresas.activo, true),
    });

    if (!empresa) {
      return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
    }

    const ordenes = await db.query.ordenesServicio.findMany({
      where: eq(ordenesServicio.empresaId, empresa.id),
      orderBy: [desc(ordenesServicio.createdAt)],
      with: {
        cliente: true,
        ruta: true,
        unidad: true,
        semirremolque: true,
        conductor: true,
      },
    });

    const columnas: ColumnaExcel[] = [
      { header: "N°", key: "item", width: 6, align: "center" },
      { header: "N° Orden (OS)", key: "codigoViaje", width: 16, align: "center" },
      { header: "Cliente Dador de Carga", key: "cliente", width: 28, align: "left" },
      { header: "Ruta de Tránsito", key: "ruta", width: 28, align: "left" },
      { header: "Placa Tracto", key: "placaTracto", width: 14, align: "center" },
      { header: "Placa Carreta", key: "placaCarreta", width: 14, align: "center" },
      { header: "Config. MTC", key: "configuracion", width: 14, align: "center" },
      { header: "Conductor Titular", key: "conductor", width: 26, align: "left" },
      { header: "Tipo de Carga", key: "tipoCarga", width: 18, align: "center" },
      { header: "Peso Bruto (Tn)", key: "pesoTn", width: 16, formato: "numero" },
      { header: "Flete Pactado", key: "flete", width: 16, formato: "moneda" },
      { header: "Fecha Programada", key: "fechaInicio", width: 16, align: "center" },
      { header: "Estado Operativo", key: "estado", width: 18, align: "center" },
    ];

    let totalToneladas = 0;
    let totalFletes = 0;

    const filas = ordenes.map((o, idx) => {
      const pesoKg = parseFloat(o.pesoBrutoKg?.toString() || "0");
      const pesoTn = parseFloat((pesoKg / 1000).toFixed(2));
      const flete = parseFloat(o.fletePactadoMonto?.toString() || "0");

      totalToneladas += pesoTn;
      totalFletes += flete;

      const ejesTracto = o.unidad?.ejes || 3;
      const ejesCarreta = o.semirremolque?.ejes || 3;
      const config = `T${ejesTracto}S${ejesCarreta}`;

      return {
        item: idx + 1,
        codigoViaje: o.codigoViaje,
        cliente: o.cliente?.razonSocial || "—",
        ruta: o.ruta?.nombre || "—",
        placaTracto: o.unidad?.placa || "—",
        placaCarreta: o.semirremolque?.placa || "Sin carreta",
        configuracion: config,
        conductor: o.conductor ? `${o.conductor.nombres} ${o.conductor.apellidos}` : "—",
        tipoCarga: o.tipoCarga === "matpel" ? "⚠️ MATPEL" : "Carga General",
        pesoTn,
        flete,
        fechaInicio: o.fechaHoraProgramada
          ? new Date(o.fechaHoraProgramada).toLocaleDateString("es-PE")
          : "—",
        estado: o.estado?.replace(/_/g, " ").toUpperCase() || "PROGRAMADO",
      };
    });

    const filaTotales = {
      item: "TOTAL",
      cliente: "TOTALES GENERALES",
      pesoTn: totalToneladas,
      flete: totalFletes,
    };

    const buffer = await generarExcelCorporativo({
      titulo: "Reporte Maestro de Despacho y Órdenes de Servicio Terrestre",
      subtitulo: "Seguimiento de fletes, tonelajes PBTC y configuración de flota",
      nombreHoja: "Órdenes de Servicio",
      columnas,
      filas,
      filaTotales,
    });

    const fechaHoy = new Date().toISOString().split("T")[0];

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Reporte_Despacho_Ordenes_${fechaHoy}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Error al generar reporte de despacho:", error);
    return NextResponse.json(
      { error: "Error interno al generar el reporte en Excel" },
      { status: 500 }
    );
  }
}

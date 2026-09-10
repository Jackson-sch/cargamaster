import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { consumoCombustible, empresas } from "@/lib/db/schema";
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

    const consumos = await db.query.consumoCombustible.findMany({
      where: eq(consumoCombustible.empresaId, empresa.id),
      orderBy: [desc(consumoCombustible.createdAt)],
      with: {
        unidad: true,
        conductor: true,
        ordenServicio: {
          with: {
            ruta: true,
          },
        },
      },
    });

    const columnas: ColumnaExcel[] = [
      { header: "N°", key: "item", width: 6, align: "center" },
      { header: "Fecha Registro", key: "fechaRegistro", width: 14, align: "center", formato: "fecha" },
      { header: "Placa Tracto", key: "placa", width: 14, align: "center" },
      { header: "Unidad / Modelo", key: "vehiculo", width: 22, align: "left" },
      { header: "Conductor", key: "conductor", width: 26, align: "left" },
      { header: "Estación / Grifo", key: "estacion", width: 26, align: "left" },
      { header: "N° Comprobante / Vale", key: "comprobante", width: 20, align: "center" },
      { header: "Ruta Asignada", key: "ruta", width: 28, align: "left" },
      { header: "Galones (Gln)", key: "galones", width: 14, formato: "numero" },
      { header: "Precio x Gln", key: "precioGalon", width: 14, formato: "moneda" },
      { header: "Costo Total", key: "costoTotal", width: 16, formato: "moneda" },
      { header: "Odómetro (km)", key: "odometro", width: 16, formato: "numero" },
      { header: "Ratio (km/gln)", key: "ratio", width: 14, formato: "numero" },
      { header: "Eficiencia Térmica", key: "eficiencia", width: 18, align: "center" },
    ];

    let totalGalones = 0;
    let totalInversion = 0;

    const filas = consumos.map((c, idx) => {
      const glns = parseFloat(c.galonesCargados?.toString() || "0");
      const precio = parseFloat(c.precioPorGalon?.toString() || "0");
      const costo = parseFloat(c.totalMonto?.toString() || (glns * precio).toFixed(2));
      const ratio = c.rendimientoKmGalonCalculado
        ? parseFloat(c.rendimientoKmGalonCalculado.toString())
        : 0;

      totalGalones += glns;
      totalInversion += costo;

      let eficiencia = "Normal";
      if (ratio > 0) {
        if (ratio < 7.5) eficiencia = "⚠️ Sobreconsumo";
        else if (ratio >= 9.5) eficiencia = "⭐ Óptimo";
        else eficiencia = "Estándar";
      }

      return {
        item: idx + 1,
        fechaRegistro: c.createdAt ? new Date(c.createdAt).toISOString().split("T")[0] : "—",
        placa: c.unidad?.placa || "—",
        vehiculo: `${c.unidad?.marca || ""} ${c.unidad?.modelo || ""}`.trim() || "—",
        conductor: c.conductor ? `${c.conductor.nombres} ${c.conductor.apellidos}` : "—",
        estacion: c.grifoNombre || "—",
        comprobante: c.numeroValeComprobante || "—",
        ruta: c.ordenServicio?.ruta?.nombre || "Ruta Local / Base",
        galones: glns,
        precioGalon: precio,
        costoTotal: costo,
        odometro: c.odometroAlCargar || 0,
        ratio: ratio > 0 ? ratio : "—",
        eficiencia,
      };
    });

    const filaTotales = {
      item: "TOTAL",
      estacion: "TOTALES CONSOLIDADOS",
      galones: totalGalones,
      costoTotal: totalInversion,
    };

    const buffer = await generarExcelCorporativo({
      titulo: "Reporte de Abastecimiento y Eficiencia Térmica de Combustible (Diesel B5)",
      subtitulo: "Seguimiento de consumo galonaje, kilometraje y ratios de rendimiento",
      nombreHoja: "Consumo Diesel B5",
      columnas,
      filas,
      filaTotales,
    });

    const fechaHoy = new Date().toISOString().split("T")[0];

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Reporte_Consumo_Combustible_${fechaHoy}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Error al generar reporte de combustible:", error);
    return NextResponse.json(
      { error: "Error interno al generar el reporte en Excel" },
      { status: 500 }
    );
  }
}

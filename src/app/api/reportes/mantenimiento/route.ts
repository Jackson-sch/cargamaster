import { NextResponse } from "next/server";
import { obtenerMantenimientos } from "@/lib/actions/mantenimiento";
import { generarExcelCorporativo, type ColumnaExcel } from "@/lib/excel/excel-builder";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { mantenimientos = [] } = await obtenerMantenimientos();

    const columnas: ColumnaExcel[] = [
      { header: "N°", key: "item", width: 6, align: "center" },
      { header: "Placa", key: "placa", width: 14, align: "center" },
      { header: "Tipo Entidad", key: "entidadTipo", width: 14, align: "center" },
      { header: "Detalle Equipo", key: "entidadDetalle", width: 26, align: "left" },
      { header: "Tipo Mantenimiento", key: "tipo", width: 18, align: "center" },
      { header: "Descripción del Servicio", key: "descripcion", width: 36, align: "left" },
      { header: "Taller / Sede", key: "taller", width: 22, align: "left" },
      { header: "Tipo Taller", key: "tipoTaller", width: 14, align: "center" },
      { header: "Odómetro (km)", key: "odometro", width: 14, formato: "numero" },
      { header: "Fecha Prog.", key: "fechaProgramada", width: 14, align: "center", formato: "fecha" },
      { header: "Fecha Ejec.", key: "fechaEjecucion", width: 14, align: "center", formato: "fecha" },
      { header: "Costo MO (S/)", key: "costoMO", width: 15, formato: "moneda" },
      { header: "Costo Repuestos (S/)", key: "costoRep", width: 18, formato: "moneda" },
      { header: "Costo Total (S/)", key: "costoTotal", width: 16, formato: "moneda" },
      { header: "Estado OT", key: "estado", width: 15, align: "center" },
    ];

    let totalMO = 0;
    let totalRep = 0;
    let totalGeneral = 0;

    const filas = mantenimientos.map((m, idx) => {
      const mo = parseFloat(m.costoManoObra?.toString() || "0");
      const rep = parseFloat(m.costoRepuestos?.toString() || "0");
      const tot = parseFloat(m.costoTotal?.toString() || (mo + rep).toString());

      totalMO += mo;
      totalRep += rep;
      totalGeneral += tot;

      let estadoLegible = "Programado";
      if (m.estado === "en_proceso") estadoLegible = "🟡 En Taller";
      else if (m.estado === "completado") estadoLegible = "🟢 Completado";
      else if (m.estado === "cancelado") estadoLegible = "⚪ Cancelado";

      return {
        item: idx + 1,
        placa: m.placa,
        entidadTipo: m.entidadTipo === "unidad" ? "TRACTO" : "SEMIRREMOLQUE",
        entidadDetalle: m.entidadDetalle,
        tipo: m.tipo === "preventivo" ? "PREVENTIVO" : "CORRECTIVO",
        descripcion: m.descripcion,
        taller: m.nombreTaller || (m.taller === "propio" ? "Taller Propio" : "Taller Externo"),
        tipoTaller: m.taller.toUpperCase(),
        odometro: m.odometroRegistro || "—",
        fechaProgramada: m.fechaProgramada,
        fechaEjecucion: m.fechaEjecucion || "—",
        costoMO: mo,
        costoRep: rep,
        costoTotal: tot,
        estado: estadoLegible,
      };
    });

    const filaTotales = {
      item: "TOTAL",
      descripcion: "COSTOS ACUMULADOS DE MANTENIMIENTO",
      costoMO: totalMO,
      costoRep: totalRep,
      costoTotal: totalGeneral,
    };

    const buffer = await generarExcelCorporativo({
      titulo: "Reporte Maestro de Mantenimiento Preventivo & Correctivo de Flota",
      subtitulo: "Control técnico de órdenes de trabajo (OT), repuestos, mano de obra y talleres",
      nombreHoja: "Historial Mantenimiento",
      columnas,
      filas,
      filaTotales,
    });

    const fechaHoy = new Date().toISOString().split("T")[0];

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Reporte_Mantenimiento_Flota_${fechaHoy}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Error al generar reporte de mantenimiento:", error);
    return NextResponse.json(
      { error: "Error interno al exportar reporte de mantenimiento en Excel" },
      { status: 500 }
    );
  }
}

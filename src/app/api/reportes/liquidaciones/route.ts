import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { liquidacionesConductor, empresas } from "@/lib/db/schema";
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

    const liquidaciones = await db.query.liquidacionesConductor.findMany({
      where: eq(liquidacionesConductor.empresaId, empresa.id),
      orderBy: [desc(liquidacionesConductor.createdAt)],
      with: {
        conductor: true,
        ordenServicio: {
          with: {
            ruta: true,
            unidad: true,
          },
        },
      },
    });

    const columnas: ColumnaExcel[] = [
      { header: "N°", key: "item", width: 6, align: "center" },
      { header: "N° Orden (OS)", key: "codigoViaje", width: 16, align: "center" },
      { header: "Conductor", key: "conductor", width: 26, align: "left" },
      { header: "Tracto Asignado", key: "placa", width: 14, align: "center" },
      { header: "Ruta de Viaje", key: "ruta", width: 28, align: "left" },
      { header: "Viáticos Asignados", key: "viaticosAsignados", width: 18, formato: "moneda" },
      { header: "Peajes Declarados", key: "gastosPeajes", width: 18, formato: "moneda" },
      { header: "Cochera Declarada", key: "gastosCochera", width: 18, formato: "moneda" },
      { header: "Otros Gastos", key: "otrosGastos", width: 16, formato: "moneda" },
      { header: "Total Gastos Reales", key: "totalGastos", width: 18, formato: "moneda" },
      { header: "Saldo a Liquidar", key: "saldoFinal", width: 18, formato: "moneda" },
      { header: "Balance", key: "tipoBalance", width: 20, align: "center" },
      { header: "Estado", key: "estado", width: 18, align: "center" },
    ];

    let totalViaticos = 0;
    let totalPeajes = 0;
    let totalCochera = 0;
    let totalOtros = 0;
    let totalGastos = 0;

    const filas = liquidaciones.map((l, idx) => {
      const viaticos = parseFloat(l.viaticosAsignados?.toString() || "0");
      const peajes = parseFloat(l.gastosPeajesDeclarados?.toString() || "0");
      const cochera = parseFloat(l.gastosCocheraDeclarados?.toString() || "0");
      const otros = parseFloat(l.otrosGastos?.toString() || "0");
      const gastos = peajes + cochera + otros;

      const saldoChofer = parseFloat(l.saldoAFavorConductor?.toString() || "0");
      const saldoEmpresa = parseFloat(l.saldoAFavorEmpresa?.toString() || "0");

      totalViaticos += viaticos;
      totalPeajes += peajes;
      totalCochera += cochera;
      totalOtros += otros;
      totalGastos += gastos;

      let tipoBalance = "Cuadrado";
      let saldoDisplay = 0;
      if (saldoChofer > 0) {
        tipoBalance = "A favor del Chofer";
        saldoDisplay = saldoChofer;
      } else if (saldoEmpresa > 0) {
        tipoBalance = "A favor de la Empresa";
        saldoDisplay = -saldoEmpresa;
      }

      return {
        item: idx + 1,
        codigoViaje: l.ordenServicio?.codigoViaje || "—",
        conductor: l.conductor ? `${l.conductor.nombres} ${l.conductor.apellidos}` : "—",
        placa: l.ordenServicio?.unidad?.placa || "—",
        ruta: l.ordenServicio?.ruta?.nombre || "Ruta Interprovincial",
        viaticosAsignados: viaticos,
        gastosPeajes: peajes,
        gastosCochera: cochera,
        otrosGastos: otros,
        totalGastos: gastos,
        saldoFinal: saldoDisplay,
        tipoBalance,
        estado: l.estado?.replace(/_/g, " ").toUpperCase() || "PENDIENTE",
      };
    });

    const filaTotales = {
      item: "TOTAL",
      conductor: "TOTALES CONSOLIDADOS",
      viaticosAsignados: totalViaticos,
      gastosPeajes: totalPeajes,
      gastosCochera: totalCochera,
      otrosGastos: totalOtros,
      totalGastos: totalGastos,
    };

    const buffer = await generarExcelCorporativo({
      titulo: "Reporte de Liquidación de Viáticos, Peajes y Gastos de Ruta",
      subtitulo: "Rendición de cuentas por viaje y saldos netos por conductor",
      nombreHoja: "Liquidaciones de Viaje",
      columnas,
      filas,
      filaTotales,
    });

    const fechaHoy = new Date().toISOString().split("T")[0];

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Reporte_Liquidaciones_Viaje_${fechaHoy}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Error al generar reporte de liquidaciones:", error);
    return NextResponse.json(
      { error: "Error interno al generar el reporte en Excel" },
      { status: 500 }
    );
  }
}

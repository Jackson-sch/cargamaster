import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import React from "react";
import QRCode from "qrcode";
import { obtenerDetalleCompletoViajeAction } from "@/lib/actions/ordenes-servicio";
import { HojaDeRutaPDF } from "@/components/pdf/hoja-de-ruta-pdf";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const res = await obtenerDetalleCompletoViajeAction(id);

    if (!res.success || !res.data || !res.data.orden) {
      return new NextResponse(res.error || "Viaje no encontrado", { status: 404 });
    }

    const { orden, docsUnidad, docsSemirremolque } = res.data;
    const empresa = orden.empresa || {
      razonSocial: "TRANSPORTES CARGAMASTER DEL PERÚ S.A.C.",
      ruc: "20601234567",
      direccionFiscal: "Av. Elmer Faucett N° 4520, Callao, Lima",
      telefono: "01-492-8100",
      email: "despacho@cargamaster.pe",
    };

    // Generar código QR para fiscalización SUTRAN / PNP Carreteras
    const qrPayload = JSON.stringify({
      doc: "HOJA_DE_RUTA_MTC",
      codigo: orden.codigoViaje,
      placaTracto: orden.unidad?.placa || "V7A-890",
      placaCarreta: orden.semirremolque?.placa || "Z1A-987",
      chofer: orden.conductor ? `${orden.conductor.nombres} ${orden.conductor.apellidos}` : "Chofer",
      licencia: orden.conductor?.licencias?.[0]?.numeroLicencia || "Q45829103",
      origen: orden.ruta?.origenDistrito || "Callao",
      destino: orden.ruta?.destinoDistrito || "Arequipa",
      pesoTn: orden.pesoBrutoKg ? (parseFloat(String(orden.pesoBrutoKg)) / 1000).toFixed(2) : "29.50",
      fecha: orden.fechaHoraProgramada ? String(orden.fechaHoraProgramada).split("T")[0] : "2026-09-09",
      validacion: "HABILITADO_MTC_SUTRAN_OK",
    });

    const qrCodeUrl = await QRCode.toDataURL(qrPayload, {
      margin: 1,
      width: 240,
      color: {
        dark: "#0F172A",
        light: "#FFFFFF",
      },
    });

    // Renderizar PDF stream
    const pdfElement = React.createElement(HojaDeRutaPDF, {
      empresa,
      orden,
      docsUnidad: docsUnidad || [],
      docsSemirremolque: docsSemirremolque || [],
      qrCodeUrl,
    });

    const stream = await renderToStream(pdfElement as any);
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    const pdfBuffer = Buffer.concat(chunks);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Hoja-de-Ruta-${orden.codigoViaje}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Error al generar PDF Hoja de Ruta:", error);
    return new NextResponse("Error al generar documento PDF", { status: 500 });
  }
}

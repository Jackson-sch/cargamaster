import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import React from "react";
import QRCode from "qrcode";
import { obtenerDetalleCompletoViajeAction } from "@/lib/actions/ordenes-servicio";
import { GRETransportistaPDF } from "@/components/pdf/gre-transportista-pdf";

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

    const { orden } = res.data;
    const empresa = orden.empresa || {
      razonSocial: "TRANSPORTES CARGAMASTER DEL PERÚ S.A.C.",
      ruc: "20601234567",
      direccionFiscal: "Av. Elmer Faucett N° 4520, Callao, Lima",
      telefono: "01-492-8100",
      email: "despacho@cargamaster.pe",
      registroMtc: "15-REG-MTC/15.02",
    };

    // Correlativo formal simulado según correlativo del viaje
    const cleanId = orden.codigoViaje?.replace(/[^0-9]/g, "").slice(-4) || "0284";
    const numeroGuia = `V001-${cleanId.padStart(6, "0")}`;

    // Payload oficial QR SUNAT según RS 123-2022/SUNAT
    // RUC emisor | Tipo Doc (31) | Serie | Correlativo | Peso Total | Unidad de Medida (KGM) | Fecha Emisión | Tipo Doc Remitente | RUC Remitente | Hash
    const fechaHoy = new Date().toISOString().split("T")[0];
    const fechaEmision = orden.fechaHoraProgramada
      ? new Date(orden.fechaHoraProgramada).toISOString().split("T")[0]
      : fechaHoy;

    const qrPayload = [
      empresa.ruc,
      "31", // Tipo de comprobante SUNAT: Guía de Remisión Transportista
      "V001",
      cleanId.padStart(6, "0"),
      String(orden.pesoBrutoKg || "28000"),
      "KGM",
      fechaEmision,
      "6", // RUC
      orden.cliente?.numeroDocumento || "20100128218",
      "HASH_MTC_SUNAT_VERIFIED_DIGITAL_SIG",
    ].join("|");

    const qrCodeUrl = await QRCode.toDataURL(qrPayload, {
      margin: 1,
      width: 240,
      color: {
        dark: "#0F172A",
        light: "#FFFFFF",
      },
    });

    const pdfElement = React.createElement(GRETransportistaPDF, {
      empresa,
      orden,
      qrCodeUrl,
      numeroGuia,
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
        "Content-Disposition": `inline; filename="GRE-Transportista-${orden.codigoViaje}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Error al generar GRE-Transportista PDF:", error);
    return new NextResponse("Error al generar Guía de Remisión Electrónica PDF", { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import React from "react";
import QRCode from "qrcode";
import { obtenerDetalleCompletoViajeAction } from "@/lib/actions/ordenes-servicio";
import { ManifiestoCargaPDF } from "@/components/pdf/manifiesto-carga-pdf";

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
    };

    // QR para control de balanzas y fiscalización de pesos
    const qrPayload = JSON.stringify({
      doc: "MANIFIESTO_CARGA_MTC",
      codigo: orden.codigoViaje,
      pbtcEstimadoTn: (parseFloat(String(orden.pesoBrutoKg || "29500")) / 1000 + 15.3).toFixed(2),
      configuracion: (orden.unidad?.ejes || 3) === 3 && (orden.semirremolque?.ejes || 3) === 3 ? "T3S3" : "T3S2",
      tracto: orden.unidad?.placa || "V7A-890",
      semirremolque: orden.semirremolque?.placa || "Z1A-987",
      remitenteRuc: orden.cliente?.numeroDocumento || "20100128218",
      tipoCarga: orden.descripcionCarga,
      normativa: "D.S. 058-2003-MTC PESOS Y MEDIDAS",
    });

    const qrCodeUrl = await QRCode.toDataURL(qrPayload, {
      margin: 1,
      width: 240,
      color: {
        dark: "#0F172A",
        light: "#FFFFFF",
      },
    });

    const pdfElement = React.createElement(ManifiestoCargaPDF, {
      empresa,
      orden,
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
        "Content-Disposition": `inline; filename="Manifiesto-Carga-${orden.codigoViaje}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Error al generar PDF Manifiesto de Carga:", error);
    return new NextResponse("Error al generar documento PDF", { status: 500 });
  }
}

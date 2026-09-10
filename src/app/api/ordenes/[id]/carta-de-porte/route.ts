import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import React from "react";
import QRCode from "qrcode";
import { obtenerDetalleCompletoViajeAction } from "@/lib/actions/ordenes-servicio";
import { CartaDePortePDF } from "@/components/pdf/carta-de-porte-pdf";

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
      email: "facturacion@cargamaster.pe",
      bancoNacionCuenta: "00-018-294819",
    };

    // QR para validación comercial y tributaria SPOT 4%
    const flete = parseFloat(String(orden.fletePactadoMonto || "4500"));
    const qrPayload = JSON.stringify({
      doc: "CARTA_DE_PORTE_TERRESTRE",
      contrato: `CP-${orden.codigoViaje}`,
      porteadorRuc: empresa.ruc,
      cargadorRuc: orden.cliente?.numeroDocumento || "20100128218",
      fletePactado: flete,
      moneda: orden.fletePactadoMoneda || "PEN",
      spotDetraccion4Pct: (flete * 0.04).toFixed(2),
      ctaBancoNacion: (empresa as any).bancoNacionCuenta || "00-018-294819",
      codigoServicioSunat: "027 TRANSPORTE DE CARGA",
      baseLegal: "LEY SPOT D.L. 940 Y CODIGO DE COMERCIO ART. 823",
    });

    const qrCodeUrl = await QRCode.toDataURL(qrPayload, {
      margin: 1,
      width: 240,
      color: {
        dark: "#0F172A",
        light: "#FFFFFF",
      },
    });

    const pdfElement = React.createElement(CartaDePortePDF, {
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
        "Content-Disposition": `inline; filename="Carta-de-Porte-${orden.codigoViaje}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Error al generar PDF Carta de Porte:", error);
    return new NextResponse("Error al generar documento PDF", { status: 500 });
  }
}

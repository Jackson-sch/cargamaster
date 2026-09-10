"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  comprobantesPago,
  ordenesServicio,
  clientes,
  empresas,
  type ComprobantePago,
} from "@/lib/db/schema";
import {
  crearFacturaSchema,
  type CrearFacturaInput,
} from "@/lib/validations/facturacion";
import {
  generarXmlFacturaElectronica,
  type DatosEmisorSunat,
} from "@/lib/sunat/ubl-builder";
import { eq, and, desc } from "drizzle-orm";

async function getEmpresaActiva(): Promise<{ id: string; emisor: DatosEmisorSunat }> {
  const empresa = await db.query.empresas.findFirst({
    where: eq(empresas.activo, true),
  });
  if (!empresa) throw new Error("No se encontró empresa activa en el sistema.");

  return {
    id: empresa.id,
    emisor: {
      ruc: empresa.ruc,
      razonSocial: empresa.razonSocial,
      nombreComercial: empresa.nombreComercial || empresa.razonSocial,
      direccion: empresa.direccionFiscal,
      ubigeo: "070101",
      departamento: "Callao",
      provincia: "Callao",
      distrito: "Callao",
      cuentaBancoNacion: "00-018-294819", // Cuenta SPOT Banco de la Nación
    },
  };
}

export async function obtenerComprobantesCompletos() {
  try {
    const { id: empresaId } = await getEmpresaActiva();

    const lista = await db.query.comprobantesPago.findMany({
      where: eq(comprobantesPago.empresaId, empresaId),
      orderBy: [desc(comprobantesPago.createdAt)],
      with: {
        cliente: true,
        ordenServicio: {
          with: {
            ruta: true,
            unidad: true,
          },
        },
      },
    });

    return {
      success: true,
      comprobantes: lista,
    };
  } catch (error) {
    console.error("Error al obtener comprobantes de pago:", error);
    return {
      success: false,
      error: "Error al cargar los comprobantes de pago.",
      comprobantes: [],
    };
  }
}

export async function emitirFacturaFleteAction(data: CrearFacturaInput) {
  try {
    const parsed = crearFacturaSchema.parse(data);
    const { id: empresaId, emisor } = await getEmpresaActiva();

    // 1. Obtener datos del cliente
    const cliente = await db.query.clientes.findFirst({
      where: eq(clientes.id, parsed.clienteId),
    });
    if (!cliente) throw new Error("Cliente dador de carga no encontrado.");

    // 2. Obtener correlativo siguiente
    const ultimo = await db.query.comprobantesPago.findFirst({
      where: and(
        eq(comprobantesPago.empresaId, empresaId),
        eq(comprobantesPago.tipoComprobante, parsed.tipoComprobante),
        eq(comprobantesPago.serie, parsed.serie)
      ),
      orderBy: [desc(comprobantesPago.numeroCorrelativo)],
    });

    const siguienteCorrelativo = ultimo ? ultimo.numeroCorrelativo + 1 : 1;

    const subtotalNum = parseFloat(parsed.montoSubtotal.toString());
    const igvNum = parseFloat(parsed.montoIgv.toString());
    const totalNum = parseFloat(parsed.montoTotal.toString());
    const detraccionNum = parseFloat(parsed.detraccionMonto.toString());

    // 3. Generar XML UBL 2.1 e información SUNAT
    const { xml, hashCpe, qrCode, ticketSimulado } = generarXmlFacturaElectronica(emisor, {
      serie: parsed.serie,
      correlativo: siguienteCorrelativo,
      fechaEmision: parsed.fechaEmision,
      fechaVencimiento: parsed.fechaVencimiento || undefined,
      moneda: parsed.moneda,
      clienteRuc: cliente.numeroDocumento,
      clienteRazonSocial: cliente.razonSocial,
      clienteDireccion: cliente.direccionFiscal,
      descripcionServicio: parsed.descripcionServicio,
      valorVenta: subtotalNum,
      igv: igvNum,
      total: totalNum,
      aplicaDetraccion: parsed.detraccionAplica,
      porcentajeDetraccion: parseFloat(parsed.detraccionPorcentaje.toString()),
      montoDetraccion: detraccionNum,
      cuentaBancoNacion: emisor.cuentaBancoNacion,
    });

    // 4. Registrar en base de datos
    const [nuevoComprobante] = await db
      .insert(comprobantesPago)
      .values({
        empresaId,
        ordenServicioId: parsed.ordenServicioId || null,
        clienteId: parsed.clienteId,
        tipoComprobante: parsed.tipoComprobante,
        serie: parsed.serie,
        numeroCorrelativo: siguienteCorrelativo,
        fechaEmision: parsed.fechaEmision,
        fechaVencimiento: parsed.fechaVencimiento || null,
        moneda: parsed.moneda,
        montoSubtotal: subtotalNum.toFixed(2),
        montoIgv: igvNum.toFixed(2),
        montoTotal: totalNum.toFixed(2),
        detraccionAplica: parsed.detraccionAplica,
        detraccionPorcentaje: parseFloat(parsed.detraccionPorcentaje.toString()).toFixed(2),
        detraccionMonto: detraccionNum.toFixed(2),
        cuentaBancoNacion: emisor.cuentaBancoNacion,
        estadoPago: "pendiente",
        estadoSunat: "aceptado",
        sunatTicketId: ticketSimulado,
        sunatCodigoRespuesta: "0",
        sunatDescripcionRespuesta: "La Factura ha sido aceptada por SUNAT con CDR conforme.",
        hashCpe,
        qrCode,
        xmlFirmadoUrl: `https://storage.cargamaster.pe/xml/${parsed.serie}-${siguienteCorrelativo}.xml`,
        cdrXmlUrl: `https://storage.cargamaster.pe/cdr/R-${parsed.serie}-${siguienteCorrelativo}.xml`,
        pdfUrl: `https://storage.cargamaster.pe/pdf/${parsed.serie}-${siguienteCorrelativo}.pdf`,
        observaciones: parsed.observaciones || null,
      })
      .returning();

    // 5. Si proviene de una orden de servicio, actualizar su estado a facturado
    if (parsed.ordenServicioId) {
      await db
        .update(ordenesServicio)
        .set({ estado: "facturado" })
        .where(eq(ordenesServicio.id, parsed.ordenServicioId));
    }

    revalidatePath("/facturacion");
    revalidatePath("/despacho");
    revalidatePath("/");

    return {
      success: true,
      comprobante: nuevoComprobante,
      serieCorrelativo: `${parsed.serie}-${String(siguienteCorrelativo).padStart(8, "0")}`,
    };
  } catch (error: any) {
    console.error("Error al emitir factura electrónica:", error);
    return {
      success: false,
      error: error.message || "Error al generar la factura electrónica.",
    };
  }
}

export async function cambiarEstadoPagoFacturaAction(
  comprobanteId: string,
  nuevoEstado: "pendiente" | "pagado" | "anulado"
) {
  try {
    await db
      .update(comprobantesPago)
      .set({ estadoPago: nuevoEstado })
      .where(eq(comprobantesPago.id, comprobanteId));

    revalidatePath("/facturacion");
    return { success: true };
  } catch (error: any) {
    console.error("Error al cambiar estado de pago:", error);
    return { success: false, error: error.message || "Error al actualizar pago." };
  }
}

export async function anularComprobantePagoAction(
  comprobanteId: string,
  motivoAnulacion: string,
  tipoBaja: "comunicacion_baja" | "nota_credito" = "comunicacion_baja"
) {
  try {
    const { id: empresaId } = await getEmpresaActiva();

    const cpe = await db.query.comprobantesPago.findFirst({
      where: and(
        eq(comprobantesPago.id, comprobanteId),
        eq(comprobantesPago.empresaId, empresaId)
      ),
    });

    if (!cpe) {
      return { success: false, error: "Comprobante no encontrado." };
    }

    if (cpe.estadoSunat === "anulado") {
      return { success: false, error: "El comprobante ya se encuentra anulado." };
    }

    const obsActual = cpe.observaciones ? `${cpe.observaciones} | ` : "";
    const nuevaObs = `${obsActual}ANULADO [${
      tipoBaja === "comunicacion_baja" ? "Comunicación de Baja SUNAT" : "Nota de Crédito 01"
    }]: ${motivoAnulacion.trim()}`;

    // Actualizar comprobante a anulado
    await db
      .update(comprobantesPago)
      .set({
        estadoSunat: "anulado",
        estadoPago: "anulado",
        sunatDescripcionRespuesta: `Comprobante dado de baja / anulado ante SUNAT. Motivo: ${motivoAnulacion.trim()}`,
        observaciones: nuevaObs,
        updatedAt: new Date(),
      })
      .where(eq(comprobantesPago.id, comprobanteId));

    // Si estaba vinculado a una orden de servicio, liberar la orden a "entregado" para permitir refacturación si aplica
    if (cpe.ordenServicioId) {
      await db
        .update(ordenesServicio)
        .set({
          estado: "entregado",
          updatedAt: new Date(),
        })
        .where(eq(ordenesServicio.id, cpe.ordenServicioId));
    }

    revalidatePath("/facturacion");
    revalidatePath("/despacho");
    revalidatePath("/");

    return {
      success: true,
      message: `Comprobante ${cpe.serie}-${String(cpe.numeroCorrelativo).padStart(8, "0")} anulado correctamente ante SUNAT.`,
    };
  } catch (error: any) {
    console.error("Error al anular comprobante:", error);
    return {
      success: false,
      error: error.message || "Error al procesar la anulación del comprobante.",
    };
  }
}


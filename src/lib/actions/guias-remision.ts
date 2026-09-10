"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  guiasRemision,
  ordenesServicio,
  empresas,
  type GuiaRemision,
} from "@/lib/db/schema";
import {
  crearGreTransportistaSchema,
  type CrearGreTransportistaInput,
} from "@/lib/validations/guias-remision";
import {
  generarXmlGreTransportista,
  type DatosEmisorSunat,
} from "@/lib/sunat/ubl-builder";
import { eq, and, desc, sql } from "drizzle-orm";

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
      cuentaBancoNacion: "00-018-294819", // Cuenta de detracciones BN
    },
  };
}

export async function obtenerGuiasRemisionCompletas() {
  try {
    const { id: empresaId } = await getEmpresaActiva();

    const listaGuias = await db.query.guiasRemision.findMany({
      where: eq(guiasRemision.empresaId, empresaId),
      orderBy: [desc(guiasRemision.createdAt)],
      with: {
        ordenServicio: {
          with: {
            cliente: true,
            unidad: true,
            conductor: true,
            ruta: true,
          },
        },
      },
    });

    return {
      success: true,
      guias: listaGuias,
    };
  } catch (error) {
    console.error("Error al obtener guías de remisión:", error);
    return {
      success: false,
      error: "Error al cargar las guías de remisión electrónicas.",
      guias: [],
    };
  }
}

export async function emitirGreTransportistaAction(data: CrearGreTransportistaInput) {
  try {
    const parsed = crearGreTransportistaSchema.parse(data);
    const { id: empresaId, emisor } = await getEmpresaActiva();

    // 1. Obtener siguiente correlativo para la serie
    const ultimaGuia = await db.query.guiasRemision.findFirst({
      where: and(
        eq(guiasRemision.empresaId, empresaId),
        eq(guiasRemision.tipoGuia, "GRE_TRANSPORTISTA_31"),
        eq(guiasRemision.serie, parsed.serie)
      ),
      orderBy: [desc(guiasRemision.numeroCorrelativo)],
    });

    const siguienteCorrelativo = ultimaGuia ? ultimaGuia.numeroCorrelativo + 1 : 1;

    // 2. Construir XML UBL 2.1 y firma simulada SUNAT
    const { xml, hashCpe, qrCode, ticketSimulado } = generarXmlGreTransportista(emisor, {
      serie: parsed.serie,
      correlativo: siguienteCorrelativo,
      fechaEmision: parsed.fechaEmision,
      fechaInicioTraslado: parsed.fechaInicioTraslado,
      remitenteRuc: parsed.remitenteRuc,
      remitenteRazonSocial: parsed.remitenteRazonSocial,
      destinatarioTipoDoc: parsed.destinatarioTipoDoc,
      destinatarioNumDoc: parsed.destinatarioNumDoc,
      destinatarioRazonSocial: parsed.destinatarioRazonSocial,
      partidaUbigeo: parsed.partidaUbigeo,
      partidaDireccion: parsed.partidaDireccion,
      llegadaUbigeo: parsed.llegadaUbigeo,
      llegadaDireccion: parsed.llegadaDireccion,
      placaTracto: parsed.placaTracto,
      placaSemirremolque: parsed.placaSemirremolque,
      conductorDni: parsed.conductorDni,
      conductorNombres: parsed.conductorNombres,
      conductorApellidos: parsed.conductorApellidos,
      conductorLicencia: parsed.conductorLicencia,
      motivoTraslado: parsed.motivoTraslado,
      descripcionCarga: parsed.descripcionCarga,
      pesoBrutoTotalKg: parsed.pesoBrutoTotalKg,
      unidadMedida: parsed.unidadMedida,
    });

    // 3. Registrar en base de datos Supabase
    const [nuevaGuia] = await db
      .insert(guiasRemision)
      .values({
        empresaId,
        ordenServicioId: parsed.ordenServicioId,
        tipoGuia: "GRE_TRANSPORTISTA_31",
        serie: parsed.serie,
        numeroCorrelativo: siguienteCorrelativo,
        fechaEmision: parsed.fechaEmision,
        fechaInicioTraslado: parsed.fechaInicioTraslado,
        sunatTicketId: ticketSimulado,
        estadoSunat: "aceptado", // En sandbox/offline se genera con CDR de aceptación inmediata
        sunatCodigoRespuesta: "0",
        sunatDescripcionRespuesta: "La Guía de Remisión Electrónica ha sido aceptada por SUNAT.",
        hashCpe,
        qrCode,
        xmlFirmadoUrl: `https://storage.cargamaster.pe/xml/${parsed.serie}-${siguienteCorrelativo}.xml`,
        cdrXmlUrl: `https://storage.cargamaster.pe/cdr/R-${parsed.serie}-${siguienteCorrelativo}.xml`,
        pdfUrl: `https://storage.cargamaster.pe/pdf/${parsed.serie}-${siguienteCorrelativo}.pdf`,
      })
      .returning();

    revalidatePath("/facturacion");
    revalidatePath("/despacho");
    revalidatePath("/");

    return {
      success: true,
      guia: nuevaGuia,
      serieCorrelativo: `${parsed.serie}-${String(siguienteCorrelativo).padStart(8, "0")}`,
    };
  } catch (error: any) {
    console.error("Error al emitir GRE Transportista:", error);
    return {
      success: false,
      error: error.message || "Error al generar la Guía de Remisión Electrónica.",
    };
  }
}

export async function anularGuiaRemisionAction(guiaId: string, motivoAnulacion: string) {
  try {
    const { id: empresaId } = await getEmpresaActiva();

    const guia = await db.query.guiasRemision.findFirst({
      where: and(eq(guiasRemision.id, guiaId), eq(guiasRemision.empresaId, empresaId)),
    });

    if (!guia) {
      return { success: false, error: "Guía de Remisión no encontrada." };
    }

    if (guia.estadoSunat === "anulado") {
      return { success: false, error: "La Guía de Remisión ya se encuentra anulada." };
    }

    await db
      .update(guiasRemision)
      .set({
        estadoSunat: "anulado",
        sunatDescripcionRespuesta: `Baja de GRE aceptada por SUNAT. Motivo: ${motivoAnulacion.trim()}`,
        updatedAt: new Date(),
      })
      .where(eq(guiasRemision.id, guiaId));

    revalidatePath("/facturacion");
    revalidatePath("/despacho");
    revalidatePath("/");

    return {
      success: true,
      message: `Guía ${guia.serie}-${String(guia.numeroCorrelativo).padStart(8, "0")} dada de baja exitosamente.`,
    };
  } catch (error: any) {
    console.error("Error al anular Guía de Remisión:", error);
    return {
      success: false,
      error: error.message || "Error al anular la Guía de Remisión.",
    };
  }
}


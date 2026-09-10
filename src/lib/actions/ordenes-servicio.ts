"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  ordenesServicio,
  historialEstadosViaje,
  evidenciasPod,
  documentosVehiculo,
  licenciasConductor,
  unidades,
  conductores,
  empresas,
} from "@/lib/db/schema";
import {
  ordenServicioSchema,
  cambioEstadoViajeSchema,
  evidenciaPodSchema,
  type OrdenServicioInput,
  type CambioEstadoViajeInput,
  type EvidenciaPodInput,
} from "@/lib/validations/ordenes-servicio";
import { eq, and, desc, count } from "drizzle-orm";

async function getEmpresaId(): Promise<string> {
  const empresa = await db.query.empresas.findFirst({
    where: eq(empresas.activo, true),
  });
  if (!empresa) throw new Error("No se encontró empresa activa en el sistema.");
  return empresa.id;
}

export async function obtenerOrdenesServicioCompletas() {
  try {
    const empresaId = await getEmpresaId();

    const listaOrdenes = await db.query.ordenesServicio.findMany({
      where: eq(ordenesServicio.empresaId, empresaId),
      orderBy: [desc(ordenesServicio.createdAt)],
      with: {
        cliente: true,
        ruta: true,
        unidad: true,
        semirremolque: true,
        conductor: {
          with: {
            licencias: true,
          },
        },
        historial: {
          orderBy: [desc(historialEstadosViaje.createdAt)],
        },
        evidencias: {
          orderBy: [desc(evidenciasPod.createdAt)],
        },
        guias: true,
        comprobantes: true,
      },
    });

    return { success: true, ordenes: listaOrdenes };
  } catch (error) {
    console.error("Error al obtener órdenes de servicio:", error);
    return { success: false, error: "Error al cargar órdenes de servicio.", ordenes: [] };
  }
}

export async function crearOrdenServicioAction(data: OrdenServicioInput) {
  try {
    const parsed = ordenServicioSchema.parse(data);
    const empresaId = await getEmpresaId();
    const hoyStr = new Date().toISOString().split("T")[0];

    // 1. VALIDACIÓN REGULATORIA MTC DE LA UNIDAD (SOAT / CITV)
    const docsUnidad = await db.query.documentosVehiculo.findMany({
      where: and(
        eq(documentosVehiculo.empresaId, empresaId),
        eq(documentosVehiculo.entidadTipo, "unidad"),
        eq(documentosVehiculo.entidadId, parsed.unidadId)
      ),
    });

    const docVencido = docsUnidad.find((d) => d.fechaVencimiento < hoyStr);
    if (docVencido) {
      return {
        success: false,
        error: `⛔ Bloqueo Regulatorio MTC: La unidad seleccionada tiene el documento "${docVencido.tipoDocumento.toUpperCase()}" (N° ${docVencido.numeroDocumento}) VENCIDO desde el ${docVencido.fechaVencimiento}. Es obligatorio regularizarlo antes de programar cualquier viaje.`,
      };
    }

    // 2. VALIDACIÓN REGULATORIA MTC DEL CONDUCTOR (Licencia Vigente)
    const licenciasChofer = await db.query.licenciasConductor.findMany({
      where: eq(licenciasConductor.conductorId, parsed.conductorId),
    });

    const licenciaVencida = licenciasChofer.find((l) => l.fechaRevalidacion < hoyStr);
    if (licenciaVencida) {
      return {
        success: false,
        error: `⛔ Bloqueo Regulatorio MTC: El conductor seleccionado tiene su Licencia de Conducir ${licenciaVencida.categoria} (N° ${licenciaVencida.numeroLicencia}) VENCIDA desde el ${licenciaVencida.fechaRevalidacion}. Ningún viaje puede ser autorizado con licencia vencida.`,
      };
    }

    // 3. Generar Código Correlativo (OS-YYYY-XXXXX)
    const anioActual = new Date().getFullYear();
    const [conteoResult] = await db
      .select({ value: count() })
      .from(ordenesServicio)
      .where(eq(ordenesServicio.empresaId, empresaId));

    const correlativo = String((conteoResult?.value ?? 0) + 1).padStart(5, "0");
    const codigoViaje = `OS-${anioActual}-${correlativo}`;

    // 4. Cálculo de Detracción SUNAT (4% para transporte terrestre de carga pesada)
    const fleteMontoNum = parseFloat(parsed.fletePactadoMonto) || 0;
    const detraccionMonto = (fleteMontoNum * 0.04).toFixed(2);

    // 5. Inserción de la Orden de Servicio
    const [nuevaOrden] = await db
      .insert(ordenesServicio)
      .values({
        empresaId,
        codigoViaje,
        clienteId: parsed.clienteId,
        rutaId: parsed.rutaId,
        unidadId: parsed.unidadId,
        semirremolqueId: parsed.semirremolqueId || null,
        conductorId: parsed.conductorId,
        conductorSecundarioId: parsed.conductorSecundarioId || null,
        tipoCarga: parsed.tipoCarga,
        descripcionCarga: parsed.descripcionCarga,
        pesoBrutoKg: parsed.pesoBrutoKg,
        unidadMedida: parsed.unidadMedida,
        fechaHoraProgramada: new Date(parsed.fechaHoraProgramada),
        estado: "programado",
        fletePactadoMoneda: parsed.fletePactadoMoneda,
        fletePactadoMonto: parsed.fletePactadoMonto,
        detraccionPorcentaje: "4.00",
        detraccionMonto,
        adelantoViaticos: parsed.adelantoViaticos,
        observaciones: parsed.observaciones || null,
      })
      .returning();

    // 6. Registro en Historial de Estados
    await db.insert(historialEstadosViaje).values({
      ordenServicioId: nuevaOrden.id,
      estadoAnterior: null,
      estadoNuevo: "programado",
      observacion: "Orden de servicio creada y validada ante normativa MTC",
    });

    revalidatePath("/despacho");
    revalidatePath("/");
    return { success: true, orden: nuevaOrden };
  } catch (error: any) {
    console.error("Error al crear orden de servicio:", error);
    return {
      success: false,
      error: error?.message || "No se pudo registrar la orden de servicio.",
    };
  }
}

export async function cambiarEstadoViajeAction(data: CambioEstadoViajeInput) {
  try {
    const parsed = cambioEstadoViajeSchema.parse(data);
    const empresaId = await getEmpresaId();

    const ordenActual = await db.query.ordenesServicio.findFirst({
      where: and(
        eq(ordenesServicio.id, parsed.ordenServicioId),
        eq(ordenesServicio.empresaId, empresaId)
      ),
    });

    if (!ordenActual) {
      return { success: false, error: "Orden de servicio no encontrada." };
    }

    const updates: Record<string, any> = {
      estado: parsed.nuevoEstado,
      updatedAt: new Date(),
    };

    if (parsed.nuevoEstado === "en_ruta") {
      updates.fechaHoraInicio = new Date();
      if (parsed.odometro) updates.odometroInicio = parsed.odometro;
      // Actualizar estado del tracto a 'en_ruta'
      await db
        .update(unidades)
        .set({ estado: "en_ruta" })
        .where(eq(unidades.id, ordenActual.unidadId));
    }

    if (parsed.nuevoEstado === "entregado") {
      updates.fechaHoraFin = new Date();
      if (parsed.odometro) updates.odometroFin = parsed.odometro;
      // Liberar tracto a 'disponible'
      await db
        .update(unidades)
        .set({ estado: "disponible" })
        .where(eq(unidades.id, ordenActual.unidadId));
    }

    const [ordenActualizada] = await db
      .update(ordenesServicio)
      .set(updates)
      .where(eq(ordenesServicio.id, parsed.ordenServicioId))
      .returning();

    // Guardar en Historial
    await db.insert(historialEstadosViaje).values({
      ordenServicioId: parsed.ordenServicioId,
      estadoAnterior: ordenActual.estado,
      estadoNuevo: parsed.nuevoEstado,
      latitud: parsed.latitud || null,
      longitud: parsed.longitud || null,
      observacion: parsed.observacion || `Cambio a estado ${parsed.nuevoEstado}`,
    });

    revalidatePath("/despacho");
    revalidatePath("/tracking");
    revalidatePath("/flota");
    revalidatePath("/");
    return { success: true, orden: ordenActualizada };
  } catch (error: any) {
    console.error("Error al cambiar estado del viaje:", error);
    return {
      success: false,
      error: error?.message || "No se pudo actualizar el estado del viaje.",
    };
  }
}

export async function registrarEvidenciaPodAction(data: EvidenciaPodInput) {
  try {
    const parsed = evidenciaPodSchema.parse(data);

    const [evidencia] = await db
      .insert(evidenciasPod)
      .values({
        ordenServicioId: parsed.ordenServicioId,
        tipoEvidencia: parsed.tipoEvidencia,
        archivoUrl: parsed.archivoUrl,
        receptorNombre: parsed.receptorNombre || null,
        receptorDni: parsed.receptorDni || null,
        observaciones: parsed.observaciones || null,
      })
      .returning();

    revalidatePath("/despacho");
    return { success: true, evidencia };
  } catch (error: any) {
    console.error("Error al registrar evidencia POD:", error);
    return {
      success: false,
      error: error?.message || "No se pudo adjuntar la evidencia.",
    };
  }
}

export async function obtenerDetalleCompletoViajeAction(ordenId: string) {
  try {
    const orden = await db.query.ordenesServicio.findFirst({
      where: eq(ordenesServicio.id, ordenId),
      with: {
        empresa: {
          with: {
            sedes: true,
          },
        },
        cliente: true,
        ruta: true,
        unidad: true,
        semirremolque: true,
        conductor: {
          with: {
            licencias: true,
            certificaciones: true,
          },
        },
        guias: true,
        comprobantes: true,
      },
    });

    if (!orden) {
      return { success: false, error: "Orden de servicio no encontrada.", data: null };
    }

    // Consultar documentos activos y vigentes de la unidad (SOAT, CITV, TUC)
    const docsUnidad = await db.query.documentosVehiculo.findMany({
      where: and(
        eq(documentosVehiculo.entidadTipo, "unidad"),
        eq(documentosVehiculo.entidadId, orden.unidadId)
      ),
    });

    // Consultar documentos del semirremolque si aplica
    const docsSemirremolque = orden.semirremolqueId
      ? await db.query.documentosVehiculo.findMany({
          where: and(
            eq(documentosVehiculo.entidadTipo, "semirremolque"),
            eq(documentosVehiculo.entidadId, orden.semirremolqueId)
          ),
        })
      : [];

    return {
      success: true,
      data: {
        orden,
        docsUnidad,
        docsSemirremolque,
      },
    };
  } catch (error: any) {
    console.error("Error al obtener detalle completo del viaje:", error);
    return {
      success: false,
      error: error?.message || "Error al cargar datos del viaje.",
      data: null,
    };
  }
}


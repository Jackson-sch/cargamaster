"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  conductores,
  licenciasConductor,
  certificacionesConductor,
  empresas,
} from "@/lib/db/schema";
import {
  conductorSchema,
  actualizarConductorSchema,
  renovarLicenciaSchema,
  gestionCertificacionSchema,
  type ConductorInput,
  type ActualizarConductorInput,
  type RenovarLicenciaInput,
  type GestionCertificacionInput,
} from "@/lib/validations/conductores";
import { eq, and, desc } from "drizzle-orm";

async function getEmpresaId(): Promise<string> {
  const empresa = await db.query.empresas.findFirst({
    where: eq(empresas.activo, true),
  });
  if (!empresa) throw new Error("No se encontró empresa activa en el sistema.");
  return empresa.id;
}

export async function obtenerConductoresCompletos() {
  try {
    const empresaId = await getEmpresaId();

    const listaConductores = await db.query.conductores.findMany({
      where: eq(conductores.empresaId, empresaId),
      orderBy: [desc(conductores.createdAt)],
      with: {
        licencias: {
          orderBy: [desc(licenciasConductor.createdAt)],
        },
        certificaciones: {
          orderBy: [desc(certificacionesConductor.fechaVencimiento)],
        },
      },
    });

    return {
      success: true,
      conductores: listaConductores,
    };
  } catch (error) {
    console.error("Error al obtener conductores:", error);
    return {
      success: false,
      error: "Error al cargar los conductores.",
      conductores: [],
    };
  }
}

export async function crearConductorAction(data: ConductorInput) {
  try {
    const parsed = conductorSchema.parse(data);
    const empresaId = await getEmpresaId();

    // 1. Insertar Conductor
    const [nuevoConductor] = await db
      .insert(conductores)
      .values({
        empresaId,
        tipoDocumento: parsed.tipoDocumento,
        numeroDocumento: parsed.numeroDocumento,
        nombres: parsed.nombres,
        apellidos: parsed.apellidos,
        telefono: parsed.telefono,
        contactoEmergencia: parsed.contactoEmergencia || null,
        telefonoEmergencia: parsed.telefonoEmergencia || null,
        fechaNacimiento: parsed.fechaNacimiento || null,
        grupoSanguineo: parsed.grupoSanguineo || null,
        estado: "disponible",
      })
      .returning();

    // 2. Insertar Licencia MTC
    await db.insert(licenciasConductor).values({
      conductorId: nuevoConductor.id,
      categoria: parsed.categoriaLicencia,
      numeroLicencia: parsed.numeroLicencia,
      fechaExpedicion: parsed.fechaExpedicion,
      fechaRevalidacion: parsed.fechaRevalidacion,
      puntosAcumuladosMtc: parsed.puntosAcumuladosMtc,
      estado: "vigente",
    });

    // 3. Certificaciones MTC
    if (parsed.certificacionMatpel) {
      await db.insert(certificacionesConductor).values({
        conductorId: nuevoConductor.id,
        tipo: "mercancias_peligrosas_matpel",
        entidadCapacitadora: "ESCUELA DE CONDUCTORES INTEGRAL DEL PERÚ",
        fechaEmision: new Date().toISOString().split("T")[0],
        fechaVencimiento: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        estado: "vigente",
      });
    }

    if (parsed.certificacionSeguridadVial) {
      await db.insert(certificacionesConductor).values({
        conductorId: nuevoConductor.id,
        tipo: "curso_seguridad_vial_mtc",
        entidadCapacitadora: "CENTRO DE CAPACITACION SUTRAN - MTC",
        fechaEmision: new Date().toISOString().split("T")[0],
        fechaVencimiento: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        estado: "vigente",
      });
    }

    revalidatePath("/conductores");
    revalidatePath("/");
    return { success: true, conductor: nuevoConductor };
  } catch (error: any) {
    console.error("Error al crear conductor:", error);
    return {
      success: false,
      error: error?.message || "No se pudo registrar al conductor.",
    };
  }
}

export async function actualizarConductorAction(data: ActualizarConductorInput) {
  try {
    const parsed = actualizarConductorSchema.parse(data);
    const empresaId = await getEmpresaId();

    const [actualizado] = await db
      .update(conductores)
      .set({
        nombres: parsed.nombres,
        apellidos: parsed.apellidos,
        telefono: parsed.telefono,
        contactoEmergencia: parsed.contactoEmergencia,
        telefonoEmergencia: parsed.telefonoEmergencia,
        fechaNacimiento: parsed.fechaNacimiento,
        grupoSanguineo: parsed.grupoSanguineo,
        estado: parsed.estado,
        activo: parsed.activo,
        updatedAt: new Date(),
      })
      .where(and(eq(conductores.id, parsed.id), eq(conductores.empresaId, empresaId)))
      .returning();

    if (!actualizado) {
      return { success: false, error: "Conductor no encontrado o sin permisos." };
    }

    revalidatePath("/conductores");
    revalidatePath("/");
    return { success: true, conductor: actualizado };
  } catch (error: any) {
    console.error("Error al actualizar conductor:", error);
    return {
      success: false,
      error: error?.message || "No se pudo actualizar los datos del conductor.",
    };
  }
}

export async function cambiarEstadoConductorAction(
  id: string,
  estado: "disponible" | "en_viaje" | "descanso_medico" | "vacaciones" | "inactivo"
) {
  try {
    const empresaId = await getEmpresaId();

    const [actualizado] = await db
      .update(conductores)
      .set({ estado, updatedAt: new Date() })
      .where(and(eq(conductores.id, id), eq(conductores.empresaId, empresaId)))
      .returning();

    revalidatePath("/conductores");
    revalidatePath("/");
    return { success: true, conductor: actualizado };
  } catch (error: any) {
    console.error("Error al cambiar estado del conductor:", error);
    return { success: false, error: "No se pudo cambiar el estado del conductor." };
  }
}

export async function darDeBajaConductorAction(id: string) {
  try {
    const empresaId = await getEmpresaId();

    const [actualizado] = await db
      .update(conductores)
      .set({ activo: false, estado: "inactivo", updatedAt: new Date() })
      .where(and(eq(conductores.id, id), eq(conductores.empresaId, empresaId)))
      .returning();

    revalidatePath("/conductores");
    revalidatePath("/");
    return { success: true, conductor: actualizado };
  } catch (error: any) {
    console.error("Error al dar de baja al conductor:", error);
    return { success: false, error: "No se pudo dar de baja al conductor." };
  }
}

export async function renovarLicenciaConductorAction(data: RenovarLicenciaInput) {
  try {
    const parsed = renovarLicenciaSchema.parse(data);

    // Desactivar o actualizar la licencia existente o registrar la renovación
    const licenciaExistente = await db.query.licenciasConductor.findFirst({
      where: eq(licenciasConductor.conductorId, parsed.conductorId),
      orderBy: [desc(licenciasConductor.createdAt)],
    });

    let licenciaResultado;

    if (licenciaExistente) {
      const [actualizada] = await db
        .update(licenciasConductor)
        .set({
          categoria: parsed.categoria,
          numeroLicencia: parsed.numeroLicencia,
          fechaExpedicion: parsed.fechaExpedicion,
          fechaRevalidacion: parsed.fechaRevalidacion,
          puntosAcumuladosMtc: parsed.puntosAcumuladosMtc,
          estado: parsed.estado,
          updatedAt: new Date(),
        })
        .where(eq(licenciasConductor.id, licenciaExistente.id))
        .returning();
      licenciaResultado = actualizada;
    } else {
      const [nueva] = await db
        .insert(licenciasConductor)
        .values({
          conductorId: parsed.conductorId,
          categoria: parsed.categoria,
          numeroLicencia: parsed.numeroLicencia,
          fechaExpedicion: parsed.fechaExpedicion,
          fechaRevalidacion: parsed.fechaRevalidacion,
          puntosAcumuladosMtc: parsed.puntosAcumuladosMtc,
          estado: parsed.estado,
        })
        .returning();
      licenciaResultado = nueva;
    }

    revalidatePath("/conductores");
    revalidatePath("/");
    return { success: true, licencia: licenciaResultado };
  } catch (error: any) {
    console.error("Error al renovar licencia:", error);
    return {
      success: false,
      error: error?.message || "No se pudo registrar la renovación de la licencia.",
    };
  }
}

export async function agregarOActualizarCertificacionAction(data: GestionCertificacionInput) {
  try {
    const parsed = gestionCertificacionSchema.parse(data);

    // Verificar si ya existe esa certificación para actualizarla o insertar nueva
    const certExistente = await db.query.certificacionesConductor.findFirst({
      where: and(
        eq(certificacionesConductor.conductorId, parsed.conductorId),
        eq(certificacionesConductor.tipo, parsed.tipo)
      ),
    });

    let certResultado;

    if (certExistente) {
      const [actualizada] = await db
        .update(certificacionesConductor)
        .set({
          entidadCapacitadora: parsed.entidadCapacitadora,
          numeroCertificado: parsed.numeroCertificado || null,
          fechaEmision: parsed.fechaEmision,
          fechaVencimiento: parsed.fechaVencimiento,
          estado: parsed.estado,
        })
        .where(eq(certificacionesConductor.id, certExistente.id))
        .returning();
      certResultado = actualizada;
    } else {
      const [nueva] = await db
        .insert(certificacionesConductor)
        .values({
          conductorId: parsed.conductorId,
          tipo: parsed.tipo,
          entidadCapacitadora: parsed.entidadCapacitadora,
          numeroCertificado: parsed.numeroCertificado || null,
          fechaEmision: parsed.fechaEmision,
          fechaVencimiento: parsed.fechaVencimiento,
          estado: parsed.estado,
        })
        .returning();
      certResultado = nueva;
    }

    revalidatePath("/conductores");
    revalidatePath("/");
    return { success: true, certificacion: certResultado };
  } catch (error: any) {
    console.error("Error al registrar certificación:", error);
    return {
      success: false,
      error: error?.message || "No se pudo registrar la certificación.",
    };
  }
}

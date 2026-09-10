"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  conductores,
  licenciasConductor,
  certificacionesConductor,
  empresas,
} from "@/lib/db/schema";
import { conductorSchema, type ConductorInput } from "@/lib/validations/conductores";
import { eq, desc } from "drizzle-orm";

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
        licencias: true,
        certificaciones: true,
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

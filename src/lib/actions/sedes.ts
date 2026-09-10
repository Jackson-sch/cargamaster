"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { sedes, empresas, type Sede } from "@/lib/db/schema";
import {
  crearSedeSchema,
  editarSedeSchema,
  type CrearSedeInput,
  type EditarSedeInput,
} from "@/lib/validations/sedes";
import { eq, and } from "drizzle-orm";

async function getEmpresaId(): Promise<string> {
  const empresa = await db.query.empresas.findFirst({
    where: eq(empresas.activo, true),
  });
  if (!empresa) throw new Error("No se encontró empresa activa en el sistema.");
  return empresa.id;
}

export async function obtenerSedes() {
  try {
    const empresaId = await getEmpresaId();

    const lista = await db.query.sedes.findMany({
      where: and(eq(sedes.empresaId, empresaId), eq(sedes.activo, true)),
      orderBy: (sedes, { desc }) => [desc(sedes.esPrincipal), desc(sedes.createdAt)],
    });

    return {
      success: true,
      sedes: lista,
    };
  } catch (error: any) {
    console.error("Error al obtener sedes:", error);
    return {
      success: false,
      error: error.message || "Error al cargar sedes.",
      sedes: [],
    };
  }
}

export async function crearSedeAction(data: CrearSedeInput) {
  try {
    const empresaId = await getEmpresaId();

    const parsed = crearSedeSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Datos de sede inválidos.",
      };
    }

    const {
      nombre,
      codigoSunat,
      direccion,
      departamento,
      provincia,
      distrito,
      ubigeo,
      telefono,
      esPrincipal,
    } = parsed.data;

    // Si la nueva sede es principal, desmarcar las demás
    if (esPrincipal) {
      await db
        .update(sedes)
        .set({ esPrincipal: false })
        .where(eq(sedes.empresaId, empresaId));
    }

    const [nuevaSede] = await db
      .insert(sedes)
      .values({
        empresaId,
        nombre: nombre.trim(),
        codigoSunat: codigoSunat.trim(),
        direccion: direccion.trim(),
        departamento: departamento.trim(),
        provincia: provincia.trim(),
        distrito: distrito.trim(),
        ubigeo: ubigeo.trim(),
        telefono: telefono && telefono.trim() !== "" ? telefono.trim() : null,
        esPrincipal,
        activo: true,
      })
      .returning();

    revalidatePath("/configuracion");
    revalidatePath("/despacho");
    revalidatePath("/flota");

    return {
      success: true,
      message: `Terminal/Sede "${nuevaSede.nombre}" creado exitosamente.`,
      sede: nuevaSede,
    };
  } catch (error: any) {
    console.error("Error al crear sede:", error);
    return {
      success: false,
      error: error.message || "Error al crear la sede.",
    };
  }
}

export async function editarSedeAction(data: EditarSedeInput) {
  try {
    const empresaId = await getEmpresaId();

    const parsed = editarSedeSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Datos de sede inválidos.",
      };
    }

    const {
      id,
      nombre,
      codigoSunat,
      direccion,
      departamento,
      provincia,
      distrito,
      ubigeo,
      telefono,
      esPrincipal,
    } = parsed.data;

    const sedeExistente = await db.query.sedes.findFirst({
      where: and(eq(sedes.id, id), eq(sedes.empresaId, empresaId)),
    });

    if (!sedeExistente) {
      return {
        success: false,
        error: "La sede no existe.",
      };
    }

    // Si se marca como principal, desmarcar las demás
    if (esPrincipal) {
      await db
        .update(sedes)
        .set({ esPrincipal: false })
        .where(eq(sedes.empresaId, empresaId));
    }

    await db
      .update(sedes)
      .set({
        nombre: nombre.trim(),
        codigoSunat: codigoSunat.trim(),
        direccion: direccion.trim(),
        departamento: departamento.trim(),
        provincia: provincia.trim(),
        distrito: distrito.trim(),
        ubigeo: ubigeo.trim(),
        telefono: telefono && telefono.trim() !== "" ? telefono.trim() : null,
        esPrincipal,
        updatedAt: new Date(),
      })
      .where(eq(sedes.id, id));

    revalidatePath("/configuracion");
    revalidatePath("/despacho");
    revalidatePath("/flota");

    return {
      success: true,
      message: `Terminal/Sede "${nombre}" actualizado con éxito.`,
    };
  } catch (error: any) {
    console.error("Error al actualizar sede:", error);
    return {
      success: false,
      error: error.message || "Error al actualizar la sede.",
    };
  }
}

export async function eliminarSedeAction(sedeId: string) {
  try {
    const empresaId = await getEmpresaId();

    const sedeExistente = await db.query.sedes.findFirst({
      where: and(eq(sedes.id, sedeId), eq(sedes.empresaId, empresaId)),
    });

    if (!sedeExistente) {
      return {
        success: false,
        error: "La sede no existe.",
      };
    }

    const totalSedes = await db.query.sedes.findMany({
      where: and(eq(sedes.empresaId, empresaId), eq(sedes.activo, true)),
    });

    if (totalSedes.length <= 1) {
      return {
        success: false,
        error: "No se puede eliminar la única sede activa de la empresa.",
      };
    }

    if (sedeExistente.esPrincipal) {
      return {
        success: false,
        error: "No puedes eliminar la Base Principal. Asigna otra sede como principal primero.",
      };
    }

    // Eliminación segura
    await db.delete(sedes).where(eq(sedes.id, sedeId));

    revalidatePath("/configuracion");
    revalidatePath("/despacho");
    revalidatePath("/flota");

    return {
      success: true,
      message: `Sede "${sedeExistente.nombre}" eliminada correctamente.`,
    };
  } catch (error: any) {
    console.error("Error al eliminar sede:", error);
    return {
      success: false,
      error: error.message || "Error al eliminar la sede.",
    };
  }
}

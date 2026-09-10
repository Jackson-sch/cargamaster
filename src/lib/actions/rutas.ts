"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { rutas, empresas } from "@/lib/db/schema";
import {
  rutaSchema,
  actualizarRutaSchema,
  type RutaInput,
  type ActualizarRutaInput,
} from "@/lib/validations/rutas";
import { eq, and, desc } from "drizzle-orm";

async function getEmpresaId(): Promise<string> {
  const empresa = await db.query.empresas.findFirst({
    where: eq(empresas.activo, true),
  });
  if (!empresa) throw new Error("No se encontró empresa activa en el sistema.");
  return empresa.id;
}

export async function obtenerRutas() {
  try {
    const empresaId = await getEmpresaId();
    const listaRutas = await db.query.rutas.findMany({
      where: eq(rutas.empresaId, empresaId),
      orderBy: [desc(rutas.createdAt)],
    });

    return { success: true, rutas: listaRutas };
  } catch (error) {
    console.error("Error al obtener rutas:", error);
    return { success: false, error: "Error al cargar rutas.", rutas: [] };
  }
}

export async function crearRutaAction(data: RutaInput) {
  try {
    const parsed = rutaSchema.parse(data);
    const empresaId = await getEmpresaId();

    const [nueva] = await db
      .insert(rutas)
      .values({
        empresaId,
        codigoRuta: parsed.codigoRuta,
        nombre: parsed.nombre,
        origenDepartamento: parsed.origenDepartamento,
        origenProvincia: parsed.origenProvincia,
        origenDistrito: parsed.origenDistrito,
        origenUbigeo: parsed.origenUbigeo,
        origenDireccion: parsed.origenDireccion,
        destinoDepartamento: parsed.destinoDepartamento,
        destinoProvincia: parsed.destinoProvincia,
        destinoDistrito: parsed.destinoDistrito,
        destinoUbigeo: parsed.destinoUbigeo,
        destinoDireccion: parsed.destinoDireccion,
        distanciaEstimadaKm: parsed.distanciaEstimadaKm,
        tiempoEstimadoHoras: parsed.tiempoEstimadoHoras,
        peajesEstimadosMonto: parsed.peajesEstimadosMonto,
        galonesEstimados: parsed.galonesEstimados || null,
        activo: true,
      })
      .returning();

    revalidatePath("/rutas");
    revalidatePath("/despacho");
    return { success: true, ruta: nueva };
  } catch (error: any) {
    console.error("Error al crear ruta:", error);
    return {
      success: false,
      error: error?.message || "No se pudo registrar la ruta.",
    };
  }
}

export async function actualizarRutaAction(data: ActualizarRutaInput) {
  try {
    const parsed = actualizarRutaSchema.parse(data);
    const empresaId = await getEmpresaId();

    const [actualizada] = await db
      .update(rutas)
      .set({
        codigoRuta: parsed.codigoRuta,
        nombre: parsed.nombre,
        origenDepartamento: parsed.origenDepartamento,
        origenProvincia: parsed.origenProvincia,
        origenDistrito: parsed.origenDistrito,
        origenUbigeo: parsed.origenUbigeo,
        origenDireccion: parsed.origenDireccion,
        destinoDepartamento: parsed.destinoDepartamento,
        destinoProvincia: parsed.destinoProvincia,
        destinoDistrito: parsed.destinoDistrito,
        destinoUbigeo: parsed.destinoUbigeo,
        destinoDireccion: parsed.destinoDireccion,
        distanciaEstimadaKm: parsed.distanciaEstimadaKm,
        tiempoEstimadoHoras: parsed.tiempoEstimadoHoras,
        peajesEstimadosMonto: parsed.peajesEstimadosMonto,
        galonesEstimados: parsed.galonesEstimados || null,
        activo: parsed.activo ?? true,
        updatedAt: new Date(),
      })
      .where(and(eq(rutas.id, parsed.id), eq(rutas.empresaId, empresaId)))
      .returning();

    if (!actualizada) {
      return { success: false, error: "Ruta no encontrada o sin permisos." };
    }

    revalidatePath("/rutas");
    revalidatePath("/despacho");
    return { success: true, ruta: actualizada };
  } catch (error: any) {
    console.error("Error al actualizar ruta:", error);
    return {
      success: false,
      error: error?.message || "No se pudo actualizar la ruta.",
    };
  }
}

export async function cambiarEstadoRutaAction(id: string, activo: boolean) {
  try {
    const empresaId = await getEmpresaId();

    const [actualizada] = await db
      .update(rutas)
      .set({ activo, updatedAt: new Date() })
      .where(and(eq(rutas.id, id), eq(rutas.empresaId, empresaId)))
      .returning();

    revalidatePath("/rutas");
    revalidatePath("/despacho");
    return { success: true, ruta: actualizada };
  } catch (error: any) {
    console.error("Error al cambiar estado de ruta:", error);
    return { success: false, error: "No se pudo cambiar el estado de la ruta." };
  }
}

export async function darDeBajaRutaAction(id: string) {
  try {
    const empresaId = await getEmpresaId();

    const [actualizada] = await db
      .update(rutas)
      .set({ activo: false, updatedAt: new Date() })
      .where(and(eq(rutas.id, id), eq(rutas.empresaId, empresaId)))
      .returning();

    revalidatePath("/rutas");
    revalidatePath("/despacho");
    return { success: true, ruta: actualizada };
  } catch (error: any) {
    console.error("Error al dar de baja ruta:", error);
    return { success: false, error: "No se pudo dar de baja la ruta." };
  }
}

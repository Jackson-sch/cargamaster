"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { rutas, empresas } from "@/lib/db/schema";
import { rutaSchema, type RutaInput } from "@/lib/validations/rutas";
import { eq, desc } from "drizzle-orm";

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

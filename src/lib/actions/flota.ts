"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  unidades,
  semirremolques,
  asignacionesTractoCarreta,
  documentosVehiculo,
  empresas,
} from "@/lib/db/schema";
import {
  unidadSchema,
  semirremolqueSchema,
  acoplamientoSchema,
  type UnidadInput,
  type SemirremolqueInput,
  type AcoplamientoInput,
} from "@/lib/validations/flota";
import { eq, and, desc } from "drizzle-orm";

// Helper para obtener el empresaId por defecto (Transandina) mientras se autentica
async function getEmpresaId(): Promise<string> {
  const empresa = await db.query.empresas.findFirst({
    where: eq(empresas.activo, true),
  });
  if (!empresa) throw new Error("No se encontró empresa activa en el sistema.");
  return empresa.id;
}

export async function obtenerFlotaCompleta() {
  try {
    const empresaId = await getEmpresaId();

    const listaUnidades = await db.query.unidades.findMany({
      where: eq(unidades.empresaId, empresaId),
      orderBy: [desc(unidades.createdAt)],
      with: {
        acoplamientos: {
          where: eq(asignacionesTractoCarreta.activo, true),
        },
      },
    });

    const listaSemirremolques = await db.query.semirremolques.findMany({
      where: eq(semirremolques.empresaId, empresaId),
      orderBy: [desc(semirremolques.createdAt)],
    });

    const docs = await db.query.documentosVehiculo.findMany({
      where: eq(documentosVehiculo.empresaId, empresaId),
    });

    return {
      success: true,
      unidades: listaUnidades,
      semirremolques: listaSemirremolques,
      documentos: docs,
    };
  } catch (error) {
    console.error("Error al obtener flota:", error);
    return {
      success: false,
      error: "Error al cargar los datos de flota.",
      unidades: [],
      semirremolques: [],
      documentos: [],
    };
  }
}

export async function crearUnidadAction(data: UnidadInput) {
  try {
    const parsed = unidadSchema.parse(data);
    const empresaId = await getEmpresaId();

    const [nueva] = await db
      .insert(unidades)
      .values({
        empresaId,
        placa: parsed.placa,
        tipoUnidad: parsed.tipoUnidad,
        marca: parsed.marca,
        modelo: parsed.modelo,
        anioFabricacion: parsed.anioFabricacion,
        color: parsed.color || null,
        vinChasis: parsed.vinChasis || null,
        numeroMotor: parsed.numeroMotor || null,
        ejes: parsed.ejes,
        capacidadArrastreTn: parsed.capacidadArrastreTn,
        pesoSecoTn: parsed.pesoSecoTn || null,
        tipoCombustible: parsed.tipoCombustible,
        odometroActualKm: parsed.odometroActualKm,
        idDispositivoGps: parsed.idDispositivoGps || null,
        estado: "disponible",
      })
      .returning();

    revalidatePath("/flota");
    revalidatePath("/");
    return { success: true, unidad: nueva };
  } catch (error: any) {
    console.error("Error al crear unidad:", error);
    return {
      success: false,
      error: error?.message || "No se pudo registrar la unidad vehicular.",
    };
  }
}

export async function crearSemirremolqueAction(data: SemirremolqueInput) {
  try {
    const parsed = semirremolqueSchema.parse(data);
    const empresaId = await getEmpresaId();

    const [nuevo] = await db
      .insert(semirremolques)
      .values({
        empresaId,
        placa: parsed.placa,
        tipoCarroceria: parsed.tipoCarroceria,
        marca: parsed.marca || null,
        anioFabricacion: parsed.anioFabricacion || null,
        ejes: parsed.ejes,
        pesoNetoTn: parsed.pesoNetoTn || null,
        cargaUtilMaxTn: parsed.cargaUtilMaxTn,
        volumenM3: parsed.volumenM3 || null,
        estado: "disponible",
      })
      .returning();

    revalidatePath("/flota");
    return { success: true, semirremolque: nuevo };
  } catch (error: any) {
    console.error("Error al crear semirremolque:", error);
    return {
      success: false,
      error: error?.message || "No se pudo registrar el semirremolque.",
    };
  }
}

export async function acoplarTractoCarretaAction(data: AcoplamientoInput) {
  try {
    const parsed = acoplamientoSchema.parse(data);
    const empresaId = await getEmpresaId();

    // 1. Desactivar acoples previos del tracto
    await db
      .update(asignacionesTractoCarreta)
      .set({ activo: false, fechaDesacople: new Date() })
      .where(
        and(
          eq(asignacionesTractoCarreta.empresaId, empresaId),
          eq(asignacionesTractoCarreta.unidadId, parsed.unidadId),
          eq(asignacionesTractoCarreta.activo, true)
        )
      );

    // 2. Desactivar acoples previos de la carreta
    await db
      .update(asignacionesTractoCarreta)
      .set({ activo: false, fechaDesacople: new Date() })
      .where(
        and(
          eq(asignacionesTractoCarreta.empresaId, empresaId),
          eq(asignacionesTractoCarreta.semirremolqueId, parsed.semirremolqueId),
          eq(asignacionesTractoCarreta.activo, true)
        )
      );

    // 3. Crear nueva asignación activa
    const [asignacion] = await db
      .insert(asignacionesTractoCarreta)
      .values({
        empresaId,
        unidadId: parsed.unidadId,
        semirremolqueId: parsed.semirremolqueId,
        observaciones: parsed.observaciones || null,
        activo: true,
      })
      .returning();

    // 4. Actualizar estado del semirremolque a 'acoplado'
    await db
      .update(semirremolques)
      .set({ estado: "acoplado" })
      .where(eq(semirremolques.id, parsed.semirremolqueId));

    revalidatePath("/flota");
    revalidatePath("/");
    return { success: true, asignacion };
  } catch (error: any) {
    console.error("Error al acoplar tracto y carreta:", error);
    return {
      success: false,
      error: error?.message || "No se pudo realizar el acoplamiento.",
    };
  }
}

export async function desacoplarTractoCarretaAction(asignacionId: string) {
  try {
    const empresaId = await getEmpresaId();

    const [asig] = await db
      .update(asignacionesTractoCarreta)
      .set({ activo: false, fechaDesacople: new Date() })
      .where(
        and(
          eq(asignacionesTractoCarreta.id, asignacionId),
          eq(asignacionesTractoCarreta.empresaId, empresaId)
        )
      )
      .returning();

    if (asig) {
      await db
        .update(semirremolques)
        .set({ estado: "disponible" })
        .where(eq(semirremolques.id, asig.semirremolqueId));
    }

    revalidatePath("/flota");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error al desacoplar:", error);
    return { success: false, error: "No se pudo desacoplar la unidad." };
  }
}

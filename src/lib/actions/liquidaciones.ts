"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  liquidacionesConductor,
  ordenesServicio,
  conductores,
  empresas,
  type LiquidacionConductor,
} from "@/lib/db/schema";
import {
  crearLiquidacionSchema,
  type CrearLiquidacionInput,
} from "@/lib/validations/liquidaciones";
import { eq, and, desc } from "drizzle-orm";

async function getEmpresaId(): Promise<string> {
  const empresa = await db.query.empresas.findFirst({
    where: eq(empresas.activo, true),
  });
  if (!empresa) throw new Error("No se encontró empresa activa en el sistema.");
  return empresa.id;
}

export async function obtenerLiquidacionesCompletas() {
  try {
    const empresaId = await getEmpresaId();

    const lista = await db.query.liquidacionesConductor.findMany({
      where: eq(liquidacionesConductor.empresaId, empresaId),
      orderBy: [desc(liquidacionesConductor.createdAt)],
      with: {
        conductor: true,
        ordenServicio: {
          with: {
            cliente: true,
            ruta: true,
            unidad: true,
          },
        },
      },
    });

    return {
      success: true,
      liquidaciones: lista,
    };
  } catch (error) {
    console.error("Error al obtener liquidaciones:", error);
    return {
      success: false,
      error: "Error al cargar las liquidaciones de viaje.",
      liquidaciones: [],
    };
  }
}

export async function crearLiquidacionViajeAction(data: CrearLiquidacionInput) {
  try {
    const parsed = crearLiquidacionSchema.parse(data);
    const empresaId = await getEmpresaId();

    // 1. Verificar si ya existe liquidación para este viaje
    const existente = await db.query.liquidacionesConductor.findFirst({
      where: eq(liquidacionesConductor.ordenServicioId, parsed.ordenServicioId),
    });

    if (existente) {
      throw new Error("Ya existe una liquidación registrada para esta orden de servicio.");
    }

    // 2. Insertar liquidación
    const [nuevaLiquidacion] = await db
      .insert(liquidacionesConductor)
      .values({
        empresaId,
        ordenServicioId: parsed.ordenServicioId,
        conductorId: parsed.conductorId,
        fleteBase: parsed.fleteBase.toFixed(2),
        bonoPuntualidad: parsed.bonoPuntualidad.toFixed(2),
        viaticosAsignados: parsed.viaticosAsignados.toFixed(2),
        gastosPeajesDeclarados: parsed.gastosPeajesDeclarados.toFixed(2),
        gastosCocheraDeclarados: parsed.gastosCocheraDeclarados.toFixed(2),
        otrosGastos: parsed.otrosGastos.toFixed(2),
        saldoAFavorConductor: parsed.saldoAFavorConductor.toFixed(2),
        saldoAFavorEmpresa: parsed.saldoAFavorEmpresa.toFixed(2),
        estado: "aprobado", // Aprobado al rendir cuentas con comprobante
        observaciones: parsed.observaciones || null,
        aprobadoEn: new Date(),
      })
      .returning();

    // 3. Actualizar estado del viaje si corresponde
    await db
      .update(ordenesServicio)
      .set({ estado: "liquidado" })
      .where(eq(ordenesServicio.id, parsed.ordenServicioId));

    revalidatePath("/liquidaciones");
    revalidatePath("/despacho");
    revalidatePath("/");

    return {
      success: true,
      liquidacion: nuevaLiquidacion,
    };
  } catch (error: any) {
    console.error("Error al crear liquidación de viaje:", error);
    return {
      success: false,
      error: error.message || "Error al registrar la liquidación.",
    };
  }
}

export async function pagarLiquidacionAction(liquidacionId: string) {
  try {
    await db
      .update(liquidacionesConductor)
      .set({ estado: "pagado" })
      .where(eq(liquidacionesConductor.id, liquidacionId));

    revalidatePath("/liquidaciones");
    return { success: true };
  } catch (error: any) {
    console.error("Error al pagar liquidación:", error);
    return { success: false, error: error.message || "Error al actualizar pago." };
  }
}

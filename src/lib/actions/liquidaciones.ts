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
  actualizarLiquidacionSchema,
  cambiarEstadoLiquidacionSchema,
  type CrearLiquidacionInput,
  type ActualizarLiquidacionInput,
  type CambiarEstadoLiquidacionInput,
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

export async function actualizarLiquidacionAction(data: ActualizarLiquidacionInput) {
  try {
    const parsed = actualizarLiquidacionSchema.parse(data);
    const empresaId = await getEmpresaId();

    const liqExistente = await db.query.liquidacionesConductor.findFirst({
      where: and(eq(liquidacionesConductor.id, parsed.id), eq(liquidacionesConductor.empresaId, empresaId)),
    });

    if (!liqExistente) {
      return { success: false, error: "La liquidación no existe o no pertenece a la empresa." };
    }

    const [actualizada] = await db
      .update(liquidacionesConductor)
      .set({
        bonoPuntualidad: parsed.bonoPuntualidad.toFixed(2),
        gastosPeajesDeclarados: parsed.gastosPeajesDeclarados.toFixed(2),
        gastosCocheraDeclarados: parsed.gastosCocheraDeclarados.toFixed(2),
        otrosGastos: parsed.otrosGastos.toFixed(2),
        saldoAFavorConductor: parsed.saldoAFavorConductor.toFixed(2),
        saldoAFavorEmpresa: parsed.saldoAFavorEmpresa.toFixed(2),
        observaciones: parsed.observaciones || null,
        updatedAt: new Date(),
      })
      .where(and(eq(liquidacionesConductor.id, parsed.id), eq(liquidacionesConductor.empresaId, empresaId)))
      .returning();

    revalidatePath("/liquidaciones");
    return { success: true, liquidacion: actualizada };
  } catch (error: any) {
    console.error("Error al actualizar liquidación:", error);
    return { success: false, error: error.message || "Error al actualizar gastos de liquidación." };
  }
}

export async function cambiarEstadoLiquidacionAction(data: CambiarEstadoLiquidacionInput) {
  try {
    const parsed = cambiarEstadoLiquidacionSchema.parse(data);
    const empresaId = await getEmpresaId();

    const [actualizada] = await db
      .update(liquidacionesConductor)
      .set({
        estado: parsed.estado,
        updatedAt: new Date(),
      })
      .where(and(eq(liquidacionesConductor.id, parsed.id), eq(liquidacionesConductor.empresaId, empresaId)))
      .returning();

    if (!actualizada) {
      return { success: false, error: "Liquidación no encontrada." };
    }

    revalidatePath("/liquidaciones");
    return { success: true, liquidacion: actualizada };
  } catch (error: any) {
    console.error("Error al cambiar estado de liquidación:", error);
    return { success: false, error: error.message || "Error al cambiar estado." };
  }
}

export async function pagarLiquidacionAction(liquidacionId: string) {
  return cambiarEstadoLiquidacionAction({ id: liquidacionId, estado: "pagado" });
}

export async function eliminarLiquidacionAction(liquidacionId: string) {
  try {
    const empresaId = await getEmpresaId();

    const liqExistente = await db.query.liquidacionesConductor.findFirst({
      where: and(eq(liquidacionesConductor.id, liquidacionId), eq(liquidacionesConductor.empresaId, empresaId)),
    });

    if (!liqExistente) {
      return { success: false, error: "La liquidación no existe o ya fue eliminada." };
    }

    // Revertir estado de la orden de servicio a 'entregado'
    if (liqExistente.ordenServicioId) {
      await db
        .update(ordenesServicio)
        .set({ estado: "entregado" })
        .where(eq(ordenesServicio.id, liqExistente.ordenServicioId));
    }

    await db
      .delete(liquidacionesConductor)
      .where(and(eq(liquidacionesConductor.id, liquidacionId), eq(liquidacionesConductor.empresaId, empresaId)));

    revalidatePath("/liquidaciones");
    revalidatePath("/despacho");
    return { success: true, message: "Liquidación eliminada y orden de servicio revertida a 'entregado'." };
  } catch (error: any) {
    console.error("Error al eliminar liquidación:", error);
    return { success: false, error: error.message || "Error al eliminar la liquidación." };
  }
}


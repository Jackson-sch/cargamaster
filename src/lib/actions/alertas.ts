"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { alertasSistema, empresas, unidades } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

async function getEmpresaId(): Promise<string> {
  const empresa = await db.query.empresas.findFirst({
    where: eq(empresas.activo, true),
  });
  if (!empresa) throw new Error("No se encontró empresa activa en el sistema.");
  return empresa.id;
}

export async function obtenerAlertasSistemaAction() {
  try {
    const empresaId = await getEmpresaId();

    const lista = await db.query.alertasSistema.findMany({
      where: and(
        eq(alertasSistema.empresaId, empresaId),
        eq(alertasSistema.resuelta, false)
      ),
      orderBy: [desc(alertasSistema.createdAt)],
      limit: 10,
    });

    return {
      success: true,
      alertas: lista,
    };
  } catch (error: any) {
    console.error("Error al obtener alertas del sistema:", error);
    return {
      success: false,
      error: error.message || "Error al cargar alertas.",
      alertas: [],
    };
  }
}

export async function resolverAlertaSistemaAction(alertaId: string) {
  try {
    const empresaId = await getEmpresaId();

    await db
      .update(alertasSistema)
      .set({
        resuelta: true,
        resueltaEn: new Date(),
      })
      .where(
        and(eq(alertasSistema.id, alertaId), eq(alertasSistema.empresaId, empresaId))
      );

    revalidatePath("/");
    revalidatePath("/documentos");
    revalidatePath("/tracking");

    return {
      success: true,
      message: "Alerta marcada como atendida.",
    };
  } catch (error: any) {
    console.error("Error al resolver alerta:", error);
    return {
      success: false,
      error: error.message || "Error al actualizar alerta.",
    };
  }
}

export async function reportarIncidenciaEmergenciaAction(data: {
  titulo: string;
  mensaje: string;
  categoria: "parada_no_autorizada" | "desvio_geocerca" | "exceso_velocidad_sutran" | "mantenimiento_preventivo";
  severidad: "warning" | "critical";
  unidadId?: string;
}) {
  try {
    const empresaId = await getEmpresaId();

    // Obtener una unidad por defecto si no se especifica
    let refId = data.unidadId;
    if (!refId) {
      const u = await db.query.unidades.findFirst({
        where: eq(unidades.empresaId, empresaId),
      });
      refId = u?.id;
    }

    if (!refId) {
      return { success: false, error: "No se encontró unidad asociada para la incidencia." };
    }

    const [nuevaAlerta] = await db
      .insert(alertasSistema)
      .values({
        empresaId,
        categoria: data.categoria,
        severidad: data.severidad,
        titulo: data.titulo.trim(),
        mensaje: data.mensaje.trim(),
        referenciaTipo: "unidad",
        referenciaId: refId,
        resuelta: false,
      })
      .returning();

    revalidatePath("/");
    revalidatePath("/tracking");

    return {
      success: true,
      message: "Incidencia operativa registrada y notificada a torre de control.",
      alerta: nuevaAlerta,
    };
  } catch (error: any) {
    console.error("Error al registrar incidencia:", error);
    return {
      success: false,
      error: error.message || "Error al registrar la incidencia de emergencia.",
    };
  }
}

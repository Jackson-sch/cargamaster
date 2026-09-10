"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  posicionesTelemetria,
  unidades,
  ordenesServicio,
  alertasSistema,
  empresas,
} from "@/lib/db/schema";
import { posicionGpsSchema, type PosicionGpsInput } from "@/lib/validations/telemetria";
import { eq, and, desc, sql } from "drizzle-orm";

async function getEmpresaId(): Promise<string> {
  const empresa = await db.query.empresas.findFirst({
    where: eq(empresas.activo, true),
  });
  if (!empresa) throw new Error("No se encontró empresa activa en el sistema.");
  return empresa.id;
}

export async function obtenerTelemetriaEnVivoAction() {
  try {
    const empresaId = await getEmpresaId();

    // 1. Obtener todas las unidades de la flota
    const flota = await db.query.unidades.findMany({
      where: eq(unidades.empresaId, empresaId),
      with: {
        acoplamientos: {
          with: {
            semirremolque: true,
          },
        },
      },
    });

    // 2. Obtener la última posición telemática registrada para cada unidad
    const unidadesConTelemetria = await Promise.all(
      flota.map(async (u) => {
        const ultimaPosicion = await db.query.posicionesTelemetria.findFirst({
          where: eq(posicionesTelemetria.unidadId, u.id),
          orderBy: [desc(posicionesTelemetria.timestampDispositivo)],
          with: {
            ordenServicio: {
              with: {
                cliente: true,
                conductor: true,
                ruta: true,
              },
            },
          },
        });

        // Alertas SUTRAN activas para esta unidad
        const alertas = await db.query.alertasSistema.findMany({
          where: and(
            eq(alertasSistema.referenciaId, u.id),
            eq(alertasSistema.resuelta, false)
          ),
          orderBy: [desc(alertasSistema.createdAt)],
          limit: 3,
        });

        return {
          unidad: u,
          ultimaPosicion: ultimaPosicion || null,
          alertasActivas: alertas,
        };
      })
    );

    return {
      success: true,
      telemetria: unidadesConTelemetria,
    };
  } catch (error) {
    console.error("Error al obtener telemetría en vivo:", error);
    return {
      success: false,
      error: "Error al cargar la telemetría satelital.",
      telemetria: [],
    };
  }
}

export async function registrarPosicionGpsAction(data: PosicionGpsInput) {
  try {
    const parsed = posicionGpsSchema.parse(data);
    const empresaId = await getEmpresaId();

    // 1. Insertar posición en el histórico
    const [nuevaPosicion] = await db
      .insert(posicionesTelemetria)
      .values({
        empresaId,
        unidadId: parsed.unidadId,
        ordenServicioId: parsed.ordenServicioId || null,
        latitud: parsed.latitud,
        longitud: parsed.longitud,
        velocidadKmh: parsed.velocidadKmh.toFixed(2),
        rumboGrados: parsed.rumboGrados,
        ignicion: parsed.ignicion,
        odometroKm: parsed.odometroKm || null,
        nivelCombustiblePct: parsed.nivelCombustiblePct?.toFixed(2) || null,
        proveedorGps: parsed.proveedorGps,
        timestampDispositivo: new Date(),
      })
      .returning();

    // 2. Actualizar odómetro actual en la unidad si se recibió
    if (parsed.odometroKm) {
      await db
        .update(unidades)
        .set({ odometroActualKm: parsed.odometroKm })
        .where(eq(unidades.id, parsed.unidadId));
    }

    // 3. Auditoría normativa SUTRAN: Si la velocidad excede 90 km/h (límite máximo legal de carga)
    if (parsed.velocidadKmh > 90) {
      const unidad = await db.query.unidades.findFirst({
        where: eq(unidades.id, parsed.unidadId),
      });

      await db.insert(alertasSistema).values({
        empresaId,
        categoria: "exceso_velocidad_sutran",
        severidad: "critical",
        titulo: `Exceso de Velocidad SUTRAN: ${parsed.velocidadKmh.toFixed(1)} km/h en ${unidad?.placa || "Unidad"}`,
        mensaje: `La unidad ${unidad?.placa || ""} superó el límite reglamentario de 90 km/h en carretera (registrado a ${parsed.velocidadKmh.toFixed(1)} km/h). Notificar de inmediato al conductor para evitar sanción pecuniaria MTC.`,
        referenciaTipo: "unidad",
        referenciaId: parsed.unidadId,
        resuelta: false,
      });
    }

    revalidatePath("/tracking");
    revalidatePath("/");

    return {
      success: true,
      posicion: nuevaPosicion,
    };
  } catch (error: any) {
    console.error("Error al registrar posición telemática:", error);
    return {
      success: false,
      error: error.message || "Error al registrar posición GPS.",
    };
  }
}

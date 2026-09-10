"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  mantenimientos,
  unidades,
  semirremolques,
  empresas,
  type Mantenimiento,
} from "@/lib/db/schema";
import {
  crearMantenimientoSchema,
  cambiarEstadoMantenimientoSchema,
  actualizarMantenimientoSchema,
  type CrearMantenimientoInput,
  type CambiarEstadoMantenimientoInput,
  type ActualizarMantenimientoInput,
} from "@/lib/validations/mantenimiento";
import { eq, and, desc } from "drizzle-orm";

async function getEmpresaId(): Promise<string> {
  const empresa = await db.query.empresas.findFirst({
    where: eq(empresas.activo, true),
  });
  if (!empresa) throw new Error("No se encontró empresa activa en el sistema.");
  return empresa.id;
}

export async function obtenerMantenimientos() {
  try {
    const empresaId = await getEmpresaId();

    const [mantenimientosList, unidadesList, semisList] = await Promise.all([
      db.query.mantenimientos.findMany({
        where: eq(mantenimientos.empresaId, empresaId),
        orderBy: [desc(mantenimientos.fechaProgramada), desc(mantenimientos.createdAt)],
      }),
      db.query.unidades.findMany({
        where: eq(unidades.empresaId, empresaId),
        columns: {
          id: true,
          placa: true,
          marca: true,
          modelo: true,
          odometroActualKm: true,
          estado: true,
        },
      }),
      db.query.semirremolques.findMany({
        where: eq(semirremolques.empresaId, empresaId),
        columns: {
          id: true,
          placa: true,
          tipoCarroceria: true,
          marca: true,
          ejes: true,
          estado: true,
        },
      }),
    ]);

    const unidadesMap = new Map(unidadesList.map((u) => [u.id, u]));
    const semisMap = new Map(semisList.map((s) => [s.id, s]));

    const enriquecidos = mantenimientosList.map((m) => {
      const u = m.entidadTipo === "unidad" ? unidadesMap.get(m.entidadId) : null;
      const s = m.entidadTipo === "semirremolque" ? semisMap.get(m.entidadId) : null;

      return {
        ...m,
        placa: u?.placa || s?.placa || "N/A",
        entidadDetalle: u
          ? `${u.marca} ${u.modelo} (${u.odometroActualKm.toLocaleString()} km)`
          : s
          ? `${s.tipoCarroceria} - ${s.marca || "Semirremolque"} (${s.ejes} ejes)`
          : "Equipo no registrado",
        unidad: u,
        semirremolque: s,
      };
    });

    return {
      success: true,
      mantenimientos: enriquecidos,
    };
  } catch (error) {
    console.error("Error al obtener mantenimientos:", error);
    return {
      success: false,
      error: "Error al cargar la lista de mantenimientos.",
      mantenimientos: [],
    };
  }
}

export async function obtenerEntidadesParaMantenimiento() {
  try {
    const empresaId = await getEmpresaId();

    const [unidadesList, semirremolquesList] = await Promise.all([
      db.query.unidades.findMany({
        where: and(eq(unidades.empresaId, empresaId), eq(unidades.activo, true)),
        columns: {
          id: true,
          placa: true,
          marca: true,
          modelo: true,
          odometroActualKm: true,
          estado: true,
        },
        orderBy: [desc(unidades.placa)],
      }),
      db.query.semirremolques.findMany({
        where: and(eq(semirremolques.empresaId, empresaId), eq(semirremolques.activo, true)),
        columns: {
          id: true,
          placa: true,
          tipoCarroceria: true,
          marca: true,
          ejes: true,
          estado: true,
        },
        orderBy: [desc(semirremolques.placa)],
      }),
    ]);

    return {
      success: true,
      unidades: unidadesList,
      semirremolques: semirremolquesList,
    };
  } catch (error) {
    console.error("Error al obtener entidades para mantenimiento:", error);
    return {
      success: false,
      unidades: [],
      semirremolques: [],
    };
  }
}

export async function crearMantenimientoAction(data: CrearMantenimientoInput) {
  try {
    const empresaId = await getEmpresaId();

    const parsed = crearMantenimientoSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Datos de mantenimiento inválidos.",
      };
    }

    const val = parsed.data;

    const [nuevo] = await db
      .insert(mantenimientos)
      .values({
        empresaId,
        entidadTipo: val.entidadTipo,
        entidadId: val.entidadId,
        tipo: val.tipo,
        descripcion: val.descripcion.trim(),
        odometroRegistro: val.odometroRegistro || null,
        fechaProgramada: val.fechaProgramada,
        taller: val.taller,
        nombreTaller: val.nombreTaller.trim(),
        costoManoObra: val.costoManoObra.toFixed(2),
        costoRepuestos: val.costoRepuestos.toFixed(2),
        costoTotal: val.costoTotal.toFixed(2),
        estado: val.estado,
        observaciones: val.observaciones && val.observaciones.trim() !== "" ? val.observaciones.trim() : null,
      })
      .returning();

    // Si entra directamente como en_proceso y es tracto, marcar tracto como en mantenimiento
    if (val.estado === "en_proceso" && val.entidadTipo === "unidad") {
      await db
        .update(unidades)
        .set({
          estado: "mantenimiento",
          updatedAt: new Date(),
        })
        .where(eq(unidades.id, val.entidadId));
    } else if (val.estado === "en_proceso" && val.entidadTipo === "semirremolque") {
      await db
        .update(semirremolques)
        .set({
          estado: "mantenimiento",
          updatedAt: new Date(),
        })
        .where(eq(semirremolques.id, val.entidadId));
    }

    revalidatePath("/mantenimiento");
    revalidatePath("/flota");
    revalidatePath("/despacho");

    return {
      success: true,
      message: "Orden de mantenimiento creada con éxito.",
      mantenimientoId: nuevo.id,
    };
  } catch (error) {
    console.error("Error al registrar orden de mantenimiento:", error);
    return {
      success: false,
      error: "Ocurrió un error al crear la orden de mantenimiento.",
    };
  }
}

export async function cambiarEstadoMantenimientoAction(data: CambiarEstadoMantenimientoInput) {
  try {
    const empresaId = await getEmpresaId();

    const parsed = cambiarEstadoMantenimientoSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Datos de cambio de estado inválidos.",
      };
    }

    const { id, estado, fechaEjecucion, costoFinal, observaciones } = parsed.data;

    const mantExistente = await db.query.mantenimientos.findFirst({
      where: and(eq(mantenimientos.id, id), eq(mantenimientos.empresaId, empresaId)),
    });

    if (!mantExistente) {
      return {
        success: false,
        error: "La orden de mantenimiento no existe.",
      };
    }

    const updatePayload: Partial<typeof mantenimientos.$inferInsert> = {
      estado,
      updatedAt: new Date(),
    };

    if (observaciones && observaciones.trim() !== "") {
      updatePayload.observaciones = observaciones.trim();
    }

    if (costoFinal !== undefined) {
      updatePayload.costoTotal = costoFinal.toFixed(2);
    }

    if (estado === "completado" || estado === "cancelado") {
      if (estado === "completado") {
        updatePayload.fechaEjecucion =
          fechaEjecucion && fechaEjecucion.trim() !== ""
            ? fechaEjecucion
            : new Date().toISOString().split("T")[0];
      }

      // Liberar equipo
      if (mantExistente.entidadTipo === "unidad") {
        await db
          .update(unidades)
          .set({
            estado: "disponible",
            updatedAt: new Date(),
          })
          .where(eq(unidades.id, mantExistente.entidadId));
      } else if (mantExistente.entidadTipo === "semirremolque") {
        await db
          .update(semirremolques)
          .set({
            estado: "disponible",
            updatedAt: new Date(),
          })
          .where(eq(semirremolques.id, mantExistente.entidadId));
      }
    } else if (estado === "en_proceso") {
      // Bloquear equipo
      if (mantExistente.entidadTipo === "unidad") {
        await db
          .update(unidades)
          .set({
            estado: "mantenimiento",
            updatedAt: new Date(),
          })
          .where(eq(unidades.id, mantExistente.entidadId));
      } else if (mantExistente.entidadTipo === "semirremolque") {
        await db
          .update(semirremolques)
          .set({
            estado: "mantenimiento",
            updatedAt: new Date(),
          })
          .where(eq(semirremolques.id, mantExistente.entidadId));
      }
    }

    await db
      .update(mantenimientos)
      .set(updatePayload)
      .where(eq(mantenimientos.id, id));

    revalidatePath("/mantenimiento");
    revalidatePath("/flota");
    revalidatePath("/despacho");

    return {
      success: true,
      message: `Orden de mantenimiento actualizada a estado "${estado}".`,
    };
  } catch (error) {
    console.error("Error al actualizar estado de mantenimiento:", error);
    return {
      success: false,
      error: "Ocurrió un error al actualizar la orden de mantenimiento.",
    };
  }
}

export async function actualizarMantenimientoAction(data: ActualizarMantenimientoInput) {
  try {
    const empresaId = await getEmpresaId();
    const parsed = actualizarMantenimientoSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Datos de actualización inválidos.",
      };
    }

    const val = parsed.data;

    const mantExistente = await db.query.mantenimientos.findFirst({
      where: and(eq(mantenimientos.id, val.id), eq(mantenimientos.empresaId, empresaId)),
    });

    if (!mantExistente) {
      return {
        success: false,
        error: "La orden de trabajo de mantenimiento no existe.",
      };
    }

    const [actualizado] = await db
      .update(mantenimientos)
      .set({
        tipo: val.tipo,
        descripcion: val.descripcion.trim(),
        odometroRegistro: val.odometroRegistro || null,
        fechaProgramada: val.fechaProgramada,
        taller: val.taller,
        nombreTaller: val.nombreTaller.trim(),
        costoManoObra: val.costoManoObra.toFixed(2),
        costoRepuestos: val.costoRepuestos.toFixed(2),
        costoTotal: val.costoTotal.toFixed(2),
        observaciones: val.observaciones && val.observaciones.trim() !== "" ? val.observaciones.trim() : null,
        updatedAt: new Date(),
      })
      .where(and(eq(mantenimientos.id, val.id), eq(mantenimientos.empresaId, empresaId)))
      .returning();

    revalidatePath("/mantenimiento");
    revalidatePath("/flota");
    return {
      success: true,
      message: "Orden de mantenimiento actualizada correctamente.",
      mantenimiento: actualizado,
    };
  } catch (error) {
    console.error("Error al actualizar orden de mantenimiento:", error);
    return {
      success: false,
      error: "No se pudo actualizar la orden de mantenimiento.",
    };
  }
}

export async function eliminarMantenimientoAction(id: string) {
  try {
    const empresaId = await getEmpresaId();

    const mantExistente = await db.query.mantenimientos.findFirst({
      where: and(eq(mantenimientos.id, id), eq(mantenimientos.empresaId, empresaId)),
    });

    if (!mantExistente) {
      return {
        success: false,
        error: "La orden de trabajo no existe o ya fue eliminada.",
      };
    }

    if (mantExistente.estado === "en_proceso") {
      return {
        success: false,
        error: "No se puede eliminar una orden de trabajo actualmente en taller (en proceso). Primero libere la unidad o cambie el estado.",
      };
    }

    await db
      .delete(mantenimientos)
      .where(and(eq(mantenimientos.id, id), eq(mantenimientos.empresaId, empresaId)));

    revalidatePath("/mantenimiento");
    revalidatePath("/flota");
    return {
      success: true,
      message: "Orden de mantenimiento eliminada del sistema.",
    };
  } catch (error) {
    console.error("Error al eliminar mantenimiento:", error);
    return {
      success: false,
      error: "Ocurrió un error al eliminar la orden de mantenimiento.",
    };
  }
}


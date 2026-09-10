"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  consumoCombustible,
  unidades,
  conductores,
  ordenesServicio,
  empresas,
  type ConsumoCombustible,
} from "@/lib/db/schema";
import {
  crearConsumoCombustibleSchema,
  type CrearConsumoCombustibleInput,
} from "@/lib/validations/combustible";
import { eq, and, desc, inArray } from "drizzle-orm";

async function getEmpresaId(): Promise<string> {
  const empresa = await db.query.empresas.findFirst({
    where: eq(empresas.activo, true),
  });
  if (!empresa) throw new Error("No se encontró empresa activa en el sistema.");
  return empresa.id;
}

export async function obtenerConsumosCombustible() {
  try {
    const empresaId = await getEmpresaId();

    const lista = await db.query.consumoCombustible.findMany({
      where: eq(consumoCombustible.empresaId, empresaId),
      orderBy: [desc(consumoCombustible.createdAt)],
      with: {
        unidad: true,
        conductor: true,
        ordenServicio: {
          with: {
            ruta: true,
            cliente: true,
          },
        },
      },
    });

    return {
      success: true,
      consumos: lista,
    };
  } catch (error) {
    console.error("Error al obtener consumos de combustible:", error);
    return {
      success: false,
      error: "Error al cargar los vales de combustible.",
      consumos: [],
    };
  }
}

export async function obtenerDatosParaRegistroCombustible() {
  try {
    const empresaId = await getEmpresaId();

    const [unidadesList, conductoresList, ordenesList] = await Promise.all([
      db.query.unidades.findMany({
        where: and(eq(unidades.empresaId, empresaId), eq(unidades.activo, true)),
        columns: {
          id: true,
          placa: true,
          marca: true,
          modelo: true,
          odometroActualKm: true,
        },
        orderBy: [desc(unidades.placa)],
      }),
      db.query.conductores.findMany({
        where: and(eq(conductores.empresaId, empresaId), eq(conductores.activo, true)),
        columns: {
          id: true,
          nombres: true,
          apellidos: true,
          numeroDocumento: true,
        },
        with: {
          licencias: {
            limit: 1,
            orderBy: (licencias, { desc }) => [desc(licencias.createdAt)],
          },
        },
        orderBy: [desc(conductores.apellidos)],
      }),
      db.query.ordenesServicio.findMany({
        where: and(
          eq(ordenesServicio.empresaId, empresaId),
          inArray(ordenesServicio.estado, [
            "programado",
            "cargando",
            "en_ruta",
            "en_destino",
            "entregado",
            "liquidado",
          ])
        ),
        columns: {
          id: true,
          codigoViaje: true,
          estado: true,
        },
        with: {
          ruta: {
            columns: {
              nombre: true,
              origenProvincia: true,
              destinoProvincia: true,
            },
          },
        },
        orderBy: [desc(ordenesServicio.createdAt)],
        limit: 30,
      }),
    ]);

    return {
      success: true,
      unidades: unidadesList,
      conductores: conductoresList,
      ordenes: ordenesList,
    };
  } catch (error) {
    console.error("Error al obtener datos maestros para combustible:", error);
    return {
      success: false,
      unidades: [],
      conductores: [],
      ordenes: [],
    };
  }
}

export async function registrarConsumoCombustibleAction(data: CrearConsumoCombustibleInput) {
  try {
    const empresaId = await getEmpresaId();

    const parsed = crearConsumoCombustibleSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Datos del vale de combustible inválidos.",
      };
    }

    const {
      unidadId,
      conductorId,
      ordenServicioId,
      grifoNombre,
      grifoRuc,
      numeroValeComprobante,
      galonesCargados,
      precioPorGalon,
      totalMonto,
      odometroAlCargar,
      fotoTicketUrl,
    } = parsed.data;

    // Obtener la unidad para verificar odómetro anterior
    const unidadExistente = await db.query.unidades.findFirst({
      where: and(eq(unidades.id, unidadId), eq(unidades.empresaId, empresaId)),
    });

    if (!unidadExistente) {
      return {
        success: false,
        error: "La unidad seleccionada no existe o no pertenece a la empresa.",
      };
    }

    const odometroAnterior = unidadExistente.odometroActualKm || 0;
    let rendimientoCalculado: string | null = null;

    if (odometroAlCargar > odometroAnterior && odometroAnterior > 0) {
      const deltaKm = odometroAlCargar - odometroAnterior;
      const ratio = deltaKm / galonesCargados;
      rendimientoCalculado = ratio.toFixed(2);
    }

    // Registrar consumo
    const [nuevoConsumo] = await db
      .insert(consumoCombustible)
      .values({
        empresaId,
        unidadId,
        conductorId,
        ordenServicioId: ordenServicioId ? ordenServicioId : null,
        grifoNombre: grifoNombre.trim(),
        grifoRuc: grifoRuc && grifoRuc.trim() !== "" ? grifoRuc.trim() : null,
        numeroValeComprobante: numeroValeComprobante.trim().toUpperCase(),
        galonesCargados: galonesCargados.toFixed(2),
        precioPorGalon: precioPorGalon.toFixed(2),
        totalMonto: totalMonto.toFixed(2),
        odometroAlCargar,
        rendimientoKmGalonCalculado: rendimientoCalculado,
        fotoTicketUrl: fotoTicketUrl && fotoTicketUrl.trim() !== "" ? fotoTicketUrl.trim() : null,
      })
      .returning();

    // Actualizar odómetro de la unidad si el nuevo odómetro es mayor
    if (odometroAlCargar > odometroAnterior) {
      await db
        .update(unidades)
        .set({
          odometroActualKm: odometroAlCargar,
          odometroActualizadoEn: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(unidades.id, unidadId));
    }

    revalidatePath("/combustible");
    revalidatePath("/flota");
    revalidatePath("/despacho");

    return {
      success: true,
      message: "Vale de combustible registrado con éxito.",
      consumoId: nuevoConsumo.id,
      rendimiento: rendimientoCalculado,
    };
  } catch (error) {
    console.error("Error al registrar consumo de combustible:", error);
    return {
      success: false,
      error: "Ocurrió un error al registrar el vale de combustible.",
    };
  }
}

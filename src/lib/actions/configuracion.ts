"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { empresas, sedes, type Empresa } from "@/lib/db/schema";
import {
  actualizarConfiguracionSchema,
  type ActualizarConfiguracionInput,
} from "@/lib/validations/configuracion";
import { eq } from "drizzle-orm";

export async function obtenerConfiguracionEmpresa() {
  try {
    const empresa = await db.query.empresas.findFirst({
      where: eq(empresas.activo, true),
      with: {
        sedes: true,
      },
    });

    if (!empresa) {
      return {
        success: false,
        error: "No se encontró empresa activa en el sistema.",
        empresa: null,
      };
    }

    return {
      success: true,
      empresa,
      parametrosSutranSunat: {
        cuentaBancoNacionDetracciones: "00-018-294819",
        codigoServicioDetraccion: "027",
        porcentajeDetraccion: 4,
        limiteVelocidadSutranKmH: 90,
        serieGuiaPredeterminada: "T001",
        serieFacturaPredeterminada: "F001",
      },
    };
  } catch (error) {
    console.error("Error al obtener configuración de empresa:", error);
    return {
      success: false,
      error: "Error al cargar los datos de configuración.",
      empresa: null,
    };
  }
}

export async function actualizarConfiguracionEmpresaAction(data: ActualizarConfiguracionInput) {
  try {
    const empresaActiva = await db.query.empresas.findFirst({
      where: eq(empresas.activo, true),
    });

    if (!empresaActiva) {
      return {
        success: false,
        error: "No se encontró una empresa activa para actualizar.",
      };
    }

    const parsed = actualizarConfiguracionSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Datos de configuración inválidos.",
      };
    }

    const {
      razonSocial,
      nombreComercial,
      direccionFiscal,
      telefono,
      email,
      configAlertasDias,
    } = parsed.data;

    await db
      .update(empresas)
      .set({
        razonSocial: razonSocial.trim(),
        nombreComercial: nombreComercial?.trim() || null,
        direccionFiscal: direccionFiscal.trim(),
        telefono: telefono?.trim() || null,
        email: email?.trim() || null,
        configAlertasDias,
        updatedAt: new Date(),
      })
      .where(eq(empresas.id, empresaActiva.id));

    revalidatePath("/configuracion");
    revalidatePath("/facturacion");
    revalidatePath("/despacho");
    revalidatePath("/documentos");

    return {
      success: true,
      message: "Parámetros y datos fiscales actualizados correctamente.",
    };
  } catch (error) {
    console.error("Error al actualizar configuración de empresa:", error);
    return {
      success: false,
      error: "Ocurrió un error al guardar la configuración.",
    };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { clientes, empresas } from "@/lib/db/schema";
import { clienteSchema, actualizarClienteSchema, type ClienteInput, type ActualizarClienteInput } from "@/lib/validations/clientes";
import { eq, desc, and } from "drizzle-orm";

async function getEmpresaId(): Promise<string> {
  const empresa = await db.query.empresas.findFirst({
    where: eq(empresas.activo, true),
  });
  if (!empresa) throw new Error("No se encontró empresa activa en el sistema.");
  return empresa.id;
}

export async function obtenerClientes() {
  try {
    const empresaId = await getEmpresaId();
    const listaClientes = await db.query.clientes.findMany({
      where: eq(clientes.empresaId, empresaId),
      orderBy: [desc(clientes.createdAt)],
    });

    return { success: true, clientes: listaClientes };
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    return { success: false, error: "Error al cargar clientes.", clientes: [] };
  }
}

export async function crearClienteAction(data: ClienteInput) {
  try {
    const parsed = clienteSchema.parse(data);
    const empresaId = await getEmpresaId();

    const [nuevo] = await db
      .insert(clientes)
      .values({
        empresaId,
        tipoDocumento: parsed.tipoDocumento,
        numeroDocumento: parsed.numeroDocumento,
        razonSocial: parsed.razonSocial,
        direccionFiscal: parsed.direccionFiscal,
        departamento: parsed.departamento || null,
        provincia: parsed.provincia || null,
        distrito: parsed.distrito || null,
        ubigeo: parsed.ubigeo || null,
        contactoNombre: parsed.contactoNombre || null,
        contactoTelefono: parsed.contactoTelefono || null,
        contactoEmail: parsed.contactoEmail || null,
        condicionPagoDias: parsed.condicionPagoDias,
      })
      .returning();

    revalidatePath("/clientes");
    revalidatePath("/despacho");
    return { success: true, cliente: nuevo };
  } catch (error: any) {
    console.error("Error al crear cliente:", error);
    return {
      success: false,
      error: error?.message || "No se pudo registrar al cliente.",
    };
  }
}

export async function actualizarClienteAction(data: ActualizarClienteInput) {
  try {
    const parsed = actualizarClienteSchema.parse(data);
    const empresaId = await getEmpresaId();

    const [actualizado] = await db
      .update(clientes)
      .set({
        tipoDocumento: parsed.tipoDocumento,
        numeroDocumento: parsed.numeroDocumento,
        razonSocial: parsed.razonSocial,
        direccionFiscal: parsed.direccionFiscal,
        departamento: parsed.departamento || null,
        provincia: parsed.provincia || null,
        distrito: parsed.distrito || null,
        ubigeo: parsed.ubigeo || null,
        contactoNombre: parsed.contactoNombre || null,
        contactoTelefono: parsed.contactoTelefono || null,
        contactoEmail: parsed.contactoEmail || null,
        condicionPagoDias: parsed.condicionPagoDias,
        updatedAt: new Date(),
      })
      .where(and(eq(clientes.id, parsed.id), eq(clientes.empresaId, empresaId)))
      .returning();

    if (!actualizado) {
      return { success: false, error: "Cliente no encontrado o no autorizado." };
    }

    revalidatePath("/clientes");
    revalidatePath("/despacho");
    revalidatePath("/facturacion");
    return { success: true, cliente: actualizado };
  } catch (error: any) {
    console.error("Error al actualizar cliente:", error);
    return {
      success: false,
      error: error?.message || "No se pudo actualizar el cliente.",
    };
  }
}

export async function cambiarEstadoClienteAction(id: string, activo: boolean) {
  try {
    const empresaId = await getEmpresaId();
    const [actualizado] = await db
      .update(clientes)
      .set({ activo, updatedAt: new Date() })
      .where(and(eq(clientes.id, id), eq(clientes.empresaId, empresaId)))
      .returning();

    if (!actualizado) {
      return { success: false, error: "Cliente no encontrado." };
    }

    revalidatePath("/clientes");
    revalidatePath("/despacho");
    return { success: true, cliente: actualizado };
  } catch (error: any) {
    console.error("Error al cambiar estado de cliente:", error);
    return {
      success: false,
      error: error?.message || "No se pudo cambiar el estado del cliente.",
    };
  }
}

export async function darDeBajaClienteAction(id: string) {
  try {
    const empresaId = await getEmpresaId();
    const [actualizado] = await db
      .update(clientes)
      .set({ activo: false, updatedAt: new Date() })
      .where(and(eq(clientes.id, id), eq(clientes.empresaId, empresaId)))
      .returning();

    if (!actualizado) {
      return { success: false, error: "Cliente no encontrado." };
    }

    revalidatePath("/clientes");
    revalidatePath("/despacho");
    return { success: true, cliente: actualizado };
  } catch (error: any) {
    console.error("Error al dar de baja cliente:", error);
    return {
      success: false,
      error: error?.message || "No se pudo dar de baja al cliente.",
    };
  }
}


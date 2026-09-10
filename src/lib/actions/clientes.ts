"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { clientes, empresas } from "@/lib/db/schema";
import { clienteSchema, type ClienteInput } from "@/lib/validations/clientes";
import { eq, desc } from "drizzle-orm";

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

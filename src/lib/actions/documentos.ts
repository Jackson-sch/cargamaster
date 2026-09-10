"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  documentosVehiculo,
  alertasSistema,
  unidades,
  semirremolques,
  empresas,
} from "@/lib/db/schema";
import {
  documentoVehiculoSchema,
  type DocumentoVehiculoInput,
} from "@/lib/validations/documentos";
import { calcularEstadoAlerta } from "@/lib/utils/fechas";
import { eq, desc } from "drizzle-orm";

async function getEmpresaId(): Promise<string> {
  const empresa = await db.query.empresas.findFirst({
    where: eq(empresas.activo, true),
  });
  if (!empresa) throw new Error("No se encontró empresa activa en el sistema.");
  return empresa.id;
}

export async function obtenerDocumentosYAlertas() {
  try {
    const empresaId = await getEmpresaId();

    const docs = await db.query.documentosVehiculo.findMany({
      where: eq(documentosVehiculo.empresaId, empresaId),
      orderBy: [desc(documentosVehiculo.fechaVencimiento)],
    });

    const listaUnidades = await db.query.unidades.findMany({
      where: eq(unidades.empresaId, empresaId),
      columns: { id: true, placa: true, tipoUnidad: true, marca: true },
    });

    const listaSemirremolques = await db.query.semirremolques.findMany({
      where: eq(semirremolques.empresaId, empresaId),
      columns: { id: true, placa: true, tipoCarroceria: true },
    });

    // Enriquecer con cálculo de días restantes y nombres
    const docsConDetalle = docs.map((doc) => {
      const { estado, diasRestantes } = calcularEstadoAlerta(doc.fechaVencimiento);
      let entidadNombre = doc.entidadId;

      if (doc.entidadTipo === "unidad") {
        const u = listaUnidades.find((x) => x.id === doc.entidadId);
        if (u) entidadNombre = `${u.placa} (${u.marca})`;
      } else {
        const s = listaSemirremolques.find((x) => x.id === doc.entidadId);
        if (s) entidadNombre = `${s.placa} (${s.tipoCarroceria})`;
      }

      return {
        ...doc,
        estadoAlertaCalculado: estado,
        diasRestantes,
        entidadNombre,
      };
    });

    return {
      success: true,
      documentos: docsConDetalle,
      unidades: listaUnidades,
      semirremolques: listaSemirremolques,
    };
  } catch (error) {
    console.error("Error al obtener documentos:", error);
    return {
      success: false,
      error: "Error al cargar los documentos.",
      documentos: [],
      unidades: [],
      semirremolques: [],
    };
  }
}

export async function registrarDocumentoVehiculoAction(data: DocumentoVehiculoInput) {
  try {
    const parsed = documentoVehiculoSchema.parse(data);
    const empresaId = await getEmpresaId();

    const { estado, diasRestantes } = calcularEstadoAlerta(parsed.fechaVencimiento);

    const [nuevoDoc] = await db
      .insert(documentosVehiculo)
      .values({
        empresaId,
        entidadTipo: parsed.entidadTipo,
        entidadId: parsed.entidadId,
        tipoDocumento: parsed.tipoDocumento,
        numeroDocumento: parsed.numeroDocumento,
        empresaEmisora: parsed.empresaEmisora || null,
        fechaEmision: parsed.fechaEmision,
        fechaVencimiento: parsed.fechaVencimiento,
        archivoAdjuntoUrl: parsed.archivoAdjuntoUrl || null,
        estadoAlerta: estado,
      })
      .returning();

    // Si está por vencer o vencido, registrar alerta preventiva
    if (diasRestantes <= 30) {
      await db.insert(alertasSistema).values({
        empresaId,
        categoria: "vencimiento_documento",
        severidad: diasRestantes <= 7 ? "critical" : "warning",
        titulo: `Documento ${parsed.tipoDocumento.toUpperCase()} próximo a vencer`,
        mensaje: `El documento N° ${parsed.numeroDocumento} vence en ${diasRestantes} días. Tomar previsiones para evitar bloqueo de asignaciones MTC.`,
        referenciaTipo: "unidad",
        referenciaId: parsed.entidadId,
        resuelta: false,
      });
    }

    revalidatePath("/documentos");
    revalidatePath("/flota");
    revalidatePath("/");
    return { success: true, documento: nuevoDoc };
  } catch (error: any) {
    console.error("Error al registrar documento:", error);
    return {
      success: false,
      error: error?.message || "No se pudo registrar el documento.",
    };
  }
}

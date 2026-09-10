import { z } from "zod";

export const ordenServicioSchema = z.object({
  clienteId: z.string().uuid("Selecciona un cliente válido"),
  rutaId: z.string().uuid("Selecciona una ruta válida"),
  unidadId: z.string().uuid("Selecciona una unidad de carga (tracto)"),
  semirremolqueId: z.string().uuid().optional().or(z.literal("")),
  conductorId: z.string().uuid("Selecciona un conductor calificado"),
  conductorSecundarioId: z.string().uuid().optional().or(z.literal("")),
  tipoCarga: z.enum([
    "general",
    "perecible",
    "matpel",
    "granel",
    "maquinaria",
    "refrigerada",
  ]),
  descripcionCarga: z.string().trim().min(3, "Ingresa una descripción de la carga"),
  pesoBrutoKg: z.coerce.string().min(1, "Ingresa el peso bruto de la carga"),
  unidadMedida: z.enum(["KGM", "TNE"]).default("KGM"),
  fechaHoraProgramada: z.string().min(1, "Ingresa fecha y hora programada"),
  fletePactadoMoneda: z.enum(["PEN", "USD"]).default("PEN"),
  fletePactadoMonto: z.coerce.string().min(1, "Ingresa el flete pactado"),
  adelantoViaticos: z.coerce.string().default("0"),
  observaciones: z.string().trim().optional(),
});

export const cambioEstadoViajeSchema = z.object({
  ordenServicioId: z.string().uuid("Orden inválida"),
  nuevoEstado: z.enum([
    "borrador",
    "programado",
    "cargando",
    "en_ruta",
    "en_destino",
    "descargado",
    "entregado",
    "liquidado",
    "facturado",
    "cancelado",
  ]),
  odometro: z.coerce.number().int().optional(),
  latitud: z.string().optional(),
  longitud: z.string().optional(),
  observacion: z.string().trim().optional(),
});

export const evidenciaPodSchema = z.object({
  ordenServicioId: z.string().uuid("Orden inválida"),
  tipoEvidencia: z.enum([
    "foto_carga",
    "foto_descarga",
    "guia_firmada_remitente",
    "firma_digital_cliente",
    "incidencia",
  ]),
  archivoUrl: z.string().min(1, "La URL o archivo es requerido"),
  receptorNombre: z.string().trim().optional(),
  receptorDni: z.string().trim().optional(),
  observaciones: z.string().trim().optional(),
});

export type OrdenServicioInput = z.infer<typeof ordenServicioSchema>;
export type CambioEstadoViajeInput = z.infer<typeof cambioEstadoViajeSchema>;
export type EvidenciaPodInput = z.infer<typeof evidenciaPodSchema>;

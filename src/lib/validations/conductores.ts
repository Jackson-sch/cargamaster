import { z } from "zod";

export const conductorSchema = z.object({
  tipoDocumento: z.enum(["dni", "ce"]).default("dni"),
  numeroDocumento: z
    .string()
    .trim()
    .regex(/^\d{8,12}$/, "El documento debe contener entre 8 y 12 dígitos"),
  nombres: z.string().trim().min(2, "Los nombres son requeridos"),
  apellidos: z.string().trim().min(2, "Los apellidos son requeridos"),
  telefono: z
    .string()
    .trim()
    .min(9, "El teléfono celular debe tener al menos 9 dígitos"),
  contactoEmergencia: z.string().trim().optional().nullable(),
  telefonoEmergencia: z.string().trim().optional().nullable(),
  fechaNacimiento: z.string().optional().nullable(),
  grupoSanguineo: z.string().trim().optional().nullable(),

  // Datos iniciales de licencia MTC
  categoriaLicencia: z.enum(["A-IIb", "A-IIIa", "A-IIIb", "A-IIIc"], {
    message: "Selecciona una categoría de licencia MTC válida",
  }),
  numeroLicencia: z.string().trim().min(5, "El número de licencia es requerido"),
  fechaExpedicion: z.string().min(1, "Ingresa fecha de expedición"),
  fechaRevalidacion: z.string().min(1, "Ingresa fecha de revalidación MTC"),
  puntosAcumuladosMtc: z.coerce.number().int().min(0).max(100).default(0),

  // Certificación inicial
  certificacionMatpel: z.boolean().default(false),
  certificacionSeguridadVial: z.boolean().default(true),
});

export const actualizarConductorSchema = z.object({
  id: z.string().uuid(),
  tipoDocumento: z.enum(["dni", "ce"]).optional(),
  numeroDocumento: z
    .string()
    .trim()
    .regex(/^\d{8,12}$/, "El documento debe contener entre 8 y 12 dígitos")
    .optional(),
  nombres: z.string().trim().min(2, "Los nombres son requeridos").optional(),
  apellidos: z.string().trim().min(2, "Los apellidos son requeridos").optional(),
  telefono: z
    .string()
    .trim()
    .min(9, "El teléfono celular debe tener al menos 9 dígitos")
    .optional(),
  contactoEmergencia: z.string().trim().optional().nullable(),
  telefonoEmergencia: z.string().trim().optional().nullable(),
  fechaNacimiento: z.string().optional().nullable(),
  grupoSanguineo: z.string().trim().optional().nullable(),
  estado: z
    .enum(["disponible", "en_viaje", "descanso_medico", "vacaciones", "inactivo"])
    .optional(),
  activo: z.boolean().optional(),
});

export const renovarLicenciaSchema = z.object({
  conductorId: z.string().uuid("ID de conductor inválido"),
  categoria: z.enum(["A-IIb", "A-IIIa", "A-IIIb", "A-IIIc"]),
  numeroLicencia: z.string().trim().min(5, "El número de licencia es requerido"),
  fechaExpedicion: z.string().min(1, "Ingresa fecha de expedición"),
  fechaRevalidacion: z.string().min(1, "Ingresa fecha de revalidación"),
  puntosAcumuladosMtc: z.coerce.number().int().min(0).max(100).default(0),
  estado: z.enum(["vigente", "por_vencer", "vencida", "suspendida"]).default("vigente"),
});

export const gestionCertificacionSchema = z.object({
  conductorId: z.string().uuid("ID de conductor inválido"),
  tipo: z.enum([
    "curso_seguridad_vial_mtc",
    "mercancias_peligrosas_matpel",
    "examen_medico_anual",
    "psicosensometrico",
    "induccion_mina",
  ]),
  entidadCapacitadora: z.string().trim().min(3, "Ingresa la entidad capacitadora"),
  numeroCertificado: z.string().trim().optional().nullable(),
  fechaEmision: z.string().min(1, "Ingresa la fecha de emisión"),
  fechaVencimiento: z.string().min(1, "Ingresa la fecha de vencimiento"),
  estado: z.enum(["vigente", "por_vencer", "vencido"]).default("vigente"),
});

export type ConductorInput = z.infer<typeof conductorSchema>;
export type ActualizarConductorInput = z.infer<typeof actualizarConductorSchema>;
export type RenovarLicenciaInput = z.infer<typeof renovarLicenciaSchema>;
export type GestionCertificacionInput = z.infer<typeof gestionCertificacionSchema>;

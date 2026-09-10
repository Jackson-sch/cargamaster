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
  contactoEmergencia: z.string().trim().optional(),
  telefonoEmergencia: z.string().trim().optional(),
  fechaNacimiento: z.string().optional(),
  grupoSanguineo: z.string().trim().optional(),
  
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

export type ConductorInput = z.infer<typeof conductorSchema>;

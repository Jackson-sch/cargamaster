import { z } from "zod";

export const crearSedeSchema = z.object({
  nombre: z.string().min(3, "El nombre de la sede o patio debe tener al menos 3 caracteres"),
  codigoSunat: z
    .string()
    .length(4, "El código de establecimiento anexo SUNAT debe tener 4 dígitos (ej: 0000, 0001)")
    .regex(/^\d{4}$/, "El código SUNAT debe contener solo dígitos"),
  direccion: z.string().min(5, "Ingrese la dirección completa del patio o terminal"),
  departamento: z.string().min(2, "Ingrese el departamento"),
  provincia: z.string().min(2, "Ingrese la provincia"),
  distrito: z.string().min(2, "Ingrese el distrito"),
  ubigeo: z
    .string()
    .length(6, "El ubigeo INEI debe tener 6 dígitos")
    .regex(/^\d{6}$/, "El ubigeo debe ser numérico de 6 dígitos"),
  telefono: z.string().optional().or(z.literal("")),
  esPrincipal: z.boolean().default(false),
});

export const editarSedeSchema = crearSedeSchema.extend({
  id: z.string().uuid("ID de sede inválido"),
});

export type CrearSedeInput = z.infer<typeof crearSedeSchema>;
export type EditarSedeInput = z.infer<typeof editarSedeSchema>;

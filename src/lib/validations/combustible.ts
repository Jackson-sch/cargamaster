import { z } from "zod";

export const crearConsumoCombustibleSchema = z.object({
  unidadId: z.string().uuid("Debe seleccionar un tracto/unidad válido"),
  conductorId: z.string().uuid("Debe seleccionar un conductor"),
  ordenServicioId: z.string().uuid().optional().or(z.literal("")),
  grifoNombre: z.string().min(2, "Ingrese el nombre del grifo o estación de servicio"),
  grifoRuc: z
    .string()
    .length(11, "El RUC del grifo debe tener 11 dígitos")
    .optional()
    .or(z.literal("")),
  numeroValeComprobante: z
    .string()
    .min(3, "Ingrese el número de vale o comprobante (ej: F001-00049182)"),
  galonesCargados: z.coerce
    .number()
    .positive("La cantidad de galones debe ser mayor a 0"),
  precioPorGalon: z.coerce
    .number()
    .positive("El precio por galón debe ser mayor a 0"),
  totalMonto: z.coerce
    .number()
    .positive("El monto total debe ser mayor a 0"),
  odometroAlCargar: z.coerce
    .number()
    .int("El odómetro debe ser un número entero")
    .nonnegative("El odómetro no puede ser negativo"),
  fotoTicketUrl: z.string().optional().or(z.literal("")),
});

export const actualizarConsumoCombustibleSchema = z.object({
  id: z.string().uuid("ID de vale inválido"),
  grifoNombre: z.string().min(2, "Ingrese el nombre del grifo o estación de servicio"),
  grifoRuc: z
    .string()
    .length(11, "El RUC del grifo debe tener 11 dígitos")
    .optional()
    .or(z.literal("")),
  numeroValeComprobante: z
    .string()
    .min(3, "Ingrese el número de vale o comprobante (ej: F001-00049182)"),
  galonesCargados: z.coerce
    .number()
    .positive("La cantidad de galones debe ser mayor a 0"),
  precioPorGalon: z.coerce
    .number()
    .positive("El precio por galón debe ser mayor a 0"),
  totalMonto: z.coerce
    .number()
    .positive("El monto total debe ser mayor a 0"),
  odometroAlCargar: z.coerce
    .number()
    .int("El odómetro debe ser un número entero")
    .nonnegative("El odómetro no puede ser negativo"),
  fotoTicketUrl: z.string().optional().or(z.literal("")),
});

export type CrearConsumoCombustibleInput = z.infer<typeof crearConsumoCombustibleSchema>;
export type ActualizarConsumoCombustibleInput = z.infer<typeof actualizarConsumoCombustibleSchema>;

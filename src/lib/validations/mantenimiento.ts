import { z } from "zod";

export const crearMantenimientoSchema = z.object({
  entidadTipo: z.enum(["unidad", "semirremolque"], {
    message: "Debe seleccionar si el mantenimiento es para un tracto o un semirremolque",
  }),
  entidadId: z.string().uuid("Debe seleccionar una unidad o semirremolque válido"),
  tipo: z.enum(["preventivo", "correctivo"], {
    message: "Seleccione el tipo de mantenimiento",
  }),
  descripcion: z
    .string()
    .min(5, "Ingrese una descripción detallada del servicio o avería"),
  odometroRegistro: z.coerce.number().int().nonnegative().optional(),
  fechaProgramada: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)"),
  taller: z.enum(["propio", "tercero"], {
    message: "Seleccione si el taller es propio o tercero",
  }),
  nombreTaller: z
    .string()
    .min(2, "Ingrese el nombre del taller o patio de mantenimiento"),
  costoManoObra: z.coerce.number().min(0, "El costo de mano de obra no puede ser negativo"),
  costoRepuestos: z.coerce.number().min(0, "El costo de repuestos no puede ser negativo"),
  costoTotal: z.coerce.number().min(0, "El costo total no puede ser negativo"),
  estado: z
    .enum(["pendiente", "en_proceso", "completado", "cancelado"])
    .default("pendiente"),
  observaciones: z.string().optional().or(z.literal("")),
});

export const cambiarEstadoMantenimientoSchema = z.object({
  id: z.string().uuid("ID de mantenimiento inválido"),
  estado: z.enum(["pendiente", "en_proceso", "completado", "cancelado"]),
  fechaEjecucion: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)")
    .optional()
    .or(z.literal("")),
  costoFinal: z.coerce.number().min(0).optional(),
  observaciones: z.string().optional().or(z.literal("")),
});

export const actualizarMantenimientoSchema = z.object({
  id: z.string().uuid("ID de mantenimiento inválido"),
  tipo: z.enum(["preventivo", "correctivo"], {
    message: "Seleccione el tipo de mantenimiento",
  }),
  descripcion: z
    .string()
    .min(5, "Ingrese una descripción detallada del servicio o avería"),
  odometroRegistro: z.coerce.number().int().nonnegative().optional(),
  fechaProgramada: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)"),
  taller: z.enum(["propio", "tercero"], {
    message: "Seleccione si el taller es propio o tercero",
  }),
  nombreTaller: z
    .string()
    .min(2, "Ingrese el nombre del taller o patio de mantenimiento"),
  costoManoObra: z.coerce.number().min(0, "El costo de mano de obra no puede ser negativo"),
  costoRepuestos: z.coerce.number().min(0, "El costo de repuestos no puede ser negativo"),
  costoTotal: z.coerce.number().min(0, "El costo total no puede ser negativo"),
  observaciones: z.string().optional().or(z.literal("")),
});

export type CrearMantenimientoInput = z.infer<typeof crearMantenimientoSchema>;
export type CambiarEstadoMantenimientoInput = z.infer<typeof cambiarEstadoMantenimientoSchema>;
export type ActualizarMantenimientoInput = z.infer<typeof actualizarMantenimientoSchema>;

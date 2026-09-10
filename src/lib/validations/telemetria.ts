import { z } from "zod";

export const posicionGpsSchema = z.object({
  unidadId: z.string().uuid("Debe seleccionar una unidad válida"),
  ordenServicioId: z.string().uuid().optional().or(z.literal("")),
  latitud: z.string().min(3, "Latitud requerida"),
  longitud: z.string().min(3, "Longitud requerida"),
  velocidadKmh: z.coerce.number().min(0).max(160, "Velocidad fuera de rango"),
  rumboGrados: z.coerce.number().min(0).max(360).default(0),
  ignicion: z.boolean().default(true),
  odometroKm: z.coerce.number().optional(),
  nivelCombustiblePct: z.coerce.number().min(0).max(100).optional(),
  proveedorGps: z.string().default("teltonika_fmb"),
});

export type PosicionGpsInput = z.infer<typeof posicionGpsSchema>;

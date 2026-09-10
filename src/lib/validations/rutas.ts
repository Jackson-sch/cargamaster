import { z } from "zod";

export const rutaSchema = z.object({
  codigoRuta: z
    .string()
    .trim()
    .toUpperCase()
    .min(3, "El código de ruta es obligatorio (ej. LIM-AQP-01)"),
  nombre: z.string().trim().min(5, "El nombre de la ruta es obligatorio"),
  origenDepartamento: z.string().trim().min(2, "Departamento de origen requerido"),
  origenProvincia: z.string().trim().min(2, "Provincia de origen requerida"),
  origenDistrito: z.string().trim().min(2, "Distrito de origen requerido"),
  origenUbigeo: z.string().trim().length(6, "El ubigeo de origen debe tener 6 dígitos"),
  origenDireccion: z.string().trim().min(5, "Dirección o punto de partida requerido"),
  destinoDepartamento: z.string().trim().min(2, "Departamento de destino requerido"),
  destinoProvincia: z.string().trim().min(2, "Provincia de destino requerida"),
  destinoDistrito: z.string().trim().min(2, "Distrito de destino requerido"),
  destinoUbigeo: z.string().trim().length(6, "El ubigeo de destino debe tener 6 dígitos"),
  destinoDireccion: z.string().trim().min(5, "Dirección o punto de llegada requerido"),
  distanciaEstimadaKm: z.coerce.string().min(1, "Ingresa la distancia estimada en km"),
  tiempoEstimadoHoras: z.coerce.string().min(1, "Ingresa el tiempo estimado de tránsito"),
  peajesEstimadosMonto: z.coerce.string().default("0"),
  galonesEstimados: z.coerce.string().optional().nullable(),
});

export const actualizarRutaSchema = rutaSchema.extend({
  id: z.string().uuid("ID de ruta inválido"),
  activo: z.boolean().optional(),
});

export type RutaInput = z.infer<typeof rutaSchema>;
export type ActualizarRutaInput = z.infer<typeof actualizarRutaSchema>;

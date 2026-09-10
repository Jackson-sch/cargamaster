import { z } from "zod";

// Validador de placa vehicular MTC Perú:
// Ejemplos: "ABC-123", "V7A-890", "Z1A-987", "A1B-999"
export const placaMtcRegex = /^[A-Z0-9]{3}-[A-Z0-9]{3}$/;

export const unidadSchema = z.object({
  placa: z
    .string()
    .trim()
    .toUpperCase()
    .regex(placaMtcRegex, {
      message: "Formato de placa inválido. Debe ser de 6 caracteres con guion (ej. V7A-890 o ABC-123)",
    }),
  tipoUnidad: z.enum(["tracto", "rigido", "camioneta"], {
    message: "Selecciona un tipo de unidad válido",
  }),
  marca: z.string().trim().min(2, "La marca es requerida"),
  modelo: z.string().trim().min(2, "El modelo es requerido"),
  anioFabricacion: z.coerce
    .number()
    .int()
    .min(1990, "Año mínimo 1990")
    .max(new Date().getFullYear() + 1, "Año no puede ser futuro"),
  color: z.string().trim().optional(),
  vinChasis: z.string().trim().optional(),
  numeroMotor: z.string().trim().optional(),
  ejes: z.coerce.number().int().min(2).max(6).default(3),
  capacidadArrastreTn: z.coerce.string().min(1, "Ingresa la capacidad de arrastre"),
  pesoSecoTn: z.coerce.string().optional(),
  tipoCombustible: z.enum(["diesel_b5", "gnv", "glp"]).default("diesel_b5"),
  odometroActualKm: z.coerce.number().int().min(0).default(0),
  idDispositivoGps: z.string().trim().optional(),
  sedeId: z.string().uuid().optional(),
});

export const semirremolqueSchema = z.object({
  placa: z
    .string()
    .trim()
    .toUpperCase()
    .regex(placaMtcRegex, {
      message: "Formato de placa inválido (ej. Z1A-987)",
    }),
  tipoCarroceria: z.enum([
    "plataforma",
    "cama_baja",
    "cisterna",
    "furgon",
    "tolva_granelera",
    "portacontenedor",
  ]),
  marca: z.string().trim().optional(),
  anioFabricacion: z.coerce.number().int().optional(),
  ejes: z.coerce.number().int().min(1).max(5).default(3),
  pesoNetoTn: z.coerce.string().optional(),
  cargaUtilMaxTn: z.coerce.string().min(1, "Ingresa la carga útil máxima en toneladas"),
  volumenM3: z.coerce.string().optional(),
});

export const acoplamientoSchema = z.object({
  unidadId: z.string().uuid("Selecciona un tracto válido"),
  semirremolqueId: z.string().uuid("Selecciona un semirremolque válido"),
  observaciones: z.string().trim().optional(),
});

export const actualizarUnidadSchema = z.object({
  id: z.string().uuid(),
  placa: z
    .string()
    .trim()
    .toUpperCase()
    .regex(placaMtcRegex, {
      message: "Formato de placa inválido (ej. V7A-890)",
    })
    .optional(),
  tipoUnidad: z.enum(["tracto", "rigido", "camioneta"]).optional(),
  marca: z.string().trim().min(2, "La marca es requerida").optional(),
  modelo: z.string().trim().min(2, "El modelo es requerido").optional(),
  anioFabricacion: z.coerce
    .number()
    .int()
    .min(1990, "Año mínimo 1990")
    .max(new Date().getFullYear() + 1, "Año no puede ser futuro")
    .optional(),
  color: z.string().trim().optional().nullable(),
  vinChasis: z.string().trim().optional().nullable(),
  numeroMotor: z.string().trim().optional().nullable(),
  ejes: z.coerce.number().int().min(2).max(6).optional(),
  capacidadArrastreTn: z.coerce.string().min(1, "Ingresa la capacidad de arrastre").optional(),
  pesoSecoTn: z.coerce.string().optional().nullable(),
  tipoCombustible: z.enum(["diesel_b5", "gnv", "glp"]).optional(),
  odometroActualKm: z.coerce.number().int().min(0).optional(),
  idDispositivoGps: z.string().trim().optional().nullable(),
  sedeId: z.string().uuid().optional().nullable(),
  estado: z.enum(["disponible", "en_ruta", "mantenimiento", "inactivo"]).optional(),
  activo: z.boolean().optional(),
});

export const actualizarSemirremolqueSchema = z.object({
  id: z.string().uuid(),
  placa: z
    .string()
    .trim()
    .toUpperCase()
    .regex(placaMtcRegex, {
      message: "Formato de placa inválido (ej. Z1A-987)",
    })
    .optional(),
  tipoCarroceria: z.enum([
    "plataforma",
    "cama_baja",
    "cisterna",
    "furgon",
    "tolva_granelera",
    "portacontenedor",
  ]).optional(),
  marca: z.string().trim().optional().nullable(),
  anioFabricacion: z.coerce.number().int().optional().nullable(),
  ejes: z.coerce.number().int().min(1).max(5).optional(),
  pesoNetoTn: z.coerce.string().optional().nullable(),
  cargaUtilMaxTn: z.coerce.string().min(1, "Ingresa la carga útil").optional(),
  volumenM3: z.coerce.string().optional().nullable(),
  estado: z.enum(["disponible", "acoplado", "mantenimiento", "inactivo"]).optional(),
  activo: z.boolean().optional(),
});

export type UnidadInput = z.infer<typeof unidadSchema>;
export type ActualizarUnidadInput = z.infer<typeof actualizarUnidadSchema>;
export type SemirremolqueInput = z.infer<typeof semirremolqueSchema>;
export type ActualizarSemirremolqueInput = z.infer<typeof actualizarSemirremolqueSchema>;
export type AcoplamientoInput = z.infer<typeof acoplamientoSchema>;


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

export type UnidadInput = z.infer<typeof unidadSchema>;
export type SemirremolqueInput = z.infer<typeof semirremolqueSchema>;
export type AcoplamientoInput = z.infer<typeof acoplamientoSchema>;

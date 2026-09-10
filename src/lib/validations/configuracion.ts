import { z } from "zod";

export const actualizarConfiguracionSchema = z.object({
  razonSocial: z.string().min(3, "La razón social debe tener al menos 3 caracteres"),
  nombreComercial: z.string().optional().or(z.literal("")),
  direccionFiscal: z.string().min(5, "Ingrese la dirección fiscal completa"),
  telefono: z.string().optional().or(z.literal("")),
  email: z.string().email("Correo electrónico inválido").optional().or(z.literal("")),
  cuentaBancoNacionDetracciones: z
    .string()
    .optional()
    .or(z.literal("")),
  limiteVelocidadSutranKmH: z.coerce.number().min(50).max(120).default(90),
  serieGuiaPredeterminada: z.string().default("T001"),
  serieFacturaPredeterminada: z.string().default("F001"),
  configAlertasDias: z.array(z.coerce.number()).default([30, 15, 7, 0]),
});

export type ActualizarConfiguracionInput = z.infer<typeof actualizarConfiguracionSchema>;

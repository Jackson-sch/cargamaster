import { z } from "zod";

export const crearLiquidacionSchema = z.object({
  ordenServicioId: z.string().uuid("Debe seleccionar una orden de servicio válida"),
  conductorId: z.string().uuid("Debe seleccionar un conductor"),
  fleteBase: z.coerce.number().min(0).default(0),
  bonoPuntualidad: z.coerce.number().min(0).default(0),
  viaticosAsignados: z.coerce.number().min(0).default(0),
  gastosPeajesDeclarados: z.coerce.number().min(0).default(0),
  gastosCocheraDeclarados: z.coerce.number().min(0).default(0),
  otrosGastos: z.coerce.number().min(0).default(0),
  saldoAFavorConductor: z.coerce.number().min(0).default(0),
  saldoAFavorEmpresa: z.coerce.number().min(0).default(0),
  observaciones: z.string().optional().or(z.literal("")),
});

export type CrearLiquidacionInput = z.infer<typeof crearLiquidacionSchema>;

export const actualizarLiquidacionSchema = z.object({
  id: z.string().uuid("ID de liquidación inválido"),
  bonoPuntualidad: z.coerce.number().min(0).default(0),
  gastosPeajesDeclarados: z.coerce.number().min(0).default(0),
  gastosCocheraDeclarados: z.coerce.number().min(0).default(0),
  otrosGastos: z.coerce.number().min(0).default(0),
  saldoAFavorConductor: z.coerce.number().min(0).default(0),
  saldoAFavorEmpresa: z.coerce.number().min(0).default(0),
  observaciones: z.string().optional().or(z.literal("")),
});

export const cambiarEstadoLiquidacionSchema = z.object({
  id: z.string().uuid("ID de liquidación inválido"),
  estado: z.enum(["pendiente_rendicion", "aprobado", "pagado"]),
});

export type ActualizarLiquidacionInput = z.infer<typeof actualizarLiquidacionSchema>;
export type CambiarEstadoLiquidacionInput = z.infer<typeof cambiarEstadoLiquidacionSchema>;

import { z } from "zod";

export const crearFacturaSchema = z.object({
  ordenServicioId: z.string().uuid().optional().or(z.literal("")),
  clienteId: z.string().uuid("Debe seleccionar un cliente"),
  tipoComprobante: z.enum(["01", "03"]).default("01"), // 01 Factura, 03 Boleta
  serie: z.string().min(4).max(10).default("F001"),
  fechaEmision: z.string().min(10).default(() => new Date().toISOString().slice(0, 10)),
  fechaVencimiento: z.string().min(10).optional().or(z.literal("")),
  moneda: z.enum(["PEN", "USD"]).default("PEN"),
  descripcionServicio: z.string().min(5, "Descripción de servicio requerida"),
  montoSubtotal: z.string().or(z.number()),
  montoIgv: z.string().or(z.number()),
  montoTotal: z.string().or(z.number()),
  detraccionAplica: z.boolean().default(true),
  detraccionPorcentaje: z.string().or(z.number()).default("4.00"),
  detraccionMonto: z.string().or(z.number()).default("0.00"),
  observaciones: z.string().optional().or(z.literal("")),
});

export type CrearFacturaInput = z.infer<typeof crearFacturaSchema>;

import { z } from "zod";

export const clienteSchema = z.object({
  tipoDocumento: z.enum(["ruc", "dni"]).default("ruc"),
  numeroDocumento: z
    .string()
    .trim()
    .regex(/^\d{8,11}$/, "El documento debe tener 8 dígitos (DNI) u 11 dígitos (RUC)"),
  razonSocial: z.string().trim().min(3, "La razón social o nombre es obligatorio"),
  direccionFiscal: z.string().trim().min(5, "La dirección fiscal es obligatoria"),
  departamento: z.string().trim().optional(),
  provincia: z.string().trim().optional(),
  distrito: z.string().trim().optional(),
  ubigeo: z.string().trim().optional(),
  contactoNombre: z.string().trim().optional(),
  contactoTelefono: z.string().trim().optional(),
  contactoEmail: z.string().trim().email("Email inválido").optional().or(z.literal("")),
  condicionPagoDias: z.enum(["contado", "15_dias", "30_dias", "45_dias", "60_dias"]).default("30_dias"),
});

export type ClienteInput = z.infer<typeof clienteSchema>;

export const actualizarClienteSchema = clienteSchema.extend({
  id: z.string().uuid("ID de cliente inválido"),
});

export type ActualizarClienteInput = z.infer<typeof actualizarClienteSchema>;

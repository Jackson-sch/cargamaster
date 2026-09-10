import { z } from "zod";

export const documentoVehiculoSchema = z.object({
  entidadTipo: z.enum(["unidad", "semirremolque"]),
  entidadId: z.string().uuid("Selecciona una unidad o carreta"),
  tipoDocumento: z.enum([
    "soat",
    "revision_tecnica",
    "tarjeta_circulacion_mtc",
    "permiso_operacion_mtc",
    "poliza_seguro_carga",
    "certificacion_pesos_medidas",
  ]),
  numeroDocumento: z.string().trim().min(3, "Ingresa el número de documento"),
  empresaEmisora: z.string().trim().optional(),
  fechaEmision: z.string().min(1, "Ingresa fecha de emisión"),
  fechaVencimiento: z.string().min(1, "Ingresa fecha de vencimiento"),
  archivoAdjuntoUrl: z.string().optional(),
});

export type DocumentoVehiculoInput = z.infer<typeof documentoVehiculoSchema>;

import { z } from "zod";

export const crearGreTransportistaSchema = z.object({
  ordenServicioId: z.string().uuid("Debe seleccionar una orden de servicio válida"),
  serie: z.string().min(4).max(10).default("V001"),
  fechaEmision: z.string().min(10, "Fecha requerida").default(() => new Date().toISOString().slice(0, 10)),
  fechaInicioTraslado: z.string().min(10, "Fecha de traslado requerida"),
  motivoTraslado: z.string().default("01"), // 01 Venta, 04 Traslado entre establecimientos, 13 Otros
  remitenteRuc: z.string().length(11, "El RUC del dador de carga debe tener 11 dígitos"),
  remitenteRazonSocial: z.string().min(3, "Razón social del remitente requerida"),
  destinatarioTipoDoc: z.enum(["6", "1"]).default("6"),
  destinatarioNumDoc: z.string().min(8).max(15),
  destinatarioRazonSocial: z.string().min(3, "Razón social del destinatario requerida"),
  partidaUbigeo: z.string().length(6, "Ubigeo de partida debe tener 6 dígitos"),
  partidaDireccion: z.string().min(5, "Dirección de partida requerida"),
  llegadaUbigeo: z.string().length(6, "Ubigeo de llegada debe tener 6 dígitos"),
  llegadaDireccion: z.string().min(5, "Dirección de llegada requerida"),
  placaTracto: z.string().min(6).max(8, "Placa de tracto inválida"),
  placaSemirremolque: z.string().max(8).optional().or(z.literal("")),
  conductorDni: z.string().length(8, "El DNI del chofer debe tener 8 dígitos"),
  conductorNombres: z.string().min(2, "Nombres del chofer requeridos"),
  conductorApellidos: z.string().min(2, "Apellidos del chofer requeridos"),
  conductorLicencia: z.string().min(5, "Licencia MTC requerida"),
  descripcionCarga: z.string().min(3, "Descripción de la carga requerida"),
  pesoBrutoTotalKg: z.coerce.number().positive("El peso debe ser mayor a 0"),
  unidadMedida: z.enum(["KGM", "TNE"]).default("KGM"),
});

export type CrearGreTransportistaInput = z.infer<typeof crearGreTransportistaSchema>;

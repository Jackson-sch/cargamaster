import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  numeric,
  integer,
  jsonb,
  date,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ---------------------------------------------------------------------------
// 1. EMPRESAS (Multi-Tenant Root)
// ---------------------------------------------------------------------------
export const empresas = pgTable("empresas", {
  id: uuid("id").primaryKey().defaultRandom(),
  ruc: varchar("ruc", { length: 11 }).notNull().unique(),
  razonSocial: varchar("razon_social", { length: 255 }).notNull(),
  nombreComercial: varchar("nombre_comercial", { length: 255 }),
  direccionFiscal: text("direccion_fiscal").notNull(),
  telefono: varchar("telefono", { length: 20 }),
  email: varchar("email", { length: 150 }),
  logoUrl: text("logo_url"),
  configAlertasDias: jsonb("config_alertas_dias")
    .$type<number[]>()
    .default([30, 15, 7, 0])
    .notNull(),
  activo: boolean("activo").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// 2. SEDES / TERMINALES
// ---------------------------------------------------------------------------
export const sedes = pgTable(
  "sedes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    empresaId: uuid("empresa_id")
      .references(() => empresas.id, { onDelete: "cascade" })
      .notNull(),
    nombre: varchar("nombre", { length: 150 }).notNull(),
    codigoSunat: varchar("codigo_sunat", { length: 10 }), // Código de establecimiento anexo SUNAT (0000, 0001, etc.)
    direccion: text("direccion").notNull(),
    departamento: varchar("departamento", { length: 100 }).notNull(),
    provincia: varchar("provincia", { length: 100 }).notNull(),
    distrito: varchar("distrito", { length: 100 }).notNull(),
    ubigeo: varchar("ubigeo", { length: 6 }).notNull(),
    telefono: varchar("telefono", { length: 20 }),
    esPrincipal: boolean("es_principal").default(false).notNull(),
    activo: boolean("activo").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_sedes_empresa").on(table.empresaId),
    index("idx_sedes_ubigeo").on(table.ubigeo),
  ]
);

// ---------------------------------------------------------------------------
// 3. USUARIOS (Perfiles asociados a Supabase Auth)
// ---------------------------------------------------------------------------
export const usuarios = pgTable(
  "usuarios",
  {
    id: uuid("id").primaryKey(), // Mismo ID de auth.users en Supabase
    empresaId: uuid("empresa_id")
      .references(() => empresas.id, { onDelete: "cascade" })
      .notNull(),
    sedeId: uuid("sede_id").references(() => sedes.id, { onDelete: "set null" }),
    email: varchar("email", { length: 150 }).notNull(),
    nombres: varchar("nombres", { length: 100 }).notNull(),
    apellidos: varchar("apellidos", { length: 100 }).notNull(),
    telefono: varchar("telefono", { length: 20 }),
    rol: varchar("rol", { length: 30 })
      .$type<"superadmin" | "admin" | "despachador" | "conductor" | "mantenimiento" | "cliente">()
      .default("despachador")
      .notNull(),
    avatarUrl: text("avatar_url"),
    activo: boolean("activo").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_usuarios_empresa").on(table.empresaId),
    index("idx_usuarios_rol").on(table.rol),
  ]
);

// ---------------------------------------------------------------------------
// 4. UNIDADES (Tracto-camiones y camiones rígidos)
// ---------------------------------------------------------------------------
export const unidades = pgTable(
  "unidades",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    empresaId: uuid("empresa_id")
      .references(() => empresas.id, { onDelete: "cascade" })
      .notNull(),
    sedeId: uuid("sede_id").references(() => sedes.id, { onDelete: "set null" }),
    placa: varchar("placa", { length: 10 }).notNull(), // Ej: V7A-890 o ABC-123
    tipoUnidad: varchar("tipo_unidad", { length: 30 })
      .$type<"tracto" | "rigido" | "camioneta">()
      .default("tracto")
      .notNull(),
    marca: varchar("marca", { length: 80 }).notNull(), // Volvo, Scania, Freightliner, International
    modelo: varchar("modelo", { length: 80 }).notNull(),
    anioFabricacion: integer("anio_fabricacion").notNull(),
    color: varchar("color", { length: 50 }),
    vinChasis: varchar("vin_chasis", { length: 50 }),
    numeroMotor: varchar("numero_motor", { length: 50 }),
    ejes: integer("ejes").default(3).notNull(), // 2, 3, 4 ejes (Configuración MTC: 6x2, 6x4)
    capacidadArrastreTn: numeric("capacidad_arrastre_tn", { precision: 8, scale: 2 }),
    pesoSecoTn: numeric("peso_seco_tn", { precision: 8, scale: 2 }),
    tipoCombustible: varchar("tipo_combustible", { length: 20 })
      .$type<"diesel_b5" | "gnv" | "glp">()
      .default("diesel_b5")
      .notNull(),
    odometroActualKm: integer("odometro_actual_km").default(0).notNull(),
    odometroActualizadoEn: timestamp("odometro_actualizado_en", { withTimezone: true }),
    idDispositivoGps: varchar("id_dispositivo_gps", { length: 100 }), // IMEI / ID de rastreador
    estado: varchar("estado", { length: 30 })
      .$type<"disponible" | "en_ruta" | "mantenimiento" | "inactivo">()
      .default("disponible")
      .notNull(),
    activo: boolean("activo").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("uq_unidades_empresa_placa").on(table.empresaId, table.placa),
    index("idx_unidades_empresa").on(table.empresaId),
    index("idx_unidades_estado").on(table.estado),
  ]
);

// ---------------------------------------------------------------------------
// 5. SEMIRREMOLQUES (Carretas, tolvas, cisternas, plataformas)
// ---------------------------------------------------------------------------
export const semirremolques = pgTable(
  "semirremolques",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    empresaId: uuid("empresa_id")
      .references(() => empresas.id, { onDelete: "cascade" })
      .notNull(),
    placa: varchar("placa", { length: 10 }).notNull(), // Ej: Z1A-987
    tipoCarroceria: varchar("tipo_carroceria", { length: 40 })
      .$type<"plataforma" | "cama_baja" | "cisterna" | "furgon" | "tolva_granelera" | "portacontenedor">()
      .default("plataforma")
      .notNull(),
    marca: varchar("marca", { length: 80 }),
    anioFabricacion: integer("anio_fabricacion"),
    ejes: integer("ejes").default(3).notNull(), // 2 o 3 ejes
    pesoNetoTn: numeric("peso_neto_tn", { precision: 8, scale: 2 }),
    cargaUtilMaxTn: numeric("carga_util_max_tn", { precision: 8, scale: 2 }).notNull(),
    volumenM3: numeric("volumen_m3", { precision: 8, scale: 2 }),
    estado: varchar("estado", { length: 30 })
      .$type<"disponible" | "acoplado" | "mantenimiento" | "inactivo">()
      .default("disponible")
      .notNull(),
    activo: boolean("activo").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("uq_semirremolques_empresa_placa").on(table.empresaId, table.placa),
    index("idx_semirremolques_empresa").on(table.empresaId),
    index("idx_semirremolques_estado").on(table.estado),
  ]
);

// ---------------------------------------------------------------------------
// 6. ASIGNACIONES TRACTO - SEMIRREMOLQUE (Historial de Acoplamiento)
// ---------------------------------------------------------------------------
export const asignacionesTractoCarreta = pgTable(
  "asignaciones_tracto_carreta",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    empresaId: uuid("empresa_id")
      .references(() => empresas.id, { onDelete: "cascade" })
      .notNull(),
    unidadId: uuid("unidad_id")
      .references(() => unidades.id, { onDelete: "cascade" })
      .notNull(),
    semirremolqueId: uuid("semirremolque_id")
      .references(() => semirremolques.id, { onDelete: "cascade" })
      .notNull(),
    fechaAcople: timestamp("fecha_acople", { withTimezone: true }).defaultNow().notNull(),
    fechaDesacople: timestamp("fecha_desacople", { withTimezone: true }),
    observaciones: text("observaciones"),
    activo: boolean("activo").default(true).notNull(),
  },
  (table) => [
    index("idx_asig_tracto_unidad").on(table.unidadId),
    index("idx_asig_tracto_semirremolque").on(table.semirremolqueId),
  ]
);

// ---------------------------------------------------------------------------
// 7. DOCUMENTOS DE VEHÍCULO (SOAT, Revisión Técnica, MTC, etc.)
// ---------------------------------------------------------------------------
export const documentosVehiculo = pgTable(
  "documentos_vehiculo",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    empresaId: uuid("empresa_id")
      .references(() => empresas.id, { onDelete: "cascade" })
      .notNull(),
    entidadTipo: varchar("entidad_tipo", { length: 20 })
      .$type<"unidad" | "semirremolque">()
      .notNull(),
    entidadId: uuid("entidad_id").notNull(),
    tipoDocumento: varchar("tipo_documento", { length: 40 })
      .$type<
        | "soat"
        | "revision_tecnica"
        | "tarjeta_circulacion_mtc"
        | "permiso_operacion_mtc"
        | "poliza_seguro_carga"
        | "certificacion_pesos_medidas"
      >()
      .notNull(),
    numeroDocumento: varchar("numero_documento", { length: 100 }).notNull(),
    empresaEmisora: varchar("empresa_emisora", { length: 150 }),
    fechaEmision: date("fecha_emision").notNull(),
    fechaVencimiento: date("fecha_vencimiento").notNull(),
    archivoAdjuntoUrl: text("archivo_adjunto_url"),
    estadoAlerta: varchar("estado_alerta", { length: 20 })
      .$type<"vigente" | "por_vencer" | "vencido">()
      .default("vigente")
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_docveh_entidad").on(table.entidadTipo, table.entidadId),
    index("idx_docveh_vencimiento").on(table.fechaVencimiento),
    index("idx_docveh_estado").on(table.estadoAlerta),
  ]
);

// ---------------------------------------------------------------------------
// 8. CONDUCTORES
// ---------------------------------------------------------------------------
export const conductores = pgTable(
  "conductores",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    empresaId: uuid("empresa_id")
      .references(() => empresas.id, { onDelete: "cascade" })
      .notNull(),
    usuarioId: uuid("usuario_id").references(() => usuarios.id, { onDelete: "set null" }),
    tipoDocumento: varchar("tipo_documento", { length: 10 })
      .$type<"dni" | "ce">()
      .default("dni")
      .notNull(),
    numeroDocumento: varchar("numero_documento", { length: 20 }).notNull(),
    nombres: varchar("nombres", { length: 100 }).notNull(),
    apellidos: varchar("apellidos", { length: 100 }).notNull(),
    telefono: varchar("telefono", { length: 20 }).notNull(),
    contactoEmergencia: varchar("contacto_emergencia", { length: 150 }),
    telefonoEmergencia: varchar("telefono_emergencia", { length: 20 }),
    fechaNacimiento: date("fecha_nacimiento"),
    grupoSanguineo: varchar("grupo_sanguineo", { length: 10 }), // O+, A+, etc.
    estado: varchar("estado", { length: 30 })
      .$type<"disponible" | "en_viaje" | "descanso_medico" | "vacaciones" | "inactivo">()
      .default("disponible")
      .notNull(),
    activo: boolean("activo").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("uq_conductores_empresa_doc").on(table.empresaId, table.numeroDocumento),
    index("idx_conductores_empresa").on(table.empresaId),
    index("idx_conductores_estado").on(table.estado),
  ]
);

// ---------------------------------------------------------------------------
// 9. LICENCIAS DE CONDUCIR (MTC)
// ---------------------------------------------------------------------------
export const licenciasConductor = pgTable(
  "licencias_conductor",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conductorId: uuid("conductor_id")
      .references(() => conductores.id, { onDelete: "cascade" })
      .notNull(),
    categoria: varchar("categoria", { length: 20 })
      .$type<"A-IIb" | "A-IIIa" | "A-IIIb" | "A-IIIc">()
      .notNull(), // Carga pesada requiere mín. A-IIIb o A-IIIc
    numeroLicencia: varchar("numero_licencia", { length: 30 }).notNull(),
    fechaExpedicion: date("fecha_expedicion").notNull(),
    fechaRevalidacion: date("fecha_revalidacion").notNull(),
    puntosAcumuladosMtc: integer("puntos_acumulados_mtc").default(0).notNull(), // Máx 100 antes de sanción
    estado: varchar("estado", { length: 20 })
      .$type<"vigente" | "por_vencer" | "vencida" | "suspendida">()
      .default("vigente")
      .notNull(),
    archivoUrl: text("archivo_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_licencias_conductor").on(table.conductorId),
    index("idx_licencias_revalidacion").on(table.fechaRevalidacion),
  ]
);

// ---------------------------------------------------------------------------
// 10. CERTIFICACIONES Y CAPACITACIONES MTC / SEGURIDAD
// ---------------------------------------------------------------------------
export const certificacionesConductor = pgTable(
  "certificaciones_conductor",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conductorId: uuid("conductor_id")
      .references(() => conductores.id, { onDelete: "cascade" })
      .notNull(),
    tipo: varchar("tipo", { length: 50 })
      .$type<
        | "curso_seguridad_vial_mtc"
        | "mercancias_peligrosas_matpel"
        | "examen_medico_anual"
        | "psicosensometrico"
        | "induccion_mina"
      >()
      .notNull(),
    entidadCapacitadora: varchar("entidad_capacitadora", { length: 150 }).notNull(),
    numeroCertificado: varchar("numero_certificado", { length: 80 }),
    fechaEmision: date("fecha_emision").notNull(),
    fechaVencimiento: date("fecha_vencimiento").notNull(),
    archivoUrl: text("archivo_url"),
    estado: varchar("estado", { length: 20 })
      .$type<"vigente" | "por_vencer" | "vencido">()
      .default("vigente")
      .notNull(),
  },
  (table) => [
    index("idx_cert_conductor").on(table.conductorId),
    index("idx_cert_vencimiento").on(table.fechaVencimiento),
  ]
);

// ---------------------------------------------------------------------------
// 11. CLIENTES (Empresas dadoras de carga / contratantes de flete)
// ---------------------------------------------------------------------------
export const clientes = pgTable(
  "clientes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    empresaId: uuid("empresa_id")
      .references(() => empresas.id, { onDelete: "cascade" })
      .notNull(),
    tipoDocumento: varchar("tipo_documento", { length: 10 })
      .$type<"ruc" | "dni">()
      .default("ruc")
      .notNull(),
    numeroDocumento: varchar("numero_documento", { length: 20 }).notNull(),
    razonSocial: varchar("razon_social", { length: 255 }).notNull(),
    direccionFiscal: text("direccion_fiscal").notNull(),
    departamento: varchar("departamento", { length: 100 }),
    provincia: varchar("provincia", { length: 100 }),
    distrito: varchar("distrito", { length: 100 }),
    ubigeo: varchar("ubigeo", { length: 6 }),
    contactoNombre: varchar("contacto_nombre", { length: 150 }),
    contactoTelefono: varchar("contacto_telefono", { length: 30 }),
    contactoEmail: varchar("contacto_email", { length: 150 }),
    condicionPagoDias: varchar("condicion_pago_dias", { length: 30 })
      .$type<"contado" | "15_dias" | "30_dias" | "45_dias" | "60_dias">()
      .default("30_dias")
      .notNull(),
    activo: boolean("activo").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("uq_clientes_empresa_doc").on(table.empresaId, table.numeroDocumento),
    index("idx_clientes_empresa").on(table.empresaId),
  ]
);

// ---------------------------------------------------------------------------
// 12. RUTAS FRECUENTES
// ---------------------------------------------------------------------------
export const rutas = pgTable(
  "rutas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    empresaId: uuid("empresa_id")
      .references(() => empresas.id, { onDelete: "cascade" })
      .notNull(),
    codigoRuta: varchar("codigo_ruta", { length: 30 }).notNull(), // Ej: LIM-AQP-01
    nombre: varchar("nombre", { length: 200 }).notNull(), // "Lima - Arequipa por Panamericana Sur"
    origenDepartamento: varchar("origen_departamento", { length: 100 }).notNull(),
    origenProvincia: varchar("origen_provincia", { length: 100 }).notNull(),
    origenDistrito: varchar("origen_distrito", { length: 100 }).notNull(),
    origenUbigeo: varchar("origen_ubigeo", { length: 6 }).notNull(),
    origenDireccion: text("origen_direccion").notNull(),
    destinoDepartamento: varchar("destino_departamento", { length: 100 }).notNull(),
    destinoProvincia: varchar("destino_provincia", { length: 100 }).notNull(),
    destinoDistrito: varchar("destino_distrito", { length: 100 }).notNull(),
    destinoUbigeo: varchar("destino_ubigeo", { length: 6 }).notNull(),
    destinoDireccion: text("destino_direccion").notNull(),
    distanciaEstimadaKm: numeric("distancia_estimada_km", { precision: 8, scale: 2 }).notNull(),
    tiempoEstimadoHoras: numeric("tiempo_estimado_horas", { precision: 5, scale: 2 }).notNull(),
    peajesEstimadosMonto: numeric("peajes_estimados_monto", { precision: 8, scale: 2 }).default("0").notNull(),
    galonesEstimados: numeric("galones_estimados", { precision: 8, scale: 2 }),
    activo: boolean("activo").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_rutas_empresa").on(table.empresaId),
    index("idx_rutas_origen_destino").on(table.origenUbigeo, table.destinoUbigeo),
  ]
);

// ---------------------------------------------------------------------------
// 13. ÓRDENES DE SERVICIO / VIAJES
// ---------------------------------------------------------------------------
export const ordenesServicio = pgTable(
  "ordenes_servicio",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    empresaId: uuid("empresa_id")
      .references(() => empresas.id, { onDelete: "cascade" })
      .notNull(),
    codigoViaje: varchar("codigo_viaje", { length: 50 }).notNull(), // OS-2026-00001
    clienteId: uuid("cliente_id")
      .references(() => clientes.id, { onDelete: "restrict" })
      .notNull(),
    rutaId: uuid("ruta_id")
      .references(() => rutas.id, { onDelete: "restrict" })
      .notNull(),
    unidadId: uuid("unidad_id")
      .references(() => unidades.id, { onDelete: "restrict" })
      .notNull(),
    semirremolqueId: uuid("semirremolque_id").references(() => semirremolques.id, {
      onDelete: "set null",
    }),
    conductorId: uuid("conductor_id")
      .references(() => conductores.id, { onDelete: "restrict" })
      .notNull(),
    conductorSecundarioId: uuid("conductor_secundario_id").references(() => conductores.id, {
      onDelete: "set null",
    }), // Obligatorio MTC para viajes nocturnos > 4h o continuos > 5h
    tipoCarga: varchar("tipo_carga", { length: 40 })
      .$type<"general" | "perecible" | "matpel" | "granel" | "maquinaria" | "refrigerada">()
      .default("general")
      .notNull(),
    descripcionCarga: text("descripcion_carga").notNull(),
    pesoBrutoKg: numeric("peso_bruto_kg", { precision: 10, scale: 2 }).notNull(),
    unidadMedida: varchar("unidad_medida", { length: 10 }).default("KGM").notNull(), // KGM o TNE (Catálogo SUNAT 03)
    fechaHoraProgramada: timestamp("fecha_hora_programada", { withTimezone: true }).notNull(),
    fechaHoraInicio: timestamp("fecha_hora_inicio", { withTimezone: true }),
    fechaHoraFin: timestamp("fecha_hora_fin", { withTimezone: true }),
    odometroInicio: integer("odometro_inicio"),
    odometroFin: integer("odometro_fin"),
    estado: varchar("estado", { length: 30 })
      .$type<
        | "borrador"
        | "programado"
        | "cargando"
        | "en_ruta"
        | "en_destino"
        | "descargado"
        | "entregado"
        | "liquidado"
        | "facturado"
        | "cancelado"
      >()
      .default("programado")
      .notNull(),
    fletePactadoMoneda: varchar("flete_pactado_moneda", { length: 5 }).default("PEN").notNull(),
    fletePactadoMonto: numeric("flete_pactado_monto", { precision: 10, scale: 2 }).notNull(),
    detraccionPorcentaje: numeric("detraccion_porcentaje", { precision: 4, scale: 2 })
      .default("4.00")
      .notNull(), // 4% Transporte de Carga en Perú SUNAT
    detraccionMonto: numeric("detraccion_monto", { precision: 10, scale: 2 }).default("0").notNull(),
    adelantoViaticos: numeric("adelanto_viaticos", { precision: 10, scale: 2 }).default("0").notNull(),
    observaciones: text("observaciones"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("uq_ordenes_servicio_codigo").on(table.empresaId, table.codigoViaje),
    index("idx_ordenes_empresa").on(table.empresaId),
    index("idx_ordenes_estado").on(table.estado),
    index("idx_ordenes_unidad").on(table.unidadId),
    index("idx_ordenes_conductor").on(table.conductorId),
  ]
);

// ---------------------------------------------------------------------------
// 14. HISTORIAL DE ESTADOS DE VIAJE (Trazabilidad y Auditoría)
// ---------------------------------------------------------------------------
export const historialEstadosViaje = pgTable(
  "historial_estados_viaje",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ordenServicioId: uuid("orden_servicio_id")
      .references(() => ordenesServicio.id, { onDelete: "cascade" })
      .notNull(),
    estadoAnterior: varchar("estado_anterior", { length: 30 }),
    estadoNuevo: varchar("estado_nuevo", { length: 30 }).notNull(),
    responsableUsuarioId: uuid("responsable_usuario_id").references(() => usuarios.id, {
      onDelete: "set null",
    }),
    latitud: numeric("latitud", { precision: 10, scale: 7 }),
    longitud: numeric("longitud", { precision: 10, scale: 7 }),
    observacion: text("observacion"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("idx_historial_orden").on(table.ordenServicioId)]
);

// ---------------------------------------------------------------------------
// 15. EVIDENCIAS POD (Proof of Delivery - Fotos y Conformidad)
// ---------------------------------------------------------------------------
export const evidenciasPod = pgTable(
  "evidencias_pod",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ordenServicioId: uuid("orden_servicio_id")
      .references(() => ordenesServicio.id, { onDelete: "cascade" })
      .notNull(),
    tipoEvidencia: varchar("tipo_evidencia", { length: 30 })
      .$type<"foto_carga" | "foto_descarga" | "guia_firmada_remitente" | "firma_digital_cliente" | "incidencia">()
      .notNull(),
    archivoUrl: text("archivo_url").notNull(),
    receptorNombre: varchar("receptor_nombre", { length: 150 }),
    receptorDni: varchar("receptor_dni", { length: 20 }),
    observaciones: text("observaciones"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("idx_evidencias_orden").on(table.ordenServicioId)]
);

// ---------------------------------------------------------------------------
// 16. GUÍAS DE REMISIÓN ELECTRÓNICA (GRE SUNAT)
// ---------------------------------------------------------------------------
export const guiasRemision = pgTable(
  "guias_remision",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    empresaId: uuid("empresa_id")
      .references(() => empresas.id, { onDelete: "cascade" })
      .notNull(),
    ordenServicioId: uuid("orden_servicio_id")
      .references(() => ordenesServicio.id, { onDelete: "cascade" })
      .notNull(),
    tipoGuia: varchar("tipo_guia", { length: 30 })
      .$type<"GRE_TRANSPORTISTA_31" | "GRE_REMITENTE_09">()
      .default("GRE_TRANSPORTISTA_31")
      .notNull(),
    serie: varchar("serie", { length: 10 }).notNull(), // Ej: V001 o T001
    numeroCorrelativo: integer("numero_correlativo").notNull(),
    fechaEmision: date("fecha_emision").notNull(),
    fechaInicioTraslado: date("fecha_inicio_traslado").notNull(),
    sunatTicketId: varchar("sunat_ticket_id", { length: 100 }),
    estadoSunat: varchar("estado_sunat", { length: 30 })
      .$type<"emitido" | "en_proceso" | "aceptado" | "rechazado" | "observado" | "anulado">()
      .default("emitido")
      .notNull(),
    sunatCodigoRespuesta: varchar("sunat_codigo_respuesta", { length: 20 }),
    sunatDescripcionRespuesta: text("sunat_descripcion_respuesta"),
    hashCpe: varchar("hash_cpe", { length: 100 }),
    qrCode: text("qr_code"),
    xmlFirmadoUrl: text("xml_firmado_url"),
    cdrXmlUrl: text("cdr_xml_url"),
    pdfUrl: text("pdf_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("uq_guias_remision_serie_num").on(
      table.empresaId,
      table.tipoGuia,
      table.serie,
      table.numeroCorrelativo
    ),
    index("idx_guias_orden").on(table.ordenServicioId),
    index("idx_guias_sunat_estado").on(table.estadoSunat),
  ]
);

// ---------------------------------------------------------------------------
// 16B. COMPROBANTES DE PAGO ELECTRÓNICOS (Facturas 01, Boletas 03 SUNAT UBL 2.1)
// ---------------------------------------------------------------------------
export const comprobantesPago = pgTable(
  "comprobantes_pago",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    empresaId: uuid("empresa_id")
      .references(() => empresas.id, { onDelete: "cascade" })
      .notNull(),
    ordenServicioId: uuid("orden_servicio_id").references(() => ordenesServicio.id, {
      onDelete: "set null",
    }),
    clienteId: uuid("cliente_id")
      .references(() => clientes.id, { onDelete: "restrict" })
      .notNull(),
    tipoComprobante: varchar("tipo_comprobante", { length: 10 })
      .$type<"01" | "03" | "07" | "08">() // 01: Factura, 03: Boleta, 07: Nota Crédito, 08: Nota Débito
      .default("01")
      .notNull(),
    serie: varchar("serie", { length: 10 }).notNull(), // F001, B001
    numeroCorrelativo: integer("numero_correlativo").notNull(),
    fechaEmision: date("fecha_emision").notNull(),
    fechaVencimiento: date("fecha_vencimiento"),
    moneda: varchar("moneda", { length: 5 }).default("PEN").notNull(),
    montoSubtotal: numeric("monto_subtotal", { precision: 10, scale: 2 }).notNull(), // Base imponible
    montoIgv: numeric("monto_igv", { precision: 10, scale: 2 }).notNull(), // 18%
    montoTotal: numeric("monto_total", { precision: 10, scale: 2 }).notNull(),
    detraccionAplica: boolean("detraccion_aplica").default(true).notNull(),
    detraccionPorcentaje: numeric("detraccion_porcentaje", { precision: 4, scale: 2 })
      .default("4.00")
      .notNull(), // 4% Transporte Carga
    detraccionMonto: numeric("detraccion_monto", { precision: 10, scale: 2 })
      .default("0")
      .notNull(),
    cuentaBancoNacion: varchar("cuenta_banco_nacion", { length: 50 }),
    estadoPago: varchar("estado_pago", { length: 20 })
      .$type<"pendiente" | "pagado" | "anulado">()
      .default("pendiente")
      .notNull(),
    estadoSunat: varchar("estado_sunat", { length: 20 })
      .$type<"emitido" | "en_proceso" | "aceptado" | "rechazado" | "anulado">()
      .default("aceptado")
      .notNull(),
    sunatTicketId: varchar("sunat_ticket_id", { length: 100 }),
    sunatCodigoRespuesta: varchar("sunat_codigo_respuesta", { length: 20 }),
    sunatDescripcionRespuesta: text("sunat_descripcion_respuesta"),
    hashCpe: varchar("hash_cpe", { length: 100 }),
    qrCode: text("qr_code"),
    xmlFirmadoUrl: text("xml_firmado_url"),
    cdrXmlUrl: text("cdr_xml_url"),
    pdfUrl: text("pdf_url"),
    observaciones: text("observaciones"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("uq_comprobantes_serie_num").on(
      table.empresaId,
      table.tipoComprobante,
      table.serie,
      table.numeroCorrelativo
    ),
    index("idx_comprobantes_cliente").on(table.clienteId),
    index("idx_comprobantes_orden").on(table.ordenServicioId),
    index("idx_comprobantes_sunat").on(table.estadoSunat),
  ]
);

// ---------------------------------------------------------------------------
// 17. POSICIONES DE TELEMETRÍA (GPS Tracking Agnóstico)
// ---------------------------------------------------------------------------
export const posicionesTelemetria = pgTable(
  "posiciones_telemetria",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    empresaId: uuid("empresa_id")
      .references(() => empresas.id, { onDelete: "cascade" })
      .notNull(),
    unidadId: uuid("unidad_id")
      .references(() => unidades.id, { onDelete: "cascade" })
      .notNull(),
    ordenServicioId: uuid("orden_servicio_id").references(() => ordenesServicio.id, {
      onDelete: "set null",
    }),
    latitud: numeric("latitud", { precision: 10, scale: 7 }).notNull(),
    longitud: numeric("longitud", { precision: 10, scale: 7 }).notNull(),
    velocidadKmh: numeric("velocidad_kmh", { precision: 6, scale: 2 }).default("0").notNull(),
    rumboGrados: integer("rumbo_grados").default(0),
    ignicion: boolean("ignicion").default(true).notNull(),
    odometroKm: integer("odometro_km"),
    nivelCombustiblePct: numeric("nivel_combustible_pct", { precision: 5, scale: 2 }),
    proveedorGps: varchar("proveedor_gps", { length: 50 }).default("generico_api").notNull(),
    timestampDispositivo: timestamp("timestamp_dispositivo", { withTimezone: true }).notNull(),
    recibidoEn: timestamp("recibido_en", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_telemetria_unidad_tiempo").on(table.unidadId, table.timestampDispositivo),
    index("idx_telemetria_orden").on(table.ordenServicioId),
  ]
);

// ---------------------------------------------------------------------------
// 18. ALERTAS DEL SISTEMA (Vencimientos, SUTRAN, Mantenimientos)
// ---------------------------------------------------------------------------
export const alertasSistema = pgTable(
  "alertas_sistema",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    empresaId: uuid("empresa_id")
      .references(() => empresas.id, { onDelete: "cascade" })
      .notNull(),
    categoria: varchar("categoria", { length: 40 })
      .$type<
        | "vencimiento_documento"
        | "exceso_velocidad_sutran"
        | "parada_no_autorizada"
        | "desvio_geocerca"
        | "mantenimiento_preventivo"
      >()
      .notNull(),
    severidad: varchar("severidad", { length: 20 })
      .$type<"info" | "warning" | "critical">()
      .default("warning")
      .notNull(),
    titulo: varchar("titulo", { length: 200 }).notNull(),
    mensaje: text("mensaje").notNull(),
    referenciaTipo: varchar("referencia_tipo", { length: 30 })
      .$type<"unidad" | "conductor" | "orden_servicio">()
      .notNull(),
    referenciaId: uuid("referencia_id").notNull(),
    resuelta: boolean("resuelta").default(false).notNull(),
    resueltaPor: uuid("resuelta_por").references(() => usuarios.id, { onDelete: "set null" }),
    resueltaEn: timestamp("resuelta_en", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_alertas_empresa").on(table.empresaId),
    index("idx_alertas_resuelta").on(table.resuelta),
    index("idx_alertas_categoria").on(table.categoria),
  ]
);

// ---------------------------------------------------------------------------
// 19. MANTENIMIENTOS (Preventivo y Correctivo)
// ---------------------------------------------------------------------------
export const mantenimientos = pgTable(
  "mantenimientos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    empresaId: uuid("empresa_id")
      .references(() => empresas.id, { onDelete: "cascade" })
      .notNull(),
    entidadTipo: varchar("entidad_tipo", { length: 20 })
      .$type<"unidad" | "semirremolque">()
      .notNull(),
    entidadId: uuid("entidad_id").notNull(),
    tipo: varchar("tipo", { length: 20 })
      .$type<"preventivo" | "correctivo">()
      .default("preventivo")
      .notNull(),
    descripcion: text("descripcion").notNull(),
    odometroRegistro: integer("odometro_registro"),
    fechaProgramada: date("fecha_programada").notNull(),
    fechaEjecucion: date("fecha_ejecucion"),
    taller: varchar("taller", { length: 20 })
      .$type<"propio" | "tercero">()
      .default("propio")
      .notNull(),
    nombreTaller: varchar("nombre_taller", { length: 150 }),
    costoManoObra: numeric("costo_mano_obra", { precision: 10, scale: 2 }).default("0").notNull(),
    costoRepuestos: numeric("costo_repuestos", { precision: 10, scale: 2 }).default("0").notNull(),
    costoTotal: numeric("costo_total", { precision: 10, scale: 2 }).default("0").notNull(),
    estado: varchar("estado", { length: 20 })
      .$type<"pendiente" | "en_proceso" | "completado" | "cancelado">()
      .default("pendiente")
      .notNull(),
    observaciones: text("observaciones"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_mant_entidad").on(table.entidadTipo, table.entidadId),
    index("idx_mant_estado").on(table.estado),
  ]
);

// ---------------------------------------------------------------------------
// 20. CONSUMO DE COMBUSTIBLE
// ---------------------------------------------------------------------------
export const consumoCombustible = pgTable(
  "consumo_combustible",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    empresaId: uuid("empresa_id")
      .references(() => empresas.id, { onDelete: "cascade" })
      .notNull(),
    ordenServicioId: uuid("orden_servicio_id").references(() => ordenesServicio.id, {
      onDelete: "set null",
    }),
    unidadId: uuid("unidad_id")
      .references(() => unidades.id, { onDelete: "cascade" })
      .notNull(),
    conductorId: uuid("conductor_id")
      .references(() => conductores.id, { onDelete: "restrict" })
      .notNull(),
    grifoNombre: varchar("grifo_nombre", { length: 150 }).notNull(),
    grifoRuc: varchar("grifo_ruc", { length: 11 }),
    numeroValeComprobante: varchar("numero_vale_comprobante", { length: 50 }).notNull(),
    galonesCargados: numeric("galones_cargados", { precision: 8, scale: 2 }).notNull(),
    precioPorGalon: numeric("precio_por_galon", { precision: 8, scale: 2 }).notNull(),
    totalMonto: numeric("total_monto", { precision: 10, scale: 2 }).notNull(),
    odometroAlCargar: integer("odometro_al_cargar").notNull(),
    rendimientoKmGalonCalculado: numeric("rendimiento_km_galon_calculado", { precision: 6, scale: 2 }),
    fotoTicketUrl: text("foto_ticket_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_combustible_orden").on(table.ordenServicioId),
    index("idx_combustible_unidad").on(table.unidadId),
  ]
);

// ---------------------------------------------------------------------------
// 21. LIQUIDACIONES DE CONDUCTOR POR VIAJE
// ---------------------------------------------------------------------------
export const liquidacionesConductor = pgTable(
  "liquidaciones_conductor",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    empresaId: uuid("empresa_id")
      .references(() => empresas.id, { onDelete: "cascade" })
      .notNull(),
    ordenServicioId: uuid("orden_servicio_id")
      .references(() => ordenesServicio.id, { onDelete: "cascade" })
      .notNull(),
    conductorId: uuid("conductor_id")
      .references(() => conductores.id, { onDelete: "restrict" })
      .notNull(),
    fleteBase: numeric("flete_base", { precision: 10, scale: 2 }).default("0").notNull(),
    bonoPuntualidad: numeric("bono_puntualidad", { precision: 10, scale: 2 }).default("0").notNull(),
    viaticosAsignados: numeric("viaticos_asignados", { precision: 10, scale: 2 }).default("0").notNull(),
    gastosPeajesDeclarados: numeric("gastos_peajes_declarados", { precision: 10, scale: 2 })
      .default("0")
      .notNull(),
    gastosCocheraDeclarados: numeric("gastos_cochera_declarados", { precision: 10, scale: 2 })
      .default("0")
      .notNull(),
    otrosGastos: numeric("otros_gastos", { precision: 10, scale: 2 }).default("0").notNull(),
    saldoAFavorConductor: numeric("saldo_a_favor_conductor", { precision: 10, scale: 2 })
      .default("0")
      .notNull(),
    saldoAFavorEmpresa: numeric("saldo_a_favor_empresa", { precision: 10, scale: 2 })
      .default("0")
      .notNull(),
    estado: varchar("estado", { length: 30 })
      .$type<"pendiente_rendicion" | "aprobado" | "pagado">()
      .default("pendiente_rendicion")
      .notNull(),
    observaciones: text("observaciones"),
    aprobadoPor: uuid("aprobado_por").references(() => usuarios.id, { onDelete: "set null" }),
    aprobadoEn: timestamp("aprobado_en", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("uq_liquidaciones_orden").on(table.ordenServicioId),
    index("idx_liquidaciones_conductor").on(table.conductorId),
  ]
);

// ---------------------------------------------------------------------------
// RELACIONES DRIZZLE
// ---------------------------------------------------------------------------
export const empresasRelations = relations(empresas, ({ many }) => ({
  sedes: many(sedes),
  usuarios: many(usuarios),
  unidades: many(unidades),
  semirremolques: many(semirremolques),
  conductores: many(conductores),
  clientes: many(clientes),
  rutas: many(rutas),
  ordenesServicio: many(ordenesServicio),
  alertas: many(alertasSistema),
  guias: many(guiasRemision),
  comprobantes: many(comprobantesPago),
}));

export const clientesRelations = relations(clientes, ({ one, many }) => ({
  empresa: one(empresas, { fields: [clientes.empresaId], references: [empresas.id] }),
  ordenesServicio: many(ordenesServicio),
  comprobantes: many(comprobantesPago),
}));

export const sedesRelations = relations(sedes, ({ one, many }) => ({
  empresa: one(empresas, { fields: [sedes.empresaId], references: [empresas.id] }),
  usuarios: many(usuarios),
  unidades: many(unidades),
}));

export const unidadesRelations = relations(unidades, ({ one, many }) => ({
  empresa: one(empresas, { fields: [unidades.empresaId], references: [empresas.id] }),
  sede: one(sedes, { fields: [unidades.sedeId], references: [sedes.id] }),
  ordenesServicio: many(ordenesServicio),
  acoplamientos: many(asignacionesTractoCarreta),
  posiciones: many(posicionesTelemetria),
  mantenimientos: many(mantenimientos),
  consumos: many(consumoCombustible),
}));

export const semirremolquesRelations = relations(semirremolques, ({ one, many }) => ({
  empresa: one(empresas, { fields: [semirremolques.empresaId], references: [empresas.id] }),
  acoplamientos: many(asignacionesTractoCarreta),
  ordenesServicio: many(ordenesServicio),
}));

export const conductoresRelations = relations(conductores, ({ one, many }) => ({
  empresa: one(empresas, { fields: [conductores.empresaId], references: [empresas.id] }),
  usuario: one(usuarios, { fields: [conductores.usuarioId], references: [usuarios.id] }),
  licencias: many(licenciasConductor),
  certificaciones: many(certificacionesConductor),
  ordenesServicio: many(ordenesServicio),
  liquidaciones: many(liquidacionesConductor),
}));

export const ordenesServicioRelations = relations(ordenesServicio, ({ one, many }) => ({
  empresa: one(empresas, { fields: [ordenesServicio.empresaId], references: [empresas.id] }),
  cliente: one(clientes, { fields: [ordenesServicio.clienteId], references: [clientes.id] }),
  ruta: one(rutas, { fields: [ordenesServicio.rutaId], references: [rutas.id] }),
  unidad: one(unidades, { fields: [ordenesServicio.unidadId], references: [unidades.id] }),
  semirremolque: one(semirremolques, {
    fields: [ordenesServicio.semirremolqueId],
    references: [semirremolques.id],
  }),
  conductor: one(conductores, {
    fields: [ordenesServicio.conductorId],
    references: [conductores.id],
  }),
  historial: many(historialEstadosViaje),
  evidencias: many(evidenciasPod),
  guias: many(guiasRemision),
  comprobantes: many(comprobantesPago),
  telemetria: many(posicionesTelemetria),
  combustible: many(consumoCombustible),
  liquidacion: one(liquidacionesConductor),
}));

export const licenciasConductorRelations = relations(licenciasConductor, ({ one }) => ({
  conductor: one(conductores, {
    fields: [licenciasConductor.conductorId],
    references: [conductores.id],
  }),
}));

export const certificacionesConductorRelations = relations(certificacionesConductor, ({ one }) => ({
  conductor: one(conductores, {
    fields: [certificacionesConductor.conductorId],
    references: [conductores.id],
  }),
}));

export const asignacionesTractoCarretaRelations = relations(asignacionesTractoCarreta, ({ one }) => ({
  unidad: one(unidades, {
    fields: [asignacionesTractoCarreta.unidadId],
    references: [unidades.id],
  }),
  semirremolque: one(semirremolques, {
    fields: [asignacionesTractoCarreta.semirremolqueId],
    references: [semirremolques.id],
  }),
}));

export const liquidacionesConductorRelations = relations(liquidacionesConductor, ({ one }) => ({
  conductor: one(conductores, {
    fields: [liquidacionesConductor.conductorId],
    references: [conductores.id],
  }),
  ordenServicio: one(ordenesServicio, {
    fields: [liquidacionesConductor.ordenServicioId],
    references: [ordenesServicio.id],
  }),
}));

export const historialEstadosViajeRelations = relations(historialEstadosViaje, ({ one }) => ({
  ordenServicio: one(ordenesServicio, {
    fields: [historialEstadosViaje.ordenServicioId],
    references: [ordenesServicio.id],
  }),
}));

export const evidenciasPodRelations = relations(evidenciasPod, ({ one }) => ({
  ordenServicio: one(ordenesServicio, {
    fields: [evidenciasPod.ordenServicioId],
    references: [ordenesServicio.id],
  }),
}));

export const guiasRemisionRelations = relations(guiasRemision, ({ one }) => ({
  empresa: one(empresas, {
    fields: [guiasRemision.empresaId],
    references: [empresas.id],
  }),
  ordenServicio: one(ordenesServicio, {
    fields: [guiasRemision.ordenServicioId],
    references: [ordenesServicio.id],
  }),
}));

export const comprobantesPagoRelations = relations(comprobantesPago, ({ one }) => ({
  empresa: one(empresas, {
    fields: [comprobantesPago.empresaId],
    references: [empresas.id],
  }),
  ordenServicio: one(ordenesServicio, {
    fields: [comprobantesPago.ordenServicioId],
    references: [ordenesServicio.id],
  }),
  cliente: one(clientes, {
    fields: [comprobantesPago.clienteId],
    references: [clientes.id],
  }),
}));

export const posicionesTelemetriaRelations = relations(posicionesTelemetria, ({ one }) => ({
  unidad: one(unidades, {
    fields: [posicionesTelemetria.unidadId],
    references: [unidades.id],
  }),
  ordenServicio: one(ordenesServicio, {
    fields: [posicionesTelemetria.ordenServicioId],
    references: [ordenesServicio.id],
  }),
}));

export const consumoCombustibleRelations = relations(consumoCombustible, ({ one }) => ({
  unidad: one(unidades, {
    fields: [consumoCombustible.unidadId],
    references: [unidades.id],
  }),
  conductor: one(conductores, {
    fields: [consumoCombustible.conductorId],
    references: [conductores.id],
  }),
  ordenServicio: one(ordenesServicio, {
    fields: [consumoCombustible.ordenServicioId],
    references: [ordenesServicio.id],
  }),
}));

// Types Inferences
export type Empresa = typeof empresas.$inferSelect;
export type NuevaEmpresa = typeof empresas.$inferInsert;
export type Sede = typeof sedes.$inferSelect;
export type Usuario = typeof usuarios.$inferSelect;
export type Unidad = typeof unidades.$inferSelect;
export type NuevaUnidad = typeof unidades.$inferInsert;
export type Semirremolque = typeof semirremolques.$inferSelect;
export type NuevoSemirremolque = typeof semirremolques.$inferInsert;
export type DocumentoVehiculo = typeof documentosVehiculo.$inferSelect;
export type Conductor = typeof conductores.$inferSelect;
export type NuevoConductor = typeof conductores.$inferInsert;
export type LicenciaConductor = typeof licenciasConductor.$inferSelect;
export type CertificacionConductor = typeof certificacionesConductor.$inferSelect;
export type Cliente = typeof clientes.$inferSelect;
export type NuevoCliente = typeof clientes.$inferInsert;
export type Ruta = typeof rutas.$inferSelect;
export type OrdenServicio = typeof ordenesServicio.$inferSelect;
export type NuevaOrdenServicio = typeof ordenesServicio.$inferInsert;
export type HistorialEstadoViaje = typeof historialEstadosViaje.$inferSelect;
export type EvidenciaPod = typeof evidenciasPod.$inferSelect;
export type GuiaRemision = typeof guiasRemision.$inferSelect;
export type NuevaGuiaRemision = typeof guiasRemision.$inferInsert;
export type ComprobantePago = typeof comprobantesPago.$inferSelect;
export type NuevoComprobantePago = typeof comprobantesPago.$inferInsert;
export type PosicionTelemetria = typeof posicionesTelemetria.$inferSelect;
export type AlertaSistema = typeof alertasSistema.$inferSelect;
export type Mantenimiento = typeof mantenimientos.$inferSelect;
export type ConsumoCombustible = typeof consumoCombustible.$inferSelect;
export type LiquidacionConductor = typeof liquidacionesConductor.$inferSelect;


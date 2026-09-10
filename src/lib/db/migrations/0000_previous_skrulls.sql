CREATE TABLE "alertas_sistema" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"categoria" varchar(40) NOT NULL,
	"severidad" varchar(20) DEFAULT 'warning' NOT NULL,
	"titulo" varchar(200) NOT NULL,
	"mensaje" text NOT NULL,
	"referencia_tipo" varchar(30) NOT NULL,
	"referencia_id" uuid NOT NULL,
	"resuelta" boolean DEFAULT false NOT NULL,
	"resuelta_por" uuid,
	"resuelta_en" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "asignaciones_tracto_carreta" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"unidad_id" uuid NOT NULL,
	"semirremolque_id" uuid NOT NULL,
	"fecha_acople" timestamp with time zone DEFAULT now() NOT NULL,
	"fecha_desacople" timestamp with time zone,
	"observaciones" text,
	"activo" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "certificaciones_conductor" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conductor_id" uuid NOT NULL,
	"tipo" varchar(50) NOT NULL,
	"entidad_capacitadora" varchar(150) NOT NULL,
	"numero_certificado" varchar(80),
	"fecha_emision" date NOT NULL,
	"fecha_vencimiento" date NOT NULL,
	"archivo_url" text,
	"estado" varchar(20) DEFAULT 'vigente' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clientes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"tipo_documento" varchar(10) DEFAULT 'ruc' NOT NULL,
	"numero_documento" varchar(20) NOT NULL,
	"razon_social" varchar(255) NOT NULL,
	"direccion_fiscal" text NOT NULL,
	"departamento" varchar(100),
	"provincia" varchar(100),
	"distrito" varchar(100),
	"ubigeo" varchar(6),
	"contacto_nombre" varchar(150),
	"contacto_telefono" varchar(30),
	"contacto_email" varchar(150),
	"condicion_pago_dias" varchar(30) DEFAULT '30_dias' NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conductores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"usuario_id" uuid,
	"tipo_documento" varchar(10) DEFAULT 'dni' NOT NULL,
	"numero_documento" varchar(20) NOT NULL,
	"nombres" varchar(100) NOT NULL,
	"apellidos" varchar(100) NOT NULL,
	"telefono" varchar(20) NOT NULL,
	"contacto_emergencia" varchar(150),
	"telefono_emergencia" varchar(20),
	"fecha_nacimiento" date,
	"grupo_sanguineo" varchar(10),
	"estado" varchar(30) DEFAULT 'disponible' NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consumo_combustible" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"orden_servicio_id" uuid,
	"unidad_id" uuid NOT NULL,
	"conductor_id" uuid NOT NULL,
	"grifo_nombre" varchar(150) NOT NULL,
	"grifo_ruc" varchar(11),
	"numero_vale_comprobante" varchar(50) NOT NULL,
	"galones_cargados" numeric(8, 2) NOT NULL,
	"precio_por_galon" numeric(8, 2) NOT NULL,
	"total_monto" numeric(10, 2) NOT NULL,
	"odometro_al_cargar" integer NOT NULL,
	"rendimiento_km_galon_calculado" numeric(6, 2),
	"foto_ticket_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documentos_vehiculo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"entidad_tipo" varchar(20) NOT NULL,
	"entidad_id" uuid NOT NULL,
	"tipo_documento" varchar(40) NOT NULL,
	"numero_documento" varchar(100) NOT NULL,
	"empresa_emisora" varchar(150),
	"fecha_emision" date NOT NULL,
	"fecha_vencimiento" date NOT NULL,
	"archivo_adjunto_url" text,
	"estado_alerta" varchar(20) DEFAULT 'vigente' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "empresas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ruc" varchar(11) NOT NULL,
	"razon_social" varchar(255) NOT NULL,
	"nombre_comercial" varchar(255),
	"direccion_fiscal" text NOT NULL,
	"telefono" varchar(20),
	"email" varchar(150),
	"logo_url" text,
	"config_alertas_dias" jsonb DEFAULT '[30,15,7,0]'::jsonb NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "empresas_ruc_unique" UNIQUE("ruc")
);
--> statement-breakpoint
CREATE TABLE "evidencias_pod" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"orden_servicio_id" uuid NOT NULL,
	"tipo_evidencia" varchar(30) NOT NULL,
	"archivo_url" text NOT NULL,
	"receptor_nombre" varchar(150),
	"receptor_dni" varchar(20),
	"observaciones" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guias_remision" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"orden_servicio_id" uuid NOT NULL,
	"tipo_guia" varchar(30) DEFAULT 'GRE_TRANSPORTISTA_31' NOT NULL,
	"serie" varchar(10) NOT NULL,
	"numero_correlativo" integer NOT NULL,
	"fecha_emision" date NOT NULL,
	"fecha_inicio_traslado" date NOT NULL,
	"sunat_ticket_id" varchar(100),
	"estado_sunat" varchar(30) DEFAULT 'emitido' NOT NULL,
	"sunat_codigo_respuesta" varchar(20),
	"sunat_descripcion_respuesta" text,
	"hash_cpe" varchar(100),
	"qr_code" text,
	"xml_firmado_url" text,
	"cdr_xml_url" text,
	"pdf_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "historial_estados_viaje" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"orden_servicio_id" uuid NOT NULL,
	"estado_anterior" varchar(30),
	"estado_nuevo" varchar(30) NOT NULL,
	"responsable_usuario_id" uuid,
	"latitud" numeric(10, 7),
	"longitud" numeric(10, 7),
	"observacion" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "licencias_conductor" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conductor_id" uuid NOT NULL,
	"categoria" varchar(20) NOT NULL,
	"numero_licencia" varchar(30) NOT NULL,
	"fecha_expedicion" date NOT NULL,
	"fecha_revalidacion" date NOT NULL,
	"puntos_acumulados_mtc" integer DEFAULT 0 NOT NULL,
	"estado" varchar(20) DEFAULT 'vigente' NOT NULL,
	"archivo_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "liquidaciones_conductor" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"orden_servicio_id" uuid NOT NULL,
	"conductor_id" uuid NOT NULL,
	"flete_base" numeric(10, 2) DEFAULT '0' NOT NULL,
	"bono_puntualidad" numeric(10, 2) DEFAULT '0' NOT NULL,
	"viaticos_asignados" numeric(10, 2) DEFAULT '0' NOT NULL,
	"gastos_peajes_declarados" numeric(10, 2) DEFAULT '0' NOT NULL,
	"gastos_cochera_declarados" numeric(10, 2) DEFAULT '0' NOT NULL,
	"otros_gastos" numeric(10, 2) DEFAULT '0' NOT NULL,
	"saldo_a_favor_conductor" numeric(10, 2) DEFAULT '0' NOT NULL,
	"saldo_a_favor_empresa" numeric(10, 2) DEFAULT '0' NOT NULL,
	"estado" varchar(30) DEFAULT 'pendiente_rendicion' NOT NULL,
	"observaciones" text,
	"aprobado_por" uuid,
	"aprobado_en" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mantenimientos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"entidad_tipo" varchar(20) NOT NULL,
	"entidad_id" uuid NOT NULL,
	"tipo" varchar(20) DEFAULT 'preventivo' NOT NULL,
	"descripcion" text NOT NULL,
	"odometro_registro" integer,
	"fecha_programada" date NOT NULL,
	"fecha_ejecucion" date,
	"taller" varchar(20) DEFAULT 'propio' NOT NULL,
	"nombre_taller" varchar(150),
	"costo_mano_obra" numeric(10, 2) DEFAULT '0' NOT NULL,
	"costo_repuestos" numeric(10, 2) DEFAULT '0' NOT NULL,
	"costo_total" numeric(10, 2) DEFAULT '0' NOT NULL,
	"estado" varchar(20) DEFAULT 'pendiente' NOT NULL,
	"observaciones" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ordenes_servicio" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"codigo_viaje" varchar(50) NOT NULL,
	"cliente_id" uuid NOT NULL,
	"ruta_id" uuid NOT NULL,
	"unidad_id" uuid NOT NULL,
	"semirremolque_id" uuid,
	"conductor_id" uuid NOT NULL,
	"conductor_secundario_id" uuid,
	"tipo_carga" varchar(40) DEFAULT 'general' NOT NULL,
	"descripcion_carga" text NOT NULL,
	"peso_bruto_kg" numeric(10, 2) NOT NULL,
	"unidad_medida" varchar(10) DEFAULT 'KGM' NOT NULL,
	"fecha_hora_programada" timestamp with time zone NOT NULL,
	"fecha_hora_inicio" timestamp with time zone,
	"fecha_hora_fin" timestamp with time zone,
	"odometro_inicio" integer,
	"odometro_fin" integer,
	"estado" varchar(30) DEFAULT 'programado' NOT NULL,
	"flete_pactado_moneda" varchar(5) DEFAULT 'PEN' NOT NULL,
	"flete_pactado_monto" numeric(10, 2) NOT NULL,
	"detraccion_porcentaje" numeric(4, 2) DEFAULT '4.00' NOT NULL,
	"detraccion_monto" numeric(10, 2) DEFAULT '0' NOT NULL,
	"adelanto_viaticos" numeric(10, 2) DEFAULT '0' NOT NULL,
	"observaciones" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posiciones_telemetria" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"unidad_id" uuid NOT NULL,
	"orden_servicio_id" uuid,
	"latitud" numeric(10, 7) NOT NULL,
	"longitud" numeric(10, 7) NOT NULL,
	"velocidad_kmh" numeric(6, 2) DEFAULT '0' NOT NULL,
	"rumbo_grados" integer DEFAULT 0,
	"ignicion" boolean DEFAULT true NOT NULL,
	"odometro_km" integer,
	"nivel_combustible_pct" numeric(5, 2),
	"proveedor_gps" varchar(50) DEFAULT 'generico_api' NOT NULL,
	"timestamp_dispositivo" timestamp with time zone NOT NULL,
	"recibido_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rutas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"codigo_ruta" varchar(30) NOT NULL,
	"nombre" varchar(200) NOT NULL,
	"origen_departamento" varchar(100) NOT NULL,
	"origen_provincia" varchar(100) NOT NULL,
	"origen_distrito" varchar(100) NOT NULL,
	"origen_ubigeo" varchar(6) NOT NULL,
	"origen_direccion" text NOT NULL,
	"destino_departamento" varchar(100) NOT NULL,
	"destino_provincia" varchar(100) NOT NULL,
	"destino_distrito" varchar(100) NOT NULL,
	"destino_ubigeo" varchar(6) NOT NULL,
	"destino_direccion" text NOT NULL,
	"distancia_estimada_km" numeric(8, 2) NOT NULL,
	"tiempo_estimado_horas" numeric(5, 2) NOT NULL,
	"peajes_estimados_monto" numeric(8, 2) DEFAULT '0' NOT NULL,
	"galones_estimados" numeric(8, 2),
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sedes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"nombre" varchar(150) NOT NULL,
	"codigo_sunat" varchar(10),
	"direccion" text NOT NULL,
	"departamento" varchar(100) NOT NULL,
	"provincia" varchar(100) NOT NULL,
	"distrito" varchar(100) NOT NULL,
	"ubigeo" varchar(6) NOT NULL,
	"telefono" varchar(20),
	"es_principal" boolean DEFAULT false NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "semirremolques" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"placa" varchar(10) NOT NULL,
	"tipo_carroceria" varchar(40) DEFAULT 'plataforma' NOT NULL,
	"marca" varchar(80),
	"anio_fabricacion" integer,
	"ejes" integer DEFAULT 3 NOT NULL,
	"peso_neto_tn" numeric(8, 2),
	"carga_util_max_tn" numeric(8, 2) NOT NULL,
	"volumen_m3" numeric(8, 2),
	"estado" varchar(30) DEFAULT 'disponible' NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "unidades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"sede_id" uuid,
	"placa" varchar(10) NOT NULL,
	"tipo_unidad" varchar(30) DEFAULT 'tracto' NOT NULL,
	"marca" varchar(80) NOT NULL,
	"modelo" varchar(80) NOT NULL,
	"anio_fabricacion" integer NOT NULL,
	"color" varchar(50),
	"vin_chasis" varchar(50),
	"numero_motor" varchar(50),
	"ejes" integer DEFAULT 3 NOT NULL,
	"capacidad_arrastre_tn" numeric(8, 2),
	"peso_seco_tn" numeric(8, 2),
	"tipo_combustible" varchar(20) DEFAULT 'diesel_b5' NOT NULL,
	"odometro_actual_km" integer DEFAULT 0 NOT NULL,
	"odometro_actualizado_en" timestamp with time zone,
	"id_dispositivo_gps" varchar(100),
	"estado" varchar(30) DEFAULT 'disponible' NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" uuid PRIMARY KEY NOT NULL,
	"empresa_id" uuid NOT NULL,
	"sede_id" uuid,
	"email" varchar(150) NOT NULL,
	"nombres" varchar(100) NOT NULL,
	"apellidos" varchar(100) NOT NULL,
	"telefono" varchar(20),
	"rol" varchar(30) DEFAULT 'despachador' NOT NULL,
	"avatar_url" text,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "alertas_sistema" ADD CONSTRAINT "alertas_sistema_empresa_id_empresas_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alertas_sistema" ADD CONSTRAINT "alertas_sistema_resuelta_por_usuarios_id_fk" FOREIGN KEY ("resuelta_por") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asignaciones_tracto_carreta" ADD CONSTRAINT "asignaciones_tracto_carreta_empresa_id_empresas_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asignaciones_tracto_carreta" ADD CONSTRAINT "asignaciones_tracto_carreta_unidad_id_unidades_id_fk" FOREIGN KEY ("unidad_id") REFERENCES "public"."unidades"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asignaciones_tracto_carreta" ADD CONSTRAINT "asignaciones_tracto_carreta_semirremolque_id_semirremolques_id_fk" FOREIGN KEY ("semirremolque_id") REFERENCES "public"."semirremolques"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificaciones_conductor" ADD CONSTRAINT "certificaciones_conductor_conductor_id_conductores_id_fk" FOREIGN KEY ("conductor_id") REFERENCES "public"."conductores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_empresa_id_empresas_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conductores" ADD CONSTRAINT "conductores_empresa_id_empresas_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conductores" ADD CONSTRAINT "conductores_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consumo_combustible" ADD CONSTRAINT "consumo_combustible_empresa_id_empresas_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consumo_combustible" ADD CONSTRAINT "consumo_combustible_orden_servicio_id_ordenes_servicio_id_fk" FOREIGN KEY ("orden_servicio_id") REFERENCES "public"."ordenes_servicio"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consumo_combustible" ADD CONSTRAINT "consumo_combustible_unidad_id_unidades_id_fk" FOREIGN KEY ("unidad_id") REFERENCES "public"."unidades"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consumo_combustible" ADD CONSTRAINT "consumo_combustible_conductor_id_conductores_id_fk" FOREIGN KEY ("conductor_id") REFERENCES "public"."conductores"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documentos_vehiculo" ADD CONSTRAINT "documentos_vehiculo_empresa_id_empresas_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidencias_pod" ADD CONSTRAINT "evidencias_pod_orden_servicio_id_ordenes_servicio_id_fk" FOREIGN KEY ("orden_servicio_id") REFERENCES "public"."ordenes_servicio"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guias_remision" ADD CONSTRAINT "guias_remision_empresa_id_empresas_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guias_remision" ADD CONSTRAINT "guias_remision_orden_servicio_id_ordenes_servicio_id_fk" FOREIGN KEY ("orden_servicio_id") REFERENCES "public"."ordenes_servicio"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "historial_estados_viaje" ADD CONSTRAINT "historial_estados_viaje_orden_servicio_id_ordenes_servicio_id_fk" FOREIGN KEY ("orden_servicio_id") REFERENCES "public"."ordenes_servicio"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "historial_estados_viaje" ADD CONSTRAINT "historial_estados_viaje_responsable_usuario_id_usuarios_id_fk" FOREIGN KEY ("responsable_usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "licencias_conductor" ADD CONSTRAINT "licencias_conductor_conductor_id_conductores_id_fk" FOREIGN KEY ("conductor_id") REFERENCES "public"."conductores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "liquidaciones_conductor" ADD CONSTRAINT "liquidaciones_conductor_empresa_id_empresas_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "liquidaciones_conductor" ADD CONSTRAINT "liquidaciones_conductor_orden_servicio_id_ordenes_servicio_id_fk" FOREIGN KEY ("orden_servicio_id") REFERENCES "public"."ordenes_servicio"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "liquidaciones_conductor" ADD CONSTRAINT "liquidaciones_conductor_conductor_id_conductores_id_fk" FOREIGN KEY ("conductor_id") REFERENCES "public"."conductores"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "liquidaciones_conductor" ADD CONSTRAINT "liquidaciones_conductor_aprobado_por_usuarios_id_fk" FOREIGN KEY ("aprobado_por") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mantenimientos" ADD CONSTRAINT "mantenimientos_empresa_id_empresas_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordenes_servicio" ADD CONSTRAINT "ordenes_servicio_empresa_id_empresas_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordenes_servicio" ADD CONSTRAINT "ordenes_servicio_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordenes_servicio" ADD CONSTRAINT "ordenes_servicio_ruta_id_rutas_id_fk" FOREIGN KEY ("ruta_id") REFERENCES "public"."rutas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordenes_servicio" ADD CONSTRAINT "ordenes_servicio_unidad_id_unidades_id_fk" FOREIGN KEY ("unidad_id") REFERENCES "public"."unidades"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordenes_servicio" ADD CONSTRAINT "ordenes_servicio_semirremolque_id_semirremolques_id_fk" FOREIGN KEY ("semirremolque_id") REFERENCES "public"."semirremolques"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordenes_servicio" ADD CONSTRAINT "ordenes_servicio_conductor_id_conductores_id_fk" FOREIGN KEY ("conductor_id") REFERENCES "public"."conductores"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordenes_servicio" ADD CONSTRAINT "ordenes_servicio_conductor_secundario_id_conductores_id_fk" FOREIGN KEY ("conductor_secundario_id") REFERENCES "public"."conductores"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posiciones_telemetria" ADD CONSTRAINT "posiciones_telemetria_empresa_id_empresas_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posiciones_telemetria" ADD CONSTRAINT "posiciones_telemetria_unidad_id_unidades_id_fk" FOREIGN KEY ("unidad_id") REFERENCES "public"."unidades"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posiciones_telemetria" ADD CONSTRAINT "posiciones_telemetria_orden_servicio_id_ordenes_servicio_id_fk" FOREIGN KEY ("orden_servicio_id") REFERENCES "public"."ordenes_servicio"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rutas" ADD CONSTRAINT "rutas_empresa_id_empresas_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sedes" ADD CONSTRAINT "sedes_empresa_id_empresas_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "semirremolques" ADD CONSTRAINT "semirremolques_empresa_id_empresas_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unidades" ADD CONSTRAINT "unidades_empresa_id_empresas_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unidades" ADD CONSTRAINT "unidades_sede_id_sedes_id_fk" FOREIGN KEY ("sede_id") REFERENCES "public"."sedes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_empresa_id_empresas_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_sede_id_sedes_id_fk" FOREIGN KEY ("sede_id") REFERENCES "public"."sedes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_alertas_empresa" ON "alertas_sistema" USING btree ("empresa_id");--> statement-breakpoint
CREATE INDEX "idx_alertas_resuelta" ON "alertas_sistema" USING btree ("resuelta");--> statement-breakpoint
CREATE INDEX "idx_alertas_categoria" ON "alertas_sistema" USING btree ("categoria");--> statement-breakpoint
CREATE INDEX "idx_asig_tracto_unidad" ON "asignaciones_tracto_carreta" USING btree ("unidad_id");--> statement-breakpoint
CREATE INDEX "idx_asig_tracto_semirremolque" ON "asignaciones_tracto_carreta" USING btree ("semirremolque_id");--> statement-breakpoint
CREATE INDEX "idx_cert_conductor" ON "certificaciones_conductor" USING btree ("conductor_id");--> statement-breakpoint
CREATE INDEX "idx_cert_vencimiento" ON "certificaciones_conductor" USING btree ("fecha_vencimiento");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_clientes_empresa_doc" ON "clientes" USING btree ("empresa_id","numero_documento");--> statement-breakpoint
CREATE INDEX "idx_clientes_empresa" ON "clientes" USING btree ("empresa_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_conductores_empresa_doc" ON "conductores" USING btree ("empresa_id","numero_documento");--> statement-breakpoint
CREATE INDEX "idx_conductores_empresa" ON "conductores" USING btree ("empresa_id");--> statement-breakpoint
CREATE INDEX "idx_conductores_estado" ON "conductores" USING btree ("estado");--> statement-breakpoint
CREATE INDEX "idx_combustible_orden" ON "consumo_combustible" USING btree ("orden_servicio_id");--> statement-breakpoint
CREATE INDEX "idx_combustible_unidad" ON "consumo_combustible" USING btree ("unidad_id");--> statement-breakpoint
CREATE INDEX "idx_docveh_entidad" ON "documentos_vehiculo" USING btree ("entidad_tipo","entidad_id");--> statement-breakpoint
CREATE INDEX "idx_docveh_vencimiento" ON "documentos_vehiculo" USING btree ("fecha_vencimiento");--> statement-breakpoint
CREATE INDEX "idx_docveh_estado" ON "documentos_vehiculo" USING btree ("estado_alerta");--> statement-breakpoint
CREATE INDEX "idx_evidencias_orden" ON "evidencias_pod" USING btree ("orden_servicio_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_guias_remision_serie_num" ON "guias_remision" USING btree ("empresa_id","tipo_guia","serie","numero_correlativo");--> statement-breakpoint
CREATE INDEX "idx_guias_orden" ON "guias_remision" USING btree ("orden_servicio_id");--> statement-breakpoint
CREATE INDEX "idx_guias_sunat_estado" ON "guias_remision" USING btree ("estado_sunat");--> statement-breakpoint
CREATE INDEX "idx_historial_orden" ON "historial_estados_viaje" USING btree ("orden_servicio_id");--> statement-breakpoint
CREATE INDEX "idx_licencias_conductor" ON "licencias_conductor" USING btree ("conductor_id");--> statement-breakpoint
CREATE INDEX "idx_licencias_revalidacion" ON "licencias_conductor" USING btree ("fecha_revalidacion");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_liquidaciones_orden" ON "liquidaciones_conductor" USING btree ("orden_servicio_id");--> statement-breakpoint
CREATE INDEX "idx_liquidaciones_conductor" ON "liquidaciones_conductor" USING btree ("conductor_id");--> statement-breakpoint
CREATE INDEX "idx_mant_entidad" ON "mantenimientos" USING btree ("entidad_tipo","entidad_id");--> statement-breakpoint
CREATE INDEX "idx_mant_estado" ON "mantenimientos" USING btree ("estado");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_ordenes_servicio_codigo" ON "ordenes_servicio" USING btree ("empresa_id","codigo_viaje");--> statement-breakpoint
CREATE INDEX "idx_ordenes_empresa" ON "ordenes_servicio" USING btree ("empresa_id");--> statement-breakpoint
CREATE INDEX "idx_ordenes_estado" ON "ordenes_servicio" USING btree ("estado");--> statement-breakpoint
CREATE INDEX "idx_ordenes_unidad" ON "ordenes_servicio" USING btree ("unidad_id");--> statement-breakpoint
CREATE INDEX "idx_ordenes_conductor" ON "ordenes_servicio" USING btree ("conductor_id");--> statement-breakpoint
CREATE INDEX "idx_telemetria_unidad_tiempo" ON "posiciones_telemetria" USING btree ("unidad_id","timestamp_dispositivo");--> statement-breakpoint
CREATE INDEX "idx_telemetria_orden" ON "posiciones_telemetria" USING btree ("orden_servicio_id");--> statement-breakpoint
CREATE INDEX "idx_rutas_empresa" ON "rutas" USING btree ("empresa_id");--> statement-breakpoint
CREATE INDEX "idx_rutas_origen_destino" ON "rutas" USING btree ("origen_ubigeo","destino_ubigeo");--> statement-breakpoint
CREATE INDEX "idx_sedes_empresa" ON "sedes" USING btree ("empresa_id");--> statement-breakpoint
CREATE INDEX "idx_sedes_ubigeo" ON "sedes" USING btree ("ubigeo");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_semirremolques_empresa_placa" ON "semirremolques" USING btree ("empresa_id","placa");--> statement-breakpoint
CREATE INDEX "idx_semirremolques_empresa" ON "semirremolques" USING btree ("empresa_id");--> statement-breakpoint
CREATE INDEX "idx_semirremolques_estado" ON "semirremolques" USING btree ("estado");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_unidades_empresa_placa" ON "unidades" USING btree ("empresa_id","placa");--> statement-breakpoint
CREATE INDEX "idx_unidades_empresa" ON "unidades" USING btree ("empresa_id");--> statement-breakpoint
CREATE INDEX "idx_unidades_estado" ON "unidades" USING btree ("estado");--> statement-breakpoint
CREATE INDEX "idx_usuarios_empresa" ON "usuarios" USING btree ("empresa_id");--> statement-breakpoint
CREATE INDEX "idx_usuarios_rol" ON "usuarios" USING btree ("rol");
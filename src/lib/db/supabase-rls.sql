-- ===========================================================================
-- CargaMaster Pro: Supabase RLS Policies & Custom Claims Hook
-- Multi-Tenant Data Isolation by empresa_id and sede_id
-- ===========================================================================

-- 1. Helper Functions to extract claims from JWT
CREATE OR REPLACE FUNCTION public.current_user_empresa_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'empresa_id', '')::uuid;
$$;

CREATE OR REPLACE FUNCTION public.current_user_rol()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'rol', 'despachador');
$$;

-- 2. Custom Access Token Hook for Supabase Auth
-- This function runs automatically whenever a JWT is minted by Supabase Auth
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
  DECLARE
    claims jsonb;
    user_record record;
  BEGIN
    claims := event->'claims';

    -- Look up tenant and role from public.usuarios
    SELECT empresa_id, sede_id, rol
    INTO user_record
    FROM public.usuarios
    WHERE id = (event->>'user_id')::uuid
      AND activo = true;

    IF FOUND THEN
      claims := jsonb_set(claims, '{app_metadata, empresa_id}', to_jsonb(user_record.empresa_id::text));
      IF user_record.sede_id IS NOT NULL THEN
        claims := jsonb_set(claims, '{app_metadata, sede_id}', to_jsonb(user_record.sede_id::text));
      END IF;
      claims := jsonb_set(claims, '{app_metadata, rol}', to_jsonb(user_record.rol));
    END IF;

    event := jsonb_set(event, '{claims}', claims);
    RETURN event;
  END;
$$;

GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) FROM authenticated, anon, public;

-- 3. Enable Row Level Security (RLS) on all tenant-scoped tables
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sedes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semirremolques ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asignaciones_tracto_carreta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos_vehiculo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conductores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licencias_conductor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificaciones_conductor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rutas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordenes_servicio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historial_estados_viaje ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidencias_pod ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guias_remision ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posiciones_telemetria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertas_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mantenimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consumo_combustible ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liquidaciones_conductor ENABLE ROW LEVEL SECURITY;

-- 4. Multi-Tenant Isolation Policies (empresa_id matching)
-- Empresas: users can only see their own company
CREATE POLICY "tenant_empresas_isolation" ON public.empresas
  FOR ALL TO authenticated
  USING (id = public.current_user_empresa_id());

-- Sedes
CREATE POLICY "tenant_sedes_isolation" ON public.sedes
  FOR ALL TO authenticated
  USING (empresa_id = public.current_user_empresa_id());

-- Usuarios
CREATE POLICY "tenant_usuarios_isolation" ON public.usuarios
  FOR ALL TO authenticated
  USING (empresa_id = public.current_user_empresa_id());

-- Unidades (Flota Tractos y Rígidos)
CREATE POLICY "tenant_unidades_isolation" ON public.unidades
  FOR ALL TO authenticated
  USING (empresa_id = public.current_user_empresa_id());

-- Semirremolques
CREATE POLICY "tenant_semirremolques_isolation" ON public.semirremolques
  FOR ALL TO authenticated
  USING (empresa_id = public.current_user_empresa_id());

-- Asignaciones Tracto Carreta
CREATE POLICY "tenant_asig_tracto_carreta_isolation" ON public.asignaciones_tracto_carreta
  FOR ALL TO authenticated
  USING (empresa_id = public.current_user_empresa_id());

-- Documentos Vehículo (SOAT, Rev. Técnica, MTC)
CREATE POLICY "tenant_documentos_vehiculo_isolation" ON public.documentos_vehiculo
  FOR ALL TO authenticated
  USING (empresa_id = public.current_user_empresa_id());

-- Conductores
CREATE POLICY "tenant_conductores_isolation" ON public.conductores
  FOR ALL TO authenticated
  USING (empresa_id = public.current_user_empresa_id());

-- Licencias Conductor (relacionada a conductor de la empresa)
CREATE POLICY "tenant_licencias_conductor_isolation" ON public.licencias_conductor
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conductores c
      WHERE c.id = licencias_conductor.conductor_id
        AND c.empresa_id = public.current_user_empresa_id()
    )
  );

-- Certificaciones Conductor
CREATE POLICY "tenant_cert_conductor_isolation" ON public.certificaciones_conductor
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conductores c
      WHERE c.id = certificaciones_conductor.conductor_id
        AND c.empresa_id = public.current_user_empresa_id()
    )
  );

-- Clientes
CREATE POLICY "tenant_clientes_isolation" ON public.clientes
  FOR ALL TO authenticated
  USING (empresa_id = public.current_user_empresa_id());

-- Rutas
CREATE POLICY "tenant_rutas_isolation" ON public.rutas
  FOR ALL TO authenticated
  USING (empresa_id = public.current_user_empresa_id());

-- Órdenes de Servicio (Viajes)
CREATE POLICY "tenant_ordenes_servicio_isolation" ON public.ordenes_servicio
  FOR ALL TO authenticated
  USING (empresa_id = public.current_user_empresa_id());

-- Historial Estados Viaje
CREATE POLICY "tenant_historial_estados_isolation" ON public.historial_estados_viaje
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.ordenes_servicio os
      WHERE os.id = historial_estados_viaje.orden_servicio_id
        AND os.empresa_id = public.current_user_empresa_id()
    )
  );

-- Evidencias POD
CREATE POLICY "tenant_evidencias_pod_isolation" ON public.evidencias_pod
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.ordenes_servicio os
      WHERE os.id = evidencias_pod.orden_servicio_id
        AND os.empresa_id = public.current_user_empresa_id()
    )
  );

-- Guías de Remisión Electrónica
CREATE POLICY "tenant_guias_remision_isolation" ON public.guias_remision
  FOR ALL TO authenticated
  USING (empresa_id = public.current_user_empresa_id());

-- Posiciones Telemetría GPS
CREATE POLICY "tenant_posiciones_telemetria_isolation" ON public.posiciones_telemetria
  FOR ALL TO authenticated
  USING (empresa_id = public.current_user_empresa_id());

-- Alertas Sistema
CREATE POLICY "tenant_alertas_sistema_isolation" ON public.alertas_sistema
  FOR ALL TO authenticated
  USING (empresa_id = public.current_user_empresa_id());

-- Mantenimientos
CREATE POLICY "tenant_mantenimientos_isolation" ON public.mantenimientos
  FOR ALL TO authenticated
  USING (empresa_id = public.current_user_empresa_id());

-- Consumo Combustible
CREATE POLICY "tenant_consumo_combustible_isolation" ON public.consumo_combustible
  FOR ALL TO authenticated
  USING (empresa_id = public.current_user_empresa_id());

-- Liquidaciones Conductor
CREATE POLICY "tenant_liquidaciones_conductor_isolation" ON public.liquidaciones_conductor
  FOR ALL TO authenticated
  USING (empresa_id = public.current_user_empresa_id());

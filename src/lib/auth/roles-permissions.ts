/**
 * Matriz Central de Control de Acceso Basado en Roles (RBAC)
 * para Transporte Pesado de Carga en el Perú
 */

export type AppRole =
  | "superadmin"
  | "admin"
  | "despachador"
  | "mantenimiento"
  | "conductor"
  | "cliente";

export interface RoleConfig {
  rol: AppRole;
  nombreVisible: string;
  descripcion: string;
  rutaInicio: string;
  rutasPermitidas: string[];
}

export const MATRIZ_ROLES: Record<AppRole, RoleConfig> = {
  superadmin: {
    rol: "superadmin",
    nombreVisible: "Superadministrador",
    descripcion: "Acceso ilimitado a nivel global y multi-empresa",
    rutaInicio: "/",
    rutasPermitidas: [
      "/",
      "/despacho",
      "/tracking",
      "/flota",
      "/conductores",
      "/documentos",
      "/combustible",
      "/mantenimiento",
      "/liquidaciones",
      "/rutas",
      "/clientes",
      "/facturacion",
      "/configuracion",
    ],
  },
  admin: {
    rol: "admin",
    nombreVisible: "Administrador General",
    descripcion: "Gerencia general, control financiero y parametrización operativa",
    rutaInicio: "/",
    rutasPermitidas: [
      "/",
      "/despacho",
      "/tracking",
      "/flota",
      "/conductores",
      "/documentos",
      "/combustible",
      "/mantenimiento",
      "/liquidaciones",
      "/rutas",
      "/clientes",
      "/facturacion",
      "/configuracion",
    ],
  },
  despachador: {
    rol: "despachador",
    nombreVisible: "Coordinador de Tráfico & Despacho",
    descripcion: "Asignación de viajes, emisión de GRE Tipo 31 y documentación MTC",
    rutaInicio: "/despacho",
    rutasPermitidas: [
      "/",
      "/despacho",
      "/tracking",
      "/flota",
      "/conductores",
      "/documentos",
      "/rutas",
      "/clientes",
      "/facturacion",
    ],
  },
  mantenimiento: {
    rol: "mantenimiento",
    nombreVisible: "Jefe de Taller & Mantenimiento",
    descripcion: "Inspecciones de flota, órdenes de trabajo, neumáticos y CITVs",
    rutaInicio: "/mantenimiento",
    rutasPermitidas: [
      "/",
      "/mantenimiento",
      "/flota",
      "/documentos",
      "/combustible",
    ],
  },
  conductor: {
    rol: "conductor",
    nombreVisible: "Conductor Profesional A-IIIc",
    descripcion: "Itinerario de viaje, ruta en carretera, vales de combustible y viáticos",
    rutaInicio: "/despacho",
    rutasPermitidas: [
      "/despacho",
      "/tracking",
      "/combustible",
      "/liquidaciones",
    ],
  },
  cliente: {
    rol: "cliente",
    nombreVisible: "Cliente Dador de Carga B2B",
    descripcion: "Trazabilidad de sus cargas, descarga de facturas y GREs asignadas",
    rutaInicio: "/tracking",
    rutasPermitidas: [
      "/tracking",
      "/despacho",
      "/facturacion",
    ],
  },
};

/**
 * Valida si un rol tiene permiso para acceder a una ruta determinada
 */
export function tieneAccesoRuta(rol: string, pathname: string): boolean {
  const config = MATRIZ_ROLES[rol as AppRole];
  if (!config) return false;

  // Ruta raíz exacta
  if (pathname === "/") {
    return config.rutasPermitidas.includes("/");
  }

  // Comprobar coincidencia exacta o subrutas
  return config.rutasPermitidas.some((rutaPermitida) => {
    if (rutaPermitida === "/") return false;
    return pathname === rutaPermitida || pathname.startsWith(`${rutaPermitida}/`);
  });
}

/**
 * Retorna la ruta de inicio predeterminada para un rol
 */
export function obtenerRutaInicioPorRol(rol: string): string {
  const config = MATRIZ_ROLES[rol as AppRole];
  return config ? config.rutaInicio : "/";
}

import { describe, it, expect } from "vitest";
import {
  MATRIZ_ROLES,
  tieneAccesoRuta,
  obtenerRutaInicioPorRol,
  type AppRole,
} from "@/lib/auth/roles-permissions";

describe("Módulo de Seguridad: Control de Acceso Basado en Roles (RBAC)", () => {
  it("contiene la configuración completa para todos los roles de la empresa de transporte", () => {
    const rolesEsperados: AppRole[] = [
      "superadmin",
      "admin",
      "despachador",
      "mantenimiento",
      "conductor",
      "cliente",
    ];

    rolesEsperados.forEach((rol) => {
      const config = MATRIZ_ROLES[rol];
      expect(config).toBeDefined();
      expect(config.rol).toBe(rol);
      expect(config.nombreVisible).toBeTruthy();
      expect(config.descripcion).toBeTruthy();
      expect(config.rutaInicio).toBeTruthy();
      expect(config.rutasPermitidas.length).toBeGreaterThan(0);
    });
  });

  describe("Permisos de Administrador y Superadministrador", () => {
    it("otorga acceso irrestricto a todos los módulos operativos y estratégicos", () => {
      const modulosCriticos = [
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
      ];

      for (const modulo of modulosCriticos) {
        expect(tieneAccesoRuta("admin", modulo)).toBe(true);
        expect(tieneAccesoRuta("superadmin", modulo)).toBe(true);
      }
    });

    it("permite acceso a subrutas profundas como /despacho/nueva-orden o /flota/V7A-890", () => {
      expect(tieneAccesoRuta("admin", "/despacho/nueva-orden")).toBe(true);
      expect(tieneAccesoRuta("admin", "/flota/tractos/V7A-890/mantenimiento")).toBe(true);
      expect(tieneAccesoRuta("admin", "/configuracion/usuarios/permisos")).toBe(true);
    });
  });

  describe("Permisos de Coordinador de Tráfico & Despachador", () => {
    it("permite despacho, seguimiento, flota, conductores, rutas, facturación y clientes", () => {
      expect(tieneAccesoRuta("despachador", "/despacho")).toBe(true);
      expect(tieneAccesoRuta("despachador", "/tracking")).toBe(true);
      expect(tieneAccesoRuta("despachador", "/flota")).toBe(true);
      expect(tieneAccesoRuta("despachador", "/conductores")).toBe(true);
      expect(tieneAccesoRuta("despachador", "/rutas")).toBe(true);
      expect(tieneAccesoRuta("despachador", "/facturacion")).toBe(true);
    });

    it("bloquea el acceso a configuración del sistema, mantenimiento, liquidaciones y combustible", () => {
      expect(tieneAccesoRuta("despachador", "/configuracion")).toBe(false);
      expect(tieneAccesoRuta("despachador", "/configuracion/roles")).toBe(false);
      expect(tieneAccesoRuta("despachador", "/mantenimiento")).toBe(false);
      expect(tieneAccesoRuta("despachador", "/liquidaciones")).toBe(false);
      expect(tieneAccesoRuta("despachador", "/combustible")).toBe(false);
    });
  });

  describe("Permisos de Jefe de Taller & Mantenimiento", () => {
    it("permite flota, taller de mantenimiento, combustible y documentación técnica", () => {
      expect(tieneAccesoRuta("mantenimiento", "/mantenimiento")).toBe(true);
      expect(tieneAccesoRuta("mantenimiento", "/flota")).toBe(true);
      expect(tieneAccesoRuta("mantenimiento", "/documentos")).toBe(true);
      expect(tieneAccesoRuta("mantenimiento", "/combustible")).toBe(true);
    });

    it("bloquea acceso a módulos comerciales y financieros (facturación, liquidaciones, clientes, rutas)", () => {
      expect(tieneAccesoRuta("mantenimiento", "/facturacion")).toBe(false);
      expect(tieneAccesoRuta("mantenimiento", "/liquidaciones")).toBe(false);
      expect(tieneAccesoRuta("mantenimiento", "/clientes")).toBe(false);
      expect(tieneAccesoRuta("mantenimiento", "/rutas")).toBe(false);
      expect(tieneAccesoRuta("mantenimiento", "/despacho")).toBe(false);
      expect(tieneAccesoRuta("mantenimiento", "/configuracion")).toBe(false);
    });
  });

  describe("Permisos de Conductor Profesional A-IIIc", () => {
    it("permite ver su hoja de ruta/despacho, tracking GPS, combustible y liquidación de viáticos", () => {
      expect(tieneAccesoRuta("conductor", "/despacho")).toBe(true);
      expect(tieneAccesoRuta("conductor", "/tracking")).toBe(true);
      expect(tieneAccesoRuta("conductor", "/combustible")).toBe(true);
      expect(tieneAccesoRuta("conductor", "/liquidaciones")).toBe(true);
    });

    it("bloquea acceso a administración, flota global, otros conductores y facturación SUNAT", () => {
      expect(tieneAccesoRuta("conductor", "/")).toBe(false);
      expect(tieneAccesoRuta("conductor", "/flota")).toBe(false);
      expect(tieneAccesoRuta("conductor", "/conductores")).toBe(false);
      expect(tieneAccesoRuta("conductor", "/facturacion")).toBe(false);
      expect(tieneAccesoRuta("conductor", "/clientes")).toBe(false);
      expect(tieneAccesoRuta("conductor", "/configuracion")).toBe(false);
    });
  });

  describe("Permisos de Cliente Dador de Carga B2B", () => {
    it("permite exclusivamente rastreo de su carga en tiempo real y consulta de facturas/órdenes", () => {
      expect(tieneAccesoRuta("cliente", "/tracking")).toBe(true);
      expect(tieneAccesoRuta("cliente", "/despacho")).toBe(true);
      expect(tieneAccesoRuta("cliente", "/facturacion")).toBe(true);
    });

    it("restringe cualquier visión de costos internos, taller, combustible y flota", () => {
      expect(tieneAccesoRuta("cliente", "/")).toBe(false);
      expect(tieneAccesoRuta("cliente", "/combustible")).toBe(false);
      expect(tieneAccesoRuta("cliente", "/mantenimiento")).toBe(false);
      expect(tieneAccesoRuta("cliente", "/liquidaciones")).toBe(false);
      expect(tieneAccesoRuta("cliente", "/flota")).toBe(false);
      expect(tieneAccesoRuta("cliente", "/conductores")).toBe(false);
      expect(tieneAccesoRuta("cliente", "/configuracion")).toBe(false);
    });
  });

  describe("Casos borde y redirecciones seguras", () => {
    it("deniega acceso para roles inexistentes o no reconocidos", () => {
      expect(tieneAccesoRuta("rol_desconocido", "/despacho")).toBe(false);
      expect(tieneAccesoRuta("", "/despacho")).toBe(false);
      expect(tieneAccesoRuta("hacker", "/configuracion")).toBe(false);
    });

    it("retorna la ruta de inicio personalizada para cada rol operativo", () => {
      expect(obtenerRutaInicioPorRol("admin")).toBe("/");
      expect(obtenerRutaInicioPorRol("superadmin")).toBe("/");
      expect(obtenerRutaInicioPorRol("despachador")).toBe("/despacho");
      expect(obtenerRutaInicioPorRol("mantenimiento")).toBe("/mantenimiento");
      expect(obtenerRutaInicioPorRol("conductor")).toBe("/despacho");
      expect(obtenerRutaInicioPorRol("cliente")).toBe("/tracking");
    });

    it("retorna la ruta raíz '/' como fallback si el rol no existe", () => {
      expect(obtenerRutaInicioPorRol("invalido")).toBe("/");
    });
  });
});

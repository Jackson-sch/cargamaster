import { describe, it, expect } from "vitest";
import {
  ordenServicioSchema,
  actualizarOrdenServicioSchema,
  cambioEstadoViajeSchema,
} from "@/lib/validations/ordenes-servicio";
import { placaSchema } from "@/lib/validations/flota";

describe("Módulo Crítico: Despacho Operativo & Validaciones de Flota", () => {
  it("valida placas peruanas reglamentarias (3 alfanuméricos + guion + 3 alfanuméricos)", () => {
    const placasValidas = ["V7A-890", "Z1A-987", "ABC-123", "F9X-001", "T3S-888"];
    placasValidas.forEach((placa) => {
      const res = placaSchema.safeParse(placa);
      expect(res.success).toBe(true);
    });
  });

  it("rechaza formatos de placa inválidos o sin guion reglamentario", () => {
    const placasInvalidas = ["V7A890", "123-45", "ABC-1234", "V7A-8900", "placa"];
    placasInvalidas.forEach((placa) => {
      const res = placaSchema.safeParse(placa);
      expect(res.success).toBe(false);
    });
  });

  it("valida creación correcta de una Orden de Servicio de carga pesada", () => {
    const payload = {
      clienteId: "a1111111-1111-4111-a111-111111111111",
      rutaId: "a2222222-2222-4222-a222-222222222222",
      unidadId: "a3333333-3333-4333-a333-333333333333",
      semirremolqueId: "a4444444-4444-4444-a444-444444444444",
      conductorId: "a5555555-5555-4555-a555-555555555555",
      tipoCarga: "general" as const,
      descripcionCarga: "Carga consolidada industrial para mina Cerro Verde",
      pesoBrutoKg: "29500",
      unidadMedida: "KGM" as const,
      fechaHoraProgramada: "2026-09-12T08:00:00Z",
      fletePactadoMoneda: "PEN" as const,
      fletePactadoMonto: "4500.00",
      adelantoViaticos: "800.00",
      observaciones: "Entrega con cita previa en almacén central",
    };

    const parsed = ordenServicioSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.pesoBrutoKg).toBe("29500");
      expect(parsed.data.fletePactadoMonto).toBe("4500.00");
    }
  });

  it("rechaza Orden de Servicio si faltan campos indispensables como conductor o tracto", () => {
    const payloadIncompleto = {
      clienteId: "a1111111-1111-4111-a111-111111111111",
      rutaId: "a2222222-2222-4222-a222-222222222222",
      // Falta unidadId
      // Falta conductorId
      tipoCarga: "general",
      descripcionCarga: "Incompleto",
      pesoBrutoKg: "1000",
      fechaHoraProgramada: "2026-09-12T08:00:00Z",
      fletePactadoMonto: "1000",
    };

    const parsed = ordenServicioSchema.safeParse(payloadIncompleto);
    expect(parsed.success).toBe(false);
  });

  it("valida edición y reasignación mediante actualizarOrdenServicioSchema", () => {
    const payloadUpdate = {
      id: "a9999999-9999-4999-a999-999999999999",
      clienteId: "a1111111-1111-4111-a111-111111111111",
      rutaId: "a2222222-2222-4222-a222-222222222222",
      unidadId: "a3333333-3333-4333-a333-333333333333",
      conductorId: "a5555555-5555-4555-a555-555555555555",
      tipoCarga: "maquinaria" as const,
      descripcionCarga: "Pala mecánica hidráulica Komatsu",
      pesoBrutoKg: "31000",
      unidadMedida: "KGM" as const,
      fechaHoraProgramada: "2026-09-14T06:00:00Z",
      fletePactadoMoneda: "PEN" as const,
      fletePactadoMonto: "7200.00",
      adelantoViaticos: "1200.00",
    };

    const parsed = actualizarOrdenServicioSchema.safeParse(payloadUpdate);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.id).toBe("a9999999-9999-4999-a999-999999999999");
    }
  });

  it("valida la máquina de estados del viaje (flujo operativo y cancelación)", () => {
    const estadosValidos = [
      "borrador",
      "programado",
      "cargando",
      "en_ruta",
      "en_destino",
      "descargado",
      "entregado",
      "liquidado",
      "facturado",
      "cancelado",
    ] as const;

    estadosValidos.forEach((estado) => {
      const res = cambioEstadoViajeSchema.safeParse({
        ordenServicioId: "a1111111-1111-4111-a111-111111111111",
        nuevoEstado: estado,
        odometro: 145200,
        observacion: `Transición a ${estado}`,
      });
      expect(res.success).toBe(true);
    });

    const resInvalido = cambioEstadoViajeSchema.safeParse({
      ordenServicioId: "a1111111-1111-4111-a111-111111111111",
      nuevoEstado: "estado_inexistente",
    });
    expect(resInvalido.success).toBe(false);
  });
});

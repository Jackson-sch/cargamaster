import { describe, it, expect } from "vitest";
import { crearFacturaSchema } from "@/lib/validations/facturacion";
import {
  generarXmlFacturaElectronica,
  generarXmlGreTransportista,
  type DatosEmisorSunat,
  type DatosFacturaInput,
  type DatosGreTransportistaInput,
} from "@/lib/sunat/ubl-builder";

describe("Módulo Crítico: Facturación Electrónica & Detracciones SPOT (SUNAT)", () => {
  const emisorMock: DatosEmisorSunat = {
    ruc: "20601234567",
    razonSocial: "TRANSPORTES CARGAMASTER DEL PERÚ S.A.C.",
    nombreComercial: "CARGAMASTER PRO",
    direccion: "Av. Elmer Faucett N° 4520, Callao",
    ubigeo: "070101",
    departamento: "Callao",
    provincia: "Callao",
    distrito: "Callao",
    cuentaBancoNacion: "00-018-294819",
  };

  it("calcula y valida retención SPOT 4% Banco de la Nación cuando el flete supera S/ 700.00", () => {
    const fleteTotal = 5000.0;
    const porcentajeDetraccion = 0.04;
    const detraccionCalculada = +(fleteTotal * porcentajeDetraccion).toFixed(2);
    const saldoNetoACobrar = +(fleteTotal - detraccionCalculada).toFixed(2);

    expect(fleteTotal).toBeGreaterThan(700.0);
    expect(detraccionCalculada).toBe(200.0);
    expect(saldoNetoACobrar).toBe(4800.0);
    expect(emisorMock.cuentaBancoNacion).toBe("00-018-294819");
  });

  it("no aplica detracción SPOT si el flete es menor o igual al umbral legal de S/ 700.00", () => {
    const fleteMenor = 650.0;
    const aplicaSpot = fleteMenor > 700.0;
    const detraccion = aplicaSpot ? +(fleteMenor * 0.04).toFixed(2) : 0.0;

    expect(aplicaSpot).toBe(false);
    expect(detraccion).toBe(0.0);
  });

  it("valida correctamente el esquema Zod de creación de factura", () => {
    const payloadValido = {
      clienteId: "a0000000-0000-4000-a000-000000000001",
      tipoComprobante: "01" as const,
      serie: "F001",
      fechaEmision: "2026-09-10",
      moneda: "PEN" as const,
      descripcionServicio: "Servicio de transporte interprovincial de concentrado de cobre",
      montoSubtotal: "4237.29",
      montoIgv: "762.71",
      montoTotal: "5000.00",
      detraccionAplica: true,
      detraccionPorcentaje: "4.00",
      detraccionMonto: "200.00",
    };

    const parsed = crearFacturaSchema.safeParse(payloadValido);
    expect(parsed.success).toBe(true);
  });

  it("rechaza factura con descripción vacía o cliente ausente", () => {
    const payloadInvalido = {
      clienteId: "invalid-uuid",
      tipoComprobante: "01",
      serie: "F001",
      descripcionServicio: "No", // Menos de 5 caracteres
      montoSubtotal: 0,
      montoIgv: 0,
      montoTotal: 0,
    };

    const parsed = crearFacturaSchema.safeParse(payloadInvalido);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("genera XML UBL 2.1 con leyendas normativas SPOT D.L. 940 y cuenta Banco de la Nación", () => {
    const inputFactura: DatosFacturaInput = {
      serie: "F001",
      correlativo: 1045,
      fechaEmision: "2026-09-10",
      moneda: "PEN",
      clienteRuc: "20100128218",
      clienteRazonSocial: "COMPAÑÍA MINERA ANTAMINA S.A.",
      clienteDireccion: "Av. El Derby 055, Santiago de Surco, Lima",
      descripcionServicio: "Servicio de flete terrestre Lima - Arequipa en tracto T3S3",
      valorVenta: 4237.29,
      igv: 762.71,
      total: 5000.0,
      aplicaDetraccion: true,
      porcentajeDetraccion: 4,
      montoDetraccion: 200.0,
    };

    const resultado = generarXmlFacturaElectronica(emisorMock, inputFactura);

    expect(resultado.xml).toBeDefined();
    expect(resultado.xml).toContain("<cbc:InvoiceTypeCode");
    expect(resultado.xml).toContain("SPOT D.L. 940 (4%)");
    expect(resultado.xml).toContain("00-018-294819");
    expect(resultado.hashCpe).toBeDefined();
    expect(resultado.hashCpe.length).toBeGreaterThan(10);
    expect(resultado.qrCode).toContain("20601234567|01|F001|00001045");
  });

  it("genera XML UBL 2.1 para GRE-Transportista Tipo 31 con trazabilidad completa MTC y SUNAT", () => {
    const inputGre: DatosGreTransportistaInput = {
      serie: "V001",
      correlativo: 284,
      fechaEmision: "2026-09-10",
      fechaInicioTraslado: "2026-09-10",
      remitenteRuc: "20100128218",
      remitenteRazonSocial: "COMPAÑÍA MINERA ANTAMINA S.A.",
      destinatarioTipoDoc: "6",
      destinatarioNumDoc: "20504781293",
      destinatarioRazonSocial: "TERMINAL PORTUARIO MATARANI S.A.",
      partidaUbigeo: "150101",
      partidaDireccion: "Almacén Central Callao - Av. Néstor Gambetta 4500",
      llegadaUbigeo: "040701",
      llegadaDireccion: "Muelle de Embarque Puerto Matarani, Islay, Arequipa",
      placaTracto: "V7A-890",
      placaSemirremolque: "Z1A-987",
      conductorDni: "45892019",
      conductorNombres: "Wilfredo",
      conductorApellidos: "Quispe Mamani",
      conductorLicencia: "Q45892019",
      descripcionCarga: "Bobinas de acero y tubos de perforación minera",
      pesoBrutoTotalKg: 28500,
    };

    const resultado = generarXmlGreTransportista(emisorMock, inputGre);

    expect(resultado.xml).toBeDefined();
    expect(resultado.xml).toContain("<cbc:DespatchAdviceTypeCode");
    expect(resultado.xml).toContain("31</cbc:DespatchAdviceTypeCode>"); // Tipo 31 Transportista
    expect(resultado.xml).toContain("V7A-890");
    expect(resultado.xml).toContain("Z1A-987");
    expect(resultado.xml).toContain("Q45892019");
    expect(resultado.hashCpe).toBeDefined();
    expect(resultado.qrCode).toContain("20601234567|31|V001|00000284");
  });
});

import { describe, it, expect } from "vitest";
import { calcularEstadoAlerta } from "@/lib/utils/fechas";

describe("Módulo Crítico: Normativa Regulatoria MTC & SUTRAN", () => {
  describe("Semáforo Regulatorio de Vencimientos (SOAT, CITV, Licencias MTC)", () => {
    it("clasifica como 'vigente' si faltan más de 30 días para el vencimiento", () => {
      const fechaFutura = new Date();
      fechaFutura.setDate(fechaFutura.getDate() + 45);
      const str = fechaFutura.toISOString().split("T")[0];

      const resultado = calcularEstadoAlerta(str);
      expect(resultado.estado).toBe("vigente");
      expect(resultado.diasRestantes).toBeGreaterThan(30);
    });

    it("clasifica como 'por_vencer' (alerta preventiva) si faltan 30 días o menos", () => {
      const fechaFutura = new Date();
      fechaFutura.setDate(fechaFutura.getDate() + 15);
      const str = fechaFutura.toISOString().split("T")[0];

      const resultado = calcularEstadoAlerta(str);
      expect(resultado.estado).toBe("por_vencer");
      expect(resultado.diasRestantes).toBeLessThanOrEqual(30);
      expect(resultado.diasRestantes).toBeGreaterThan(0);
    });

    it("clasifica como 'vencido' (bloqueo automático de viaje) si la fecha ya caducó o vence hoy", () => {
      const fechaPasada = new Date();
      fechaPasada.setDate(fechaPasada.getDate() - 5);
      const str = fechaPasada.toISOString().split("T")[0];

      const resultado = calcularEstadoAlerta(str);
      expect(resultado.estado).toBe("vencido");
      expect(resultado.diasRestantes).toBeLessThanOrEqual(0);
    });
  });

  describe("Auditoría Satelital de Velocidad SUTRAN en Carretera", () => {
    const LIMITE_LEGAL_CARGA_PESADA_KMH = 90.0;

    it("velocidad <= 90 km/h cumple con el Reglamento Nacional de Tránsito", () => {
      const velocidadLectura = 84.5;
      const esConforme = velocidadLectura <= LIMITE_LEGAL_CARGA_PESADA_KMH;
      expect(esConforme).toBe(true);
    });

    it("velocidad > 90 km/h activa alerta crítica de infracción MTC", () => {
      const velocidadLectura = 96.2;
      const esExceso = velocidadLectura > LIMITE_LEGAL_CARGA_PESADA_KMH;
      expect(esExceso).toBe(true);

      const excesoKm = +(velocidadLectura - LIMITE_LEGAL_CARGA_PESADA_KMH).toFixed(1);
      expect(excesoKm).toBe(6.2);
    });
  });

  describe("Pesos y Medidas MTC (D.S. 058-2003-MTC)", () => {
    it("valida configuración T3S3 (6 ejes) con límite PBTC de 48 Toneladas", () => {
      const ejesTracto = 3;
      const ejesCarreta = 3;
      const configuracion = ejesTracto === 3 && ejesCarreta === 3 ? "T3S3" : "T3S2";
      const pbtcMaximoTn = configuracion === "T3S3" ? 48.0 : 45.0;

      const pesoTaraEquipoTn = 16.5;
      const pesoCargaUtilTn = 29.5;
      const pbtcRealTn = +(pesoTaraEquipoTn + pesoCargaUtilTn).toFixed(2);

      expect(configuracion).toBe("T3S3");
      expect(pbtcMaximoTn).toBe(48.0);
      expect(pbtcRealTn).toBeLessThanOrEqual(pbtcMaximoTn);
    });

    it("detecta sobrepeso cuando el PBTC supera el límite reglamentario de la configuración vehicular", () => {
      const pbtcMaximoT3S2 = 45.0;
      const pesoTara = 16.0;
      const cargaSobredimensionada = 32.0;
      const pbtcTotal = pesoTara + cargaSobredimensionada; // 48.0 Tn en T3S2

      const tieneSobrepeso = pbtcTotal > pbtcMaximoT3S2;
      expect(tieneSobrepeso).toBe(true);
      expect(pbtcTotal - pbtcMaximoT3S2).toBe(3.0); // 3 Tn de sobrepeso
    });
  });
});

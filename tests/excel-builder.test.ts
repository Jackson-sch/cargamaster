import { describe, it, expect } from "vitest";
import { generarExcelCorporativo, type ColumnaExcel } from "@/lib/excel/excel-builder";

describe("Módulo Crítico: Generador de Reportes Excel Corporativo (ExcelJS)", () => {
  it("genera exitosamente un buffer XLSX válido con cabeceras, formato numérico y fila de totales", async () => {
    const columnas: ColumnaExcel[] = [
      { header: "N°", key: "item", width: 6, align: "center" },
      { header: "Placa Tracto", key: "placa", width: 14, align: "center" },
      { header: "Ruta", key: "ruta", width: 25, align: "left" },
      { header: "Flete Pactado (S/)", key: "flete", width: 18, formato: "moneda" },
      { header: "Detracción SPOT 4% (S/)", key: "detraccion", width: 20, formato: "moneda" },
      { header: "Neto a Cobrar (S/)", key: "neto", width: 18, formato: "moneda" },
    ];

    const filas = [
      {
        item: 1,
        placa: "V7A-890",
        ruta: "Lima - Arequipa",
        flete: 4500.0,
        detraccion: 180.0,
        neto: 4320.0,
      },
      {
        item: 2,
        placa: "F9X-001",
        ruta: "Callao - Matarani",
        flete: 5200.0,
        detraccion: 208.0,
        neto: 4992.0,
      },
    ];

    const filaTotales = {
      item: "TOTAL GENERAL",
      placa: "",
      ruta: "2 VIAJES FACTURADOS",
      flete: 9700.0,
      detraccion: 388.0,
      neto: 9312.0,
    };

    const buffer = await generarExcelCorporativo({
      titulo: "Liquidación y Conciliación SPOT Banco de la Nación",
      subtitulo: "Reporte de Auditoría Tributaria SUNAT",
      nombreHoja: "Detracciones SPOT",
      columnas,
      filas,
      filaTotales,
    });

    expect(buffer).toBeDefined();
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(1000); // Un archivo XLSX binario con estilos pesa varios KB

    // Comprobamos la firma mágica del formato ZIP / XLSX (PK..)
    expect(buffer[0]).toBe(0x50); // 'P'
    expect(buffer[1]).toBe(0x4b); // 'K'
  });
});

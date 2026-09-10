import ExcelJS from "exceljs";

export interface ColumnaExcel {
  header: string;
  key: string;
  width?: number;
  align?: "left" | "center" | "right";
  formato?: "texto" | "moneda" | "numero" | "porcentaje" | "fecha";
}

export interface OpcionesReporte {
  titulo: string;
  subtitulo?: string;
  nombreHoja?: string;
  columnas: ColumnaExcel[];
  filas: Record<string, any>[];
  filaTotales?: Record<string, any>;
}

export async function generarExcelCorporativo(opciones: OpcionesReporte): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "CargaMaster Pro - Transandina Continental S.A.C.";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(opciones.nombreHoja || "Reporte", {
    views: [{ showGridLines: true }],
  });

  const numCols = opciones.columnas.length;

  // 1. BANNER CORPORATIVO DE CABECERA
  sheet.mergeCells(1, 1, 1, numCols);
  const cellEmpresa = sheet.getCell(1, 1);
  cellEmpresa.value = "TRANSANDINA CONTINENTAL S.A.C. · RUC: 20601234567";
  cellEmpresa.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFF59E0B" } };
  cellEmpresa.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0B1220" },
  };
  cellEmpresa.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  sheet.getRow(1).height = 22;

  sheet.mergeCells(2, 1, 2, numCols);
  const cellTitulo = sheet.getCell(2, 1);
  cellTitulo.value = opciones.titulo.toUpperCase();
  cellTitulo.font = { name: "Calibri", size: 14, bold: true, color: { argb: "FFFFFFFF" } };
  cellTitulo.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0E1524" },
  };
  cellTitulo.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  sheet.getRow(2).height = 28;

  if (opciones.subtitulo) {
    sheet.mergeCells(3, 1, 3, numCols);
    const cellSub = sheet.getCell(3, 1);
    cellSub.value = `${opciones.subtitulo} · Emitido: ${new Date().toLocaleString("es-PE")}`;
    cellSub.font = { name: "Calibri", size: 9, italic: true, color: { argb: "FF94A3B8" } };
    cellSub.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0E1524" },
    };
    cellSub.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
    sheet.getRow(3).height = 18;
  }

  // Fila separadora vacía
  const startRow = opciones.subtitulo ? 5 : 4;
  sheet.getRow(startRow - 1).height = 8;

  // 2. ENCABEZADOS DE COLUMNA
  const headerRow = sheet.getRow(startRow);
  headerRow.height = 26;

  opciones.columnas.forEach((col, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = col.header;
    cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1E293B" }, // Slate dark
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: col.align || "center",
      wrapText: true,
    };
    cell.border = {
      top: { style: "medium", color: { argb: "FFD97706" } }, // Línea ámbar superior
      bottom: { style: "medium", color: { argb: "FF475569" } },
      left: { style: "thin", color: { argb: "FF334155" } },
      right: { style: "thin", color: { argb: "FF334155" } },
    };
  });

  // 3. FILAS DE DATOS
  let currentRowIdx = startRow + 1;

  opciones.filas.forEach((fila, rowNum) => {
    const row = sheet.getRow(currentRowIdx);
    row.height = 20;
    const isEven = rowNum % 2 === 1;

    opciones.columnas.forEach((col, colIdx) => {
      const cell = row.getCell(colIdx + 1);
      const val = fila[col.key];

      cell.value = val !== undefined && val !== null ? val : "";
      cell.font = { name: "Calibri", size: 10, color: { argb: "FF0F172A" } };

      // Zebra striping
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: isEven ? "FFF8FAFC" : "FFFFFFFF" },
      };

      // Bordes delgados
      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };

      // Formatos de celda
      if (col.formato === "moneda") {
        cell.numFmt = '"S/" #,##0.00;[Red]"S/" -#,##0.00;"S/" 0.00';
        cell.alignment = { vertical: "middle", horizontal: "right" };
      } else if (col.formato === "numero") {
        cell.numFmt = "#,##0.00";
        cell.alignment = { vertical: "middle", horizontal: "right" };
      } else if (col.formato === "porcentaje") {
        cell.numFmt = "0.00%";
        cell.alignment = { vertical: "middle", horizontal: "right" };
      } else if (col.formato === "fecha") {
        cell.numFmt = "YYYY-MM-DD";
        cell.alignment = { vertical: "middle", horizontal: "center" };
      } else {
        cell.alignment = { vertical: "middle", horizontal: col.align || "left" };
      }
    });

    currentRowIdx++;
  });

  // 4. FILA DE TOTALES (OPCIONAL)
  if (opciones.filaTotales) {
    const totalRow = sheet.getRow(currentRowIdx);
    totalRow.height = 24;

    opciones.columnas.forEach((col, colIdx) => {
      const cell = totalRow.getCell(colIdx + 1);
      const val = opciones.filaTotales![col.key];

      cell.value = val !== undefined && val !== null ? val : "";
      cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FF0B1220" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFEF3C7" }, // Soft amber highlight
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FFD97706" } },
        bottom: { style: "double", color: { argb: "FF0B1220" } },
        left: { style: "thin", color: { argb: "FFCBD5E1" } },
        right: { style: "thin", color: { argb: "FFCBD5E1" } },
      };

      if (col.formato === "moneda") {
        cell.numFmt = '"S/" #,##0.00';
        cell.alignment = { vertical: "middle", horizontal: "right" };
      } else if (col.formato === "numero") {
        cell.numFmt = "#,##0.00";
        cell.alignment = { vertical: "middle", horizontal: "right" };
      } else {
        cell.alignment = { vertical: "middle", horizontal: col.align || "center" };
      }
    });
  }

  // 5. AJUSTE INTELIGENTE DEL ANCHO DE COLUMNAS
  opciones.columnas.forEach((col, idx) => {
    let maxLength = col.header.length;
    opciones.filas.forEach((row) => {
      const val = row[col.key];
      if (val !== undefined && val !== null) {
        const str = String(val);
        if (str.length > maxLength) {
          maxLength = str.length;
        }
      }
    });
    // Usar ancho especificado o auto-ajuste con mínimo de 12
    sheet.getColumn(idx + 1).width = col.width || Math.max(maxLength + 4, 12);
  });

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}

"use client";

import { useState } from "react";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface BotonExportarExcelProps {
  endpoint: string;
  label?: string;
  nombreArchivoPorDefecto?: string;
  className?: string;
}

export function BotonExportarExcel({
  endpoint,
  label = "Exportar Excel (.xlsx)",
  nombreArchivoPorDefecto = "reporte.xlsx",
  className,
}: BotonExportarExcelProps) {
  const [descargando, setDescargando] = useState(false);

  const handleDescargar = async () => {
    try {
      setDescargando(true);
      toast.info("Generando reporte corporativo en Excel...", { duration: 2500 });

      const res = await fetch(endpoint);
      if (!res.ok) {
        throw new Error("Error en el servidor al generar el archivo Excel");
      }

      // Obtener nombre del archivo desde cabecera si existe
      const disposition = res.headers.get("Content-Disposition");
      let filename = nombreArchivoPorDefecto;
      if (disposition && disposition.includes("filename=")) {
        const matches = disposition.match(/filename="?([^"]+)"?/);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Archivo Excel descargado con éxito.");
    } catch (error: any) {
      console.error("Error al descargar Excel:", error);
      toast.error(error.message || "No se pudo generar el reporte Excel.");
    } finally {
      setDescargando(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDescargar}
      disabled={descargando}
      className={
        className ||
        "h-9 px-3.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
      }
      title="Descargar reporte oficial en formato Excel (.xlsx)"
    >
      {descargando ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Generando...</span>
        </>
      ) : (
        <>
          <FileSpreadsheet className="h-4 w-4 text-emerald-200" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

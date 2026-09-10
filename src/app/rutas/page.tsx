import { LayoutShell } from "@/components/layout-shell";
import { Route } from "lucide-react";
import { obtenerRutas } from "@/lib/actions/rutas";
import { ModalNuevaRuta } from "@/components/rutas/modal-nueva-ruta";
import { GridRutas } from "@/components/rutas/grid-rutas";

export default async function RutasPage() {
  const { rutas = [] } = await obtenerRutas();

  return (
    <LayoutShell
      title="Catálogo de Rutas & Costos de Operación"
      subtitle="Definición de distancias kilométricas, tiempo estándar de tránsito, peajes nacionales y galonaje base"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            Rutas maestras para cotizaciones de flete automáticas y cálculo de rentabilidad.
          </p>
          <ModalNuevaRuta />
        </div>

        {rutas.length === 0 ? (
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-12 text-center">
            <Route className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-300 mb-1">
              No hay rutas de transporte registradas
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Registra las rutas interprovinciales habituales de tu flota con sus peajes y kilometraje estimado.
            </p>
          </div>
        ) : (
          <GridRutas rutas={rutas as any} />
        )}
      </div>
    </LayoutShell>
  );
}

import { LayoutShell } from "@/components/layout-shell";
import { Route, Search, MapPin, Clock, Navigation } from "lucide-react";
import { obtenerRutas } from "@/lib/actions/rutas";
import { ModalNuevaRuta } from "@/components/rutas/modal-nueva-ruta";

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rutas.map((r) => (
              <div
                key={r.id}
                className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-amber-400">
                    {r.codigoRuta}
                  </span>
                  <span className="text-xs text-slate-400 font-medium font-mono">
                    {r.distanciaEstimadaKm} km
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-3">{r.nombre}</h3>

                <div className="bg-[#0B1220] border border-[#1F2937] rounded-lg p-3 space-y-2 text-xs mb-3">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Origen:</span>
                    <span className="font-medium text-slate-200">
                      {r.origenDistrito || r.origenProvincia} ({r.origenUbigeo})
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Destino:</span>
                    <span className="font-medium text-slate-200">
                      {r.destinoDistrito || r.destinoProvincia} ({r.destinoUbigeo})
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Tiempo Estimado:</span>
                    <span className="font-mono text-slate-200">
                      {r.tiempoEstimadoHoras} h
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Peajes Estimados:</span>
                    <span className="font-mono text-amber-400 font-bold">
                      S/ {parseFloat(r.peajesEstimadosMonto || "0").toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Combustible Proyectado:</span>
                    <span className="font-mono text-sky-400 font-bold">
                      {r.galonesEstimados || "0"} gal
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </LayoutShell>
  );
}

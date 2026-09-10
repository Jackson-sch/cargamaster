import { LayoutShell } from "@/components/layout-shell";
import {
  MapPin,
  Radio,
  Truck,
  Compass,
  Gauge,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Navigation,
  Fuel,
  Activity,
} from "lucide-react";
import { obtenerTelemetriaEnVivoAction } from "@/lib/actions/telemetria";
import { SimuladorGps } from "@/components/tracking/simulador-gps";

export default async function TrackingPage() {
  const { telemetria = [] } = await obtenerTelemetriaEnVivoAction();

  // Tomamos la unidad principal activa (o la primera de la flota)
  const unidadPrincipal = telemetria.find(
    (t) => t.ultimaPosicion?.ordenServicio?.estado === "en_ruta"
  ) || telemetria[0];

  const pos = unidadPrincipal?.ultimaPosicion;
  const orden = pos?.ordenServicio;
  const velocidadNum = parseFloat(pos?.velocidadKmh || "0");
  const alertaExceso = velocidadNum > 90;

  return (
    <LayoutShell
      title="Monitoreo Satelital GPS & Telemetría SUTRAN"
      subtitle="Supervisión en vivo de posiciones, velocidad reglamentaria y geocercas activas en carreteras peruanas"
    >
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111827] border border-[#1F2937] p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
                  Transmisión Satelital Continua
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30 uppercase flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Recepción Activa
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Frecuencia: Cada 30 seg · Protocolo: Teltonika FMB / Traccar API · Auditoría SUTRAN
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <SimuladorGps
              unidades={telemetria.map((t) => ({
                id: t.unidad.id,
                placa: t.unidad.placa,
                marca: t.unidad.marca,
                modelo: t.unidad.modelo,
                odometroActualKm: t.unidad.odometroActualKm,
              }))}
              ordenActivaId={orden?.id}
            />
          </div>
        </div>

        {/* Map & Telemetry Details Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Map View Area */}
          <div className="lg:col-span-2 bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden flex flex-col min-h-[520px] shadow-sm">
            <div className="p-3.5 bg-[#0E1524] border-b border-[#1F2937] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Navigation className="h-4 w-4 text-amber-400" />
                <span>
                  {orden?.ruta?.nombre || "Ruta Panamericana Sur: Km 480 (Nazca ➔ Arequipa)"}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Lat: {pos?.latitud || "-14.828889"}, Lng: {pos?.longitud || "-74.943611"}
              </span>
            </div>

            {/* Visual Tactical Map Interface */}
            <div className="flex-1 bg-[#090E17] relative flex items-center justify-center p-6 border-b border-[#1F2937]">
              {/* Grid Background Lines for Tactical Map Feel */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "radial-gradient(#F59E0B 1px, transparent 1px), radial-gradient(#F59E0B 1px, #090E17 1px)",
                  backgroundSize: "40px 40px",
                  backgroundPosition: "0 0, 20px 20px",
                }}
              />

              {/* Highway Route Vector Overlay */}
              <div className="relative z-10 w-full max-w-lg text-center space-y-5">
                <div className="inline-flex flex-col items-center p-6 rounded-2xl bg-[#111827]/90 border border-amber-500/40 shadow-2xl backdrop-blur-md">
                  <div className="h-14 w-14 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 mb-2 relative">
                    <Truck className="h-7 w-7 animate-pulse" />
                    <span
                      className={`absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full ring-2 ring-[#111827] ${
                        pos?.ignicion ? "bg-emerald-400" : "bg-slate-500"
                      }`}
                    />
                  </div>
                  <span className="text-lg font-black text-white font-mono tracking-wider">
                    {unidadPrincipal?.unidad.placa || "V7A-890"}
                  </span>
                  <span className="text-xs text-amber-400 font-semibold">
                    {unidadPrincipal?.unidad.marca} {unidadPrincipal?.unidad.modelo} · {orden?.codigoViaje || "En Tránsito"}
                  </span>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-left text-xs bg-[#0B1220] p-3 rounded-xl border border-[#1F2937] w-full">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">
                        Velocidad GPS
                      </span>
                      <span
                        className={`font-mono text-sm font-bold ${
                          alertaExceso ? "text-red-400" : "text-emerald-400"
                        }`}
                      >
                        {velocidadNum.toFixed(1)} km/h
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">
                        Límite SUTRAN
                      </span>
                      <span className="font-bold text-slate-300 font-mono text-sm">
                        90.0 km/h
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">
                        Rumbo / Orientación
                      </span>
                      <span className="font-bold text-slate-300 font-mono">
                        {pos?.rumboGrados || 145}° SE
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">
                        Tanque Combustible
                      </span>
                      <span className="font-bold text-sky-400 font-mono">
                        {pos?.nivelCombustiblePct ? `${parseFloat(pos.nivelCombustiblePct).toFixed(0)}%` : "64%"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-400 bg-[#0B1220]/80 py-2 px-4 rounded-lg border border-[#1F2937] inline-block font-mono">
                  <span>
                    Destino: {orden?.ruta?.destinoDistrito || "Arequipa"} · Chofer:{" "}
                    {orden?.conductor?.nombres} {orden?.conductor?.apellidos}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Status bar */}
            <div className="p-3 bg-[#0B1220] text-xs flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Geocerca: Corredor Minero Sur (Sin desviaciones no autorizadas)
              </span>
              <span className="text-emerald-400 font-mono text-[11px]">
                Último reporte: {pos?.timestampDispositivo ? new Date(pos.timestampDispositivo).toLocaleTimeString("es-PE") : "En vivo"}
              </span>
            </div>
          </div>

          {/* Right Column: Telemetry & Driving Hours Control */}
          <div className="space-y-4">
            {/* Driving Hours Card */}
            <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-[family-name:var(--font-sora)]">
                  Jornada de Conducción SUTRAN
                </h3>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Conductor al Volante:</span>
                  <span className="text-white font-semibold">
                    {orden?.conductor ? `${orden.conductor.nombres} ${orden.conductor.apellidos}` : "Wilfredo Quispe M."}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Manejo continuo actual:</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    3h 40m / 5h 00m máx
                  </span>
                </div>
                {/* Progress */}
                <div className="h-2 w-full bg-[#0B1220] rounded-full overflow-hidden border border-[#1F2937]">
                  <div
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ width: "73%" }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-tight pt-1">
                  Normativa MTC: descanso obligatorio de 30 min antes de cumplir 5
                  horas continuas de manejo diurno (o 4h nocturno).
                </p>
              </div>
            </div>

            {/* SUTRAN Speed Compliance */}
            <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-[family-name:var(--font-sora)]">
                  Cumplimiento Fiscal SUTRAN
                </h3>
              </div>

              <div className="p-3 rounded-lg bg-[#0B1220] border border-emerald-500/20 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Estado de Velocidad:</span>
                  <span
                    className={`font-bold font-mono ${
                      alertaExceso ? "text-red-400" : "text-emerald-400"
                    }`}
                  >
                    {alertaExceso ? "⚠ Exceso de Velocidad" : "Conforme (<90 km/h)"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Velocidad actual:</span>
                  <span className="font-mono text-white font-bold">{velocidadNum.toFixed(1)} km/h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Alertas de Exceso registradas:</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {unidadPrincipal?.alertasActivas.length || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* All Fleet Units Status List */}
            <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4 text-xs space-y-3">
              <h3 className="font-bold uppercase tracking-wider text-slate-200 font-[family-name:var(--font-sora)]">
                Flota Monitoreada ({telemetria.length})
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {telemetria.map((t) => (
                  <div
                    key={t.unidad.id}
                    className="p-2.5 rounded-lg bg-[#0B1220] border border-[#1F2937] flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono font-bold text-white block">
                        {t.unidad.placa}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {t.unidad.marca} {t.unidad.modelo}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-emerald-400 font-bold block">
                        {t.ultimaPosicion?.velocidadKmh || "0"} km/h
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase">
                        {t.ultimaPosicion?.ignicion ? "En marcha" : "Detenido"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}

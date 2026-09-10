"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Radio,
  X,
  Loader2,
  Navigation,
  Gauge,
  Fuel,
  AlertTriangle,
  Play,
  MapPin,
} from "lucide-react";
import { registrarPosicionGpsAction } from "@/lib/actions/telemetria";
import { toast } from "sonner";

interface UnidadOpcion {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  odometroActualKm: number | null;
}

interface SimuladorGpsProps {
  unidades: UnidadOpcion[];
  ordenActivaId?: string;
  onPositionSent?: () => void;
}

const PUNTOS_RUTA_PERU = [
  {
    nombre: "Panamericana Sur - Nazca (Km 450)",
    lat: "-14.828889",
    lng: "-74.943611",
    rumbo: 145,
  },
  {
    nombre: "Panamericana Sur - Garita Yauca (Km 571)",
    lat: "-15.666667",
    lng: "-74.516667",
    rumbo: 135,
  },
  {
    nombre: "Panamericana Sur - Camaná (Km 840)",
    lat: "-16.623889",
    lng: "-72.711111",
    rumbo: 110,
  },
  {
    nombre: "Arequipa - Garita Uchumayo / Cerro Verde (Km 1018)",
    lat: "-16.425556",
    lng: "-71.678889",
    rumbo: 90,
  },
  {
    nombre: "Carretera Central - Ticlio Abra (Km 132 - 4,818 msnm)",
    lat: "-11.597778",
    lng: "-76.191389",
    rumbo: 85,
  },
];

export function SimuladorGps({ unidades, ordenActivaId, onPositionSent }: SimuladorGpsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [unidadId, setUnidadId] = useState(unidades[0]?.id || "");
  const [puntoSeleccionado, setPuntoSeleccionado] = useState(0);
  const [velocidad, setVelocidad] = useState(74);
  const [combustible, setCombustible] = useState(62);
  const [ignicion, setIgnicion] = useState(true);

  const selectedUnit = unidades.find((u) => u.id === unidadId);
  const currentOdometro = (selectedUnit?.odometroActualKm || 84520) + 15;

  const handleTransmitir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unidadId) {
      toast.error("Selecciona una unidad.");
      return;
    }

    setLoading(true);
    const punto = PUNTOS_RUTA_PERU[puntoSeleccionado];

    const res = await registrarPosicionGpsAction({
      unidadId,
      ordenServicioId: ordenActivaId || undefined,
      latitud: punto.lat,
      longitud: punto.lng,
      velocidadKmh: velocidad,
      rumboGrados: punto.rumbo,
      ignicion,
      odometroKm: currentOdometro,
      nivelCombustiblePct: combustible,
      proveedorGps: "teltonika_fmb",
    });
    setLoading(false);

    if (res.success) {
      if (velocidad > 90) {
        toast.warning(
          `¡Posición transmitida con Alerta SUTRAN! Exceso de velocidad: ${velocidad} km/h detectado.`
        );
      } else {
        toast.success(
          `Ping satelital transmitido: ${selectedUnit?.placa} a ${velocidad} km/h en ${punto.nombre}.`
        );
      }
      setOpen(false);
      router.refresh();
      if (onPositionSent) onPositionSent();
    } else {
      toast.error(res.error || "No se pudo transmitir la telemetría.");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="h-9 px-3.5 bg-[#111827] border border-amber-500/40 hover:border-amber-400 text-amber-400 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
      >
        <Radio className="h-3.5 w-3.5 animate-pulse" />
        <span>Simular Transmisión GPS</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#111827] border border-[#1F2937] rounded-xl shadow-2xl overflow-hidden text-left text-xs">
            {/* Header */}
            <div className="p-4 bg-[#0E1524] border-b border-[#1F2937] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-amber-400" />
                <div>
                  <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
                    Simulador Telemático GPS / SUTRAN
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Inyección de tramas NMEA / Teltonika hacia la base de datos
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleTransmitir} className="p-5 space-y-4">
              {/* Selector de Tracto */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Unidad de Transporte (Tracto) *
                </label>
                <select
                  value={unidadId}
                  onChange={(e) => setUnidadId(e.target.value)}
                  className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono font-bold focus:border-amber-500 focus:outline-none"
                >
                  {unidades.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.placa} ({u.marca} {u.modelo}) · Odóm: {u.odometroActualKm || 0} km
                    </option>
                  ))}
                </select>
              </div>

              {/* Punto de Ruta Peruana */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Punto Geográfico en Ruta *
                </label>
                <select
                  value={puntoSeleccionado}
                  onChange={(e) => setPuntoSeleccionado(parseInt(e.target.value))}
                  className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                >
                  {PUNTOS_RUTA_PERU.map((p, idx) => (
                    <option key={p.nombre} value={idx}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Slider de Velocidad */}
              <div className="p-3 bg-[#0B1220] rounded-lg border border-[#1F2937] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <Gauge className="h-4 w-4 text-amber-400" />
                    Velocidad Instantánea:
                  </span>
                  <span
                    className={`font-mono text-sm font-bold px-2 py-0.5 rounded ${
                      velocidad > 90
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    {velocidad} km/h {velocidad > 90 && "⚠ EXCESO"}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="120"
                  value={velocidad}
                  onChange={(e) => setVelocidad(parseInt(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0 (Parado)</span>
                  <span className="text-emerald-400">80 (Límite Camión)</span>
                  <span className="text-amber-400">90 (Límite Autopista)</span>
                  <span className="text-red-400">&gt;90 (Infracción)</span>
                </div>
              </div>

              {/* Combustible e Ignición */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#0B1220] rounded-lg border border-[#1F2937] space-y-1">
                  <span className="text-slate-400 block flex items-center gap-1">
                    <Fuel className="h-3.5 w-3.5 text-sky-400" />
                    Combustible:
                  </span>
                  <span className="font-mono font-bold text-sky-400 text-sm">
                    {combustible}%
                  </span>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={combustible}
                    onChange={(e) => setCombustible(parseInt(e.target.value))}
                    className="w-full accent-sky-500 cursor-pointer mt-1"
                  />
                </div>

                <div className="p-3 bg-[#0B1220] rounded-lg border border-[#1F2937] space-y-2 flex flex-col justify-between">
                  <span className="text-slate-400 block">Ignición / Motor:</span>
                  <button
                    type="button"
                    onClick={() => setIgnicion(!ignicion)}
                    className={`h-8 w-full rounded font-semibold transition-colors ${
                      ignicion
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}
                  >
                    {ignicion ? "Encendido (En marcha)" : "Apagado (Detenido)"}
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-[#1F2937] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-9 px-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="h-9 px-5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Transmitir Ping GPS</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

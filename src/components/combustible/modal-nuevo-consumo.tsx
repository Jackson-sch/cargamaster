"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Fuel,
  X,
  Loader2,
  Plus,
  Gauge,
  Calculator,
  Receipt,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { registrarConsumoCombustibleAction } from "@/lib/actions/combustible";
import { toast } from "sonner";

export interface UnidadOption {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  odometroActualKm: number;
}

export interface ConductorOption {
  id: string;
  nombres: string;
  apellidos: string;
  numeroDocumento: string;
  licencias?: {
    numeroLicencia: string;
  }[];
}

export interface OrdenOption {
  id: string;
  codigoViaje: string;
  estado: string;
  ruta?: {
    nombre: string;
    origenProvincia: string;
    destinoProvincia: string;
  } | null;
}

interface ModalNuevoConsumoProps {
  unidades: UnidadOption[];
  conductores: ConductorOption[];
  ordenes: OrdenOption[];
  onCreated?: () => void;
}

const GRIFOS_FRECUENTES = [
  { nombre: "Repsol Chala Sur (Km 612 Panamericana Sur)", ruc: "20100070970" },
  { nombre: "Primax La Oroya (Carretera Central)", ruc: "20503840121" },
  { nombre: "Petroperú Conococha (Ancash)", ruc: "20100128218" },
  { nombre: "Pecsa Pucusana (Km 58 Panamericana Sur)", ruc: "20382910401" },
  { nombre: "Primax Arequipa Cerro Colorado", ruc: "20503840121" },
];

export function ModalNuevoConsumo({
  unidades,
  conductores,
  ordenes,
  onCreated,
}: ModalNuevoConsumoProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [unidadId, setUnidadId] = useState(unidades[0]?.id || "");
  const [conductorId, setConductorId] = useState(conductores[0]?.id || "");
  const [ordenServicioId, setOrdenServicioId] = useState("");
  const [grifoNombre, setGrifoNombre] = useState(GRIFOS_FRECUENTES[0].nombre);
  const [grifoRuc, setGrifoRuc] = useState(GRIFOS_FRECUENTES[0].ruc);
  const [numeroVale, setNumeroVale] = useState("F001-");
  const [galones, setGalones] = useState("80.00");
  const [precioGalon, setPrecioGalon] = useState("17.80");
  const [odometroAlCargar, setOdometroAlCargar] = useState(
    unidades[0] ? String(unidades[0].odometroActualKm + 450) : "85000"
  );
  const [fotoTicketUrl, setFotoTicketUrl] = useState("");

  const handleSelectUnidad = (id: string) => {
    setUnidadId(id);
    const u = unidades.find((item) => item.id === id);
    if (u) {
      setOdometroAlCargar(String(u.odometroActualKm + 420));
    }
  };

  const handleSelectGrifoPreset = (preset: { nombre: string; ruc: string }) => {
    setGrifoNombre(preset.nombre);
    setGrifoRuc(preset.ruc);
  };

  // Math Calculations
  const galonesNum = parseFloat(galones) || 0;
  const precioNum = parseFloat(precioGalon) || 0;
  const totalMontoCalculado = (galonesNum * precioNum).toFixed(2);

  const selectedUnidad = unidades.find((u) => u.id === unidadId);
  const odometroAnterior = selectedUnidad?.odometroActualKm || 0;
  const odomActualNum = parseInt(odometroAlCargar, 10) || 0;
  const deltaKm = odomActualNum > odometroAnterior ? odomActualNum - odometroAnterior : 0;
  const ratioEstimado = galonesNum > 0 && deltaKm > 0 ? (deltaKm / galonesNum).toFixed(2) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!unidadId) {
      toast.error("Seleccione una unidad vehicular");
      return;
    }
    if (!conductorId) {
      toast.error("Seleccione un conductor");
      return;
    }
    if (!numeroVale || numeroVale.trim() === "F001-") {
      toast.error("Ingrese el número de comprobante o vale");
      return;
    }
    if (galonesNum <= 0) {
      toast.error("Los galones deben ser mayores a 0");
      return;
    }
    if (odomActualNum <= 0) {
      toast.error("Ingrese un odómetro válido");
      return;
    }

    setLoading(true);
    try {
      const res = await registrarConsumoCombustibleAction({
        unidadId,
        conductorId,
        ordenServicioId: ordenServicioId || undefined,
        grifoNombre,
        grifoRuc,
        numeroValeComprobante: numeroVale,
        galonesCargados: galonesNum,
        precioPorGalon: precioNum,
        totalMonto: parseFloat(totalMontoCalculado),
        odometroAlCargar: odomActualNum,
        fotoTicketUrl,
      });

      if (res.success) {
        toast.success(res.message || "Carga de combustible registrada con éxito.");
        if (res.rendimiento) {
          toast.info(`Rendimiento térmico calculado: ${res.rendimiento} km/galón`);
        }
        setOpen(false);
        router.refresh();
        onCreated?.();
      } else {
        toast.error(res.error || "No se pudo registrar la carga.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error inesperado al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="h-9 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-amber-500/10"
      >
        <Plus className="h-4 w-4" />
        <span>Registrar Carga de Combustible</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#111827] border border-[#1F2937] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
            {/* Header */}
            <div className="p-5 border-b border-[#1F2937] flex items-center justify-between bg-[#0B1220]/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Fuel className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-[family-name:var(--font-sora)]">
                    Nuevo Vale de Combustible (Diesel B5)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Control térmico de consumo, odómetros y ratio de rendimiento por tracto
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Presets de Grifos Rápidos */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                  Estaciones de Servicio Frecuentes
                </label>
                <div className="flex flex-wrap gap-2">
                  {GRIFOS_FRECUENTES.map((gf) => (
                    <button
                      key={gf.nombre}
                      type="button"
                      onClick={() => handleSelectGrifoPreset(gf)}
                      className={`text-[11px] px-2.5 py-1 rounded-md border transition-all ${
                        grifoNombre === gf.nombre
                          ? "bg-amber-500/20 border-amber-500 text-amber-300 font-semibold"
                          : "bg-slate-900 border-[#1F2937] text-slate-400 hover:text-slate-200 hover:border-slate-700"
                      }`}
                    >
                      {gf.nombre.split(" (")[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fila 1: Tracto y Conductor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Unidad / Tracto *
                  </label>
                  <select
                    value={unidadId}
                    onChange={(e) => handleSelectUnidad(e.target.value)}
                    className="w-full bg-[#0B1220] border border-[#1F2937] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    required
                  >
                    <option value="">-- Seleccione Tracto --</option>
                    {unidades.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.placa} ({u.marca} {u.modelo}) - Odóm: {u.odometroActualKm.toLocaleString()} km
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Conductor Responsable *
                  </label>
                  <select
                    value={conductorId}
                    onChange={(e) => setConductorId(e.target.value)}
                    className="w-full bg-[#0B1220] border border-[#1F2937] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    required
                  >
                    <option value="">-- Seleccione Conductor --</option>
                    {conductores.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.apellidos}, {c.nombres} (Doc: {c.numeroDocumento}
                        {c.licencias?.[0]?.numeroLicencia ? ` - Lic: ${c.licencias[0].numeroLicencia}` : ""})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fila 2: Orden de servicio opcional */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Asociar a Orden de Servicio (Opcional)
                </label>
                <select
                  value={ordenServicioId}
                  onChange={(e) => setOrdenServicioId(e.target.value)}
                  className="w-full bg-[#0B1220] border border-[#1F2937] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Sin orden vinculada (Carga directa / Terminal) --</option>
                  {ordenes.map((ord) => (
                    <option key={ord.id} value={ord.id}>
                      {ord.codigoViaje} - {ord.ruta?.origenProvincia} ➔ {ord.ruta?.destinoProvincia} ({ord.estado})
                    </option>
                  ))}
                </select>
              </div>

              {/* Fila 3: Grifo y Comprobante */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Nombre de Estación / Grifo *
                  </label>
                  <input
                    type="text"
                    value={grifoNombre}
                    onChange={(e) => setGrifoNombre(e.target.value)}
                    placeholder="Ej: Repsol Km 612 Panamericana Sur"
                    className="w-full bg-[#0B1220] border border-[#1F2937] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    RUC Grifo
                  </label>
                  <input
                    type="text"
                    maxLength={11}
                    value={grifoRuc}
                    onChange={(e) => setGrifoRuc(e.target.value)}
                    placeholder="20100070970"
                    className="w-full bg-[#0B1220] border border-[#1F2937] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Fila 4: N° Vale y Odómetro */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    N° Vale / Factura Grifo *
                  </label>
                  <div className="relative">
                    <Receipt className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={numeroVale}
                      onChange={(e) => setNumeroVale(e.target.value)}
                      placeholder="F001-00049182"
                      className="w-full bg-[#0B1220] border border-[#1F2937] rounded-lg pl-9 pr-3 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Odómetro al Cargar (Km) *
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Anterior: {odometroAnterior.toLocaleString()} km
                    </span>
                  </div>
                  <div className="relative">
                    <Gauge className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="number"
                      value={odometroAlCargar}
                      onChange={(e) => setOdometroAlCargar(e.target.value)}
                      placeholder="84000"
                      className="w-full bg-[#0B1220] border border-[#1F2937] rounded-lg pl-9 pr-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Fila 5: Galones, Precio y Total */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Galones (Diesel B5) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={galones}
                    onChange={(e) => setGalones(e.target.value)}
                    placeholder="80.00"
                    className="w-full bg-[#0B1220] border border-[#1F2937] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Precio / Galón (S/) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={precioGalon}
                    onChange={(e) => setPrecioGalon(e.target.value)}
                    placeholder="17.80"
                    className="w-full bg-[#0B1220] border border-[#1F2937] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Total Importe (S/)
                  </label>
                  <div className="w-full bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2 text-xs text-amber-400 font-mono font-bold flex items-center justify-between">
                    <span>S/ {totalMontoCalculado}</span>
                    <Calculator className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                </div>
              </div>

              {/* Banner de Eficiencia Térmica en Vivo */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
                    <Gauge className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Rendimiento Estimado del Recorrido
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-white font-mono">
                        {ratioEstimado ? `${ratioEstimado} km/gal` : "--"}
                      </span>
                      {ratioEstimado && (
                        <span
                          className={`text-xs font-semibold ${
                            parseFloat(ratioEstimado) >= 5.0
                              ? "text-emerald-400"
                              : parseFloat(ratioEstimado) >= 3.8
                              ? "text-amber-400"
                              : "text-rose-400"
                          }`}
                        >
                          {parseFloat(ratioEstimado) >= 5.0
                            ? "✓ Eficiencia Óptima (Costa)"
                            : parseFloat(ratioEstimado) >= 3.8
                            ? "⚠ Exigencia Media (Sierra)"
                            : "⚠ Consumo Elevado"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-400 font-mono">
                  <span>Delta Odómetro: </span>
                  <strong className="text-white">+{deltaKm} km</strong>
                  <br />
                  <span>Consumo: </span>
                  <strong className="text-white">{galonesNum} gal</strong>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="pt-3 border-t border-[#1F2937] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold flex items-center gap-2 transition-colors shadow-lg shadow-amber-500/10"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Guardando vale...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Guardar Registro</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

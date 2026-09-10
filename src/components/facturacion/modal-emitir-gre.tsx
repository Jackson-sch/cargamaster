"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  X,
  Loader2,
  ShieldCheck,
  Truck,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Plus,
} from "lucide-react";
import { emitirGreTransportistaAction } from "@/lib/actions/guias-remision";
import { toast } from "sonner";

interface OrdenParaGre {
  id: string;
  codigoViaje: string;
  descripcionCarga: string;
  pesoBrutoKg: string;
  cliente: {
    razonSocial: string;
    numeroDocumento: string;
    direccionFiscal?: string;
  } | null;
  ruta: {
    origenDepartamento?: string;
    origenUbigeo?: string;
    origenDireccion?: string;
    destinoDepartamento?: string;
    destinoUbigeo?: string;
    destinoDireccion?: string;
  } | null;
  unidad: {
    placa: string;
  } | null;
  semirremolque: {
    placa: string;
  } | null;
  conductor: {
    nombres: string;
    apellidos: string;
    numeroDocumento: string;
  } | null;
}

interface ModalEmitirGreProps {
  ordenesDisponibles: OrdenParaGre[];
  preselectedOrdenId?: string;
  onCreated?: () => void;
}

export function ModalEmitirGre({
  ordenesDisponibles,
  preselectedOrdenId,
  onCreated,
}: ModalEmitirGreProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [ordenId, setOrdenId] = useState(preselectedOrdenId || "");

  const [formData, setFormData] = useState({
    serie: "V001",
    fechaEmision: new Date().toISOString().slice(0, 10),
    fechaInicioTraslado: new Date().toISOString().slice(0, 10),
    motivoTraslado: "01",
    remitenteRuc: "",
    remitenteRazonSocial: "",
    destinatarioTipoDoc: "6" as "6" | "1",
    destinatarioNumDoc: "",
    destinatarioRazonSocial: "",
    partidaUbigeo: "070101",
    partidaDireccion: "",
    llegadaUbigeo: "040126",
    llegadaDireccion: "",
    placaTracto: "",
    placaSemirremolque: "",
    conductorDni: "",
    conductorNombres: "",
    conductorApellidos: "",
    conductorLicencia: "",
    descripcionCarga: "",
    pesoBrutoTotalKg: 28000,
    unidadMedida: "KGM" as "KGM" | "TNE",
  });

  const handleSelectOrden = (id: string) => {
    setOrdenId(id);
    const ord = ordenesDisponibles.find((o) => o.id === id);
    if (ord) {
      setFormData({
        ...formData,
        remitenteRuc: ord.cliente?.numeroDocumento || "",
        remitenteRazonSocial: ord.cliente?.razonSocial || "",
        destinatarioTipoDoc: "6",
        destinatarioNumDoc: ord.cliente?.numeroDocumento || "",
        destinatarioRazonSocial: ord.cliente?.razonSocial || "",
        partidaUbigeo: ord.ruta?.origenUbigeo || "070101",
        partidaDireccion: ord.ruta?.origenDireccion || "Terminal Portuario Callao, APM Terminals",
        llegadaUbigeo: ord.ruta?.destinoUbigeo || "040126",
        llegadaDireccion: ord.ruta?.destinoDireccion || "Asiento Minero Cerro Verde s/n, Uchumayo",
        placaTracto: ord.unidad?.placa || "",
        placaSemirremolque: ord.semirremolque?.placa || "",
        conductorDni: ord.conductor?.numeroDocumento || "",
        conductorNombres: ord.conductor?.nombres || "",
        conductorApellidos: ord.conductor?.apellidos || "",
        conductorLicencia: `Q${ord.conductor?.numeroDocumento || "12345678"}`,
        descripcionCarga: ord.descripcionCarga,
        pesoBrutoTotalKg: parseFloat(ord.pesoBrutoKg) || 28000,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ordenId) {
      toast.error("Selecciona una orden de servicio.");
      return;
    }

    setLoading(true);
    const res = await emitirGreTransportistaAction({
      ...formData,
      ordenServicioId: ordenId,
    });
    setLoading(false);

    if (res.success) {
      toast.success(
        `¡Guía de Remisión ${res.serieCorrelativo} emitida y ACEPTADA por SUNAT!`
      );
      setOpen(false);
      router.refresh();
      if (onCreated) onCreated();
    } else {
      toast.error(res.error || "No se pudo emitir la GRE Transportista.");
    }
  };

  return (
    <>
      <button
        onClick={() => {
          if (preselectedOrdenId) handleSelectOrden(preselectedOrdenId);
          setOpen(true);
        }}
        className="h-9 px-4 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
      >
        <Plus className="h-4 w-4" />
        <span>Emitir GRE Transportista</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#111827] border border-[#1F2937] rounded-xl shadow-2xl overflow-hidden text-left">
            {/* Header */}
            <div className="p-4 bg-[#0E1524] border-b border-[#1F2937] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-400" />
                <div>
                  <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
                    Emisión de Guía de Remisión Electrónica (GRE-Transportista)
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Estándar SUNAT UBL 2.1 (Tipo 31) con firma digital y constancia CDR
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
            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[82vh] overflow-y-auto text-xs">
              {/* Selector de Orden */}
              <div className="p-3 bg-[#0B1220] rounded-lg border border-[#1F2937]">
                <label className="block text-slate-300 font-medium mb-1">
                  Vincular a Orden de Servicio (Viaje) *
                </label>
                <select
                  required
                  value={ordenId}
                  onChange={(e) => handleSelectOrden(e.target.value)}
                  className="w-full h-9 bg-[#111827] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                >
                  <option value="">-- Seleccionar Orden de Servicio --</option>
                  {ordenesDisponibles.map((ord) => (
                    <option key={ord.id} value={ord.id}>
                      {ord.codigoViaje} · {ord.cliente?.razonSocial} · {ord.unidad?.placa} ({ord.descripcionCarga})
                    </option>
                  ))}
                </select>
              </div>

              {/* Parámetros SUNAT: Serie y Fechas */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Serie SUNAT *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.serie}
                    onChange={(e) => setFormData({ ...formData, serie: e.target.value.toUpperCase() })}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-500">V001 (Transportista)</span>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Fecha Emisión *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fechaEmision}
                    onChange={(e) => setFormData({ ...formData, fechaEmision: e.target.value })}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Fecha Inicio Traslado *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fechaInicioTraslado}
                    onChange={(e) => setFormData({ ...formData, fechaInicioTraslado: e.target.value })}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white"
                  />
                </div>
              </div>

              {/* Remitente Dador de Carga */}
              <div className="p-3 bg-[#0B1220] rounded-lg border border-[#1F2937] space-y-2">
                <span className="font-semibold text-amber-400 block">
                  1. Dador de Carga / Pagador del Flete (Remitente)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-0.5">RUC Remitente *</label>
                    <input
                      type="text"
                      required
                      value={formData.remitenteRuc}
                      onChange={(e) => setFormData({ ...formData, remitenteRuc: e.target.value })}
                      className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2 text-white font-mono"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-slate-400 mb-0.5">Razón Social *</label>
                    <input
                      type="text"
                      required
                      value={formData.remitenteRazonSocial}
                      onChange={(e) => setFormData({ ...formData, remitenteRazonSocial: e.target.value })}
                      className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Destinatario */}
              <div className="p-3 bg-[#0B1220] rounded-lg border border-[#1F2937] space-y-2">
                <span className="font-semibold text-emerald-400 block">
                  2. Destinatario de la Carga en Destino
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-0.5">RUC / Doc *</label>
                    <input
                      type="text"
                      required
                      value={formData.destinatarioNumDoc}
                      onChange={(e) => setFormData({ ...formData, destinatarioNumDoc: e.target.value })}
                      className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2 text-white font-mono"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-slate-400 mb-0.5">Razón Social / Receptor *</label>
                    <input
                      type="text"
                      required
                      value={formData.destinatarioRazonSocial}
                      onChange={(e) => setFormData({ ...formData, destinatarioRazonSocial: e.target.value })}
                      className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Ubicaciones de Partida y Llegada */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#0B1220] rounded-lg border border-[#1F2937] space-y-1.5">
                  <span className="font-medium text-slate-300 block">Punto de Partida</span>
                  <input
                    type="text"
                    required
                    placeholder="Ubigeo (6 dígitos)"
                    value={formData.partidaUbigeo}
                    onChange={(e) => setFormData({ ...formData, partidaUbigeo: e.target.value })}
                    className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2 text-white font-mono mb-1"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Dirección fiscal / terminal de partida"
                    value={formData.partidaDireccion}
                    onChange={(e) => setFormData({ ...formData, partidaDireccion: e.target.value })}
                    className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2 text-white"
                  />
                </div>

                <div className="p-3 bg-[#0B1220] rounded-lg border border-[#1F2937] space-y-1.5">
                  <span className="font-medium text-slate-300 block">Punto de Llegada</span>
                  <input
                    type="text"
                    required
                    placeholder="Ubigeo (6 dígitos)"
                    value={formData.llegadaUbigeo}
                    onChange={(e) => setFormData({ ...formData, llegadaUbigeo: e.target.value })}
                    className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2 text-white font-mono mb-1"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Dirección fiscal / mina / almacén llegada"
                    value={formData.llegadaDireccion}
                    onChange={(e) => setFormData({ ...formData, llegadaDireccion: e.target.value })}
                    className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2 text-white"
                  />
                </div>
              </div>

              {/* Vehículo y Chofer */}
              <div className="p-3 bg-[#0B1220] rounded-lg border border-[#1F2937] space-y-2">
                <span className="font-semibold text-sky-400 block">
                  3. Asignación MTC: Unidades y Conductor
                </span>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-0.5">Tracto (Placa) *</label>
                    <input
                      type="text"
                      required
                      value={formData.placaTracto}
                      onChange={(e) => setFormData({ ...formData, placaTracto: e.target.value.toUpperCase() })}
                      className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2 text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-0.5">Carreta (Placa)</label>
                    <input
                      type="text"
                      value={formData.placaSemirremolque}
                      onChange={(e) => setFormData({ ...formData, placaSemirremolque: e.target.value.toUpperCase() })}
                      className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-0.5">DNI Chofer *</label>
                    <input
                      type="text"
                      required
                      value={formData.conductorDni}
                      onChange={(e) => setFormData({ ...formData, conductorDni: e.target.value })}
                      className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-0.5">Licencia MTC *</label>
                    <input
                      type="text"
                      required
                      value={formData.conductorLicencia}
                      onChange={(e) => setFormData({ ...formData, conductorLicencia: e.target.value.toUpperCase() })}
                      className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2 text-white font-mono text-emerald-400"
                    />
                  </div>
                </div>
              </div>

              {/* Carga y Peso */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-300 font-medium mb-1">
                    Descripción de Mercancía Transportada *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.descripcionCarga}
                    onChange={(e) => setFormData({ ...formData, descripcionCarga: e.target.value })}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Peso Bruto (KGM) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.pesoBrutoTotalKg}
                    onChange={(e) => setFormData({ ...formData, pesoBrutoTotalKg: parseFloat(e.target.value) || 0 })}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono"
                  />
                </div>
              </div>

              {/* SUTRAN / SUNAT Validation Notice */}
              <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Al emitir la GRE-Transportista, el sistema genera el XML UBL 2.1 con su
                  código hash y el string de QR oficial para fiscalización en garita SUTRAN y SUNAT.
                </span>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-[#1F2937] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-9 px-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="h-9 px-5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Emitir GRE a SUNAT</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

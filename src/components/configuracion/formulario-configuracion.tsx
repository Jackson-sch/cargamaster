"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Bell,
  Gauge,
  FileText,
  Save,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Landmark,
  Radio,
  Sliders,
  AlertTriangle,
  Phone,
  Mail,
  Receipt,
  FileSpreadsheet,
} from "lucide-react";
import { actualizarConfiguracionEmpresaAction } from "@/lib/actions/configuracion";
import { toast } from "sonner";
import { ModalNuevaSede } from "./modal-nueva-sede";
import { ModalEditarSede } from "./modal-editar-sede";

interface SedeItem {
  id: string;
  nombre: string;
  codigoSunat: string | null;
  direccion: string;
  departamento: string;
  provincia: string;
  distrito: string;
  ubigeo: string;
  telefono: string | null;
  esPrincipal: boolean;
}

interface EmpresaData {
  id: string;
  ruc: string;
  razonSocial: string;
  nombreComercial: string | null;
  direccionFiscal: string;
  telefono: string | null;
  email: string | null;
  configAlertasDias: number[];
  sedes?: SedeItem[];
}

interface ParametrosSutranSunat {
  cuentaBancoNacionDetracciones: string;
  codigoServicioDetraccion: string;
  porcentajeDetraccion: number;
  limiteVelocidadSutranKmH: number;
  serieGuiaPredeterminada: string;
  serieFacturaPredeterminada: string;
}

interface FormularioConfiguracionProps {
  empresa: EmpresaData;
  parametros: ParametrosSutranSunat;
}

export function FormularioConfiguracion({
  empresa,
  parametros,
}: FormularioConfiguracionProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form states
  const [razonSocial, setRazonSocial] = useState(empresa.razonSocial);
  const [nombreComercial, setNombreComercial] = useState(empresa.nombreComercial || "");
  const [direccionFiscal, setDireccionFiscal] = useState(empresa.direccionFiscal);
  const [telefono, setTelefono] = useState(empresa.telefono || "");
  const [email, setEmail] = useState(empresa.email || "");

  // SPOT Detracciones & SUTRAN
  const [cuentaBancoNacion, setCuentaBancoNacion] = useState(
    parametros.cuentaBancoNacionDetracciones
  );
  const [limiteVelocidad, setLimiteVelocidad] = useState(
    parametros.limiteVelocidadSutranKmH
  );
  const [serieGuia, setSerieGuia] = useState(parametros.serieGuiaPredeterminada);
  const [serieFactura, setSerieFactura] = useState(parametros.serieFacturaPredeterminada);

  // Umbrales de alerta
  const [diasAlerta1, setDiasAlerta1] = useState(empresa.configAlertasDias?.[0] || 30);
  const [diasAlerta2, setDiasAlerta2] = useState(empresa.configAlertasDias?.[1] || 15);
  const [diasAlertaCritica, setDiasAlertaCritica] = useState(
    empresa.configAlertasDias?.[2] || 7
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await actualizarConfiguracionEmpresaAction({
        razonSocial,
        nombreComercial,
        direccionFiscal,
        telefono,
        email,
        cuentaBancoNacionDetracciones: cuentaBancoNacion,
        limiteVelocidadSutranKmH: limiteVelocidad,
        serieGuiaPredeterminada: serieGuia,
        serieFacturaPredeterminada: serieFactura,
        configAlertasDias: [diasAlerta1, diasAlerta2, diasAlertaCritica, 0],
      });

      if (res.success) {
        toast.success(res.message || "Configuración guardada exitosamente.");
        router.refresh();
      } else {
        toast.error(res.error || "No se pudo guardar la configuración.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* BENTO GRID PRINCIPAL (12 Columnas) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* ================================================================= */}
        {/* BENTO 1: DATOS FISCALES DE LA EMPRESA (8 Cols)                     */}
        {/* ================================================================= */}
        <div className="md:col-span-12 lg:col-span-8 bg-[#111827] border border-[#1F2937] hover:border-slate-700/80 rounded-2xl p-6 transition-all shadow-xl flex flex-col justify-between relative overflow-hidden group">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 group-hover:bg-amber-500/10 transition-all duration-500" />

          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#1F2937] mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white font-[family-name:var(--font-sora)]">
                    Identidad Fiscal de la Empresa
                  </h2>
                  <p className="text-xs text-slate-400">
                    Datos declarados ante SUNAT, Ministerio de Transportes (MTC) y contratos de flete
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                RUC ACTIVO Y HABIDO
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1.5 font-medium">RUC (Registro Único)</label>
                <input
                  type="text"
                  value={empresa.ruc}
                  disabled
                  className="w-full h-10 bg-[#0B1220] border border-[#1F2937] rounded-xl px-3.5 text-slate-400 font-mono font-bold cursor-not-allowed select-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 mb-1.5 font-semibold">Razón Social Oficial *</label>
                <input
                  type="text"
                  value={razonSocial}
                  onChange={(e) => setRazonSocial(e.target.value)}
                  className="w-full h-10 bg-[#0B1220] border border-[#1F2937] rounded-xl px-3.5 text-white font-medium focus:outline-none focus:border-amber-500 transition-colors"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 mb-1.5 font-semibold">Nombre Comercial / Fantasía</label>
                <input
                  type="text"
                  value={nombreComercial}
                  onChange={(e) => setNombreComercial(e.target.value)}
                  placeholder="Ej: Transandina Heavy Freight"
                  className="w-full h-10 bg-[#0B1220] border border-[#1F2937] rounded-xl px-3.5 text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-semibold">Teléfono de Despacho</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="+51 1 489-3200"
                    className="w-full h-10 bg-[#0B1220] border border-[#1F2937] rounded-xl pl-10 pr-3 text-white focus:outline-none focus:border-amber-500 transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-slate-300 mb-1.5 font-semibold">Dirección Fiscal Declarada en RUC *</label>
                <input
                  type="text"
                  value={direccionFiscal}
                  onChange={(e) => setDireccionFiscal(e.target.value)}
                  className="w-full h-10 bg-[#0B1220] border border-[#1F2937] rounded-xl px-3.5 text-white focus:outline-none focus:border-amber-500 transition-colors"
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-slate-300 mb-1.5 font-semibold">Correo Electrónico para Facturación Electrónica & Alertas</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="facturacion@transandina.pe"
                    className="w-full h-10 bg-[#0B1220] border border-[#1F2937] rounded-xl pl-10 pr-3.5 text-white focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* BENTO 2: FISCALIZACIÓN SUTRAN & LÍMITE VELOCIDAD (4 Cols)         */}
        {/* ================================================================= */}
        <div className="md:col-span-12 lg:col-span-4 bg-[#111827] border border-[#1F2937] hover:border-slate-700/80 rounded-2xl p-6 transition-all shadow-xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-sky-500/10 transition-all duration-500" />

          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#1F2937] mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                  <Gauge className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white font-[family-name:var(--font-sora)]">
                    Control SUTRAN
                  </h2>
                  <p className="text-xs text-slate-400">Reglamento Nacional (RNAT)</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20">
                DS 016-2009-MTC
              </span>
            </div>

            {/* Tacógrafo Speed Display */}
            <div className="p-4 rounded-xl bg-[#0B1220] border border-sky-500/20 text-center my-3 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Velocidad Máxima Fiscalizada
              </span>
              <div className="flex items-baseline justify-center gap-1.5">
                <span className="text-4xl font-black text-sky-400 font-mono tracking-tight">
                  {limiteVelocidad}
                </span>
                <span className="text-sm font-bold text-slate-300 font-mono">km/h</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Si un tracto supera este límite, el sistema genera automáticamente una alerta de infracción SUTRAN.
              </p>
            </div>

            {/* Presets Rápidos de Velocidad */}
            <div className="space-y-1.5 pt-2">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Presets de Operación Vial
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { vel: 90, label: "90 km/h", desc: "Estándar" },
                  { vel: 80, label: "80 km/h", desc: "MATPEL" },
                  { vel: 70, label: "70 km/h", desc: "Sierra" },
                ].map((p) => (
                  <button
                    key={p.vel}
                    type="button"
                    onClick={() => setLimiteVelocidad(p.vel)}
                    className={`py-2 px-2 rounded-lg border text-center transition-all ${
                      limiteVelocidad === p.vel
                        ? "bg-sky-500/20 border-sky-500 text-sky-300 font-bold"
                        : "bg-[#0B1220] border-[#1F2937] text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span className="block text-xs font-mono">{p.label}</span>
                    <span className="text-[9px] text-slate-500">{p.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1F2937] flex items-center justify-between text-xs">
            <span className="text-slate-400">Ajuste manual:</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={50}
                max={120}
                value={limiteVelocidad}
                onChange={(e) => setLimiteVelocidad(parseInt(e.target.value, 10) || 90)}
                className="w-16 h-8 bg-[#0B1220] border border-sky-500/40 rounded-lg px-2 text-sky-400 font-mono font-bold text-center text-xs focus:outline-none"
              />
              <span className="text-slate-400 font-mono">km/h</span>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* BENTO 3: SISTEMA SPOT 4% BANCO DE LA NACIÓN & SUNAT (6 Cols)      */}
        {/* ================================================================= */}
        <div className="md:col-span-12 lg:col-span-6 bg-[#111827] border border-[#1F2937] hover:border-slate-700/80 rounded-2xl p-6 transition-all shadow-xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-500" />

          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#1F2937] mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Landmark className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white font-[family-name:var(--font-sora)]">
                    Sistema SPOT SUNAT (Detracción 4%)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Cta. Corriente Banco de la Nación & Parámetros UBL 2.1
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                D.L. 940 (4.00%)
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-[#0B1220] rounded-xl border border-emerald-500/20 space-y-2">
                <label className="block text-slate-300 font-semibold">
                  N° Cuenta Corriente Banco de la Nación (Detracciones) *
                </label>
                <div className="relative">
                  <Landmark className="absolute left-3.5 top-2.5 h-4 w-4 text-emerald-500" />
                  <input
                    type="text"
                    value={cuentaBancoNacion}
                    onChange={(e) => setCuentaBancoNacion(e.target.value)}
                    placeholder="00-018-294819"
                    className="w-full h-10 bg-slate-900 border border-emerald-500/40 rounded-xl pl-10 pr-3 text-emerald-300 font-mono font-bold text-sm focus:outline-none focus:border-emerald-400 transition-colors"
                    required
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Código de Servicio SUNAT: <strong className="text-slate-200">027 (Transporte)</strong></span>
                  <span>Tasa Fija: <strong className="text-emerald-400">4.00% (&gt; S/ 400)</strong></span>
                </div>
              </div>

              {/* Series Predeterminadas */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#0B1220] rounded-xl border border-[#1F2937]">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Serie GRE Transportista
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="text"
                      maxLength={4}
                      value={serieGuia}
                      onChange={(e) => setSerieGuia(e.target.value.toUpperCase())}
                      className="w-full h-9 bg-slate-900 border border-[#1F2937] rounded-lg pl-8 pr-2 text-white font-mono font-bold text-center uppercase focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Tipo 31 (Remisión)</span>
                </div>

                <div className="p-3 bg-[#0B1220] rounded-xl border border-[#1F2937]">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Serie Factura Flete
                  </label>
                  <div className="relative">
                    <Receipt className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="text"
                      maxLength={4}
                      value={serieFactura}
                      onChange={(e) => setSerieFactura(e.target.value.toUpperCase())}
                      className="w-full h-9 bg-slate-900 border border-[#1F2937] rounded-lg pl-8 pr-2 text-white font-mono font-bold text-center uppercase focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Tipo 01 (Factura UBL)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* BENTO 4: SEMÁFORO DE ALERTAS MTC & DESPACHO (6 Cols)              */}
        {/* ================================================================= */}
        <div className="md:col-span-12 lg:col-span-6 bg-[#111827] border border-[#1F2937] hover:border-slate-700/80 rounded-2xl p-6 transition-all shadow-xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/10 transition-all duration-500" />

          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#1F2937] mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white font-[family-name:var(--font-sora)]">
                    Semáforo de Alertas Preventivas
                  </h2>
                  <p className="text-xs text-slate-400">
                    Control de vencimiento de SOAT, CITV y Licencias MTC
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20">
                BLOQUEO DESPACHO
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Configura los días de anticipación con los que el despachador y el jefe de flota recibirán notificaciones antes del bloqueo automático de viajes:
            </p>

            {/* 3 Traffic Light Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Alerta Informativa */}
              <div className="p-3.5 bg-[#0B1220] border border-slate-700 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Alerta 1
                  </span>
                  <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <input
                    type="number"
                    value={diasAlerta1}
                    onChange={(e) => setDiasAlerta1(parseInt(e.target.value, 10) || 30)}
                    className="w-16 h-8 bg-slate-900 border border-slate-700 rounded-lg px-2 text-white font-mono font-bold text-sm text-center focus:outline-none focus:border-sky-400"
                  />
                  <span className="text-slate-400 text-xs">días</span>
                </div>
                <span className="text-[10px] text-slate-500 block">Aviso en Dashboard</span>
              </div>

              {/* Alerta Advertencia */}
              <div className="p-3.5 bg-[#0B1220] border border-amber-500/40 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    Alerta 2
                  </span>
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <input
                    type="number"
                    value={diasAlerta2}
                    onChange={(e) => setDiasAlerta2(parseInt(e.target.value, 10) || 15)}
                    className="w-16 h-8 bg-slate-900 border border-amber-500/50 rounded-lg px-2 text-amber-400 font-mono font-bold text-sm text-center focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-slate-400 text-xs">días</span>
                </div>
                <span className="text-[10px] text-amber-400/80 block">Trámite de renovación</span>
              </div>

              {/* Alerta Crítica */}
              <div className="p-3.5 bg-[#0B1220] border border-rose-500/40 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                    Crítica
                  </span>
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <input
                    type="number"
                    value={diasAlertaCritica}
                    onChange={(e) => setDiasAlertaCritica(parseInt(e.target.value, 10) || 7)}
                    className="w-16 h-8 bg-slate-900 border border-rose-500/50 rounded-lg px-2 text-rose-400 font-mono font-bold text-sm text-center focus:outline-none focus:border-rose-400"
                  />
                  <span className="text-slate-400 text-xs">días</span>
                </div>
                <span className="text-[10px] text-rose-400/80 block">Bloqueo de salida</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* BENTO 5: TERMINALES & PATIOS OPERATIVOS REGISTRADOS (12 Cols)      */}
        {/* ================================================================= */}
        <div className="md:col-span-12 bg-[#111827] border border-[#1F2937] hover:border-slate-700/80 rounded-2xl p-6 transition-all shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1F2937] mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white font-[family-name:var(--font-sora)]">
                  Terminales, Patios de Maniobras & Talleres
                </h2>
                <p className="text-xs text-slate-400">
                  Bases operativas declaradas con código anexo SUNAT para inicio y fin de traslados
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                {(empresa.sedes?.length || 0)} BASES ACTIVAS
              </span>
              <ModalNuevaSede />
            </div>
          </div>

          {(!empresa.sedes || empresa.sedes.length === 0) ? (
            <div className="text-center py-10 px-4 rounded-xl bg-[#0B1220]/60 border border-dashed border-[#1F2937]">
              <MapPin className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No hay sedes operativas registradas</p>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Registra tu terminal principal o patios de maniobras para vincularlos a tus Guías de Remisión Electrónicas (GRE).
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {empresa.sedes.map((sede) => (
                <div
                  key={sede.id}
                  className="p-4 rounded-xl bg-[#0B1220] border border-[#1F2937] hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">{sede.nombre}</span>
                        {sede.esPrincipal && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            Base Principal
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        {sede.direccion}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        {sede.distrito}, {sede.provincia}, {sede.departamento} (Ubigeo: <strong className="text-amber-400">{sede.ubigeo}</strong>)
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {sede.codigoSunat && (
                        <span className="px-2 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[10px] font-bold">
                          SUNAT: {sede.codigoSunat}
                        </span>
                      )}
                      <ModalEditarSede sede={sede} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3 w-3 text-slate-500" />
                      {sede.telefono || "Sin teléfono registrado"}
                    </span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Habilitado MTC
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* BARRA FLOTANTE DE GUARDADO Y ACCIÓN                               */}
      {/* ================================================================= */}
      <div className="bg-[#111827]/90 backdrop-blur-md border border-[#1F2937] p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl sticky bottom-4 z-20">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            Los cambios se aplicarán inmediatamente a las emisiones SUNAT, alertas MTC y cálculo de fletes.
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => router.refresh()}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Descartar Cambios
          </button>

          <button
            type="submit"
            disabled={loading}
            className="h-10 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Guardando cambios...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Guardar Parámetros y Configuración</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

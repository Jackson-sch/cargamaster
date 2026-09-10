import Link from "next/link";
import {
  ExternalLink,
  MapPin,
  FileCheck2,
  ReceiptText,
  Fuel,
  Clock,
} from "lucide-react";
import { ModalDocumentosViaje } from "@/components/despacho/modal-documentos-viaje";

interface ViajeMonitoreoCardProps {
  viajeActivo: any;
  velocidadActual: string | number;
  ubicacionActual: string;
}

export function ViajeMonitoreoCard({
  viajeActivo,
  velocidadActual,
  ubicacionActual,
}: ViajeMonitoreoCardProps) {
  if (!viajeActivo) return null;

  const greVinculada = viajeActivo.guias?.[0];

  return (
    <div className="lg:col-span-2 bg-[#111827] border border-[#1F2937] rounded-xl p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className={`h-3 w-3 rounded-full ${
                viajeActivo.estado === "en_ruta"
                  ? "bg-emerald-400 animate-ping"
                  : "bg-amber-400"
              }`}
            />
            <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
              Viaje en Monitoreo: {viajeActivo.codigoViaje}
            </h2>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold uppercase border ${
                viajeActivo.estado === "en_ruta"
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : "bg-amber-500/15 text-amber-400 border-amber-500/30"
              }`}
            >
              {viajeActivo.estado.replace("_", " ")}
            </span>
          </div>
          <Link
            href="/tracking"
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
          >
            Abrir Mapa GPS <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        {/* Trip Details Bar */}
        <div className="bg-[#0B1220] border border-[#1F2937] rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block">Tracto / Placa</span>
              <span className="font-bold text-white font-mono text-sm">
                {viajeActivo.unidad?.placa || "V7A-890"}
              </span>
              <span className="text-slate-400 text-[11px] block">
                {viajeActivo.unidad?.marca} {viajeActivo.unidad?.modelo}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Semirremolque</span>
              <span className="font-bold text-white font-mono text-sm">
                {viajeActivo.semirremolque?.placa || "Z1A-987"}
              </span>
              <span className="text-slate-400 text-[11px] block capitalize">
                {viajeActivo.semirremolque?.tipoCarroceria || "Plataforma"}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Conductor Asignado</span>
              <span className="font-semibold text-slate-200 block truncate">
                {viajeActivo.conductor
                  ? `${viajeActivo.conductor.nombres} ${viajeActivo.conductor.apellidos}`
                  : "Carlos Mendoza"}
              </span>
              <span className="text-emerald-400 text-[11px] font-mono">
                Lic. {viajeActivo.conductor?.licencias?.[0]?.categoria || "A-IIIc"}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Cliente Dador</span>
              <span className="font-semibold text-slate-200 block truncate">
                {viajeActivo.cliente?.razonSocial || "Corporación Aceros Arequipa"}
              </span>
              <span className="text-slate-400 text-[11px] font-mono">
                RUC {viajeActivo.cliente?.numeroDocumento}
              </span>
            </div>
          </div>

          {/* Route Progress Visual Bar */}
          <div className="mt-4 pt-4 border-t border-[#1F2937]">
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-1 text-slate-300">
                <MapPin className="h-3.5 w-3.5 text-amber-400" />
                <span className="font-medium">
                  {viajeActivo.ruta?.origenDistrito || "Callao Puerto"}
                </span>
              </div>
              <span className="text-amber-400 font-mono font-semibold">
                {viajeActivo.ruta?.distanciaEstimadaKm || 1015} KM
              </span>
              <div className="flex items-center gap-1 text-slate-300">
                <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-medium">
                  {viajeActivo.ruta?.destinoDistrito || "Arequipa"}
                </span>
              </div>
            </div>

            {/* Progress Track */}
            <div className="h-2 w-full bg-[#111827] rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
                style={{
                  width: viajeActivo.estado === "en_ruta" ? "65%" : "25%",
                }}
              />
            </div>

            <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
              <span>Ubicación: {ubicacionActual}</span>
              <span className="font-mono text-emerald-400 font-medium">
                Velocidad: {velocidadActual} km/h (Límite SUTRAN 90)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions for Active Trip */}
      <div className="flex flex-wrap items-center gap-2 text-xs pt-2">
        <ModalDocumentosViaje
          ordenId={viajeActivo.id}
          codigoViaje={viajeActivo.codigoViaje}
          placaTracto={viajeActivo.unidad?.placa}
          placaCarreta={viajeActivo.semirremolque?.placa}
          conductorNombre={
            viajeActivo.conductor
              ? `${viajeActivo.conductor.nombres} ${viajeActivo.conductor.apellidos}`
              : null
          }
          rutaNombre={viajeActivo.ruta?.nombre}
        />

        {greVinculada ? (
          <Link
            href="/facturacion"
            className="px-3 py-2 rounded-md bg-[#0B1220] border border-[#1F2937] hover:border-slate-600 text-slate-200 font-medium flex items-center gap-1.5 transition-colors"
          >
            <FileCheck2 className="h-3.5 w-3.5 text-amber-400" />
            <span>
              GRE: {greVinculada.serie}-{String(greVinculada.numeroCorrelativo).padStart(6, "0")}
            </span>
          </Link>
        ) : (
          <Link
            href="/facturacion"
            className="px-3 py-2 rounded-md bg-[#0B1220] border border-[#1F2937] hover:border-slate-600 text-slate-300 font-medium flex items-center gap-1.5 transition-colors"
          >
            <ReceiptText className="h-3.5 w-3.5 text-slate-400" />
            <span>Emitir GRE / Factura</span>
          </Link>
        )}

        <Link
          href="/combustible"
          className="px-3 py-2 rounded-md bg-[#0B1220] border border-[#1F2937] hover:border-slate-600 text-slate-200 font-medium flex items-center gap-1.5 transition-colors"
        >
          <Fuel className="h-3.5 w-3.5 text-sky-400" />
          <span>Control Diesel B5</span>
        </Link>

        <div className="px-3 py-2 rounded-md bg-[#0B1220] border border-[#1F2937] text-slate-300 font-medium flex items-center gap-1.5 ml-auto">
          <Clock className="h-3.5 w-3.5 text-emerald-400" />
          <span>Carga: {viajeActivo.descripcionCarga}</span>
        </div>
      </div>
    </div>
  );
}

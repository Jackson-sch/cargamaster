"use client";

import { useState } from "react";
import {
  FileText,
  X,
  Printer,
  ExternalLink,
  Download,
  ShieldCheck,
  Scale,
  FileCheck2,
  Truck,
  UserCheck,
  MapPin,
} from "lucide-react";

interface ModalDocumentosViajeProps {
  ordenId: string;
  codigoViaje: string;
  placaTracto?: string | null;
  placaCarreta?: string | null;
  conductorNombre?: string | null;
  rutaNombre?: string | null;
}

export function ModalDocumentosViaje({
  ordenId,
  codigoViaje,
  placaTracto,
  placaCarreta,
  conductorNombre,
  rutaNombre,
}: ModalDocumentosViajeProps) {
  const [open, setOpen] = useState(false);

  const documentos = [
    {
      id: "hoja-de-ruta",
      titulo: "Hoja de Ruta MTC",
      normativa: "D.S. 017-2009-MTC (RNAT Art. 81)",
      badge: "OBLIGATORIO SUTRAN",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      icon: FileCheck2,
      descripcion:
        "Documento de porte reglamentario en carretera. Acredita vigencia de SOAT, CITV de tracto y carreta, licencia profesional A-IIIc e itinerario de viaje con código QR.",
      url: `/api/ordenes/${ordenId}/hoja-de-ruta`,
      filename: `Hoja-de-Ruta-${codigoViaje}.pdf`,
    },
    {
      id: "manifiesto",
      titulo: "Manifiesto de Carga Terrestre",
      normativa: "D.S. 058-2003-MTC (Pesos y Medidas)",
      badge: "CONTROL BALANZAS",
      badgeColor: "bg-sky-500/10 text-sky-400 border-sky-500/30",
      icon: Scale,
      descripcion:
        "Declaración jurada de carga transportada, peso tara, peso neto y peso bruto combinado (PBTC) para fiscalización en estaciones de pesaje fijas y dinámicas.",
      url: `/api/ordenes/${ordenId}/manifiesto`,
      filename: `Manifiesto-Carga-${codigoViaje}.pdf`,
    },
    {
      id: "carta-de-porte",
      titulo: "Carta de Porte Terrestre",
      normativa: "Código de Comercio Art. 823 & D.L. 940",
      badge: "CONTRATO & SPOT 4%",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      icon: ShieldCheck,
      descripcion:
        "Contrato mercantil de transporte entre la empresa y el dador de carga. Detalla el flete pactado, retención de detracción SPOT (Banco de la Nación 027) y cláusulas de responsabilidad.",
      url: `/api/ordenes/${ordenId}/carta-de-porte`,
      filename: `Carta-de-Porte-${codigoViaje}.pdf`,
    },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-8 px-2.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        title="Documentos Oficiales en PDF (MTC, SUTRAN, Carta de Porte)"
      >
        <FileText className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Docs MTC</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#111827] border border-[#1F2937] rounded-2xl shadow-2xl overflow-hidden text-left flex flex-col my-8">
            {/* Header */}
            <div className="p-4 bg-[#0B1220] border-b border-[#1F2937] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
                      Documentación Oficial de Despacho
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      {codigoViaje}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Formatos reglamentarios para fiscalización SUTRAN, Policía de Carreteras y respaldo contractual
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Metadatos Rápidos del Viaje */}
            <div className="px-5 py-3 bg-[#0E1524] border-b border-[#1F2937] text-xs grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300">
              <div className="flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span className="truncate">
                  {placaTracto || "V7A-890"} / {placaCarreta || "Z1A-987"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                <span className="truncate">
                  {conductorNombre || "Carlos Mendoza"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:col-span-2">
                <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">
                  {rutaNombre || "Lima - Arequipa (Panamericana Sur)"}
                </span>
              </div>
            </div>

            {/* Lista de Documentos */}
            <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
              {documentos.map((doc) => {
                const Icon = doc.icon;
                return (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl bg-[#0B1220] border border-[#1F2937] hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 shrink-0 mt-0.5">
                        <Icon className="h-5 w-5 text-amber-400" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-white text-sm">{doc.titulo}</h4>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${doc.badgeColor}`}
                          >
                            {doc.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono">
                          Normativa: {doc.normativa}
                        </p>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {doc.descripcion}
                        </p>
                      </div>
                    </div>

                    {/* Acciones de Visualización y Descarga */}
                    <div className="flex items-center gap-2 shrink-0 sm:self-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-8 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        <span>Abrir / Imprimir</span>
                      </a>
                      <a
                        href={doc.url}
                        download={doc.filename}
                        className="h-8 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors"
                        title="Descargar archivo PDF"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 bg-[#0B1220] border-t border-[#1F2937] flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1 text-[11px]">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Documentos generados con firma electrónica y código QR para control en carretera
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

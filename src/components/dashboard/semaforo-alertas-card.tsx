import Link from "next/link";
import { ShieldCheck, AlertTriangle, ChevronRight } from "lucide-react";

interface DocumentoAlertaItem {
  id: string;
  tipoDocumento: string;
  entidadNombre: string;
  diasRestantes: number;
  fechaVencimiento: string;
  numeroDocumento: string;
  estadoAlertaCalculado: string;
}

interface SemaforoAlertasCardProps {
  documentos: DocumentoAlertaItem[];
}

export function SemaforoAlertasCard({ documentos }: SemaforoAlertasCardProps) {
  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
              Semáforo Regulatorio
            </h3>
          </div>
          <span className="text-[10px] uppercase font-bold text-slate-400 bg-[#0B1220] px-2 py-0.5 rounded border border-[#1F2937]">
            MTC / SUTRAN
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-3">
          Alertas preventivas de documentos vehiculares y licencias de conducir:
        </p>

        <div className="space-y-3">
          {documentos.length === 0 ? (
            <div className="p-4 rounded-lg bg-[#0B1220] border border-[#1F2937] text-center text-xs text-slate-500">
              Toda la documentación vehicular se encuentra al día.
            </div>
          ) : (
            documentos.slice(0, 3).map((doc) => (
              <div
                key={doc.id}
                className="p-3 rounded-lg bg-[#0B1220] border border-[#1F2937]"
              >
                <div className="flex items-start gap-2.5">
                  <AlertTriangle
                    className={`h-4 w-4 shrink-0 mt-0.5 ${
                      doc.estadoAlertaCalculado === "vencido"
                        ? "text-rose-400"
                        : "text-amber-400"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200 capitalize truncate">
                        {doc.tipoDocumento.replace(/_/g, " ")}: {doc.entidadNombre}
                      </span>
                      <span
                        className={`text-[10px] font-bold font-mono shrink-0 ml-1 ${
                          doc.estadoAlertaCalculado === "vencido"
                            ? "text-rose-400"
                            : "text-amber-400"
                        }`}
                      >
                        {doc.diasRestantes <= 0
                          ? "VENCIDO"
                          : `${doc.diasRestantes} DÍAS`}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Doc N° {doc.numeroDocumento} vence el {doc.fechaVencimiento}.
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#1F2937]">
        <Link
          href="/documentos"
          className="w-full py-2 px-3 rounded-md bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          Auditar Vencimientos MTC <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

import { LayoutShell } from "@/components/layout-shell";
import { FileCheck2, AlertTriangle, ShieldCheck, CheckCircle2 } from "lucide-react";
import { obtenerDocumentosYAlertas } from "@/lib/actions/documentos";
import { ModalNuevoDocumento } from "@/components/documentos/modal-nuevo-documento";

export const dynamic = "force-dynamic";

export default async function DocumentosPage() {
  const { documentos, unidades, semirremolques } = await obtenerDocumentosYAlertas();

  const proximosAVencer = documentos.filter(
    (d) => d.estadoAlertaCalculado === "por_vencer"
  ).length;
  const vencidos = documentos.filter(
    (d) => d.estadoAlertaCalculado === "vencido"
  ).length;

  return (
    <LayoutShell
      title="Vencimientos & Auditoría Regulatoria MTC / SUTRAN"
      subtitle="Monitoreo de vigencia de SOAT, Revisiones Técnicas, Licencias A-III y Permisos de Operación"
    >
      <div className="space-y-6">
        {/* Banner with Alert Summary */}
        <div className="bg-[#111827] border border-amber-500/30 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
                Semáforo de Bloqueo Automático de Despacho
              </h2>
              <p className="text-xs text-slate-400">
                El sistema prohíbe la asignación de viajes si la unidad o el conductor
                cuenta con documentos vencidos ante MTC/SUTRAN.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="px-3 py-1.5 rounded bg-[#0B1220] border border-amber-500/30 text-amber-400 font-bold">
              {proximosAVencer} Próximos a Vencer (&lt; 30 días)
            </span>
            <span className="px-3 py-1.5 rounded bg-[#0B1220] border border-rose-500/30 text-rose-400 font-bold">
              {vencidos} Vencidos
            </span>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex justify-end">
          <ModalNuevoDocumento
            unidades={unidades}
            semirremolques={semirremolques}
          />
        </div>

        {/* Audit Table */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#1F2937] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
                Documentos Vehiculares & Pólizas de Carga
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              {documentos.length} documentos auditados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#0B1220] text-slate-400 uppercase tracking-wider text-[10px] border-b border-[#1F2937]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Tipo de Obligación</th>
                  <th className="px-4 py-3 font-semibold">Unidad / Carreta</th>
                  <th className="px-4 py-3 font-semibold">N° de Documento</th>
                  <th className="px-4 py-3 font-semibold">Emisor</th>
                  <th className="px-4 py-3 font-semibold">Fecha Vencimiento</th>
                  <th className="px-4 py-3 font-semibold">Días Restantes</th>
                  <th className="px-4 py-3 font-semibold">Estado Semáforo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937]">
                {documentos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-500">
                      No hay documentos vehiculares registrados.
                    </td>
                  </tr>
                ) : (
                  documentos.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-white capitalize">
                        {doc.tipoDocumento.replace(/_/g, " ")}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-200 font-bold">
                        {doc.entidadNombre}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-400">
                        {doc.numeroDocumento}
                      </td>
                      <td className="px-4 py-3.5 text-slate-300">
                        {doc.empresaEmisora || "—"}
                      </td>
                      <td className="px-4 py-3.5 text-slate-200">
                        {doc.fechaVencimiento}
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold">
                        {doc.diasRestantes <= 0 ? (
                          <span className="text-rose-400 font-bold">
                            {Math.abs(doc.diasRestantes)} días vencido
                          </span>
                        ) : doc.diasRestantes <= 30 ? (
                          <span className="text-amber-400 font-bold">
                            {doc.diasRestantes} días
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            {doc.diasRestantes} días
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {doc.estadoAlertaCalculado === "vencido" ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            Vencido
                          </span>
                        ) : doc.estadoAlertaCalculado === "por_vencer" ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            Por Vencer
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Vigente
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}

import { LayoutShell } from "@/components/layout-shell";
import { AlertTriangle } from "lucide-react";
import { obtenerDocumentosYAlertas } from "@/lib/actions/documentos";
import { ModalNuevoDocumento } from "@/components/documentos/modal-nuevo-documento";
import { TablaDocumentos } from "@/components/documentos/tabla-documentos";

export const dynamic = "force-dynamic";

export default async function DocumentosPage() {
  const { documentos = [], unidades = [], semirremolques = [] } = await obtenerDocumentosYAlertas();

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

        {/* Audit Table with Search, Filter Tabs, Renewal and Deletion */}
        <TablaDocumentos documentos={documentos as any} />
      </div>
    </LayoutShell>
  );
}

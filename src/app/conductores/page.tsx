import { LayoutShell } from "@/components/layout-shell";
import { obtenerConductoresCompletos } from "@/lib/actions/conductores";
import { ModalNuevoConductor } from "@/components/conductores/modal-nuevo-conductor";
import { GridConductores } from "@/components/conductores/grid-conductores";

export const dynamic = "force-dynamic";

export default async function ConductoresPage() {
  const { conductores } = await obtenerConductoresCompletos();

  return (
    <LayoutShell
      title="Padrón de Conductores & Licencias MTC"
      subtitle="Registro de choferes profesionales, categorías A-III, récord de puntos SUTRAN y certificaciones MATPEL"
    >
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111827]/40 border border-[#1F2937] p-3 rounded-xl">
          <div className="text-xs text-slate-400">
            <span className="font-semibold text-white">{conductores.length}</span> conductores profesionales registrados
          </div>

          <div className="flex items-center gap-2">
            <ModalNuevoConductor />
          </div>
        </div>

        {/* Conductores Modular Grid with Full CRUD & MTC Compliance */}
        <GridConductores conductores={conductores} />
      </div>
    </LayoutShell>
  );
}

import { LayoutShell } from "@/components/layout-shell";
import { obtenerFlotaCompleta } from "@/lib/actions/flota";
import { ModalNuevaUnidad } from "@/components/flota/modal-nueva-unidad";
import { ModalNuevoSemirremolque } from "@/components/flota/modal-nuevo-semirremolque";
import { ModalAcoplamiento } from "@/components/flota/modal-acoplamiento";
import { TablaUnidades } from "@/components/flota/tabla-unidades";
import { TablaSemirremolques } from "@/components/flota/tabla-semirremolques";

export const dynamic = "force-dynamic";

export default async function FlotaPage() {
  const { unidades, semirremolques, documentos } = await obtenerFlotaCompleta();

  return (
    <LayoutShell
      title="Gestión de Flota Pesada & Semirremolques"
      subtitle="Padrón técnico vehicular, configuración por ejes MTC, ciclo de vida y acoplamiento dinámico"
    >
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111827]/40 border border-[#1F2937] p-3 rounded-xl">
          <div className="text-xs text-slate-400">
            <span className="font-semibold text-white">{unidades.length}</span> tractos y rígidos ·{" "}
            <span className="font-semibold text-white">{semirremolques.length}</span> semirremolques
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ModalAcoplamiento
              unidades={unidades.map((u) => ({
                id: u.id,
                placa: u.placa,
                marca: u.marca,
                modelo: u.modelo,
              }))}
              semirremolques={semirremolques.map((s) => ({
                id: s.id,
                placa: s.placa,
                tipoCarroceria: s.tipoCarroceria,
                estado: s.estado,
              }))}
            />
            <ModalNuevoSemirremolque />
            <ModalNuevaUnidad />
          </div>
        </div>

        {/* Section 1: Tracto-Camiones con CRUD completo y ciclo de vida */}
        <TablaUnidades
          unidades={unidades}
          semirremolques={semirremolques.map((s) => ({
            id: s.id,
            placa: s.placa,
            tipoCarroceria: s.tipoCarroceria,
          }))}
          documentos={documentos.map((d) => ({
            id: d.id,
            entidadTipo: d.entidadTipo,
            entidadId: d.entidadId,
            estadoAlerta: d.estadoAlerta,
          }))}
        />

        {/* Section 2: Semirremolques con CRUD completo */}
        <TablaSemirremolques semirremolques={semirremolques} />
      </div>
    </LayoutShell>
  );
}

import { LayoutShell } from "@/components/layout-shell";
import { Truck, Search, Layers, AlertTriangle, CheckCircle2 } from "lucide-react";
import { obtenerFlotaCompleta } from "@/lib/actions/flota";
import { ModalNuevaUnidad } from "@/components/flota/modal-nueva-unidad";
import { ModalNuevoSemirremolque } from "@/components/flota/modal-nuevo-semirremolque";
import { ModalAcoplamiento } from "@/components/flota/modal-acoplamiento";

export const dynamic = "force-dynamic";

export default async function FlotaPage() {
  const { unidades, semirremolques, documentos } = await obtenerFlotaCompleta();

  // Helper para verificar alertas de documentos por unidad
  const getDocumentosInfo = (unidadId: string) => {
    const docs = documentos.filter(
      (d) => d.entidadTipo === "unidad" && d.entidadId === unidadId
    );
    const hasWarning = docs.some((d) => d.estadoAlerta === "por_vencer");
    const hasExpired = docs.some((d) => d.estadoAlerta === "vencido");

    if (hasExpired) {
      return { label: "Documento Vencido", variant: "destructive" as const };
    }
    if (hasWarning) {
      return { label: "Revisión Técnica por vencer", variant: "warning" as const };
    }
    return { label: "Vigencias al día", variant: "success" as const };
  };

  return (
    <LayoutShell
      title="Gestión de Flota Pesada & Semirremolques"
      subtitle="Padrón técnico vehicular, configuración por ejes MTC y acoplamiento dinámico"
    >
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-80">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por placa, marca o tipo..."
                className="w-full h-9 bg-[#111827] border border-[#1F2937] rounded-md pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
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

        {/* Section 1: Tracto-Camiones */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#1F2937] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
                Tracto-Camiones y Rígidos
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              {unidades.length} unidades registradas
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#0B1220] text-slate-400 uppercase tracking-wider text-[10px] border-b border-[#1F2937]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Placa MTC</th>
                  <th className="px-4 py-3 font-semibold">Marca & Modelo</th>
                  <th className="px-4 py-3 font-semibold">Año / Ejes</th>
                  <th className="px-4 py-3 font-semibold">Cap. Arrastre</th>
                  <th className="px-4 py-3 font-semibold">Odómetro Actual</th>
                  <th className="px-4 py-3 font-semibold">Semirremolque Acoplado</th>
                  <th className="px-4 py-3 font-semibold">Vigencias MTC</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937]">
                {unidades.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-500">
                      No hay tracto-camiones registrados.
                    </td>
                  </tr>
                ) : (
                  unidades.map((u) => {
                    const acopleActivo = u.acoplamientos?.[0];
                    const carreta = acopleActivo
                      ? semirremolques.find((s) => s.id === acopleActivo.semirremolqueId)
                      : null;
                    const docInfo = getDocumentosInfo(u.id);

                    return (
                      <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3.5 font-mono font-bold text-white text-sm">
                          {u.placa}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-slate-200 block">
                            {u.marca}
                          </span>
                          <span className="text-[11px] text-slate-400">{u.modelo}</span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-300">
                          {u.anioFabricacion} ·{" "}
                          <span className="font-mono">{u.ejes} ejes</span>
                        </td>
                        <td className="px-4 py-3.5 font-mono font-medium text-slate-200">
                          {u.capacidadArrastreTn || 0} Tn
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-300">
                          {u.odometroActualKm?.toLocaleString()} km
                        </td>
                        <td className="px-4 py-3.5">
                          {carreta ? (
                            <div>
                              <span className="font-mono font-bold text-amber-400">
                                {carreta.placa}
                              </span>{" "}
                              <span className="text-slate-400 text-[11px]">
                                ({carreta.tipoCarroceria})
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-500 italic">Sin acople</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          {docInfo.variant === "warning" ? (
                            <span className="text-amber-400 font-semibold flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" /> {docInfo.label}
                            </span>
                          ) : docInfo.variant === "destructive" ? (
                            <span className="text-rose-400 font-bold flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" /> {docInfo.label}
                            </span>
                          ) : (
                            <span className="text-emerald-400 flex items-center gap-1 font-medium">
                              <CheckCircle2 className="h-3 w-3" /> {docInfo.label}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          {u.estado === "en_ruta" ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              En Ruta
                            </span>
                          ) : u.estado === "mantenimiento" ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              Taller
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-blue-500/15 text-blue-400 border border-blue-500/30">
                              Disponible
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Semirremolques */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#1F2937] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
                Semirremolques y Carretas de Carga
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              {semirremolques.length} semirremolques registrados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#0B1220] text-slate-400 uppercase tracking-wider text-[10px] border-b border-[#1F2937]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Placa Carreta</th>
                  <th className="px-4 py-3 font-semibold">Tipo de Carrocería</th>
                  <th className="px-4 py-3 font-semibold">Fabricante</th>
                  <th className="px-4 py-3 font-semibold">Ejes</th>
                  <th className="px-4 py-3 font-semibold">Carga Útil Máxima</th>
                  <th className="px-4 py-3 font-semibold">Volumen (m³)</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937]">
                {semirremolques.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-500">
                      No hay semirremolques registrados.
                    </td>
                  </tr>
                ) : (
                  semirremolques.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-white text-sm">
                        {s.placa}
                      </td>
                      <td className="px-4 py-3.5 text-slate-200 font-medium capitalize">
                        {s.tipoCarroceria.replace("_", " ")}
                      </td>
                      <td className="px-4 py-3.5 text-slate-400">{s.marca || "—"}</td>
                      <td className="px-4 py-3.5 font-mono text-slate-300">
                        {s.ejes} ejes
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-200">
                        {s.cargaUtilMaxTn} Tn
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-300">
                        {s.volumenM3 ? `${s.volumenM3} m³` : "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        {s.estado === "acoplado" ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            Acoplado
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-blue-500/15 text-blue-400 border border-blue-500/30">
                            Disponible
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

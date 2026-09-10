import { LayoutShell } from "@/components/layout-shell";
import { Users, Search, Award, AlertTriangle, Phone, CheckCircle2 } from "lucide-react";
import { obtenerConductoresCompletos } from "@/lib/actions/conductores";
import { ModalNuevoConductor } from "@/components/conductores/modal-nuevo-conductor";

export const dynamic = "force-dynamic";

export default async function ConductoresPage() {
  const { conductores } = await obtenerConductoresCompletos();

  return (
    <LayoutShell
      title="Padrón de Conductores & Licencias MTC"
      subtitle="Registro de choferes profesionales, categorías A-III, récord de puntos y certificaciones MATPEL"
    >
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 sm:w-80">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por DNI, nombres o licencia..."
              className="w-full h-9 bg-[#111827] border border-[#1F2937] rounded-md pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <ModalNuevoConductor />
        </div>

        {/* Conductores Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {conductores.length === 0 ? (
            <div className="col-span-2 bg-[#111827] border border-[#1F2937] rounded-xl p-8 text-center text-slate-500 text-xs">
              No hay conductores registrados en la base de datos.
            </div>
          ) : (
            conductores.map((c) => {
              const licencia = c.licencias?.[0];
              const certs = c.certificaciones || [];

              return (
                <div
                  key={c.id}
                  className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 hover:border-slate-700 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400 text-sm">
                          {(c.nombres?.[0] || "C") + (c.apellidos?.[0] || "")}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">
                            {c.nombres} {c.apellidos}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span className="font-mono">DNI: {c.numeroDocumento}</span>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1">
                              <Phone className="h-3 w-3 text-slate-500" />
                              {c.telefono}
                            </span>
                          </div>
                        </div>
                      </div>

                      {c.estado === "en_viaje" ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          En Viaje
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-blue-500/15 text-blue-400 border border-blue-500/30">
                          Disponible
                        </span>
                      )}
                    </div>

                    {/* License Details Section */}
                    <div className="bg-[#0B1220] border border-[#1F2937] rounded-lg p-3 space-y-2 text-xs mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Licencia MTC:</span>
                        <span className="font-mono font-bold text-slate-200">
                          {licencia ? `${licencia.numeroLicencia} (${licencia.categoria})` : "Sin licencia"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Revalidación MTC:</span>
                        {licencia?.estado === "por_vencer" ? (
                          <span className="font-semibold text-amber-400 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> {licencia.fechaRevalidacion} (Por vencer)
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-medium">
                            {licencia?.fechaRevalidacion || "—"}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Récord de Puntos MTC:</span>
                        <span className="font-mono font-bold text-slate-200">
                          {licencia?.puntosAcumuladosMtc ?? 0} / 100 pts
                        </span>
                      </div>
                    </div>

                    {/* Certifications Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {certs.length === 0 ? (
                        <span className="text-[10px] text-slate-500 italic">
                          Sin certificaciones adicionales registradas
                        </span>
                      ) : (
                        certs.map((cert) => (
                          <span
                            key={cert.id}
                            className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[10px] flex items-center gap-1 font-medium capitalize"
                          >
                            <Award className="h-3 w-3 text-amber-400" />
                            {cert.tipo.replace(/_/g, " ")}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#1F2937] flex items-center justify-between text-xs text-slate-400">
                    <span>
                      {c.contactoEmergencia ? `Contacto: ${c.contactoEmergencia}` : "Sin contacto emergencia"}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      Grupo: {c.grupoSanguineo || "O+"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </LayoutShell>
  );
}

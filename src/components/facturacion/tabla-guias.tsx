import { FileText, Ban, CheckCircle2 } from "lucide-react";
import { ModalVerCpe } from "@/components/facturacion/modal-ver-cpe";
import { ModalAnularComprobante } from "@/components/facturacion/modal-anular-comprobante";

export interface GuiaItem {
  id: string;
  serie: string;
  numeroCorrelativo: number;
  fechaEmision: string;
  fechaInicioTraslado: string;
  estadoSunat: string;
  hashCpe?: string | null;
  qrCode?: string | null;
  sunatTicketId?: string | null;
  ordenServicio?: {
    codigoViaje: string;
    descripcionCarga?: string | null;
    pesoBrutoKg?: string | number | null;
    cliente?: {
      razonSocial: string;
      numeroDocumento: string;
    } | null;
    unidad?: {
      placa: string;
    } | null;
    conductor?: {
      nombres: string;
      apellidos: string;
      numeroDocumento?: string | null;
    } | null;
    ruta?: {
      origenDistrito?: string | null;
      destinoDistrito?: string | null;
    } | null;
  } | null;
}

interface TablaGuiasProps {
  guias: GuiaItem[];
}

export function TablaGuias({ guias }: TablaGuiasProps) {
  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-[#1F2937] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
            Guías de Remisión Electrónica - Transportista (SUNAT Tipo 31)
          </h2>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {guias.length} guía{guias.length === 1 ? "" : "s"}
        </span>
      </div>

      {guias.length === 0 ? (
        <div className="p-10 text-center text-slate-500">
          <FileText className="h-8 w-8 mx-auto mb-2 text-slate-600" />
          <p className="text-xs">No hay Guías de Remisión Electrónica registradas aún.</p>
          <p className="text-[11px] text-slate-600">
            Haz clic en &ldquo;Emitir GRE Transportista&rdquo; para generar la guía obligatoria de viaje.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#0B1220] text-slate-400 uppercase tracking-wider text-[10px] border-b border-[#1F2937]">
              <tr>
                <th className="px-4 py-3 font-semibold">Serie - Correlativo</th>
                <th className="px-4 py-3 font-semibold">Fecha Traslado</th>
                <th className="px-4 py-3 font-semibold">Orden de Servicio</th>
                <th className="px-4 py-3 font-semibold">Dador / Remitente</th>
                <th className="px-4 py-3 font-semibold">Tracto / Carreta</th>
                <th className="px-4 py-3 font-semibold">Conductor MTC</th>
                <th className="px-4 py-3 font-semibold">Hash CPE</th>
                <th className="px-4 py-3 font-semibold">Estado SUNAT</th>
                <th className="px-4 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]">
              {guias.map((g) => (
                <tr key={g.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3.5 font-mono font-bold text-amber-400">
                    {g.serie}-{String(g.numeroCorrelativo).padStart(8, "0")}
                  </td>

                  <td className="px-4 py-3.5 text-slate-300 font-mono">
                    {g.fechaInicioTraslado}
                  </td>

                  <td className="px-4 py-3.5 font-mono text-slate-200">
                    {g.ordenServicio?.codigoViaje}
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="font-semibold text-slate-200 block truncate max-w-[180px]">
                      {g.ordenServicio?.cliente?.razonSocial}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      RUC {g.ordenServicio?.cliente?.numeroDocumento}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 font-mono text-white font-bold">
                    {g.ordenServicio?.unidad?.placa}
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="text-slate-200 block">
                      {g.ordenServicio?.conductor?.nombres} {g.ordenServicio?.conductor?.apellidos}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 font-mono text-slate-400 text-[11px] truncate max-w-[120px]">
                    {g.hashCpe || "---"}
                  </td>

                  <td className="px-4 py-3.5">
                    {g.estadoSunat === "anulado" ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1 w-fit">
                        <Ban className="h-3 w-3" /> Anulado
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="h-3.5 w-3.5" /> {g.estadoSunat}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <ModalVerCpe
                        cpe={{
                          tipo: "gre",
                          serieCorrelativo: `${g.serie}-${String(g.numeroCorrelativo).padStart(8, "0")}`,
                          fechaEmision: g.fechaEmision,
                          clienteRuc: g.ordenServicio?.cliente?.numeroDocumento || "",
                          clienteRazonSocial: g.ordenServicio?.cliente?.razonSocial || "",
                          descripcion: g.ordenServicio?.descripcionCarga || "Carga pesada general",
                          placaTracto: g.ordenServicio?.unidad?.placa || undefined,
                          conductorNombre: g.ordenServicio?.conductor
                            ? `${g.ordenServicio.conductor.nombres} ${g.ordenServicio.conductor.apellidos}`
                            : undefined,
                          conductorDni: g.ordenServicio?.conductor?.numeroDocumento || undefined,
                          origen: g.ordenServicio?.ruta?.origenDistrito || undefined,
                          destino: g.ordenServicio?.ruta?.destinoDistrito || undefined,
                          pesoKg: g.ordenServicio?.pesoBrutoKg?.toString() || undefined,
                          hashCpe: g.hashCpe || undefined,
                          qrCode: g.qrCode || undefined,
                          estadoSunat: g.estadoSunat,
                          ticketSunat: g.sunatTicketId || undefined,
                        }}
                      />
                      <ModalAnularComprobante
                        id={g.id}
                        tipo="gre"
                        serieCorrelativo={`${g.serie}-${String(g.numeroCorrelativo).padStart(8, "0")}`}
                        clienteODador={g.ordenServicio?.cliente?.razonSocial || "Dador"}
                        montoOInfo={`Tracto: ${g.ordenServicio?.unidad?.placa || "N/A"}`}
                        yaAnulado={g.estadoSunat === "anulado"}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { LayoutShell } from "@/components/layout-shell";
import { Building2, Search, Mail, Phone, MapPin, User, FileText } from "lucide-react";
import { obtenerClientes } from "@/lib/actions/clientes";
import { ModalNuevoCliente } from "@/components/clientes/modal-nuevo-cliente";

export default async function ClientesPage() {
  const { clientes = [] } = await obtenerClientes();

  return (
    <LayoutShell
      title="Clientes & Empresas Dadoras de Carga"
      subtitle="Directorio de clientes industriales, condiciones de crédito comercial y contratos marco"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 sm:w-80">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por RUC o Razón Social..."
              className="w-full h-9 bg-[#111827] border border-[#1F2937] rounded-md pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          <ModalNuevoCliente />
        </div>

        {clientes.length === 0 ? (
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-12 text-center">
            <Building2 className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-300 mb-1">
              No hay clientes dadores de carga registrados
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Registra a tus clientes industriales y mineros con su número de RUC para generarles despachos y facturas electrónicas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clientes.map((c) => (
              <div
                key={c.id}
                className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-amber-400">
                    {c.tipoDocumento?.toUpperCase() || "RUC"} {c.numeroDocumento}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium capitalize">
                    {c.condicionPagoDias ? c.condicionPagoDias.replace("_", " ") : "Contado"}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{c.razonSocial}</h3>
                <p className="text-xs text-slate-400 mb-3 flex items-start gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <span>{c.direccionFiscal || "Sin dirección fiscal registrada"}</span>
                </p>

                <div className="pt-3 border-t border-[#1F2937] text-xs text-slate-300 space-y-1.5">
                  {c.contactoNombre && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <User className="h-3 w-3 text-slate-500" />
                        Contacto:
                      </span>
                      <span className="text-slate-200">{c.contactoNombre}</span>
                    </div>
                  )}
                  {c.contactoEmail && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Mail className="h-3 w-3 text-slate-500" />
                        Email:
                      </span>
                      <span className="text-amber-400 font-mono">{c.contactoEmail}</span>
                    </div>
                  )}
                  {c.contactoTelefono && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Phone className="h-3 w-3 text-slate-500" />
                        Teléfono:
                      </span>
                      <span className="text-slate-200 font-mono">{c.contactoTelefono}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1 border-t border-[#1F2937]/50">
                    <span className="text-slate-400">Estado de Cuenta:</span>
                    <span className="font-mono text-emerald-400 text-[11px] font-bold">
                      Activo / Comercial
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </LayoutShell>
  );
}

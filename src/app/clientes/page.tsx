import { LayoutShell } from "@/components/layout-shell";
import { Building2 } from "lucide-react";
import { obtenerClientes } from "@/lib/actions/clientes";
import { ModalNuevoCliente } from "@/components/clientes/modal-nuevo-cliente";
import { GridClientes } from "@/components/clientes/grid-clientes";

export default async function ClientesPage() {
  const { clientes = [] } = await obtenerClientes();

  return (
    <LayoutShell
      title="Clientes & Empresas Dadoras de Carga"
      subtitle="Directorio de clientes industriales, condiciones de crédito comercial y contratos marco"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            Administración centralizada de clientes corporativos, condiciones de crédito y puntos de contacto.
          </p>
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
          <GridClientes clientes={clientes as any} />
        )}
      </div>
    </LayoutShell>
  );
}


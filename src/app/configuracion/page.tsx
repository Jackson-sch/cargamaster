import { LayoutShell } from "@/components/layout-shell";
import { obtenerConfiguracionEmpresa } from "@/lib/actions/configuracion";
import { FormularioConfiguracion } from "@/components/configuracion/formulario-configuracion";
import { AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  const data = await obtenerConfiguracionEmpresa();

  if (!data.success || !data.empresa) {
    return (
      <LayoutShell
        title="Configuración de la Empresa & Parámetros Operativos"
        subtitle="Datos fiscales RUC, sedes y terminales, umbrales de alerta MTC y credenciales SOL"
      >
        <div className="p-8 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-rose-400" />
          <div>
            <h3 className="font-bold text-sm">Error al cargar la empresa activa</h3>
            <p className="text-xs text-rose-400/80">
              {data.error || "No se pudo recuperar la configuración de la empresa en Supabase."}
            </p>
          </div>
        </div>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell
      title="Configuración de la Empresa & Parámetros Operativos"
      subtitle="Datos fiscales RUC, sedes y terminales, umbrales de alerta MTC y credenciales SOL"
    >
      <FormularioConfiguracion
        empresa={data.empresa}
        parametros={
          data.parametrosSutranSunat || {
            cuentaBancoNacionDetracciones: "00-018-294819",
            codigoServicioDetraccion: "027",
            porcentajeDetraccion: 4,
            limiteVelocidadSutranKmH: 90,
            serieGuiaPredeterminada: "T001",
            serieFacturaPredeterminada: "F001",
          }
        }
      />
    </LayoutShell>
  );
}

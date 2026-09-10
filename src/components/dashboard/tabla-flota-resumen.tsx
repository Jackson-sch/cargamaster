import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface SemirremolqueItem {
  id: string;
  placa: string;
  tipoCarroceria: string;
}

interface UnidadItem {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  ejes: number;
  odometroActualKm?: number | null;
  estado: "disponible" | "en_ruta" | "mantenimiento" | "inactivo";
  acoplamientos?: Array<{
    semirremolqueId: string;
  }>;
}

interface TablaFlotaResumenProps {
  unidades: UnidadItem[];
  semirremolques: SemirremolqueItem[];
}

export function TablaFlotaResumen({
  unidades,
  semirremolques,
}: TablaFlotaResumenProps) {
  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
            Registro General de Flota en Base de Datos
          </h3>
          <p className="text-xs text-slate-400">
            Tracto-camiones, acoples activos y odómetros en tiempo real
          </p>
        </div>
        <Link
          href="/flota"
          className="text-xs text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1"
        >
          Gestionar Flota <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#0B1220] text-slate-400 uppercase tracking-wider text-[10px] border-b border-[#1F2937]">
            <tr>
              <th className="px-4 py-3 font-semibold">Tracto / Placa</th>
              <th className="px-4 py-3 font-semibold">Tipo & Marca</th>
              <th className="px-4 py-3 font-semibold">Semirremolque Acoplado</th>
              <th className="px-4 py-3 font-semibold">Odómetro (Km)</th>
              <th className="px-4 py-3 font-semibold">Estado Operativo</th>
              <th className="px-4 py-3 font-semibold text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2937]">
            {unidades.map((u) => {
              const acopleActivo = u.acoplamientos?.[0];
              const carreta = acopleActivo
                ? semirremolques.find((s) => s.id === acopleActivo.semirremolqueId)
                : null;

              return (
                <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3.5 font-mono font-bold text-white text-sm">
                    {u.placa}
                  </td>
                  <td className="px-4 py-3.5 text-slate-300">
                    {u.marca} {u.modelo} ({u.ejes} ejes)
                  </td>
                  <td className="px-4 py-3.5">
                    {carreta ? (
                      <div>
                        <span className="font-mono text-amber-400 font-semibold">
                          {carreta.placa}
                        </span>{" "}
                        <span className="text-slate-400 text-[11px] capitalize">
                          ({carreta.tipoCarroceria})
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">Sin acople</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-300">
                    {u.odometroActualKm?.toLocaleString()} km
                  </td>
                  <td className="px-4 py-3.5">
                    {u.estado === "en_ruta" ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 animate-pulse">
                        En Ruta
                      </span>
                    ) : u.estado === "mantenimiento" ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        En Taller
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-blue-500/15 text-blue-400 border border-blue-500/30">
                        Disponible
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Link
                      href="/flota"
                      className="text-amber-400 hover:text-amber-300 font-medium"
                    >
                      Detalle
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import {
  Users,
  Search,
  Award,
  AlertTriangle,
  Phone,
  CheckCircle2,
  PowerOff,
  ShieldCheck,
  Calendar,
  AlertOctagon,
} from "lucide-react";
import { ModalEditarConductor } from "./modal-editar-conductor";
import { ModalRenovarLicencia } from "./modal-renovar-licencia";
import { ModalCertificacionesConductor } from "./modal-certificaciones-conductor";
import { cambiarEstadoConductorAction, darDeBajaConductorAction } from "@/lib/actions/conductores";
import { toast } from "sonner";

interface LicenciaItem {
  id: string;
  conductorId: string;
  categoria: "A-IIb" | "A-IIIa" | "A-IIIb" | "A-IIIc";
  numeroLicencia: string;
  fechaExpedicion: string;
  fechaRevalidacion: string;
  puntosAcumuladosMtc: number;
  estado: "vigente" | "por_vencer" | "vencida" | "suspendida";
}

interface CertificacionItem {
  id: string;
  conductorId: string;
  tipo: string;
  entidadCapacitadora: string;
  numeroCertificado?: string | null;
  fechaEmision: string;
  fechaVencimiento: string;
  estado: string;
}

interface ConductorItem {
  id: string;
  tipoDocumento: "dni" | "ce";
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  contactoEmergencia?: string | null;
  telefonoEmergencia?: string | null;
  fechaNacimiento?: string | null;
  grupoSanguineo?: string | null;
  estado: "disponible" | "en_viaje" | "descanso_medico" | "vacaciones" | "inactivo";
  activo: boolean;
  licencias?: LicenciaItem[];
  certificaciones?: CertificacionItem[];
}

interface GridConductoresProps {
  conductores: ConductorItem[];
}

export function GridConductores({ conductores }: GridConductoresProps) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [isPending, startTransition] = useTransition();

  const conductoresFiltrados = conductores.filter((c) => {
    const licencia = c.licencias?.[0];
    const matchBusqueda =
      c.numeroDocumento.includes(busqueda) ||
      `${c.nombres} ${c.apellidos}`.toLowerCase().includes(busqueda.toLowerCase()) ||
      (licencia && licencia.numeroLicencia.toLowerCase().includes(busqueda.toLowerCase()));

    const matchEstado =
      filtroEstado === "todos"
        ? true
        : filtroEstado === "activos"
        ? c.activo && c.estado !== "inactivo"
        : c.estado === filtroEstado;

    return matchBusqueda && matchEstado;
  });

  const handleBaja = (c: ConductorItem) => {
    if (
      !confirm(
        `¿Seguro que deseas dar de baja al conductor ${c.nombres} ${c.apellidos}? El conductor quedará inactivo en el sistema.`
      )
    ) {
      return;
    }
    startTransition(async () => {
      const res = await darDeBajaConductorAction(c.id);
      if (res.success) {
        toast.success(`Conductor ${c.nombres} ${c.apellidos} dado de baja exitosamente.`);
      } else {
        toast.error(res.error || "No se pudo dar de baja al conductor.");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111827] border border-[#1F2937] p-3 rounded-xl">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-amber-400" />
          <span className="text-xs text-slate-300 font-semibold">
            {conductoresFiltrados.length} de {conductores.length} conductores
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por DNI, nombres o licencia..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full h-8 bg-[#0B1220] border border-[#1F2937] rounded pl-8 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="h-8 bg-[#0B1220] border border-[#1F2937] rounded px-2.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="todos">Todos los Estados</option>
            <option value="disponible">🔵 Disponibles</option>
            <option value="en_viaje">🟢 En Viaje / Ruta</option>
            <option value="descanso_medico">🟡 Descanso Médico</option>
            <option value="vacaciones">🟣 Vacaciones</option>
            <option value="inactivo">🔴 Inactivos / Baja</option>
          </select>
        </div>
      </div>

      {/* Grid of Drivers Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {conductoresFiltrados.length === 0 ? (
          <div className="col-span-2 bg-[#111827] border border-[#1F2937] rounded-xl p-8 text-center text-slate-500 text-xs">
            No se encontraron conductores registrados con los filtros seleccionados.
          </div>
        ) : (
          conductoresFiltrados.map((c) => {
            const licencia = c.licencias?.[0];
            const certs = c.certificaciones || [];
            const hasMatpel = certs.some((ct) => ct.tipo.includes("matpel"));
            const puntos = licencia?.puntosAcumuladosMtc ?? 0;

            return (
              <div
                key={c.id}
                className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 hover:border-slate-700 transition-colors flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Avatar, Info, Status Badge */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400 text-sm">
                        {(c.nombres?.[0] || "C") + (c.apellidos?.[0] || "")}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          {c.nombres} {c.apellidos}
                          {hasMatpel && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                              MATPEL
                            </span>
                          )}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="font-mono">{c.tipoDocumento.toUpperCase()}: {c.numeroDocumento}</span>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1 font-mono">
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
                    ) : c.estado === "descanso_medico" ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        Descanso Méd.
                      </span>
                    ) : c.estado === "vacaciones" ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-purple-500/15 text-purple-400 border border-purple-500/30">
                        Vacaciones
                      </span>
                    ) : c.estado === "inactivo" ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-rose-500/15 text-rose-400 border border-rose-500/30">
                        De Baja
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-blue-500/15 text-blue-400 border border-blue-500/30">
                        Disponible
                      </span>
                    )}
                  </div>

                  {/* License Details Card */}
                  <div className="bg-[#0B1220] border border-[#1F2937] rounded-lg p-3 space-y-2 text-xs mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Licencia MTC:</span>
                      <span className="font-mono font-bold text-slate-200">
                        {licencia ? `${licencia.numeroLicencia} (${licencia.categoria})` : "Sin licencia"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Revalidación MTC:</span>
                      {licencia?.estado === "vencida" ? (
                        <span className="text-rose-400 font-bold flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> {licencia.fechaRevalidacion} (Vencida)
                        </span>
                      ) : licencia?.estado === "por_vencer" ? (
                        <span className="font-semibold text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> {licencia.fechaRevalidacion} (Por vencer)
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> {licencia?.fechaRevalidacion || "—"}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Récord SUTRAN:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              puntos > 80 ? "bg-rose-500" : puntos > 40 ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.min(puntos, 100)}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-200">
                          {puntos} / 100 pts
                        </span>
                      </div>
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

                {/* Bottom Actions and Emergency Contact */}
                <div className="pt-3 border-t border-[#1F2937] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="text-slate-400 text-[11px]">
                    <span>
                      {c.contactoEmergencia ? `Emergencia: ${c.contactoEmergencia}` : "Sin contacto emerg."}
                    </span>{" "}
                    · <span className="font-mono text-slate-500">Sangre: {c.grupoSanguineo || "O+"}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 justify-end">
                    <ModalEditarConductor conductor={c} />
                    <ModalRenovarLicencia
                      conductorId={c.id}
                      conductorNombre={`${c.nombres} ${c.apellidos}`}
                      licencia={licencia}
                    />
                    <ModalCertificacionesConductor
                      conductorId={c.id}
                      conductorNombre={`${c.nombres} ${c.apellidos}`}
                      certificaciones={certs}
                    />
                    {c.estado !== "inactivo" && (
                      <button
                        type="button"
                        onClick={() => handleBaja(c)}
                        disabled={isPending}
                        title="Dar de Baja"
                        className="p-1.5 rounded bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors disabled:opacity-50"
                      >
                        <PowerOff className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

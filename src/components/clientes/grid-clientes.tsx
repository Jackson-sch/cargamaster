"use client";

import { useState, useTransition } from "react";
import {
  Building2,
  Search,
  Mail,
  Phone,
  MapPin,
  User,
  PowerOff,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { ModalEditarCliente } from "./modal-editar-cliente";
import { cambiarEstadoClienteAction, darDeBajaClienteAction } from "@/lib/actions/clientes";
import { toast } from "sonner";

export interface ClienteItem {
  id: string;
  tipoDocumento: "ruc" | "dni";
  numeroDocumento: string;
  razonSocial: string;
  direccionFiscal: string;
  departamento?: string | null;
  provincia?: string | null;
  distrito?: string | null;
  ubigeo?: string | null;
  contactoNombre?: string | null;
  contactoTelefono?: string | null;
  contactoEmail?: string | null;
  condicionPagoDias: "contado" | "15_dias" | "30_dias" | "45_dias" | "60_dias";
  activo: boolean;
}

interface GridClientesProps {
  clientes: ClienteItem[];
}

export function GridClientes({ clientes }: GridClientesProps) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"todos" | "activos" | "inactivos">("todos");
  const [filtroCredito, setFiltroCredito] = useState<string>("todos");
  const [isPending, startTransition] = useTransition();

  const clientesFiltrados = clientes.filter((c) => {
    const matchBusqueda =
      c.numeroDocumento.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.razonSocial.toLowerCase().includes(busqueda.toLowerCase()) ||
      (c.contactoNombre && c.contactoNombre.toLowerCase().includes(busqueda.toLowerCase())) ||
      (c.direccionFiscal && c.direccionFiscal.toLowerCase().includes(busqueda.toLowerCase()));

    const matchEstado =
      filtroEstado === "todos" ? true : filtroEstado === "activos" ? c.activo : !c.activo;

    const matchCredito =
      filtroCredito === "todos" ? true : c.condicionPagoDias === filtroCredito;

    return matchBusqueda && matchEstado && matchCredito;
  });

  const handleToggleEstado = (c: ClienteItem) => {
    startTransition(async () => {
      const res = await cambiarEstadoClienteAction(c.id, !c.activo);
      if (res.success) {
        toast.success(`Cliente ${c.razonSocial} ${!c.activo ? "activado" : "suspendido"}.`);
      } else {
        toast.error(res.error || "No se pudo cambiar el estado del cliente.");
      }
    });
  };

  const handleBaja = (c: ClienteItem) => {
    if (!confirm(`¿Seguro que deseas dar de baja a ${c.razonSocial}?`)) return;
    startTransition(async () => {
      const res = await darDeBajaClienteAction(c.id);
      if (res.success) {
        toast.success(`Cliente ${c.razonSocial} dado de baja.`);
      } else {
        toast.error(res.error || "No se pudo dar de baja al cliente.");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111827] border border-[#1F2937] p-3 rounded-xl">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-amber-400" />
          <span className="text-xs text-slate-300 font-semibold">
            {clientesFiltrados.length} de {clientes.length} clientes registrados
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por RUC, nombre o contacto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full h-8 bg-[#0B1220] border border-[#1F2937] rounded pl-8 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <select
            value={filtroCredito}
            onChange={(e) => setFiltroCredito(e.target.value)}
            className="h-8 bg-[#0B1220] border border-[#1F2937] rounded px-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="todos">Todos los Créditos</option>
            <option value="contado">Contado</option>
            <option value="15_dias">Crédito 15 días</option>
            <option value="30_dias">Crédito 30 días</option>
            <option value="45_dias">Crédito 45 días</option>
            <option value="60_dias">Crédito 60 días</option>
          </select>

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as any)}
            className="h-8 bg-[#0B1220] border border-[#1F2937] rounded px-2.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="todos">Todos los Estados</option>
            <option value="activos">🟢 Activos</option>
            <option value="inactivos">🔴 Inactivos</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clientesFiltrados.length === 0 ? (
          <div className="col-span-2 bg-[#111827] border border-[#1F2937] rounded-xl p-8 text-center text-slate-500 text-xs">
            No se encontraron clientes con los filtros seleccionados.
          </div>
        ) : (
          clientesFiltrados.map((c) => (
            <div
              key={c.id}
              className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 hover:border-slate-700 transition-colors flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                      {c.tipoDocumento?.toUpperCase() || "RUC"} {c.numeroDocumento}
                    </span>
                    {c.activo ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        Activo
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-rose-500/15 text-rose-400 border border-rose-500/30">
                        Inactivo
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] px-2.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-medium capitalize">
                    {c.condicionPagoDias ? c.condicionPagoDias.replace("_", " ") : "Contado"}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-2">{c.razonSocial}</h3>

                <p className="text-xs text-slate-400 mb-3 flex items-start gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <span>
                    {c.direccionFiscal || "Sin dirección fiscal registrada"}
                    {c.distrito ? `, ${c.distrito}` : ""}
                    {c.provincia ? ` - ${c.provincia}` : ""}
                  </span>
                </p>

                <div className="bg-[#0B1220] border border-[#1F2937] rounded-lg p-3 space-y-2 text-xs mb-3">
                  {c.contactoNombre && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <User className="h-3 w-3 text-slate-500" />
                        Contacto:
                      </span>
                      <span className="text-slate-200 font-medium">{c.contactoNombre}</span>
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

                  <div className="flex items-center justify-between pt-1 border-t border-[#1F2937]/60">
                    <span className="text-slate-400">Estado Comercial:</span>
                    <span className="font-mono text-emerald-400 text-[11px] font-bold">
                      {c.activo ? "Línea Habilitada" : "Suspendido / Sin Línea"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#1F2937] flex items-center justify-end gap-2">
                <ModalEditarCliente cliente={c} />
                <button
                  type="button"
                  onClick={() => handleToggleEstado(c)}
                  disabled={isPending}
                  title={c.activo ? "Suspender Cliente" : "Habilitar Cliente"}
                  className={`p-1.5 rounded text-xs font-semibold border transition-colors ${
                    c.activo
                      ? "bg-slate-800 text-slate-400 hover:text-amber-400 hover:bg-slate-700 border-slate-700"
                      : "bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/60 border-emerald-700"
                  }`}
                >
                  {c.activo ? "Suspender" : "Habilitar"}
                </button>
                <button
                  type="button"
                  onClick={() => handleBaja(c)}
                  disabled={isPending}
                  title="Dar de Baja"
                  className="p-1.5 rounded bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors disabled:opacity-50"
                >
                  <PowerOff className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

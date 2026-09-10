"use client";

import { useState, useEffect } from "react";
import { Building, ChevronDown, Check, MapPin, Plus, Settings } from "lucide-react";
import { obtenerSedes } from "@/lib/actions/sedes";
import { toast } from "sonner";
import Link from "next/link";

interface SedeItem {
  id: string;
  nombre: string;
  codigoSunat?: string | null;
  direccion: string;
  departamento: string;
  distrito: string;
  esPrincipal: boolean;
}

export function SelectorSedeNavbar() {
  const [sedes, setSedes] = useState<SedeItem[]>([]);
  const [sedeSeleccionada, setSedeSeleccionada] = useState<SedeItem | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSedes() {
      try {
        const res = await obtenerSedes();
        if (res.success && res.sedes && res.sedes.length > 0) {
          setSedes(res.sedes as SedeItem[]);
          // Verificar si hay una guardada en localStorage
          const guardadaId = typeof window !== "undefined" ? localStorage.getItem("cargamaster_sede_id") : null;
          const encontrada = res.sedes.find((s) => s.id === guardadaId);
          const principal = res.sedes.find((s) => s.esPrincipal) || res.sedes[0];
          const activa = (encontrada || principal) as SedeItem;
          setSedeSeleccionada(activa);
        }
      } catch (err) {
        console.error("Error al cargar sedes:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSedes();
  }, []);

  const handleSelect = (sede: SedeItem) => {
    setSedeSeleccionada(sede);
    if (typeof window !== "undefined") {
      localStorage.setItem("cargamaster_sede_id", sede.id);
    }
    setOpen(false);
    toast.success(`Sede activa: ${sede.nombre}`, {
      description: `Código SUNAT Anexo ${sede.codigoSunat || "0000"} · ${sede.distrito}, ${sede.departamento}`,
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#111827] border border-[#1F2937] hover:border-amber-500/50 text-xs text-slate-200 transition-colors"
        title="Cambiar Sede o Terminal Operativo Activo"
      >
        <Building className="h-3.5 w-3.5 text-amber-400 shrink-0" />
        <div className="text-left leading-tight hidden lg:block">
          <span className="font-semibold block truncate max-w-[140px]">
            {loading ? "Cargando..." : sedeSeleccionada ? sedeSeleccionada.nombre : "Callao (Principal)"}
          </span>
          {sedeSeleccionada?.codigoSunat && (
            <span className="text-[10px] text-slate-400 font-mono">
              Anexo {sedeSeleccionada.codigoSunat}
            </span>
          )}
        </div>
        <ChevronDown className="h-3 w-3 text-slate-400" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 bg-[#111827] border border-[#1F2937] rounded-xl shadow-2xl z-50 p-2 overflow-hidden text-xs">
            <div className="px-3 py-2 border-b border-[#1F2937] flex items-center justify-between">
              <span className="font-bold text-white text-[11px] uppercase tracking-wider">
                Sedes y Terminales ({sedes.length})
              </span>
              <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                Multi-Sede
              </span>
            </div>

            <div className="max-h-60 overflow-y-auto py-1 space-y-1">
              {sedes.map((s) => {
                const esActiva = sedeSeleccionada?.id === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleSelect(s)}
                    className={`w-full text-left p-2.5 rounded-lg transition-colors flex items-start justify-between gap-2 ${
                      esActiva
                        ? "bg-amber-500/10 border border-amber-500/30 text-white"
                        : "hover:bg-slate-800 text-slate-300"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs truncate">
                          {s.nombre}
                        </span>
                        {s.esPrincipal && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold">
                            Base
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                        <MapPin className="h-2.5 w-2.5 inline mr-1 text-slate-500" />
                        {s.distrito}, {s.departamento}
                      </span>
                    </div>

                    {esActiva && (
                      <Check className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#1F2937] px-1">
              <Link
                href="/configuracion"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg bg-[#0B1220] hover:bg-slate-800 text-[11px] text-slate-300 transition-colors border border-[#1F2937]"
              >
                <Settings className="h-3 w-3 text-slate-400" />
                <span>Administrar Sedes en Configuración</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

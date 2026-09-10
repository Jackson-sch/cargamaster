"use client";

import Link from "next/link";
import { ShieldAlert, ArrowLeft, Shield, Lock } from "lucide-react";
import { obtenerRutaInicioPorRol, MATRIZ_ROLES, type AppRole } from "@/lib/auth/roles-permissions";

interface AccesoRestringidoProps {
  rol: string;
  pathname: string;
  onOpenRoleModal?: () => void;
}

export function AccesoRestringido({ rol, pathname, onOpenRoleModal }: AccesoRestringidoProps) {
  const rutaInicio = obtenerRutaInicioPorRol(rol);
  const infoRol = MATRIZ_ROLES[rol as AppRole] || {
    nombreVisible: rol,
    descripcion: "Rol operativo",
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#111827] border border-rose-500/30 rounded-2xl p-8 text-center shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-rose-500/10 blur-3xl pointer-events-none" />

        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mb-2">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs font-semibold uppercase tracking-wider">
            <Lock className="h-3 w-3" />
            Acceso Restringido
          </div>
          <h2 className="text-xl font-bold text-white font-[family-name:var(--font-sora)]">
            Módulo Protegido por Políticas RBAC
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Tu perfil activo actualmente es{" "}
            <strong className="text-amber-400 font-semibold">{infoRol.nombreVisible}</strong>,
            el cual no cuenta con privilegios para consultar o modificar la ruta{" "}
            <code className="px-1.5 py-0.5 rounded bg-[#0B1220] border border-[#1F2937] text-slate-300 font-mono text-[11px]">
              {pathname}
            </code>
            .
          </p>
        </div>

        {/* Motivo operativo */}
        <div className="p-3.5 rounded-xl bg-[#0B1220] border border-[#1F2937] text-left text-xs text-slate-400 space-y-1">
          <span className="font-semibold text-slate-200 block text-[11px] uppercase tracking-wide">
            Alcance de tu rol ({infoRol.nombreVisible}):
          </span>
          <p className="text-[11px] text-slate-400 leading-snug">
            {infoRol.descripcion}. Los módulos financieros, fiscales o de administración de flota requieren privilegios de Administrador o Despacho.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href={rutaInicio}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/15 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Ir a mi Módulo Principal</span>
          </Link>

          {onOpenRoleModal && (
            <button
              onClick={onOpenRoleModal}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0B1220] hover:bg-slate-800 text-slate-300 hover:text-white border border-[#1F2937] font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Shield className="h-4 w-4 text-amber-400" />
              <span>Simular Otro Rol</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

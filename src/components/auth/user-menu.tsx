"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LogOut,
  User,
  Shield,
  Truck,
  Wrench,
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  Settings,
  X,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { tieneAccesoRuta, obtenerRutaInicioPorRol } from "@/lib/auth/roles-permissions";

export interface UserProfile {
  id: string;
  nombre: string;
  email: string;
  rol: "superadmin" | "admin" | "despachador" | "mantenimiento" | "conductor" | "cliente";
  rolNombre: string;
  badgeColor: string;
  sede: string;
  iniciales: string;
}

export const ROLES_DISPONIBLES: UserProfile[] = [
  {
    id: "user-admin",
    nombre: "Carlos Mendoza Silva",
    email: "carlos.mendoza@cargamaster.pe",
    rol: "admin",
    rolNombre: "Administrador General",
    badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    sede: "Base Central Callao",
    iniciales: "CM",
  },
  {
    id: "user-despacho",
    nombre: "Renzo Gutiérrez Vega",
    email: "despacho@cargamaster.pe",
    rol: "despachador",
    rolNombre: "Coordinador de Tráfico & Despacho",
    badgeColor: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    sede: "Terminal Callao",
    iniciales: "RG",
  },
  {
    id: "user-taller",
    nombre: "Ing. Marco Antonio Salas",
    email: "taller@cargamaster.pe",
    rol: "mantenimiento",
    rolNombre: "Jefe de Taller & Mantenimiento",
    badgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    sede: "Taller Sachaca Arequipa",
    iniciales: "MS",
  },
  {
    id: "user-conductor",
    nombre: "Wilfredo Quispe Mamani",
    email: "w.quispe@cargamaster.pe",
    rol: "conductor",
    rolNombre: "Conductor Profesional A-IIIc",
    badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    sede: "Flota en Ruta",
    iniciales: "WQ",
  },
  {
    id: "user-cliente",
    nombre: "Minera Antamina Logística",
    email: "logistica@antamina.pe",
    rol: "cliente",
    rolNombre: "Cliente Dador de Carga B2B",
    badgeColor: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
    sede: "Huarmey / Lima",
    iniciales: "MA",
  },
];

interface UserMenuProps {
  variant?: "header" | "sidebar";
}

export function UserMenu({ variant = "sidebar" }: UserMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<UserProfile>(ROLES_DISPONIBLES[0]);
  const [open, setOpen] = useState(false);
  const [modalRolesOpen, setModalRolesOpen] = useState(false);

  useEffect(() => {
    const updateFromStorage = () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("cargamaster_active_user");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            const found = ROLES_DISPONIBLES.find((r) => r.rol === parsed.rol);
            if (found) setCurrentUser(found);
          } catch {
            // ignore
          }
        }
      }
    };

    updateFromStorage();

    const handleRoleChanged = (e: any) => {
      if (e.detail) {
        setCurrentUser(e.detail);
      } else {
        updateFromStorage();
      }
    };

    const handleOpenModal = () => setModalRolesOpen(true);

    window.addEventListener("cargamaster_role_changed", handleRoleChanged);
    window.addEventListener("cargamaster_open_roles_modal", handleOpenModal);
    return () => {
      window.removeEventListener("cargamaster_role_changed", handleRoleChanged);
      window.removeEventListener("cargamaster_open_roles_modal", handleOpenModal);
    };
  }, []);

  const handleSwitchRole = (perfil: UserProfile) => {
    setCurrentUser(perfil);
    if (typeof window !== "undefined") {
      localStorage.setItem("cargamaster_active_user", JSON.stringify(perfil));
      window.dispatchEvent(new CustomEvent("cargamaster_role_changed", { detail: perfil }));
    }
    setOpen(false);
    setModalRolesOpen(false);

    toast.success(`Sesión activa cambiada a: ${perfil.nombre}`, {
      description: `Rol: ${perfil.rolNombre} (${perfil.sede})`,
    });

    // Si el nuevo rol no tiene acceso a la página actual, redirigir a su pantalla de inicio
    if (pathname && !tieneAccesoRuta(perfil.rol, pathname)) {
      const rutaDestino = obtenerRutaInicioPorRol(perfil.rol);
      router.push(rutaDestino);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("cargamaster_active_user");
      window.dispatchEvent(new Event("cargamaster_role_changed"));
    }
    toast.info("Has cerrado sesión en CargaMaster Pro.");
    router.push("/login");
  };

  if (variant === "header") {
    return (
      <div className="relative" suppressHydrationWarning>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-800/60 border border-transparent hover:border-[#1F2937] transition-colors"
          title="Menú de Usuario y Rol"
        >
          <div
            suppressHydrationWarning
            className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-400"
          >
            {currentUser.iniciales}
          </div>
          <div className="hidden xl:block text-left" suppressHydrationWarning>
            <span className="text-xs font-semibold text-slate-200 block leading-tight">
              {currentUser.nombre}
            </span>
            <span className="text-[10px] text-slate-400 capitalize block">
              {currentUser.rolNombre}
            </span>
          </div>
          <ChevronDown className="h-3 w-3 text-slate-400 hidden xl:block" />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 mt-2 w-64 bg-[#111827] border border-[#1F2937] rounded-xl shadow-2xl z-50 p-2 text-xs">
              {/* Profile Card */}
              <div className="p-3 bg-[#0B1220] rounded-lg border border-[#1F2937] mb-2">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="h-7 w-7 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs">
                    {currentUser.iniciales}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-white block truncate">
                      {currentUser.nombre}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block truncate">
                      {currentUser.email}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-[#1F2937]/80">
                  <span className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold ${currentUser.badgeColor}`}>
                    {currentUser.rolNombre}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {currentUser.sede}
                  </span>
                </div>
              </div>

              {/* Menu items */}
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setOpen(false);
                    setModalRolesOpen(true);
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2 transition-colors"
                >
                  <Shield className="h-3.5 w-3.5 text-amber-400" />
                  <span>Cambiar Rol / Simular Perfil</span>
                </button>

                <Link
                  href="/configuracion"
                  onClick={() => setOpen(false)}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2 transition-colors"
                >
                  <Settings className="h-3.5 w-3.5 text-slate-400" />
                  <span>Configuración de Empresa</span>
                </Link>

                <div className="border-t border-[#1F2937] my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full text-left p-2 rounded-lg hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 flex items-center gap-2 font-semibold transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5 text-rose-400" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Modal Cambiar Rol */}
        {modalRolesOpen && (
          <ModalCambiarRol
            currentUser={currentUser}
            onSelect={handleSwitchRole}
            onClose={() => setModalRolesOpen(false)}
          />
        )}
      </div>
    );
  }

  // Sidebar Variant
  return (
    <div className="p-3 border-t border-[#1F2937] bg-[#0E1524]" suppressHydrationWarning>
      <div className="flex items-center justify-between">
        <button
          onClick={() => setModalRolesOpen(true)}
          className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-85 transition-opacity flex-1 mr-2"
          title="Clic para cambiar de rol o simular perfil"
        >
          <div
            suppressHydrationWarning
            className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-400 shrink-0"
          >
            {currentUser.iniciales}
          </div>
          <div className="min-w-0 truncate" suppressHydrationWarning>
            <p className="text-xs font-semibold text-slate-200 truncate leading-tight">
              {currentUser.nombre}
            </p>
            <p className="text-[10px] text-slate-400 capitalize truncate mt-0.5">
              {currentUser.rolNombre}
            </p>
          </div>
        </button>

        <button
          onClick={handleLogout}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
          title="Cerrar Sesión"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      {modalRolesOpen && (
        <ModalCambiarRol
          currentUser={currentUser}
          onSelect={handleSwitchRole}
          onClose={() => setModalRolesOpen(false)}
        />
      )}
    </div>
  );
}

function ModalCambiarRol({
  currentUser,
  onSelect,
  onClose,
}: {
  currentUser: UserProfile;
  onSelect: (u: UserProfile) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#111827] border border-[#1F2937] rounded-2xl shadow-2xl overflow-hidden text-left flex flex-col">
        {/* Header */}
        <div className="p-4 bg-[#0B1220] border-b border-[#1F2937] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
                Roles & Perfiles del Sistema
              </h3>
              <p className="text-xs text-slate-400">
                Selecciona un rol para simular sus permisos operativos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Roles List */}
        <div className="p-4 space-y-2 text-xs">
          {ROLES_DISPONIBLES.map((perfil) => {
            const isSelected = perfil.rol === currentUser.rol;
            return (
              <button
                key={perfil.id}
                onClick={() => onSelect(perfil)}
                className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  isSelected
                    ? "bg-amber-500/10 border-amber-500 text-white shadow-md shadow-amber-500/5"
                    : "bg-[#0B1220] border-[#1F2937] text-slate-300 hover:border-slate-600 hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold border ${
                      isSelected
                        ? "bg-amber-400 text-slate-950 border-amber-300"
                        : "bg-slate-800 text-slate-300 border-slate-700"
                    }`}
                  >
                    {perfil.iniciales}
                  </div>
                  <div>
                    <span className="font-bold text-xs block text-white">
                      {perfil.nombre}
                    </span>
                    <span className={`inline-block text-[10px] px-1.5 py-0.2 rounded border font-semibold mt-0.5 ${perfil.badgeColor}`}>
                      {perfil.rolNombre}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {perfil.sede}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <Check className="h-4 w-4 text-amber-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#0B1220] border-t border-[#1F2937] text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

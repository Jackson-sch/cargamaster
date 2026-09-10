"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Truck,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Shield,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { ROLES_DISPONIBLES, type UserProfile } from "@/components/auth/user-menu";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("carlos.mendoza@cargamaster.pe");
  const [password, setPassword] = useState("••••••••••••");
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserProfile>(ROLES_DISPONIBLES[0]);

  const handleSelectRole = (role: UserProfile) => {
    setSelectedRole(role);
    setEmail(role.email);
    setPassword("password2026");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem("cargamaster_active_user", JSON.stringify(selectedRole));
      }
      toast.success(`Bienvenido, ${selectedRole.nombre}`, {
        description: `Sesión iniciada con rol: ${selectedRole.rolNombre}`,
      });
      router.push("/");
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#070C16] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-500/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[200px] bg-indigo-500/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-[#0F172A] border border-amber-500/30 text-amber-400 shadow-xl shadow-amber-500/10 mb-2">
            <Truck className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black text-white font-[family-name:var(--font-sora)] tracking-tight">
            CARGAMASTER <span className="text-amber-400">PRO</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            Sistema de Gestión Integral de Transporte Pesado, Despacho SUTRAN & Facturación Electrónica UBL 2.1
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-[#111827]/90 border border-[#1F2937] rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1.5">
                Correo Corporativo
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0B1220] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1.5">
                Contraseña de Acceso
              </label>
              <div className="relative">
                <Lock className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0B1220] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Validando credenciales...</span>
                </>
              ) : (
                <>
                  <span>Ingresar como {selectedRole.rolNombre}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Roles */}
          <div className="pt-4 border-t border-[#1F2937] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Acceso Rápido por Roles
              </span>
              <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                1 Clic
              </span>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {ROLES_DISPONIBLES.map((role) => {
                const isSelected = role.rol === selectedRole.rol;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleSelectRole(role)}
                    className={`p-2 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500/50 text-white"
                        : "bg-[#0B1220] border-[#1F2937] text-slate-400 hover:text-slate-200 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isSelected
                            ? "bg-amber-400 text-slate-950"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {role.iniciales}
                      </div>
                      <div className="truncate">
                        <span className="font-semibold block truncate text-slate-200">
                          {role.nombre}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {role.rolNombre}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* SUTRAN / SUNAT Security Badge */}
        <div className="flex items-center justify-center gap-2 text-slate-500 text-[11px]">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Conexión cifrada TLS · Cumplimiento SUTRAN RNAT & SUNAT UBL 2.1</span>
        </div>
      </div>
    </div>
  );
}

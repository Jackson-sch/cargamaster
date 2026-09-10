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
  Eye,
  EyeOff,
  MapPin,
  Radio,
  FileCheck2,
  Building2,
  Wrench,
  Navigation,
  UserCheck,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { ROLES_DISPONIBLES, type UserProfile } from "@/components/auth/user-menu";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("carlos.mendoza@cargamaster.pe");
  const [password, setPassword] = useState("admin2026*");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserProfile>(ROLES_DISPONIBLES[0]);

  const handleSelectRole = (role: UserProfile) => {
    setSelectedRole(role);
    setEmail(role.email);
    setPassword("cargamaster2026");
    toast.info(`Perfil seleccionado: ${role.rolNombre}`, {
      description: `Usuario: ${role.nombre} (${role.sede})`,
      duration: 2000,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem("cargamaster_active_user", JSON.stringify(selectedRole));
        window.dispatchEvent(new CustomEvent("cargamaster_role_changed", { detail: selectedRole }));
      }
      toast.success(`¡Bienvenido a CargaMaster Pro!`, {
        description: `Autenticado como ${selectedRole.nombre} · ${selectedRole.rolNombre}`,
      });
      router.push("/");
    }, 450);
  };

  const getRoleIcon = (rol: string) => {
    switch (rol) {
      case "admin":
      case "superadmin":
        return Shield;
      case "despachador":
        return Navigation;
      case "mantenimiento":
        return Wrench;
      case "conductor":
        return Truck;
      case "cliente":
        return Building2;
      default:
        return UserCheck;
    }
  };

  return (
    <div className="min-h-screen bg-[#070C16] flex flex-col justify-center relative overflow-hidden font-sans select-none">
      {/* Background Ambient Glows */}
      <div className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-amber-500/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-sky-500/10 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 blur-[160px] pointer-events-none rounded-full" />

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ============================================================ */}
          {/* LEFT COLUMN: HERO SHOWCASE DE LOGÍSTICA PESADA & TELEMETRÍA   */}
          {/* ============================================================ */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-6 lg:space-y-8">
            {/* Brand Pill */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#0E1524] border border-amber-500/30 shadow-lg shadow-amber-500/5">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold text-amber-400 tracking-wide uppercase font-mono">
                SUTRAN GPS & MTC · Transmisión Activa
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
                  <Truck className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white font-[family-name:var(--font-sora)] tracking-tight">
                    CargaMaster <span className="text-amber-400">PRO</span>
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    Transporte Pesado & Logística Minera · Perú
                  </p>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-100 font-[family-name:var(--font-sora)] leading-tight tracking-tight">
                Control Operativo de Flota, Despacho y Facturación SUNAT
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                Plataforma integral para empresas de transporte pesado interprovincial. Automatización de GRE Tipo 31, Hojas de Ruta MTC, control de pesaje PBTC y conciliación de detracciones SPOT 4% Banco de la Nación.
              </p>
            </div>

            {/* Live Telemetry Card (Showcase de viaje real en carretera) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1524]/90 border border-[#1F2937] shadow-2xl backdrop-blur-md space-y-4 max-w-xl">
              <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white font-mono">
                    VIAJE EN TRÁNSITO: OS-2026-00002
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Semáforo Verde MTC
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Tracto / Carreta</span>
                  <p className="font-mono font-bold text-amber-400">V7A-890 / Z1A-987</p>
                  <span className="text-[10px] text-slate-400">Volvo FH 540 (T3S3)</span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Ruta Carretera</span>
                  <p className="font-medium text-slate-200 truncate">Callao ➔ Arequipa</p>
                  <span className="text-[10px] text-slate-400">Panamericana Sur</span>
                </div>

                <div className="space-y-0.5 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Carga & Detracción</span>
                  <p className="font-mono font-bold text-slate-200">29.5 Tn · SPOT 4%</p>
                  <span className="text-[10px] text-emerald-400">Flete: S/ 4,500.00</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Progreso de Itinerario: 742 km recorridos</span>
                  <span className="text-amber-400 font-bold font-mono">73%</span>
                </div>
                <div className="h-2 w-full bg-[#070C16] rounded-full overflow-hidden border border-[#1F2937]">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full w-[73%]" />
                </div>
              </div>
            </div>

            {/* Certifications & Trust Badges */}
            <div className="grid grid-cols-3 gap-3 max-w-xl text-left">
              <div className="p-3 rounded-xl bg-[#0B1220] border border-[#1F2937]/80">
                <ShieldCheck className="h-4 w-4 text-amber-400 mb-1" />
                <h4 className="text-xs font-bold text-slate-200">MTC RNAT</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Flota Habilitada</p>
              </div>

              <div className="p-3 rounded-xl bg-[#0B1220] border border-[#1F2937]/80">
                <FileCheck2 className="h-4 w-4 text-sky-400 mb-1" />
                <h4 className="text-xs font-bold text-slate-200">SUNAT UBL 2.1</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">GRE Transportista</p>
              </div>

              <div className="p-3 rounded-xl bg-[#0B1220] border border-[#1F2937]/80">
                <Radio className="h-4 w-4 text-emerald-400 mb-1" />
                <h4 className="text-xs font-bold text-slate-200">SUTRAN GPS</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Retransmisión 24/7</p>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* RIGHT COLUMN: FORMULARIO DE ACCESO Y SELECTOR DE ROLES       */}
          {/* ============================================================ */}
          <div className="lg:col-span-6 xl:col-span-5">
            <div className="bg-[#0E1524] border border-[#1F2937] rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
              {/* Decorative Corner Accent */}
              <div className="absolute top-0 right-0 h-28 w-28 bg-amber-500/10 rounded-bl-full pointer-events-none blur-xl" />

              {/* Form Header */}
              <div className="space-y-1.5 mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white font-[family-name:var(--font-sora)]">
                    Iniciar Sesión
                  </h2>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    v2026.1 PRO
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Ingresa con tu cuenta corporativa o selecciona un perfil de prueba
                </p>
              </div>

              {/* Quick Role Selection Grid (1-Click) */}
              <div className="mb-6 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Simular Perfil Operativo (1 Clic)
                  </label>
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-medium">
                    Demo Rápida
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ROLES_DISPONIBLES.map((role) => {
                    const isSelected = role.rol === selectedRole.rol;
                    const RoleIcon = getRoleIcon(role.rol);

                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => handleSelectRole(role)}
                        className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                          isSelected
                            ? "bg-amber-500/15 border-amber-500 shadow-md shadow-amber-500/10 text-white"
                            : "bg-[#0B1220] border-[#1F2937] text-slate-400 hover:text-slate-200 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div
                            className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                              isSelected
                                ? "bg-amber-500 text-slate-950 font-black"
                                : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            <RoleIcon className="h-3.5 w-3.5" />
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          )}
                        </div>

                        <div>
                          <span className="text-xs font-bold block text-white truncate">
                            {role.rolNombre.split(" ")[0]}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {role.nombre.split(" ")[0]}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Email input */}
                <div>
                  <label className="text-slate-300 font-semibold block mb-1.5">
                    Correo Corporativo
                  </label>
                  <div className="relative">
                    <Mail className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#070C16] border border-[#1F2937] focus:border-amber-500 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none transition-colors font-mono"
                      placeholder="usuario@cargamaster.pe"
                      required
                    />
                  </div>
                </div>

                {/* Password input with toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-slate-300 font-semibold block">
                      Contraseña
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        toast.info("Acceso demo habilitado", {
                          description: "Puedes seleccionar cualquier rol con 1 clic arriba.",
                        })
                      }
                      className="text-[11px] text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#070C16] border border-[#1F2937] focus:border-amber-500 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none transition-colors font-mono"
                      placeholder="••••••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 p-1"
                      title={showPassword ? "Ocultar" : "Mostrar"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember me & Base */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-[#1F2937] bg-[#070C16] text-amber-500 focus:ring-0 h-3.5 w-3.5"
                    />
                    <span className="text-[11px]">Recordar sesión en esta terminal</span>
                  </label>

                  <span className="text-[11px] text-slate-500 font-medium">
                    Base: {selectedRole.sede}
                  </span>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 disabled:opacity-50 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition-all cursor-pointer mt-2 group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                      <span>Validando credenciales corporativas...</span>
                    </>
                  ) : (
                    <>
                      <span>Entrar al Sistema como {selectedRole.rolNombre}</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>

              {/* Security & Support Footer */}
              <div className="mt-6 pt-4 border-t border-[#1F2937] flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-500 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Cifrado TLS 256-bit · Acceso Fiscalizado</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    toast.info("Centro de Soporte Técnico", {
                      description: "Línea de soporte 24/7: soporte@cargamaster.pe",
                    })
                  }
                  className="hover:text-slate-400 transition-colors flex items-center gap-1"
                >
                  <HelpCircle className="h-3 w-3" />
                  <span>Soporte TI 24/7</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

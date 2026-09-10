"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Truck,
  LayoutDashboard,
  ClipboardList,
  Users,
  FileCheck2,
  MapPin,
  Wrench,
  Fuel,
  ReceiptText,
  Wallet,
  Building2,
  Route,
  Settings,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: "success" | "warning" | "destructive" | "default";
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navigationGroups: NavGroup[] = [
  {
    label: "OPERACIONES EN VIVO",
    items: [
      {
        title: "Centro de Control",
        url: "/",
        icon: LayoutDashboard,
      },
      {
        title: "Despacho de Viajes",
        url: "/despacho",
        icon: ClipboardList,
        badge: "3 en ruta",
        badgeVariant: "success",
      },
      {
        title: "Monitoreo GPS",
        url: "/tracking",
        icon: MapPin,
        badge: "En vivo",
        badgeVariant: "success",
      },
    ],
  },
  {
    label: "GESTIÓN DE FLOTA Y PERSONAL",
    items: [
      {
        title: "Flota de Carga",
        url: "/flota",
        icon: Truck,
      },
      {
        title: "Conductores",
        url: "/conductores",
        icon: Users,
      },
      {
        title: "Vencimientos & MTC",
        url: "/documentos",
        icon: FileCheck2,
        badge: "2 alertas",
        badgeVariant: "warning",
      },
    ],
  },
  {
    label: "LOGÍSTICA Y COSTOS",
    items: [
      {
        title: "Control Combustible",
        url: "/combustible",
        icon: Fuel,
      },
      {
        title: "Mantenimiento",
        url: "/mantenimiento",
        icon: Wrench,
      },
      {
        title: "Liquidaciones Chofer",
        url: "/liquidaciones",
        icon: Wallet,
      },
      {
        title: "Rutas y Tarifarios",
        url: "/rutas",
        icon: Route,
      },
      {
        title: "Clientes / Dadores",
        url: "/clientes",
        icon: Building2,
      },
    ],
  },
  {
    label: "SUNAT Y CONFIGURACIÓN",
    items: [
      {
        title: "GRE & Facturación",
        url: "/facturacion",
        icon: ReceiptText,
      },
      {
        title: "Configuración Empresa",
        url: "/configuracion",
        icon: Settings,
      },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-[#111827] border-r border-[#1F2937] flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-[#1F2937] bg-[#0E1524]">
        <div className="h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm shadow-amber-500/10">
          <Truck className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white tracking-tight text-base font-[family-name:var(--font-sora)]">
              CargaMaster
            </span>
            <span className="text-[10px] uppercase font-bold bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded leading-none">
              PRO
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium tracking-wide">
            Transporte Pesado Perú
          </p>
        </div>
      </div>

      {/* Tenant Indicator */}
      <div className="px-4 py-2.5 bg-[#0B1220]/70 border-b border-[#1F2937]/70 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 truncate">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-slate-300 font-medium truncate">
            TRANSANDINA S.A.C.
          </span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">20601234567</span>
      </div>

      {/* Nav Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navigationGroups.map((group) => (
          <div key={group.label}>
            <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  item.url === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.url);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.url}
                    href={item.url}
                    className={cn(
                      "flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-all group",
                      isActive
                        ? "bg-amber-500/10 text-amber-400 font-semibold border-l-2 border-amber-500 pl-2 shadow-inner"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          isActive
                            ? "text-amber-400"
                            : "text-slate-400 group-hover:text-slate-300"
                        )}
                      />
                      <span className="truncate">{item.title}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 uppercase tracking-tight",
                          item.badgeVariant === "success" &&
                            "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
                          item.badgeVariant === "warning" &&
                            "bg-amber-500/15 text-amber-400 border border-amber-500/30",
                          item.badgeVariant === "destructive" &&
                            "bg-rose-500/15 text-rose-400 border border-rose-500/30",
                          (!item.badgeVariant || item.badgeVariant === "default") &&
                            "bg-slate-800 text-slate-300"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* SUTRAN / MTC Regulatory Status Box */}
      <div className="p-3 m-3 rounded-lg bg-[#0B1220] border border-[#1F2937] text-xs">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-[11px]">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>MTC / SUTRAN</span>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1 rounded border border-emerald-500/20">
            Conectado
          </span>
        </div>
        <p className="text-[11px] text-slate-300 leading-tight">
          Transmisión telemática y revalidación de licencias activa.
        </p>
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-[#1F2937] bg-[#0E1524] flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-400 shrink-0">
            CM
          </div>
          <div className="min-w-0 truncate">
            <p className="text-xs font-medium text-slate-200 truncate">
              Carlos Mendoza
            </p>
            <p className="text-[10px] text-slate-300 capitalize truncate">
              Administrador Flota
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

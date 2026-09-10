"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";
import { AccesoRestringido } from "@/components/auth/acceso-restringido";
import { tieneAccesoRuta } from "@/lib/auth/roles-permissions";

interface LayoutShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function LayoutShell({ children, title, subtitle }: LayoutShellProps) {
  const pathname = usePathname();
  const [activeRole, setActiveRole] = useState<string>("admin");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkRole = () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("cargamaster_active_user");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.rol) setActiveRole(parsed.rol);
          } catch {}
        } else {
          setActiveRole("admin");
        }
      }
    };

    checkRole();
    window.addEventListener("cargamaster_role_changed", checkRole);
    return () => window.removeEventListener("cargamaster_role_changed", checkRole);
  }, []);

  const tienePermiso = mounted ? tieneAccesoRuta(activeRole, pathname) : true;

  return (
    <div className="flex min-h-screen bg-[#0B1220]" suppressHydrationWarning>
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0" suppressHydrationWarning>
        <AppHeader title={title} subtitle={subtitle} />
        <main className="flex-1 p-6 overflow-y-auto" suppressHydrationWarning>
          {tienePermiso ? (
            children
          ) : (
            <AccesoRestringido
              rol={activeRole}
              pathname={pathname}
              onOpenRoleModal={() => {
                window.dispatchEvent(new Event("cargamaster_open_roles_modal"));
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}

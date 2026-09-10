import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";

interface LayoutShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function LayoutShell({ children, title, subtitle }: LayoutShellProps) {
  return (
    <div className="flex min-h-screen bg-[#0B1220]" suppressHydrationWarning>
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0" suppressHydrationWarning>
        <AppHeader title={title} subtitle={subtitle} />
        <main className="flex-1 p-6 overflow-y-auto" suppressHydrationWarning>
          {children}
        </main>
      </div>
    </div>
  );
}

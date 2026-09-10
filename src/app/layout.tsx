import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CargaMaster Pro | Gestión de Transporte de Carga Pesada",
  description:
    "Sistema integral multi-tenant para empresas de transporte terrestre de carga pesada en Perú. Monitoreo satelital, GRE-Transportista, cumplimiento MTC y SUTRAN.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${sora.variable} ${inter.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#0B1220] text-[#E5E7EB]">
        {children}
        <Toaster
          richColors
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: "#111827",
              borderColor: "#1F2937",
              color: "#E5E7EB",
            },
          }}
        />
      </body>
    </html>
  );
}

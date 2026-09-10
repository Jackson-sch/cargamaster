"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";

export function BuscadorGlobalNavbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    // Detectar intención por formato
    const cleanQ = q.toUpperCase();
    if (/^[A-Z0-9]{3}-?[A-Z0-9]{3}$/.test(cleanQ)) {
      // Formato de placa peruana: dirigir a Flota o Despacho
      router.push(`/flota?buscar=${encodeURIComponent(cleanQ)}`);
    } else if (cleanQ.startsWith("OS-") || cleanQ.startsWith("VIAJE-")) {
      // Orden de Servicio: dirigir a Despacho
      router.push(`/despacho?buscar=${encodeURIComponent(cleanQ)}`);
    } else if (cleanQ.startsWith("F001") || cleanQ.startsWith("V001") || cleanQ.startsWith("T001")) {
      // Comprobante o GRE: dirigir a Facturación
      router.push(`/facturacion?buscar=${encodeURIComponent(cleanQ)}`);
    } else if (cleanQ.startsWith("20") && cleanQ.length === 11) {
      // RUC de cliente: dirigir a Clientes
      router.push(`/clientes?buscar=${encodeURIComponent(cleanQ)}`);
    } else {
      // Búsqueda general: por defecto a Despacho
      router.push(`/despacho?buscar=${encodeURIComponent(q)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar placa, chofer, OS o comprobante... (Enter)"
        className="w-72 lg:w-80 h-9 bg-[#111827] border border-[#1F2937] rounded-lg pl-9 pr-8 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
      />
      {query.trim() && (
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-amber-400"
        >
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </form>
  );
}

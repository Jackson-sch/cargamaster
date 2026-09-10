"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, X, Loader2 } from "lucide-react";
import { acoplarTractoCarretaAction } from "@/lib/actions/flota";
import { toast } from "sonner";

interface ModalAcoplamientoProps {
  unidades: Array<{ id: string; placa: string; marca: string; modelo: string }>;
  semirremolques: Array<{ id: string; placa: string; tipoCarroceria: string; estado: string }>;
  onCoupled?: () => void;
}

export function ModalAcoplamiento({
  unidades,
  semirremolques,
  onCoupled,
}: ModalAcoplamientoProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unidadId, setUnidadId] = useState("");
  const [semirremolqueId, setSemirremolqueId] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const carretasDisponibles = semirremolques.filter((s) => s.estado === "disponible");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unidadId || !semirremolqueId) {
      toast.error("Selecciona un tracto y una carreta.");
      return;
    }

    setLoading(true);
    const res = await acoplarTractoCarretaAction({
      unidadId,
      semirremolqueId,
      observaciones,
    });
    setLoading(false);

    if (res.success) {
      toast.success("Acoplamiento registrado exitosamente.");
      setOpen(false);
      router.refresh();
      setUnidadId("");
      setSemirremolqueId("");
      setObservaciones("");
      if (onCoupled) onCoupled();
    } else {
      toast.error(res.error || "No se pudo realizar el acople.");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="h-9 px-3 rounded-md bg-[#111827] border border-[#1F2937] hover:border-slate-600 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
      >
        <Link2 className="h-3.5 w-3.5 text-emerald-400" />
        <span>Acoplar Tracto ↔ Carreta</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#111827] border border-[#1F2937] rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-[#0E1524] border-b border-[#1F2937] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-emerald-400" />
                <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
                  Acoplamiento Tracto ↔ Semirremolque
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <p className="text-xs text-slate-400">
                Al vincular un tracto con una carreta, el sistema actualiza el manifiesto
                vehicular y habilita la unidad para programación de órdenes de servicio.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Seleccionar Tracto-Camión *
                  </label>
                  <select
                    required
                    value={unidadId}
                    onChange={(e) => setUnidadId(e.target.value)}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">-- Selecciona un tracto --</option>
                    {unidades.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.placa} — {u.marca} {u.modelo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Seleccionar Semirremolque Disponible *
                  </label>
                  <select
                    required
                    value={semirremolqueId}
                    onChange={(e) => setSemirremolqueId(e.target.value)}
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">-- Selecciona una carreta --</option>
                    {carretasDisponibles.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.placa} — {s.tipoCarroceria.toUpperCase()}
                      </option>
                    ))}
                  </select>
                  {carretasDisponibles.length === 0 && (
                    <span className="text-[10px] text-amber-400 mt-1 block">
                      ⚠️ No hay semirremolques disponibles en patio (todos acoplados).
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Observaciones de Inspección Pre-Acople
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Quinta rueda engrasada, perno rey y mangueras neumáticas revisadas..."
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    className="w-full bg-[#0B1220] border border-[#1F2937] rounded p-2.5 text-white placeholder:text-slate-600 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-[#1F2937] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-9 px-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !unidadId || !semirremolqueId}
                  className="h-9 px-5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Confirmar Acoplamiento</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

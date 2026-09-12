"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, X, Loader2, Truck, Container, FileText } from "lucide-react";
import { acoplarTractoCarretaAction } from "@/lib/actions/flota";
import { toast } from "sonner";
import { FormFieldset, FormSelect, FormTextarea } from "@/components/ui/form-controls";

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
        className="h-9 px-3.5 rounded-xl bg-[#0E1524] border border-[#1F2937] hover:border-emerald-500/50 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all hover:bg-emerald-500/5"
      >
        <Link2 className="h-4 w-4 text-emerald-400" />
        <span>Acoplar Tracto ↔ Carreta</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0E1524] border border-[#1F2937] rounded-2xl shadow-2xl overflow-hidden text-left flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-4 bg-[#0B1220] border-b border-[#1F2937] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Link2 className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
                    Acoplamiento Tracto ↔ Semirremolque
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Vincular configuración motriz para asignación en ruta MTC
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              <FormFieldset
                title="1. Selección de Unidades Compatibles"
                description="Selecciona el tracto y la carreta operativa disponible en patio"
                icon={Truck}
              >
                <FormSelect
                  label="Tracto-Camión"
                  required
                  icon={Truck}
                  value={unidadId}
                  onChange={(e) => setUnidadId(e.target.value)}
                >
                  <option value="">-- Selecciona un tracto motriz --</option>
                  {unidades.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.placa} — {u.marca} {u.modelo}
                    </option>
                  ))}
                </FormSelect>

                <FormSelect
                  label="Semirremolque / Carreta Disponible"
                  required
                  icon={Container}
                  value={semirremolqueId}
                  onChange={(e) => setSemirremolqueId(e.target.value)}
                  error={
                    carretasDisponibles.length === 0
                      ? "No hay semirremolques disponibles en patio (todos acoplados o en taller)."
                      : undefined
                  }
                >
                  <option value="">-- Selecciona una carreta --</option>
                  {carretasDisponibles.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.placa} — {s.tipoCarroceria.toUpperCase()}
                    </option>
                  ))}
                </FormSelect>
              </FormFieldset>

              <FormFieldset
                title="2. Inspección Técnica Pre-Acople"
                description="Verificación de perno rey, mangueras de aire y luces de frenado"
                icon={FileText}
              >
                <FormTextarea
                  label="Observaciones de Inspección"
                  rows={3}
                  placeholder="Quinta rueda engrasada, perno rey y mangueras neumáticas revisadas sin fugas..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  helperText="Detalles de inspección física antes de dar luz verde al viaje"
                />
              </FormFieldset>

              {/* Footer */}
              <div className="pt-3 border-t border-[#1F2937] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-9 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !unidadId || !semirremolqueId}
                  className="h-9 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
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

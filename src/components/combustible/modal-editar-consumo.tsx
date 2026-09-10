"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, X, Fuel, Loader2 } from "lucide-react";
import { actualizarConsumoCombustibleAction } from "@/lib/actions/combustible";
import { toast } from "sonner";

export interface ConsumoItemForEdit {
  id: string;
  placa: string;
  conductorNombre?: string | null;
  grifoNombre: string;
  grifoRuc?: string | null;
  numeroValeComprobante: string;
  galonesCargados: string | number;
  precioPorGalon: string | number;
  totalMonto: string | number;
  odometroAlCargar: number;
  fotoTicketUrl?: string | null;
}

interface ModalEditarConsumoProps {
  consumo: ConsumoItemForEdit;
  onUpdated?: () => void;
}

export function ModalEditarConsumo({ consumo, onUpdated }: ModalEditarConsumoProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    id: consumo.id,
    grifoNombre: consumo.grifoNombre,
    grifoRuc: consumo.grifoRuc || "",
    numeroValeComprobante: consumo.numeroValeComprobante,
    galonesCargados: parseFloat(consumo.galonesCargados?.toString() || "0"),
    precioPorGalon: parseFloat(consumo.precioPorGalon?.toString() || "0"),
    totalMonto: parseFloat(consumo.totalMonto?.toString() || "0"),
    odometroAlCargar: consumo.odometroAlCargar,
    fotoTicketUrl: consumo.fotoTicketUrl || "",
  });

  const handleGalonesChange = (val: number) => {
    const total = Number((val * formData.precioPorGalon).toFixed(2));
    setFormData((prev) => ({
      ...prev,
      galonesCargados: val,
      totalMonto: total,
    }));
  };

  const handlePrecioChange = (val: number) => {
    const total = Number((formData.galonesCargados * val).toFixed(2));
    setFormData((prev) => ({
      ...prev,
      precioPorGalon: val,
      totalMonto: total,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.grifoNombre.trim()) {
      toast.error("El nombre de la estación o grifo es obligatorio.");
      return;
    }
    if (!formData.numeroValeComprobante.trim()) {
      toast.error("El número de vale o comprobante es obligatorio.");
      return;
    }
    if (formData.galonesCargados <= 0 || formData.precioPorGalon <= 0) {
      toast.error("Los galones y el precio deben ser mayores a 0.");
      return;
    }

    setLoading(true);
    const res = await actualizarConsumoCombustibleAction({
      id: formData.id,
      grifoNombre: formData.grifoNombre,
      grifoRuc: formData.grifoRuc,
      numeroValeComprobante: formData.numeroValeComprobante,
      galonesCargados: formData.galonesCargados,
      precioPorGalon: formData.precioPorGalon,
      totalMonto: formData.totalMonto,
      odometroAlCargar: Number(formData.odometroAlCargar),
      fotoTicketUrl: formData.fotoTicketUrl,
    });
    setLoading(false);

    if (res.success) {
      toast.success(res.message || "Vale de combustible actualizado.");
      setOpen(false);
      router.refresh();
      if (onUpdated) onUpdated();
    } else {
      toast.error(res.error || "No se pudo actualizar el vale de combustible.");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Editar Vale de Combustible"
        className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 border border-slate-700 transition-colors"
      >
        <Edit2 className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg bg-[#111827] border border-[#1F2937] rounded-xl shadow-2xl overflow-hidden text-left"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          >
            {/* Header */}
            <div className="p-4 bg-[#0E1524] border-b border-[#1F2937] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Fuel className="h-5 w-5 text-sky-400" />
                <div>
                  <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
                    Editar Vale de Combustible ({consumo.placa})
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    {consumo.conductorNombre ? `Conductor: ${consumo.conductorNombre}` : "Corrección de ticket y odómetro"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Estación / Grifo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.grifoNombre}
                    onChange={(e) =>
                      setFormData({ ...formData, grifoNombre: e.target.value })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    RUC Grifo (Opcional)
                  </label>
                  <input
                    type="text"
                    maxLength={11}
                    value={formData.grifoRuc}
                    onChange={(e) =>
                      setFormData({ ...formData, grifoRuc: e.target.value })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    N° Vale / Comprobante *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.numeroValeComprobante}
                    onChange={(e) =>
                      setFormData({ ...formData, numeroValeComprobante: e.target.value })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Odómetro al Cargar (Km) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.odometroAlCargar}
                    onChange={(e) =>
                      setFormData({ ...formData, odometroAlCargar: Number(e.target.value) })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Financial Box */}
              <div className="p-3 bg-[#0B1220] border border-[#1F2937] rounded-lg space-y-3">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                  Volumen y Costo (Diesel B5)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">Galones (Gln)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.galonesCargados}
                      onChange={(e) => handleGalonesChange(parseFloat(e.target.value) || 0)}
                      className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">Precio x Gln (S/)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.precioPorGalon}
                      onChange={(e) => handlePrecioChange(parseFloat(e.target.value) || 0)}
                      className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded px-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-emerald-400 font-bold text-[10px] mb-1">Total (S/)</label>
                    <div className="h-8 bg-[#111827] border border-emerald-500/40 rounded px-2 flex items-center font-mono font-bold text-emerald-400">
                      S/ {formData.totalMonto.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#1F2937] bg-[#0E1524] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-9 px-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="h-9 px-5 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

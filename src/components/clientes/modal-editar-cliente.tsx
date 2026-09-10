"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, X, Building2, Loader2 } from "lucide-react";
import { actualizarClienteAction } from "@/lib/actions/clientes";
import { toast } from "sonner";

interface ClienteItem {
  id: string;
  tipoDocumento: "ruc" | "dni";
  numeroDocumento: string;
  razonSocial: string;
  direccionFiscal: string;
  departamento?: string | null;
  provincia?: string | null;
  distrito?: string | null;
  ubigeo?: string | null;
  contactoNombre?: string | null;
  contactoTelefono?: string | null;
  contactoEmail?: string | null;
  condicionPagoDias: "contado" | "15_dias" | "30_dias" | "45_dias" | "60_dias";
  activo: boolean;
}

interface ModalEditarClienteProps {
  cliente: ClienteItem;
  onUpdated?: () => void;
}

export function ModalEditarCliente({ cliente, onUpdated }: ModalEditarClienteProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    id: cliente.id,
    tipoDocumento: cliente.tipoDocumento || "ruc",
    numeroDocumento: cliente.numeroDocumento || "",
    razonSocial: cliente.razonSocial || "",
    direccionFiscal: cliente.direccionFiscal || "",
    departamento: cliente.departamento || "Lima",
    provincia: cliente.provincia || "Lima",
    distrito: cliente.distrito || "",
    ubigeo: cliente.ubigeo || "",
    contactoNombre: cliente.contactoNombre || "",
    contactoTelefono: cliente.contactoTelefono || "",
    contactoEmail: cliente.contactoEmail || "",
    condicionPagoDias: cliente.condicionPagoDias || "30_dias",
  });

  const handleSubmit = async () => {
    if (!formData.numeroDocumento || !formData.razonSocial || !formData.direccionFiscal) {
      toast.error("Por favor completa los campos obligatorios (*).");
      return;
    }

    setLoading(true);
    const res = await actualizarClienteAction(formData);
    setLoading(false);

    if (res.success) {
      toast.success(`Cliente ${formData.razonSocial} actualizado exitosamente.`);
      setOpen(false);
      router.refresh();
      if (onUpdated) onUpdated();
    } else {
      toast.error(res.error || "No se pudo actualizar el cliente.");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Editar Cliente"
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
                <Building2 className="h-5 w-5 text-amber-400" />
                <h2 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
                  Editar Cliente Dador de Carga
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content Form */}
            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Tipo Doc *
                    </label>
                    <select
                      value={formData.tipoDocumento}
                      onChange={(e) =>
                        setFormData({ ...formData, tipoDocumento: e.target.value as any })
                      }
                      className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                    >
                      <option value="ruc">RUC (Empresa)</option>
                      <option value="dni">DNI (Persona)</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-slate-300 font-medium mb-1">
                      Número de RUC / Documento *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="11 dígitos"
                      value={formData.numeroDocumento}
                      onChange={(e) =>
                        setFormData({ ...formData, numeroDocumento: e.target.value })
                      }
                      className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Razón Social / Nombre Comercial *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. MINERA LAS BAMBAS S.A."
                    value={formData.razonSocial}
                    onChange={(e) =>
                      setFormData({ ...formData, razonSocial: e.target.value })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Dirección Fiscal Completa *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Av. Principal N° 123, Distrito"
                    value={formData.direccionFiscal}
                    onChange={(e) =>
                      setFormData({ ...formData, direccionFiscal: e.target.value })
                    }
                    className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Departamento / Provincia
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        placeholder="Dpto"
                        value={formData.departamento}
                        onChange={(e) =>
                          setFormData({ ...formData, departamento: e.target.value })
                        }
                        className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-2 text-white focus:border-amber-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Prov"
                        value={formData.provincia}
                        onChange={(e) =>
                          setFormData({ ...formData, provincia: e.target.value })
                        }
                        className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-2 text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Distrito / Ubigeo
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        placeholder="Distrito"
                        value={formData.distrito}
                        onChange={(e) =>
                          setFormData({ ...formData, distrito: e.target.value })
                        }
                        className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-2 text-white focus:border-amber-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Ubigeo"
                        value={formData.ubigeo}
                        onChange={(e) =>
                          setFormData({ ...formData, ubigeo: e.target.value })
                        }
                        className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Nombre Contacto Logístico
                    </label>
                    <input
                      type="text"
                      placeholder="Lic. o Ing. de despacho"
                      value={formData.contactoNombre}
                      onChange={(e) =>
                        setFormData({ ...formData, contactoNombre: e.target.value })
                      }
                      className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Teléfono de Contacto
                    </label>
                    <input
                      type="text"
                      placeholder="01-512-0000 / 999..."
                      value={formData.contactoTelefono}
                      onChange={(e) =>
                        setFormData({ ...formData, contactoTelefono: e.target.value })
                      }
                      className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Correo Electrónico Facturación
                    </label>
                    <input
                      type="email"
                      placeholder="logistica@empresa.pe"
                      value={formData.contactoEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, contactoEmail: e.target.value })
                      }
                      className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Condición Comercial de Pago *
                    </label>
                    <select
                      value={formData.condicionPagoDias}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          condicionPagoDias: e.target.value as any,
                        })
                      }
                      className="w-full h-9 bg-[#0B1220] border border-[#1F2937] rounded px-3 text-white font-semibold focus:border-amber-500 focus:outline-none"
                    >
                      <option value="contado">Contado</option>
                      <option value="15_dias">Crédito 15 días</option>
                      <option value="30_dias">Crédito 30 días</option>
                      <option value="45_dias">Crédito 45 días</option>
                      <option value="60_dias">Crédito 60 días</option>
                    </select>
                  </div>
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
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="h-9 px-5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

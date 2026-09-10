"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  X,
  Loader2,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { editarSedeAction, eliminarSedeAction } from "@/lib/actions/sedes";
import { toast } from "sonner";

interface SedeItem {
  id: string;
  nombre: string;
  codigoSunat: string | null;
  direccion: string;
  departamento: string;
  provincia: string;
  distrito: string;
  ubigeo: string;
  telefono: string | null;
  esPrincipal: boolean;
}

interface ModalEditarSedeProps {
  sede: SedeItem;
  onUpdated?: () => void;
}

export function ModalEditarSede({ sede, onUpdated }: ModalEditarSedeProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [nombre, setNombre] = useState(sede.nombre);
  const [codigoSunat, setCodigoSunat] = useState(sede.codigoSunat || "0000");
  const [direccion, setDireccion] = useState(sede.direccion);
  const [departamento, setDepartamento] = useState(sede.departamento);
  const [provincia, setProvincia] = useState(sede.provincia);
  const [distrito, setDistrito] = useState(sede.distrito);
  const [ubigeo, setUbigeo] = useState(sede.ubigeo);
  const [telefono, setTelefono] = useState(sede.telefono || "");
  const [esPrincipal, setEsPrincipal] = useState(sede.esPrincipal);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!nombre.trim()) {
      toast.error("Ingrese el nombre de la sede");
      return;
    }
    if (!codigoSunat.trim() || codigoSunat.length !== 4) {
      toast.error("El código SUNAT debe tener 4 dígitos");
      return;
    }
    if (!ubigeo.trim() || ubigeo.length !== 6) {
      toast.error("El ubigeo debe tener 6 dígitos numéricos");
      return;
    }

    setLoading(true);
    try {
      const res = await editarSedeAction({
        id: sede.id,
        nombre,
        codigoSunat,
        direccion,
        departamento,
        provincia,
        distrito,
        ubigeo,
        telefono,
        esPrincipal,
      });

      if (res.success) {
        toast.success(res.message);
        setOpen(false);
        router.refresh();
        onUpdated?.();
      } else {
        toast.error(res.error || "No se pudo actualizar la sede.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await eliminarSedeAction(sede.id);
      if (res.success) {
        toast.success(res.message);
        setOpen(false);
        setConfirmDelete(false);
        router.refresh();
        onUpdated?.();
      } else {
        toast.error(res.error || "No se pudo eliminar la sede.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al eliminar la sede.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="p-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-amber-500 text-slate-400 hover:text-amber-400 transition-colors inline-flex items-center gap-1 text-[11px]"
        title="Editar sede o patio"
      >
        <Pencil className="h-3.5 w-3.5" />
        <span>Editar</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#111827] border border-[#1F2937] rounded-2xl shadow-2xl overflow-hidden text-left flex flex-col my-8">
            {/* Header */}
            <div className="p-4 bg-[#0B1220] border-b border-[#1F2937] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-[family-name:var(--font-sora)]">
                    Editar Terminal / Sede
                  </h3>
                  <p className="text-xs text-slate-400">
                    Modificar datos fiscales o anexo SUNAT del patio
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div
              className="p-5 space-y-4 text-xs"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading && !deleting) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-slate-300 font-semibold block mb-1">
                    Nombre del Terminal / Patio *
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full bg-[#0B1220] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Cód. Anexo SUNAT *
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={codigoSunat}
                    onChange={(e) => setCodigoSunat(e.target.value)}
                    className="w-full bg-[#0B1220] border border-[#1F2937] rounded-lg px-3 py-2 text-white font-mono text-center font-bold focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Dirección Exacta *
                </label>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="w-full bg-[#0B1220] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Departamento *
                  </label>
                  <input
                    type="text"
                    value={departamento}
                    onChange={(e) => setDepartamento(e.target.value)}
                    className="w-full bg-[#0B1220] border border-[#1F2937] rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Provincia *
                  </label>
                  <input
                    type="text"
                    value={provincia}
                    onChange={(e) => setProvincia(e.target.value)}
                    className="w-full bg-[#0B1220] border border-[#1F2937] rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Distrito *
                  </label>
                  <input
                    type="text"
                    value={distrito}
                    onChange={(e) => setDistrito(e.target.value)}
                    className="w-full bg-[#0B1220] border border-[#1F2937] rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Ubigeo INEI *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={ubigeo}
                    onChange={(e) => setUbigeo(e.target.value)}
                    className="w-full bg-[#0B1220] border border-[#1F2937] rounded-lg px-2 text-white font-mono text-center font-bold focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Teléfono de Contacto
                </label>
                <input
                  type="text"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full bg-[#0B1220] border border-[#1F2937] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Checkbox Base Principal */}
              <div className="p-3 rounded-lg bg-[#0B1220] border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">Marcar como Base Principal</span>
                  <span className="text-[11px] text-slate-400">
                    Aparecerá en el encabezado de documentos y como punto de partida por defecto
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={esPrincipal}
                  onChange={(e) => setEsPrincipal(e.target.checked)}
                  className="h-4 w-4 rounded accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Confirmación de Eliminación */}
              {confirmDelete && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <AlertTriangle className="h-4 w-4 text-rose-400" />
                    <span>¿Confirmas eliminar esta sede?</span>
                  </div>
                  <p className="text-[11px] text-rose-300/80">
                    Esta acción eliminará el patio del registro de establecimientos anexos.
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1"
                    >
                      {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                      <span>Sí, Eliminar</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-3 border-t border-[#1F2937] flex items-center justify-between">
                {!confirmDelete && (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    disabled={sede.esPrincipal}
                    className={`text-xs flex items-center gap-1 transition-colors ${
                      sede.esPrincipal
                        ? "text-slate-600 cursor-not-allowed"
                        : "text-rose-400 hover:text-rose-300"
                    }`}
                    title={sede.esPrincipal ? "No puedes eliminar la Base Principal" : "Eliminar sede"}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Eliminar Sede</span>
                  </button>
                )}

                <div className="flex items-center gap-2.5 ml-auto">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    disabled={loading || deleting}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={loading || deleting}
                    className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/10 transition-colors cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Guardar Cambios</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

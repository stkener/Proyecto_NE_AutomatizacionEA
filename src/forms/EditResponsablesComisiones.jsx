import { useState, useEffect } from "react";
import { X, Users, CheckCircle2 } from "lucide-react";
import { useApp } from "../context/AppContext";

function EditResponsablesComisiones({
  abierto,
  tutoria,
  responsablesActuales = [],
  onClose,
  onGuardar,
}) {
  const { usuarios, asistentesActivos } = useApp();

  const asistentes = asistentesActivos;

  const [guardando, setGuardando] = useState(false);
  const [seleccionados, setSeleccionados] = useState([]);

  useEffect(() => {
    if (!abierto) return;

    const ids = asistentesActivos
      .filter((u) => responsablesActuales.includes(u.nombre))
      .map((u) => Number(u.id_usuarios));

    setSeleccionados(ids);
  }, [abierto, responsablesActuales, asistentesActivos]);

  if (!abierto) return null;

  const toggleAsistente = (id) => {
    if (seleccionados.includes(id)) {
      setSeleccionados(seleccionados.filter((x) => x !== id));
    } else {
      setSeleccionados([...seleccionados, id]);
    }
  };

  const handleGuardar = async () => {
    setGuardando(true);

    const seleccionadosActivos = seleccionados.filter((id) =>
      asistentesActivos.some((u) => Number(u.id_usuarios) === id)
    );

    await onGuardar(seleccionadosActivos);
    setGuardando(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* HEADER */}
        <div className="bg-gray-50 flex justify-between items-center px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Users size={20} className="text-indigo-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                Editar Responsables
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition"
          >
            <X size={22} />
          </button>
        </div>

        {/* DATOS */}
        <div className="px-6 py-5 grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
              Día
            </label>
            <div className="bg-white border-slate-200 text-xs font-medium">
              {tutoria?.dia}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
              Fecha
            </label>
            <div className="bg-white border-slate-200 text-xs font-medium">
              {tutoria?.fecha}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
              Horario
            </label>
            <div className="bg-white border-slate-200 text-xs font-medium">
              {tutoria?.hora}
            </div>
          </div>
        </div>

        {/* LISTA */}
        <div className="px-6">
          <label className="block text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">
            Gestionar estudiantes asistentes
          </label>

          <div className="border border-gray-200 rounded-xl bg-gray-50 p-4">
            <div className="flex flex-wrap gap-2">
              {asistentes.length === 0 ? (
                <p className="text-xs text-gray-500 italic">No hay asistentes activos disponibles.</p>
              ) : (
                asistentes.map((a) => {
                  const activo = seleccionados.includes(Number(a.id_usuarios));

                  return (
                    <button
                      key={a.id_usuarios}
                      onClick={() => toggleAsistente(Number(a.id_usuarios))}
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition active:scale-95 ${activo
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400"
                        }`}
                    >
                      {a.nombre}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-gray-50 flex justify-end gap-3 px-6 py-4 border-t mt-5 border-gray-200">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 active:scale-[0.98] px-5 py-2 rounded-xl bg-red-50 text-red-600 text-xs hover:bg-red-100 font-bold transition"
          >
            <X size={16} />
            Cancelar
          </button>

          <button
            disabled={guardando}
            onClick={handleGuardar}
            className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition shadow-xs flex justify-center items-center gap-1.5 active:scale-[0.98]"
          >
            <CheckCircle2 size={16} />
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditResponsablesComisiones;
import { useState, useEffect, useMemo } from "react";
import {
  X,
  Loader2,
  ChevronDown,
  Trash2,
  Check,
  User,
  Users,
  Archive,
} from "lucide-react";
import { useApp } from "../context/AppContext";

function ModalTarea({
  isOpen,
  onClose,
  onTareaCreada,
  onTareaEditada,
  onTareaElimitada,
  API_URL,  
  tareaAEditar = null,
}) {
  const { asistentesActivos } = useApp();

  const [enviando, setEnviando] = useState(false);
  const [archivando, setArchivando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Set de IDs activos para un filtrado rápido en el useEffect
  const idsActivosSet = useMemo(() => {
    return new Set(asistentesActivos.map((a) => String(a.id_usuarios)));
  }, [asistentesActivos]);

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    prioridad: "media",
    columna: "backlog",
    asistente_ids: "",
    fecha_limite: "",
  });

  useEffect(() => {
    if (isOpen) {
      // Bloquear el scroll del body de la página
      document.body.style.overflow = "hidden";

      if (tareaAEditar) {
        // Obtener los IDs guardados en la tarea
        const idsOriginales = tareaAEditar.asistente_ids
          ? String(tareaAEditar.asistente_ids)
              .split(";")
              .map((i) => i.trim())
              .filter(Boolean)
          : [];

        // Deja ÚNICAMENTE los IDs de usuarios que sigan activos
        const idsLimpios = idsOriginales.filter((id) => idsActivosSet.has(id));

        setForm({
          id: tareaAEditar.id_tareas,
          titulo: tareaAEditar.titulo || "",
          descripcion: tareaAEditar.descripcion || "",
          prioridad: tareaAEditar.prioridad || "media",
          columna: tareaAEditar.columna || "backlog",
          asistente_ids: idsLimpios.join(";"), // Carga solo los asistentes activos
          fecha_limite: tareaAEditar.fecha_limite
            ? String(tareaAEditar.fecha_limite).split("T")[0]
            : "",
        });
      } else {
        setForm({
          titulo: "",
          descripcion: "",
          prioridad: "media",
          columna: "backlog",
          asistente_ids: "",
          fecha_limite: "",
        });
      }
      setDropdownOpen(false);
    }

    // Función de limpieza: Se ejecuta cuando el modal se cierra
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, tareaAEditar, idsActivosSet]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAsistenteToggle = (id) => {
    const idStr = String(id);
    let actuales = form.asistente_ids
      ? form.asistente_ids
          .split(";")
          .map((i) => i.trim())
          .filter(Boolean)
      : [];

    if (actuales.includes(idStr)) {
      actuales = actuales.filter((i) => i !== idStr);
    } else {
      actuales.push(idStr);
    }
    setForm((prev) => ({ ...prev, asistente_ids: actuales.join(";") }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titulo.trim()) return;

    if (form.fecha_limite) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const [year, month, day] = form.fecha_limite.split("-");
      const fechaElegida = new Date(year, month - 1, day);

      if (fechaElegida < hoy) {
        alert(
          "No podés asignar una fecha límite que ya pasó. Elegí el día de hoy o una fecha futura.",
        );
        return;
      }
    }

    const esEdicion = !!tareaAEditar;

    try {
      setEnviando(true);
      const respuesta = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
          accion: esEdicion ? "editar_tarea" : "crear_tarea",
          ...form,
        }),
      });

      const data = await respuesta.json();

      if (data.ok) {
        if (esEdicion) {
          onTareaEditada({ ...form, id_tareas: form.id });
        } else {
          onTareaCreada(data.tarea);
        }
        onClose();
      } else {
        alert("Error en la base de datos: " + data.mensaje);
      }
    } catch (err) {
      console.error("Error al procesar tarea:", err);
      alert("Error de conexión con el servidor.");
    } finally {
      setEnviando(false);
    }
  };

  const handleArchivar = async () => {
    try {
      setArchivando(true);
      const respuesta = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
          accion: "archivar_tarea",
          id: form.id,
        }),
      });

      const data = await respuesta.json();
      if (data.ok) {
        onTareaEditada({ ...form, id_tareas: form.id, columna: "archivado" });
        onClose();
      } else {
        alert("Error al archivar: " + data.mensaje);
      }
    } catch (err) {
      console.error("Error al archivar tarea:", err);
      alert("Error de conexión.");
    } finally {
      setArchivando(false);
    }
  };

  const handleEliminar = async () => {
    if (
      !window.confirm(
        "¿Seguro que querés eliminar esta tarea definitivamente? No se podrá recuperar.",
      )
    )
      return;

    try {
      setEliminando(true);
      const respuesta = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
          accion: "eliminar_tarea",
          id: form.id,
        }),
      });

      const data = await respuesta.json();
      if (data.ok) {
        onTareaElimitada(form.id);
        onClose();
      } else {
        alert("Error al eliminar: " + data.mensaje);
      }
    } catch (err) {
      console.error("Error al eliminar tarea:", err);
      alert("Error de conexión.");
    } finally {
      setEliminando(false);
    }
  };

  const idsSeleccionados = form.asistente_ids
    ? form.asistente_ids
        .split(";")
        .map((i) => i.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-xl overflow-hidden relative flex flex-col max-h-[90vh] animate-scale-in">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <div
              className={`p-1 rounded-lg border ${
                tareaAEditar
                  ? "bg-amber-50 text-amber-600 border-amber-100"
                  : "bg-indigo-50 text-indigo-600 border-indigo-100"
              }`}
            >
              <Users className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-black text-slate-800 tracking-tight uppercase">
              {tareaAEditar ? `Editar Tarea #${form.id}` : "Nueva Tarea Trello"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario con Scroll Interno */}
        <form
          onSubmit={handleSubmit}
          className="p-5 space-y-4 overflow-y-auto flex-1 custom-scrollbar"
        >
          {/* Título */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
              Título de la Tarea *
            </label>
            <input
              type="text"
              name="titulo"
              required
              placeholder="Ej: Revisar UX del login del campus"
              value={form.titulo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:border-indigo-500 bg-slate-50/50"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
              Descripción
            </label>
            <textarea
              name="descripcion"
              rows="2"
              placeholder="Detallá los pasos a seguir..."
              value={form.descripcion}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:border-indigo-500 bg-slate-50/50 resize-none"
            />
          </div>

          {/* Prioridad y Columna */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                Prioridad
              </label>
              <select
                name="prioridad"
                value={form.prioridad}
                onChange={handleChange}
                className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-slate-50/50 focus:outline-hidden focus:border-indigo-500"
              >
                <option value="baja">🟢 Baja</option>
                <option value="media">🟡 Media</option>
                <option value="alta">🔴 Alta</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                Columna
              </label>
              <select
                name="columna"
                value={form.columna}
                onChange={handleChange}
                className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-slate-50/50 focus:outline-hidden focus:border-indigo-500"
              >
                <option value="backlog">Para hacer</option>
                <option value="en_progreso">En Progreso</option>
                <option value="revision">En Revisión</option>
                <option value="completado">Completado</option>
              </select>
            </div>
          </div>

          {/* Asistentes */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
              Asignación de Personal
            </label>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/30">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`w-full px-3.5 py-2.5 text-xs font-bold text-slate-700 text-left flex items-center justify-between transition cursor-pointer bg-white ${
                  dropdownOpen ? "border-b border-slate-100" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idsSeleccionados.length > 0
                        ? "bg-indigo-600"
                        : "bg-slate-300"
                    }`}
                  />
                  <span>
                    {idsSeleccionados.length === 0
                      ? "Sin asistentes asignados"
                      : `${idsSeleccionados.length} elegidos`}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownOpen && (
                <div className="p-1.5 max-h-52 overflow-y-auto divide-y divide-slate-100 bg-white custom-scrollbar transition-all">
                  {asistentesActivos.length === 0 ? (
                    <div className="p-3 text-center text-[11px] font-medium text-slate-400">
                      No hay asistentes activos disponibles
                    </div>
                  ) : (
                    asistentesActivos.map((asistente) => {
                      const isChecked = idsSeleccionados.includes(
                        String(asistente.id_usuarios),
                      );
                      return (
                        <div
                          key={asistente.id_usuarios}
                          onClick={() =>
                            handleAsistenteToggle(asistente.id_usuarios)
                          }
                          className={`flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50/80 cursor-pointer select-none text-xs font-bold transition ${
                            isChecked
                              ? "bg-indigo-50/40 text-indigo-700"
                              : "text-slate-600"
                          }`}
                        >
                          <div className="flex items-center gap-2 max-w-[80%]">
                            <User
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isChecked ? "text-indigo-500" : "text-slate-400"
                              }`}
                            />
                            <span className="truncate">{asistente.nombre}</span>
                          </div>

                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                              isChecked
                                ? "bg-indigo-600 border-indigo-600 text-white shadow-3xs"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {isChecked && (
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Fecha Límite */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
              Fecha Límite
            </label>
            <input
              type="date"
              name="fecha_limite"
              value={form.fecha_limite}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:border-indigo-500 bg-slate-50/50"
            />
          </div>

          {/* Footer de Acciones */}
          <div className="pt-3 flex justify-between items-center border-t border-slate-100 gap-2 shrink-0">
            {tareaAEditar ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleArchivar}
                  disabled={enviando || eliminando || archivando}
                  className="px-2.5 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100/80 rounded-xl text-xs font-black transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Archivar tarea"
                >
                  {archivando ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Archive className="w-3.5 h-3.5" />
                  )}
                  <span>Archivar</span>
                </button>

                <button
                  type="button"
                  onClick={handleEliminar}
                  disabled={enviando || eliminando || archivando}
                  className="px-2.5 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100/80 rounded-xl text-xs font-black transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Eliminar definitivamente"
                >
                  {eliminando ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>Eliminar</span>
                </button>
              </div>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={enviando || eliminando || archivando}
                className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl text-xs font-black hover:bg-slate-50 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={enviando || eliminando || archivando}
                className="px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 min-w-[100px] justify-center shadow-3xs cursor-pointer"
              >
                {enviando ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <span>{tareaAEditar ? "Guardar" : "Crear Tarea"}</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalTarea;

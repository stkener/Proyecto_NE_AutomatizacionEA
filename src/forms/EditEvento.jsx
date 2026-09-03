import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  X,
  Loader2,
  CheckCircle2,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Heading,
  FileText,
  AlertCircle,
  Trash2
} from "lucide-react";


const COLORES_PASTEL = {
  tutoria: "focus:ring-purple-400 border-purple-200 bg-purple-50/30 text-purple-700",
  comision: "focus:ring-blue-400 border-blue-200 bg-blue-50/30 text-blue-700",
  reunion: "focus:ring-emerald-400 border-emerald-200 bg-emerald-50/30 text-emerald-700",
  encuentro: "focus:ring-amber-400 border-amber-200 bg-amber-50/30 text-amber-700",
  otro: "focus:ring-slate-400 border-slate-200 bg-slate-50 text-slate-700"
};

export default function EditEvento({
  open,
  evento,
  comisiones,
  tutorias,
  onClose,
  onSuccess
}) {
  const [saving, setSaving] = useState(false);
  const [errores, setErrores] = useState({ tipo: false, fecha: false });

  const { editarEvento, eliminarEvento, usuarios, asistentesActivos, actualizarCalendarioLocal } = useApp();

  const [form, setForm] = useState({
    id: "",
    fecha: "",
    tipo: "",
    comision_id: "",
    tutoria_id: "",
    asistentes: [],
    titulo_manual: "",
    horario_manual: "",
    aula_manual: "",
    detalle_nota: ""
  });

  // EFECTO: Carga los datos del evento a editar
  useEffect(() => {
    if (!evento) return;

    let fecha = "";

if (evento.fecha) {

  if (evento.fecha.includes("/")) {

    const [dia, mes, anio] = evento.fecha.split("/");
    fecha = `${anio}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;

  } else {

    fecha = evento.fecha.split("T")[0];

  }

}

    setForm({
      id: evento.id_calendario || "",
      fecha: fecha,
      tipo: evento.tipo || "",
      comision_id: evento.referencia_id || "",
      tutoria_id: evento.referencia_id || "",
      asistentes: evento.asistente_id
        ? String(evento.asistente_id).split(";")
        : [],
      titulo_manual: evento.titulo_manual || evento.titulo || "",
      horario_manual: evento.horario_manual || evento.horario || "",
      aula_manual: evento.aula_manual || evento.aula || "",
      detalle_nota: evento.detalle_nota || evento.detalle || ""
    });
    
    setErrores({ tipo: false, fecha: false });
  }, [evento]);

  // EFECTO: Bloquea el scroll del fondo (body) cuando el modal está abierto
  useEffect(() => {
    if (open && evento) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open, evento]);

  if (!open || !evento) return null;

  const toggleAsistente = (id) => {
    const existe = form.asistentes.includes(id);
    if (existe) {
      setForm({ ...form, asistentes: form.asistentes.filter(a => a !== id) });
    } else {
      setForm({ ...form, asistentes: [...form.asistentes, id] });
    }
  };

  // Validación y envío de cambios
  const validarYGuardar = async () => {
    const hayErrorTipo = !form.tipo;
    const hayErrorFecha = !form.fecha;

    setErrores({ tipo: hayErrorTipo, fecha: hayErrorFecha });

    if (hayErrorTipo || hayErrorFecha) return;

    try {
      setSaving(true);
      
      await editarEvento({
    id: form.id,
    fecha: form.fecha,
    tipo: form.tipo,
    comision_id: form.comision_id,
    tutoria_id: form.tutoria_id,
    asistente_id: form.asistentes.join(";"),
    titulo_manual: form.titulo_manual,
    horario_manual: form.horario_manual,
    aula_manual: form.aula_manual,
    detalle_nota: form.detalle_nota
});

const asistentesActualizados = form.asistentes
  .map((id) =>
    asistentesActivos.find(
      (a) => String(a.id_usuarios) === String(id)
    )
  )
  .filter(Boolean)
  .map((a) => a.nombre)
  .join(", ");

actualizarCalendarioLocal({
  id_calendario: form.id,
  asistente_id: form.asistentes.join(";"),
  asistentes: asistentesActualizados
});


onSuccess();

    } catch (err) {
      console.error(err);
      alert("No se pudo actualizar el evento");
    } finally {
      setSaving(false);
    }
  };

  const eliminarEventoLocal = async () => {

  // Comisión y tutoría no se pueden eliminar desde este formulario
  if (esEventoFijo) return;

  const confirmar = window.confirm(
    `¿Seguro que querés eliminar el evento "${form.titulo_manual || evento.titulo}"?\n\nEsta acción no se puede deshacer.`
  );

  if (!confirmar) return;

  try {

    setSaving(true);

    await eliminarEvento(form.id);

    onSuccess();

  } catch (err) {

    console.error(err);
    alert("No se pudo eliminar el evento");

  } finally {

    setSaving(false);

  }
};
    /*const confirmar = window.confirm(
        `¿Seguro que querés eliminar el evento "${form.titulo_manual || evento.titulo}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmar) return;

    try {
        setSaving(true);
        const response = await fetch(URL_SCRIPT, {
          method: "POST",
          body: JSON.stringify({
              accion: "eliminar",
              id: form.id
          })
        });

        const result = await response.json();
        if (!result.ok) throw new Error(result.error);

        onSuccess();
    } catch (err) {
        console.error(err);
        alert("No se pudo eliminar el evento");
    } finally {
        setSaving(false);
    }
  };*/

  const inputStyles = "w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium tracking-tight outline-none transition focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder:text-slate-400 shadow-3xs";
  const inputErrorStyles = "border-rose-300 bg-rose-50/20 focus:ring-rose-400 focus:border-transparent";
  const labelStyles = "text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5 mb-1.5";
  const deshabilitado = "bg-slate-200 text-slate-400 cursor-not-allowed w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium tracking-tight outline-none transition placeholder:text-slate-400 shadow-3xs"
                         // bg-slate-200 text-slate-400 cursor-not-allowed"
  const esEventoFijo =  form.tipo === "comision" || form.tipo === "tutoria";

  const asistentesParaMostrar = [
  ...asistentesActivos,
  ...form.asistentes
    .map((id) =>
      usuarios.find(
        (u) => String(u.id_usuarios) === String(id)
      )
    )
    .filter(Boolean)
    .filter(
      (u) =>
        !asistentesActivos.some(
          (a) =>
            String(a.id_usuarios) === String(u.id_usuarios)
        )
    )
];
  
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-center items-center p-4 z-50">
      <div className="bg-slate-50/95 border border-slate-200/90 rounded-3xl w-full max-w-xl shadow-xl overflow-hidden tracking-tight max-h-[90vh] flex flex-col">
        
        {/* HEADER */}
        <div className="flex justify-between items-center border-b border-slate-200/60 bg-white px-5 py-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg border border-amber-100/40">
              <CalendarDays className="w-4 h-4" />
            </div>
            <h2 className="text-base font-black text-slate-800 leading-none">
              Editar Evento Existente
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CONTENIDO SCROLLABLE */}
        <div className="overflow-y-auto p-5 space-y-4 flex-1">
          {/* FILA 1: TIPO Y FECHA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className={labelStyles}>
                <CalendarDays className="w-3.5 h-3.5 text-slate-400" /> Tipo de Actividad
              </label>
              <select
                value={form.tipo}
                disabled={esEventoFijo}
                onChange={(e) => {
                  setForm({ ...form, tipo: e.target.value, comision_id: "", tutoria_id: "" });
                  if (e.target.value) setErrores(prev => ({ ...prev, tipo: false }));
                }}
                className={`${inputStyles} ${form.tipo ? COLORES_PASTEL[form.tipo] || "" : ""} ${errores.tipo ? inputErrorStyles : ""}`}
              >
                <option value="">Seleccionar...</option>
                {/*<option value="comision">Comisión</option>
                <option value="tutoria">Tutoría</option>*/}
                <option value="reunion">Reunión</option>
                <option value="encuentro">Encuentro</option>
                <option value="otro">Otro</option>
              </select>
              {errores.tipo && (
                <span className="text-[10px] text-rose-500 font-bold flex items-center gap-1 mt-1.5 animate-fade-in">
                  <AlertCircle className="w-3 h-3 shrink-0" /> Falta seleccionar el tipo
                </span>
              )}
            </div>

            <div>
              <label className={labelStyles}>
                <CalendarDays className="w-3.5 h-3.5 text-slate-400" /> Fecha del Evento
              </label>
              <input
                type="date"
                value={form.fecha}
                disabled={esEventoFijo}
                onChange={(e) => {
                  setForm({ ...form, fecha: e.target.value });
                  if (e.target.value) setErrores(prev => ({ ...prev, fecha: false }));
                }}
                className={
                  esEventoFijo
                    ? deshabilitado
                    : `${inputStyles} ${errores.fecha ? inputErrorStyles : ""}`
                }
              />
              {errores.fecha && (
                <span className="text-[10px] text-rose-500 font-bold flex items-center gap-1 mt-1.5 animate-fade-in">
                  <AlertCircle className="w-3 h-3 shrink-0" /> Falta ingresar la fecha
                </span>
              )}
            </div>
          </div>

          {/* CAMPOS RELACIONALES CONDICIONALES */}
          {form.tipo === "comision" && (
            <div className="animate-slide-down">
              <label className={labelStyles}>Asignar Comisión</label>
              <select
                disabled
                value={form.comision_id}
                onChange={(e) => setForm({ ...form, comision_id: e.target.value })}
                className={
                  esEventoFijo
                    ? deshabilitado
                    : `${inputStyles} ${form.tipo ? COLORES_PASTEL[form.tipo] || "" : ""} ${errores.tipo ? inputErrorStyles : ""}`
                }
              >
                <option value="">Seleccionar Comisión Fija</option>
                {comisiones.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
          )}

          {form.tipo === "tutoria" && (
            <div className="animate-slide-down">
              <label className={labelStyles}>Asignar Tutoría</label>
              <select
                value={form.tutoria_id}
                disabled
                onChange={(e) => setForm({ ...form, tutoria_id: e.target.value })}
                className={
                  esEventoFijo
                    ? deshabilitado
                    : `${inputStyles} ${form.tipo ? COLORES_PASTEL[form.tipo] || "" : ""} ${errores.tipo ? inputErrorStyles : ""}`
                }
              >
                <option value="">Seleccionar Tutoría</option>
                {tutorias.map((t) => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
            </div>
          )}

          {/* TÍTULO */}
          <div>
            <label className={labelStyles}>
              <Heading className="w-3.5 h-3.5 text-slate-400" /> Título / Nombre
            </label>
            <input
              type="text"
              placeholder="Ej: Entrega de Informes UX u Horario de Consultas"
              value={form.titulo_manual}
              disabled={esEventoFijo}
              onChange={(e) => setForm({ ...form, titulo_manual: e.target.value })}
              className={esEventoFijo ? deshabilitado : inputStyles}
            />
          </div>

          {/* HORARIO Y AULA */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className={labelStyles}>
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Horario
              </label>
              <input
                placeholder="Ej: 18:00 a 20:00"
                value={form.horario_manual}
                disabled={esEventoFijo}
                onChange={(e) => setForm({ ...form, horario_manual: e.target.value })}
                className={esEventoFijo ? deshabilitado : inputStyles}
              />
            </div>

            <div>
              <label className={labelStyles}>
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Aula / Espacio
              </label>
              <input
                placeholder="Ej: Aula 102 o Meet"
                value={form.aula_manual}
                disabled={esEventoFijo}
                onChange={(e) => setForm({ ...form, aula_manual: e.target.value })}
                className={esEventoFijo ? deshabilitado : inputStyles}
              />
            </div>
          </div>

          {/* ASISTENTES */}
          <div>
            <label className={labelStyles}>
              <Users className="w-3.5 h-3.5 text-slate-400" /> Gestionar Estudiantes Asistentes
            </label>
            <div className="flex flex-wrap gap-1.5 p-3.5 bg-white border border-slate-200 rounded-2xl max-h-40 overflow-y-auto shadow-3xs">
              {asistentesParaMostrar.map((a) => {
                  const seleccionado = form.asistentes.includes(String(a.id_usuarios));
                  const esInactivo = !a.activo; // O la propiedad correspondiente

                  return (
                    <button
                      type="button"
                      key={a.id}
                      onClick={() => toggleAsistente(String(a.id_usuarios))}
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition active:scale-95 ${
                        seleccionado
                          ? esInactivo
                            ? "bg-amber-600 text-white border-amber-600" // Diferenciar visualmente si está inactivo
                            : "bg-indigo-600 text-white border-indigo-600 shadow-3xs"
                          : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100"
                      }`}
                    >
                      {a.nombre} {esInactivo && "(Inactivo)"}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* DETALLES / NOTAS */}
          <div>
            <label className={labelStyles}>
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Detalle / Nota interna
            </label>
            <textarea
              placeholder="Modificar observaciones o agregar especificaciones..."
              value={form.detalle_nota}
              onChange={(e) => setForm({ ...form, detalle_nota: e.target.value })}
              rows={3}
              className={`${inputStyles} resize-none`}
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="grid grid-cols-2 gap-3 p-4 bg-white border-t border-slate-200/60 shrink-0">
          
          {/* BOTÓN ELIMINAR */}
          <button
            type="button"
            onClick={eliminarEventoLocal}
            disabled={saving || esEventoFijo}
            className="bg-rose-50 hover:bg-rose-100/80 disabled:bg-slate-100 text-rose-600 disabled:text-slate-400 text-xs font-bold py-2.5 px-4 rounded-xl border border-rose-100/70 disabled:border-slate-200 transition flex justify-center items-center gap-1.5 active:scale-[0.98]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Eliminar Evento</span>
          </button>

          {/* BOTÓN GUARDAR CAMBIOS */}
          <button
            type="button"
            onClick={validarYGuardar}
            disabled={saving}
            className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition shadow-xs flex justify-center items-center gap-1.5 active:scale-[0.98]"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>

        </div>

      </div>
    </div>
  );
}
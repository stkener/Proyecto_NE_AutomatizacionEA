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
  AlertCircle
} from "lucide-react";


const COLORES_PASTEL = {
  tutoria: "focus:ring-purple-400 border-purple-200 bg-purple-50/30 text-purple-700",
  comision: "focus:ring-blue-400 border-blue-200 bg-blue-50/30 text-blue-700",
  reunion: "focus:ring-emerald-400 border-emerald-200 bg-emerald-50/30 text-emerald-700",
  encuentro: "focus:ring-amber-400 border-amber-200 bg-amber-50/30 text-amber-700",
  otro: "focus:ring-slate-400 border-slate-200 bg-slate-50 text-slate-700"
};

export default function AddEvento({
  open,
  onClose,
  onSuccess,
  comisiones,
  tutorias
}) {
  const [saving, setSaving] = useState(false);
  const [errores, setErrores] = useState({ tipo: false, fecha: false });
  const { API_URL, asistentesActivos } = useApp();
  
  const [form, setForm] = useState({
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

  // EFECTO: Bloquea el scroll del fondo (body) cuando el modal está abierto 
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    // Limpieza al desmontar el componente
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!open) return null;

  const toggleAsistente = (id) => {
    const existe = form.asistentes.includes(id);
    if (existe) {
      setForm({ ...form, asistentes: form.asistentes.filter(a => a !== id) });
    } else {
      setForm({ ...form, asistentes: [...form.asistentes, id] });
    }
  };

  // Manejador de validación manual
  const validarYGuardar = async () => {
    const hayErrorTipo = !form.tipo;
    const hayErrorFecha = !form.fecha;

    setErrores({ tipo: hayErrorTipo, fecha: hayErrorFecha });

    // Si falta alguno de los dos campos obligatorios, frena la ejecución
    if (hayErrorTipo || hayErrorFecha) return;

    try {
      setSaving(true);
      const payload = {
        accion: "crear_evento",
        fecha: form.fecha,
        tipo: form.tipo,
        comision_id: form.comision_id,
        tutoria_id: form.tutoria_id,
        asistente_id: form.asistentes.join(";"),
        titulo_manual: form.titulo_manual,
        horario_manual: String(form.horario_manual),
        aula_manual: form.aula_manual,
        detalle_nota: form.detalle_nota
      };

      const response = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!result.ok) throw new Error(result.error);

      // Reset total del form y errores
      setForm({
        fecha: "", tipo: "", comision_id: "", tutoria_id: "",
        asistentes: [], titulo_manual: "", horario_manual: "",
        aula_manual: "", detalle_nota: ""
      });
      setErrores({ tipo: false, fecha: false });
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("No se pudo guardar el evento");
    } finally {
      setSaving(false);
    }
  };

  const inputStyles = "w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium tracking-tight outline-none transition focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder:text-slate-400 shadow-3xs";
  const inputErrorStyles = "border-rose-300 bg-rose-50/20 focus:ring-rose-400 focus:border-transparent";
  const labelStyles = "text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5 mb-1.5";

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-center items-center p-4 z-50">
      <div className="bg-slate-50/95 border border-slate-200/90 rounded-3xl w-full max-w-xl shadow-xl overflow-hidden tracking-tight max-h-[90vh] flex flex-col">
        
        {/* HEADER */}
        <div className="flex justify-between items-center border-b border-slate-200/60 bg-white px-5 py-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100/40">
              <CalendarDays className="w-4 h-4" />
            </div>
            <h2 className="text-base font-black text-slate-800 leading-none">
              Nuevo Evento Organizativo
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CUERPO DEL FORMULARIO CON SCROLL */}
        <div className="overflow-y-auto p-5 space-y-4 flex-1">
          
          {/* FILA 1: TIPO Y FECHA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className={labelStyles}>
                <CalendarDays className="w-3.5 h-3.5 text-slate-400" /> Tipo de Actividad *
              </label>
              <select
                value={form.tipo}
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
                <span className="text-[10px] text-rose-500 font-bold flex items-center gap-1 mt-1.5 animate-slide-down">
                  <AlertCircle className="w-3 h-3" /> Por favor, seleccioná un tipo
                </span>
              )}
            </div>

            <div>
              <label className={labelStyles}>
                <CalendarDays className="w-3.5 h-3.5 text-slate-400" /> Fecha del Evento *
              </label>
              <input
                type="date"
                value={form.fecha}
                onChange={(e) => {
                  setForm({ ...form, fecha: e.target.value });
                  if (e.target.value) setErrores(prev => ({ ...prev, fecha: false }));
                }}
                className={`${inputStyles} ${errores.fecha ? inputErrorStyles : ""}`}
              />
              {errores.fecha && (
                <span className="text-[10px] text-rose-500 font-bold flex items-center gap-1 mt-1.5 animate-slide-down">
                  <AlertCircle className="w-3 h-3" /> Por favor, definí una fecha
                </span>
              )}
            </div>
          </div>

          {/* SELECTS CONDICIONALES */}
          {form.tipo === "comision" && (
            <div className="animate-slide-down">
              <label className={labelStyles}>Asignar Comisión</label>
              <select
                value={form.comision_id}
                onChange={(e) => setForm({ ...form, comision_id: e.target.value })}
                required
                className={inputStyles}
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
                onChange={(e) => setForm({ ...form, tutoria_id: e.target.value })}
                required
                className={inputStyles}
              >
                <option value="">Seleccionar Tutoría</option>
                {tutorias.map((t) => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
            </div>
          )}

          {/* TÍTULO MANUAL */}
          <div>
            <label className={labelStyles}>
              <Heading className="w-3.5 h-3.5 text-slate-400" /> Título / Nombre
            </label>
            <input
              type="text"
              placeholder="Ej: Entrega de Informes UX u Horario de Consultas"
              value={form.titulo_manual}
              onChange={(e) => setForm({ ...form, titulo_manual: e.target.value })}
              className={inputStyles}
            />
          </div>

          {/* FILA: HORARIO Y AULA */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className={labelStyles}>
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Horario
              </label>
              <input
                placeholder="Ej: 18:00 a 20:00"
                value={form.horario_manual}
                onChange={(e) => setForm({ ...form, horario_manual: e.target.value })}
                className={inputStyles}
              />
            </div>

            <div>
              <label className={labelStyles}>
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Aula / Espacio
              </label>
              <input
                placeholder="Ej: Aula 102 o Meet"
                value={form.aula_manual}
                onChange={(e) => setForm({ ...form, aula_manual: e.target.value })}
                className={inputStyles}
              />
            </div>
          </div>

          {/* SECCIÓN ASISTENTES */}
          <div>
            <label className={labelStyles}>
              <Users className="w-3.5 h-3.5 text-slate-400" /> Seleccionar Estudiantes Asistentes
            </label>
            <div className="flex flex-wrap gap-1.5 p-3.5 bg-white border border-slate-200 rounded-2xl max-h-40 overflow-y-auto shadow-3xs">
              {asistentesActivos.map((a) => {
                  const seleccionado = form.asistentes.includes(String(a.id_usuarios));
                  return (
                    <button
                      type="button"
                      key={a.id}
                      onClick={() => toggleAsistente(String(a.id_usuarios))}
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition active:scale-95 ${
                        seleccionado
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-3xs"
                          : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100"
                      }`}
                    >
                      {a.nombre}
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
              placeholder="Notas aclaratorias sobre la cursada, links o recordatorios..."
              value={form.detalle_nota}
              onChange={(e) => setForm({ ...form, detalle_nota: e.target.value })}
              rows={3}
              className={`${inputStyles} resize-none`}
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-white border-t border-slate-200/60 shrink-0">
          <button
            type="button"
            onClick={validarYGuardar}
            disabled={saving}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-bold py-3 px-4 rounded-xl transition shadow-sm flex justify-center items-center gap-1.5 active:scale-[0.99]"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Sincronizando con Google Sheets...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Crear Evento</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
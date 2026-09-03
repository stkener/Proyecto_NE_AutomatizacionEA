import { useState, useEffect } from "react";
import {
  X,
  Loader2,
  CheckCircle2,
  CalendarDays,
  User,
  BookOpen,
  Users,
  FileText,
  AlertCircle
} from "lucide-react";

import { useApp } from "../context/AppContext";

export default function RegistroTutoria({
  open,
  registro,
  onClose,
  onSuccess
}) {
  const { usuarios = [], asistentesActivos, API_URL } = useApp();

  const [saving, setSaving] = useState(false);

  const [errores, setErrores] = useState({
    fecha: false,
    alumno_nombre: false,
    asistentes: false
  });

  const [form, setForm] = useState({
    id: "",
    fecha: "",
    alumno_nombre: "",
    comision: "",
    asistentes: [],
    motivo_consulta: ""
  });

  const obtenerFechaHoy = () => {
  const hoy = new Date();

  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
};

  // ============================================================
  // CARGAR DATOS DEL REGISTRO
  // ============================================================

  useEffect(() => {
    if (!open) return;

    if (registro) {
      let fechaLimpia = registro.fecha || "";

      // Si viene como ISO:
      // 2026-08-14T03:00:00.000Z
      if (String(fechaLimpia).includes("T")) {
        fechaLimpia = String(fechaLimpia).split("T")[0];
      }

      // Si eventualmente viene como Date convertido a string
      if (!fechaLimpia && registro.fecha instanceof Date) {
        const fecha = registro.fecha;

        const anio = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, "0");
        const dia = String(fecha.getDate()).padStart(2, "0");

        fechaLimpia = `${anio}-${mes}-${dia}`;
      }

      const asistentes = registro.asistentes_ids
        ? String(registro.asistentes_ids)
            .split(";")
            .map((id) => String(id).trim())
            .filter(Boolean)
        : [];

      setForm({
        id: registro.id || "",
        fecha: fechaLimpia,
        alumno_nombre: registro.alumno_nombre || "",
        comision: registro.comision || "",
        asistentes,
        motivo_consulta: registro.motivo_consulta || ""
      });
    } else {
      // NUEVO REGISTRO
      setForm({
        id: "",
        fecha: obtenerFechaHoy(),
        alumno_nombre: "",
        comision: "",
        asistentes: [],
        motivo_consulta: ""
      });
    }

    setErrores({
      fecha: false,
      alumno_nombre: false,
      asistentes: false
    });
  }, [open, registro]);

  // ============================================================
  // BLOQUEAR SCROLL DEL FONDO
  // ============================================================

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!open) return null;

  // ============================================================
  // SOLO ALUMNOS ASISTENTES
  // ============================================================

  const asistentesDisponibles = asistentesActivos;

  // ============================================================
  // SELECCIONAR / DESELECCIONAR ASISTENTE
  // ============================================================

  const toggleAsistente = (id) => {
    const idString = String(id);

    const existe = form.asistentes.includes(idString);

    if (existe) {
      setForm((prev) => ({
        ...prev,
        asistentes: prev.asistentes.filter(
          (asistenteId) => asistenteId !== idString
        )
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        asistentes: [...prev.asistentes, idString]
      }));
    }

    setErrores((prev) => ({
      ...prev,
      asistentes: false
    }));
  };

  // ============================================================
  // VALIDAR Y GUARDAR
  // ============================================================

  const validarYGuardar = async () => {
    const hayErrorFecha = !form.fecha;
    const hayErrorAlumno = !form.alumno_nombre.trim();
    const hayErrorAsistentes = form.asistentes.length === 0;

    setErrores({
      fecha: hayErrorFecha,
      alumno_nombre: hayErrorAlumno,
      asistentes: hayErrorAsistentes
    });

    if (
      hayErrorFecha ||
      hayErrorAlumno ||
      hayErrorAsistentes
    ) {
      return;
    }

    try {
      setSaving(true);

      // ========================================================
      // NUEVO REGISTRO
      // ========================================================

      if (!registro) {
        const response = await fetch(API_URL, {
          method: "POST",
          body: JSON.stringify({
            accion: "guardar_registro_tutoria",
            fecha: form.fecha,
            asistentes_ids: form.asistentes.join(";"),
            alumno_nombre: form.alumno_nombre.trim(),
            comision: form.comision.trim(),
            motivo_consulta: form.motivo_consulta.trim()
          })
        });

        const result = await response.json();

        if (!result.ok) {
          throw new Error(
            result.mensaje ||
            result.error ||
            "No se pudo guardar el registro"
          );
        }

        if (onSuccess) {
          await onSuccess(result.registro);
        }

        onClose();
        return;
      }

      // ========================================================
      // EDICIÓN
      // ========================================================
      //
      // La acción de Apps Script para editar registros todavía
      // la vamos a implementar. Dejamos preparada la estructura.
      //

      const response = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
          accion: "editar_registro_tutoria",
          id: form.id,
          fecha: form.fecha,
          asistentes_ids: form.asistentes.join(";"),
          alumno_nombre: form.alumno_nombre.trim(),
          comision: form.comision.trim(),
          motivo_consulta: form.motivo_consulta.trim()
        })
      });

      const result = await response.json();

      if (!result.ok) {
        throw new Error(
          result.mensaje ||
          result.error ||
          "No se pudo actualizar el registro"
        );
      }

      if (onSuccess) {
        await onSuccess(result.registro);
      }

      onClose();

    } catch (error) {
      console.error("Error al guardar registro de tutoría:", error);

      alert(
        error.message ||
        "No se pudo guardar el registro de tutoría."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // ESTILOS
  // ============================================================

  const inputStyles =
    "w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium tracking-tight outline-none transition focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder:text-slate-400 shadow-3xs";

  const inputErrorStyles =
    "border-rose-300 bg-rose-50/20 focus:ring-rose-400 focus:border-transparent";

  const labelStyles =
    "text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5 mb-1.5";

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-center items-center p-4 z-50">

      <div className="bg-slate-50/95 border border-slate-200/90 rounded-3xl w-full max-w-xl shadow-xl overflow-hidden tracking-tight max-h-[90vh] flex flex-col">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="flex justify-between items-center border-b border-slate-200/60 bg-white px-5 py-4 shrink-0">

          <div className="flex items-center gap-2.5">

            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100/40">
              <BookOpen className="w-4 h-4" />
            </div>

            <h2 className="text-base font-black text-slate-800 leading-none">
              {registro
                ? "Editar Registro de Tutoría"
                : "Nuevo Registro de Tutoría"}
            </h2>

          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition active:scale-95 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>

        </div>

        {/* ======================================================
            CONTENIDO SCROLLEABLE
        ====================================================== */}

        <div className="overflow-y-auto p-5 space-y-4 flex-1">

          {/* ====================================================
              FECHA
          ==================================================== */}

          <div>

  <label className={labelStyles}>
    <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
    Fecha
  </label>

  <div className={inputStyles}>
    {form.fecha
      ? (() => {
          const [anio, mes, dia] = form.fecha.split("-");
          return `${dia}/${mes}/${anio}`;
        })()
      : ""}
  </div>

</div>

          {/* ====================================================
              ESTUDIANTE
          ==================================================== */}

          <div>

            <label className={labelStyles}>
              <User className="w-3.5 h-3.5 text-slate-400" />
              Estudiante
            </label>

            <input
              type="text"
              placeholder="Nombre y apellido del estudiante"
              value={form.alumno_nombre}
              onChange={(e) => {
                setForm({
                  ...form,
                  alumno_nombre: e.target.value
                });

                if (e.target.value.trim()) {
                  setErrores((prev) => ({
                    ...prev,
                    alumno_nombre: false
                  }));
                }
              }}
              className={`${inputStyles} ${
                errores.alumno_nombre
                  ? inputErrorStyles
                  : ""
              }`}
            />

            {errores.alumno_nombre && (
              <span className="text-[10px] text-rose-500 font-bold flex items-center gap-1 mt-1.5 animate-fade-in">
                <AlertCircle className="w-3 h-3 shrink-0" />
                Falta ingresar el nombre del estudiante
              </span>
            )}

          </div>

          {/* ====================================================
              COMISIÓN
          ==================================================== */}

          <div>

            <label className={labelStyles}>
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              Comisión
            </label>

            <input
              type="text"
              placeholder="Ej: Com. 14"
              value={form.comision}
              onChange={(e) =>
                setForm({
                  ...form,
                  comision: e.target.value
                })
              }
              className={inputStyles}
            />

          </div>

          {/* ====================================================
              ASISTENTES
          ==================================================== */}

          <div>

            <label className={labelStyles}>
              <Users className="w-3.5 h-3.5 text-slate-400" />
              Encargado/s de tutoría
            </label>

            <div className="flex flex-wrap gap-1.5 p-3.5 bg-white border border-slate-200 rounded-2xl max-h-48 overflow-y-auto shadow-3xs">

              {asistentesDisponibles.length === 0 ? (

                <span className="text-[11px] text-slate-400 italic">
                  No hay estudiantes asistentes disponibles
                </span>

              ) : (

                asistentesDisponibles.map((asistente) => {

                  const id = String(
                    asistente.id_usuarios ||
                    asistente.id
                  );

                  const nombreCompleto =
                    `${asistente.nombre || ""} ${
                      asistente.apellido || ""
                    }`.trim();

                  const seleccionado =
                    form.asistentes.includes(id);

                  return (
                    <button
                      type="button"
                      key={id}
                      onClick={() =>
                        toggleAsistente(id)
                      }
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition active:scale-95 ${
                        seleccionado
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-3xs"
                          : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100"
                      }`}
                    >
                      {nombreCompleto}
                    </button>
                  );
                })

              )}

            </div>

            {errores.asistentes && (
              <span className="text-[10px] text-rose-500 font-bold flex items-center gap-1 mt-1.5 animate-fade-in">
                <AlertCircle className="w-3 h-3 shrink-0" />
                Debe seleccionar al menos un asistente
              </span>
            )}

            <p className="text-[10px] text-slate-400 mt-1.5">
              Podés seleccionar uno o varios estudiantes asistentes.
            </p>

          </div>

          {/* ====================================================
              COMENTARIOS
          ==================================================== */}

          <div>

            <label className={labelStyles}>
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Comentarios
            </label>

            <textarea
              placeholder="Describí brevemente la consulta o lo realizado durante la tutoría..."
              value={form.motivo_consulta}
              onChange={(e) =>
                setForm({
                  ...form,
                  motivo_consulta: e.target.value
                })
              }
              rows={4}
              className={`${inputStyles} resize-none`}
            />

          </div>

        </div>

        {/* ======================================================
            FOOTER
        ====================================================== */}

        <div className="grid grid-cols-2 gap-3 p-4 bg-white border-t border-slate-200/60 shrink-0">

          {/* CANCELAR */}

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="bg-slate-50 hover:bg-slate-100 disabled:bg-slate-100 text-slate-600 disabled:text-slate-400 text-xs font-bold py-2.5 px-4 rounded-xl border border-slate-200 disabled:border-slate-200 transition flex justify-center items-center gap-1.5 active:scale-[0.98]"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancelar</span>
          </button>

          {/* GUARDAR */}

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
                <span>
                  {registro
                    ? "Guardar Cambios"
                    : "Guardar Registro"}
                </span>
              </>
            )}

          </button>

        </div>

      </div>

    </div>
  );
}
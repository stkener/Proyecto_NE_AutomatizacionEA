import React from "react";
import { Loader2 } from "lucide-react";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function ComisionFormModal({
  abierto,
  modoEdicion,
  form,
  setForm,
  onSubmit,
  onCancel,
  guardando,
  docentesActivos
}) {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-base font-black text-slate-800">
          {modoEdicion ? "Editar Comisión" : "Crear Nueva Comisión"}
        </h2>

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">N° Comisión</label>
              <input
                type="text"
                required
                value={form.nro_comision}
                onChange={(e) => setForm({ ...form, nro_comision: e.target.value })}
                placeholder="Ej: 101"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Aula</label>
              <input
                type="text"
                required
                value={form.aula}
                onChange={(e) => setForm({ ...form, aula: e.target.value })}
                placeholder="Ej: TA206"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              />
            </div>
          </div>

          {/*<div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
            <label className="block text-xs font-bold text-slate-500 mb-1">Docente a Cargo</label>
            <div className="flex flex-wrap gap-1.5">
              {docentesActivos.map((docente) => {
                const seleccionado = String(form.docente) === String(docente.id_usuarios);

              return (
                <button
                  type="button"
                  key={docente.id_usuarios}
                  onClick={() =>
                    setForm({
                    ...form,
                    docente: docente.id_usuarios
                  })
                  }
                  className={`text-xs font-semibold px-3 py-1 rounded-lg border transition cursor-pointer ${
                    seleccionado
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {docente.nombre} {docente.apellido}
                </button>
              );
            })}
          </div>*/}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Docente a Cargo</label>

            <select
              required
              value={form.docente}
              onChange={(e) =>
                setForm({
                  ...form,
                  docente: e.target.value
                })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            >
              <option value="">Seleccionar docente...</option>

              {docentesActivos.map((docente) => (
                <option
                  key={docente.id_usuarios}
                  value={docente.id_usuarios}
                >
                  {docente.nombre} {docente.apellido}
                </option>
              ))}
            </select>
          </div>
        
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Día</label>
              <select
                value={form.dia}
                onChange={(e) => setForm({ ...form, dia: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              >
                {DIAS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Hora Desde</label>
              <input
                type="text"
                required
                value={form.hora_desde}
                onChange={(e) => setForm({ ...form, hora_desde: e.target.value })}
                placeholder="16:00"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Hora Hasta</label>
              <input
                type="text"
                required
                value={form.hora_hasta}
                onChange={(e) => setForm({ ...form, hora_hasta: e.target.value })}
                placeholder="18:00"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Modalidad</label>
              <select
                value={form.presencial_virtual}
                onChange={(e) => setForm({ ...form, presencial_virtual: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              >
                <option value="PRESENCIAL">PRESENCIAL</option>
                <option value="VIRTUAL">VIRTUAL</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Enfoque</label>
              <select
                value={form.clasico_ludico}
                onChange={(e) => setForm({ ...form, clasico_ludico: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              >
                <option value="clasico">Clásico</option>
                <option value="ludico">Lúdico</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Estado</label>
              <select
                value={form.activo}
                onChange={(e) => setForm({ ...form, activo: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              >
                <option value="TRUE">Activa</option>
                <option value="FALSE">Inactiva</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {guardando && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{modoEdicion ? "Guardar Cambios" : "Crear"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

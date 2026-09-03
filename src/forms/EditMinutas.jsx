import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { useApp } from "../context/AppContext";
import { X, CheckCircle2, ClipboardList } from "lucide-react";
import StarterKit from "@tiptap/starter-kit";

function EditMinuta({ minuta, onClose, onSave }) {
  const [seleccionados, setSeleccionados] = useState(
    Array.isArray(minuta.participantes)
      ? minuta.participantes.map(Number)
      : minuta.participantes
      ? String(minuta.participantes).split(";").map(Number)
      : []
  );
  const [guardando, setGuardando] = useState(false);
  const { asistentesActivos } = useApp();

  const editor = useEditor({
    extensions: [StarterKit],
    content: minuta.temasTratados || "",
  });

  const toggleAsistente = (id) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (seleccionados.length === 0) {
      alert("Debés seleccionar al menos un participante.");
      return;
    }

    const contenidoTexto = editor?.getText().trim();

    if (!contenidoTexto) {
      alert("Debés completar los temas tratados.");
      return;
    }

    const minutaActualizada = {
      ...minuta,
      participantes: seleccionados.join(";"),
      temasTratados: editor.getHTML(),
      updatedAt: new Date().toISOString(),
    };

    setGuardando(true);

    try {
      await onSave(minutaActualizada);
      onClose();
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-100">
        {/* Header */}
        <div className="bg-slate-50 flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <ClipboardList size={18} />
            </div>
            <h2 className="text-base font-black text-slate-900">
              Editar minuta
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-6 flex-1 overflow-y-auto"
        >
          {/* Fecha */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
              Fecha de reunión
            </label>
            <input
              type="text"
              disabled
              value={minuta.fecha}
              className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-xs text-slate-700 font-semibold"
            />
          </div>

          {/* Participantes */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
              Participantes presentes
            </label>
            <div className="border border-slate-200/80 rounded-xl bg-slate-50/50 p-3">
              <div className="flex flex-wrap gap-1.5">
                {asistentesActivos.map((a) => {
                  const activo = seleccionados.includes(Number(a.id_usuarios));
                  return (
                    <button
                      type="button"
                      key={a.id_usuarios}
                      onClick={() => toggleAsistente(Number(a.id_usuarios))}
                      className={`text-xs font-semibold px-3 py-1 rounded-lg border transition cursor-pointer ${
                        activo
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {a.nombre}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Temas tratados */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
              Temas tratados
            </label>

            <div className="border border-slate-200 rounded-t-xl p-1.5 flex gap-1 bg-slate-50 flex-wrap text-xs">
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className="px-2.5 py-1 border border-slate-200 rounded-lg hover:bg-white bg-white font-bold"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className="px-2.5 py-1 border border-slate-200 rounded-lg hover:bg-white bg-white italic"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className="px-2.5 py-1 border border-slate-200 rounded-lg hover:bg-white bg-white"
              >
                • Lista
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                className="px-2.5 py-1 border border-slate-200 rounded-lg hover:bg-white bg-white"
              >
                1. Lista
              </button>
            </div>

            <div className="border border-slate-200 border-t-0 rounded-b-xl min-h-[160px] max-h-[220px] overflow-y-auto p-3 text-xs">
              <EditorContent editor={editor} />
            </div>
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={guardando}
              className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-bold py-2 px-4 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 size={15} />
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditMinuta;
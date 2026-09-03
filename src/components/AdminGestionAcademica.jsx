import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import {
  BookOpen,
  Plus,
  Search,
  Users,
  Clock,
  CalendarRange,
  Trash2,
} from "lucide-react";

import {
  obtenerNombreDocente,
  formatearHora,
  obtenerSiguienteId,
} from "../utils/academicoUtils";
import ComisionesTable from "./ComisionesTable";
import TutoriasTable from "./TutoriasTable";
import ComisionFormModal from "../forms/ComisionFormModal";
import TutoriaFormModal from "../forms/TutoriaFormModal";
import ConfirmarEliminarModal from "../forms/ConfirmarEliminarModal";
import GenerarCuatrimestre from "../forms/GenerarCuatrimestre";

export default function AdminGestionAcademica() {
  const {
    comisiones = [],
    tutorias = [],
    usuarios = [],
    refreshDatos,
    eliminarTodosEventos,
    API_URL,
    docentesActivos
  } = useApp();

  // Estado para alternar entre pestañas
  const [tabActiva, setTabActiva] = useState("comisiones"); // 'comisiones' | 'tutorias'

  // Filtros de búsqueda
  const [busqueda, setBusqueda] = useState("");

  // Modales
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState(null);
  const [modalCuatrimestre, setModalCuatrimestre] = useState(false);

  // Estados de carga
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  // Formulario de Comisiones
  const [formComision, setFormComision] = useState({
    id_comisiones: "",
    nro_comision: "",
    aula: "",
    docente: "",
    presencial_virtual: "PRESENCIAL",
    clasico_ludico: "clasico",
    dia: "Lunes",
    hora_desde: "16:00",
    hora_hasta: "18:00",
    activo: "TRUE",
  });

  // Formulario de Tutorías
  const [formTutoria, setFormTutoria] = useState({
    id_tutorias: "",
    dia: "Lunes",
    horario: "12:00",
    aula: "",
    activo: "TRUE",
  });

  // --- FILTRADO DE DATOS ---
  const comisionesFiltradas = useMemo(() => {
    const termino = busqueda.toLowerCase().trim();

    return comisiones.filter((c) => {
      const nombreDocente = obtenerNombreDocente(
        c.docente,
        usuarios,
      ).toLowerCase();
      const idDocente = String(c.docente || "").toLowerCase();
      const aula = String(c.aula || "").toLowerCase();
      const nroComision = String(c.nro_comision || "").toLowerCase();
      const dia = String(c.dia || "").toLowerCase();

      return (
        nombreDocente.includes(termino) ||
        idDocente.includes(termino) ||
        aula.includes(termino) ||
        nroComision.includes(termino) ||
        dia.includes(termino)
      );
    });
  }, [comisiones, usuarios, busqueda]);

  const tutoriasFiltradas = useMemo(() => {
    return tutorias.filter((t) => {
      const q = busqueda.toLowerCase();
      const dia = (t.dia || "").toLowerCase();
      const aula = (t.aula || "").toLowerCase();
      const horario = formatearHora(t.horario || "").toLowerCase();
      return dia.includes(q) || aula.includes(q) || horario.includes(q);
    });
  }, [tutorias, busqueda]);

  // --- MANEJO DE MODALES ---
  const abrirModalCrear = () => {
    if (tabActiva === "comisiones") {
      setFormComision({
        id_comisiones: obtenerSiguienteId(comisiones, "id_comisiones"),
        nro_comision: "",
        aula: "",
        docente: "",
        presencial_virtual: "PRESENCIAL",
        clasico_ludico: "clasico",
        dia: "Lunes",
        hora_desde: "08:00",
        hora_hasta: "12:00",
        activo: "TRUE",
      });
    } else {
      setFormTutoria({
        id_tutorias: obtenerSiguienteId(tutorias, "id_tutorias"),
        dia: "Lunes",
        horario: "12:00 a 14:00",
        aula: "",
        activo: "TRUE",
      });
    }
    setModoEdicion(false);
    setModalAbierto(true);
  };

  const abrirModalEditar = (item) => {
    setItemSeleccionado(item);
    let valorActivo = "TRUE";
    if (
      item.activo === false ||
      item.activo === "FALSE" ||
      item.activo === "inactivo"
    ) {
      valorActivo = "FALSE";
    }

    if (tabActiva === "comisiones") {
      setFormComision({
        id_comisiones: item.id_comisiones || item.id || "",
        nro_comision: item.nro_comision || "",
        aula: item.aula || "",
        docente: item.docente || "",
        presencial_virtual: item.presencial_virtual || "PRESENCIAL",
        clasico_ludico: item.clasico_ludico || "clasico",
        dia: item.dia || "Lunes",
        hora_desde: formatearHora(item.hora_desde) || "",
        hora_hasta: formatearHora(item.hora_hasta) || "",
        activo: valorActivo,
      });
    } else {
      setFormTutoria({
        id_tutorias: item.id_tutorias || item.id || "",
        dia: item.dia || "Lunes",
        horario: formatearHora(item.horario) || "",
        aula: item.aula || "",
        activo: valorActivo,
      });
    }
    setModoEdicion(true);
    setModalAbierto(true);
  };

  const abrirModalEliminar = (item) => {
    setItemSeleccionado(item);
    setModalEliminar(true);
  };

  // --- GUARDAR (Crear / Editar) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);

    const esComision = tabActiva === "comisiones";
    const accion = modoEdicion
      ? esComision
        ? "editar_comision"
        : "editar_tutoria"
      : esComision
        ? "crear_comision"
        : "crear_tutoria";

    const payload = {
      accion,
      ...(esComision ? formComision : formTutoria),
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        mode: "cors",
        redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.ok) {
        await refreshDatos(true);
        setModalAbierto(false);
      } else {
        alert("Error: " + (data.mensaje || "No se pudo procesar la solicitud"));
      }
    } catch (err) {
      console.error("Error al guardar:", err);
      alert("Error de conexión al guardar.");
    } finally {
      setGuardando(false);
    }
  };

  // --- ELIMINAR ---
  const handleEliminar = async () => {
    if (!itemSeleccionado) return;
    setEliminando(true);

    const esComision = tabActiva === "comisiones";
    const idField = esComision ? "id_comisiones" : "id_tutorias";
    const targetId = itemSeleccionado[idField] || itemSeleccionado.id;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        mode: "cors",
        redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          accion: esComision ? "eliminar_comision" : "eliminar_tutoria",
          [idField]: targetId,
          id: targetId,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        await refreshDatos(true);
        setModalEliminar(false);
        setItemSeleccionado(null);
      } else {
        alert("Error: " + (data.mensaje || "No se pudo eliminar el elemento"));
      }
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert("Error de conexión al eliminar.");
    } finally {
      setEliminando(false);
    }
  };

  const handleEliminarCuatrimestre = async () => {
  const confirmar = window.confirm(
    "¿Está seguro de que desea eliminar todos los eventos del calendario?"
  );

  if (!confirmar) return;

  try {
    await eliminarTodosEventos();

    alert("Todos los eventos del calendario fueron eliminados correctamente.");
  } catch (error) {
    console.error("Error al eliminar el cuatrimestre:", error);

    alert(
      error.message || "No se pudieron eliminar los eventos del calendario."
    );
  }
};

  return (
    <div className="max-w-6xl mx-auto p-4 tracking-tight">
      {/* HEADER DE LA SECCIÓN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Gestión Académica
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Administra los horarios, aulas y asignaciones de comisiones y
            tutorías fijas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalCuatrimestre(true)}
            title="Generar todos los eventos del cuatrimestre a partir de las comisiones y tutorías activas"
            className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <CalendarRange className="w-4 h-4 text-indigo-600" />
            <span>Generar Cuatrimestre</span>
          </button>

          <button
            onClick={handleEliminarCuatrimestre}
            title="Eliminar todos los eventos del calendario"
            className="bg-white hover:bg-rose-50 text-rose-600 font-bold text-xs px-4 py-2.5 rounded-xl border border-rose-200 shadow-xs transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Eliminar Cuatrimestre</span>
          </button>

          <button
            onClick={abrirModalCrear}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>
              {tabActiva === "comisiones" ? "Nueva Comisión" : "Nueva Tutoría"}
            </span>
          </button>
        </div>
      </div>

      {/* PESTAÑAS Y BUSCADOR */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-5">
        <div className="bg-slate-200/70 p-1 rounded-xl flex gap-1 w-full sm:w-auto">
          <button
            onClick={() => {
              setTabActiva("comisiones");
              setBusqueda("");
            }}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-extrabold transition flex items-center justify-center gap-2 cursor-pointer ${
              tabActiva === "comisiones"
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Comisiones ({comisiones.length})
          </button>
          <button
            onClick={() => {
              setTabActiva("tutorias");
              setBusqueda("");
            }}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-extrabold transition flex items-center justify-center gap-2 cursor-pointer ${
              tabActiva === "tutorias"
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Tutorías ({tutorias.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={
              tabActiva === "comisiones"
                ? "Buscar comision, docente, aula..."
                : "Buscar día, aula o horario..."
            }
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-2xs"
          />
        </div>
      </div>

      {/* TABLA ACTIVA */}
      {tabActiva === "comisiones" ? (
        <ComisionesTable
          comisiones={comisionesFiltradas}
          usuarios={usuarios}
          onEditar={abrirModalEditar}
          onEliminar={abrirModalEliminar}
        />
      ) : (
        <TutoriasTable
          tutorias={tutoriasFiltradas}
          onEditar={abrirModalEditar}
          onEliminar={abrirModalEliminar}
        />
      )}

      {/* MODAL CREAR / EDITAR (según pestaña activa) */}
      {tabActiva === "comisiones" ? (
        <ComisionFormModal
          abierto={modalAbierto}
          modoEdicion={modoEdicion}
          form={formComision}
          setForm={setFormComision}
          onSubmit={handleSubmit}
          onCancel={() => setModalAbierto(false)}
          guardando={guardando}
          docentesActivos={docentesActivos}
        />
      ) : (
        <TutoriaFormModal
          abierto={modalAbierto}
          modoEdicion={modoEdicion}
          form={formTutoria}
          setForm={setFormTutoria}
          onSubmit={handleSubmit}
          onCancel={() => setModalAbierto(false)}
          guardando={guardando}
        />
      )}

      {/* MODAL ELIMINAR (compartido) */}
      <ConfirmarEliminarModal
        abierto={modalEliminar}
        tabActiva={tabActiva}
        item={itemSeleccionado}
        onCancel={() => setModalEliminar(false)}
        onConfirm={handleEliminar}
        eliminando={eliminando}
      />

      {/* MODAL GENERAR CUATRIMESTRE */}
      <GenerarCuatrimestre
        open={modalCuatrimestre}
        onClose={() => setModalCuatrimestre(false)}
        onSuccess={() => refreshDatos(true)}
        comisiones={comisiones}
        tutorias={tutorias}
        usuarios={usuarios}
        asistentes={usuarios.filter((u) => u.rol === "asistente")}
      />
    </div>
  );
}

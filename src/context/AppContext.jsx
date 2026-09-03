import { createContext, useState, useEffect, useContext } from "react";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [datosGlobales, setDatosGlobales] = useState({
    eventos: [],
    usuarios: [],
    comisiones: [],
    tutorias: [],
    tareas: [],
    minutas: [],
    registroTutorias: [],
    totalMinutas: 0,
    paginaMinutas: 1,
    totalPaginasMinutas: 1,
  });
  const [loading, setLoading] = useState(true);

  const API_URL =
    "https://script.google.com/macros/s/AKfycbwJpkMBS-3n5GkyOlEd8aOJD4Y_0MF1Ip00weO_jaO17wNZB2Zh-peZv8Vwy5x_pKYd_A/exec";

   const asistentesActivos = datosGlobales.usuarios.filter((usuario) => {
    const rol = String(usuario.rol || "").trim().toLowerCase();

    return (
      (rol === "asistente" || rol === "administrador") &&
      usuario.activo === true
    );
  });

  const docentesActivos = datosGlobales.usuarios.filter((usuario) => {
  const rol = String(usuario.rol || "").trim().toLowerCase();

  return rol === "docente" && usuario.activo === true;
});
  
    // Carga de datos con soporte de paginación explícita
  const refreshDatos = async (silencioso = false) => {
    try {
      if (!silencioso) setLoading(true);

      const res = await fetch(API_URL);
      const data = await res.json();

      setDatosGlobales((prev) => ({
        ...prev,
        eventos: data.eventos || prev.eventos,
        usuarios: data.usuarios || prev.usuarios,
        comisiones: data.comisiones || prev.comisiones,
        tutorias: data.tutorias || prev.tutorias,
        tareas: data.tareas || prev.tareas,
        registroTutorias: data.registroTutorias || prev.registroTutorias,
        calendario: data.calendario || prev.calendario,
        minutas: data.minutas || [], // Se guardan todas en el estado local
      }));
    } catch (err) {
      console.error("Error cargando estado global:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshDatos(false, 1, 5);
  }, []);

  const agregarTareaLocal = (nuevaTarea) => {
    setDatosGlobales((prev) => ({
      ...prev,
      tareas: [...prev.tareas, nuevaTarea],
    }));
  };

  const editarTareaLocal = (tareaModificada) => {
    setDatosGlobales((prev) => ({
      ...prev,
      tareas: prev.tareas.map((t) =>
        Number(t.id_tareas) === Number(tareaModificada.id_tareas)
          ? tareaModificada
          : t
      ),
    }));
  };

  const eliminarTareaLocal = (idEliminado) => {
    setDatosGlobales((prev) => ({
      ...prev,
      tareas: prev.tareas.filter(
        (t) => Number(t.id_tareas) !== Number(idEliminado)
      ),
    }));
  };

  const actualizarEventoLocal = (eventoActualizado) => {
    setDatosGlobales((prev) => ({
      ...prev,
      eventos: prev.eventos.map((evento) =>
        Number(evento.id_calendario) === Number(eventoActualizado.id_calendario)
          ? { ...evento, asistente_id: eventoActualizado.asistente_id }
          : evento
      ),
    }));
  };

  const actualizarCalendarioLocal = (eventoActualizado) => {
  setDatosGlobales((prev) => ({
    ...prev,
    calendario: prev.calendario.map((evento) =>
      Number(evento.id_calendario) === Number(eventoActualizado.id_calendario)
        ? {
            ...evento,
            asistente_id: eventoActualizado.asistente_id,
            asistentes: eventoActualizado.asistentes,
          }
        : evento
    ),
  }));
};

  const editarEvento = async (datos) => {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ accion: "editarEvento", ...datos }),
    });
    const result = await response.json();
    if (!result.ok) throw new Error(result.error);
    return result;
  };

  const eliminarEvento = async (id) => {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ accion: "eliminar_evento", id }),
    });
    const result = await response.json();
    if (!result.ok) throw new Error(result.mensaje || "Error al eliminar");
    await refreshDatos(true);
    return result;
  };

  const eliminarTodosEventos = async () => {
  const response = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      accion: "eliminar_todos_eventos"
    })
  });

  const result = await response.json();

  if (!result.ok) {
    throw new Error(
      result.mensaje || result.error || "No se pudieron eliminar los eventos"
    );
  }

  // Actualizamos el frontend inmediatamente
  setDatosGlobales(prev => ({
    ...prev,
    eventos: [],
    calendario: []
  }));

  return result;
};

  const agregarMinutaLocal = (nuevaMinuta) => {
    setDatosGlobales((prev) => ({
      ...prev,
      minutas: [nuevaMinuta, ...prev.minutas],
      totalMinutas: prev.totalMinutas + 1,
    }));
  };

  const actualizarMinutaLocal = (minutaActualizada) => {
    setDatosGlobales((prev) => ({
      ...prev,
      minutas: prev.minutas.map((m) =>
        Number(m.id) === Number(minutaActualizada.id) ? minutaActualizada : m
      ),
    }));
  };

  const agregarRegistroTutoriaLocal = (nuevoRegistro) => {
    setDatosGlobales((prev) => ({
      ...prev,
      registroTutorias: [nuevoRegistro, ...prev.registroTutorias],
    }));
  };

  const editarRegistroTutoriaLocal = (registroModificado) => {
    setDatosGlobales((prev) => ({
      ...prev,
      registroTutorias: prev.registroTutorias.map((registro) =>
        Number(registro.id) === Number(registroModificado.id)
          ? registroModificado
          : registro
      ),
    }));
  };

  return (
    <AppContext.Provider
      value={{
        ...datosGlobales,
        loading,
        API_URL,
        asistentesActivos,
        docentesActivos,
        refreshDatos,
        actualizarCalendarioLocal,
        agregarTareaLocal,
        editarTareaLocal,
        eliminarTareaLocal,
        actualizarEventoLocal,
        editarEvento,
        eliminarEvento,
        eliminarTodosEventos,
        agregarRegistroTutoriaLocal,
        editarRegistroTutoriaLocal,
        agregarMinutaLocal,
        actualizarMinutaLocal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
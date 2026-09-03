import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { useAuthorization } from "../context/AuthorizationContext";
import AddEvento from "../forms/AddEvento";
import EditEvento from "../forms/EditEvento";
import Login from "../pages/Login";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Loader2,
  MapPin,
  Plus,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  PencilLine
} from "lucide-react";

const COLORES_PASTEL = {
  tutoria: { bg: "bg-purple-100/90 text-purple-700 border-purple-200", dot: "bg-purple-400" },
  comision: { bg: "bg-blue-100/90 text-blue-700 border-blue-200", dot: "bg-blue-400" },
  reunion: { bg: "bg-emerald-100/90 text-emerald-700 border-emerald-200", dot: "bg-emerald-400" },
  encuentro: { bg: "bg-amber-100/90 text-amber-700 border-amber-200", dot: "bg-amber-400" },
  otro: { bg: "bg-slate-100 text-slate-700 border-slate-200", dot: "bg-slate-400" }
};

function CalendarioAsistentes() {
  // Extraemos todo el set de datos globales y la función de refresh del Contexto
  const { 
    calendario, 
    usuarios, 
    asistentesActivos,
    comisiones, 
    tutorias, 
    loading, 
    refreshDatos 
  } = useApp();

  const { autorizado } = useAuthorization();

  const [isSyncing, setIsSyncing] = useState(false);
  
  const [fechaActual, setFechaActual] = useState(new Date());
  const [diaSeleccionado, setDiaSeleccionado] = useState(new Date());

  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [eventoEditar, setEventoEditar] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  // Botón manual de sincronizar
  const handleSincronizarManual = async () => {
    setIsSyncing(true);
    await refreshDatos(true);
    setIsSyncing(false);
  };

  // Actualización silenciosa en segundo plano cada 30 segundos
  useEffect(() => {
    const intervalo = setInterval(() => {
      refreshDatos(true);
    }, 30000);

    return () => clearInterval(intervalo);
  }, [refreshDatos]);

  const año = fechaActual.getFullYear();
  const mes = fechaActual.getMonth();

  const nombresMeses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const primerDiaIndex = new Date(año, mes, 1).getDay();
  const diasEnMes = new Date(año, mes + 1, 0).getDate();
  const ajustePrimerDia = primerDiaIndex === 0 ? 6 : primerDiaIndex - 1;

  const celdasCalendario = [];
  for (let i = 0; i < ajustePrimerDia; i++) celdasCalendario.push(null);
  for (let d = 1; d <= diasEnMes; d++) celdasCalendario.push(new Date(año, mes, d));

  const normalizarFecha = (fechaStr) => {
    if (!fechaStr) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) return fechaStr;
    
    const partes = fechaStr.split("/");
    if (partes.length === 3) {
      const dia = partes[0].padStart(2, "0");
      const mes = partes[1].padStart(2, "0");
      const año = partes[2];
      return `${año}-${mes}-${dia}`;
    }
    
    try {
      const d = new Date(fechaStr);
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const r = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${r}`;
      }
    } catch (e) {}
    
    return fechaStr;
  };

  const normalizarTipo = (tipoStr) => {
    if (!tipoStr) return "otro";
    return tipoStr
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  const obtenerEventosDelDia = (fechaCelda) => {
    if (!fechaCelda) return [];
    
    const yyyy = fechaCelda.getFullYear();
    const mm = String(fechaCelda.getMonth() + 1).padStart(2, "0");
    const dd = String(fechaCelda.getDate()).padStart(2, "0");
    const stringCelda = `${yyyy}-${mm}-${dd}`;

    return calendario.filter((item) => {
      
      const fechaNormalizada = normalizarFecha(item.fecha || item.fecha_dia);
      return fechaNormalizada === stringCelda;
    });
  };

  const cambiarMes = (direccion) => {
    const nuevaFecha = new Date(año, mes + direccion, 1);
    setFechaActual(nuevaFecha);
    setDiaSeleccionado(nuevaFecha);
  };

  // Loader principal controlado de forma global
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400 font-medium tracking-tight">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
        <span className="text-xs bg-white text-slate-500 px-4 py-1.5 rounded-full border border-slate-200/60 shadow-3xs">
          Conectando con Google Sheets...
        </span>
      </div>
    );

  const eventosDiaSeleccionado = obtenerEventosDelDia(diaSeleccionado);
  console.log(eventosDiaSeleccionado);

  return (
    <div className="max-w-6xl mx-auto p-4 tracking-tight bg-slate-50/50 rounded-3xl border border-slate-200">
      
      {/* HEADER SUPERIOR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100/40">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-xl font-black text-slate-800 leading-none">{nombresMeses[mes]}</h1>
            <span className="text-sm font-mono text-slate-400 font-normal">· {año}</span>
          </div>
        </div>
        
        {/* BOTONERA CON CONTROLES DE SINCRONIZACIÓN */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex bg-white border border-slate-200 rounded-lg p-0.5 shadow-3xs">
            <button onClick={() => cambiarMes(-1)} className="p-1.5 hover:bg-slate-50 rounded text-slate-500 transition">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => cambiarMes(1)} className="p-1.5 hover:bg-slate-50 rounded text-slate-500 transition">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={handleSincronizarManual}
              disabled={isSyncing}
              title="Sincronizar con Google Sheets"
              className="p-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-lg shadow-3xs transition active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin text-indigo-500" : ""}`} />
            </button>

            <button 
              //onClick={() => setShowModal(true)}
              onClick={() => {
                if (autorizado) {
                  setShowModal(true);
                } else {
                  setShowLogin(true);
                }
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition shadow-xs flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo evento</span>
            </button>
          </div>
        </div>
      </div>

      {/* EVENTOS */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] font-bold text-slate-500 mb-5 px-1 border-b border-slate-100 pb-3">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-purple-400" /> Tutoría</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-blue-400" /> Comisión</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-emerald-400" /> Reunión</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-amber-400" /> Encuentro</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-slate-400" /> Otro</span>
      </div>

      {/* CONTENEDOR COLUMNAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* CALENDARIO */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
          <div className="grid grid-cols-7 bg-sky-100/90 border-b border-sky-200 text-center text-[11px] font-extrabold py-2.5 text-sky-800 tracking-wider">
            <div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div><div>Dom</div>
          </div>

          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 bg-slate-50/10">
            {celdasCalendario.map((fechaCelda, index) => {
              const eventos = obtenerEventosDelDia(fechaCelda);
              const esHoy = fechaCelda && fechaCelda.toDateString() === new Date().toDateString();
              const esSeleccionado = fechaCelda && diaSeleccionado && fechaCelda.toDateString() === diaSeleccionado.toDateString();

              let bgCasillero = "bg-white";
              if (!fechaCelda) bgCasillero = "bg-slate-50/60 pointer-events-none";
              else if (esSeleccionado) bgCasillero = "bg-indigo-50/40";
              else if (esHoy) bgCasillero = "bg-emerald-50/20";

              return (
                <div
                  key={index}
                  onClick={() => fechaCelda && setDiaSeleccionado(fechaCelda)}
                  className={`min-h-[70px] sm:min-h-[82px] p-1.5 flex flex-col justify-between relative cursor-pointer transition-all ${bgCasillero} ${
                    fechaCelda && !esSeleccionado ? "hover:bg-slate-50/80" : ""
                  } ${esSeleccionado ? "ring-2 ring-indigo-400 ring-inset z-10" : ""} ${
                    esHoy && !esSeleccionado ? "border border-emerald-400/80 z-10" : ""
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                      esHoy ? "bg-emerald-500 text-white shadow-3xs" : esSeleccionado ? "text-indigo-600 font-extrabold" : "text-slate-400"
                    }`}>
                      {fechaCelda ? fechaCelda.getDate() : ""}
                    </span>
                    
                    <div className="flex sm:hidden gap-0.5">
                      {eventos.map((ev, i) => {
                        const tipoLimpio = normalizarTipo(ev.tipo);
                        const config = COLORES_PASTEL[tipoLimpio] || COLORES_PASTEL.otro;
                        return <span key={i} className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />;
                      })}
                    </div>
                  </div>

                  <div className="hidden sm:block space-y-0.5 mt-1 overflow-hidden">
                    {eventos.slice(0, 2).map((ev, i) => {
                      const tipoLimpio = normalizarTipo(ev.tipo);
                      const config = COLORES_PASTEL[tipoLimpio] || COLORES_PASTEL.otro;
                      return (
                        <div 
                          key={i} 
                          className={`text-[9px] px-1.5 py-0.5 rounded border font-bold truncate ${config.bg} ${config.text} ${config.border}`}
                        >
                          <span className="capitalize">{ev.asistentes || "S/A"}</span>
                          <span className="font-normal opacity-80"> ({ev.tipo})</span>
                        </div>
                      );
                    })}
                    {eventos.length > 2 && (
                      <div className="text-[8px] text-center font-bold text-slate-400 bg-slate-50 border border-slate-200 rounded py-0.5">
                        + {eventos.length - 2} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DETALLES SIDEBAR */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between min-h-[380px]">
          <div>
            <div className="border-b border-slate-100 pb-3 mb-4">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">Actividades del día</span>
              <h2 className="text-sm font-black text-slate-700 capitalize flex items-center gap-1.5">
                {diaSeleccionado.toLocaleDateString("es-AR", { weekday: 'long', day: 'numeric', month: 'short' })}
              </h2>
            </div>

            <div className="space-y-3 max-h-[390px] overflow-y-auto pr-1">
              {eventosDiaSeleccionado.length > 0 ? (
                eventosDiaSeleccionado.map((ev, idx) => {
                  const tipoLimpio = normalizarTipo(ev.tipo);
                  const config = COLORES_PASTEL[tipoLimpio] || COLORES_PASTEL.otro;
                  return (
                    <div key={idx} className="p-3 bg-slate-50/60 rounded-xl border border-slate-150 relative space-y-2">
                      
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-black text-slate-800 truncate pr-2">{ev.titulo || "Reunión General"}</h4>
                        
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[9px] px-2 py-0.5 font-bold rounded-full border capitalize ${config.bg} ${config.text} ${config.border}`}>
                            {ev.tipo}
                          </span>
                          
                          <button
                            /*onClick={() => {
                              setEventoEditar(ev);
                              setShowEditModal(true);
                            }}*/
                            onClick={() => {
                              if (autorizado) {
                                setEventoEditar(ev);
                                setShowEditModal(true);
                              } else {
                                setShowLogin(true);
                              }
                            }}
                            title="Editar evento"
                            className="p-1 bg-white hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 border border-slate-200/60 hover:border-indigo-200 rounded-lg shadow-3xs transition active:scale-90"
                          >
                            <PencilLine className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-[11px] text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{ev.horario || "Horario a confirmar"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Aula: <strong className="text-slate-700">{ev.aula || "Virtual / Meet"}</strong></span>
                        </div>
                        
                        {ev.docente && (
                          <div className="flex items-center gap-1.5 border-t border-slate-150 pt-1.5 mt-1.5 text-[10px]">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>Profesor/a: <strong className="text-slate-600">{ev.docente}</strong></span>
                          </div>
                        )}
                        {ev.asistentes && (
                          <div className="flex items-center gap-1.5 text-[10px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>Asistentes: <strong className="text-indigo-600">{ev.asistentes}</strong></span>
                          </div>
                        )}

                        {ev.detalle && (
                          <div className="mt-2 p-2 bg-amber-50/80 border border-amber-200/70 rounded-lg text-amber-900 text-[10px] flex gap-1 items-start">
                            <MessageSquare className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                            <p className="leading-tight"><span className="font-bold">Detalle:</span> {ev.detalle}</p>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-slate-400 italic text-[11px] bg-slate-50/40 border border-dashed border-slate-200 rounded-xl">
                  No hay actividades agendadas para hoy.
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-center flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>NE / CADU · Calendario Organizativo</span>
          </div>
        </div>

      </div>

      {/* MODALES CON PARÁMETROS SINCRONIZADOS */}
      <AddEvento
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          refreshDatos(true);
        }}
        asistentes={asistentesActivos}
        comisiones={comisiones}
        tutorias={tutorias}
      />

      <EditEvento
        open={showEditModal}
        evento={eventoEditar}
        comisiones={comisiones}
        tutorias={tutorias}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => {
          refreshDatos(true);
          setShowEditModal(false);
        }}
      />
      {showLogin && (
        <Login
          onClose={() => setShowLogin(false)}
        />
      )}
    </div>
  );
}

export default CalendarioAsistentes;
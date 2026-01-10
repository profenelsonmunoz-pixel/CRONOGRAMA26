
import React, { useState, useMemo, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Printer, Settings, PlusCircle, X, Lock, Calendar as CalendarIcon, Clock, MapPin,
  ArrowLeftCircle, ArrowRightCircle, Trash2, LayoutGrid, List as ListIcon, CalendarSearch,
  Edit3, ChevronRight, ArrowUpRight, Download, Eye, Trophy, CalendarDays, Save, BellRing,
  Sparkles, CalendarRange, CalendarClock, Info as InfoIcon, Info, Bell, BellOff, Globe, ChevronDown
} from 'lucide-react';
import { 
  format, eachDayOfInterval, isToday, endOfISOWeek, addMonths,
  isSameMonth, endOfMonth, isSameDay, isAfter, addDays, getDay,
  endOfYear, eachMonthOfInterval, isWithinInterval
} from 'date-fns';
import { es } from 'date-fns/locale/es';
import { motion, AnimatePresence } from 'framer-motion';

// --- TYPES ---
export type EventType = 'academico' | 'institucional' | 'vacaciones' | 'festivo' | 'significativo' | 'efemeride';
export type DisplayMode = 'grid' | 'list' | 'week' | 'year';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: EventType;
  day?: string;
  time?: string;
  location?: string;
  participants?: string;
  observations?: string;
  description?: string;
}

// --- CONSTANTS ---
const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const INITIAL_EVENTS: CalendarEvent[] = [
  // --- FESTIVOS OFICIALES COLOMBIA 2026 ---
  { id: 'f1', title: 'Año Nuevo', start: new Date(2026, 0, 1), end: new Date(2026, 0, 1), type: 'festivo', location: 'Nacional', description: 'Festivo nacional de inicio de año civil.' },
  { id: 'f2', title: 'Día de los Reyes Magos', start: new Date(2026, 0, 12), end: new Date(2026, 0, 12), type: 'festivo', location: 'Nacional', description: 'Traslado del festivo de Reyes según Ley Emiliani.' },
  { id: 'f3', title: 'Día de San José', start: new Date(2026, 2, 23), end: new Date(2026, 2, 23), type: 'festivo', location: 'Nacional', description: 'Homenaje a San José.' },
  { id: 'f4', title: 'Jueves Santo', start: new Date(2026, 3, 2), end: new Date(2026, 3, 2), type: 'festivo', location: 'Nacional', description: 'Día de reflexión y recogimiento espiritual.' },
  { id: 'f5', title: 'Viernes Santo', start: new Date(2026, 3, 3), end: new Date(2026, 3, 3), type: 'festivo', location: 'Nacional', description: 'Día de recogimiento.' },
  { id: 'f6', title: 'Día del Trabajo', start: new Date(2026, 4, 1), end: new Date(2026, 4, 1), type: 'festivo', location: 'Nacional', description: 'Conmemoración de la lucha por los derechos laborales.' },
  { id: 'f7', title: 'Ascensión del Señor', start: new Date(2026, 4, 18), end: new Date(2026, 4, 18), type: 'festivo', location: 'Nacional', description: 'Festivo religioso trasladado.' },
  { id: 'f8', title: 'Corpus Christi', start: new Date(2026, 5, 8), end: new Date(2026, 5, 8), type: 'festivo', location: 'Nacional', description: 'Celebración religiosa del cuerpo de Cristo.' },
  { id: 'f9', title: 'Sagrado Corazón de Jesús', start: new Date(2026, 5, 15), end: new Date(2026, 5, 15), type: 'festivo', location: 'Nacional', description: 'Festivo religioso trasladado.' },
  { id: 'f10', title: 'San Pedro y San Pablo', start: new Date(2026, 5, 29), end: new Date(2026, 5, 29), type: 'festivo', location: 'Nacional', description: 'Homenaje a los apóstoles.' },
  { id: 'f11', title: 'Grito de Independencia', start: new Date(2026, 6, 20), end: new Date(2026, 6, 20), type: 'festivo', location: 'Nacional', description: 'Soberanía nacional de Colombia.' },
  { id: 'f12', title: 'Batalla de Boyacá', start: new Date(2026, 7, 7), end: new Date(2026, 7, 7), type: 'festivo', location: 'Nacional', description: 'Triunfo definitivo de la independencia.' },
  { id: 'f13', title: 'Asunción de la Virgen', start: new Date(2026, 7, 17), end: new Date(2026, 7, 17), type: 'festivo', location: 'Nacional', description: 'Festivo religioso.' },
  { id: 'f14', title: 'Día de la Raza', start: new Date(2026, 9, 12), end: new Date(2026, 9, 12), type: 'festivo', location: 'Nacional', description: 'Respeto a la Diversidad Cultural.' },
  { id: 'f15', title: 'Todos los Santos', start: new Date(2026, 10, 2), end: new Date(2026, 10, 2), type: 'festivo', location: 'Nacional', description: 'Homenaje a los santos.' },
  { id: 'f16', title: 'Independencia de Cartagena', start: new Date(2026, 10, 16), end: new Date(2026, 10, 16), type: 'festivo', location: 'Nacional', description: 'Gesta heróica de la ciudad amurallada.' },
  { id: 'f17', title: 'Inmaculada Concepción', start: new Date(2026, 11, 8), end: new Date(2026, 11, 8), type: 'festivo', location: 'Nacional', description: 'Día de las velitas y homenaje a la Virgen.' },
  { id: 'f18', title: 'Navidad', start: new Date(2026, 11, 25), end: new Date(2026, 11, 25), type: 'festivo', location: 'Nacional', description: 'Nacimiento de Jesús.' },

  // --- EFEMÉRIDES UNESCO / ONU / COLOMBIA ---
  { id: 'e1', title: 'Mujer y la Niña en la Ciencia', start: new Date(2026, 1, 11), end: new Date(2026, 1, 11), type: 'efemeride', description: 'UNESCO: Promover el acceso y la participación plena.' },
  { id: 'e2', title: 'Día de la Lengua Materna', start: new Date(2026, 1, 21), end: new Date(2026, 1, 21), type: 'efemeride', description: 'Preservar la diversidad lingüística mundial.' },
  { id: 'e3', title: 'Día Internacional de la Mujer', start: new Date(2026, 2, 8), end: new Date(2026, 2, 8), type: 'efemeride', description: 'Lucha por la igualdad y el reconocimiento de derechos.' },
  { id: 'e4', title: 'Día Mundial del Agua', start: new Date(2026, 2, 22), end: new Date(2026, 2, 22), type: 'efemeride', description: 'ONU: Concienciar sobre la importancia del agua dulce.' },
  { id: 'e5', title: 'Día Mundial de la Salud', start: new Date(2026, 3, 7), end: new Date(2026, 3, 7), type: 'efemeride', description: 'Aniversario de la creación de la OMS.' },
  { id: 'e6', title: 'Día de la Madre Tierra', start: new Date(2026, 3, 22), end: new Date(2026, 3, 22), type: 'efemeride', description: 'Fomentar la armonía con la naturaleza.' },
  { id: 'e7', title: 'Día del Idioma / Día del Libro', start: new Date(2026, 3, 23), end: new Date(2026, 3, 23), type: 'efemeride', description: 'Homenaje a Miguel de Cervantes y la literatura universal.' },
  { id: 'e8', title: 'Día del Maestro (Colombia)', start: new Date(2026, 4, 15), end: new Date(2026, 4, 15), type: 'efemeride', description: 'Homenaje a San Juan Bautista de La Salle.' },
  { id: 'e9', title: 'Día de la Afrocolombianidad', start: new Date(2026, 4, 21), end: new Date(2026, 4, 21), type: 'efemeride', description: 'Conmemoración de la abolición de la esclavitud.' },
  { id: 'e10', title: 'Día del Medio Ambiente', start: new Date(2026, 5, 5), end: new Date(2026, 5, 5), type: 'efemeride', description: 'Acción global por la protección del planeta.' },
  { id: 'e13', title: 'Día de la Alfabetización', start: new Date(2026, 8, 8), end: new Date(2026, 8, 8), type: 'efemeride', description: 'UNESCO: La alfabetización como derecho humano.' },
  { id: 'e14', title: 'Día Internacional de la Paz', start: new Date(2026, 8, 21), end: new Date(2026, 8, 21), type: 'efemeride', description: 'Fortalecer los ideales de paz en el mundo.' },
  { id: 'e15', title: 'Día Mundial de los Docentes', start: new Date(2026, 9, 5), end: new Date(2026, 9, 5), type: 'efemeride', description: 'Homenaje a la labor docente global.' },
  { id: 'e16', title: 'Día Mundial del Niño', start: new Date(2026, 10, 20), end: new Date(2026, 10, 20), type: 'efemeride', description: 'Aniversario de la Declaración de los Derechos del Niño.' },
  { id: 'e17', title: 'Día de los Derechos Humanos', start: new Date(2026, 11, 10), end: new Date(2026, 11, 10), type: 'efemeride', description: 'Aniversario de la Declaración Universal de DDHH.' },

  // --- CELEBRACIONES INSTITUCIONALES ---
  { id: 's0', title: 'VIRGEN DE LA CANDELARIA (PATRONA)', start: new Date(2026, 1, 2), end: new Date(2026, 1, 2), type: 'significativo', location: 'Candelaria', description: 'Festividad patronal central de la IENSECAN.' },

  // --- SEMANAS DE DESARROLLO INSTITUCIONAL (SDI) ---
  { id: 'sdi_init_start', title: 'INICIO SDI (PLANEACIÓN)', start: new Date(2026, 0, 12), end: new Date(2026, 0, 12), type: 'institucional', location: 'IENSECAN', description: 'Apertura de planeación estratégica 2026.' },
  { id: 'sdi_init_end', title: 'FINAL SDI (PLANEACIÓN)', start: new Date(2026, 0, 23), end: new Date(2026, 0, 23), type: 'institucional', location: 'IENSECAN', description: 'Cierre de bloque de planeación inicial.' },
  { id: 'sdi_ss_start', title: 'SDI (SEMANA SANTA)', start: new Date(2026, 2, 30), end: new Date(2026, 3, 3), type: 'institucional', location: 'IENSECAN', description: 'Jornada técnica de actualización docente.' },
  { id: 'sdi_oct_start', title: 'SDI (RECESO OCTUBRE)', start: new Date(2026, 9, 5), end: new Date(2026, 9, 9), type: 'institucional', location: 'IENSECAN', description: 'Semana de receso institucional y desarrollo.' },
  { id: 'sdi_fin_start', title: 'INICIO SDI (CIERRE ANUAL)', start: new Date(2026, 11, 7), end: new Date(2026, 11, 11), type: 'institucional', location: 'IENSECAN', description: 'Evaluación final de gestión y autoevaluación.' },

  // --- PERIODOS LECTIVOS ---
  { 
    id: 'clases_start_h1', 
    title: 'ACTO DE BIENVENIDA E IZADA DE BANDERA', 
    start: new Date(2026, 0, 26), 
    end: new Date(2026, 0, 26), 
    type: 'academico', 
    time: '06:45',
    location: 'Patio Central Sede Nelson Muñoz', 
    participants: 'Estudiantes, Padres y Docentes',
    description: 'Protocolo oficial de apertura del año lectivo 2026. Saludo de Rectoría.'
  },
  { 
    id: 'clases_start_h2', 
    title: 'INDUCCIÓN POR DIRECTORES DE GRUPO', 
    start: new Date(2026, 0, 26), 
    end: new Date(2026, 0, 26), 
    type: 'academico', 
    time: '08:30',
    location: 'Aulas de Clase', 
    description: 'Entrega de horarios, asignación de pupitres y presentación de planes.'
  },
  { id: 'p1_end', title: 'FINAL 1er PERIODO', start: new Date(2026, 3, 10), end: new Date(2026, 3, 10), type: 'academico', description: 'Cierre del primer trimestre académico 2026.' },
  { id: 'p2_start', title: 'INICIO 2do PERIODO', start: new Date(2026, 3, 13), end: new Date(2026, 3, 13), type: 'academico', description: 'Apertura del segundo ciclo lectivo.' },
  { id: 'p2_end', title: 'FINAL 2do PERIODO', start: new Date(2026, 7, 21), end: new Date(2026, 7, 21), type: 'academico', description: 'Cierre del segundo trimestre académico.' },
  { id: 'p3_start', title: 'INICIO 3er PERIODO', start: new Date(2026, 7, 24), end: new Date(2026, 7, 24), type: 'academico', description: 'Apertura del último tramo del año escolar.' },
  { id: 'p3_end', title: 'FINAL DE CLASES 2026', start: new Date(2026, 11, 4), end: new Date(2026, 11, 4), type: 'academico', description: 'Clausura de clases presenciales con estudiantes.' },

  // --- VACACIONES ---
  { id: 'v1', title: 'Vacaciones Estudiantiles (Junio)', start: new Date(2026, 5, 29), end: new Date(2026, 6, 17), type: 'vacaciones', description: 'Receso escolar de mitad de año para estudiantes.' },
  { id: 'v2', title: 'Receso Escolar Octubre', start: new Date(2026, 9, 5), end: new Date(2026, 9, 9), type: 'vacaciones', description: 'Semana de receso académico para estudiantes.' },
];

const LOCAL_STORAGE_KEY = 'iensecan_calendar_events_2026';
const NOTIFICATIONS_KEY = 'iensecan_notifications_enabled';
const PATRON_DAY = '2026-02-02';

// --- HELPERS ---
const startOfYear = (date: Date): Date => new Date(date.getFullYear(), 0, 1);
const startOfISOWeek = (date: Date): Date => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = d.getDate() - (day === 0 ? 6 : day - 1);
  return new Date(d.setDate(diff));
};
const startOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// --- MAIN COMPONENT ---
function App() {
  const isEmbed = useMemo(() => new URLSearchParams(window.location.search).get('embed') === 'true', []);
  
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved).map((e: any) => ({ ...e, start: new Date(e.start), end: new Date(e.end) }));
      } catch (e) { return INITIAL_EVENTS; }
    }
    return INITIAL_EVENTS;
  });

  const [now, setNow] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [displayMode, setDisplayMode] = useState<DisplayMode>('grid');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ date: Date; events: CalendarEvent[] } | null>(null);
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem(NOTIFICATIONS_KEY) === 'true';
  });

  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(events)); }, [events]);
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  // Notificaciones Logic
  useEffect(() => {
    if (notificationsEnabled) {
      checkUpcomingEvents();
    }
  }, [notificationsEnabled, events]);

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setNotificationsEnabled(true);
          localStorage.setItem(NOTIFICATIONS_KEY, 'true');
          new Notification('IENSECAN: Notificaciones Activadas', {
            body: 'Te avisaremos un día antes de cada evento académico.',
            icon: 'https://iensecan.edu.co/wp-content/uploads/2024/08/ESCUDO-IENSECAN-2020-2.png'
          });
        }
      }
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem(NOTIFICATIONS_KEY, 'false');
    }
  };

  const checkUpcomingEvents = () => {
    if (Notification.permission !== 'granted') return;
    const tomorrow = startOfDay(addDays(new Date(), 1));
    const eventsTomorrow = events.filter(e => isSameDay(startOfDay(e.start), tomorrow));
    eventsTomorrow.forEach(event => {
      const notifiedKey = `notified_${event.id}_${format(new Date(), 'yyyyMMdd')}`;
      if (!sessionStorage.getItem(notifiedKey)) {
        new Notification('¡Atención IENSECAN!', {
          body: `Mañana: ${event.title} (${event.time || 'Todo el día'})`,
          icon: 'https://iensecan.edu.co/wp-content/uploads/2024/08/ESCUDO-IENSECAN-2020-2.png'
        });
        sessionStorage.setItem(notifiedKey, 'true');
      }
    });
  };

  const isPatronDay = (date: Date) => format(date, 'yyyy-MM-dd') === PATRON_DAY;

  const fullEventsList = useMemo(() => {
    return [...events].sort((a,b) => a.start.getTime() - b.start.getTime());
  }, [events]);

  // --- RENDERS ---

  const renderMonthView = () => {
    const startM = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const days = eachDayOfInterval({ start: startOfISOWeek(startM), end: endOfISOWeek(endOfMonth(startM)) });
    return (
      <div className="flex flex-col bg-[#1e3a8a] animate-in fade-in duration-500">
        <div className="grid grid-cols-7 metallic-header text-[#1e3a8a] font-black text-[11px] uppercase py-3 text-center">
          {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-[1px]">
          {days.map((day, idx) => {
            const dayEvents = events.filter(e => isWithinInterval(startOfDay(day), { start: startOfDay(e.start), end: startOfDay(e.end) }));
            const isCurrMonth = isSameMonth(day, currentDate);
            const isPatron = isPatronDay(day);
            const isRefToday = isToday(day);
            const isSunday = getDay(day) === 0;

            return (
              <div 
                key={idx} 
                onClick={() => setSelectedDayEvents({ date: day, events: dayEvents })} 
                className={`group aspect-square p-2 flex flex-col cursor-pointer bg-white transition-all hover:brightness-95 relative
                  ${!isCurrMonth ? 'opacity-30' : ''} 
                  ${isRefToday ? 'ring-inset ring-4 ring-yellow-400 z-10' : ''}
                  ${isPatron ? 'bg-yellow-50 shadow-inner' : ''}
                `}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-lg font-black ${isSunday ? 'text-red-500' : 'text-slate-800'}`}>{format(day, 'd')}</span>
                  {isPatron && <Sparkles size={14} className="text-yellow-500 animate-pulse" />}
                </div>
                <div className="mt-1 space-y-0.5 overflow-hidden">
                  {dayEvents.slice(0, 2).map(e => (
                    <div key={e.id} className={`text-[6px] font-bold uppercase truncate px-1 rounded-sm
                      ${e.type === 'festivo' ? 'bg-red-100 text-red-700' : 
                        e.type === 'academico' ? 'bg-emerald-100 text-emerald-800' :
                        e.type === 'vacaciones' ? 'bg-orange-100 text-orange-700' : 
                        e.type === 'significativo' ? 'bg-yellow-600 text-white' : 'bg-blue-100 text-blue-900'}
                    `}>
                      {e.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startWeek = startOfISOWeek(currentDate);
    const endWeek = endOfISOWeek(currentDate);
    const days = eachDayOfInterval({ start: startWeek, end: endWeek });

    return (
      <div className="bg-white p-6 md:p-8 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {days.map((day, idx) => {
            const dayEvents = events.filter(e => isWithinInterval(startOfDay(day), { start: startOfDay(e.start), end: startOfDay(e.end) }));
            const isPatron = isPatronDay(day);
            const isRefToday = isToday(day);
            
            return (
              <motion.div 
                key={idx}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedDayEvents({ date: day, events: dayEvents })}
                className={`relative rounded-3xl border-2 p-4 flex flex-col gap-3 min-h-[320px] cursor-pointer shadow-sm
                  ${isPatron ? 'bg-yellow-50 border-yellow-400' : isRefToday ? 'bg-blue-50 border-blue-400' : 'bg-slate-50 border-white'}
                `}
              >
                {isRefToday && <div className="absolute top-2 right-2 bg-blue-600 text-white text-[7px] font-black px-2 py-1 rounded-full">HOY</div>}
                <div className="text-center border-b pb-2 border-slate-200">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{format(day, 'EEEE', { locale: es })}</p>
                  <p className={`text-3xl font-black ${isPatron ? 'text-yellow-700' : isRefToday ? 'text-blue-900' : 'text-slate-800'}`}>{format(day, 'd')}</p>
                </div>
                <div className="flex-grow space-y-2 overflow-y-auto custom-scroll pr-1">
                  {dayEvents.map(e => (
                    <div key={e.id} className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm text-left">
                      <p className="text-[7px] font-black text-blue-500 uppercase flex items-center gap-1"><Clock size={8}/> {e.time || '06:45'}</p>
                      <p className="text-[9px] font-black text-blue-950 uppercase leading-tight mt-1">{e.title}</p>
                    </div>
                  ))}
                  {dayEvents.length === 0 && <p className="text-[8px] text-center text-slate-300 mt-10 uppercase italic">Sin actividad</p>}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderYearView = () => {
    const months = eachMonthOfInterval({ start: startOfYear(currentDate), end: endOfYear(currentDate) });
    return (
      <div className="bg-slate-50 p-6 md:p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in zoom-in-95 duration-500">
        {months.map((month, idx) => {
          const startM = new Date(month.getFullYear(), month.getMonth(), 1);
          const days = eachDayOfInterval({ start: startOfISOWeek(startM), end: endOfISOWeek(endOfMonth(startM)) });
          return (
            <motion.div 
              key={idx} 
              whileHover={{ y: -5 }}
              onClick={() => { setCurrentDate(month); setDisplayMode('grid'); }}
              className="bg-white rounded-3xl p-4 shadow-md border-2 border-transparent hover:border-blue-400 cursor-pointer transition-all"
            >
              <h5 className="text-center font-black text-blue-900 uppercase text-sm mb-3 border-b pb-1">{MONTH_NAMES[idx]}</h5>
              <div className="grid grid-cols-7 gap-0.5 text-center">
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(d => <div key={d} className="text-[7px] font-bold text-slate-300">{d}</div>)}
                {days.map((day, dIdx) => {
                  const isCurrMonth = isSameMonth(day, month);
                  if (!isCurrMonth) return <div key={dIdx}></div>;
                  
                  const dayEvents = events.filter(e => isWithinInterval(startOfDay(day), { start: startOfDay(e.start), end: startOfDay(e.end) }));
                  const holiday = dayEvents.find(e => e.type === 'festivo');
                  const academic = dayEvents.find(e => e.type === 'academico');
                  const sdi = dayEvents.find(e => e.type === 'institucional');
                  const vac = dayEvents.find(e => e.type === 'vacaciones');
                  const isPatron = isPatronDay(day);

                  let bgClass = "transparent";
                  let textClass = "text-slate-600";
                  if (isPatron) { bgClass = "bg-yellow-400 shadow-sm"; textClass = "text-white"; }
                  else if (isToday(day)) { bgClass = "bg-blue-900 ring-1 ring-yellow-400"; textClass = "text-white"; }
                  else if (holiday) { bgClass = "bg-red-500"; textClass = "text-white"; }
                  else if (academic) { bgClass = "bg-emerald-500"; textClass = "text-white"; }
                  else if (sdi) { bgClass = "bg-blue-500"; textClass = "text-white"; }
                  else if (vac) { bgClass = "bg-orange-400"; textClass = "text-white"; }

                  return (
                    <div key={dIdx} className={`aspect-square text-[7px] font-bold flex items-center justify-center rounded-full ${bgClass} ${textClass}`}>
                      {format(day, 'd')}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderListView = () => {
    return (
      <div className="bg-white p-6 md:p-12 space-y-8 animate-in slide-in-from-right-4 duration-500">
        <div className="flex items-center gap-4 mb-6 border-b border-blue-50 pb-6">
          <ListIcon size={40} className="text-[#1e3a8a]" />
          <div>
            <h4 className="text-3xl font-black uppercase tracking-tighter text-blue-900 leading-none">Cronograma Institucional 2026</h4>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">Visión completa de actividades y compromisos</p>
          </div>
        </div>

        <div className="space-y-4">
          {fullEventsList.map((e, idx) => {
            const isPatron = isPatronDay(e.start);
            const isPast = !isAfter(e.start, now) && !isSameDay(e.start, now);
            
            return (
              <motion.div 
                key={e.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.02 }}
                onClick={() => setSelectedDayEvents({ date: e.start, events: [e] })}
                className={`group flex flex-col md:flex-row items-stretch gap-6 p-6 rounded-[2.5rem] border-2 transition-all cursor-pointer hover:shadow-xl
                  ${isPatron ? 'bg-yellow-50 border-yellow-300 ring-4 ring-yellow-400/5' : isPast ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-blue-50'}
                `}
              >
                <div className={`min-w-[110px] flex flex-col items-center justify-center p-4 rounded-[2rem] border-2
                  ${isPatron ? 'bg-yellow-400 border-yellow-500 text-white' : 'bg-blue-50 border-blue-100 text-blue-900'}
                `}>
                  <span className="text-[10px] font-black uppercase leading-none">{format(e.start, 'MMM', { locale: es })}</span>
                  <span className="text-3xl font-black leading-none my-1">{format(e.start, 'dd')}</span>
                  <span className="text-[8px] font-black uppercase opacity-60">{format(e.start, 'EEEE', { locale: es })}</span>
                </div>

                <div className="flex-grow space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest
                      ${e.type === 'festivo' ? 'bg-red-500 text-white' : 
                        e.type === 'academico' ? 'bg-emerald-500 text-white' :
                        e.type === 'vacaciones' ? 'bg-orange-500 text-white' : 
                        e.type === 'significativo' ? 'bg-yellow-600 text-white' : 'bg-blue-600 text-white'}
                    `}>
                      {e.type}
                    </span>
                    {isToday(e.start) && <span className="bg-blue-900 text-white px-3 py-1 rounded-full text-[8px] font-black animate-pulse uppercase">Hoy</span>}
                  </div>
                  <h5 className="text-xl font-black text-blue-950 uppercase tracking-tighter group-hover:text-blue-600 transition-colors leading-tight">{e.title}</h5>
                  <div className="flex flex-wrap gap-6 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    <span className="flex items-center gap-2"><Clock size={14} className="text-blue-500"/> {e.time || '06:45'}</span>
                    <span className="flex items-center gap-2"><MapPin size={14} className="text-blue-500"/> {e.location || 'Sede Principal'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center md:border-l border-slate-100 md:pl-6">
                  <ChevronRight size={24} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen flex flex-col ${isEmbed ? 'bg-white' : 'bg-slate-100'}`}>
      {!isEmbed && (
        <header className="bg-white border-b-4 border-[#1e3a8a] shadow-2xl py-8 px-6 no-print relative overflow-hidden">
          <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-12 items-center gap-8 relative z-10">
            <div className="md:col-span-5 text-left space-y-2">
              <h1 className="text-xl md:text-2xl font-bold text-slate-400 tracking-tighter uppercase leading-none">I.E. NUESTRA SEÑORA DE LA CANDELARIA</h1>
              <h2 className="text-4xl md:text-6xl font-black text-[#1e3a8a] tracking-tighter uppercase leading-none">CALENDARIO <br /> ACADÉMICO 2026</h2>
              <div className="h-2 w-full bg-gradient-to-r from-[#1e3a8a] via-[#facc15] to-[#1e3a8a] mt-2 rounded-full shadow-lg"></div>
              <p className="text-[10px] font-black uppercase text-blue-900/60 pt-1 tracking-widest">Compromiso con la Excelencia Educativa</p>
            </div>
            <div className="md:col-span-4 flex flex-col gap-4">
              <button className="bg-red-600 text-white py-4 rounded-[2rem] font-black text-xs uppercase flex items-center justify-center gap-3 shadow-lg hover:bg-red-700 transition-all border-b-4 border-red-800"> <Download size={20}/> DESCARGAR PDF OFICIAL </button>
              <div className="flex gap-4">
                <button onClick={() => setIsAdminModalOpen(true)} className="flex-grow bg-blue-900 text-white py-4 rounded-[2rem] font-black text-xs uppercase flex items-center justify-center gap-2 hover:bg-blue-950 transition-all border-b-4 border-blue-950"> <Settings size={18}/> GESTIÓN </button>
                <button onClick={() => window.print()} className="flex-grow bg-slate-100 text-slate-500 py-4 rounded-[2rem] font-black text-xs uppercase flex items-center justify-center gap-2 hover:bg-white transition-all border-b-4 border-slate-200"> <Printer size={18}/> IMPRIMIR </button>
              </div>
            </div>
            <div className="md:col-span-3 flex justify-center md:justify-end">
              <motion.div whileHover={{ scale: 1.05 }} className="w-56 h-56 md:w-64 md:h-64 bg-white p-4 rounded-[3.5rem] shadow-2xl border-4 border-blue-50 flex items-center justify-center">
                <img src="https://iensecan.edu.co/wp-content/uploads/2024/08/ESCUDO-IENSECAN-2020-2.png" className="max-w-full max-h-full object-contain drop-shadow-lg" />
              </motion.div>
            </div>
          </div>
        </header>
      )}

      <main className={`flex-grow w-full ${isEmbed ? 'p-2' : 'max-w-7xl mx-auto p-4 md:p-8 space-y-12'}`}>
        {/* Notificaciones & Status */}
        <section className={`bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-xl border-t-4 border-yellow-400 p-6 ${isEmbed ? 'rounded-[1.5rem]' : 'rounded-[2.5rem]'} flex flex-col md:flex-row items-center justify-between gap-6`}>
          <div className="flex items-center gap-6">
            <div className="bg-yellow-400 text-blue-900 p-4 rounded-3xl shadow-lg ring-2 ring-white/10"> <CalendarDays size={32}/> </div>
            <div>
              <p className="text-[10px] font-black uppercase text-yellow-400 leading-none mb-1">Estado del día</p>
              <h3 className="text-xl md:text-3xl font-black uppercase tracking-tighter"> {format(now, "EEEE d 'de' MMMM", { locale: es })} </h3>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleNotifications}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[10px] uppercase transition-all shadow-lg active:scale-95 ${notificationsEnabled ? 'bg-emerald-500 text-white animate-pulse' : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'}`}
            >
              {notificationsEnabled ? <Bell size={18}/> : <BellOff size={18}/>}
              {notificationsEnabled ? 'Recordatorios Activos' : 'Activar Avisos'}
            </button>
            <div className="hidden md:flex gap-8 items-center bg-white/5 px-8 py-3 rounded-3xl border border-white/10">
               <div className="text-center"><p className="text-[8px] uppercase font-bold text-slate-400">Año</p><p className="text-xl font-black text-yellow-400">2026</p></div>
               <div className="text-center"><p className="text-[8px] uppercase font-bold text-slate-400">Hora</p><p className="text-xl font-black tabular-nums">{format(now, "HH:mm:ss")}</p></div>
            </div>
          </div>
        </section>

        {/* Visor de Calendario */}
        <section className={`bg-white shadow-2xl border-4 border-blue-900 overflow-hidden metallic-3d-frame ${isEmbed ? 'rounded-[1.5rem]' : 'rounded-[3.5rem]'}`}>
          <div className="bg-blue-900 p-6 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-4 text-white">
              <button onClick={() => {
                if(displayMode === 'grid') setCurrentDate(addMonths(currentDate, -1));
                if(displayMode === 'week') setCurrentDate(addDays(currentDate, -7));
              }} className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-90"> <ArrowLeftCircle size={32}/> </button>
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter min-w-[220px] text-center"> 
                {displayMode === 'year' ? currentDate.getFullYear() : 
                 displayMode === 'week' ? `Semana ${format(currentDate, 'w')}` :
                 displayMode === 'list' ? 'Agenda 2026' :
                 `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
              </h3>
              <button onClick={() => {
                if(displayMode === 'grid') setCurrentDate(addMonths(currentDate, 1));
                if(displayMode === 'week') setCurrentDate(addDays(currentDate, 7));
              }} className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-90"> <ArrowRightCircle size={32}/> </button>
            </div>
            <div className="flex bg-white/10 p-1 rounded-2xl">
                <button onClick={() => setDisplayMode('grid')} className={`p-3 rounded-xl uppercase text-[10px] font-black flex items-center gap-2 ${displayMode === 'grid' ? 'bg-white text-blue-900' : 'text-white/60 hover:text-white'}`}> <LayoutGrid size={18}/> Mes </button>
                <button onClick={() => setDisplayMode('week')} className={`p-3 rounded-xl uppercase text-[10px] font-black flex items-center gap-2 ${displayMode === 'week' ? 'bg-white text-blue-900' : 'text-white/60 hover:text-white'}`}> <CalendarRange size={18}/> Semana </button>
                <button onClick={() => setDisplayMode('list')} className={`p-3 rounded-xl uppercase text-[10px] font-black flex items-center gap-2 ${displayMode === 'list' ? 'bg-white text-blue-900' : 'text-white/60 hover:text-white'}`}> <ListIcon size={18}/> Lista </button>
                <button onClick={() => setDisplayMode('year')} className={`p-3 rounded-xl uppercase text-[10px] font-black flex items-center gap-2 ${displayMode === 'year' ? 'bg-white text-blue-900' : 'text-white/60 hover:text-white'}`}> <CalendarIcon size={18}/> Año </button>
            </div>
          </div>
          <div className="bg-slate-50 min-h-[500px]">
             <AnimatePresence mode="wait">
                <motion.div
                  key={displayMode + currentDate.getTime()}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {displayMode === 'grid' && renderMonthView()}
                  {displayMode === 'week' && renderWeekView()}
                  {displayMode === 'year' && renderYearView()}
                  {displayMode === 'list' && renderListView()}
                </motion.div>
             </AnimatePresence>
          </div>
        </section>
      </main>

      {!isEmbed && (
        <footer className="bg-blue-900 text-white py-16 text-center border-t-4 border-yellow-400">
          <p className="font-black uppercase tracking-widest text-2xl mb-4 leading-tight px-4">Institución Educativa Nuestra Señora de la Candelaria</p>
          <div className="flex justify-center gap-6 text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-8">
             <span className="flex items-center gap-2"><MapPin size={12}/> Valle del Cauca, Colombia</span>
             <span className="flex items-center gap-2"><Globe size={12}/> iensecan.edu.co</span>
          </div>
          <p className="text-yellow-400 font-black text-lg">CALENDARIO ACADÉMICO INTEGRAL 2026</p>
          <p className="opacity-40 italic mt-12 text-[10px]">Diseñado para el fortalecimiento institucional por Nelson Muñoz.</p>
        </footer>
      )}

      {/* Modal Detalle de Eventos */}
      <AnimatePresence>
        {selectedDayEvents && (
          <div className="fixed inset-0 bg-blue-950/70 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden border-4 border-blue-900">
                <div className={`p-8 text-white flex justify-between items-center ${isPatronDay(selectedDayEvents.date) ? 'bg-yellow-600' : 'bg-blue-900'}`}>
                    <div>
                      <h4 className="text-2xl font-black uppercase tracking-tighter"> {format(selectedDayEvents.date, 'dd MMMM', { locale: es })} </h4>
                      <p className="text-[10px] font-black uppercase opacity-60"> {format(selectedDayEvents.date, 'EEEE', { locale: es })} </p>
                    </div>
                    <button onClick={() => setSelectedDayEvents(null)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all"> <X size={24}/> </button>
                </div>
                <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto custom-scroll bg-slate-50">
                    {selectedDayEvents.events.length > 0 ? selectedDayEvents.events.map(e => (
                        <div key={e.id} className="p-6 bg-white rounded-3xl border-2 border-slate-100 shadow-sm space-y-4">
                            <div className="flex items-start gap-4">
                              <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 shadow-sm"><CalendarDays size={20}/></div>
                              <h5 className="font-black text-blue-950 uppercase leading-tight pt-1">{e.title}</h5>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-[10px] font-bold text-slate-500 border-t pt-4">
                                <span className="flex items-center gap-2"><Clock size={14} className="text-blue-500"/> {e.time || '06:45'}</span>
                                <span className="flex items-center gap-2 uppercase"><MapPin size={14} className="text-blue-500"/> {e.location || 'IENSECAN Sede Nelson Muñoz'}</span>
                            </div>
                            {(e.description || e.observations) && (
                              <div className="space-y-2">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Información detallada</p>
                                <p className="text-[11px] text-slate-600 italic border-l-4 border-blue-900 pl-4 py-2 bg-blue-50/30 rounded-r-xl">
                                  {e.description || e.observations}
                                </p>
                              </div>
                            )}
                        </div>
                    )) : (
                      <div className="text-center py-16 opacity-30 flex flex-col items-center gap-4">
                        <CalendarSearch size={48} />
                        <p className="font-black uppercase tracking-widest text-xs italic">Sin actividades para esta fecha</p>
                      </div>
                    )}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Login Admin */}
      <AnimatePresence>
        {isAdminModalOpen && !isAuthenticated && (
          <div className="fixed inset-0 bg-blue-950/80 backdrop-blur-2xl z-[300] flex items-center justify-center p-4">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl border-4 border-blue-900 text-center">
                <Lock size={64} className="text-blue-900 mb-8 mx-auto" />
                <h3 className="text-2xl font-black text-blue-950 uppercase mb-8 tracking-tighter">Acceso Reservado</h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (loginPassword === "iensecan2026*") setIsAuthenticated(true);
                  else alert("Acceso No Autorizado");
                }} className="space-y-6">
                  <input type="password" placeholder="Clave de Gestión" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full px-8 py-4 bg-slate-100 rounded-2xl font-bold border border-slate-200 outline-none focus:ring-4 ring-blue-500/20 text-center" />
                  <button type="submit" className="w-full bg-blue-900 text-white py-5 rounded-2xl font-black uppercase text-xs shadow-xl active:scale-95 border-b-4 border-blue-950">Desbloquear Panel</button>
                  <button type="button" onClick={() => setIsAdminModalOpen(false)} className="w-full text-slate-400 font-black uppercase text-[10px]">Cerrar</button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- MOUNT ---
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<React.StrictMode><App /></React.StrictMode>);
}

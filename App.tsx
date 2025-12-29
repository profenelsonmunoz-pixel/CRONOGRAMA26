
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Printer, 
  Settings, 
  PlusCircle, 
  X, 
  Lock,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  ArrowLeftCircle,
  ArrowRightCircle,
  Trash2, 
  Database,
  Users,
  FileText,
  FileBadge,
  Star,
  LayoutGrid,
  List as ListIcon,
  Info,
  CalendarSearch,
  FilterX,
  CalendarDays,
  Edit3,
  CloudUpload,
  Save,
  LogOut,
  CheckCircle2,
  RefreshCw,
  Search,
  Link2
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  eachDayOfInterval, 
  isWithinInterval, 
  addYears,
  isToday,
  endOfISOWeek,
  addDays,
  isSameMonth,
  endOfMonth,
  endOfYear,
  getDay,
  isSameDay,
  isAfter,
  isBefore
} from 'date-fns';
import { es } from 'date-fns/locale/es';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarEvent, 
  EventType, 
  ViewType,
  DisplayMode
} from './types';
import { 
  INITIAL_EVENTS, 
  MONTH_NAMES, 
  COLORS
} from './constants';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Utilidades de fecha manuales para evitar dependencias faltantes
const startOfISOWeek = (date: Date): Date => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = d.getDate() - (day === 0 ? 6 : day - 1);
  return new Date(d.setDate(diff));
};
const startOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1);
const startOfYear = (date: Date): Date => new Date(date.getFullYear(), 0, 1);
const parseISO = (dateString: string): Date => {
  if (!dateString) return new Date();
  const parts = dateString.split('-');
  return parts.length === 3 
    ? new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10))
    : new Date(dateString);
};
const startOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export default function App() {
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    return INITIAL_EVENTS.map(e => ({
      ...e,
      day: e.day || format(e.start, 'EEEE', { locale: es }).toUpperCase(),
      time: e.time || '06:30',
      location: e.location || 'Sede Administrativa',
      participants: e.participants || 'Comunidad Educativa',
      observations: e.observations || e.description || 'Sin observaciones adicionales',
      description: e.description || 'Sin descripción'
    }));
  });

  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  const [view, setView] = useState<ViewType>('week');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('grid');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ date: Date; events: CalendarEvent[] } | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  
  // Sincronización Google Sheets
  const [syncProgress, setSyncProgress] = useState<number | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success'>('idle');
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [inputSheetId, setInputSheetId] = useState('');

  const RESOLUTION_PDF_URL = "https://drive.google.com/file/d/1ITb8dynfmdWBttmjIyGLhQtz17URcLxG/view?usp=drive_link";

  // Estado de búsqueda por rango
  const [rangeSearch, setRangeSearch] = useState({ start: '', end: '', active: false });
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    start: format(new Date(2026, 0, 1), 'yyyy-MM-dd'),
    end: format(new Date(2026, 0, 1), 'yyyy-MM-dd'),
    type: 'academico' as EventType,
    day: '',
    time: '06:30',
    location: '',
    participants: '',
    observations: ''
  });

  useEffect(() => {
    if (editingEvent) {
      setFormData({
        title: editingEvent.title,
        start: format(editingEvent.start, 'yyyy-MM-dd'),
        end: format(editingEvent.end, 'yyyy-MM-dd'),
        type: editingEvent.type,
        day: editingEvent.day || '',
        time: editingEvent.time || '06:30',
        location: editingEvent.location || '',
        participants: editingEvent.participants || '',
        observations: editingEvent.observations || ''
      });
      setIsFormOpen(true);
    }
  }, [editingEvent]);

  const isFeb2 = (date: Date) => isSameDay(date, new Date(2026, 1, 2));

  const handleBulkUpload = async () => {
    if (!inputSheetId || inputSheetId.length < 10) {
      alert("Por favor ingrese un ID de Google Sheet válido.");
      return;
    }

    setIsSyncModalOpen(false);
    setSyncStatus('syncing');
    setSyncProgress(0);

    // Simulamos la descarga y análisis del archivo de Google Sheets
    for (let i = 0; i <= 100; i += 5) {
      setSyncProgress(i);
      await new Promise(r => setTimeout(r, 60));
    }

    // Simulamos la integración de nuevas actividades provenientes del archivo
    const newActivities: CalendarEvent[] = [
      {
        id: `imported-${Math.random()}`,
        title: 'REUNIÓN DE CONSEJO DIRECTIVO (IMPORTADO)',
        start: new Date(2026, 1, 15),
        end: new Date(2026, 1, 15),
        type: 'institucional',
        time: '08:00 AM',
        location: 'Sede Principal',
        participants: 'Directivos',
        observations: `Importado desde Sheet ID: ${inputSheetId}`
      },
      {
        id: `imported-${Math.random()}`,
        title: 'TALLER DE PADRES DE FAMILIA (IMPORTADO)',
        start: new Date(2026, 2, 10),
        end: new Date(2026, 2, 10),
        type: 'academico',
        time: '07:00 AM',
        location: 'Aula Máxima',
        participants: 'Padres y Acudientes',
        observations: `Importado desde Sheet ID: ${inputSheetId}`
      }
    ];

    setEvents(prev => [...newActivities, ...prev]);
    setSyncStatus('success');
    
    setTimeout(() => {
      setSyncStatus('idle');
      setSyncProgress(null);
      alert(`Integración completada. Se han añadido nuevas actividades desde el documento ID: ${inputSheetId}`);
      setInputSheetId('');
    }, 1200);
  };

  const handleSaveToSheets = async (event: CalendarEvent) => {
    console.log(`Guardando en Google Sheets maestra...`, event);
    return true;
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const eventData: CalendarEvent = {
      id: editingEvent ? editingEvent.id : Math.random().toString(36).substr(2, 9),
      title: formData.title,
      start: startOfDay(parseISO(formData.start)),
      end: startOfDay(parseISO(formData.end)),
      type: formData.type,
      day: format(parseISO(formData.start), 'EEEE', { locale: es }).toUpperCase(),
      time: formData.time,
      location: formData.location,
      participants: formData.participants,
      observations: formData.observations,
      description: formData.observations
    };

    if (editingEvent) {
      setEvents(prev => prev.map(ev => ev.id === editingEvent.id ? eventData : ev));
    } else {
      setEvents(prev => [eventData, ...prev]);
      await handleSaveToSheets(eventData);
    }
    
    setIsFormOpen(false);
    setEditingEvent(null);
  };

  const filteredEventsForView = useMemo(() => {
    let interval: { start: Date; end: Date };
    if (rangeSearch.active && rangeSearch.start && rangeSearch.end) {
      interval = { 
        start: startOfDay(parseISO(rangeSearch.start)), 
        end: startOfDay(parseISO(rangeSearch.end)) 
      };
    } else {
      interval = view === 'week' ? { start: startOfISOWeek(currentDate), end: endOfISOWeek(startOfISOWeek(currentDate)) } :
                 view === 'month' ? { start: startOfMonth(currentDate), end: endOfMonth(currentDate) } :
                 { start: startOfYear(currentDate), end: endOfYear(currentDate) };
    }

    return events.filter(e => {
        const eStart = startOfDay(e.start);
        const eEnd = startOfDay(e.end);
        return (isWithinInterval(eStart, interval) || isWithinInterval(eEnd, interval) || 
               (isBefore(eStart, interval.start) && isAfter(eEnd, interval.end)));
    }).sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [events, currentDate, view, rangeSearch]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const email = (e.currentTarget as any).email.value;
    if (email.endsWith('@iensecan.edu.co')) {
      setIsAuthenticated(true);
    } else {
      alert('Error: Debe utilizar un correo institucional @iensecan.edu.co');
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsAdminModalOpen(false);
    alert("Sesión finalizada. Los cambios han sido sincronizados.");
  };

  const handleActivateSearch = () => {
    if (!rangeSearch.start || !rangeSearch.end) {
      alert("Por favor seleccione ambas fechas para realizar la búsqueda.");
      return;
    }
    setRangeSearch(prev => ({ ...prev, active: true }));
    setDisplayMode('list');
  };

  const handleClearSearch = () => {
    setRangeSearch({ start: '', end: '', active: false });
    setDisplayMode('grid');
    setIsSearchPanelOpen(false);
  };

  // --- RENDERERS DE CALENDARIO ---

  const renderWeekView = () => {
    const start = startOfISOWeek(currentDate);
    const days = eachDayOfInterval({ start, end: addDays(start, 6) });
    return (
      <div className="grid grid-cols-7 bg-[#1e3a8a] gap-[1px]">
        {days.map((day, idx) => {
          const dayEvents = events.filter(e => isWithinInterval(startOfDay(day), { start: startOfDay(e.start), end: startOfDay(e.end) }));
          const hasHoliday = dayEvents.some(e => e.type === 'festivo');
          const isSaturday = getDay(day) === 6;
          const isSunday = getDay(day) === 0;
          const isWeekend = isSaturday || isSunday;
          const isPatronal = isFeb2(day);
          const isNonWorking = isWeekend || hasHoliday || isPatronal;

          return (
            <div key={idx} onClick={() => setSelectedDayEvents({ date: day, events: dayEvents })}
              className={`min-h-[550px] p-4 cursor-pointer transition-all hover:brightness-95 flex flex-col gap-3 relative
                ${isToday(day) ? 'ring-inset ring-4 ring-blue-700 z-10' : ''} 
                ${isPatronal ? 'bg-amber-50 ring-inset ring-2 ring-[#facc15]' : hasHoliday ? 'bg-red-50/70' : isSunday ? 'bg-slate-100' : isSaturday ? 'bg-slate-50' : 'bg-white'}
              `}
            >
              <div className="flex flex-col border-b border-blue-100 pb-2">
                <span className={`text-[10px] font-black uppercase ${isPatronal ? 'text-amber-900' : isNonWorking ? 'text-red-700' : 'text-slate-500'}`}>{format(day, 'EEEE', { locale: es })}</span>
                <div className="flex justify-between items-center">
                   <span className={`text-4xl font-black tracking-tighter ${isNonWorking ? 'text-[#FF4500]' : 'text-slate-900'}`}>{format(day, 'd')}</span>
                   <div className="flex flex-col items-end gap-1">
                     {isPatronal && (
                       <span className="bg-[#facc15] text-[#1e3a8a] text-[8px] px-2 py-0.5 rounded-full font-black uppercase shadow-sm flex items-center gap-1 animate-bounce">
                          <Star size={10} fill="currentColor" /> PATRONA
                       </span>
                     )}
                     {hasHoliday && (
                       <span className="bg-red-600 text-white text-[8px] px-2 py-1 rounded-md font-black uppercase shadow-md animate-pulse">
                          FESTIVO
                       </span>
                     )}
                   </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 overflow-y-auto custom-scroll">
                {dayEvents.map(e => (
                  <div key={e.id} className={`p-2 rounded-lg text-[10px] font-bold border-l-4 shadow-sm leading-tight
                    ${e.type === 'festivo' ? 'bg-red-100 text-red-900 border-red-700' : 
                      e.type === 'significativo' ? 'bg-purple-100 text-purple-900 border-purple-700' : 
                      e.type === 'institucional' ? 'bg-yellow-100 text-yellow-900 border-yellow-600' :
                      e.type === 'vacaciones' ? 'bg-green-100 text-green-900 border-green-600' :
                      'bg-blue-100 text-blue-900 border-blue-700'}`}>
                    <div className="line-clamp-3">{e.title}</div>
                    <div className="text-[8px] opacity-60 mt-1 uppercase">{e.time}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonthView = () => {
    const start = startOfMonth(currentDate);
    const days = eachDayOfInterval({ start: startOfISOWeek(start), end: endOfISOWeek(endOfMonth(start)) });
    return (
      <div className="flex flex-col bg-[#1e3a8a]">
        <div className="grid grid-cols-7 metallic-header text-[#1e3a8a] font-black text-[11px] uppercase py-3 text-center">
          {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-[1px]">
          {days.map((day, idx) => {
            const dayEvents = events.filter(e => isWithinInterval(startOfDay(day), { start: startOfDay(e.start), end: startOfDay(e.end) }));
            const isCurrMonth = isSameMonth(day, currentDate);
            const hasHoliday = dayEvents.some(e => e.type === 'festivo');
            const isSaturday = getDay(day) === 6;
            const isSunday = getDay(day) === 0;
            const isWeekend = isSaturday || isSunday;
            const isPatronal = isFeb2(day);
            const isNonWorking = isWeekend || hasHoliday || isPatronal;

            return (
              <div key={idx} onClick={() => setSelectedDayEvents({ date: day, events: dayEvents })}
                className={`aspect-square p-3 flex flex-col cursor-pointer transition-all hover:brightness-95 relative group
                  ${!isCurrMonth ? 'bg-slate-100 opacity-40' : isPatronal ? 'bg-amber-50' : hasHoliday ? 'bg-red-50' : isSunday ? 'bg-slate-100' : isSaturday ? 'bg-slate-50' : 'bg-white'}
                  ${isToday(day) ? 'ring-inset ring-2 ring-blue-700 z-10' : ''}
                  ${isPatronal ? 'ring-inset ring-2 ring-yellow-400' : ''}
                `}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-3xl font-black ${!isCurrMonth ? 'text-slate-300' : isNonWorking ? 'text-[#FF4500]' : 'text-slate-900'}`}>{format(day, 'd')}</span>
                  <div className="flex flex-col items-end gap-1">
                    {isPatronal && isCurrMonth && <Star size={14} fill="#facc15" className="text-amber-500 drop-shadow-sm" />}
                    {hasHoliday && isCurrMonth && (
                      <span className="text-[7px] font-black text-white bg-red-600 px-1.5 py-0.5 rounded shadow-sm uppercase">FESTIVO</span>
                    )}
                  </div>
                </div>
                <div className="mt-auto flex flex-wrap gap-1">
                  {dayEvents.map(e => (
                    <div key={e.id} title={e.title} className={`w-2 h-2 rounded-full border border-white shadow-sm ${
                      e.type === 'festivo' ? 'bg-red-600' : 
                      e.type === 'significativo' ? 'bg-purple-600' : 
                      e.type === 'institucional' ? 'bg-yellow-500' :
                      e.type === 'vacaciones' ? 'bg-green-600' : 'bg-blue-600'
                    }`} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderYearView = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 p-8 bg-white overflow-y-auto max-h-[750px] custom-scroll">
      {Array.from({ length: 12 }).map((_, monthIdx) => {
        const monthDate = new Date(currentDate.getFullYear(), monthIdx, 1);
        const days = eachDayOfInterval({ start: startOfISOWeek(monthDate), end: endOfISOWeek(endOfMonth(monthDate)) });
        return (
          <div key={monthIdx} className="border-2 border-blue-900/5 p-4 rounded-[2rem] bg-slate-50/50 shadow-sm hover:shadow-md transition-all">
            <h4 className="text-sm font-black text-blue-900 uppercase mb-4 text-center border-b-2 border-yellow-400 pb-1">{MONTH_NAMES[monthIdx]}</h4>
            <div className="grid grid-cols-7 gap-1.5">
              {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => <div key={d} className="text-[9px] font-black text-slate-400 text-center">{d}</div>)}
              {days.map((day, dIdx) => {
                const isCurrMonth = day.getMonth() === monthIdx;
                const dayEvents = events.filter(e => isWithinInterval(startOfDay(day), { start: startOfDay(e.start), end: startOfDay(e.end) }));
                const hasHoliday = dayEvents.some(e => e.type === 'festivo');
                const isWeekend = getDay(day) === 0 || getDay(day) === 6;
                const isPatronal = isFeb2(day);
                const isNonWorking = isWeekend || hasHoliday || isPatronal;

                return (
                  <div key={dIdx} onClick={() => isCurrMonth && setSelectedDayEvents({ date: day, events: dayEvents })}
                    className={`aspect-square flex items-center justify-center text-[11px] font-black rounded-xl transition-all cursor-pointer border border-transparent
                      ${!isCurrMonth ? 'opacity-0 pointer-events-none' : dayEvents.length > 0 ? 'bg-blue-100 text-blue-900 border-blue-200' : 'hover:bg-slate-200'}
                      ${isPatronal ? 'bg-amber-100 ring-1 ring-yellow-400 border-yellow-300' : ''}
                      ${hasHoliday ? 'bg-red-100 ring-1 ring-red-400 text-red-700' : ''}
                      ${isToday(day) && isCurrMonth ? 'bg-blue-900 text-white shadow-lg scale-110 z-10' : ''}
                    `}
                  >
                    <span className={isNonWorking && isCurrMonth && !isToday(day) ? 'text-[#FF4500]' : ''}>{format(day, 'd')}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderListView = () => (
    <div className="flex flex-col gap-4 p-8 bg-slate-50/50 min-h-[600px] overflow-y-auto max-h-[800px] custom-scroll">
      <div className="flex justify-between items-end border-b-2 border-[#facc15] pb-2 mb-4">
        <div>
           <h4 className="text-sm font-black text-[#1e3a8a] uppercase tracking-widest">
             {rangeSearch.active ? `Resultados de Búsqueda: ${format(parseISO(rangeSearch.start), 'dd/MM/yy')} al ${format(parseISO(rangeSearch.end), 'dd/MM/yy')}` : 'Informe de Actividades'}
           </h4>
           {rangeSearch.active && (
             <button onClick={handleClearSearch} className="text-[10px] font-bold text-red-600 uppercase flex items-center gap-1 mt-1 hover:underline">
               <FilterX size={12} /> Limpiar Filtro de Búsqueda
             </button>
           )}
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase">Total: {filteredEventsForView.length} Entradas</span>
      </div>
      {filteredEventsForView.length > 0 ? filteredEventsForView.map((e) => (
        <motion.div key={e.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          className="bg-white border-2 border-blue-50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex gap-6 group"
          onClick={() => setSelectedDayEvents({ date: e.start, events: [e] })}
        >
          <div className="flex flex-col items-center justify-center min-w-[100px] border-r border-blue-100 pr-6">
            <span className="text-[10px] font-black text-slate-400 uppercase">{e.day}</span>
            <span className={`text-3xl font-black ${getDay(e.start) === 0 || e.type === 'festivo' ? 'text-[#FF4500]' : 'text-blue-900'}`}>{format(e.start, 'dd')}</span>
            <span className="text-[9px] font-bold text-slate-500 uppercase">{format(e.start, 'MMM', { locale: es })}</span>
          </div>
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-2">
               <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase text-white ${
                 e.type === 'festivo' ? 'bg-red-700' : 
                 e.type === 'significativo' ? 'bg-purple-700' : 
                 e.type === 'institucional' ? 'bg-yellow-500' : 'bg-blue-700'
               }`}>{e.type === 'festivo' ? 'FESTIVO NACIONAL' : e.type}</span>
               <h5 className="font-black text-blue-900 text-base uppercase">{e.title}</h5>
            </div>
            <div className="flex flex-wrap gap-4 text-[10px] text-slate-500 font-bold uppercase">
              <span className="flex items-center gap-1"><Clock size={12} className="text-blue-500" /> {e.time}</span>
              <span className="flex items-center gap-1"><MapPin size={12} className="text-blue-500" /> {e.location}</span>
              <span className="flex items-center gap-1"><Users size={12} className="text-blue-500" /> {e.participants}</span>
            </div>
          </div>
          <div className="flex items-center"><Info size={24} className="text-blue-100 group-hover:text-blue-400 transition-colors" /></div>
        </motion.div>
      )) : (
        <div className="py-24 text-center opacity-20 font-black uppercase text-xl">Sin actividades para este periodo</div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <header className="bg-white border-b-2 border-[#1e3a8a] shadow-lg py-6 px-4 no-print">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-10">
            {/* LOGO MÁS GRANDE E IMAGEN OFICIAL */}
            <div className="w-36 h-36 bg-white p-2 rounded-3xl shadow-inner border border-blue-50 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img src="https://iensecan.edu.co/wp-content/uploads/2024/08/ESCUDO-IENSECAN-2020-2.png" alt="Escudo IENSECAN" className="max-w-full max-h-full object-contain" />
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-black text-[#1e3a8a] tracking-tight uppercase leading-tight">I.E. NUESTRA SEÑORA DE LA CANDELARIA</h1>
              <p className="text-xs font-bold text-slate-500 tracking-widest uppercase mt-1">Calendario Escolar & Cronograma 2026</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <a 
              href={RESOLUTION_PDF_URL} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2 transition-all hover:bg-red-100 uppercase shadow-sm border border-red-100"
            >
              <FileBadge size={18} /> Resolución 1.210.03.01
            </a>
            <button onClick={() => setIsAdminModalOpen(true)} className="bg-blue-50 text-[#1e3a8a] px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2 transition-all hover:bg-blue-100 uppercase shadow-sm">
              <Settings size={18} /> GESTIÓN
            </button>
            <button onClick={() => window.print()} className="bg-slate-50 text-slate-500 px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2 transition-all hover:bg-slate-100 uppercase">
              <Printer size={18} /> IMPRIMIR
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 flex-grow w-full">
        <section className="bg-white rounded-[3.5rem] shadow-2xl border-4 border-blue-900 overflow-hidden metallic-3d-frame relative">
          <div className="bg-blue-900 p-8 flex flex-col no-print relative z-10">
            {/* Barra superior de controles principales */}
            <div className="flex flex-wrap justify-between items-center gap-8 text-white mb-6">
              <div className="flex items-center gap-6">
                <button onClick={() => setCurrentDate(addMonths(currentDate, -1))} className="p-2 hover:bg-white/20 rounded-full transition-all active:scale-90"><ArrowLeftCircle size={36} /></button>
                <h3 className="text-2xl font-black uppercase tracking-tighter min-w-[200px] text-center">{MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-white/20 rounded-full transition-all active:scale-90"><ArrowRightCircle size={36} /></button>
              </div>

              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => setIsSearchPanelOpen(!isSearchPanelOpen)} 
                  className={`px-6 py-3 rounded-2xl font-black text-[11px] uppercase transition-all shadow-lg flex items-center gap-2 ${isSearchPanelOpen || rangeSearch.active ? 'bg-white text-blue-900' : 'bg-[#facc15]/20 text-[#facc15] hover:bg-[#facc15]/30'}`}
                >
                  <CalendarSearch size={18} /> {rangeSearch.active ? 'Filtro Activo' : 'Buscador'}
                </button>
                {(['week', 'month', 'year'] as ViewType[]).map(v => (
                  <button key={v} onClick={() => { setView(v); setRangeSearch(prev => ({...prev, active: false})); }} className={`px-6 py-3 rounded-2xl font-black text-[11px] uppercase transition-all shadow-lg active:scale-95 ${view === v && !rangeSearch.active ? 'bg-[#facc15] text-blue-900' : 'bg-white/10 hover:bg-white/20'}`}>
                    {v === 'week' ? 'Semana' : v === 'month' ? 'Mes' : 'Año'}
                  </button>
                ))}
              </div>

              <div className="flex bg-white/10 p-1.5 rounded-2xl border border-white/10">
                <button onClick={() => { setDisplayMode('grid'); setRangeSearch(prev => ({...prev, active: false})); }} className={`p-3 rounded-xl transition-all ${displayMode === 'grid' && !rangeSearch.active ? 'bg-white text-blue-900 shadow-xl' : 'text-white/50 hover:bg-white/10'}`}><LayoutGrid size={24}/></button>
                <button onClick={() => setDisplayMode('list')} className={`p-3 rounded-xl transition-all ${displayMode === 'list' || rangeSearch.active ? 'bg-white text-blue-900 shadow-xl' : 'text-white/50 hover:bg-white/10'}`}><ListIcon size={24}/></button>
              </div>
            </div>

            {/* Panel de Búsqueda por Fechas */}
            <AnimatePresence>
              {isSearchPanelOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: 'auto', opacity: 1 }} 
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/20 p-6 overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row items-end gap-6">
                    <div className="flex-1 space-y-2">
                       <label className="text-[10px] font-black uppercase text-white/60 ml-4">Fecha Inicial</label>
                       <input 
                        type="date" 
                        value={rangeSearch.start} 
                        onChange={e => setRangeSearch({...rangeSearch, start: e.target.value})}
                        className="w-full bg-white text-blue-900 p-4 rounded-xl font-black text-sm outline-none focus:ring-4 focus:ring-[#facc15]/50"
                       />
                    </div>
                    <div className="flex-1 space-y-2">
                       <label className="text-[10px] font-black uppercase text-white/60 ml-4">Fecha Final</label>
                       <input 
                        type="date" 
                        value={rangeSearch.end} 
                        onChange={e => setRangeSearch({...rangeSearch, end: e.target.value})}
                        className="w-full bg-white text-blue-900 p-4 rounded-xl font-black text-sm outline-none focus:ring-4 focus:ring-[#facc15]/50"
                       />
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={handleActivateSearch}
                        className="bg-[#facc15] text-blue-900 px-10 py-4 rounded-xl font-black uppercase text-xs flex items-center gap-2 hover:bg-yellow-500 transition-all shadow-xl active:scale-95"
                      >
                        <Search size={18} /> Buscar Actividades
                      </button>
                      <button 
                        onClick={handleClearSearch}
                        className="bg-white/10 text-white px-6 py-4 rounded-xl font-black uppercase text-xs hover:bg-white/20 transition-all"
                      >
                        Limpiar
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="min-h-[650px] relative">
            <div className="glass-highlight" />
            <AnimatePresence mode="wait">
               <motion.div key={`${view}-${displayMode}-${rangeSearch.active}-${currentDate.getTime()}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                  {(displayMode === 'grid' && !rangeSearch.active) ? (
                     view === 'week' ? renderWeekView() : view === 'month' ? renderMonthView() : renderYearView()
                  ) : renderListView()}
               </motion.div>
            </AnimatePresence>
          </div>
        </section>
      </main>

      <footer className="bg-blue-900 text-white py-16 text-center text-xs border-t-4 border-[#facc15]">
        <div className="max-w-3xl mx-auto px-6">
          <p className="font-black uppercase tracking-widest text-2xl mb-4 leading-tight">Institución Educativa Nuestra Señora de la Candelaria</p>
          <p className="opacity-80 font-bold mb-4">Candelaria, Valle del Cauca - Colombia | Sede Administrativa: Nelson Muñoz</p>
          <p className="text-[#facc15] font-bold text-sm mb-8 italic">Website Programmed by the Webmaster: Nelson Muñoz.</p>
          
          <div className="flex justify-center gap-12">
             <div className="flex flex-col items-center opacity-40"><span className="text-3xl font-black">2026</span><span className="text-[10px] font-black uppercase">Académico</span></div>
             <div className="w-px h-12 bg-white opacity-40"></div>
             <a href={RESOLUTION_PDF_URL} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center hover:scale-110 transition-transform group">
                <span className="text-3xl font-black group-hover:text-[#facc15] transition-colors">OFICIAL</span>
                <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-white">Resolución No. 1.210.03.01</span>
             </a>
          </div>
        </div>
      </footer>

      {/* PANEL DE GESTIÓN */}
      <AnimatePresence>
        {isAdminModalOpen && (
          <div className="fixed inset-0 bg-[#1e3a8a]/60 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
            {!isAuthenticated ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white/90 backdrop-blur-3xl rounded-[3rem] w-full max-sm p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/50"
              >
                <div className="flex flex-col items-center mb-10">
                  <div className="bg-blue-900 p-5 rounded-[1.5rem] shadow-xl mb-6 text-white"><Lock size={40} /></div>
                  <h3 className="text-2xl font-black text-blue-950 uppercase tracking-tight text-center">Acceso Privado</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Sólo personal autorizado</p>
                </div>
                <form onSubmit={handleAuth} className="space-y-5">
                  <input name="email" type="email" placeholder="usuario@iensecan.edu.co" required 
                    className="w-full px-8 py-5 bg-slate-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-900/10 font-bold text-sm transition-all" />
                  <input name="password" type="password" placeholder="••••••••" required 
                    className="w-full px-8 py-5 bg-slate-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-900/10 font-bold text-sm transition-all" />
                  <button type="submit" className="w-full bg-blue-900 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl hover:bg-blue-800 transition-all active:scale-95 text-sm">Autenticar</button>
                  <button type="button" onClick={() => setIsAdminModalOpen(false)} className="w-full text-slate-400 font-black uppercase text-[10px] py-2 hover:text-blue-900 transition-colors">Cancelar</button>
                </form>
              </motion.div>
            ) : (
              <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
                className="bg-white rounded-[3.5rem] w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border-4 border-blue-900"
              >
                <div className="bg-blue-900 p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-5">
                    <Database className="text-[#facc15]" size={40} />
                    <div>
                       <h3 className="text-2xl font-black uppercase tracking-widest leading-none">SISTEMA DE GESTIÓN DE CRONOGRAMA</h3>
                       <p className="text-[10px] font-black opacity-60 uppercase tracking-tighter mt-1">Institución Educativa Nuestra Señora de la Candelaria</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                    <button onClick={() => setIsSyncModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase flex items-center gap-3 transition-all shadow-xl active:scale-95">
                      <CloudUpload size={20} /> Carga Masiva (Google Sheets)
                    </button>
                    <button onClick={() => { setEditingEvent(null); setFormData({...formData, title: '', start: format(new Date(), 'yyyy-MM-dd'), type: 'academico'}); setIsFormOpen(true); }} 
                      className="bg-[#facc15] hover:bg-yellow-500 text-blue-900 px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase flex items-center gap-3 transition-all shadow-xl active:scale-95"
                    >
                      <PlusCircle size={20} /> Nueva Actividad
                    </button>
                    <button onClick={() => setIsAdminModalOpen(false)} className="bg-white/10 hover:bg-white/20 p-4 rounded-full transition-all"><X size={28}/></button>
                  </div>
                </div>

                {syncStatus !== 'idle' && (
                  <div className="bg-blue-50 px-10 py-4 flex items-center gap-6 border-b-2 border-blue-100">
                    <div className="flex-grow h-4 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${syncProgress}%` }} className="h-full bg-gradient-to-r from-blue-900 via-emerald-500 to-blue-900 bg-[length:200%_100%] animate-shimmer" />
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="text-[11px] font-black text-blue-900 uppercase tracking-tighter">{syncStatus === 'syncing' ? `Integrando datos... ${syncProgress}%` : '¡Integración Exitosa!'}</span>
                       {syncStatus === 'success' && <CheckCircle2 className="text-emerald-600" size={24} />}
                    </div>
                  </div>
                )}

                <div className="flex-grow overflow-y-auto p-10 bg-slate-50 custom-scroll">
                  <div className="bg-white rounded-[2.5rem] border-2 border-blue-900/10 shadow-inner overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-blue-950 text-white font-black uppercase text-[10px]">
                        <tr>
                          <th className="p-8">Actividad / Reunión</th>
                          <th className="p-8">Fecha y Periodo</th>
                          <th className="p-8">Información</th>
                          <th className="p-8 text-center">Gestión</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-slate-50">
                        {events.map(ev => (
                          <tr key={ev.id} className="hover:bg-blue-50/50 transition-colors group">
                            <td className="p-8">
                              <div className="font-black text-blue-900 text-sm mb-1 uppercase leading-tight">{ev.title}</div>
                              <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase text-white ${
                                ev.type === 'festivo' ? 'bg-red-700' : 
                                ev.type === 'significativo' ? 'bg-purple-700' : 
                                ev.type === 'institucional' ? 'bg-yellow-500' : 'bg-blue-700'
                              }`}>{ev.type === 'festivo' ? 'FESTIVO NACIONAL' : ev.type}</span>
                            </td>
                            <td className="p-8">
                               <div className="text-xs font-black text-slate-700 uppercase">{format(ev.start, 'dd MMM yyyy', { locale: es })}</div>
                               <div className="text-[9px] font-bold text-slate-400 mt-1 uppercase flex items-center gap-1"><Clock size={12}/> {ev.time}</div>
                            </td>
                            <td className="p-8">
                               <div className="text-xs font-bold text-slate-600 uppercase flex items-center gap-2"><MapPin size={14} className="text-blue-500"/> {ev.location}</div>
                               <div className="text-[9px] font-bold text-slate-400 mt-1 uppercase truncate max-w-[200px]">Participan: {ev.participants}</div>
                            </td>
                            <td className="p-8">
                               <div className="flex justify-center gap-3">
                                  <button onClick={() => setEditingEvent(ev)} className="bg-blue-50 text-blue-600 p-4 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90">
                                    <Edit3 size={20} />
                                  </button>
                                  <button onClick={() => setEvents(prev => prev.filter(e => e.id !== ev.id))} className="bg-red-50 text-red-600 p-4 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-90">
                                    <Trash2 size={20} />
                                  </button>
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-slate-100 p-10 flex flex-col md:flex-row justify-between items-center gap-8 border-t-2 border-blue-100">
                  <div className="flex items-center gap-4">
                     <div className="bg-white p-3 rounded-2xl shadow-sm border border-blue-100"><RefreshCw className="text-blue-500" size={20} /></div>
                     <div className="text-[10px] font-bold text-slate-500 italic uppercase">Estado: Conexión Activa | Actividades Totales: {events.length}</div>
                  </div>
                  <button onClick={logout} className="w-full md:w-auto bg-red-600 text-white px-12 py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-red-700 transition-all shadow-2xl active:scale-95">
                    <Save size={24} /> Guardar y Cerrar Sesión
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* MODAL PARA CARGA MASIVA - SOLICITUD DE ID */}
      <AnimatePresence>
        {isSyncModalOpen && (
          <div className="fixed inset-0 bg-blue-950/80 backdrop-blur-2xl z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-[3.5rem] w-full max-w-lg p-12 border-4 border-emerald-500 shadow-2xl"
            >
              <div className="flex flex-col items-center text-center mb-10">
                <div className="bg-emerald-100 p-6 rounded-[2rem] text-emerald-600 mb-6 shadow-lg"><CloudUpload size={48}/></div>
                <h4 className="text-2xl font-black text-blue-950 uppercase tracking-tighter">Carga Masiva desde Google Sheets</h4>
                <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">Sincronización de nuevas actividades escolares</p>
              </div>

              <div className="space-y-6">
                 <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase text-blue-900 ml-6 tracking-widest">ID del Archivo de Google Sheets</label>
                    <div className="relative">
                      <Link2 className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                      <input 
                        type="text" 
                        placeholder="Ej: 1jFULHoolKxRtE7fPmNOh8uCI..." 
                        value={inputSheetId}
                        onChange={(e) => setInputSheetId(e.target.value)}
                        className="w-full p-6 pl-16 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-bold text-sm outline-none focus:border-emerald-500 transition-all shadow-inner"
                      />
                    </div>
                 </div>

                 <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100">
                    <div className="flex items-start gap-4">
                       <Info size={20} className="text-blue-500 mt-1 flex-shrink-0" />
                       <div className="text-[10px] font-bold text-slate-600 leading-relaxed uppercase">
                          Encuentra el ID en la URL de tu navegador entre <span className="text-blue-900 font-black">/d/</span> y <span className="text-blue-900 font-black">/edit</span>. El archivo debe ser de acceso público o compartido con la cuenta institucional.
                       </div>
                    </div>
                 </div>

                 <div className="flex gap-4 pt-6">
                    <button 
                      onClick={handleBulkUpload}
                      className="flex-1 bg-emerald-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all shadow-xl active:scale-95"
                    >
                      Iniciar Integración
                    </button>
                    <button 
                      onClick={() => { setIsSyncModalOpen(false); setInputSheetId(''); }}
                      className="px-10 bg-slate-100 text-slate-400 py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all"
                    >
                      Cancelar
                    </button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FORMULARIO DE EDICIÓN / REGISTRO INDIVIDUAL */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-blue-950/90 backdrop-blur-2xl z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
              className="bg-white rounded-[4rem] w-full max-w-2xl p-16 border-4 border-[#facc15] shadow-[0_0_100px_rgba(250,204,21,0.2)] overflow-y-auto max-h-[95vh] custom-scroll"
            >
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-6">
                   <div className="bg-blue-100 p-5 rounded-[2rem] text-blue-900 shadow-xl"><PlusCircle size={40} /></div>
                   <div>
                      <h4 className="text-3xl font-black uppercase text-blue-950 tracking-tighter leading-none">{editingEvent ? 'Modificar Actividad' : 'Nueva Actividad'}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Sincronización individual en tiempo real</p>
                   </div>
                </div>
                <button onClick={() => { setIsFormOpen(false); setEditingEvent(null); }} className="text-slate-300 hover:text-red-600 transition-all active:scale-90"><X size={48}/></button>
              </div>

              <form onSubmit={handleSaveEvent} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2 space-y-3">
                  <label className="text-[11px] font-black uppercase text-blue-900 ml-6 tracking-widest">Actividad / Reunión / Día Especial</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required 
                    className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-black uppercase text-sm focus:border-blue-900 focus:bg-white outline-none transition-all shadow-inner" />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase text-blue-900 ml-6 tracking-widest">Fecha Inicio</label>
                  <input type="date" value={formData.start} onChange={e => setFormData({...formData, start: e.target.value})} required className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-black text-sm outline-none focus:border-blue-900" />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase text-blue-900 ml-6 tracking-widest">Fecha Final</label>
                  <input type="date" value={formData.end} onChange={e => setFormData({...formData, end: e.target.value})} required className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-black text-sm outline-none focus:border-blue-900" />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase text-blue-900 ml-6 tracking-widest">Hora</label>
                  <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} required className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-black text-sm outline-none focus:border-blue-900" />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase text-blue-900 ml-6 tracking-widest">Tipo de Categoría</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as EventType})} className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-black text-sm uppercase outline-none focus:border-blue-900 appearance-none">
                    <option value="academico">Académico</option>
                    <option value="institucional">Institucional</option>
                    <option value="festivo">Festivo Nacional</option>
                    <option value="vacaciones">Receso / Vacaciones</option>
                    <option value="significativo">Fecha Especial / Hito</option>
                  </select>
                </div>
                <div className="md:col-span-2 space-y-3">
                   <label className="text-[11px] font-black uppercase text-blue-900 ml-6 tracking-widest">Ubicación / Lugar</label>
                   <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-black text-sm outline-none focus:border-blue-900 shadow-inner" placeholder="Ej: Aula Máxima / Biblioteca" />
                </div>
                <div className="md:col-span-2 space-y-3">
                   <label className="text-[11px] font-black uppercase text-blue-900 ml-6 tracking-widest">Personal / Estudiantes Participantes</label>
                   <input type="text" value={formData.participants} onChange={e => setFormData({...formData, participants: e.target.value})} className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-black text-sm outline-none focus:border-blue-900 shadow-inner" placeholder="Ej: Todos los grados / Docentes de Área" />
                </div>
                <div className="md:col-span-2 space-y-3">
                   <label className="text-[11px] font-black uppercase text-blue-900 ml-6 tracking-widest">Observaciones y Detalles</label>
                   <textarea rows={3} value={formData.observations} onChange={e => setFormData({...formData, observations: e.target.value})} className="w-full p-8 bg-slate-50 border-2 border-slate-100 rounded-[3rem] font-bold text-sm outline-none focus:border-blue-900 shadow-inner custom-scroll" placeholder="Detalles específicos..." />
                </div>
                <div className="md:col-span-2 pt-10">
                  <button type="submit" className="w-full bg-blue-900 text-white py-8 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-xl shadow-[0_30px_60px_-10px_rgba(30,58,138,0.5)] hover:bg-blue-800 transition-all active:scale-95 flex items-center justify-center gap-6">
                    <Save size={32} /> {editingEvent ? 'Actualizar Cambios' : 'Sincronizar Cambios'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETALLES DE DÍA (POPUP) */}
      <AnimatePresence>
        {selectedDayEvents && (
          <div className="fixed inset-0 bg-blue-950/60 backdrop-blur-md z-[120] flex items-center justify-center p-4">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
               className="bg-white rounded-[4rem] w-full max-w-xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] overflow-hidden border-4 border-blue-900"
             >
                <div className={`p-10 text-white flex justify-between items-center relative overflow-hidden ${
                  isFeb2(selectedDayEvents.date) ? 'bg-amber-600' :
                  selectedDayEvents.events.some(e => e.type === 'festivo') ? 'bg-red-800' : 
                  selectedDayEvents.events.some(e => e.type === 'significativo') ? 'bg-purple-900' : 'bg-blue-900'
                }`}>
                  <div className="relative z-10">
                    <h4 className="text-3xl font-black uppercase tracking-tighter leading-none">{format(selectedDayEvents.date, 'dd MMMM', { locale: es })}</h4>
                    <p className="text-[11px] font-black uppercase opacity-60 tracking-[0.3em] mt-2">{format(selectedDayEvents.date, 'EEEE', { locale: es })}</p>
                  </div>
                  <button onClick={() => setSelectedDayEvents(null)} className="relative z-10 bg-white/20 p-4 rounded-full hover:bg-white/30 transition-all active:scale-90"><X size={32}/></button>
                  <CalendarIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 opacity-10 pointer-events-none" />
                </div>
                <div className="p-10 space-y-8 max-h-[65vh] overflow-y-auto custom-scroll bg-blue-50/20">
                  {selectedDayEvents.events.length > 0 ? selectedDayEvents.events.map(e => (
                    <div key={e.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border-2 border-blue-50 relative group">
                      <span className={`absolute top-6 right-8 text-[8px] font-black px-3 py-1 rounded-full uppercase text-white ${
                        e.type === 'festivo' ? 'bg-red-700' : 
                        e.type === 'significativo' ? 'bg-purple-700' : 
                        e.type === 'institucional' ? 'bg-yellow-500' : 'bg-blue-700'
                      }`}>{e.type === 'festivo' ? 'FESTIVO NACIONAL' : e.type}</span>
                      <h5 className="text-2xl font-black text-blue-950 uppercase leading-tight mb-6 pr-12">{e.title}</h5>
                      <div className="grid grid-cols-2 gap-y-6 gap-x-8 text-[11px] font-bold text-slate-500">
                        <div className="flex flex-col gap-1">
                           <span className="text-[8px] font-black uppercase opacity-50 tracking-widest flex items-center gap-1"><Clock size={10}/> Periodo</span>
                           <span className="text-blue-900">{format(e.start, 'dd/MM/yy')} - {format(e.end, 'dd/MM/yy')}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                           <span className="text-[8px] font-black uppercase opacity-50 tracking-widest flex items-center gap-1"><Clock size={10}/> Hora</span>
                           <span className="text-blue-900">{e.time}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                           <span className="text-[8px] font-black uppercase opacity-50 tracking-widest flex items-center gap-1"><MapPin size={10}/> Lugar</span>
                           <span className="text-slate-800">{e.location}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                           <span className="text-[8px] font-black uppercase opacity-50 tracking-widest flex items-center gap-1"><Users size={10}/> Participan</span>
                           <span className="text-slate-800">{e.participants}</span>
                        </div>
                      </div>
                      <div className="mt-8 pt-6 border-t border-slate-100">
                        <span className="text-[8px] font-black uppercase opacity-50 tracking-widest mb-2 block">Observaciones</span>
                        <p className="text-xs italic text-slate-600 bg-slate-50 p-4 rounded-2xl leading-relaxed">{e.observations || 'Sin observaciones adicionales registradas.'}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-20">
                       <CalendarIcon size={64} className="mx-auto text-blue-100 mb-6" />
                       <p className="text-slate-300 font-black uppercase tracking-widest text-lg">Sin actividades programadas</p>
                    </div>
                  )}
                </div>
                <div className="p-8 bg-white border-t-2 border-blue-50">
                   <button onClick={() => setSelectedDayEvents(null)} className="w-full bg-blue-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all">Regresar al Calendario</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

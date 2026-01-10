
import React, { useState, useMemo, useEffect } from 'react';
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
  Star,
  LayoutGrid,
  List as ListIcon,
  CalendarSearch,
  Edit3,
  Search,
  ChevronRight,
  ArrowUpRight,
  Rocket,
  Download,
  PartyPopper,
  Eye,
  MoreHorizontal,
  Flag,
  Trophy,
  Briefcase,
  Users,
  Info,
  CalendarDays,
  Save,
  BellRing,
  Award,
  Globe,
  Sparkles
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  eachDayOfInterval, 
  isWithinInterval, 
  isToday,
  endOfISOWeek,
  addDays,
  isSameMonth,
  endOfMonth,
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
  MONTH_NAMES 
} from './constants';

const startOfISOWeek = (date: Date): Date => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = d.getDate() - (day === 0 ? 6 : day - 1);
  return new Date(d.setDate(diff));
};
const startOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1);
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

const getEventFullDate = (event: CalendarEvent): Date => {
  const fullDate = new Date(event.start);
  const timeStr = event.time || '00:00';
  const [hours, minutes] = timeStr.split(':').map(Number);
  fullDate.setHours(hours || 0, minutes || 0, 0, 0);
  return fullDate;
};

export default function App() {
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    return INITIAL_EVENTS.map(e => ({
      ...e,
      day: e.day || format(e.start, 'EEEE', { locale: es }).toUpperCase(),
      time: e.time || '06:30',
      location: e.location || 'Sedes IENSECAN',
      participants: e.participants || 'Comunidad Educativa',
      observations: e.observations || e.description || 'Sin observaciones adicionales',
      description: e.description || e.observations || 'Sin descripción'
    }));
  });

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  const [displayMode, setDisplayMode] = useState<DisplayMode>('grid');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ date: Date; events: CalendarEvent[] } | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const RESOLUTION_PDF_URL = "https://drive.google.com/file/d/1ITb8dynfmdWBttmjIyGLhQtz17URcLxG/view?usp=drive_link";
  const ADMIN_PASSWORD = "iensecan2026*";

  const [formData, setFormData] = useState({
    title: '',
    start: format(new Date(), 'yyyy-MM-dd'),
    type: 'academico' as EventType,
    day: format(new Date(), 'EEEE', { locale: es }).toUpperCase(),
    time: '06:30',
    location: 'Todas las Sedes',
    participants: 'Comunidad Educativa',
    observations: ''
  });

  const PATRON_DAY = '2026-02-02';

  const academicBoundaries = useMemo(() => ({
    '2026-01-26': 'INICIO P1 / CLASES',
    '2026-04-10': 'FINAL P1',
    '2026-04-13': 'INICIO P2',
    '2026-08-21': 'FINAL P2',
    '2026-08-24': 'INICIO P3',
    '2026-12-04': 'FINAL P3 / CLASES'
  }), []);

  const sdiBoundaries = useMemo(() => [
    '2026-01-12', '2026-01-23', // SDI 1
    '2026-03-30', '2026-04-03', // SDI 2
    '2026-10-05', '2026-10-09', // SDI 3
    '2026-12-07', '2026-12-11'  // SDI 4
  ], []);

  const isAcademicBoundary = (date: Date) => academicBoundaries[format(date, 'yyyy-MM-dd')] !== undefined;
  const isSDIBoundary = (date: Date) => sdiBoundaries.includes(format(date, 'yyyy-MM-dd'));
  const isPatronDay = (date: Date) => format(date, 'yyyy-MM-dd') === PATRON_DAY;

  const upcomingEvents = useMemo(() => {
    return [...events]
      .filter(e => isAfter(getEventFullDate(e), now))
      .sort((a, b) => getEventFullDate(a).getTime() - getEventFullDate(b).getTime());
  }, [events, now]);

  const featuredEvent = upcomingEvents[0];
  const nextSevenEvents = upcomingEvents.slice(1, 8);

  const handleDateChange = (dateString: string) => {
    const date = parseISO(dateString);
    setFormData(prev => ({
      ...prev,
      start: dateString,
      day: format(date, 'EEEE', { locale: es }).toUpperCase()
    }));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setLoginPassword('');
    } else {
      alert("Contraseña incorrecta. Intente de nuevo.");
    }
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const eventData: CalendarEvent = {
      id: editingEvent ? editingEvent.id : Math.random().toString(36).substr(2, 9),
      title: formData.title,
      start: startOfDay(parseISO(formData.start)),
      end: startOfDay(parseISO(formData.start)),
      type: formData.type,
      day: formData.day,
      time: formData.time,
      location: formData.location,
      participants: formData.participants,
      observations: formData.observations,
      description: formData.observations
    };

    if (editingEvent) setEvents(prev => prev.map(ev => ev.id === editingEvent.id ? eventData : ev));
    else setEvents(prev => [eventData, ...prev]);
    
    setIsAddingNew(false);
    setEditingEvent(null);
  };

  const renderMonthView = () => {
    const start = startOfMonth(currentDate);
    const days = eachDayOfInterval({ start: startOfISOWeek(start), end: endOfISOWeek(endOfMonth(start)) });
    return (
      <div className="flex flex-col bg-[#1e3a8a]">
        <div className="grid grid-cols-7 metallic-header text-[#1e3a8a] font-black text-[11px] uppercase py-3 text-center relative z-20">
          {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-[1px] relative">
          {days.map((day, idx) => {
            const dayEvents = events.filter(e => isWithinInterval(startOfDay(day), { start: startOfDay(e.start), end: startOfDay(e.end) }));
            const isCurrMonth = isSameMonth(day, currentDate);
            const dateKey = format(day, 'yyyy-MM-dd');
            const boundaryLabel = academicBoundaries[dateKey];
            const isAcademic = !!boundaryLabel;
            const isPatron = isPatronDay(day);
            const isSDI = isSDIBoundary(day);
            const isRefToday = isToday(day);
            const holidayEvent = dayEvents.find(e => e.type === 'festivo');
            const efemerideEvent = dayEvents.find(e => e.type === 'efemeride');
            const isSunday = getDay(day) === 0;

            return (
              <div 
                key={idx} 
                onClick={() => setSelectedDayEvents({ date: day, events: dayEvents })}
                onMouseEnter={() => dayEvents.length > 0 && setHoveredDate(dateKey)}
                onMouseLeave={() => setHoveredDate(null)}
                className={`group aspect-square p-2 flex flex-col cursor-pointer transition-all hover:brightness-95 relative
                  ${!isCurrMonth ? 'bg-slate-100 opacity-40' : 
                    isRefToday ? 'bg-yellow-50 ring-inset ring-4 ring-[#facc15] z-10 shadow-xl' :
                    isPatron ? 'bg-yellow-50 ring-inset ring-4 ring-yellow-400 z-10 scale-[1.05] shadow-[0_0_30px_rgba(250,204,21,0.4)]' :
                    isAcademic ? 'bg-emerald-50 ring-inset ring-2 ring-emerald-500 z-10 scale-[1.02] shadow-xl' :
                    isSDI ? 'bg-blue-50 ring-inset ring-2 ring-blue-500 z-10' : 
                    efemerideEvent ? 'bg-violet-50/50' :
                    holidayEvent ? 'bg-red-50' : 
                    isSunday ? 'bg-slate-50' : 'bg-white'}
                `}
              >
                <div className="flex justify-between items-start">
                   <span className={`text-xl font-black 
                     ${!isCurrMonth ? 'text-slate-300' : 
                       isRefToday ? 'text-blue-900' :
                       isPatron ? 'text-yellow-700' :
                       isAcademic ? 'text-emerald-800' :
                       isSDI ? 'text-blue-800' : 
                       efemerideEvent ? 'text-violet-700' :
                       holidayEvent ? 'text-red-600' : 
                       isSunday ? 'text-red-400' : 'text-slate-900'}
                   `}>
                     {format(day, 'd')}
                   </span>
                   <div className="flex gap-1">
                      {isPatron && <Sparkles size={16} className="text-yellow-500 animate-pulse" />}
                      {isRefToday && <div className="bg-[#facc15] text-[#1e3a8a] text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-sm animate-pulse">HOY</div>}
                      {efemerideEvent && <Globe size={12} className="text-violet-500" />}
                      {isAcademic && <Award size={14} className="text-emerald-600" />}
                      {holidayEvent && <Star size={12} className="text-red-500 fill-red-500" />}
                   </div>
                </div>

                <div className="mt-1 space-y-0.5 overflow-hidden">
                   {isPatron && isCurrMonth && (
                     <div className="bg-yellow-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-sm uppercase mb-1 shadow-md w-fit border border-yellow-200 animate-bounce">
                       DÍA PATRONAL
                     </div>
                   )}
                   {isAcademic && isCurrMonth && !isPatron && (
                     <div className="bg-emerald-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-sm uppercase mb-1 shadow-sm w-fit border border-emerald-400 animate-pulse">
                       {boundaryLabel}
                     </div>
                   )}
                   {efemerideEvent && isCurrMonth && !isAcademic && !isPatron && (
                     <div className="bg-violet-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-sm uppercase mb-1 shadow-sm w-fit border border-violet-400">
                       EFEMÉRIDE
                     </div>
                   )}
                   {isSDI && isCurrMonth && !isAcademic && !isPatron && !efemerideEvent && (
                     <div className="bg-blue-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-sm uppercase mb-1 shadow-sm w-fit border border-blue-400">
                       HITO SDI
                     </div>
                   )}
                   {holidayEvent && isCurrMonth && !isAcademic && !isPatron && !efemerideEvent && (
                     <div className="bg-red-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-sm uppercase mb-1 shadow-sm w-fit animate-pulse border border-red-400">
                       FESTIVO
                     </div>
                   )}
                   {dayEvents.slice(0, 1).map(e => (
                     <div key={e.id} className={`text-[6px] font-black uppercase truncate px-1 rounded-sm
                       ${isPatronDay(e.start) ? 'bg-yellow-700 text-white' :
                         isAcademicBoundary(e.start) ? 'bg-emerald-700 text-white' :
                         e.type === 'efemeride' ? 'bg-violet-100 text-violet-800' :
                         e.type === 'festivo' ? 'bg-red-100 text-red-700' : 
                         e.type === 'institucional' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-blue-900'}
                     `}>
                       {e.title}
                     </div>
                   ))}
                </div>

                <AnimatePresence>
                  {hoveredDate === dateKey && dayEvents.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className={`absolute left-0 top-full mt-2 min-w-[280px] z-[100] rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.4)] border-2 p-5 backdrop-blur-3xl
                        ${isPatron ? 'bg-yellow-950/95 border-yellow-400' : isAcademic ? 'bg-emerald-950/95 border-emerald-400' : efemerideEvent ? 'bg-violet-950/95 border-violet-400' : 'bg-slate-900/95 border-blue-400'}
                      `}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#facc15] flex items-center gap-2">
                          {isPatron ? <Sparkles size={14}/> : isAcademic ? <Award size={14}/> : efemerideEvent ? <Globe size={14}/> : <CalendarIcon size={14} />} Detalle de Agenda
                        </span>
                        <MoreHorizontal size={14} className="text-white/40" />
                      </div>
                      <div className="space-y-3">
                        {dayEvents.map(e => (
                          <div 
                            key={e.id}
                            onClick={() => setSelectedDayEvents({ date: day, events: [e] })}
                            className="group/item flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
                          >
                            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${isPatronDay(e.start) ? 'bg-yellow-400 animate-pulse' : isAcademicBoundary(e.start) ? 'bg-emerald-400 animate-pulse' : e.type === 'efemeride' ? 'bg-violet-400' : 'bg-blue-400'}`}></div>
                            <div className="flex-grow">
                              <p className="text-[11px] font-black text-white uppercase leading-tight group-hover/item:text-[#facc15]">{e.title}</p>
                              <p className="text-[8px] text-white/50 font-bold uppercase tracking-tighter">{e.type} | {e.time}</p>
                            </div>
                            <ChevronRight size={14} className="text-white/20 group-hover/item:text-white transition-all group-hover/item:translate-x-1" />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <header className="bg-white border-b-2 border-[#1e3a8a] shadow-lg py-6 px-4 no-print relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-full bg-blue-900/5 -skew-x-12 transform translate-x-20"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-10">
            <div className="w-32 h-32 md:w-36 md:h-36 bg-white p-2 rounded-3xl shadow-inner border border-blue-50 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img src="https://iensecan.edu.co/wp-content/uploads/2024/08/ESCUDO-IENSECAN-2020-2.png" alt="Escudo IENSECAN" className="max-w-full max-h-full object-contain" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-slate-400 tracking-tight uppercase leading-tight mb-1">I.E. NUESTRA SEÑORA DE LA CANDELARIA</h1>
              <div className="relative inline-block">
                <h2 className="text-3xl md:text-4xl font-black text-[#1e3a8a] tracking-tighter uppercase drop-shadow-sm">CALENDARIO ACADÉMICO 2026</h2>
                <div className="h-1.5 w-full bg-gradient-to-r from-[#1e3a8a] via-[#facc15] to-[#1e3a8a] mt-1 rounded-full shadow-sm"></div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <a href={RESOLUTION_PDF_URL} target="_blank" rel="noopener noreferrer" 
               className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black text-xs flex items-center gap-3 transition-all hover:bg-red-700 hover:scale-105 uppercase shadow-[0_10px_20px_rgba(220,38,38,0.3)] border-2 border-red-400">
              <Download size={20} /> DESCARGAR RESOLUCIÓN 1.210.03.01
            </a>
            <button onClick={() => setIsAdminModalOpen(true)} className="bg-blue-900 text-white px-6 py-4 rounded-2xl font-black text-xs flex items-center gap-2 transition-all hover:bg-blue-800 uppercase"><Settings size={18} /> GESTIÓN</button>
            <button onClick={() => window.print()} className="bg-slate-50 text-slate-500 px-6 py-4 rounded-2xl font-black text-xs flex items-center gap-2 transition-all hover:bg-slate-100 uppercase"><Printer size={18} /> IMPRIMIR</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-12 flex-grow w-full">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 no-print">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3 mb-6">
              <BellRing className="text-blue-900 animate-pulse" size={24} />
              <h3 className="text-xl font-black text-blue-900 uppercase tracking-tighter">Próxima Actividad Inmediata</h3>
            </div>
            <AnimatePresence mode="wait">
              {featuredEvent ? (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }}
                  className={`bg-white rounded-[3.5rem] p-10 shadow-2xl border-4 relative overflow-hidden group
                    ${isPatronDay(featuredEvent.start) ? 'border-yellow-500 ring-8 ring-yellow-500/10' : isAcademicBoundary(featuredEvent.start) ? 'border-emerald-500 ring-8 ring-emerald-500/10' : featuredEvent.type === 'efemeride' ? 'border-violet-500 ring-8 ring-violet-500/10' : 'border-blue-900'}
                  `}
                >
                  <div className="absolute top-0 right-0 p-8 text-blue-900/10"><Trophy size={140}/></div>
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm
                        ${isPatronDay(featuredEvent.start) ? 'bg-yellow-600 text-white animate-bounce' : isAcademicBoundary(featuredEvent.start) ? 'bg-emerald-600 text-white animate-bounce' : featuredEvent.type === 'efemeride' ? 'bg-violet-600 text-white' : 'bg-[#facc15] text-[#1e3a8a]'}
                      `}>
                        {isPatronDay(featuredEvent.start) ? '¡GALA PATRONAL IENSECAN!' : isAcademicBoundary(featuredEvent.start) ? 'HITO ACADÉMICO CRUCIAL' : featuredEvent.type === 'efemeride' ? 'CELEBRACIÓN INTERNACIONAL' : 'SIGUIENTE EN AGENDA'}
                      </span>
                    </div>
                    <h4 className={`text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none ${isPatronDay(featuredEvent.start) ? 'text-yellow-700' : 'text-blue-950'}`}>
                      {featuredEvent.title}
                    </h4>
                    
                    <div className="bg-blue-50/50 p-6 rounded-[2.5rem] border border-blue-100 space-y-4">
                      <p className="text-sm md:text-base text-slate-600 font-medium italic leading-relaxed">
                        "{featuredEvent.observations || featuredEvent.description}"
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-blue-100">
                        <div className="flex items-center gap-2 text-[11px] font-black text-blue-900 uppercase">
                           <CalendarIcon size={16} className="text-[#facc15]"/> {format(featuredEvent.start, 'EEEE dd MMMM', { locale: es })}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-black text-blue-900 uppercase">
                           <Clock size={16} className="text-[#facc15]"/> {featuredEvent.time}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-black text-blue-900 uppercase">
                           <MapPin size={16} className="text-[#facc15]"/> {featuredEvent.location}
                        </div>
                      </div>
                    </div>
                    
                    <button onClick={() => setSelectedDayEvents({ date: featuredEvent.start, events: [featuredEvent] })} 
                            className={`${isPatronDay(featuredEvent.start) ? 'bg-yellow-600' : 'bg-blue-900'} text-white px-10 py-5 rounded-2xl font-black uppercase text-xs flex items-center gap-3 shadow-xl hover:scale-105 transition-all`}>
                      Ver Ficha Completa <ArrowUpRight size={20}/>
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white rounded-[3.5rem] p-20 shadow-xl border-2 border-slate-100 text-center">
                  <CalendarSearch size={64} className="mx-auto text-slate-200 mb-6" />
                  <p className="text-slate-400 font-black uppercase tracking-widest">Agenda despejada para este periodo</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-5 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-blue-900 uppercase tracking-tighter">Próximos 7 Eventos</h3>
              <div className="h-0.5 flex-grow mx-4 bg-slate-200"></div>
            </div>
            <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2 custom-scroll">
               {nextSevenEvents.map((e, idx) => {
                 const isAcademic = isAcademicBoundary(e.start);
                 const isSDI = isSDIBoundary(e.start);
                 const isPatron = isPatronDay(e.start);
                 const isEfemeride = e.type === 'efemeride';
                 return (
                   <motion.div 
                     key={e.id} 
                     initial={{ opacity: 0, y: 10 }} 
                     animate={{ opacity: 1, y: 0 }} 
                     transition={{ delay: idx * 0.05 }}
                     onClick={() => setSelectedDayEvents({ date: e.start, events: [e] })}
                     className={`p-5 rounded-3xl border-2 transition-all cursor-pointer group flex items-center gap-5 shadow-sm
                       ${isPatron ? 'bg-yellow-100 border-yellow-500' : isAcademic ? 'bg-emerald-100 border-emerald-500' : isEfemeride ? 'bg-violet-50 border-violet-500' : isSDI ? 'bg-blue-50 border-blue-500' : 'bg-white border-blue-50 hover:border-[#facc15]'}
                     `}
                   >
                      <div className={`min-w-[65px] h-16 rounded-2xl flex flex-col items-center justify-center border 
                        ${isPatron ? 'bg-yellow-200 border-yellow-400 text-yellow-900' : isAcademic ? 'bg-emerald-200 border-emerald-400 text-emerald-900' : isEfemeride ? 'bg-violet-200 border-violet-400 text-violet-900' : 'bg-blue-50 border-blue-100 text-[#1e3a8a]'}
                      `}>
                          <span className="text-[9px] font-black uppercase leading-none">{format(e.start, 'MMM', { locale: es })}</span>
                          <span className="text-2xl font-black leading-none">{format(e.start, 'dd')}</span>
                      </div>
                      <div className="flex-grow">
                          <h5 className={`text-[11px] font-black uppercase line-clamp-1 transition-colors ${isPatron ? 'text-yellow-900' : isAcademic ? 'text-emerald-900' : isEfemeride ? 'text-violet-900' : 'text-blue-950 group-hover:text-blue-600'}`}>{e.title}</h5>
                          <p className="text-[9px] text-slate-400 font-medium italic line-clamp-1 mt-1">"{e.observations || e.description}"</p>
                      </div>
                      <ChevronRight size={18} className="text-slate-200 group-hover:text-[#facc15] transition-all" />
                   </motion.div>
                 );
               })}
            </div>
          </div>
        </section>

        <section className="bg-white rounded-[3.5rem] shadow-2xl border-4 border-blue-900 overflow-hidden metallic-3d-frame no-print">
          <div className="bg-blue-900 p-8 flex flex-wrap justify-between items-center gap-6">
            <div className="flex items-center gap-6 text-white">
              <button onClick={() => setCurrentDate(addMonths(currentDate, -1))} className="p-2 hover:bg-white/20 rounded-full transition-all active:scale-90"><ArrowLeftCircle size={36} /></button>
              <h3 className="text-2xl font-black uppercase tracking-tighter min-w-[200px] text-center">{MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
              <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-white/20 rounded-full transition-all active:scale-90"><ArrowRightCircle size={36} /></button>
            </div>
            <div className="flex bg-white/10 p-1.5 rounded-2xl border border-white/10">
              <button onClick={() => setDisplayMode('grid')} className={`p-3 rounded-xl transition-all ${displayMode === 'grid' ? 'bg-white text-blue-900' : 'text-white/50'}`}><LayoutGrid size={24}/></button>
              <button onClick={() => setDisplayMode('list')} className={`p-3 rounded-xl transition-all ${displayMode === 'list' ? 'bg-white text-blue-900' : 'text-white/50'}`}><ListIcon size={24}/></button>
            </div>
          </div>
          <div className="min-h-[600px] bg-slate-100">
            {displayMode === 'grid' ? renderMonthView() : (
              <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.filter(e => isSameMonth(e.start, currentDate)).map(e => (
                   <div key={e.id} className="p-8 bg-white rounded-[2.5rem] border-2 border-blue-50 hover:border-[#facc15] transition-all cursor-pointer shadow-sm group" onClick={() => setSelectedDayEvents({ date: e.start, events: [e] })}>
                      <div className="flex justify-between items-start mb-4">
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${isPatronDay(e.start) ? 'bg-yellow-600 text-white' : e.type === 'efemeride' ? 'bg-violet-900 text-white' : 'bg-blue-900 text-[#facc15]'}`}>
                          {format(e.start, 'dd MMMM', { locale: es })}
                        </span>
                        <ArrowUpRight size={20} className="text-slate-200 group-hover:text-blue-900 transition-all" />
                      </div>
                      <h5 className="font-black text-blue-950 uppercase text-xl leading-tight mb-4">{e.title}</h5>
                      <div className="flex flex-wrap gap-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-50 pt-4">
                        <span className="flex items-center gap-1"><Clock size={12}/> {e.time}</span>
                        <span className="flex items-center gap-1"><MapPin size={12}/> {e.location}</span>
                      </div>
                   </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* MODAL DETALLES DEL DÍA */}
      <AnimatePresence>
        {selectedDayEvents && (
          <div className="fixed inset-0 bg-blue-950/70 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={`bg-white rounded-[4rem] w-full max-w-2xl shadow-2xl overflow-hidden border-4 ${isPatronDay(selectedDayEvents.date) ? 'border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.3)]' : isAcademicBoundary(selectedDayEvents.date) ? 'border-emerald-500' : selectedDayEvents.events.some(e => e.type === 'efemeride') ? 'border-violet-500' : 'border-blue-900'}`}>
                <div className={`p-10 text-white flex justify-between items-center ${isPatronDay(selectedDayEvents.date) ? 'bg-yellow-600' : isAcademicBoundary(selectedDayEvents.date) ? 'bg-emerald-600' : 'bg-blue-900'}`}>
                  <div>
                    <h4 className="text-3xl font-black uppercase tracking-tighter leading-none">{format(selectedDayEvents.date, 'dd MMMM', { locale: es })}</h4>
                    <p className="text-[11px] font-black uppercase opacity-60 mt-2">{format(selectedDayEvents.date, 'EEEE', { locale: es })}</p>
                  </div>
                  <button onClick={() => setSelectedDayEvents(null)} className="bg-white/20 p-4 rounded-full hover:bg-white/30 transition-all"><X size={32}/></button>
                </div>
                <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scroll bg-slate-50">
                  {selectedDayEvents.events.map(e => (
                    <div key={e.id} className={`p-8 rounded-[3rem] shadow-xl border-2 bg-white space-y-6 relative overflow-hidden ${isPatronDay(e.start) ? 'border-yellow-400' : isAcademicBoundary(e.start) ? 'border-emerald-500' : e.type === 'efemeride' ? 'border-violet-500' : 'border-white'}`}>
                      {isPatronDay(e.start) && <div className="absolute -top-6 -right-6 text-yellow-100/50 rotate-12"><Sparkles size={120} /></div>}
                      <div className="flex items-start gap-4">
                        <div className={`p-4 rounded-2xl ${isPatronDay(e.start) ? 'bg-yellow-100 text-yellow-700' : isAcademicBoundary(e.start) ? 'bg-emerald-100 text-emerald-700' : e.type === 'efemeride' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'}`}><CalendarDays size={24}/></div>
                        <div className="flex-grow">
                            <span className={`text-[9px] font-black uppercase tracking-widest ${isPatronDay(e.start) ? 'text-yellow-600' : isAcademicBoundary(e.start) ? 'text-emerald-500' : 'text-blue-500'}`}>
                              {isPatronDay(e.start) ? 'SOLEMNIDAD INSTITUCIONAL' : e.type === 'efemeride' ? 'EFEMÉRIDE / DÍA INTERNACIONAL' : 'HITO INSTITUCIONAL / REUNIÓN'}
                            </span>
                            <h5 className={`text-2xl font-black uppercase leading-tight ${isPatronDay(e.start) ? 'text-yellow-800' : 'text-blue-950'}`}>{e.title}</h5>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-slate-100">
                        <div className="space-y-1">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">FECHA</span>
                            <p className="text-[10px] font-black text-blue-900">{format(e.start, 'dd-MM-yyyy')}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">DIA</span>
                            <p className="text-[10px] font-black text-blue-900 uppercase">{e.day || format(e.start, 'EEEE', { locale: es })}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">HORA</span>
                            <p className="text-[10px] font-black text-blue-900">{e.time}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">LUGAR</span>
                            <p className="text-[10px] font-black text-blue-900 uppercase">{e.location}</p>
                        </div>
                      </div>

                      <div className="space-y-2 pt-6 border-t border-slate-100">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Users size={12}/> PARTICIPANTES</span>
                        <p className="text-[11px] font-bold text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">{e.participants || 'Comunidad Educativa'}</p>
                      </div>

                      <div className="space-y-2 pt-4">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Info size={12}/> OBSERVACIONES</span>
                        <p className={`text-[11px] font-medium italic leading-relaxed p-4 rounded-2xl border ${isPatronDay(e.start) ? 'bg-yellow-50 border-yellow-100 text-yellow-800' : 'bg-blue-50/30 border-blue-50 text-slate-600'}`}>"{e.observations || 'Sin observaciones'}"</p>
                      </div>
                    </div>
                  ))}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="bg-blue-900 text-white py-16 text-center text-xs border-t-4 border-[#facc15]">
        <div className="max-w-4xl mx-auto px-6 space-y-4">
          <p className="font-black uppercase tracking-widest text-2xl mb-4 leading-tight">Institución Educativa Nuestra Señora de la Candelaria</p>
          <div className="flex flex-wrap justify-center gap-6 text-slate-300 font-bold uppercase tracking-widest">
             <span className="flex items-center gap-2"><MapPin size={14}/> Candelaria, Valle del Cauca</span>
             <span className="flex items-center gap-2">Sede Administrativa: Nelson Muñoz</span>
          </div>
          <p className="text-[#facc15] font-black text-base mt-8 shadow-sm">SISTEMA DE CALENDARIO ESCOLAR 2026</p>
          <p className="opacity-40 italic mt-12">Programado y diseñado por el Webmaster: Nelson Muñoz.</p>
        </div>
      </footer>

      {/* PANEL DE GESTIÓN (ADMIN) */}
      <AnimatePresence>
        {isAdminModalOpen && (
          <div className="fixed inset-0 bg-blue-950/80 backdrop-blur-2xl z-[300] flex items-center justify-center p-4">
            {!isAuthenticated ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[3rem] w-full max-w-md p-12 shadow-2xl border-4 border-blue-900 text-center">
                <Lock size={64} className="text-blue-900 mb-8 mx-auto" />
                <h3 className="text-3xl font-black text-blue-950 uppercase mb-8 tracking-tighter">Acceso Directivo</h3>
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="text-left space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Usuario Institucional</label>
                    <input type="email" defaultValue="administrador@iensecan.edu.co" disabled className="w-full px-8 py-5 bg-slate-50 rounded-2xl font-bold text-slate-400 border border-slate-100 cursor-not-allowed" />
                  </div>
                  <div className="text-left space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Contraseña de Acceso</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={loginPassword} 
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required 
                      className="w-full px-8 py-5 bg-slate-100 rounded-2xl font-bold focus:ring-4 ring-blue-500/20 outline-none transition-all border border-slate-200" 
                    />
                  </div>
                  <button type="submit" className="w-full bg-blue-900 text-white py-6 rounded-2xl font-black uppercase text-sm shadow-2xl hover:bg-blue-800 transition-all">Desbloquear Gestión</button>
                  <button type="button" onClick={() => { setIsAdminModalOpen(false); setLoginPassword(''); }} className="w-full text-slate-400 font-black uppercase text-[10px] py-2 hover:text-red-500 transition-colors">Volver al Calendario</button>
                </form>
              </motion.div>
            ) : (
              <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-[4rem] w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border-4 border-blue-900">
                <div className="bg-blue-900 p-10 text-white flex justify-between items-center no-print">
                  <div>
                    <h3 className="text-3xl font-black uppercase tracking-widest flex items-center gap-4">Gestión Académica 2026</h3>
                    <p className="text-[10px] font-bold opacity-50 uppercase mt-2 tracking-widest">Configuración de Reuniones y Actividades Oficiales</p>
                  </div>
                  <div className="flex gap-4">
                    {!isAddingNew && <button onClick={() => setIsAddingNew(true)} className="bg-[#facc15] text-blue-900 px-8 py-4 rounded-2xl font-black text-xs uppercase flex items-center gap-3 shadow-xl hover:scale-105 transition-all"><PlusCircle size={20}/> NUEVA ACTIVIDAD</button>}
                    <button onClick={() => { setIsAdminModalOpen(false); setIsAuthenticated(false); }} className="bg-white/10 hover:bg-white/20 p-4 rounded-full transition-all"><X size={32}/></button>
                  </div>
                </div>

                <div className="flex-grow overflow-y-auto p-12 bg-slate-50 custom-scroll">
                  {isAddingNew ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[3.5rem] p-12 shadow-2xl border-4 border-blue-50 max-w-4xl mx-auto">
                        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-100">
                            <Edit3 className="text-blue-900" size={32} />
                            <h4 className="text-2xl font-black uppercase text-blue-950">Formulario de Actividades (7 Ítems)</h4>
                        </div>
                        <form onSubmit={handleSaveEvent} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4">REUNIONES / ACTIVIDADES (TÍTULO)</label>
                                    <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Ej: Entrega de Reportes I Trimestre" required className="w-full px-8 py-5 bg-slate-100 rounded-3xl font-black text-blue-900 outline-none uppercase" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4">TIPO DE ACTIVIDAD</label>
                                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as EventType})} className="w-full px-8 py-5 bg-slate-100 rounded-3xl font-black text-blue-900 outline-none">
                                      <option value="academico">ACADÉMICO</option>
                                      <option value="institucional">INSTITUCIONAL (SDI)</option>
                                      <option value="efemeride">EFEMÉRIDE</option>
                                      <option value="significativo">SIGNIFICATIVO</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4">FECHA</label>
                                    <input type="date" value={formData.start} onChange={e => handleDateChange(e.target.value)} required className="w-full px-8 py-5 bg-slate-100 rounded-3xl font-black text-blue-900 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4">DIA (CALCULADO)</label>
                                    <input value={formData.day} readOnly className="w-full px-8 py-5 bg-slate-200 rounded-3xl font-black text-blue-400 outline-none uppercase cursor-not-allowed" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4">HORA</label>
                                    <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} required className="w-full px-8 py-5 bg-slate-100 rounded-3xl font-black text-blue-900 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4">LUGAR</label>
                                    <input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Ej: Auditorio Sede Nelson Muñoz" required className="w-full px-8 py-5 bg-slate-100 rounded-3xl font-black text-blue-900 outline-none uppercase" />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4">PARTICIPANTES</label>
                                    <input value={formData.participants} onChange={e => setFormData({...formData, participants: e.target.value})} placeholder="Ej: Docentes, Directivos y Padres de Familia" required className="w-full px-8 py-5 bg-slate-100 rounded-3xl font-black text-blue-900 outline-none uppercase" />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4">OBSERVACIONES</label>
                                    <textarea value={formData.observations} onChange={e => setFormData({...formData, observations: e.target.value})} placeholder="Detalles, requisitos, material a traer..." className="w-full px-8 py-6 bg-slate-100 rounded-[2.5rem] font-medium text-slate-700 outline-none min-h-[150px]" />
                                </div>
                            </div>
                            <div className="flex gap-6 pt-10 border-t border-slate-100">
                                <button type="submit" className="flex-grow bg-blue-900 text-white py-6 rounded-3xl font-black uppercase text-sm shadow-2xl hover:bg-blue-800 transition-all flex items-center justify-center gap-3"><Save size={20}/> GUARDAR ACTIVIDAD</button>
                                <button type="button" onClick={() => setIsAddingNew(false)} className="px-12 bg-slate-200 text-slate-500 py-6 rounded-3xl font-black uppercase text-sm hover:bg-slate-300 transition-all">Cancelar</button>
                            </div>
                        </form>
                    </motion.div>
                  ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-4">
                            {events.sort((a,b) => a.start.getTime() - b.start.getTime()).map(ev => (
                                <div key={ev.id} className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 flex items-center justify-between hover:border-blue-400 transition-all group shadow-sm">
                                    <div className="flex items-center gap-8">
                                        <div className="min-w-[120px] text-center border-r-2 border-slate-50 pr-8">
                                            <p className="text-[10px] font-black text-slate-400 uppercase leading-none">{format(ev.start, 'MMM', { locale: es })}</p>
                                            <p className="text-3xl font-black text-blue-900 leading-none my-1">{format(ev.start, 'dd')}</p>
                                            <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">{ev.day}</p>
                                        </div>
                                        <div>
                                            <h6 className="text-xl font-black text-blue-950 uppercase leading-tight group-hover:text-blue-600 transition-colors">{ev.title}</h6>
                                            <div className="flex flex-wrap gap-4 mt-3 text-[9px] font-black uppercase text-slate-400 tracking-widest">
                                                <span className="flex items-center gap-1"><Clock size={12}/> {ev.time}</span>
                                                <span className="flex items-center gap-1"><MapPin size={12}/> {ev.location}</span>
                                                <span className={`flex items-center gap-1 ${ev.type === 'efemeride' ? 'text-violet-500' : isPatronDay(ev.start) ? 'text-yellow-600' : ''}`}><Users size={12}/> {ev.type === 'efemeride' ? 'Comunidad Global' : isPatronDay(ev.start) ? 'Todo Candelaria' : ev.participants?.split(',')[0]}...</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <button onClick={() => { setEditingEvent(ev); setFormData({...ev, start: format(ev.start, 'yyyy-MM-dd')}); setIsAddingNew(true); }} className="bg-blue-50 text-blue-600 p-4 rounded-2xl hover:bg-blue-100 transition-all"><Edit3 size={20}/></button>
                                        <button onClick={() => setEvents(prev => prev.filter(e => e.id !== ev.id))} className="bg-red-50 text-red-600 p-4 rounded-2xl hover:bg-red-100 transition-all"><Trash2 size={20}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

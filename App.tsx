
import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Sparkles,
  CalendarRange,
  CalendarClock,
  ExternalLink,
  Info as InfoIcon
} from 'lucide-react';
import { 
  format, 
  eachDayOfInterval, 
  isWithinInterval, 
  isToday,
  endOfISOWeek,
  addDays,
  addMonths,
  isSameMonth,
  endOfMonth,
  getDay,
  isSameDay,
  isAfter,
  isBefore,
  endOfYear,
  eachMonthOfInterval
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

const LOCAL_STORAGE_KEY = 'iensecan_calendar_events_2026';

const startOfISOWeek = (date: Date): Date => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = d.getDate() - (day === 0 ? 6 : day - 1);
  return new Date(d.setDate(diff));
};
const startOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1);

const subDays = (date: Date, amount: number): Date => addDays(date, -amount);
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

const getEventFullDate = (event: CalendarEvent): Date => {
  const fullDate = new Date(event.start);
  const timeStr = event.time || '00:00';
  const [hours, minutes] = timeStr.split(':').map(Number);
  fullDate.setHours(hours || 0, minutes || 0, 0, 0);
  return fullDate;
};

export default function App() {
  // Detección de modo incrustado
  const isEmbed = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('embed') === 'true';
  }, []);

  // Inicialización con persistencia de datos
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const savedEvents = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedEvents) {
      try {
        const parsed = JSON.parse(savedEvents);
        return parsed.map((e: any) => ({
          ...e,
          start: new Date(e.start),
          end: new Date(e.end)
        }));
      } catch (error) {
        console.error("Error cargando eventos guardados:", error);
      }
    }
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
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [displayMode, setDisplayMode] = useState<DisplayMode>('grid');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ date: Date; events: CalendarEvent[] } | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  
  const [hoveredDayData, setHoveredDayData] = useState<{ date: Date; events: CalendarEvent[]; x: number; y: number; align: 'left' | 'right' } | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    setFormData({
      title: '',
      start: format(new Date(), 'yyyy-MM-dd'),
      type: 'academico' as EventType,
      day: format(new Date(), 'EEEE', { locale: es }).toUpperCase(),
      time: '06:30',
      location: 'Todas las Sedes',
      participants: 'Comunidad Educativa',
      observations: ''
    });
  };

  const renderMonthView = () => {
    const start = startOfMonth(currentDate);
    const days = eachDayOfInterval({ start: startOfISOWeek(start), end: endOfISOWeek(endOfMonth(start)) });
    return (
      <div className="flex flex-col bg-[#1e3a8a] relative">
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

            const handleMouseEnter = (e: React.MouseEvent) => {
              if (dayEvents.length > 0) {
                if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                const screenWidth = window.innerWidth;
                
                const align = (rect.left + 350 > screenWidth) ? 'left' : 'right';
                const xPos = align === 'right' ? rect.left + window.scrollX + 20 : rect.right + window.scrollX - 340;

                setHoveredDayData({ 
                  date: day, 
                  events: dayEvents, 
                  x: xPos, 
                  y: rect.top + window.scrollY - 10,
                  align: align
                });
              }
            };

            const handleMouseLeave = () => {
              hoverTimeoutRef.current = setTimeout(() => {
                setHoveredDayData(null);
              }, 300);
            };

            return (
              <div 
                key={idx} 
                onClick={() => {
                  setHoveredDayData(null);
                  setSelectedDayEvents({ date: day, events: dayEvents });
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
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
                      {dayEvents.length > 1 && <div className="bg-blue-600 text-white text-[7px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm">{dayEvents.length}</div>}
                   </div>
                </div>

                <div className="mt-1 space-y-0.5 overflow-hidden">
                   {dayEvents.slice(0, 2).map(e => (
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
              </div>
            );
          })}
        </div>

        <AnimatePresence>
          {hoveredDayData && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 10, x: hoveredDayData.align === 'right' ? -10 : 10 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onMouseEnter={() => { if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current); }}
              onMouseLeave={() => setHoveredDayData(null)}
              style={{ 
                position: 'fixed',
                left: `${hoveredDayData.x}px`,
                top: `${hoveredDayData.y}px`,
                zIndex: 100
              }}
              className="bg-white rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(30,58,138,0.5)] border-4 border-blue-900 w-[320px] overflow-hidden metallic-3d-frame no-print"
            >
              <div className="bg-blue-900 p-5 text-white flex justify-between items-center relative">
                <div className="absolute top-0 right-0 p-4 opacity-10"><CalendarSearch size={60}/></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400 leading-none mb-1">{format(hoveredDayData.date, 'EEEE', { locale: es })}</p>
                  <p className="text-xl font-black uppercase leading-none tracking-tighter">{format(hoveredDayData.date, 'dd MMMM, yyyy', { locale: es })}</p>
                </div>
                <div className="bg-white/10 p-2 rounded-xl">
                  <CalendarDays size={24} className="text-yellow-400"/>
                </div>
              </div>
              
              <div className="p-5 space-y-3 max-h-[350px] overflow-y-auto custom-scroll bg-slate-50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-0.5 flex-grow bg-slate-200"></span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Seleccione una Actividad</span>
                  <span className="h-0.5 flex-grow bg-slate-200"></span>
                </div>
                
                {hoveredDayData.events.map(ev => (
                  <button 
                    key={ev.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setHoveredDayData(null);
                      setSelectedDayEvents({ date: hoveredDayData.date, events: [ev] });
                    }}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-4 group relative overflow-hidden
                      ${isPatronDay(ev.start) ? 'bg-yellow-50 border-yellow-200 hover:border-yellow-500' : 'bg-white border-slate-100 hover:border-blue-400 hover:shadow-md'}
                    `}
                  >
                    {isPatronDay(ev.start) && <div className="absolute top-0 right-0 p-2 text-yellow-200/50"><Sparkles size={16}/></div>}
                    <div className={`mt-1 w-3 h-3 rounded-full flex-shrink-0 shadow-sm transition-transform group-hover:scale-125
                      ${isPatronDay(ev.start) ? 'bg-yellow-500 animate-pulse' : 
                        ev.type === 'efemeride' ? 'bg-violet-500' : 
                        ev.type === 'festivo' ? 'bg-red-500' : 'bg-blue-500'}
                    `}></div>
                    <div className="flex-grow">
                      <p className={`text-[11px] font-black uppercase line-clamp-2 leading-tight transition-colors
                        ${isPatronDay(ev.start) ? 'text-yellow-800' : 'text-blue-950 group-hover:text-blue-600'}
                      `}>
                        {ev.title}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1.5">
                          <Clock size={10} className="text-slate-400" />
                          <span className="text-[9px] font-black text-slate-400 uppercase">{ev.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin size={10} className="text-slate-400" />
                          <span className="text-[9px] font-black text-slate-400 uppercase truncate max-w-[120px]">{ev.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity self-center">
                      <InfoIcon size={14} className="text-blue-600" />
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="bg-blue-50 p-3 text-center border-t border-slate-100">
                 <p className="text-[8px] font-black text-blue-900/40 uppercase flex items-center justify-center gap-2">
                   <Eye size={10}/> Haga clic para ver detalles y observaciones
                 </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderWeekView = () => {
    const startWeek = startOfISOWeek(currentDate);
    const endWeek = endOfISOWeek(currentDate);
    const days = eachDayOfInterval({ start: startWeek, end: endWeek });

    return (
      <div className="bg-white p-6 md:p-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-blue-50 pb-6">
          <div className="flex items-center gap-4 text-blue-900">
            <CalendarRange size={40} className="text-[#1e3a8a]" />
            <div>
              <h4 className="text-3xl font-black uppercase tracking-tighter leading-none">Agenda Semanal</h4>
              <p className="text-blue-500 font-bold uppercase text-[10px] tracking-widest mt-2 flex items-center gap-2">
                <Clock size={12} className="animate-spin-slow" /> Semana del {format(startWeek, "d 'de' MMM", {locale: es})} al {format(endWeek, "d 'de' MMM", {locale: es})}
              </p>
            </div>
          </div>
          <div className="bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100 text-right">
             <p className="text-slate-400 font-black uppercase text-[9px] tracking-widest leading-none mb-1">Rango Semanal</p>
             <p className="text-blue-900 font-black uppercase text-xs">Visión 7 Días</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {days.map((day, idx) => {
            const dayEvents = events.filter(e => isWithinInterval(startOfDay(day), { start: startOfDay(e.start), end: startOfDay(e.end) }));
            const isPatron = isPatronDay(day);
            const isRefToday = isToday(day);
            
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`relative rounded-[2.5rem] border-2 p-6 flex flex-col gap-4 min-h-[380px] transition-all cursor-pointer group hover:shadow-2xl hover:scale-[1.02]
                  ${isPatron ? 'bg-yellow-50 border-yellow-400 ring-4 ring-yellow-400/10' : isRefToday ? 'bg-blue-50 border-blue-400 ring-4 ring-blue-400/20' : 'bg-slate-50 border-white shadow-sm'}
                `}
                onClick={() => setSelectedDayEvents({ date: day, events: dayEvents })}
              >
                {isRefToday && (
                  <div className="absolute top-4 right-4 bg-blue-600 text-white text-[7px] font-black px-2 py-1 rounded-full shadow-lg border border-blue-400 animate-pulse z-20">
                    DÍA ACTUAL
                  </div>
                )}
                
                <div className="text-center border-b pb-4 border-slate-200 group-hover:border-blue-200">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{format(day, 'EEEE', { locale: es })}</p>
                  <p className={`text-4xl font-black leading-none ${isPatron ? 'text-yellow-700' : isRefToday ? 'text-blue-900' : 'text-slate-800'}`}>{format(day, 'd')}</p>
                </div>
                
                <div className="flex-grow space-y-3">
                  {dayEvents.length > 0 ? dayEvents.map(e => (
                    <div key={e.id} className={`p-4 rounded-2xl border text-left space-y-1 transition-all group-hover:bg-white group-hover:shadow-md
                      ${isPatronDay(e.start) ? 'bg-yellow-200 border-yellow-400 shadow-sm' : 'bg-white border-slate-100 shadow-sm'}
                    `}>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <p className="text-[8px] font-black text-blue-900 uppercase leading-none flex items-center gap-1"><Clock size={8}/> {e.time}</p>
                        {isPatronDay(e.start) && <Sparkles size={8} className="text-yellow-700" />}
                      </div>
                      <p className="text-[10px] font-black text-blue-950 uppercase line-clamp-2 leading-tight">{e.title}</p>
                    </div>
                  )) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-10 grayscale">
                      <CalendarSearch size={32} />
                      <p className="text-[8px] font-black uppercase mt-2">Sin actividad</p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderYearView = () => {
    const months = eachMonthOfInterval({
      start: startOfYear(new Date(2026, 0, 1)),
      end: endOfYear(new Date(2026, 0, 1))
    });

    return (
      <div className="bg-slate-100 p-8 md:p-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-blue-200">
          <div className="flex items-center gap-4 text-blue-900">
            <CalendarDays size={32} />
            <h4 className="text-2xl font-black uppercase tracking-tighter">Panorama Académico 2026</h4>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span className="text-[8px] font-black uppercase text-slate-500">Lectivo</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="text-[8px] font-black uppercase text-slate-500">SDI</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div><span className="text-[8px] font-black uppercase text-slate-500">Vacaciones</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-[8px] font-black uppercase text-slate-500">Festivo</span></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {months.map((month, idx) => {
            const startM = startOfMonth(month);
            const endM = endOfMonth(month);
            const days = eachDayOfInterval({ start: startOfISOWeek(startM), end: endOfISOWeek(endM) });

            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => { setCurrentDate(month); setDisplayMode('grid'); }}
                className="bg-white rounded-[2.5rem] p-6 shadow-lg border-2 border-transparent hover:border-blue-400 transition-all cursor-pointer group overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all"><CalendarIcon size={100}/></div>
                <h5 className="text-xl font-black text-blue-900 uppercase tracking-tighter mb-4 text-center border-b pb-2 border-slate-50 group-hover:text-blue-600 transition-colors">
                  {MONTH_NAMES[idx]}
                </h5>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(d => (
                    <div key={d} className="text-[8px] font-black text-slate-300 uppercase mb-2">{d}</div>
                  ))}
                  {days.map((day, dIdx) => {
                    const isCurrMonth = isSameMonth(day, month);
                    if (!isCurrMonth) return <div key={dIdx} className="aspect-square"></div>;

                    const dayEvents = events.filter(e => isWithinInterval(startOfDay(day), { start: startOfDay(e.start), end: startOfDay(e.end) }));
                    const isAcademicBoundaryDay = isAcademicBoundary(day);
                    const isSDIBoundaryDay = isSDIBoundary(day);
                    const isPatron = isPatronDay(day);
                    const isRefToday = isToday(day);
                    const holiday = dayEvents.find(e => e.type === 'festivo');
                    const vacation = dayEvents.find(e => e.type === 'vacaciones');
                    const sdi = dayEvents.find(e => e.type === 'institucional');
                    const isSun = getDay(day) === 0;

                    let bgClass = "transparent";
                    let textClass = "text-slate-600";
                    let ringClass = "";

                    if (isPatron) {
                      bgClass = "bg-yellow-400 shadow-md scale-110 z-10";
                      textClass = "text-white";
                    } else if (isRefToday) {
                      bgClass = "bg-blue-900 animate-pulse shadow-lg scale-110 z-10";
                      textClass = "text-white";
                      ringClass = "ring-2 ring-yellow-400";
                    } else if (holiday) {
                      bgClass = "bg-red-500";
                      textClass = "text-white";
                    } else if (isAcademicBoundaryDay) {
                      bgClass = "bg-emerald-600 ring-2 ring-emerald-200 shadow-sm";
                      textClass = "text-white";
                    } else if (isSDIBoundaryDay) {
                      bgClass = "bg-blue-600 ring-2 ring-blue-200 shadow-sm";
                      textClass = "text-white";
                    } else if (vacation) {
                      const isVacStartEnd = isSameDay(day, vacation.start) || isSameDay(day, vacation.end);
                      bgClass = isVacStartEnd ? "bg-orange-600 ring-2 ring-orange-200" : "bg-orange-100";
                      textClass = isVacStartEnd ? "text-white" : "text-orange-700";
                    } else if (sdi) {
                      bgClass = "bg-blue-50";
                      textClass = "text-blue-700";
                    } else if (isSun) {
                      textClass = "text-red-400";
                    }

                    return (
                      <div 
                        key={dIdx} 
                        className={`aspect-square text-[9px] font-black flex items-center justify-center rounded-full transition-all
                          ${bgClass} ${textClass} ${ringClass}
                        `}
                      >
                        {format(day, 'd')}
                      </div>
                    );
                  })}
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
          <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-900/5 -skew-x-12 transform translate-x-32"></div>
          <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-12 items-center gap-8 relative z-10">
            <div className="md:col-span-5 text-left space-y-2">
              <h1 className="text-xl md:text-2xl font-bold text-slate-400 tracking-tighter uppercase leading-none">I.E. NUESTRA SEÑORA DE LA CANDELARIA</h1>
              <div className="relative inline-block">
                <h2 className="text-4xl md:text-6xl font-black text-[#1e3a8a] tracking-tighter uppercase drop-shadow-md">
                  CALENDARIO <br /> ACADÉMICO 2026
                </h2>
                <div className="h-2 w-full bg-gradient-to-r from-[#1e3a8a] via-[#facc15] to-[#1e3a8a] mt-2 rounded-full shadow-lg"></div>
              </div>
              <p className="text-[#1e3a8a] font-black uppercase text-xs tracking-[0.3em] opacity-80 pt-2">Excelencia, Virtud y Liderazgo</p>
            </div>
            <div className="md:col-span-4 flex flex-col gap-4 items-center md:items-start justify-center">
              <a href={RESOLUTION_PDF_URL} target="_blank" rel="noopener noreferrer" 
                 className="w-full max-w-[320px] bg-red-600 text-white px-8 py-5 rounded-[2rem] font-black text-xs flex items-center justify-center gap-3 transition-all hover:bg-red-700 hover:scale-105 uppercase shadow-[0_15px_30px_rgba(220,38,38,0.3)] border-b-4 border-red-800">
                <Download size={22} /> RESOLUCIÓN RECTORAL
              </a>
              <div className="flex gap-4 w-full max-w-[320px]">
                <button onClick={() => setIsAdminModalOpen(true)} className="flex-grow bg-blue-900 text-white py-5 rounded-[2rem] font-black text-xs flex items-center justify-center gap-2 transition-all hover:bg-blue-800 uppercase shadow-lg border-b-4 border-blue-950">
                  <Settings size={20} /> GESTIÓN
                </button>
                <button onClick={() => window.print()} className="flex-grow bg-slate-100 text-slate-600 py-5 rounded-[2rem] font-black text-xs flex items-center justify-center gap-2 transition-all hover:bg-white uppercase shadow-md border-b-4 border-slate-300">
                  <Printer size={20} /> IMPRIMIR
                </button>
              </div>
            </div>
            <div className="md:col-span-3 flex justify-center md:justify-end">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 2 }}
                className="relative w-56 h-56 md:w-64 md:h-64 bg-white p-4 rounded-[3.5rem] shadow-[0_35px_60px_-15px_rgba(30,58,138,0.4)] border-4 border-blue-50 flex items-center justify-center overflow-hidden transition-all group"
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-900 via-yellow-400 to-blue-900"></div>
                <img 
                  src="https://iensecan.edu.co/wp-content/uploads/2024/08/ESCUDO-IENSECAN-2020-2.png" 
                  alt="Escudo IENSECAN" 
                  className="max-w-full max-h-full object-contain p-2 drop-shadow-2xl transition-transform duration-500 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 via-transparent to-white/30 pointer-events-none"></div>
              </motion.div>
            </div>
          </div>
        </header>
      )}

      <main className={`flex-grow w-full ${isEmbed ? 'p-2' : 'max-w-7xl mx-auto p-4 md:p-8 space-y-12'}`}>
        <section className={`bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white shadow-xl border-t-4 border-yellow-400 no-print flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative ${isEmbed ? 'rounded-[1.5rem] p-4 mb-6' : 'rounded-[2.5rem] p-6'}`}>
          <div className="absolute top-0 right-0 p-8 opacity-5"><CalendarClock size={120}/></div>
          <div className="flex items-center gap-6 relative z-10">
            <div className={`bg-yellow-400 text-blue-900 shadow-lg border-2 border-white/20 ${isEmbed ? 'p-2 rounded-2xl' : 'p-4 rounded-3xl'}`}>
              <CalendarDays size={isEmbed ? 24 : 32}/>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400 leading-none mb-1">Hoy es</p>
              <h3 className={`${isEmbed ? 'text-lg' : 'text-xl md:text-3xl'} font-black uppercase tracking-tighter leading-tight`}>
                {format(now, "EEEE d 'de' MMMM", { locale: es })}
              </h3>
            </div>
          </div>
          <div className={`flex items-center gap-8 relative z-10 bg-white/5 px-8 py-3 rounded-3xl border border-white/10 backdrop-blur-md ${isEmbed ? 'hidden md:flex' : ''}`}>
            <div className="text-center">
              <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Año</p>
              <p className="text-xl font-black text-yellow-400 leading-none">{format(now, "yyyy")}</p>
            </div>
            <div className="w-[1px] h-10 bg-white/20"></div>
            <div className="text-center">
              <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Hora Actual</p>
              <p className="text-xl font-black leading-none tabular-nums flex items-center gap-2">
                <Clock size={16} className="text-yellow-400 animate-pulse" /> {format(now, "HH:mm:ss")}
              </p>
            </div>
          </div>
        </section>

        {!isEmbed && featuredEvent && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 no-print">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 mb-6">
                <BellRing className="text-blue-900 animate-pulse" size={24} />
                <h3 className="text-xl font-black text-blue-900 uppercase tracking-tighter">Próxima Actividad Inmediata</h3>
              </div>
              <motion.div 
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
                </div>
              </motion.div>
            </div>
            <div className="lg:col-span-5 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-blue-900 uppercase tracking-tighter">Próximos 7 Eventos</h3>
                <div className="h-0.5 flex-grow mx-4 bg-slate-200"></div>
              </div>
              <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2 custom-scroll">
                 {nextSevenEvents.map((e, idx) => (
                   <motion.div 
                     key={e.id} 
                     onClick={() => setSelectedDayEvents({ date: e.start, events: [e] })}
                     className={`p-5 rounded-3xl border-2 transition-all cursor-pointer group flex items-center gap-5 shadow-sm bg-white border-blue-50 hover:border-[#facc15]`}
                   >
                      <div className={`min-w-[65px] h-16 rounded-2xl flex flex-col items-center justify-center border bg-blue-50 border-blue-100 text-[#1e3a8a]`}>
                          <span className="text-[9px] font-black uppercase leading-none">{format(e.start, 'MMM', { locale: es })}</span>
                          <span className="text-2xl font-black leading-none">{format(e.start, 'dd')}</span>
                      </div>
                      <div className="flex-grow">
                          <h5 className="text-[11px] font-black uppercase line-clamp-1 transition-colors text-blue-950 group-hover:text-blue-600">{e.title}</h5>
                      </div>
                      <ChevronRight size={18} className="text-slate-200 group-hover:text-[#facc15] transition-all" />
                   </motion.div>
                 ))}
              </div>
            </div>
          </section>
        )}

        <section className={`bg-white shadow-2xl border-4 border-blue-900 overflow-hidden metallic-3d-frame no-print ${isEmbed ? 'rounded-[1.5rem]' : 'rounded-[3.5rem]'}`}>
          <div className={`bg-blue-900 flex flex-wrap justify-between items-center gap-6 ${isEmbed ? 'p-4' : 'p-8'}`}>
            <div className="flex items-center gap-4 text-white">
              <div className="flex items-center gap-2">
                <button onClick={() => {
                  if(displayMode === 'year') setCurrentDate(subDays(currentDate, 365));
                  else if(displayMode === 'week') setCurrentDate(subDays(currentDate, 7));
                  else setCurrentDate(addMonths(currentDate, -1));
                }} className="p-2 hover:bg-white/20 rounded-full transition-all active:scale-90"><ArrowLeftCircle size={isEmbed ? 28 : 36} /></button>
                <h3 className={`${isEmbed ? 'text-lg' : 'text-2xl'} font-black uppercase tracking-tighter min-w-[150px] text-center`}>
                  {displayMode === 'year' ? currentDate.getFullYear() : 
                   displayMode === 'week' ? `Semana ${format(currentDate, 'w')}` : 
                   `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
                </h3>
                <button onClick={() => {
                  if(displayMode === 'year') setCurrentDate(addDays(currentDate, 365));
                  else if(displayMode === 'week') setCurrentDate(addDays(currentDate, 7));
                  else setCurrentDate(addMonths(currentDate, 1));
                }} className="p-2 hover:bg-white/20 rounded-full transition-all active:scale-90"><ArrowRightCircle size={isEmbed ? 28 : 36} /></button>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex bg-white/10 p-1 rounded-2xl border border-white/10">
                <button onClick={() => setDisplayMode('grid')} className={`p-2 md:p-3 rounded-xl transition-all flex items-center gap-2 font-black text-[10px] uppercase ${displayMode === 'grid' ? 'bg-white text-blue-900 shadow-xl' : 'text-white/50 hover:text-white'}`}>
                  <LayoutGrid size={18}/> <span className="hidden md:inline">Mes</span>
                </button>
                <button onClick={() => setDisplayMode('week')} className={`p-2 md:p-3 rounded-xl transition-all flex items-center gap-2 font-black text-[10px] uppercase ${displayMode === 'week' ? 'bg-white text-blue-900 shadow-xl' : 'text-white/50 hover:text-white'}`}>
                  <CalendarRange size={18}/> <span className="hidden md:inline">Semana</span>
                </button>
                <button onClick={() => setDisplayMode('year')} className={`p-2 md:p-3 rounded-xl transition-all flex items-center gap-2 font-black text-[10px] uppercase ${displayMode === 'year' ? 'bg-white text-blue-900 shadow-xl' : 'text-white/50 hover:text-white'}`}>
                  <CalendarIcon size={18}/> <span className="hidden md:inline">Año</span>
                </button>
              </div>
            </div>
          </div>
          <div className={`${isEmbed ? 'min-h-[500px]' : 'min-h-[600px]'} bg-slate-100 relative`}>
            <AnimatePresence mode="wait">
              {displayMode === 'grid' && <motion.div key="grid">{renderMonthView()}</motion.div>}
              {displayMode === 'week' && <motion.div key="week">{renderWeekView()}</motion.div>}
              {displayMode === 'year' && <motion.div key="year">{renderYearView()}</motion.div>}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {!isEmbed && (
        <footer className="bg-blue-900 text-white py-16 text-center text-xs border-t-4 border-[#facc15] no-print">
          <div className="max-w-4xl mx-auto px-6 space-y-4">
            <p className="font-black uppercase tracking-widest text-2xl mb-4 leading-tight">Institución Educativa Nuestra Señora de la Candelaria</p>
            <div className="flex flex-wrap justify-center gap-6 text-slate-300 font-bold uppercase tracking-widest">
               <span className="flex items-center gap-2"><MapPin size={14}/> Candelaria, Valle del Cauca</span>
            </div>
            <p className="text-[#facc15] font-black text-base mt-8 shadow-sm">SISTEMA DE CALENDARIO ESCOLAR 2026</p>
            <p className="opacity-40 italic mt-12">Programado y diseñado por el Webmaster: Nelson Muñoz.</p>
          </div>
        </footer>
      )}

      {/* MODAL DETALLES DEL DÍA */}
      <AnimatePresence>
        {selectedDayEvents && (
          <div className="fixed inset-0 bg-blue-950/70 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`bg-white rounded-[4rem] w-full max-w-2xl shadow-2xl overflow-hidden border-4 ${isPatronDay(selectedDayEvents.date) ? 'border-yellow-500' : 'border-blue-900'}`}>
                <div className={`p-10 text-white flex justify-between items-center ${isPatronDay(selectedDayEvents.date) ? 'bg-yellow-600' : 'bg-blue-900'}`}>
                  <div>
                    <h4 className="text-3xl font-black uppercase tracking-tighter leading-none">{format(selectedDayEvents.date, 'dd MMMM', { locale: es })}</h4>
                    <p className="text-[11px] font-black uppercase opacity-60 mt-2">{format(selectedDayEvents.date, 'EEEE', { locale: es })}</p>
                  </div>
                  <button onClick={() => setSelectedDayEvents(null)} className="bg-white/20 p-4 rounded-full hover:bg-white/30 transition-all"><X size={32}/></button>
                </div>
                <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scroll bg-slate-50">
                  {selectedDayEvents.events.length > 0 ? selectedDayEvents.events.map(e => (
                    <div key={e.id} className="p-8 rounded-[3rem] shadow-xl border-2 bg-white space-y-6 relative overflow-hidden">
                      <div className="flex items-start gap-4">
                        <div className="p-4 rounded-2xl bg-blue-100 text-blue-700"><CalendarDays size={24}/></div>
                        <div className="flex-grow">
                            <h5 className="text-2xl font-black uppercase leading-tight text-blue-950">{e.title}</h5>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-slate-100">
                        <div className="space-y-1">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">HORA</span>
                            <p className="text-[10px] font-black text-blue-900">{e.time}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">LUGAR</span>
                            <p className="text-[10px] font-black text-blue-900 uppercase">{e.location}</p>
                        </div>
                      </div>
                      <div className="space-y-2 pt-4">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Info size={12}/> OBSERVACIONES</span>
                        <p className="text-[11px] font-medium italic leading-relaxed p-4 rounded-2xl border bg-blue-50/30 border-blue-50 text-slate-600">"{e.observations || 'Sin observaciones'}"</p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-20 opacity-20 flex flex-col items-center gap-4">
                      <CalendarSearch size={64} />
                      <p className="font-black uppercase tracking-widest">No hay actividades</p>
                    </div>
                  )}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADMIN Panel */}
      <AnimatePresence>
        {isAdminModalOpen && (
          <div className="fixed inset-0 bg-blue-950/80 backdrop-blur-2xl z-[300] flex items-center justify-center p-4">
            {!isAuthenticated ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[3rem] w-full max-w-md p-12 shadow-2xl border-4 border-blue-900 text-center">
                <Lock size={64} className="text-blue-900 mb-8 mx-auto" />
                <h3 className="text-3xl font-black text-blue-950 uppercase mb-8 tracking-tighter">Acceso Directivo</h3>
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="text-left space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Contraseña</label>
                    <input type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required className="w-full px-8 py-5 bg-slate-100 rounded-2xl font-bold focus:ring-4 ring-blue-500/20 outline-none transition-all border border-slate-200" />
                  </div>
                  <button type="submit" className="w-full bg-blue-900 text-white py-6 rounded-2xl font-black uppercase text-sm shadow-2xl hover:bg-blue-800 transition-all">Desbloquear</button>
                  <button type="button" onClick={() => { setIsAdminModalOpen(false); setLoginPassword(''); }} className="w-full text-slate-400 font-black uppercase text-[10px] py-2">Volver</button>
                </form>
              </motion.div>
            ) : (
              <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-[4rem] w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border-4 border-blue-900">
                <div className="bg-blue-900 p-10 text-white flex justify-between items-center no-print">
                  <h3 className="text-3xl font-black uppercase tracking-widest">Gestión 2026</h3>
                  <div className="flex gap-4">
                    {!isAddingNew && <button onClick={() => setIsAddingNew(true)} className="bg-[#facc15] text-blue-900 px-8 py-4 rounded-2xl font-black text-xs uppercase flex items-center gap-3"><PlusCircle size={20}/> NUEVA</button>}
                    <button onClick={() => { setIsAdminModalOpen(false); setIsAuthenticated(false); }} className="bg-white/10 p-4 rounded-full"><X size={32}/></button>
                  </div>
                </div>
                <div className="flex-grow overflow-y-auto p-12 bg-slate-50 custom-scroll">
                  {isAddingNew ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[3.5rem] p-12 shadow-2xl border-4 border-blue-50 max-w-4xl mx-auto">
                        <form onSubmit={handleSaveEvent} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400">ACTIVIDAD</label>
                                    <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="w-full px-8 py-5 bg-slate-100 rounded-3xl font-black text-blue-900 outline-none uppercase" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400">FECHA</label>
                                    <input type="date" value={formData.start} onChange={e => handleDateChange(e.target.value)} required className="w-full px-8 py-5 bg-slate-100 rounded-3xl font-black text-blue-900 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400">HORA</label>
                                    <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} required className="w-full px-8 py-5 bg-slate-100 rounded-3xl font-black text-blue-900 outline-none" />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400">LUGAR</label>
                                    <input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required className="w-full px-8 py-5 bg-slate-100 rounded-3xl font-black text-blue-900 outline-none uppercase" />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400">OBSERVACIONES</label>
                                    <textarea value={formData.observations} onChange={e => setFormData({...formData, observations: e.target.value})} className="w-full px-8 py-6 bg-slate-100 rounded-[2.5rem] min-h-[150px]" />
                                </div>
                            </div>
                            <div className="flex gap-6 pt-10">
                                <button type="submit" className="flex-grow bg-blue-900 text-white py-6 rounded-3xl font-black uppercase text-sm shadow-2xl flex items-center justify-center gap-3"><Save size={20}/> GUARDAR</button>
                                <button type="button" onClick={() => setIsAddingNew(false)} className="px-12 bg-slate-200 text-slate-500 py-6 rounded-3xl font-black uppercase">Cancelar</button>
                            </div>
                        </form>
                    </motion.div>
                  ) : (
                    <div className="space-y-6">
                        {events.sort((a,b) => a.start.getTime() - b.start.getTime()).map(ev => (
                            <div key={ev.id} className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-8">
                                    <div className="min-w-[120px] text-center">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">{format(ev.start, 'MMM', { locale: es })}</p>
                                        <p className="text-3xl font-black text-blue-900">{format(ev.start, 'dd')}</p>
                                    </div>
                                    <h6 className="text-xl font-black text-blue-950 uppercase">{ev.title}</h6>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => { setEditingEvent(ev); setFormData({...ev, start: format(ev.start, 'yyyy-MM-dd')}); setIsAddingNew(true); }} className="bg-blue-50 text-blue-600 p-4 rounded-2xl"><Edit3 size={20}/></button>
                                    <button onClick={() => setEvents(prev => prev.filter(e => e.id !== ev.id))} className="bg-red-50 text-red-600 p-4 rounded-2xl"><Trash2 size={20}/></button>
                                </div>
                            </div>
                        ))}
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

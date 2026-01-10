
import { CalendarEvent } from './types';

export const COLORS = {
  primary: '#1e3a8a', // Azul Institucional
  secondary: '#facc15', // Amarillo Institucional
  accent: '#10b981', // Verde éxito
  nonWorking: '#FF4500', // Rojo Anaranjado para números
  efemeride: '#8b5cf6', // Violeta para efemérides
};

export const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export const DAY_NAMES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export const INITIAL_EVENTS: CalendarEvent[] = [
  // --- FESTIVOS OFICIALES COLOMBIA 2026 ---
  { id: 'f1', title: 'Año Nuevo', start: new Date(2026, 0, 1), end: new Date(2026, 0, 1), type: 'festivo', location: 'Nacional', observations: 'Festivo nacional de inicio de año civil.' },
  { id: 'f2', title: 'Día de los Reyes Magos', start: new Date(2026, 0, 12), end: new Date(2026, 0, 12), type: 'festivo', location: 'Nacional', observations: 'Traslado del festivo de Reyes según Ley Emiliani.' },
  { id: 'f3', title: 'Día de San José', start: new Date(2026, 2, 23), end: new Date(2026, 2, 23), type: 'festivo', location: 'Nacional', observations: 'Homenaje a San José.' },
  { id: 'f4', title: 'Jueves Santo', start: new Date(2026, 3, 2), end: new Date(2026, 3, 2), type: 'festivo', location: 'Nacional', observations: 'Día de reflexión.' },
  { id: 'f5', title: 'Viernes Santo', start: new Date(2026, 3, 3), end: new Date(2026, 3, 3), type: 'festivo', location: 'Nacional', observations: 'Día de recogimiento.' },
  { id: 'f6', title: 'Día del Trabajo', start: new Date(2026, 4, 1), end: new Date(2026, 4, 1), type: 'festivo', location: 'Nacional', observations: 'Conmemoración del trabajo.' },
  { id: 'f7', title: 'Ascensión del Señor', start: new Date(2026, 4, 18), end: new Date(2026, 4, 18), type: 'festivo', location: 'Nacional', observations: 'Festivo religioso trasladado.' },
  { id: 'f8', title: 'Corpus Christi', start: new Date(2026, 5, 8), end: new Date(2026, 5, 8), type: 'festivo', location: 'Nacional', observations: 'Celebración religiosa.' },
  { id: 'f9', title: 'Sagrado Corazón de Jesús', start: new Date(2026, 5, 15), end: new Date(2026, 5, 15), type: 'festivo', location: 'Nacional', observations: 'Festivo religioso trasladado.' },
  { id: 'f10', title: 'San Pedro y San Pablo', start: new Date(2026, 5, 29), end: new Date(2026, 5, 29), type: 'festivo', location: 'Nacional', observations: 'Homenaje a los apóstoles.' },
  { id: 'f11', title: 'Grito de Independencia', start: new Date(2026, 6, 20), end: new Date(2026, 6, 20), type: 'festivo', location: 'Nacional', observations: 'Soberanía nacional de Colombia.' },
  { id: 'f12', title: 'Batalla de Boyacá', start: new Date(2026, 7, 7), end: new Date(2026, 7, 7), type: 'festivo', location: 'Nacional', observations: 'Triunfo de la independencia.' },
  { id: 'f13', title: 'Asunción de la Virgen', start: new Date(2026, 7, 17), end: new Date(2026, 7, 17), type: 'festivo', location: 'Nacional', observations: 'Festivo religioso.' },
  { id: 'f14', title: 'Día de la Raza', start: new Date(2026, 9, 12), end: new Date(2026, 9, 12), type: 'festivo', location: 'Nacional', observations: 'Respeto a la Diversidad Cultural.' },
  { id: 'f15', title: 'Todos los Santos', start: new Date(2026, 10, 2), end: new Date(2026, 10, 2), type: 'festivo', location: 'Nacional', observations: 'Homenaje a los santos.' },
  { id: 'f16', title: 'Independencia de Cartagena', start: new Date(2026, 10, 16), end: new Date(2026, 10, 16), type: 'festivo', location: 'Nacional', observations: 'Gesta heróica.' },
  { id: 'f17', title: 'Inmaculada Concepción', start: new Date(2026, 11, 8), end: new Date(2026, 11, 8), type: 'festivo', location: 'Nacional', observations: 'Día de las velitas.' },
  { id: 'f18', title: 'Navidad', start: new Date(2026, 11, 25), end: new Date(2026, 11, 25), type: 'festivo', location: 'Nacional', observations: 'Nacimiento de Jesús.' },

  // --- EFEMÉRIDES UNESCO / ONU / COLOMBIA ---
  { id: 'e1', title: 'Día Internacional de la Mujer y la Niña en la Ciencia', start: new Date(2026, 1, 11), end: new Date(2026, 1, 11), type: 'efemeride', observations: 'UNESCO: Promover el acceso y la participación plena en la ciencia.' },
  { id: 'e2', title: 'Día Internacional de la Lengua Materna', start: new Date(2026, 1, 21), end: new Date(2026, 1, 21), type: 'efemeride', observations: 'Preservar la diversidad lingüística mundial.' },
  { id: 'e3', title: 'Día Internacional de la Mujer', start: new Date(2026, 2, 8), end: new Date(2026, 2, 8), type: 'efemeride', observations: 'Lucha por la igualdad, el reconocimiento y ejercicio de derechos.' },
  { id: 'e4', title: 'Día Mundial del Agua', start: new Date(2026, 2, 22), end: new Date(2026, 2, 22), type: 'efemeride', observations: 'ONU: Concienciar sobre la importancia del agua dulce.' },
  { id: 'e5', title: 'Día Mundial de la Salud', start: new Date(2026, 3, 7), end: new Date(2026, 3, 7), type: 'efemeride', observations: 'Aniversario de la creación de la OMS.' },
  { id: 'e6', title: 'Día Internacional de la Madre Tierra', start: new Date(2026, 3, 22), end: new Date(2026, 3, 22), type: 'efemeride', observations: 'Fomentar la armonía con la naturaleza.' },
  { id: 'e7', title: 'Día del Idioma Español / Día Mundial del Libro', start: new Date(2026, 3, 23), end: new Date(2026, 3, 23), type: 'efemeride', observations: 'Homenaje a Miguel de Cervantes y la literatura universal.' },
  { id: 'e8', title: 'Día del Maestro (Colombia)', start: new Date(2026, 4, 15), end: new Date(2026, 4, 15), type: 'efemeride', observations: 'Homenaje a San Juan Bautista de La Salle, patrono de los educadores.' },
  { id: 'e9', title: 'Día de la Afrocolombianidad', start: new Date(2026, 4, 21), end: new Date(2026, 4, 21), type: 'efemeride', observations: 'Conmemoración de la abolición de la esclavitud en Colombia.' },
  { id: 'e10', title: 'Día Mundial del Medio Ambiente', start: new Date(2026, 5, 5), end: new Date(2026, 5, 5), type: 'efemeride', observations: 'Acción global por la protección del planeta.' },
  { id: 'e11', title: 'Día Mundial de los Océanos', start: new Date(2026, 5, 8), end: new Date(2026, 5, 8), type: 'efemeride', observations: 'Recordar el papel de los océanos en la vida cotidiana.' },
  { id: 'e12', title: 'Día Internacional de la Juventud', start: new Date(2026, 7, 12), end: new Date(2026, 7, 12), type: 'efemeride', observations: 'Empoderar a los jóvenes en la sociedad.' },
  { id: 'e13', title: 'Día Internacional de la Alfabetización', start: new Date(2026, 8, 8), end: new Date(2026, 8, 8), type: 'efemeride', observations: 'UNESCO: La alfabetización como derecho humano.' },
  { id: 'e14', title: 'Día Internacional de la Paz', start: new Date(2026, 8, 21), end: new Date(2026, 8, 21), type: 'efemeride', observations: 'Fortalecer los ideales de paz en el mundo.' },
  { id: 'e15', title: 'Día Mundial de los Docentes', start: new Date(2026, 9, 5), end: new Date(2026, 9, 5), type: 'efemeride', observations: 'Homenaje a la labor docente global.' },
  { id: 'e16', title: 'Día Mundial del Niño', start: new Date(2026, 10, 20), end: new Date(2026, 10, 20), type: 'efemeride', observations: 'Aniversario de la Declaración de los Derechos del Niño.' },
  { id: 'e17', title: 'Día de los Derechos Humanos', start: new Date(2026, 11, 10), end: new Date(2026, 11, 10), type: 'efemeride', observations: 'Aniversario de la Declaración Universal de DDHH.' },

  // --- CELEBRACIONES INSTITUCIONALES ---
  { id: 's0', title: 'VIRGEN DE LA CANDELARIA (PATRONA)', start: new Date(2026, 1, 2), end: new Date(2026, 1, 2), type: 'significativo', location: 'Candelaria', description: 'Festividad patronal central de la IENSECAN.' },

  // --- SEMANAS DE DESARROLLO INSTITUCIONAL (SDI) ---
  { id: 'sdi_init_start', title: 'INICIO SDI (PLANEACIÓN)', start: new Date(2026, 0, 12), end: new Date(2026, 0, 12), type: 'institucional', location: 'IENSECAN', description: 'Apertura de planeación 2026.' },
  { id: 'sdi_init_end', title: 'FINAL SDI (PLANEACIÓN)', start: new Date(2026, 0, 23), end: new Date(2026, 0, 23), type: 'institucional', location: 'IENSECAN', description: 'Cierre de bloque de planeación inicial.' },
  { id: 'sdi_ss_start', title: 'INICIO SDI (SEMANA SANTA)', start: new Date(2026, 2, 30), end: new Date(2026, 2, 30), type: 'institucional', location: 'IENSECAN', description: 'Inicio jornada técnica de abril.' },
  { id: 'sdi_ss_end', title: 'FINAL SDI (SEMANA SANTA)', start: new Date(2026, 3, 3), end: new Date(2026, 3, 3), type: 'institucional', location: 'IENSECAN', description: 'Fin jornada técnica de abril.' },
  { id: 'sdi_oct_start', title: 'INICIO SDI (RECESO OCTUBRE)', start: new Date(2026, 9, 5), end: new Date(2026, 9, 5), type: 'institucional', location: 'IENSECAN', description: 'Inicio semana de receso octubre SDI.' },
  { id: 'sdi_oct_end', title: 'FINAL SDI (RECESO OCTUBRE)', start: new Date(2026, 9, 9), end: new Date(2026, 9, 9), type: 'institucional', location: 'IENSECAN', description: 'Fin semana de receso octubre SDI.' },
  { id: 'sdi_fin_start', title: 'INICIO SDI (CIERRE ANUAL)', start: new Date(2026, 11, 7), end: new Date(2026, 11, 7), type: 'institucional', location: 'IENSECAN', description: 'Evaluación final de gestión.' },
  { id: 'sdi_fin_end', title: 'FINAL SDI (CIERRE ANUAL)', start: new Date(2026, 11, 11), end: new Date(2026, 11, 11), type: 'institucional', location: 'IENSECAN', description: 'Clausura de actividades docentes 2026.' },

  // --- PERIODOS LECTIVOS (TRIMESTRES) ---
  { 
    id: 'clases_start_h1', 
    title: 'ACTO DE BIENVENIDA E IZADA DE BANDERA', 
    start: new Date(2026, 0, 26), 
    end: new Date(2026, 0, 26), 
    type: 'academico', 
    time: '06:45',
    location: 'Patio Central Sede Nelson Muñoz y Sedes Rurales', 
    participants: 'Estudiantes, Padres de Familia, Docentes y Directivos',
    observations: 'Protocolo institucional de apertura del año lectivo 2026. Saludo oficial de Rectoría.',
    description: 'Apertura oficial del año académico con protocolo de bandera.'
  },
  { 
    id: 'clases_start_h2', 
    title: 'INDUCCIÓN POR DIRECTORES DE GRUPO', 
    start: new Date(2026, 0, 26), 
    end: new Date(2026, 0, 26), 
    type: 'academico', 
    time: '08:30',
    location: 'Aulas de Clase (Sedes IENSECAN)', 
    participants: 'Directores de Grupo y Estudiantes',
    observations: 'Entrega de horarios, asignación de pupitres y presentación de planes de área.',
    description: 'Sesión de organización grupal inicial.'
  },
  { 
    id: 'clases_start_h3', 
    title: 'SOCIALIZACIÓN MANUAL DE CONVIVENCIA Y PACTOS DE AULA', 
    start: new Date(2026, 0, 26), 
    end: new Date(2026, 0, 26), 
    type: 'academico', 
    time: '10:30',
    location: 'Aulas de Clase', 
    participants: 'Docentes y Estudiantes',
    observations: 'Firma de pactos de convivencia escolar y compromisos académicos 2026.',
    description: 'Encuadre de convivencia para el nuevo año.'
  },

  { id: 'p1_end', title: 'FINAL 1er PERIODO', start: new Date(2026, 3, 10), end: new Date(2026, 3, 10), type: 'academico', location: 'IENSECAN', description: 'Cierre del primer trimestre académico.' },
  { id: 'p2_start', title: 'INICIO 2do PERIODO', start: new Date(2026, 3, 13), end: new Date(2026, 3, 13), type: 'academico', location: 'IENSECAN', description: 'Apertura del segundo trimestre académico.' },
  { id: 'p2_end', title: 'FINAL 2do PERIODO', start: new Date(2026, 7, 21), end: new Date(2026, 7, 21), type: 'academico', location: 'IENSECAN', description: 'Cierre del segundo trimestre académico.' },
  { id: 'p3_start', title: 'INICIO 3er PERIODO', start: new Date(2026, 7, 24), end: new Date(2026, 7, 24), type: 'academico', location: 'IENSECAN', description: 'Apertura del tercer y último trimestre.' },
  { id: 'p3_end', title: 'FINAL DE CLASES (FIN 3er PERIODO)', start: new Date(2026, 11, 4), end: new Date(2026, 11, 4), type: 'academico', location: 'Todas las Sedes', description: 'Clausura de clases con estudiantes 2026.' },

  // --- VACACIONES / RECESOS ---
  { id: 'v1', title: 'Vacaciones Estudiantiles Junio', start: new Date(2026, 5, 29), end: new Date(2026, 6, 17), type: 'vacaciones', location: 'General' },
  { id: 'v2', title: 'Receso Octubre', start: new Date(2026, 9, 5), end: new Date(2026, 9, 9), type: 'vacaciones', location: 'General' },
];

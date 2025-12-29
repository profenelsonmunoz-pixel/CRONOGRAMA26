
import { CalendarEvent } from './types';

export const COLORS = {
  primary: '#1e3a8a', // Azul Institucional
  secondary: '#facc15', // Amarillo Institucional
  accent: '#10b981', // Verde éxito
  nonWorking: '#FF4500', // Rojo Anaranjado para números
};

export const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export const DAY_NAMES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export const INITIAL_EVENTS: CalendarEvent[] = [
  // --- FESTIVOS OFICIALES COLOMBIA 2026 ---
  { id: 'f1', title: 'Año Nuevo', start: new Date(2026, 0, 1), end: new Date(2026, 0, 1), type: 'festivo', location: 'Nacional' },
  { id: 'f2', title: 'Día de los Reyes Magos', start: new Date(2026, 0, 12), end: new Date(2026, 0, 12), type: 'festivo', location: 'Nacional' },
  { id: 'f3', title: 'Día de San José', start: new Date(2026, 2, 23), end: new Date(2026, 2, 23), type: 'festivo', location: 'Nacional' },
  { id: 'f4', title: 'Jueves Santo', start: new Date(2026, 3, 2), end: new Date(2026, 3, 2), type: 'festivo', location: 'Nacional' },
  { id: 'f5', title: 'Viernes Santo', start: new Date(2026, 3, 3), end: new Date(2026, 3, 3), type: 'festivo', location: 'Nacional' },
  { id: 'f6', title: 'Día del Trabajo', start: new Date(2026, 4, 1), end: new Date(2026, 4, 1), type: 'festivo', location: 'Nacional' },
  { id: 'f7', title: 'Ascensión del Señor', start: new Date(2026, 4, 18), end: new Date(2026, 4, 18), type: 'festivo', location: 'Nacional' },
  { id: 'f8', title: 'Corpus Christi', start: new Date(2026, 5, 8), end: new Date(2026, 5, 8), type: 'festivo', location: 'Nacional' },
  { id: 'f9', title: 'Sagrado Corazón de Jesús', start: new Date(2026, 5, 15), end: new Date(2026, 5, 15), type: 'festivo', location: 'Nacional' },
  { id: 'f10', title: 'San Pedro y San Pablo', start: new Date(2026, 5, 29), end: new Date(2026, 5, 29), type: 'festivo', location: 'Nacional' },
  { id: 'f11', title: 'Grito de Independencia', start: new Date(2026, 6, 20), end: new Date(2026, 6, 20), type: 'festivo', location: 'Nacional' },
  { id: 'f12', title: 'Batalla de Boyacá', start: new Date(2026, 7, 7), end: new Date(2026, 7, 7), type: 'festivo', location: 'Nacional' },
  { id: 'f13', title: 'Asunción de la Virgen', start: new Date(2026, 7, 17), end: new Date(2026, 7, 17), type: 'festivo', location: 'Nacional' },
  { id: 'f14', title: 'Día de la Raza', start: new Date(2026, 9, 12), end: new Date(2026, 9, 12), type: 'festivo', location: 'Nacional' },
  { id: 'f15', title: 'Todos los Santos', start: new Date(2026, 10, 2), end: new Date(2026, 10, 2), type: 'festivo', location: 'Nacional' },
  { id: 'f16', title: 'Independencia de Cartagena', start: new Date(2026, 10, 16), end: new Date(2026, 10, 16), type: 'festivo', location: 'Nacional' },
  { id: 'f17', title: 'Inmaculada Concepción', start: new Date(2026, 11, 8), end: new Date(2026, 11, 8), type: 'festivo', location: 'Nacional' },
  { id: 'f18', title: 'Navidad', start: new Date(2026, 11, 25), end: new Date(2026, 11, 25), type: 'festivo', location: 'Nacional' },

  // --- CELEBRACIONES Y DÍAS ESPECIALES INSTITUCIONALES ---
  { id: 's0', title: 'DÍA DE LA VIRGEN DE LA CANDELARIA (PATRONA)', start: new Date(2026, 1, 2), end: new Date(2026, 1, 2), type: 'significativo', location: 'Sedes IENSECAN', description: 'Celebración principal de nuestra institución.' },
  { id: 's1', title: 'Día de la Paz y la No Violencia', start: new Date(2026, 0, 30), end: new Date(2026, 0, 30), type: 'significativo', location: 'Institucional' },
  { id: 's3', title: 'Día Internacional de la Mujer', start: new Date(2026, 2, 8), end: new Date(2026, 2, 8), type: 'significativo', location: 'Internacional' },
  { id: 's8', title: 'Día del Idioma Español', start: new Date(2026, 3, 23), end: new Date(2026, 3, 23), type: 'significativo', location: 'Sedes Educativas' },
  { id: 's9', title: 'Día del Maestro', start: new Date(2026, 4, 15), end: new Date(2026, 4, 15), type: 'significativo', location: 'Colombia' },
  { id: 's11', title: 'Día del Estudiante', start: new Date(2026, 5, 8), end: new Date(2026, 5, 8), type: 'significativo', location: 'Colombia' },
  { id: 's13', title: 'Día del Amor y la Amistad', start: new Date(2026, 8, 19), end: new Date(2026, 8, 19), type: 'significativo', location: 'Colombia' },

  // --- HITOS TECNOLÓGICOS Y ANIVERSARIOS (RESTORED) ---
  { id: 't1', title: 'CES 2026', start: new Date(2026, 0, 6), end: new Date(2026, 0, 9), type: 'significativo', location: 'Las Vegas', description: 'La mayor feria de tecnología de consumo del mundo.' },
  { id: 't2', title: '25.º Aniversario de Wikipedia', start: new Date(2026, 0, 15), end: new Date(2026, 0, 15), type: 'significativo', location: 'Global', description: 'Un cuarto de siglo de la enciclopedia colaborativa global.' },
  { id: 't3', title: 'Día del Community Manager', start: new Date(2026, 0, 26), end: new Date(2026, 0, 26), type: 'significativo', location: 'Global', description: 'Homenaje a los profesionales que gestionan comunidades digitales.' },
  { id: 't4', title: 'Día de la Mujer y la Niña en la Ciencia', start: new Date(2026, 1, 11), end: new Date(2026, 1, 11), type: 'significativo', location: 'Global', description: 'Promover la igualdad de género en la investigación.' },
  { id: 't5', title: 'MWC Barcelona', start: new Date(2026, 2, 2), end: new Date(2026, 2, 5), type: 'significativo', location: 'Barcelona', description: '20.º aniversario del evento; foco en 6G e IA.' },
  { id: 't6', title: 'Centenario del Cohete de Goddard', start: new Date(2026, 2, 16), end: new Date(2026, 2, 16), type: 'significativo', location: 'Global', description: '100 años del hito que permitió satélites e internet.' },
  { id: 't7', title: '20.º Aniversario de Twitter (X)', start: new Date(2026, 2, 21), end: new Date(2026, 2, 21), type: 'significativo', location: 'Global', description: 'Dos décadas desde el inicio de la era del microblogging.' },
  { id: 't8', title: '20.º Aniversario de Spotify', start: new Date(2026, 3, 23), end: new Date(2026, 3, 23), type: 'significativo', location: 'Global', description: 'Plataforma que transformó la industria musical.' },
  { id: 't9', title: 'Google Cloud Next', start: new Date(2026, 3, 9), end: new Date(2026, 3, 11), type: 'significativo', location: 'Google', description: 'Innovaciones en infraestructura de nube e IA.' },
  { id: 't10', title: 'Día de las Niñas en las TIC', start: new Date(2026, 3, 23), end: new Date(2026, 3, 23), type: 'significativo', location: 'Global', description: 'Fomento de vocaciones en telecomunicaciones.' },
  { id: 't11', title: 'Día de Internet', start: new Date(2026, 4, 17), end: new Date(2026, 4, 17), type: 'significativo', location: 'Global', description: 'Celebración global de las telecomunicaciones.' },
  { id: 't12', title: 'South Summit', start: new Date(2026, 5, 3), end: new Date(2026, 5, 5), type: 'significativo', location: 'Madrid', description: 'Encuentro de emprendimiento y startups.' },
  { id: 't13', title: '30.º Aniversario de Hotmail', start: new Date(2026, 6, 4), end: new Date(2026, 6, 4), type: 'significativo', location: 'Global', description: 'Tres décadas del primer correo web masivo gratuito.' },
  { id: 't14', title: 'Día del Internauta', start: new Date(2026, 7, 23), end: new Date(2026, 7, 23), type: 'significativo', location: 'Global', description: 'Conmemora la World Wide Web pública.' },
  { id: 't15', title: '20.º Aniversario de Roblox', start: new Date(2026, 8, 1), end: new Date(2026, 8, 1), type: 'significativo', location: 'Global', description: 'Precursor del metaverso moderno.' },
  { id: 't16', title: 'Día del Programador', start: new Date(2026, 8, 13), end: new Date(2026, 8, 13), type: 'significativo', location: 'Global', description: 'Homenaje a quienes crean el código (Día 256).' },
  { id: 't17', title: 'Día de Ada Lovelace', start: new Date(2026, 9, 13), end: new Date(2026, 9, 13), type: 'significativo', location: 'Global', description: 'Reconocimiento a logros de mujeres en STEM.' },
  { id: 't18', title: '25.º Aniversario de Windows XP', start: new Date(2026, 9, 25), end: new Date(2026, 9, 25), type: 'significativo', location: 'Global', description: 'Un cuarto de siglo del icónico sistema operativo.' },
  { id: 't19', title: '30.º Aniversario de ICQ', start: new Date(2026, 10, 15), end: new Date(2026, 10, 15), type: 'significativo', location: 'Global', description: 'Popularizó el chat en tiempo real.' },
  { id: 't20', title: '20.º Aniversario de Nintendo Wii', start: new Date(2026, 10, 19), end: new Date(2026, 10, 19), type: 'significativo', location: 'Global', description: 'Revolucionó el control por movimiento.' },
  { id: 't21', title: 'Web Summit', start: new Date(2026, 10, 2), end: new Date(2026, 10, 5), type: 'significativo', location: 'Lisboa', description: 'Conferencia tecnológica más influyente de Europa.' },
  { id: 't22', title: 'Día de la Seguridad Informática', start: new Date(2026, 10, 30), end: new Date(2026, 10, 30), type: 'significativo', location: 'Global', description: 'Concienciación sobre ciberseguridad.' },

  // --- DESARROLLO INSTITUCIONAL (SDI) ---
  { id: 'sdi1', title: 'Semana de Desarrollo Institucional 1', start: new Date(2026, 0, 12), end: new Date(2026, 0, 16), type: 'institucional', location: 'Sede Principal' },
  { id: 'sdi2', title: 'Semana de Desarrollo Institucional 2', start: new Date(2026, 0, 19), end: new Date(2026, 0, 23), type: 'institucional', location: 'Sede Principal' },
  { id: 'sdi3', title: 'Semana de Desarrollo Institucional - Semana Santa', start: new Date(2026, 2, 30), end: new Date(2026, 3, 3), type: 'institucional', location: 'Trabajo Institucional' },
  { id: 'sdi4', title: 'Semana de Desarrollo Institucional - Receso Octubre', start: new Date(2026, 9, 5), end: new Date(2026, 9, 9), type: 'institucional', location: 'Trabajo Institucional' },
  { id: 'sdi5', title: 'Semana de Desarrollo Institucional - Final de Año', start: new Date(2026, 11, 7), end: new Date(2026, 11, 11), type: 'institucional', location: 'Sede Principal' },

  // --- PERIODOS LECTIVOS ---
  { id: 'pl1', title: 'INICIO PRIMER PERIODO LECTIVO', start: new Date(2026, 0, 26), end: new Date(2026, 0, 26), type: 'academico', location: 'Todas las Sedes' },
  { id: 'pl2', title: 'FINAL PRIMER PERIODO LECTIVO', start: new Date(2026, 5, 26), end: new Date(2026, 5, 26), type: 'academico', location: 'Todas las Sedes' },
  { id: 'pl3', title: 'INICIO SEGUNDO PERIODO LECTIVO', start: new Date(2026, 6, 21), end: new Date(2026, 6, 21), type: 'academico', location: 'Todas las Sedes' },
  { id: 'pl4', title: 'FINAL SEGUNDO PERIODO LECTIVO (FIN DE CLASES)', start: new Date(2026, 11, 4), end: new Date(2026, 11, 4), type: 'academico', location: 'Todas las Sedes' },

  // --- RECESOS ESTUDIANTILES ---
  { id: 're1', title: 'Receso Estudiantil Semana Santa', start: new Date(2026, 2, 30), end: new Date(2026, 3, 3), type: 'vacaciones', location: 'Receso Estudiantil' },
  { id: 're2', title: 'Receso Estudiantil Mitad de Año (Vacaciones)', start: new Date(2026, 5, 29), end: new Date(2026, 6, 17), type: 'vacaciones', location: 'Receso Estudiantil' },
  { id: 're3', title: 'Receso Estudiantil Octubre', start: new Date(2026, 9, 5), end: new Date(2026, 9, 9), type: 'vacaciones', location: 'Receso Estudiantil' },
  { id: 're4', title: 'Finalización Labores Académicas (Vacaciones Finales)', start: new Date(2026, 11, 7), end: new Date(2026, 11, 31), type: 'vacaciones', location: 'Receso Estudiantil' },
];

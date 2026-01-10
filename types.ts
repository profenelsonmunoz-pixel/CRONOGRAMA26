
export type EventType = 'academico' | 'institucional' | 'vacaciones' | 'festivo' | 'significativo' | 'efemeride';

export interface CalendarEvent {
  id: string;
  title: string; // Representa "REUNIONES / ACTIVIDADES"
  start: Date;
  end: Date;
  type: EventType;
  day?: string; // Nuevo campo: DÍA (Lunes, Martes, etc.)
  time?: string; // Nuevo campo: HORA
  location?: string; // LUGAR
  participants?: string; // PARTICIPAN
  observations?: string; // OBSERVACIONES
  description?: string; // Mantenido para compatibilidad de visualización rápida
}

export type ViewType = 'day' | 'week' | 'month' | 'year';

// Se añaden 'week' y 'year' al modo de visualización para el control de la interfaz
export type DisplayMode = 'grid' | 'list' | 'week' | 'year';

export interface CalendarState {
  currentDate: Date;
  view: ViewType;
  filter: EventType | 'all';
}

/**
 * Helpers para manejo de fechas y calendario
 * Todas las funciones trabajan con fechas en formato local del usuario
 */

/**
 * Formatea una fecha a string YYYY-MM-DD
 */
export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Formatea una fecha a formato legible en español
 * Ejemplo: "Lunes 15 de Marzo, 2024"
 */
export function formatDateToReadable(date: Date): string {
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Formatea una fecha a formato corto en español
 * Ejemplo: "15/03/2024"
 */
export function formatDateToShort(date: Date): string {
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Obtiene el primer día del mes
 */
export function getFirstDayOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1);
}

/**
 * Obtiene el último día del mes
 */
export function getLastDayOfMonth(year: number, month: number): Date {
  return new Date(year, month + 1, 0);
}

/**
 * Obtiene el número de días en un mes
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Obtiene el día de la semana del primer día del mes (0 = Domingo, 6 = Sábado)
 */
export function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

/**
 * Verifica si una fecha es hoy
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Verifica si una fecha es en el pasado
 */
export function isPastDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate < today;
}

/**
 * Verifica si dos fechas son el mismo día
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

/**
 * Genera array de días para el calendario (incluyendo días de meses adyacentes)
 * Ajustado para que Lunes sea el primer día (ISO 8601)
 */
export function generateCalendarDays(year: number, month: number): Date[] {
  const days: Date[] = [];
  
  // Primer día del mes
  const firstDay = getFirstDayOfMonth(year, month);
  const firstDayOfWeek = firstDay.getDay();
  
  // Ajustar para que Lunes sea el primer día (0 = Lunes, 6 = Domingo)
  const adjustedFirstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  
  // Días del mes anterior para completar la primera semana
  const prevMonthLastDay = new Date(year, month, 0);
  for (let i = adjustedFirstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDay.getDate() - i);
    days.push(date);
  }
  
  // Días del mes actual
  const daysInMonth = getDaysInMonth(year, month);
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    days.push(date);
  }
  
  // Días del mes siguiente para completar la última semana
  const remainingDays = 7 - (days.length % 7);
  if (remainingDays < 7) {
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push(date);
    }
  }
  
  return days;
}

/**
 * Obtiene el nombre del mes en español
 */
export function getMonthName(month: number): string {
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  return monthNames[month];
}

/**
 * Obtiene los nombres de los días de la semana (Lunes primero)
 */
export function getWeekDayNames(short: boolean = true): string[] {
  if (short) {
    return ["L", "M", "M", "J", "V", "S", "D"];
  }
  return ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
}

/**
 * Navega al mes anterior
 */
export function getPreviousMonth(year: number, month: number): { year: number; month: number } {
  if (month === 0) {
    return { year: year - 1, month: 11 };
  }
  return { year, month: month - 1 };
}

/**
 * Navega al mes siguiente
 */
export function getNextMonth(year: number, month: number): { year: number; month: number } {
  if (month === 11) {
    return { year: year + 1, month: 0 };
  }
  return { year, month: month + 1 };
}

/**
 * Obtiene el mes y año actual
 */
export function getCurrentMonthYear(): { year: number; month: number } {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth(),
  };
}

/**
 * Parsea una fecha en formato YYYY-MM-DD a Date
 */
export function parseISODate(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

import type { MaintenanceStatus } from '../types';

export const COMMON_AC_TASKS_EN = [
  'Inspect and clean/replace air filters',
  'Clean evaporator and condenser coils',
  'Flush and clear condensate drain line',
  'Check refrigerant operating pressures & test for leaks',
  'Inspect electrical wiring, contactors & capacitors',
  'Measure delta-T (temperature drop across coil)',
  'Lubricate fan motors and inspect bearings',
  'Test thermostat calibration and cycle controls',
  'Inspect duct connections and airflow'
];

export const COMMON_AC_TASKS_ES = [
  'Inspeccionar y limpiar/reemplazar filtros de aire',
  'Limpiar serpentines del evaporador y condensador',
  'Purgar y destapar línea de drenaje de condensado',
  'Verificar presiones de refrigerante y buscar fugas',
  'Inspeccionar cableado eléctrico, contactores y capacitores',
  'Medir salto térmico delta-T en el serpentín',
  'Lubricar motores de ventilador e inspeccionar rodamientos',
  'Calibrar termostato y probar ciclos de operación',
  'Inspeccionar conexiones de ductos y flujo de aire'
];

export const COMMON_AC_TASKS = COMMON_AC_TASKS_EN;

export const REFRIGERANT_TYPES = [
  'R-410A',
  'R-32',
  'R-22 (Freon)',
  'R-134a',
  'R-454B',
  'R-407C',
  'Other'
];

export const POPULAR_BRANDS = [
  'Daikin',
  'Mitsubishi Electric',
  'Carrier',
  'Trane',
  'Lennox',
  'LG',
  'Panasonic',
  'Fujitsu',
  'York',
  'Rheem',
  'Samsung',
  'Other'
];

/**
 * Calculates next service due date by adding interval months to the last service date.
 */
export function calculateNextDueDate(lastServiceDateStr: string, intervalMonths: number): string {
  if (!lastServiceDateStr) {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
  
  const [year, month, day] = lastServiceDateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setMonth(date.getMonth() + intervalMonths);
  
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Determines maintenance status and urgency metrics with language support.
 */
export function getMaintenanceStatus(nextDueDateStr: string, lang: 'en' | 'es' = 'en'): {
  status: MaintenanceStatus;
  daysDiff: number;
  badgeText: string;
} {
  if (!nextDueDateStr) {
    return { status: 'due_soon', daysDiff: 0, badgeText: lang === 'es' ? 'Requiere Fecha' : 'Needs Date' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, month, day] = nextDueDateStr.split('-').map(Number);
  const due = new Date(year, month - 1, day);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    const badgeText = lang === 'es'
      ? (overdueDays === 1 ? 'Vencido por 1 día' : `Vencido por ${overdueDays} días`)
      : (overdueDays === 1 ? 'Overdue by 1 day' : `Overdue by ${overdueDays} days`);
    return {
      status: 'overdue',
      daysDiff: diffDays,
      badgeText
    };
  } else if (diffDays <= 30) {
    const badgeText = lang === 'es'
      ? (diffDays === 0 ? 'Vence Hoy' : (diffDays === 1 ? 'Vence en 1 día' : `Vence en ${diffDays} días`))
      : (diffDays === 0 ? 'Due Today' : `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`);
    return {
      status: 'due_soon',
      daysDiff: diffDays,
      badgeText
    };
  } else {
    const months = Math.round(diffDays / 30);
    const badgeText = lang === 'es'
      ? `En ${months} meses (${diffDays}d)`
      : `In ${months} months (${diffDays}d)`;
    return {
      status: 'good',
      daysDiff: diffDays,
      badgeText
    };
  }
}

/**
 * Pretty formats YYYY-MM-DD in user's selected locale
 */
export function formatDate(dateStr: string, lang: 'en' | 'es' = 'en'): string {
  if (!dateStr) return 'N/A';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

import { MaintenanceStatus } from '../types';

export const COMMON_AC_TASKS = [
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
 * Determines maintenance status and urgency metrics.
 */
export function getMaintenanceStatus(nextDueDateStr: string): {
  status: MaintenanceStatus;
  daysDiff: number; // positive = days until due, negative = days overdue
  badgeText: string;
} {
  if (!nextDueDateStr) {
    return { status: 'due_soon', daysDiff: 0, badgeText: 'Needs Date' };
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
    return {
      status: 'overdue',
      daysDiff: diffDays,
      badgeText: overdueDays === 1 ? 'Overdue by 1 day' : `Overdue by ${overdueDays} days`
    };
  } else if (diffDays <= 30) {
    return {
      status: 'due_soon',
      daysDiff: diffDays,
      badgeText: diffDays === 0 ? 'Due Today' : `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`
    };
  } else {
    return {
      status: 'good',
      daysDiff: diffDays,
      badgeText: `In ${Math.round(diffDays / 30)} months (${diffDays}d)`
    };
  }
}

/**
 * Pretty formats YYYY-MM-DD
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

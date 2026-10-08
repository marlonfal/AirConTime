import React from 'react';
import { getMaintenanceStatus } from '../utils/maintenance';
import { AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

interface Props {
  nextDueDate: string;
  size?: 'sm' | 'md' | 'lg';
}

export const UrgencyBadge: React.FC<Props> = ({ nextDueDate, size = 'md' }) => {
  const { status, badgeText } = getMaintenanceStatus(nextDueDate);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold'
  };

  if (status === 'overdue') {
    return (
      <span className={`inline-flex items-center rounded-full bg-red-100 text-red-800 border border-red-200 animate-pulse ${sizeClasses[size]}`}>
        <AlertTriangle className={size === 'sm' ? 'w-3 h-3 text-red-600' : 'w-4 h-4 text-red-600'} />
        <span>{badgeText}</span>
      </span>
    );
  }

  if (status === 'due_soon') {
    return (
      <span className={`inline-flex items-center rounded-full bg-amber-100 text-amber-800 border border-amber-200 ${sizeClasses[size]}`}>
        <Clock className={size === 'sm' ? 'w-3 h-3 text-amber-600' : 'w-4 h-4 text-amber-600'} />
        <span>{badgeText}</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 ${sizeClasses[size]}`}>
      <CheckCircle2 className={size === 'sm' ? 'w-3 h-3 text-emerald-600' : 'w-4 h-4 text-emerald-600'} />
      <span>{badgeText}</span>
    </span>
  );
};

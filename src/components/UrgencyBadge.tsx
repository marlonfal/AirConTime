import React from 'react';
import { getMaintenanceStatus } from '../utils/maintenance';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  nextDueDate: string;
  size?: 'sm' | 'md' | 'lg';
}

export const UrgencyBadge: React.FC<Props> = ({ nextDueDate, size = 'md' }) => {
  const { language } = useLanguage();
  const { status, badgeText } = getMaintenanceStatus(nextDueDate, language);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3 py-1.5 font-medium'
  };

  if (status === 'overdue') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-md bg-zinc-100 text-red-700 border border-red-200 font-medium ${sizeClasses[size]}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
        <span>{badgeText}</span>
      </span>
    );
  }

  if (status === 'due_soon') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-md bg-zinc-100 text-amber-800 border border-amber-300 font-medium ${sizeClasses[size]}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
        <span>{badgeText}</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200 ${sizeClasses[size]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
      <span>{badgeText}</span>
    </span>
  );
};

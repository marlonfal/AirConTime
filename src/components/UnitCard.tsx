import React from 'react';
import type { ACUnit } from '../types';
import { UrgencyBadge } from './UrgencyBadge';
import { formatDate } from '../utils/maintenance';
import { useLanguage } from '../context/LanguageContext';
import { 
  Wrench, 
  Calendar, 
  Clock, 
  Edit2, 
  Trash2, 
  FileText 
} from 'lucide-react';

interface Props {
  unit: ACUnit;
  onLogService: (unitId: string) => void;
  onEdit: (unit: ACUnit) => void;
  onDelete: (unitId: string) => void;
  onViewLogs?: (unitId: string) => void;
}

export const UnitCard: React.FC<Props> = ({ 
  unit, 
  onLogService, 
  onEdit, 
  onDelete,
  onViewLogs 
}) => {
  const { language, t } = useLanguage();

  return (
    <div className="rounded-xl bg-white border border-zinc-200 p-4 shadow-none hover:border-zinc-300 transition flex flex-col justify-between">
      <div>
        
        {/* Top Header: Client & Status Badge */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-medium text-zinc-500 block">
              {unit.clientName}
            </span>
            <h3 className="text-sm font-semibold text-zinc-900 truncate" title={unit.locationInBuilding}>
              {unit.locationInBuilding}
            </h3>
          </div>
          <UrgencyBadge nextDueDate={unit.nextServiceDueDate} size="sm" />
        </div>

        {/* Equipment Specs */}
        <div className="bg-zinc-50 rounded-lg p-2.5 border border-zinc-100 mb-3 text-xs">
          <div className="flex items-center justify-between text-zinc-800 font-medium mb-1">
            <span>{unit.brand} {unit.modelNumber}</span>
            {unit.coolingCapacity && (
              <span className="text-zinc-500 text-[11px] font-normal">{unit.coolingCapacity}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 text-[11px] text-zinc-500">
            {unit.serialNumber && (
              <span className="bg-white px-1.5 py-0.5 rounded border border-zinc-200">
                SN: {unit.serialNumber}
              </span>
            )}
            <span className="bg-white px-1.5 py-0.5 rounded border border-zinc-200">
              {unit.refrigerantType}
            </span>
            <span className="bg-white px-1.5 py-0.5 rounded border border-zinc-200">
              {t('everyXMonths', { x: unit.maintenanceIntervalMonths })}
            </span>
          </div>
        </div>

        {/* Schedule Timeline */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-2.5">
          <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-100">
            <span className="text-zinc-400 text-[10px] uppercase font-medium block flex items-center gap-1 mb-0.5">
              <Calendar className="w-3 h-3 text-zinc-400" /> {t('colLastService')}
            </span>
            <span className="font-medium text-zinc-700">
              {formatDate(unit.lastServiceDate, language)}
            </span>
          </div>

          <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-100">
            <span className="text-zinc-400 text-[10px] uppercase font-medium block flex items-center gap-1 mb-0.5">
              <Clock className="w-3 h-3 text-zinc-400" /> {t('colNextDue')}
            </span>
            <span className="font-semibold text-zinc-900">
              {formatDate(unit.nextServiceDueDate, language)}
            </span>
          </div>
        </div>

        {/* Notes */}
        {unit.notes && (
          <p className="text-[11px] text-zinc-500 line-clamp-1 mb-2">
            {unit.notes}
          </p>
        )}

      </div>

      {/* Card Footer Actions */}
      <div className="pt-2.5 border-t border-zinc-100 flex items-center justify-between gap-2 mt-1">
        <button
          onClick={() => onLogService(unit.id)}
          className="flex-1 py-1.5 px-3 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white flex items-center justify-center gap-1.5 transition"
        >
          <Wrench className="w-3 h-3" />
          <span>{t('btnLogService')}</span>
        </button>

        <div className="flex items-center space-x-1">
          {onViewLogs && (
            <button
              onClick={() => onViewLogs(unit.id)}
              title={t('navHistory')}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-md transition"
            >
              <FileText className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => onEdit(unit)}
            title={t('unitModalTitleEdit')}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-md transition"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              const confirmText = language === 'es'
                ? `¿Eliminar el equipo "${unit.locationInBuilding}"?`
                : `Delete unit "${unit.locationInBuilding}"?`;
              if (confirm(confirmText)) {
                onDelete(unit.id);
              }
            }}
            title="Delete"
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-md transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};

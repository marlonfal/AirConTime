import React from 'react';
import { ACUnit } from '../types';
import { UrgencyBadge } from './UrgencyBadge';
import { formatDate, getMaintenanceStatus } from '../utils/maintenance';
import { 
  Wrench, 
  MapPin, 
  Calendar, 
  Clock, 
  Edit2, 
  Trash2, 
  Tag, 
  Zap, 
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
  const { status, daysDiff } = getMaintenanceStatus(unit.nextServiceDueDate);

  const cardBorder = status === 'overdue' 
    ? 'border-red-300 ring-1 ring-red-200 bg-red-50/20' 
    : status === 'due_soon' 
    ? 'border-amber-300 ring-1 ring-amber-100 bg-amber-50/20' 
    : 'border-slate-200 hover:border-slate-300';

  return (
    <div className={`rounded-2xl bg-white border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${cardBorder}`}>
      <div>
        
        {/* Top Header: Client & Status Badge */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md inline-block mb-1">
              {unit.clientName}
            </span>
            <h3 className="text-base font-bold text-slate-900 truncate" title={unit.locationInBuilding}>
              {unit.locationInBuilding}
            </h3>
          </div>
          <UrgencyBadge nextDueDate={unit.nextServiceDueDate} size="md" />
        </div>

        {/* Equipment Brand / Specs banner */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              {unit.brand} {unit.modelNumber}
            </span>
            {unit.coolingCapacity && (
              <span className="text-slate-500 font-normal text-[11px]">
                {unit.coolingCapacity}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
            {unit.serialNumber && (
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                SN: {unit.serialNumber}
              </span>
            )}
            <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-cyan-700 font-medium">
              {unit.refrigerantType}
            </span>
            <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
              Freq: Every {unit.maintenanceIntervalMonths} Mo
            </span>
          </div>
        </div>

        {/* Schedule Timeline Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-0.5 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" /> Last Serviced
            </span>
            <span className="font-semibold text-slate-700">
              {formatDate(unit.lastServiceDate)}
            </span>
          </div>

          <div className={`p-2.5 rounded-lg border ${
            status === 'overdue' 
              ? 'bg-red-50 border-red-200 text-red-900' 
              : status === 'due_soon' 
              ? 'bg-amber-50 border-amber-200 text-amber-900' 
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}>
            <span className="text-[10px] uppercase font-bold tracking-wider block mb-0.5 flex items-center gap-1 opacity-75">
              <Clock className="w-3 h-3" /> Next Service Due
            </span>
            <span className="font-bold">
              {formatDate(unit.nextServiceDueDate)}
            </span>
          </div>
        </div>

        {/* Optional Notes */}
        {unit.notes && (
          <p className="text-[11px] text-slate-500 italic line-clamp-2 mb-3 bg-white p-1.5 rounded border border-slate-100">
            "{unit.notes}"
          </p>
        )}

      </div>

      {/* Card Footer Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
        <button
          onClick={() => onLogService(unit.id)}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition active:scale-[0.98] ${
            status === 'overdue'
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20'
              : status === 'due_soon'
              ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Log Maintenance</span>
        </button>

        <div className="flex items-center space-x-1">
          {onViewLogs && (
            <button
              onClick={() => onViewLogs(unit.id)}
              title="View Service History"
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
            >
              <FileText className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => onEdit(unit)}
            title="Edit Unit Specs"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (confirm(`Are you sure you want to delete unit "${unit.locationInBuilding}"?`)) {
                onDelete(unit.id);
              }
            }}
            title="Delete Unit"
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};

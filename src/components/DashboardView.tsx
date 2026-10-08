import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import type { ACUnit, MaintenanceStatus } from '../types';
import { getMaintenanceStatus, formatDate } from '../utils/maintenance';
import { UnitCard } from './UnitCard';
import { UrgencyBadge } from './UrgencyBadge';
import { 
  Plus, 
  Search, 
  Filter, 
  Wind, 
  Wrench, 
  RotateCcw, 
  UserPlus, 
  LayoutList, 
  LayoutGrid, 
  Edit2, 
  Trash2, 
  FileText 
} from 'lucide-react';

interface Props {
  onLogService: (unitId?: string) => void;
  onAddUnit: () => void;
  onAddClient: () => void;
  onEditUnit: (unit: ACUnit) => void;
  onViewLogs: (unitId: string) => void;
}

export const DashboardView: React.FC<Props> = ({
  onLogService,
  onAddUnit,
  onAddClient,
  onEditUnit,
  onViewLogs
}) => {
  const { units, clients, deleteUnit, resetToSampleData } = useData();
  const { language, t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | MaintenanceStatus>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Compute status for all units
  const unitStatuses = units.map(u => ({
    unit: u,
    ...getMaintenanceStatus(u.nextServiceDueDate, language)
  }));

  const overdueCount = unitStatuses.filter(u => u.status === 'overdue').length;
  const dueSoonCount = unitStatuses.filter(u => u.status === 'due_soon').length;

  // Filtered list
  const filteredUnits = unitStatuses.filter(({ unit, status }) => {
    if (statusFilter !== 'all' && status !== statusFilter) return false;
    if (clientFilter !== 'all' && unit.clientId !== clientFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchClient = unit.clientName.toLowerCase().includes(q);
      const matchLocation = unit.locationInBuilding.toLowerCase().includes(q);
      const matchBrand = unit.brand.toLowerCase().includes(q);
      const matchModel = unit.modelNumber.toLowerCase().includes(q);
      const matchSerial = unit.serialNumber?.toLowerCase().includes(q);
      return matchClient || matchLocation || matchBrand || matchModel || matchSerial;
    }

    return true;
  });

  // Sort by urgency: overdue first, then upcoming
  filteredUnits.sort((a, b) => a.daysDiff - b.daysDiff);

  return (
    <div className="space-y-4">
      
      {/* Top Filter & Action Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-zinc-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        
        {/* Search & Client Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-400"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs border border-zinc-200 rounded-lg bg-white focus:outline-none focus:border-zinc-400 text-zinc-700"
            >
              <option value="all">{t('allClients')} ({clients.length})</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
              statusFilter === 'all'
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            {t('filterAll')} ({units.length})
          </button>
          <button
            onClick={() => setStatusFilter('overdue')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
              statusFilter === 'overdue'
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            {t('filterOverdue')} ({overdueCount})
          </button>
          <button
            onClick={() => setStatusFilter('due_soon')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
              statusFilter === 'due_soon'
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            {t('filterDueSoon')} ({dueSoonCount})
          </button>
          <button
            onClick={() => setStatusFilter('good')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
              statusFilter === 'good'
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            {t('filterGood')}
          </button>
        </div>

        {/* Primary Actions & View Switcher */}
        <div className="flex items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-zinc-100">
          
          {/* View Toggle */}
          <div className="flex items-center border border-zinc-200 rounded-lg p-0.5 bg-zinc-50">
            <button
              onClick={() => setViewMode('table')}
              title={t('tableView')}
              className={`p-1 rounded ${viewMode === 'table' ? 'bg-white shadow-xs text-zinc-900' : 'text-zinc-400 hover:text-zinc-700'}`}
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              title={t('gridView')}
              className={`p-1 rounded ${viewMode === 'grid' ? 'bg-white shadow-xs text-zinc-900' : 'text-zinc-400 hover:text-zinc-700'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => onLogService()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-medium transition"
          >
            <Wrench className="w-3 h-3" />
            <span>{t('btnLogService')}</span>
          </button>

          <button
            onClick={onAddUnit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-zinc-300 hover:bg-zinc-50 text-zinc-800 rounded-lg text-xs font-medium transition"
          >
            <Plus className="w-3 h-3" />
            <span>{t('btnAddUnit')}</span>
          </button>

          <button
            onClick={onAddClient}
            title={t('btnAddClient')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 border border-zinc-300 hover:bg-zinc-50 text-zinc-800 rounded-lg text-xs font-medium transition"
          >
            <UserPlus className="w-3 h-3" />
            <span>{t('btnAddClient')}</span>
          </button>
        </div>

      </div>

      {/* Units Display: Table or Grid */}
      {filteredUnits.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center">
          <Wind className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-zinc-800">{t('noUnitsFound')}</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
            {t('noUnitsDesc')}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={onAddUnit}
              className="px-3 py-1.5 bg-zinc-900 text-white text-xs font-medium rounded-lg hover:bg-zinc-800 transition"
            >
              + {t('btnAddUnit')}
            </button>
            <button
              onClick={resetToSampleData}
              className="px-3 py-1.5 border border-zinc-300 text-zinc-700 text-xs font-medium rounded-lg hover:bg-zinc-50 transition flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> {t('loadSampleData')}
            </button>
          </div>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-medium">
                  <th className="py-2.5 px-4 font-medium">{t('colClient')}</th>
                  <th className="py-2.5 px-4 font-medium">{t('colLocation')}</th>
                  <th className="py-2.5 px-4 font-medium">{t('colSpecs')}</th>
                  <th className="py-2.5 px-4 font-medium">{t('colInterval')}</th>
                  <th className="py-2.5 px-4 font-medium">{t('colLastService')}</th>
                  <th className="py-2.5 px-4 font-medium">{t('colNextDue')}</th>
                  <th className="py-2.5 px-4 font-medium text-right">{t('colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredUnits.map(({ unit }) => (
                  <tr key={unit.id} className="hover:bg-zinc-50/80 transition-colors">
                    
                    {/* Client Name */}
                    <td className="py-3 px-4 font-medium text-zinc-900">
                      <span>{unit.clientName}</span>
                    </td>

                    {/* Room / Location */}
                    <td className="py-3 px-4 text-zinc-800 font-medium">
                      <span>{unit.locationInBuilding}</span>
                    </td>

                    {/* Equipment Specs */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-zinc-900">
                        {unit.brand} {unit.modelNumber}
                      </div>
                      <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                        <span>{unit.refrigerantType}</span>
                        {unit.coolingCapacity && <span>• {unit.coolingCapacity}</span>}
                        {unit.serialNumber && <span>• SN: {unit.serialNumber}</span>}
                      </div>
                    </td>

                    {/* Frequency Interval */}
                    <td className="py-3 px-4 text-zinc-600 whitespace-nowrap">
                      {t('everyXMonths', { x: unit.maintenanceIntervalMonths })}
                    </td>

                    {/* Last Service Date */}
                    <td className="py-3 px-4 text-zinc-600 whitespace-nowrap">
                      {formatDate(unit.lastServiceDate, language)}
                    </td>

                    {/* Next Due Date & Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-zinc-900">
                          {formatDate(unit.nextServiceDueDate, language)}
                        </span>
                        <UrgencyBadge nextDueDate={unit.nextServiceDueDate} size="sm" />
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => onLogService(unit.id)}
                          className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-white rounded text-xs font-medium transition inline-flex items-center gap-1"
                        >
                          <Wrench className="w-3 h-3" />
                          <span>{t('btnLog')}</span>
                        </button>

                        <button
                          onClick={() => onViewLogs(unit.id)}
                          title={t('navHistory')}
                          className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded transition"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onEditUnit(unit)}
                          title={t('unitModalTitleEdit')}
                          className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            const confirmText = language === 'es'
                              ? `¿Eliminar el equipo "${unit.locationInBuilding}"?`
                              : `Delete unit "${unit.locationInBuilding}"?`;
                            if (confirm(confirmText)) {
                              deleteUnit(unit.id);
                            }
                          }}
                          title="Delete"
                          className="p-1 text-zinc-400 hover:text-red-600 hover:bg-zinc-100 rounded transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredUnits.map(({ unit }) => (
            <UnitCard
              key={unit.id}
              unit={unit}
              onLogService={(id) => onLogService(id)}
              onEdit={(u) => onEditUnit(u)}
              onDelete={(id) => deleteUnit(id)}
              onViewLogs={(id) => onViewLogs(id)}
            />
          ))}
        </div>
      )}

      {/* Footer Info */}
      <div className="pt-2 flex items-center justify-between text-xs text-zinc-400">
        <span>{t('showingUnits')} {filteredUnits.length} {t('ofTotalUnits')} {units.length} {t('totalUnits')}</span>
        <button
          onClick={() => {
            const confirmText = language === 'es'
              ? '¿Restaurar los datos de muestra iniciales?'
              : 'Reset to initial sample AC technician units and service logs?';
            if (confirm(confirmText)) {
              resetToSampleData();
            }
          }}
          className="text-zinc-400 hover:text-zinc-600 underline flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" /> {t('restoreSampleData')}
        </button>
      </div>

    </div>
  );
};

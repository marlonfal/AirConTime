import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { formatDate } from '../utils/maintenance';
import { 
  History, 
  Calendar, 
  User, 
  Check, 
  Filter,
  Search
} from 'lucide-react';

export const ServiceHistoryView: React.FC = () => {
  const { serviceLogs, units } = useData();
  const { language, t } = useLanguage();
  const [filterUnitId, setFilterUnitId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = serviceLogs.filter(log => {
    const matchesUnit = filterUnitId === 'all' || log.unitId === filterUnitId;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      log.clientName.toLowerCase().includes(searchLower) ||
      log.unitLocation.toLowerCase().includes(searchLower) ||
      log.technicianName.toLowerCase().includes(searchLower) ||
      (log.partsReplaced && log.partsReplaced.toLowerCase().includes(searchLower)) ||
      (log.notes && log.notes.toLowerCase().includes(searchLower));

    return matchesUnit && matchesSearch;
  });

  return (
    <div className="space-y-4">
      
      {/* Title & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">{t('historyTitle')}</h2>
          <p className="text-xs text-zinc-500">{t('historySubtitle')}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('searchHistoryPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-zinc-200 rounded-lg bg-white focus:outline-none focus:border-zinc-400 w-full sm:w-48"
            />
          </div>

          {/* Unit Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <select
              value={filterUnitId}
              onChange={(e) => setFilterUnitId(e.target.value)}
              className="py-1.5 px-2.5 text-xs border border-zinc-200 rounded-lg bg-white focus:outline-none focus:border-zinc-400 text-zinc-700"
            >
              <option value="all">{t('allUnitsOption')}</option>
              {units.map(u => (
                <option key={u.id} value={u.id}>
                  {u.clientName} - {u.locationInBuilding}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Logs Timeline */}
      {filteredLogs.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 p-10 text-center">
          <History className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-zinc-800">{t('noLogsFound')}</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
            {t('noLogsDesc')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <div 
              key={log.id} 
              className="bg-white rounded-xl border border-zinc-200 p-4 text-xs"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2.5 border-b border-zinc-100">
                <div>
                  <span className="font-semibold text-zinc-900">
                    {log.clientName}
                  </span>
                  <span className="text-zinc-500 ml-1.5">
                    • {log.unitLocation} ({log.unitBrandModel})
                  </span>
                </div>

                <div className="flex items-center gap-3 text-zinc-500">
                  <span className="flex items-center gap-1 font-medium text-zinc-700">
                    <Calendar className="w-3 h-3 text-zinc-400" />
                    {formatDate(log.date, language)}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-zinc-400" />
                    {log.technicianName}
                  </span>
                </div>
              </div>

              {/* Tasks List */}
              <div className="py-2.5">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  {t('tasksCount')} ({log.tasksCompleted.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {log.tasksCompleted.map((task, idx) => (
                    <span 
                      key={idx} 
                      className="inline-flex items-center gap-1 bg-zinc-50 text-zinc-700 border border-zinc-200 px-2 py-0.5 rounded text-[11px]"
                    >
                      <Check className="w-3 h-3 text-zinc-500 stroke-[2.5]" />
                      {task}
                    </span>
                  ))}
                </div>
              </div>

              {/* Refrigerant & Parts & Cost */}
              {(log.partsReplaced || (log.refrigerantAddedOz && log.refrigerantAddedOz > 0) || log.cost) && (
                <div className="bg-zinc-50 rounded-lg p-2 text-zinc-700 grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2 border border-zinc-100">
                  {log.refrigerantAddedOz !== undefined && log.refrigerantAddedOz > 0 && (
                    <div>
                      <span className="text-zinc-400 block text-[10px] uppercase">{t('refrigerantAddedOz')}</span>
                      <span className="font-medium text-zinc-800">{log.refrigerantAddedOz} oz</span>
                    </div>
                  )}

                  {log.partsReplaced && (
                    <div className="sm:col-span-2">
                      <span className="text-zinc-400 block text-[10px] uppercase">{t('partsMaterialsLabel')}</span>
                      <span className="text-zinc-800">{log.partsReplaced}</span>
                    </div>
                  )}

                  {log.cost !== undefined && (
                    <div>
                      <span className="text-zinc-400 block text-[10px] uppercase">{t('serviceCharge')}</span>
                      <span className="font-semibold text-zinc-800">${log.cost}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              {log.notes && (
                <p className="text-zinc-600 bg-zinc-50/50 p-2 rounded border border-zinc-100 mb-2">
                  "{log.notes}"
                </p>
              )}

              {/* Footer */}
              <div className="pt-2 flex items-center justify-between text-zinc-400 text-[11px]">
                <span>{t('nextScheduled')} <b className="text-zinc-700">{formatDate(log.nextServiceDueDate, language)}</b></span>
                <span>ID: {log.id}</span>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

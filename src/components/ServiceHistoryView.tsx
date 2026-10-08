import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { formatDate } from '../utils/maintenance';
import { 
  History, 
  Calendar, 
  User, 
  Check, 
  Wrench, 
  DollarSign, 
  Filter,
  Search
} from 'lucide-react';

export const ServiceHistoryView: React.FC = () => {
  const { serviceLogs, units } = useData();
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
    <div className="space-y-6">
      
      {/* Title & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Service Visit & Maintenance History</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit log of completed maintenance checklists, repairs, and next schedule updates
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search history, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-56"
            />
          </div>

          {/* Unit Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={filterUnitId}
              onChange={(e) => setFilterUnitId(e.target.value)}
              className="py-2 px-3 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All AC Units</option>
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
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700">No Service Logs Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            No maintenance records match your current filter. Record a new service on any AC unit to see it here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <div 
              key={log.id} 
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition"
            >
              {/* Header: Client & Unit info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {log.clientName}
                    </span>
                    <span className="text-xs font-semibold text-slate-800">
                      • {log.unitLocation}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Equipment: {log.unitBrandModel}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-semibold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    {formatDate(log.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {log.technicianName}
                  </span>
                </div>
              </div>

              {/* Tasks Checklist Grid */}
              <div className="py-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Completed Tasks ({log.tasksCompleted.length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {log.tasksCompleted.map((task, idx) => (
                    <span 
                      key={idx} 
                      className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-1 rounded-lg font-medium"
                    >
                      <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                      {task}
                    </span>
                  ))}
                </div>
              </div>

              {/* Refrigerant & Parts & Cost */}
              {(log.partsReplaced || (log.refrigerantAddedOz && log.refrigerantAddedOz > 0) || log.cost) && (
                <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 border border-slate-100">
                  {log.refrigerantAddedOz !== undefined && log.refrigerantAddedOz > 0 && (
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Refrigerant Added</span>
                      <span className="font-semibold text-cyan-700">{log.refrigerantAddedOz} oz</span>
                    </div>
                  )}

                  {log.partsReplaced && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Parts & Materials</span>
                      <span className="font-medium text-slate-800">{log.partsReplaced}</span>
                    </div>
                  )}

                  {log.cost !== undefined && (
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Service Fee</span>
                      <span className="font-bold text-emerald-700 flex items-center">
                        <DollarSign className="w-3 h-3 inline" />{log.cost}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              {log.notes && (
                <p className="text-xs text-slate-600 bg-slate-50/60 p-2.5 rounded-lg border border-slate-100 italic mb-2">
                  "{log.notes}"
                </p>
              )}

              {/* Footer: next scheduled date calculated */}
              <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                <span>Calculated Next Due: <b className="text-blue-700">{formatDate(log.nextServiceDueDate)}</b></span>
                <span className="text-[11px] text-slate-400">Log ID: {log.id}</span>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

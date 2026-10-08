import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { ACUnit, MaintenanceStatus } from '../types';
import { getMaintenanceStatus } from '../utils/maintenance';
import { UnitCard } from './UnitCard';
import { 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Wind, 
  Wrench,
  RotateCcw
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

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | MaintenanceStatus>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');

  // Compute urgency metrics
  const unitStatuses = units.map(u => ({
    unit: u,
    ...getMaintenanceStatus(u.nextServiceDueDate)
  }));

  const overdueUnits = unitStatuses.filter(u => u.status === 'overdue');
  const dueSoonUnits = unitStatuses.filter(u => u.status === 'due_soon');
  const goodUnits = unitStatuses.filter(u => u.status === 'good');

  // Filtered list
  const filteredUnits = unitStatuses.filter(({ unit, status }) => {
    // Status filter
    if (statusFilter !== 'all' && status !== statusFilter) return false;

    // Client filter
    if (clientFilter !== 'all' && unit.clientId !== clientFilter) return false;

    // Search query
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

  // Sort by urgency: overdue first (most days overdue first), then due_soon (closest first), then good
  filteredUnits.sort((a, b) => a.daysDiff - b.daysDiff);

  return (
    <div className="space-y-6">
      
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Units */}
        <div 
          onClick={() => setStatusFilter('all')}
          className={`p-5 rounded-2xl bg-white border cursor-pointer transition shadow-sm hover:shadow ${
            statusFilter === 'all' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total AC Units</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wind className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{units.length}</span>
            <span className="text-xs text-slate-500">tracked units</span>
          </div>
        </div>

        {/* Overdue */}
        <div 
          onClick={() => setStatusFilter('overdue')}
          className={`p-5 rounded-2xl bg-white border cursor-pointer transition shadow-sm hover:shadow ${
            statusFilter === 'overdue' ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Overdue Service</span>
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-red-600">{overdueUnits.length}</span>
            <span className="text-xs text-red-500 font-medium">urgent attention</span>
          </div>
        </div>

        {/* Due Soon */}
        <div 
          onClick={() => setStatusFilter('due_soon')}
          className={`p-5 rounded-2xl bg-white border cursor-pointer transition shadow-sm hover:shadow ${
            statusFilter === 'due_soon' ? 'border-amber-500 ring-2 ring-amber-100' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Due Soon (&lt;30d)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600">{dueSoonUnits.length}</span>
            <span className="text-xs text-amber-600 font-medium">scheduled this month</span>
          </div>
        </div>

        {/* Good Standing */}
        <div 
          onClick={() => setStatusFilter('good')}
          className={`p-5 rounded-2xl bg-white border cursor-pointer transition shadow-sm hover:shadow ${
            statusFilter === 'good' ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Up to Date</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600">{goodUnits.length}</span>
            <span className="text-xs text-emerald-600 font-medium">good condition</span>
          </div>
        </div>

      </div>

      {/* Action Bar & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Search & Filter dropdowns */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search units, room location, brand, serial..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="py-2 px-3 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Clients ({clients.length})</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({units.length})
          </button>
          <button
            onClick={() => setStatusFilter('overdue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === 'overdue'
                ? 'bg-red-600 text-white'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            ⚠️ Overdue ({overdueUnits.length})
          </button>
          <button
            onClick={() => setStatusFilter('due_soon')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === 'due_soon'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            ⏳ Due Soon ({dueSoonUnits.length})
          </button>
          <button
            onClick={() => setStatusFilter('good')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === 'good'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            ✅ Good ({goodUnits.length})
          </button>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          <button
            onClick={() => onLogService()}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Log Service</span>
          </button>

          <button
            onClick={onAddUnit}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add AC Unit</span>
          </button>
        </div>

      </div>

      {/* AC Units Grid */}
      {filteredUnits.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Wind className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No AC Units Match Criteria</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, status filters, or add a new air conditioning unit to start tracking.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={onAddUnit}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              + Add First AC Unit
            </button>
            <button
              onClick={resetToSampleData}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Load Sample AC Data
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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

      {/* Bottom utility / Sample Data Reset */}
      <div className="pt-4 flex items-center justify-between text-xs text-slate-400">
        <span>Showing {filteredUnits.length} of {units.length} total units</span>
        <button
          onClick={() => {
            if (confirm('Reset to initial sample AC technician units and service logs?')) {
              resetToSampleData();
            }
          }}
          className="text-slate-400 hover:text-slate-600 underline flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" /> Restore Sample Data
        </button>
      </div>

    </div>
  );
};

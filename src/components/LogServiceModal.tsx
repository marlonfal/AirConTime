import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ACUnit } from '../types';
import { COMMON_AC_TASKS, calculateNextDueDate, formatDate } from '../utils/maintenance';
import { X, Calendar, CheckSquare, Wrench, DollarSign, Plus, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  preselectedUnitId?: string;
}

export const LogServiceModal: React.FC<Props> = ({ isOpen, onClose, preselectedUnitId }) => {
  const { units, recordMaintenance } = useData();
  const { user } = useAuth();

  const todayStr = new Date().toISOString().split('T')[0];

  const [unitId, setUnitId] = useState(preselectedUnitId || '');
  const [date, setDate] = useState(todayStr);
  const [technicianName, setTechnicianName] = useState(user?.displayName || 'Alex Carter');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([
    'Inspect and clean/replace air filters',
    'Flush and clear condensate drain line',
    'Check refrigerant operating pressures & test for leaks'
  ]);
  const [customTask, setCustomTask] = useState('');
  const [refrigerantAddedOz, setRefrigerantAddedOz] = useState<number | ''>('');
  const [partsReplaced, setPartsReplaced] = useState('');
  const [notes, setNotes] = useState('');
  const [cost, setCost] = useState<number | ''>('');
  const [customNextDueDate, setCustomNextDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (preselectedUnitId) {
      setUnitId(preselectedUnitId);
    } else if (units.length > 0 && !unitId) {
      setUnitId(units[0].id);
    }
  }, [preselectedUnitId, units]);

  useEffect(() => {
    if (user?.displayName) {
      setTechnicianName(user.displayName);
    }
  }, [user]);

  const selectedUnit = units.find(u => u.id === unitId);
  const calculatedNextDue = selectedUnit 
    ? calculateNextDueDate(date, selectedUnit.maintenanceIntervalMonths)
    : '';

  if (!isOpen) return null;

  const toggleTask = (task: string) => {
    if (selectedTasks.includes(task)) {
      setSelectedTasks(selectedTasks.filter(t => t !== task));
    } else {
      setSelectedTasks([...selectedTasks, task]);
    }
  };

  const addCustomTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTask.trim() && !selectedTasks.includes(customTask.trim())) {
      setSelectedTasks([...selectedTasks, customTask.trim()]);
      setCustomTask('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitId) return;

    try {
      setSubmitting(true);
      await recordMaintenance({
        unitId,
        date,
        technicianName: technicianName || 'Technician',
        tasksCompleted: selectedTasks,
        refrigerantAddedOz: refrigerantAddedOz ? Number(refrigerantAddedOz) : undefined,
        partsReplaced: partsReplaced.trim() || undefined,
        notes: notes.trim() || undefined,
        cost: cost ? Number(cost) : undefined,
        customNextDueDate: customNextDueDate || undefined
      });
      onClose();
    } catch (err) {
      console.error('Failed to record maintenance:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-blue-200 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2 text-blue-200 mb-1">
            <Wrench className="w-5 h-5" />
            <span className="text-xs uppercase font-bold tracking-wider">Technician Work Order</span>
          </div>
          <h2 className="text-xl font-bold">Log AC Maintenance Service</h2>
          <p className="text-xs text-blue-100 mt-1">
            Record maintenance performed. Next service schedule will be automatically updated!
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Unit Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Serviced AC Unit *
            </label>
            <select
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.clientName} — {u.locationInBuilding} ({u.brand} {u.modelNumber})
                </option>
              ))}
            </select>
            {selectedUnit && (
              <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                <span>Standard Interval: <b>Every {selectedUnit.maintenanceIntervalMonths} Months</b></span>
                <span>Serial: <b>{selectedUnit.serialNumber || 'N/A'}</b></span>
                <span>Refrigerant: <b>{selectedUnit.refrigerantType || 'R-410A'}</b></span>
              </div>
            )}
          </div>

          {/* Date & Technician Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Service Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Technician Name *
              </label>
              <input
                type="text"
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                placeholder="e.g. Alex Carter"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Checklist of Common Tasks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
              Checklist: Maintenance Tasks Performed
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              {COMMON_AC_TASKS.map((task) => {
                const isChecked = selectedTasks.includes(task);
                return (
                  <button
                    key={task}
                    type="button"
                    onClick={() => toggleTask(task)}
                    className={`flex items-start text-left p-2 rounded-lg text-xs transition border ${
                      isChecked
                        ? 'bg-blue-50 border-blue-300 text-blue-900 font-medium'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded mt-0.5 mr-2 flex items-center justify-center shrink-0 border ${
                      isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span>{task}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Task Add */}
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                placeholder="Add other completed task..."
                value={customTask}
                onChange={(e) => setCustomTask(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={addCustomTask}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>

          {/* Parts Replaced & Refrigerant */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Refrigerant Added (Ounces / lbs)
              </label>
              <input
                type="number"
                step="0.5"
                placeholder="e.g. 8 (0 if none added)"
                value={refrigerantAddedOz}
                onChange={(e) => setRefrigerantAddedOz(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Parts Replaced / Materials Used
              </label>
              <input
                type="text"
                placeholder="e.g. 45/5 Dual Run Capacitor, 20x25x4 MERV 11 filter"
                value={partsReplaced}
                onChange={(e) => setPartsReplaced(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Notes & Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Technician Observations & Pressures
              </label>
              <textarea
                rows={2}
                placeholder="e.g. High side 310 PSI, Low side 118 PSI. Delta T: 20°F. System running smoothly."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                Service Charge ($)
              </label>
              <input
                type="number"
                step="1"
                placeholder="e.g. 185"
                value={cost}
                onChange={(e) => setCost(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Next Due Date Auto-Calculation Card */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                  Next Maintenance Schedule
                </p>
                <p className="text-xs text-blue-700 mt-0.5">
                  Automatically set to <b>{selectedUnit ? `${selectedUnit.maintenanceIntervalMonths} months` : 'N/A'}</b> after this service date.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Next Due Date:</span>
                <span className="text-sm font-bold text-blue-900">
                  {customNextDueDate ? formatDate(customNextDueDate) : formatDate(calculatedNextDue)}
                </span>
              </div>
            </div>

            {/* Optional Custom Due Date */}
            <div className="mt-3 pt-3 border-t border-blue-200/60 flex items-center gap-2">
              <label className="text-xs text-blue-800 whitespace-nowrap">Override next due date:</label>
              <input
                type="date"
                value={customNextDueDate}
                onChange={(e) => setCustomNextDueDate(e.target.value)}
                className="px-2.5 py-1 text-xs border border-blue-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {customNextDueDate && (
                <button
                  type="button"
                  onClick={() => setCustomNextDueDate('')}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Reset to Auto
                </button>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition flex items-center gap-2 disabled:opacity-60"
            >
              <Wrench className="w-4 h-4" />
              <span>{submitting ? 'Recording...' : 'Save & Update Schedule'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

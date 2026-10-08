import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  COMMON_AC_TASKS_EN, 
  COMMON_AC_TASKS_ES, 
  calculateNextDueDate, 
  formatDate 
} from '../utils/maintenance';
import { X, Calendar, Wrench, Plus, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  preselectedUnitId?: string;
}

export const LogServiceModal: React.FC<Props> = ({ isOpen, onClose, preselectedUnitId }) => {
  const { units, recordMaintenance } = useData();
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const commonTasks = language === 'es' ? COMMON_AC_TASKS_ES : COMMON_AC_TASKS_EN;
  const todayStr = new Date().toISOString().split('T')[0];

  const [unitId, setUnitId] = useState(preselectedUnitId || '');
  const [date, setDate] = useState(todayStr);
  const [technicianName, setTechnicianName] = useState(user?.displayName || 'Alex Carter');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [customTask, setCustomTask] = useState('');
  const [refrigerantAddedOz, setRefrigerantAddedOz] = useState<number | ''>('');
  const [partsReplaced, setPartsReplaced] = useState('');
  const [notes, setNotes] = useState('');
  const [cost, setCost] = useState<number | ''>('');
  const [customNextDueDate, setCustomNextDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setSelectedTasks([commonTasks[0], commonTasks[2], commonTasks[3]]);
  }, [language]);

  useEffect(() => {
    if (preselectedUnitId) {
      setUnitId(preselectedUnitId);
    } else if (units.length > 0 && !unitId) {
      setUnitId(units[0].id);
    }
  }, [preselectedUnitId, units, unitId]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-xl max-w-xl w-full shadow-lg border border-zinc-200 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">{t('logModalTitle')}</h2>
            <p className="text-xs text-zinc-500 mt-0.5">{t('logModalSubtitle')}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          
          {/* Unit Selector */}
          <div>
            <label className="block font-medium text-zinc-700 mb-1">
              {t('selectServicedUnit')}
            </label>
            <select
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-500 bg-white"
              required
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.clientName} — {u.locationInBuilding} ({u.brand})
                </option>
              ))}
            </select>
          </div>

          {/* Date & Technician Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-zinc-500" />
                {t('serviceDate')}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-500"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                {t('technicianName')}
              </label>
              <input
                type="text"
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                placeholder={t('technicianName')}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-500"
                required
              />
            </div>
          </div>

          {/* Checklist */}
          <div>
            <label className="block font-medium text-zinc-700 mb-1.5">
              {t('tasksCompletedTitle')}
            </label>
            <div className="space-y-1.5 max-h-44 overflow-y-auto p-2 bg-zinc-50 border border-zinc-200 rounded-lg">
              {commonTasks.map((task) => {
                const isChecked = selectedTasks.includes(task);
                return (
                  <button
                    key={task}
                    type="button"
                    onClick={() => toggleTask(task)}
                    className={`w-full flex items-center text-left p-1.5 rounded transition ${
                      isChecked
                        ? 'bg-zinc-200 text-zinc-900 font-medium'
                        : 'text-zinc-600 hover:bg-zinc-100'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded mr-2 flex items-center justify-center shrink-0 border ${
                      isChecked ? 'bg-zinc-900 border-zinc-900 text-white' : 'border-zinc-300 bg-white'
                    }`}>
                      {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span>{task}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Task Add */}
            <div className="mt-1.5 flex gap-2">
              <input
                type="text"
                placeholder={t('addCustomTaskPlaceholder')}
                value={customTask}
                onChange={(e) => setCustomTask(e.target.value)}
                className="flex-1 px-2.5 py-1 text-xs border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-500"
              />
              <button
                type="button"
                onClick={addCustomTask}
                className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium rounded-lg border border-zinc-200 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> {t('btnAdd')}
              </button>
            </div>
          </div>

          {/* Parts Replaced & Refrigerant */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                {t('refrigerantAddedOz')}
              </label>
              <input
                type="number"
                step="0.5"
                placeholder="0"
                value={refrigerantAddedOz}
                onChange={(e) => setRefrigerantAddedOz(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-500"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                {t('partsReplacedLabel')}
              </label>
              <input
                type="text"
                placeholder={t('partsReplacedPlaceholder')}
                value={partsReplaced}
                onChange={(e) => setPartsReplaced(e.target.value)}
                className="w-full px-3 py-1.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          {/* Notes & Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-medium text-zinc-700 mb-1">
                {t('observationsLabel')}
              </label>
              <textarea
                rows={2}
                placeholder={t('observationsPlaceholder')}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-1.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-500"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                {t('serviceChargeLabel')}
              </label>
              <input
                type="number"
                step="1"
                placeholder="0"
                value={cost}
                onChange={(e) => setCost(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          {/* Next Schedule Preview */}
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-zinc-900 block">{t('nextScheduledTitle')}</span>
                <span className="text-zinc-500 text-[11px]">
                  {selectedUnit ? t('basedOnIntervalDesc', { x: selectedUnit.maintenanceIntervalMonths }) : ''}
                </span>
              </div>
              <span className="font-semibold text-zinc-900">
                {customNextDueDate ? formatDate(customNextDueDate, language) : formatDate(calculatedNextDue, language)}
              </span>
            </div>

            <div className="mt-2 pt-2 border-t border-zinc-200 flex items-center gap-2">
              <span className="text-zinc-500 text-[11px]">{t('overrideDate')}</span>
              <input
                type="date"
                value={customNextDueDate}
                onChange={(e) => setCustomNextDueDate(e.target.value)}
                className="px-2 py-0.5 border border-zinc-300 rounded bg-white text-zinc-800"
              />
              {customNextDueDate && (
                <button
                  type="button"
                  onClick={() => setCustomNextDueDate('')}
                  className="text-zinc-500 hover:text-zinc-800 underline text-[11px]"
                >
                  {t('btnReset')}
                </button>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 font-medium"
            >
              {t('btnCancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-medium transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>{submitting ? t('btnSaving') : t('btnSaveRecord')}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

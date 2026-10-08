import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import type { ACUnit } from '../types';
import { POPULAR_BRANDS, REFRIGERANT_TYPES } from '../utils/maintenance';
import { X, Calendar, Plus } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  unitToEdit?: ACUnit | null;
  onOpenClientModal?: () => void;
}

export const UnitModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  unitToEdit, 
  onOpenClientModal 
}) => {
  const { clients, addUnit, updateUnit } = useData();
  const { t } = useLanguage();

  const todayStr = new Date().toISOString().split('T')[0];

  const [clientId, setClientId] = useState('');
  const [locationInBuilding, setLocationInBuilding] = useState('');
  const [brand, setBrand] = useState('Daikin');
  const [customBrand, setCustomBrand] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [refrigerantType, setRefrigerantType] = useState('R-410A');
  const [coolingCapacity, setCoolingCapacity] = useState('24,000 BTU (2 Ton)');
  const [installationDate, setInstallationDate] = useState(todayStr);
  const [maintenanceIntervalMonths, setMaintenanceIntervalMonths] = useState(6);
  const [lastServiceDate, setLastServiceDate] = useState(todayStr);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (unitToEdit) {
      setClientId(unitToEdit.clientId);
      setLocationInBuilding(unitToEdit.locationInBuilding);
      if (POPULAR_BRANDS.includes(unitToEdit.brand)) {
        setBrand(unitToEdit.brand);
        setCustomBrand('');
      } else {
        setBrand('Other');
        setCustomBrand(unitToEdit.brand);
      }
      setModelNumber(unitToEdit.modelNumber);
      setSerialNumber(unitToEdit.serialNumber);
      setRefrigerantType(unitToEdit.refrigerantType);
      setCoolingCapacity(unitToEdit.coolingCapacity || '');
      setInstallationDate(unitToEdit.installationDate);
      setMaintenanceIntervalMonths(unitToEdit.maintenanceIntervalMonths);
      setLastServiceDate(unitToEdit.lastServiceDate);
      setNotes(unitToEdit.notes || '');
    } else {
      if (clients.length > 0 && !clientId) {
        setClientId(clients[0].id);
      }
      setLocationInBuilding('');
      setBrand('Daikin');
      setCustomBrand('');
      setModelNumber('');
      setSerialNumber('');
      setRefrigerantType('R-410A');
      setCoolingCapacity('24,000 BTU (2 Ton)');
      setInstallationDate(todayStr);
      setMaintenanceIntervalMonths(6);
      setLastServiceDate(todayStr);
      setNotes('');
    }
  }, [unitToEdit, clients, isOpen, clientId, todayStr]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      alert(t('noClientsFound'));
      return;
    }

    const selectedClient = clients.find(c => c.id === clientId);
    const resolvedBrand = brand === 'Other' && customBrand.trim() ? customBrand.trim() : brand;

    try {
      setSubmitting(true);
      if (unitToEdit) {
        await updateUnit(unitToEdit.id, {
          clientId,
          clientName: selectedClient?.name || unitToEdit.clientName,
          locationInBuilding: locationInBuilding.trim(),
          brand: resolvedBrand,
          modelNumber: modelNumber.trim(),
          serialNumber: serialNumber.trim(),
          refrigerantType,
          coolingCapacity: coolingCapacity.trim(),
          installationDate,
          maintenanceIntervalMonths: Number(maintenanceIntervalMonths),
          lastServiceDate,
          notes: notes.trim()
        });
      } else {
        await addUnit({
          clientId,
          clientName: selectedClient?.name || 'Unknown Client',
          locationInBuilding: locationInBuilding.trim(),
          brand: resolvedBrand,
          modelNumber: modelNumber.trim(),
          serialNumber: serialNumber.trim(),
          refrigerantType,
          coolingCapacity: coolingCapacity.trim(),
          installationDate,
          maintenanceIntervalMonths: Number(maintenanceIntervalMonths),
          lastServiceDate,
          notes: notes.trim()
        });
      }
      onClose();
    } catch (err) {
      console.error('Failed to save AC unit:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-lg border border-zinc-200 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              {unitToEdit ? t('unitModalTitleEdit') : t('unitModalTitleAdd')}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">{t('unitModalSubtitle')}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 overflow-y-auto flex-1 text-xs">
          
          {/* Client Selection */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-medium text-zinc-700">{t('clientAccount')}</label>
              {onOpenClientModal && (
                <button
                  type="button"
                  onClick={onOpenClientModal}
                  className="text-zinc-600 hover:text-zinc-900 font-medium flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> {t('btnNewClient')}
                </button>
              )}
            </div>
            {clients.length === 0 ? (
              <div className="p-2.5 bg-zinc-50 border border-zinc-200 text-zinc-600 rounded-lg">
                {t('noClientsFound')}
              </div>
            ) : (
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-1.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-500 bg-white"
                required
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.address}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Unit Location in Building */}
          <div>
            <label className="block font-medium text-zinc-700 mb-1">
              {t('unitLocationRoom')}
            </label>
            <input
              type="text"
              placeholder="e.g. Master Bedroom, Server Room 1"
              value={locationInBuilding}
              onChange={(e) => setLocationInBuilding(e.target.value)}
              className="w-full px-3 py-1.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-500"
              required
            />
          </div>

          {/* Brand & Custom Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">{t('brand')}</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-1.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-500 bg-white"
              >
                {POPULAR_BRANDS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            {brand === 'Other' ? (
              <div>
                <label className="block font-medium text-zinc-700 mb-1">{t('customBrand')}</label>
                <input
                  type="text"
                  placeholder="Brand name"
                  value={customBrand}
                  onChange={(e) => setCustomBrand(e.target.value)}
                  className="w-full px-3 py-1.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-500"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block font-medium text-zinc-700 mb-1">{t('refrigerant')}</label>
                <select
                  value={refrigerantType}
                  onChange={(e) => setRefrigerantType(e.target.value)}
                  className="w-full px-3 py-1.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-500 bg-white"
                >
                  {REFRIGERANT_TYPES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Model & Serial Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">{t('modelNumber')}</label>
              <input
                type="text"
                placeholder="Model #"
                value={modelNumber}
                onChange={(e) => setModelNumber(e.target.value)}
                className="w-full px-3 py-1.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-500"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-700 mb-1">{t('serialNumber')}</label>
              <input
                type="text"
                placeholder="Serial #"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full px-3 py-1.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          {/* Capacity & Interval */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">{t('coolingCapacity')}</label>
              <input
                type="text"
                placeholder="e.g. 24,000 BTU / 2 Ton"
                value={coolingCapacity}
                onChange={(e) => setCoolingCapacity(e.target.value)}
                className="w-full px-3 py-1.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-500"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                {t('maintenanceFrequency')}
              </label>
              <select
                value={maintenanceIntervalMonths}
                onChange={(e) => setMaintenanceIntervalMonths(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-500 bg-white"
              >
                <option value={1}>{t('freq1Mo')}</option>
                <option value={3}>{t('freq3Mo')}</option>
                <option value={6}>{t('freq6Mo')}</option>
                <option value={12}>{t('freq12Mo')}</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-zinc-500" />
                {t('lastServiceDate')}
              </label>
              <input
                type="date"
                value={lastServiceDate}
                onChange={(e) => setLastServiceDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-500"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-700 mb-1">{t('installationDate')}</label>
              <input
                type="date"
                value={installationDate}
                onChange={(e) => setInstallationDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-medium text-zinc-700 mb-1">{t('notesLabel')}</label>
            <textarea
              rows={2}
              placeholder="Filter size, rooftop access notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-500"
            />
          </div>

          {/* Actions */}
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
              className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-medium transition disabled:opacity-50"
            >
              {submitting ? t('btnSaving') : unitToEdit ? t('btnSaveChanges') : t('btnRegisterUnit')}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

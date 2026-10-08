import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { ACUnit } from '../types';
import { POPULAR_BRANDS, REFRIGERANT_TYPES } from '../utils/maintenance';
import { X, Cpu, Calendar, Building, Plus } from 'lucide-react';

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
  }, [unitToEdit, clients, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      alert('Please select or add a client first.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-100 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2 text-cyan-400 mb-1">
            <Cpu className="w-5 h-5" />
            <span className="text-xs uppercase font-bold tracking-wider">
              {unitToEdit ? 'Edit Equipment' : 'Register New AC Unit'}
            </span>
          </div>
          <h2 className="text-xl font-bold">
            {unitToEdit ? 'Update Air Conditioner Unit' : 'Add Air Conditioner Unit'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Configure unit location, specs, and maintenance recurrence schedule.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Client Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-600" />
                Customer / Location Account *
              </label>
              {onOpenClientModal && (
                <button
                  type="button"
                  onClick={onOpenClientModal}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> New Client
                </button>
              )}
            </div>
            {clients.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg">
                No clients found. Please create a client first.
              </div>
            ) : (
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Unit Room / Location in Building *
            </label>
            <input
              type="text"
              placeholder="e.g. Master Bedroom, Server Room 1, Rooftop Compressor #2"
              value={locationInBuilding}
              onChange={(e) => setLocationInBuilding(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          {/* Brand & Custom Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Brand *</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {POPULAR_BRANDS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            {brand === 'Other' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Custom Brand Name</label>
                <input
                  type="text"
                  placeholder="Enter brand name"
                  value={customBrand}
                  onChange={(e) => setCustomBrand(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Refrigerant Type</label>
              <select
                value={refrigerantType}
                onChange={(e) => setRefrigerantType(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {REFRIGERANT_TYPES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Model & Serial Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Model Number *</label>
              <input
                type="text"
                placeholder="e.g. VRV-IV-48, 50TCQ006"
                value={modelNumber}
                onChange={(e) => setModelNumber(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Serial Number</label>
              <input
                type="text"
                placeholder="e.g. SN-8921734"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Capacity & Interval */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cooling Capacity</label>
              <input
                type="text"
                placeholder="e.g. 24,000 BTU / 2 Ton"
                value={coolingCapacity}
                onChange={(e) => setCoolingCapacity(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Maintenance Frequency *
              </label>
              <select
                value={maintenanceIntervalMonths}
                onChange={(e) => setMaintenanceIntervalMonths(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-blue-700"
              >
                <option value={1}>Every 1 Month (Heavy Commercial)</option>
                <option value={3}>Every 3 Months (Quarterly - Server / Medical)</option>
                <option value={6}>Every 6 Months (Semi-annual - Standard)</option>
                <option value={12}>Every 12 Months (Annual - Light Residential)</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Last Service Date *
              </label>
              <input
                type="date"
                value={lastServiceDate}
                onChange={(e) => setLastServiceDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Installation Date</label>
              <input
                type="date"
                value={installationDate}
                onChange={(e) => setInstallationDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes & Filter Sizes</label>
            <textarea
              rows={2}
              placeholder="e.g. Filter size: 16x25x1. Unit mounted on anti-vibration roof curbs."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
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
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition disabled:opacity-60"
            >
              {submitting ? 'Saving...' : unitToEdit ? 'Save Changes' : 'Register Unit'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import type { Client } from '../types';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clientToEdit?: Client | null;
}

export const ClientModal: React.FC<Props> = ({ isOpen, onClose, clientToEdit }) => {
  const { addClient, updateClient } = useData();
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (clientToEdit) {
      setName(clientToEdit.name);
      setPhone(clientToEdit.phone);
      setEmail(clientToEdit.email);
      setAddress(clientToEdit.address);
      setNotes(clientToEdit.notes || '');
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setNotes('');
    }
  }, [clientToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (clientToEdit) {
        await updateClient(clientToEdit.id, {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
          notes: notes.trim()
        });
      } else {
        await addClient({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
          notes: notes.trim()
        });
      }
      onClose();
    } catch (err) {
      console.error('Failed to save client:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-xl max-w-md w-full shadow-lg border border-zinc-200">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              {clientToEdit ? t('clientModalTitleEdit') : t('clientModalTitleAdd')}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">{t('clientModalSubtitle')}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-zinc-700 mb-1">
              {t('clientName')}
            </label>
            <input
              type="text"
              placeholder="e.g. John Doe or Acme Corp"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-1.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                {t('phoneNumber')}
              </label>
              <input
                type="tel"
                placeholder="(555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-1.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-500"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                {t('emailAddress')}
              </label>
              <input
                type="email"
                placeholder="client@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-1.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-zinc-700 mb-1">
              {t('serviceAddress')}
            </label>
            <input
              type="text"
              placeholder="123 Main St, Suite 100"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-1.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-500"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-700 mb-1">
              {t('accessNotes')}
            </label>
            <textarea
              rows={2}
              placeholder="Gate code, rooftop access..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-500"
            />
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
              className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-medium transition disabled:opacity-50"
            >
              {submitting ? t('btnSaving') : clientToEdit ? t('btnSaveChanges') : t('btnCreateClient')}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

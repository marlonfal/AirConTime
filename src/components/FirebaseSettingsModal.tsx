import React, { useState } from 'react';
import { 
  getStoredFirebaseConfig, 
  saveStoredFirebaseConfig, 
  clearStoredFirebaseConfig 
} from '../firebase';
import { useLanguage } from '../context/LanguageContext';
import type { FirebaseConfig } from '../types';
import { X, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseSettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const currentConfig = getStoredFirebaseConfig();
  const { language, t } = useLanguage();

  const [config, setConfig] = useState<FirebaseConfig>({
    apiKey: currentConfig?.apiKey || '',
    authDomain: currentConfig?.authDomain || '',
    projectId: currentConfig?.projectId || '',
    storageBucket: currentConfig?.storageBucket || '',
    messagingSenderId: currentConfig?.messagingSenderId || '',
    appId: currentConfig?.appId || '',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredFirebaseConfig(config);
    setSavedSuccess(true);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleClear = () => {
    const confirmMsg = language === 'es'
      ? '¿Cambiar al modo de almacenamiento local demo? Se eliminarán las claves de Firebase guardadas en este navegador.'
      : 'Switch back to local demo storage? Stored Firebase keys will be removed from this browser.';
    if (confirm(confirmMsg)) {
      clearStoredFirebaseConfig();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-xl max-w-md w-full shadow-lg border border-zinc-200 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">{t('firebaseSettingsTitle')}</h2>
            <p className="text-xs text-zinc-500 mt-0.5">{t('firebaseSettingsSubtitle')}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-5 space-y-3.5 overflow-y-auto flex-1 text-xs">

          {savedSuccess && (
            <div className="p-2.5 bg-zinc-100 border border-zinc-300 text-zinc-900 rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4 text-zinc-700" />
              <span>{t('firebaseKeysSaved')}</span>
            </div>
          )}

          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-zinc-600">
            <p className="font-medium text-zinc-800">{t('firebaseHelp')}</p>
            <p className="mt-0.5">{t('firebaseHelpDesc')}</p>
          </div>

          <div>
            <label className="block font-medium text-zinc-700 mb-1">API Key</label>
            <input
              type="text"
              placeholder="AIzaSy..."
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value.trim() })}
              className="w-full px-3 py-1.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Project ID</label>
              <input
                type="text"
                placeholder="project-id"
                value={config.projectId}
                onChange={(e) => setConfig({ ...config, projectId: e.target.value.trim() })}
                className="w-full px-3 py-1.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-500"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Auth Domain</label>
              <input
                type="text"
                placeholder="project.firebaseapp.com"
                value={config.authDomain}
                onChange={(e) => setConfig({ ...config, authDomain: e.target.value.trim() })}
                className="w-full px-3 py-1.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Storage Bucket</label>
              <input
                type="text"
                placeholder="project.appspot.com"
                value={config.storageBucket}
                onChange={(e) => setConfig({ ...config, storageBucket: e.target.value.trim() })}
                className="w-full px-3 py-1.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-500"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Sender ID</label>
              <input
                type="text"
                placeholder="12345678"
                value={config.messagingSenderId}
                onChange={(e) => setConfig({ ...config, messagingSenderId: e.target.value.trim() })}
                className="w-full px-3 py-1.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-zinc-700 mb-1">App ID</label>
            <input
              type="text"
              placeholder="1:123456:web:abcdef"
              value={config.appId}
              onChange={(e) => setConfig({ ...config, appId: e.target.value.trim() })}
              className="w-full px-3 py-1.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleClear}
              className="text-zinc-500 hover:text-red-600 font-medium"
            >
              {t('btnResetDemo')}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 font-medium"
              >
                {t('btnCancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-medium transition"
              >
                {t('btnSaveKeys')}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};

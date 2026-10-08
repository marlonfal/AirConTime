import React, { useState } from 'react';
import { 
  getStoredFirebaseConfig, 
  saveStoredFirebaseConfig, 
  clearStoredFirebaseConfig 
} from '../firebase';
import { FirebaseConfig } from '../types';
import { X, Database, Check, AlertCircle, RefreshCw, KeyRound } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseSettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const currentConfig = getStoredFirebaseConfig();
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
    if (confirm('Switch back to local demo storage? Stored Firebase keys will be removed from this browser.')) {
      clearStoredFirebaseConfig();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2 text-cyan-400 mb-1">
            <Database className="w-5 h-5" />
            <span className="text-xs uppercase font-bold tracking-wider">Database & Auth Settings</span>
          </div>
          <h2 className="text-xl font-bold">Connect Firebase Project</h2>
          <p className="text-xs text-slate-300 mt-1">
            Connect your Firebase Cloud Firestore and Authentication for real-time cloud syncing across devices.
          </p>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1">

          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Firebase credentials saved! Reloading application...</span>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex items-start gap-2.5">
            <KeyRound className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Where to get your Firebase configuration?</p>
              <p className="text-blue-700 mt-0.5 leading-relaxed">
                Go to <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="underline font-medium">console.firebase.google.com</a> &gt; <b>Project Settings</b> &gt; <b>General</b> &gt; <b>Your apps (Web App)</b>, and copy the config object values.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">API Key</label>
            <input
              type="text"
              placeholder="AIzaSy..."
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value.trim() })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Project ID</label>
              <input
                type="text"
                placeholder="my-ac-tracker"
                value={config.projectId}
                onChange={(e) => setConfig({ ...config, projectId: e.target.value.trim() })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Auth Domain</label>
              <input
                type="text"
                placeholder="my-ac-tracker.firebaseapp.com"
                value={config.authDomain}
                onChange={(e) => setConfig({ ...config, authDomain: e.target.value.trim() })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Storage Bucket</label>
              <input
                type="text"
                placeholder="my-ac-tracker.firebasestorage.app"
                value={config.storageBucket}
                onChange={(e) => setConfig({ ...config, storageBucket: e.target.value.trim() })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Messaging Sender ID</label>
              <input
                type="text"
                placeholder="1092837465"
                value={config.messagingSenderId}
                onChange={(e) => setConfig({ ...config, messagingSenderId: e.target.value.trim() })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">App ID</label>
            <input
              type="text"
              placeholder="1:1092837465:web:abcdef123"
              value={config.appId}
              onChange={(e) => setConfig({ ...config, appId: e.target.value.trim() })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-red-600 hover:text-red-700 font-medium"
            >
              Reset to Local Demo
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Save & Connect</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};

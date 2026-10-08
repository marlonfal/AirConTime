import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { X, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export const LoginModal: React.FC<Props> = ({ isOpen, onClose, onOpenSettings }) => {
  const { 
    signInWithGoogle, 
    signInWithFacebook, 
    signInAsDemo, 
    authError, 
    clearAuthError,
    hasFirebaseConfig 
  } = useAuth();
  const { t } = useLanguage();

  const [loadingProvider, setLoadingProvider] = useState<'google' | 'facebook' | null>(null);

  if (!isOpen) return null;

  const handleGoogle = async () => {
    try {
      setLoadingProvider('google');
      await signInWithGoogle();
      onClose();
    } catch {
      // Handled in auth context
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleFacebook = async () => {
    try {
      setLoadingProvider('facebook');
      await signInWithFacebook();
      onClose();
    } catch {
      // Handled in auth context
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleDemo = () => {
    signInAsDemo();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-xl max-w-sm w-full shadow-lg border border-zinc-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">{t('loginTitle')}</h2>
            <p className="text-xs text-zinc-500 mt-0.5">{t('loginSubtitle')}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3 text-xs">

          {!hasFirebaseConfig && (
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-zinc-900">{t('firebaseNotConnected')}</p>
                <p className="text-zinc-500 mt-0.5">{t('firebaseNotConnectedDesc')}</p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSettings();
                  }}
                  className="mt-1 text-zinc-800 underline font-medium block"
                >
                  {t('configureFirebaseLink')}
                </button>
              </div>
            </div>
          )}

          {authError && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span className="flex-1">{authError}</span>
              <button onClick={clearAuthError} className="text-red-400 hover:text-red-600">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Google Sign In */}
          <button
            onClick={handleGoogle}
            disabled={loadingProvider !== null}
            className="w-full flex items-center justify-center gap-2.5 px-3 py-2 rounded-lg border border-zinc-300 hover:bg-zinc-50 text-zinc-700 font-medium transition disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{loadingProvider === 'google' ? 'Connecting...' : t('continueGoogle')}</span>
          </button>

          {/* Facebook Sign In */}
          <button
            onClick={handleFacebook}
            disabled={loadingProvider !== null}
            className="w-full flex items-center justify-center gap-2.5 px-3 py-2 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white font-medium transition disabled:opacity-50"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>{loadingProvider === 'facebook' ? 'Connecting...' : t('continueFacebook')}</span>
          </button>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white px-2 text-zinc-400">{t('or')}</span>
            </div>
          </div>

          {/* Demo Button */}
          <button
            onClick={handleDemo}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-medium transition border border-zinc-200"
          >
            <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
            <span>{t('continueDemo')}</span>
          </button>

        </div>

      </div>
    </div>
  );
};

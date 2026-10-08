import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, ShieldAlert, Sparkles, Wrench, AlertCircle } from 'lucide-react';

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

  const [loadingProvider, setLoadingProvider] = useState<'google' | 'facebook' | null>(null);

  if (!isOpen) return null;

  const handleGoogle = async () => {
    try {
      setLoadingProvider('google');
      await signInWithGoogle();
      onClose();
    } catch (e) {
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
    } catch (e) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center mb-3">
            <Wrench className="w-6 h-6 text-cyan-400" />
          </div>
          <h2 className="text-xl font-bold">Technician Sign In</h2>
          <p className="text-sm text-slate-300 mt-1">
            Access your air conditioner maintenance schedule and service logs
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">

          {/* Config Warning if Firebase is not yet hooked up */}
          {!hasFirebaseConfig && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Firebase Project Not Connected Yet</p>
                <p className="text-amber-700 mt-0.5">
                  To use live Google or Facebook authentication, connect your Firebase keys. You can also click <b>Demo Mode</b> below to test immediately!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSettings();
                  }}
                  className="mt-2 inline-flex items-center text-xs font-semibold text-blue-700 hover:text-blue-900 underline"
                >
                  Configure Firebase Credentials →
                </button>
              </div>
            </div>
          )}

          {/* Auth Error Banner */}
          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-start space-x-2">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-medium">{authError}</span>
              </div>
              <button onClick={clearAuthError} className="text-red-500 hover:text-red-700">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogle}
            disabled={loadingProvider !== null}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm transition shadow-sm active:scale-[0.99] disabled:opacity-60"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            <span>{loadingProvider === 'google' ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>

          {/* Facebook Sign In Button */}
          <button
            onClick={handleFacebook}
            disabled={loadingProvider !== null}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-medium text-sm transition shadow-sm active:scale-[0.99] disabled:opacity-60"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>{loadingProvider === 'facebook' ? 'Connecting to Facebook...' : 'Continue with Facebook'}</span>
          </button>

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-semibold tracking-wider">or instant testing</span>
            </div>
          </div>

          {/* Demo Mode Button */}
          <button
            onClick={handleDemo}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-sm transition active:scale-[0.99] border border-slate-200"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Enter as Demo AC Technician</span>
          </button>

          <p className="text-[11px] text-center text-slate-400">
            Secure login for HVAC maintenance staff. Works on smartphone, tablet, and desktop.
          </p>
        </div>

      </div>
    </div>
  );
};

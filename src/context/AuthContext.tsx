import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth, googleProvider, facebookProvider, getStoredFirebaseConfig } from '../firebase';
import type { AppUser } from '../types';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  hasFirebaseConfig: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInAsDemo: () => void;
  logout: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_STORAGE_KEY = 'aircon_demo_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const hasFirebaseConfig = Boolean(getStoredFirebaseConfig()?.apiKey);

  useEffect(() => {
    // 1. If Firebase Auth is initialized, listen to onAuthStateChanged
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          const providerId = fbUser.providerData[0]?.providerId;
          const provider: 'google' | 'facebook' | 'demo' = 
            providerId === 'facebook.com' ? 'facebook' : 'google';
            
          setUser({
            uid: fbUser.uid,
            displayName: fbUser.displayName || 'Technician',
            email: fbUser.email,
            photoURL: fbUser.photoURL,
            provider
          });
        } else {
          // Check if demo user is stored
          const savedDemo = localStorage.getItem(DEMO_USER_STORAGE_KEY);
          if (savedDemo) {
            setUser(JSON.parse(savedDemo));
          } else {
            setUser(null);
          }
        }
        setLoading(false);
      }, (error) => {
        console.error('Auth state change error:', error);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Offline / Local Demo mode
      const savedDemo = localStorage.getItem(DEMO_USER_STORAGE_KEY);
      if (savedDemo) {
        setUser(JSON.parse(savedDemo));
      }
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    if (!auth) {
      setAuthError('Firebase is not configured yet. Please configure your Firebase project credentials in Settings or continue in Demo Mode.');
      return;
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser({
        uid: result.user.uid,
        displayName: result.user.displayName || 'Google Technician',
        email: result.user.email,
        photoURL: result.user.photoURL,
        provider: 'google'
      });
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      let message = err.message || 'Google sign-in failed.';
      if (err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed') {
        message = 'Google sign-in is not enabled in your Firebase Console (Authentication > Sign-in method).';
      } else if (err.code === 'auth/unauthorized-domain') {
        message = 'This localhost domain is not authorized in your Firebase Console (Authentication > Settings > Authorized Domains).';
      }
      setAuthError(message);
      throw err;
    }
  };

  const signInWithFacebook = async () => {
    setAuthError(null);
    if (!auth) {
      setAuthError('Firebase is not configured yet. Please configure your Firebase project credentials in Settings or continue in Demo Mode.');
      return;
    }
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      setUser({
        uid: result.user.uid,
        displayName: result.user.displayName || 'Facebook Technician',
        email: result.user.email,
        photoURL: result.user.photoURL,
        provider: 'facebook'
      });
    } catch (err: any) {
      console.error('Facebook Sign In Error:', err);
      let message = err.message || 'Facebook sign-in failed.';
      if (err.code === 'auth/operation-not-allowed') {
        message = 'Facebook sign-in is not enabled in your Firebase Console (Authentication > Sign-in method).';
      }
      setAuthError(message);
      throw err;
    }
  };

  const signInAsDemo = () => {
    const demoUser: AppUser = {
      uid: 'demo-tech-001',
      displayName: 'Alex Carter (AC Tech)',
      email: 'alex.hvac.tech@example.com',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      provider: 'demo'
    };
    localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(demoUser));
    setUser(demoUser);
  };

  const logout = async () => {
    if (auth) {
      try {
        await fbSignOut(auth);
      } catch (err) {
        console.error('Firebase sign out error:', err);
      }
    }
    localStorage.removeItem(DEMO_USER_STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        hasFirebaseConfig,
        signInWithGoogle,
        signInWithFacebook,
        signInAsDemo,
        logout,
        authError,
        clearAuthError: () => setAuthError(null)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


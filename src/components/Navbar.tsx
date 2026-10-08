import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Wind, 
  Database, 
  Settings, 
  LogOut, 
  LogIn, 
  Users, 
  History, 
  LayoutDashboard,
  Globe
} from 'lucide-react';

interface Props {
  activeTab: 'dashboard' | 'clients' | 'history';
  setActiveTab: (tab: 'dashboard' | 'clients' | 'history') => void;
  openSettings: () => void;
  openLogin: () => void;
}

export const Navbar: React.FC<Props> = ({ 
  activeTab, 
  setActiveTab, 
  openSettings, 
  openLogin 
}) => {
  const { user, logout } = useAuth();
  const { isFirebaseConnected } = useData();
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="bg-white text-zinc-900 border-b border-zinc-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white">
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-sm tracking-tight text-zinc-900">{t('appName')}</span>
              <span className="text-zinc-400 text-xs ml-2 hidden sm:inline">{t('appSubtitle')}</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                activeTab === 'dashboard'
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>{t('navUnits')}</span>
            </button>

            <button
              onClick={() => setActiveTab('clients')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                activeTab === 'clients'
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{t('navClients')}</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                activeTab === 'history'
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>{t('navHistory')}</span>
            </button>
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            
            {/* Language Switcher */}
            <div className="flex items-center border border-zinc-200 rounded-md p-0.5 bg-zinc-50 text-[11px] font-semibold">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded transition ${
                  language === 'en' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'
                }`}
                title="Switch to English"
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('es')}
                className={`px-2 py-0.5 rounded transition ${
                  language === 'es' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'
                }`}
                title="Cambiar a Español"
              >
                ES
              </button>
            </div>

            {/* Database indicator */}
            <button
              onClick={openSettings}
              title="Firebase Settings"
              className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-zinc-600 border border-zinc-200 hover:bg-zinc-50 transition"
            >
              <Database className="w-3 h-3 text-zinc-500" />
              <span>{isFirebaseConnected ? t('firebaseLive') : t('demoLocal')}</span>
            </button>

            {/* Config button */}
            <button
              onClick={openSettings}
              className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition"
              title="Firebase Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Auth section */}
            {user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-zinc-200">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-7 h-7 rounded-full border border-zinc-300 object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-semibold text-zinc-700">
                    {(user.displayName || 'T')[0]}
                  </div>
                )}
                <span className="hidden xl:inline text-xs font-medium text-zinc-700 max-w-[100px] truncate">
                  {user.displayName}
                </span>
                <button
                  onClick={() => logout()}
                  title={t('signOut')}
                  className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={openLogin}
                className="flex items-center space-x-1.5 bg-zinc-900 hover:bg-zinc-800 text-white px-3 py-1.5 rounded-md text-xs font-medium transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t('signIn')}</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

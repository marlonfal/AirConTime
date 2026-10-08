import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { 
  Wind, 
  Database, 
  Settings, 
  LogOut, 
  LogIn, 
  Users, 
  History, 
  LayoutDashboard,
  ShieldCheck
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

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Wind className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-lg tracking-tight text-white">AirConTime</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700/50">
                  Tech Pro
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">HVAC Maintenance Tracker</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>AC Units</span>
            </button>

            <button
              onClick={() => setActiveTab('clients')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'clients'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Clients</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Service Logs</span>
            </button>
          </nav>

          {/* Right Section: Firebase Status, Settings & User Profile */}
          <div className="flex items-center space-x-3">
            {/* Firebase Status Badge */}
            <button
              onClick={openSettings}
              title="Firebase Settings"
              className={`hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                isFirebaseConnected
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900/60'
                  : 'bg-amber-950/60 text-amber-300 border-amber-700/60 hover:bg-amber-900/60'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isFirebaseConnected ? 'Firebase Live' : 'Demo / Local'}</span>
            </button>

            {/* Config button */}
            <button
              onClick={openSettings}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Configure Firebase Keys"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Auth section */}
            {user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-700">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-cyan-400/50 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-cyan-700 flex items-center justify-center text-xs font-bold text-white uppercase">
                    {(user.displayName || 'Tech')[0]}
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-medium text-white truncate max-w-[120px]">
                    {user.displayName}
                  </div>
                  <div className="text-[10px] text-cyan-400 capitalize flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3 inline" /> {user.provider}
                  </div>
                </div>
                <button
                  onClick={() => logout()}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={openLogin}
                className="flex items-center space-x-1.5 bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-1.5 rounded-lg text-sm font-medium transition shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

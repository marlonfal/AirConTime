import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ClientsView } from './components/ClientsView';
import { ServiceHistoryView } from './components/ServiceHistoryView';
import { LoginModal } from './components/LoginModal';
import { FirebaseSettingsModal } from './components/FirebaseSettingsModal';
import { LogServiceModal } from './components/LogServiceModal';
import { UnitModal } from './components/UnitModal';
import { ClientModal } from './components/ClientModal';
import type { ACUnit, Client } from './types';
import { getMaintenanceStatus } from './utils/maintenance';
import { Wrench } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user } = useAuth();
  const { units, loading } = useData();
  const { language, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'history'>('dashboard');

  // Modal states
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLogServiceOpen, setIsLogServiceOpen] = useState(false);
  const [logServiceUnitId, setLogServiceUnitId] = useState<string | undefined>(undefined);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [unitToEdit, setUnitToEdit] = useState<ACUnit | null>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  const overdueCount = units.filter(u => getMaintenanceStatus(u.nextServiceDueDate, language).status === 'overdue').length;

  const handleOpenLogService = (unitId?: string) => {
    setLogServiceUnitId(unitId);
    setIsLogServiceOpen(true);
  };

  const handleAddUnit = () => {
    setUnitToEdit(null);
    setIsUnitModalOpen(true);
  };

  const handleEditUnit = (unit: ACUnit) => {
    setUnitToEdit(unit);
    setIsUnitModalOpen(true);
  };

  const handleAddClient = () => {
    setClientToEdit(null);
    setIsClientModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setClientToEdit(client);
    setIsClientModalOpen(true);
  };

  const handleAddUnitForClient = (_clientId: string) => {
    setUnitToEdit(null);
    setIsUnitModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center text-zinc-900">
        <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-zinc-500">
          {language === 'es' ? 'Cargando datos de mantenimiento...' : 'Loading maintenance data...'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col text-zinc-900 font-sans">
      
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openSettings={() => setIsSettingsOpen(true)}
        openLogin={() => setIsLoginOpen(true)}
      />

      {/* Subtle Notice Bar for Overdue Units */}
      {overdueCount > 0 && activeTab === 'dashboard' && (
        <div className="bg-zinc-900 text-zinc-100 px-4 py-2 text-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>
                <b>{t('notice')}:</b> {overdueCount}{' '}
                {overdueCount === 1 ? t('overdueWarning') : t('overdueWarningPlural')}
              </span>
            </div>
            <button
              onClick={() => handleOpenLogService()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs font-medium transition"
            >
              <Wrench className="w-3 h-3" />
              <span>{t('logServiceNotice')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {activeTab === 'dashboard' && (
          <DashboardView
            onLogService={handleOpenLogService}
            onAddUnit={handleAddUnit}
            onAddClient={handleAddClient}
            onEditUnit={handleEditUnit}
            onViewLogs={(_unitId) => setActiveTab('history')}
          />
        )}

        {activeTab === 'clients' && (
          <ClientsView
            onAddClient={handleAddClient}
            onEditClient={handleEditClient}
            onSelectUnit={handleEditUnit}
            onAddUnitForClient={handleAddUnitForClient}
          />
        )}

        {activeTab === 'history' && (
          <ServiceHistoryView />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-200 py-4 text-zinc-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{t('appName')} — {t('appSubtitle')}</span>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsLoginOpen(true)} className="hover:text-zinc-900 transition">
              {user ? `${t('loggedInAs')}: ${user.displayName}` : t('signIn')}
            </button>
            <button onClick={() => setIsSettingsOpen(true)} className="hover:text-zinc-900 transition">
              {t('firebaseSettingsTitle')}
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <FirebaseSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <LogServiceModal
        isOpen={isLogServiceOpen}
        onClose={() => {
          setIsLogServiceOpen(false);
          setLogServiceUnitId(undefined);
        }}
        preselectedUnitId={logServiceUnitId}
      />

      <UnitModal
        isOpen={isUnitModalOpen}
        onClose={() => {
          setIsUnitModalOpen(false);
          setUnitToEdit(null);
        }}
        unitToEdit={unitToEdit}
        onOpenClientModal={() => {
          setIsUnitModalOpen(false);
          setIsClientModalOpen(true);
        }}
      />

      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => {
          setIsClientModalOpen(false);
          setClientToEdit(null);
        }}
        clientToEdit={clientToEdit}
      />

    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <DataProvider>
          <MainApp />
        </DataProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

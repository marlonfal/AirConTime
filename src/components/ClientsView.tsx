import React from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import type { Client, ACUnit } from '../types';
import { getMaintenanceStatus, formatDate } from '../utils/maintenance';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Plus, 
  Edit2, 
  Trash2, 
  Wind
} from 'lucide-react';

interface Props {
  onAddClient: () => void;
  onEditClient: (client: Client) => void;
  onSelectUnit: (unit: ACUnit) => void;
  onAddUnitForClient: (clientId: string) => void;
}

export const ClientsView: React.FC<Props> = ({ 
  onAddClient, 
  onEditClient, 
  onSelectUnit,
  onAddUnitForClient 
}) => {
  const { clients, units, deleteClient } = useData();
  const { language, t } = useLanguage();

  return (
    <div className="space-y-4">
      
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">{t('clientsTitle')}</h2>
          <p className="text-xs text-zinc-500">{t('clientsSubtitle')}</p>
        </div>
        <button
          onClick={onAddClient}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-medium transition self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('btnAddClient')}</span>
        </button>
      </div>

      {/* Clients List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {clients.map((client) => {
          const clientUnits = units.filter(u => u.clientId === client.id);
          const overdueCount = clientUnits.filter(u => getMaintenanceStatus(u.nextServiceDueDate, language).status === 'overdue').length;

          return (
            <div key={client.id} className="bg-white rounded-xl border border-zinc-200 p-4 flex flex-col justify-between text-xs">
              <div>
                
                {/* Client Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900">{client.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5 text-zinc-500">
                      <span>{clientUnits.length} {clientUnits.length === 1 ? t('unitSingular') : t('unitPlural')}</span>
                      {overdueCount > 0 && (
                        <span className="text-red-700 font-medium">
                          • {overdueCount} {t('overdueLabel')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditClient(client)}
                      className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded transition"
                      title={t('clientModalTitleEdit')}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        const confirmText = language === 'es'
                          ? `¿Eliminar al cliente "${client.name}" y todos sus equipos asociados?`
                          : `Delete client "${client.name}" and all associated units?`;
                        if (confirm(confirmText)) {
                          deleteClient(client.id);
                        }
                      }}
                      className="p-1 text-zinc-400 hover:text-red-600 hover:bg-zinc-100 rounded transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Contact info */}
                <div className="space-y-1.5 text-zinc-600 mb-3 bg-zinc-50 p-2.5 rounded-lg border border-zinc-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>{client.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <a href={`tel:${client.phone}`} className="hover:text-zinc-900 font-medium">{client.phone}</a>
                  </div>
                  {client.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <a href={`mailto:${client.email}`} className="hover:text-zinc-900">{client.email}</a>
                    </div>
                  )}
                  {client.notes && (
                    <p className="pt-1 border-t border-zinc-200 text-zinc-500">
                      {client.notes}
                    </p>
                  )}
                </div>

                {/* Units List */}
                <div className="mb-3">
                  <div className="flex items-center justify-between font-medium text-zinc-700 mb-1.5">
                    <span>{t('installedUnitsLabel')}</span>
                    <button
                      onClick={() => onAddUnitForClient(client.id)}
                      className="text-zinc-600 hover:text-zinc-900 text-[11px]"
                    >
                      + {t('btnAddUnit')}
                    </button>
                  </div>

                  {clientUnits.length === 0 ? (
                    <p className="text-zinc-400 italic">{t('noUnitsRegistered')}</p>
                  ) : (
                    <div className="space-y-1">
                      {clientUnits.map(unit => {
                        const statusObj = getMaintenanceStatus(unit.nextServiceDueDate, language);
                        return (
                          <div 
                            key={unit.id}
                            onClick={() => onSelectUnit(unit)}
                            className="flex items-center justify-between p-1.5 rounded-lg border border-zinc-200 hover:border-zinc-300 cursor-pointer transition"
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <Wind className="w-3 h-3 text-zinc-400 shrink-0" />
                              <span className="font-medium text-zinc-800 truncate">{unit.locationInBuilding}</span>
                              <span className="text-zinc-400 text-[11px]">({unit.brand})</span>
                            </div>
                            <span className="text-[10px] text-zinc-500">
                              {statusObj.badgeText}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

              {/* Bottom call button */}
              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                <a
                  href={`tel:${client.phone}`}
                  className="text-zinc-700 hover:text-zinc-900 font-medium flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" /> {t('callCustomer')}
                </a>
                <span className="text-zinc-400 text-[11px]">
                  {t('addedOn')} {formatDate(client.createdAt.split('T')[0], language)}
                </span>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

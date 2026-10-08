import React from 'react';
import { useData } from '../context/DataContext';
import { Client, ACUnit } from '../types';
import { getMaintenanceStatus } from '../utils/maintenance';
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Plus, 
  Edit2, 
  Trash2, 
  Wind, 
  AlertTriangle 
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

  return (
    <div className="space-y-6">
      
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Clients & Sites Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage customer contacts, property addresses, and installed air conditioners
          </p>
        </div>
        <button
          onClick={onAddClient}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Client</span>
        </button>
      </div>

      {/* Clients List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {clients.map((client) => {
          const clientUnits = units.filter(u => u.clientId === client.id);
          const overdueCount = clientUnits.filter(u => getMaintenanceStatus(u.nextServiceDueDate).status === 'overdue').length;

          return (
            <div key={client.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
              <div>
                
                {/* Client Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{client.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded">
                        {clientUnits.length} {clientUnits.length === 1 ? 'AC Unit' : 'AC Units'}
                      </span>
                      {overdueCount > 0 && (
                        <span className="text-xs bg-red-100 text-red-800 font-medium px-2 py-0.5 rounded flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-red-600" />
                          {overdueCount} Overdue
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditClient(client)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                      title="Edit Client"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete client "${client.name}" and all associated units?`)) {
                          deleteClient(client.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete Client"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Contact details */}
                <div className="space-y-2 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{client.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <a href={`tel:${client.phone}`} className="hover:text-blue-600 font-medium">{client.phone}</a>
                  </div>
                  {client.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <a href={`mailto:${client.email}`} className="hover:text-blue-600">{client.email}</a>
                    </div>
                  )}
                  {client.notes && (
                    <p className="pt-1 border-t border-slate-200 text-slate-500 italic">
                      "{client.notes}"
                    </p>
                  )}
                </div>

                {/* Installed units preview */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                    <span>Installed AC Units:</span>
                    <button
                      onClick={() => onAddUnitForClient(client.id)}
                      className="text-blue-600 hover:text-blue-800 text-[11px] font-medium"
                    >
                      + Add Unit Here
                    </button>
                  </div>

                  {clientUnits.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No units registered for this location.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {clientUnits.map(unit => {
                        const statusObj = getMaintenanceStatus(unit.nextServiceDueDate);
                        return (
                          <div 
                            key={unit.id}
                            onClick={() => onSelectUnit(unit)}
                            className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 cursor-pointer transition text-xs"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <Wind className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                              <span className="font-medium text-slate-800 truncate">{unit.locationInBuilding}</span>
                              <span className="text-slate-400 text-[11px]">({unit.brand})</span>
                            </div>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              statusObj.status === 'overdue' 
                                ? 'bg-red-100 text-red-800' 
                                : statusObj.status === 'due_soon'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {statusObj.badgeText}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

              {/* Bottom direct call button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <a
                  href={`tel:${client.phone}`}
                  className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Customer
                </a>
                <span className="text-slate-400 text-[11px]">
                  Created {new Date(client.createdAt).toLocaleDateString()}
                </span>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Client, ACUnit, ServiceLog } from '../types';
import { calculateNextDueDate } from '../utils/maintenance';

interface DataContextType {
  clients: Client[];
  units: ACUnit[];
  serviceLogs: ServiceLog[];
  loading: boolean;
  isFirebaseConnected: boolean;
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<string>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addUnit: (unit: Omit<ACUnit, 'id' | 'nextServiceDueDate'>) => Promise<string>;
  updateUnit: (id: string, updates: Partial<ACUnit>) => Promise<void>;
  deleteUnit: (id: string) => Promise<void>;
  recordMaintenance: (serviceData: {
    unitId: string;
    date: string;
    technicianName: string;
    tasksCompleted: string[];
    refrigerantAddedOz?: number;
    partsReplaced?: string;
    notes?: string;
    cost?: number;
    customNextDueDate?: string;
  }) => Promise<void>;
  resetToSampleData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Initial Sample Data for AC Technicians
const SAMPLE_CLIENTS: Client[] = [
  {
    id: 'client-1',
    name: 'Greenfield Medical Clinic',
    phone: '(555) 234-5678',
    email: 'facilities@greenfieldmed.org',
    address: '104 Healthcare Blvd, Suite 200',
    notes: 'Access requires visitor badge at reception. Rooftop access key at front desk.',
    createdAt: '2026-01-10T09:00:00Z'
  },
  {
    id: 'client-2',
    name: 'Apex Data Center & Co',
    phone: '(555) 987-6543',
    email: 'ops@apexdatacenter.io',
    address: '740 Silicon Way, Tech Park',
    notes: 'Critical cooling - Temperature must stay below 68°F. 24/7 technician access.',
    createdAt: '2026-02-15T10:30:00Z'
  },
  {
    id: 'client-3',
    name: 'The Henderson Residence',
    phone: '(555) 432-8765',
    email: 'm.henderson@homeemail.net',
    address: '82 Magnolia Lane, West Hills',
    notes: 'Gate code #4491. Dog is friendly but kept in backyard.',
    createdAt: '2026-03-01T14:15:00Z'
  },
  {
    id: 'client-4',
    name: 'Bistro Milano Restaurant',
    phone: '(555) 321-7654',
    email: 'manager@bistromilano.com',
    address: '15 Commercial Ave, Downtown',
    notes: 'Best time for maintenance is mornings between 7:00 AM - 10:30 AM before kitchen opens.',
    createdAt: '2026-04-12T08:00:00Z'
  }
];

// Helper to compute sample dates relative to today
const today = new Date();
const formatDateIso = (d: Date) => d.toISOString().split('T')[0];
const subDays = (d: Date, days: number) => {
  const res = new Date(d);
  res.setDate(res.getDate() - days);
  return formatDateIso(res);
};
const addDays = (d: Date, days: number) => {
  const res = new Date(d);
  res.setDate(res.getDate() + days);
  return formatDateIso(res);
};

const SAMPLE_UNITS: ACUnit[] = [
  {
    id: 'unit-1',
    clientId: 'client-1',
    clientName: 'Greenfield Medical Clinic',
    locationInBuilding: 'Main Patient Waiting Hall',
    brand: 'Daikin',
    modelNumber: 'VRV-IV-FXMQ48',
    serialNumber: 'DK-9923841-A',
    refrigerantType: 'R-410A',
    coolingCapacity: '48,000 BTU (4 Ton)',
    installationDate: '2024-05-10',
    maintenanceIntervalMonths: 3,
    lastServiceDate: subDays(today, 105), // ~3.5 months ago
    nextServiceDueDate: subDays(today, 15), // OVERDUE by 15 days!
    notes: 'Uses commercial high-efficiency MERV 13 filters.'
  },
  {
    id: 'unit-2',
    clientId: 'client-1',
    clientName: 'Greenfield Medical Clinic',
    locationInBuilding: 'Operating Room 1 Clean Air',
    brand: 'Mitsubishi Electric',
    modelNumber: 'PUZ-HA36NHA5',
    serialNumber: 'ME-4019283-B',
    refrigerantType: 'R-410A',
    coolingCapacity: '36,000 BTU (3 Ton)',
    installationDate: '2024-08-20',
    maintenanceIntervalMonths: 3,
    lastServiceDate: subDays(today, 82),
    nextServiceDueDate: addDays(today, 8), // DUE SOON in 8 days!
    notes: 'HEPA filtration unit integrated in supply duct.'
  },
  {
    id: 'unit-3',
    clientId: 'client-2',
    clientName: 'Apex Data Center & Co',
    locationInBuilding: 'Server Rack Room B (High Density)',
    brand: 'Carrier',
    modelNumber: 'WeatherMaker 50TCQ',
    serialNumber: 'CR-8871032-X',
    refrigerantType: 'R-410A',
    coolingCapacity: '60,000 BTU (5 Ton)',
    installationDate: '2023-11-15',
    maintenanceIntervalMonths: 3,
    lastServiceDate: subDays(today, 110),
    nextServiceDueDate: subDays(today, 20), // OVERDUE by 20 days!
    notes: 'Dual compressor redundant package unit.'
  },
  {
    id: 'unit-4',
    clientId: 'client-3',
    clientName: 'The Henderson Residence',
    locationInBuilding: 'Master Suite & Upper Bedrooms',
    brand: 'Trane',
    modelNumber: 'XV20i TruComfort',
    serialNumber: 'TR-5521094-C',
    refrigerantType: 'R-410A',
    coolingCapacity: '36,000 BTU (3 Ton)',
    installationDate: '2025-02-18',
    maintenanceIntervalMonths: 6,
    lastServiceDate: subDays(today, 160),
    nextServiceDueDate: addDays(today, 20), // DUE SOON in 20 days!
    notes: 'Variable speed inverter compressor.'
  },
  {
    id: 'unit-5',
    clientId: 'client-4',
    clientName: 'Bistro Milano Restaurant',
    locationInBuilding: 'Kitchen Cook Line & Prep Area',
    brand: 'Lennox',
    modelNumber: 'Energence LGH072',
    serialNumber: 'LX-3390145-P',
    refrigerantType: 'R-410A',
    coolingCapacity: '72,000 BTU (6 Ton)',
    installationDate: '2024-03-10',
    maintenanceIntervalMonths: 3,
    lastServiceDate: subDays(today, 95),
    nextServiceDueDate: subDays(today, 5), // OVERDUE by 5 days!
    notes: 'Grease accumulation risk on outdoor condenser coil - wash with coil cleaner.'
  },
  {
    id: 'unit-6',
    clientId: 'client-3',
    clientName: 'The Henderson Residence',
    locationInBuilding: 'Ground Floor Living & Kitchen',
    brand: 'Mitsubishi Electric',
    modelNumber: 'MSZ-GL24NA',
    serialNumber: 'ME-1102948-D',
    refrigerantType: 'R-32',
    coolingCapacity: '24,000 BTU (2 Ton)',
    installationDate: '2025-05-12',
    maintenanceIntervalMonths: 12,
    lastServiceDate: subDays(today, 60),
    nextServiceDueDate: addDays(today, 305), // GOOD STANDING (due in 10 months)
    notes: 'Multi-zone ductless mini-split system.'
  }
];

const SAMPLE_SERVICE_LOGS: ServiceLog[] = [
  {
    id: 'log-1',
    unitId: 'unit-1',
    clientId: 'client-1',
    clientName: 'Greenfield Medical Clinic',
    unitLocation: 'Main Patient Waiting Hall',
    unitBrandModel: 'Daikin VRV-IV-FXMQ48',
    date: subDays(today, 105),
    technicianName: 'Alex Carter',
    tasksCompleted: [
      'Inspect and clean/replace air filters',
      'Flush and clear condensate drain line',
      'Check refrigerant operating pressures & test for leaks',
      'Measure delta-T (temperature drop across coil)'
    ],
    refrigerantAddedOz: 0,
    partsReplaced: 'Replaced 2x MERV 13 pleated filters (20x25x4)',
    notes: 'Suction pressure at 118 PSI, Head pressure 325 PSI. Temp split was 19°F. Drain line flushed with algaecide tab.',
    cost: 240,
    nextServiceDueDate: subDays(today, 15)
  },
  {
    id: 'log-2',
    unitId: 'unit-3',
    clientId: 'client-2',
    clientName: 'Apex Data Center & Co',
    unitLocation: 'Server Rack Room B (High Density)',
    unitBrandModel: 'Carrier WeatherMaker 50TCQ',
    date: subDays(today, 110),
    technicianName: 'Alex Carter',
    tasksCompleted: [
      'Clean evaporator and condenser coils',
      'Inspect electrical wiring, contactors & capacitors',
      'Lubricate fan motors and inspect bearings',
      'Test thermostat calibration and cycle controls'
    ],
    refrigerantAddedOz: 8,
    partsReplaced: '45/5 MFD Dual Run Capacitor',
    notes: 'Replaced bulging capacitor on compressor #2. Added 8 oz R-410A to top off circuit 1.',
    cost: 385,
    nextServiceDueDate: subDays(today, 20)
  }
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [units, setUnits] = useState<ACUnit[]>([]);
  const [serviceLogs, setServiceLogs] = useState<ServiceLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const isFirebaseConnected = Boolean(db);

  // Initialize or fetch data
  useEffect(() => {
    if (db) {
      // Connect to Firestore collections
      const unsubClients = onSnapshot(collection(db, 'clients'), (snap) => {
        const list: Client[] = [];
        snap.forEach((docSnap) => list.push({ id: docSnap.id, ...docSnap.data() } as Client));
        if (list.length === 0) {
          // If Firestore is empty, seed it
          seedFirestore();
        } else {
          setClients(list);
        }
      });

      const unsubUnits = onSnapshot(collection(db, 'units'), (snap) => {
        const list: ACUnit[] = [];
        snap.forEach((docSnap) => list.push({ id: docSnap.id, ...docSnap.data() } as ACUnit));
        setUnits(list);
      });

      const unsubLogs = onSnapshot(collection(db, 'service_logs'), (snap) => {
        const list: ServiceLog[] = [];
        snap.forEach((docSnap) => list.push({ id: docSnap.id, ...docSnap.data() } as ServiceLog));
        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setServiceLogs(list);
        setLoading(false);
      });

      return () => {
        unsubClients();
        unsubUnits();
        unsubLogs();
      };
    } else {
      // Offline / LocalStorage Mode
      const storedClients = localStorage.getItem('aircon_clients');
      const storedUnits = localStorage.getItem('aircon_units');
      const storedLogs = localStorage.getItem('aircon_logs');

      if (storedClients && storedUnits) {
        setClients(JSON.parse(storedClients));
        setUnits(JSON.parse(storedUnits));
        setServiceLogs(storedLogs ? JSON.parse(storedLogs) : []);
      } else {
        // Load initial rich sample data
        setClients(SAMPLE_CLIENTS);
        setUnits(SAMPLE_UNITS);
        setServiceLogs(SAMPLE_SERVICE_LOGS);
        localStorage.setItem('aircon_clients', JSON.stringify(SAMPLE_CLIENTS));
        localStorage.setItem('aircon_units', JSON.stringify(SAMPLE_UNITS));
        localStorage.setItem('aircon_logs', JSON.stringify(SAMPLE_SERVICE_LOGS));
      }
      setLoading(false);
    }
  }, [isFirebaseConnected]);

  const seedFirestore = async () => {
    if (!db) return;
    try {
      for (const c of SAMPLE_CLIENTS) {
        await setDoc(doc(db, 'clients', c.id), c);
      }
      for (const u of SAMPLE_UNITS) {
        await setDoc(doc(db, 'units', u.id), u);
      }
      for (const l of SAMPLE_SERVICE_LOGS) {
        await setDoc(doc(db, 'service_logs', l.id), l);
      }
    } catch (err) {
      console.error('Failed to seed Firestore:', err);
    }
  };

  const syncLocal = (newClients: Client[], newUnits: ACUnit[], newLogs: ServiceLog[]) => {
    localStorage.setItem('aircon_clients', JSON.stringify(newClients));
    localStorage.setItem('aircon_units', JSON.stringify(newUnits));
    localStorage.setItem('aircon_logs', JSON.stringify(newLogs));
  };

  const addClient = async (clientData: Omit<Client, 'id' | 'createdAt'>): Promise<string> => {
    const id = `client-${Date.now()}`;
    const newClient: Client = {
      ...clientData,
      id,
      createdAt: new Date().toISOString()
    };

    if (db) {
      await setDoc(doc(db, 'clients', id), newClient);
    } else {
      const updated = [newClient, ...clients];
      setClients(updated);
      syncLocal(updated, units, serviceLogs);
    }
    return id;
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    if (db) {
      await updateDoc(doc(db, 'clients', id), updates);
    } else {
      const updated = clients.map(c => c.id === id ? { ...c, ...updates } : c);
      setClients(updated);
      syncLocal(updated, units, serviceLogs);
    }
  };

  const deleteClient = async (id: string) => {
    if (db) {
      await deleteDoc(doc(db, 'clients', id));
    } else {
      const updatedClients = clients.filter(c => c.id !== id);
      const updatedUnits = units.filter(u => u.clientId !== id);
      setClients(updatedClients);
      setUnits(updatedUnits);
      syncLocal(updatedClients, updatedUnits, serviceLogs);
    }
  };

  const addUnit = async (unitData: Omit<ACUnit, 'id' | 'nextServiceDueDate'>): Promise<string> => {
    const id = `unit-${Date.now()}`;
    const nextDueDate = calculateNextDueDate(unitData.lastServiceDate, unitData.maintenanceIntervalMonths);
    const newUnit: ACUnit = {
      ...unitData,
      id,
      nextServiceDueDate: nextDueDate
    };

    if (db) {
      await setDoc(doc(db, 'units', id), newUnit);
    } else {
      const updated = [newUnit, ...units];
      setUnits(updated);
      syncLocal(clients, updated, serviceLogs);
    }
    return id;
  };

  const updateUnit = async (id: string, updates: Partial<ACUnit>) => {
    let finalUpdates = { ...updates };
    if (updates.lastServiceDate !== undefined || updates.maintenanceIntervalMonths !== undefined) {
      const currentUnit = units.find(u => u.id === id);
      const lastService = updates.lastServiceDate ?? currentUnit?.lastServiceDate ?? '';
      const interval = updates.maintenanceIntervalMonths ?? currentUnit?.maintenanceIntervalMonths ?? 6;
      finalUpdates.nextServiceDueDate = calculateNextDueDate(lastService, interval);
    }

    if (db) {
      await updateDoc(doc(db, 'units', id), finalUpdates);
    } else {
      const updated = units.map(u => u.id === id ? { ...u, ...finalUpdates } : u);
      setUnits(updated);
      syncLocal(clients, updated, serviceLogs);
    }
  };

  const deleteUnit = async (id: string) => {
    if (db) {
      await deleteDoc(doc(db, 'units', id));
    } else {
      const updated = units.filter(u => u.id !== id);
      setUnits(updated);
      syncLocal(clients, updated, serviceLogs);
    }
  };

  const recordMaintenance = async (serviceData: {
    unitId: string;
    date: string;
    technicianName: string;
    tasksCompleted: string[];
    refrigerantAddedOz?: number;
    partsReplaced?: string;
    notes?: string;
    cost?: number;
    customNextDueDate?: string;
  }) => {
    const unit = units.find(u => u.id === serviceData.unitId);
    if (!unit) return;

    const logId = `log-${Date.now()}`;
    const calculatedNextDue = serviceData.customNextDueDate || 
      calculateNextDueDate(serviceData.date, unit.maintenanceIntervalMonths);

    const newLog: ServiceLog = {
      id: logId,
      unitId: unit.id,
      clientId: unit.clientId,
      clientName: unit.clientName,
      unitLocation: unit.locationInBuilding,
      unitBrandModel: `${unit.brand} ${unit.modelNumber}`,
      date: serviceData.date,
      technicianName: serviceData.technicianName,
      tasksCompleted: serviceData.tasksCompleted,
      refrigerantAddedOz: serviceData.refrigerantAddedOz,
      partsReplaced: serviceData.partsReplaced,
      notes: serviceData.notes,
      cost: serviceData.cost,
      nextServiceDueDate: calculatedNextDue
    };

    const updatedUnitData = {
      lastServiceDate: serviceData.date,
      nextServiceDueDate: calculatedNextDue
    };

    if (db) {
      await setDoc(doc(db, 'service_logs', logId), newLog);
      await updateDoc(doc(db, 'units', unit.id), updatedUnitData);
    } else {
      const updatedLogs = [newLog, ...serviceLogs];
      const updatedUnits = units.map(u => u.id === unit.id ? { ...u, ...updatedUnitData } : u);
      setServiceLogs(updatedLogs);
      setUnits(updatedUnits);
      syncLocal(clients, updatedUnits, updatedLogs);
    }
  };

  const resetToSampleData = () => {
    setClients(SAMPLE_CLIENTS);
    setUnits(SAMPLE_UNITS);
    setServiceLogs(SAMPLE_SERVICE_LOGS);
    syncLocal(SAMPLE_CLIENTS, SAMPLE_UNITS, SAMPLE_SERVICE_LOGS);
  };

  return (
    <DataContext.Provider
      value={{
        clients,
        units,
        serviceLogs,
        loading,
        isFirebaseConnected,
        addClient,
        updateClient,
        deleteClient,
        addUnit,
        updateUnit,
        deleteUnit,
        recordMaintenance,
        resetToSampleData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};


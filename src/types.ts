export type MaintenanceStatus = 'overdue' | 'due_soon' | 'good';

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes?: string;
  createdAt: string;
}

export interface ACUnit {
  id: string;
  clientId: string;
  clientName: string;
  locationInBuilding: string; // e.g., "Master Bedroom", "Server Room A", "Rooftop Unit 2"
  brand: string; // Daikin, Mitsubishi, Carrier, etc.
  modelNumber: string;
  serialNumber: string;
  refrigerantType: string; // R-410A, R-32, R-22, etc.
  coolingCapacity?: string; // 12,000 BTU, 2.5 Ton, etc.
  installationDate: string;
  maintenanceIntervalMonths: number; // 3, 6, or 12 months
  lastServiceDate: string;
  nextServiceDueDate: string;
  notes?: string;
}

export interface ServiceLog {
  id: string;
  unitId: string;
  clientId: string;
  clientName: string;
  unitLocation: string;
  unitBrandModel: string;
  date: string;
  technicianName: string;
  tasksCompleted: string[];
  refrigerantAddedOz?: number;
  partsReplaced?: string;
  notes?: string;
  cost?: number;
  nextServiceDueDate: string;
}

export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  provider: 'google' | 'facebook' | 'demo';
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

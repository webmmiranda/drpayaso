
export enum UserRole {
  RECRUIT = 'Recluta',
  DR_PAYASO = 'Dr. Payaso',
  PHOTOGRAPHER = 'Fotógrafo',
  VOLUNTEER = 'Otro Voluntario',
  BOARD = 'Junta Directiva',
  TREASURER = 'Tesorero',
  ADMIN = 'Super Admin'
}

export interface User {
  id: string;
  email: string;
  cedula: string;
  fullName: string;
  phone: string;
  whatsapp: string;
  photoUrl: string; 
  characterPhotoUrl?: string; 
  artisticName?: string; 
  role: UserRole; // The currently ACTIVE role
  availableRoles: UserRole[]; // All roles the user possesses
  isSuperAdmin?: boolean; 
  status: 'active' | 'inactive';
  validUntil: string;
  exemptFromFees?: boolean; 
  adminNotes?: string;
  skills?: string;
  address?: string;
}

export interface UserStats {
    trainingHours: number;
    visitsCount: number;
    graduationRequested?: boolean;
}

export interface GraduationRequest {
    id: string;
    userId: string;
    userFullName: string;
    userPhoto: string;
    stats: UserStats;
    status: 'pending' | 'approved' | 'rejected';
    requestDate: string;
}

export enum EventType {
  TRAINING = 'Entrenamiento',
  VISIT = 'Visita Hospitalaria'
}

export interface PayasoLocation {
    id: string;
    name: string;
    address?: string;
    type: 'hospital' | 'albergue' | 'escuela' | 'otro';
    active: boolean;
}

// Granular Capacity Interface
export interface RoleCapacity {
    recruit: number;
    dr_payaso: number;
    photographer: number;
    volunteer: number;
}

export interface PayasoEvent {
  id: string;
  type: EventType;
  title: string;
  date: string; 
  location: string; 
  locationId?: string; 
  description: string;
  
  // New Granular Logic
  totalCapacity: number; // Sum of all
  totalAttendees: number;
  
  capacity: RoleCapacity; // Max spots per role
  attendeesCount: RoleCapacity; // Taken spots per role
  
  registered: boolean;
  currentUserStatus?: 'registered' | 'attended' | 'absent'; // Status for the specific logged-in user
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  month: string;
  datePaid: string;
  status: 'paid' | 'pending_approval' | 'rejected'; 
  referenceId?: string; 
  receiptUrl?: string; // New field
}

export interface StatMetric {
  label: string;
  value: number | string;
  change?: string;
}

export interface ChatMessage {
    id: string;
    eventId: string;
    userId: string;
    userName: string;
    userPhoto: string;
    text: string;
    timestamp: string;
}

export interface CreateEventData {
    title: string;
    type: EventType;
    date: string;
    time: string;
    location: string; 
    locationId?: string; 
    description: string;
    capacity: RoleCapacity; // Granular input
}

export interface AttendanceRecord {
    userId: string;
    userFullName: string;
    userRole: string;
    userPhoto: string;
    status: 'registered' | 'attended' | 'absent';
}

export interface CreatePaymentData {
    userId: string;
    amount: number;
    month: string;
    notes: string;
    status: 'paid' | 'pending_approval'; 
    referenceId?: string;
    receiptUrl?: string; // New field
}

export interface SystemMessage {
    id: string;
    subject: string;
    body: string;
    targetRoles: UserRole[];
    sentAt: string;
    sentBy: string;
}

export interface FontConfig {
    id: number;
    name: string;
    heading: string;
    body: string;
    accent: string;
    description: string;
}

export interface AppConfig {
    appName: string;
    logoUrl?: string;
    primaryColor: string;
    secondaryColor: string;
    fontConfigId: number;
}

// Analytics Types
export interface ImpactStats {
    totalVolunteers: number;
    activeVolunteers: number;
    roleDistribution: { name: string; value: number }[];
    monthlyVisits: { name: string; visits: number; trainings: number }[];
    topLocations: { name: string; count: number }[];
}

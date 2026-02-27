
import { User, UserRole, PayasoEvent, EventType, Payment, PayasoLocation } from './types';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    email: 'dr.risas@payaso.org',
    cedula: '1-1111-1111',
    fullName: 'Juan Pérez',
    phone: '8888-8888',
    whatsapp: '8888-8888',
    photoUrl: '', // Removed Mock URL
    characterPhotoUrl: '', // Removed Mock URL
    artisticName: 'Dr. Risas',
    role: UserRole.DR_PAYASO,
    availableRoles: [UserRole.DR_PAYASO],
    isSuperAdmin: false, 
    status: 'active',
    validUntil: '2025-12-31',
    adminNotes: 'Líder de equipo muy activo.',
    skills: 'Globolexia, Magia básica',
    exemptFromFees: false
  },
  {
    id: 'u2',
    email: 'ana.admin@payaso.org',
    cedula: '2-2222-2222',
    fullName: 'Ana Gómez',
    phone: '9999-9999',
    whatsapp: '9999-9999',
    photoUrl: '',
    characterPhotoUrl: undefined,
    artisticName: undefined,
    role: UserRole.ADMIN, 
    availableRoles: [UserRole.ADMIN, UserRole.BOARD],
    isSuperAdmin: true,
    status: 'active',
    validUntil: '2030-01-01',
    adminNotes: 'Encargada de logística.',
    skills: 'Contabilidad, Excel',
    exemptFromFees: true 
  },
  {
    id: 'u3',
    email: 'pepito.recluta@payaso.org',
    cedula: '3-3333-3333',
    fullName: 'Pepito López',
    phone: '7777-7777',
    whatsapp: '7777-7777',
    photoUrl: '',
    characterPhotoUrl: undefined,
    artisticName: undefined,
    role: UserRole.RECRUIT,
    availableRoles: [UserRole.RECRUIT],
    isSuperAdmin: false,
    status: 'active',
    validUntil: '2024-12-31',
    adminNotes: 'Falta entregar comprobante de pago mayo.',
    skills: 'Tocar guitarra',
    exemptFromFees: false
  },
  {
    id: 'u4',
    email: 'foto.carla@payaso.org',
    cedula: '4-4444-4444',
    fullName: 'Carla Zoom',
    phone: '6666-6666',
    whatsapp: '6666-6666',
    photoUrl: '',
    role: UserRole.PHOTOGRAPHER,
    availableRoles: [UserRole.PHOTOGRAPHER, UserRole.VOLUNTEER],
    isSuperAdmin: false,
    status: 'active',
    validUntil: '2025-06-30',
    adminNotes: '',
    skills: 'Fotografía profesional, Edición',
    exemptFromFees: true 
  },
  {
    id: 'u5',
    email: 'dr.chiflado@payaso.org',
    cedula: '5-5555-5555',
    fullName: 'Roberto Méndez',
    phone: '8899-0011',
    whatsapp: '8899-0011',
    photoUrl: '',
    characterPhotoUrl: '',
    artisticName: 'Dr. Chiflado',
    role: UserRole.DR_PAYASO, 
    availableRoles: [UserRole.DR_PAYASO, UserRole.ADMIN, UserRole.PHOTOGRAPHER],
    isSuperAdmin: true,       
    status: 'active',
    validUntil: '2030-12-31',
    adminNotes: 'Miembro fundador. Multitasking.',
    skills: 'Malabares, Liderazgo',
    exemptFromFees: false
  }
];

// Fallback for generic calls
export const MOCK_USER = MOCK_USERS[0];

export const MOCK_LOCATIONS: PayasoLocation[] = [
    { id: 'l1', name: 'Hospital Nacional de Niños', type: 'hospital', active: true, address: 'San José, Centro' },
    { id: 'l2', name: 'Hogar de Ancianos San Pedro', type: 'albergue', active: true, address: 'San Pedro, Montes de Oca' },
    { id: 'l3', name: 'Hospital San Juan de Dios', type: 'hospital', active: true, address: 'San José, Paseo Colón' },
    { id: 'l4', name: 'Albergue Sueños de Esperanza', type: 'albergue', active: true, address: 'Desamparados' },
    { id: 'l5', name: 'Sede Central - Sala de Ensayos', type: 'otro', active: true, address: 'Barrio Escalante' },
];

export const MOCK_EVENTS: PayasoEvent[] = [
  {
    id: 'e1',
    type: EventType.VISIT,
    title: 'Visita Hospital de Niños',
    date: '2024-06-15T09:00:00',
    location: 'Hospital Nacional de Niños',
    locationId: 'l1',
    description: 'Visita general. Prioridad Dr. Payaso. Fotógrafos bienvenidos.',
    totalCapacity: 8,
    totalAttendees: 4,
    capacity: { recruit: 2, dr_payaso: 4, photographer: 1, volunteer: 1 },
    attendeesCount: { recruit: 1, dr_payaso: 2, photographer: 1, volunteer: 0 },
    registered: true
  },
  {
    id: 'e2',
    type: EventType.TRAINING,
    title: 'Taller de Improvisación',
    date: '2024-06-20T18:00:00',
    location: 'Sede Central - Sala de Ensayos',
    locationId: 'l5',
    description: 'Entrenamiento para todos.',
    totalCapacity: 20,
    totalAttendees: 12,
    capacity: { recruit: 10, dr_payaso: 10, photographer: 0, volunteer: 0 },
    attendeesCount: { recruit: 8, dr_payaso: 4, photographer: 0, volunteer: 0 },
    registered: false
  },
  {
    id: 'e3',
    type: EventType.VISIT,
    title: 'Visita Geriátrico San Pedro',
    date: '2024-06-22T10:00:00',
    location: 'Hogar de Ancianos San Pedro',
    locationId: 'l2',
    description: 'Solo para Drs. Payaso y Reclutas.',
    totalCapacity: 6,
    totalAttendees: 2,
    capacity: { recruit: 3, dr_payaso: 3, photographer: 0, volunteer: 0 },
    attendeesCount: { recruit: 1, dr_payaso: 1, photographer: 0, volunteer: 0 },
    registered: false
  },
  {
    id: 'e4',
    type: EventType.TRAINING,
    title: 'Inducción Nuevos Ingresos',
    date: '2024-07-01T18:00:00',
    location: 'Sede Central - Sala de Ensayos',
    locationId: 'l5',
    description: 'EXCLUSIVO RECLUTAS.',
    totalCapacity: 30,
    totalAttendees: 15,
    capacity: { recruit: 30, dr_payaso: 0, photographer: 0, volunteer: 0 },
    attendeesCount: { recruit: 15, dr_payaso: 0, photographer: 0, volunteer: 0 },
    registered: false
  }
];

export const MOCK_PAYMENTS: Payment[] = [
  { id: 'p1', userId: 'u1', amount: 5000, month: 'Enero 2024', datePaid: '2024-01-05', status: 'paid' },
  { id: 'p2', userId: 'u1', amount: 5000, month: 'Febrero 2024', datePaid: '2024-02-03', status: 'paid' },
  { id: 'p3', userId: 'u1', amount: 5000, month: 'Marzo 2024', datePaid: '2024-03-10', status: 'paid' },
  { id: 'p4', userId: 'u1', amount: 5000, month: 'Abril 2024', datePaid: '', status: 'pending_approval' },
];

export const ADMIN_STATS_HOURS = [
  { name: 'Ene', hours: 40 },
  { name: 'Feb', hours: 30 },
  { name: 'Mar', hours: 55 },
  { name: 'Abr', hours: 45 },
  { name: 'May', hours: 60 },
  { name: 'Jun', hours: 50 },
];

export const ADMIN_STATS_VISITS = [
  { name: 'Hosp. Niños', visits: 12 },
  { name: 'Geriátrico', visits: 8 },
  { name: 'Albergue', visits: 5 },
  { name: 'Escuela', visits: 3 },
];

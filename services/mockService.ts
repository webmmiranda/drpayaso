
import { MOCK_EVENTS, MOCK_PAYMENTS, MOCK_USERS, MOCK_LOCATIONS } from '../constants';
import { PayasoEvent, Payment, User, ChatMessage, CreateEventData, AttendanceRecord, CreatePaymentData, SystemMessage, UserRole, EventType, PayasoLocation, UserStats, GraduationRequest } from '../types';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Local state for mocks to persist during session
let currentEvents = [...MOCK_EVENTS];
let currentPayments = [...MOCK_PAYMENTS];
let currentUsers = [...MOCK_USERS]; // State for users to allow status updates
let currentLocations = [...MOCK_LOCATIONS];
let graduationRequests: string[] = ['u3']; // Pepito Recluta starts with a request for demo

let mockMessages: ChatMessage[] = [
    {
        id: 'm1',
        eventId: 'e1',
        userId: 'u1',
        userName: 'Dr. Risas',
        userPhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DrRisas&clothing=collarAndBell',
        text: '¡Hola equipo! ¿Quién lleva los globos?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString()
    }
];

export const MockService = {
  // Update authenticate to check Email OR Cedula (ID)
  authenticate: async (identifier: string): Promise<User> => {
    await delay(600);
    // Check email, id, or cedula
    const user = currentUsers.find(u => 
        u.email === identifier || 
        u.id === identifier || 
        u.cedula === identifier
    );
    if (!user) throw new Error("Usuario no encontrado");
    
    // Simulate session storage
    if (typeof window !== 'undefined') {
        localStorage.setItem('mock_session_user', JSON.stringify(user));
    }

    return user;
  },

  // ✨ Check for existing session on load
  checkSession: async (): Promise<User | null> => {
      await delay(200);
      if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('mock_session_user');
          if (stored) {
              try {
                  const user = JSON.parse(stored);
                  // Validate user still exists in "DB"
                  const freshUser = currentUsers.find(u => u.id === user.id);
                  return freshUser || null;
              } catch {
                  return null;
              }
          }
      }
      return null;
  },

  logout: async (): Promise<void> => {
      await delay(100);
      if (typeof window !== 'undefined') {
          localStorage.removeItem('mock_session_user');
      }
  },

  getAllUsers: async (): Promise<User[]> => {
    await delay(400);
    return currentUsers;
  },

  // ✨ NEW: Create User Mock
  adminCreateUser: async (userData: any): Promise<void> => {
      await delay(800);
      
      const newUser: User = {
          id: `u${Date.now()}`, // Generate fake ID
          email: userData.email,
          cedula: userData.cedula,
          fullName: userData.fullName,
          phone: userData.phone,
          whatsapp: userData.phone,
          photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.fullName.replace(' ', '')}`,
          characterPhotoUrl: userData.role === UserRole.DR_PAYASO 
            ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.artisticName?.replace(' ', '')}&clothing=collarAndBell` 
            : undefined,
          artisticName: userData.artisticName,
          role: userData.role,
          availableRoles: [userData.role], // Fix: Add availableRoles
          isSuperAdmin: userData.role === UserRole.ADMIN,
          status: 'active',
          validUntil: '2025-12-31',
          adminNotes: 'Creado manualmente desde panel admin (Demo)',
          skills: '',
          exemptFromFees: false
      };

      currentUsers.unshift(newUser); // Add to beginning of list
  },

  updateUserStatus: async (userId: string, status: 'active' | 'inactive'): Promise<void> => {
    await delay(300);
    const userIndex = currentUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        currentUsers[userIndex] = { ...currentUsers[userIndex], status };
    }
  },

  updateUserProfile: async (userId: string, data: Partial<User>): Promise<void> => {
      await delay(500);
      const userIndex = currentUsers.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
          // If role changes, ensure it's in availableRoles in mock
          let updatedAvailable = currentUsers[userIndex].availableRoles;
          if (data.availableRoles) {
              updatedAvailable = data.availableRoles;
          } else if (data.role && !updatedAvailable.includes(data.role)) {
              updatedAvailable = [...updatedAvailable, data.role];
          }

          currentUsers[userIndex] = { 
              ...currentUsers[userIndex], 
              ...data,
              availableRoles: updatedAvailable
          };
          
          // Update local storage if self-update
          if (typeof window !== 'undefined') {
              const stored = localStorage.getItem('mock_session_user');
              if (stored) {
                  const sessionUser = JSON.parse(stored);
                  if (sessionUser.id === userId) {
                      localStorage.setItem('mock_session_user', JSON.stringify(currentUsers[userIndex]));
                  }
              }
          }
      }
  },

  // 🏥 LOCATIONS
  getLocations: async (includeInactive = false): Promise<PayasoLocation[]> => {
      await delay(300);
      if (includeInactive) return currentLocations;
      return currentLocations.filter(l => l.active);
  },

  createLocation: async (name: string, type: PayasoLocation['type'], address: string): Promise<PayasoLocation> => {
      await delay(400);
      const newLoc: PayasoLocation = {
          id: `l${Date.now()}`,
          name,
          type,
          active: true,
          address
      };
      currentLocations.push(newLoc);
      return newLoc;
  },

  updateLocation: async (id: string, data: Partial<PayasoLocation>): Promise<void> => {
      await delay(300);
      const idx = currentLocations.findIndex(l => l.id === id);
      if (idx !== -1) {
          currentLocations[idx] = { ...currentLocations[idx], ...data };
      }
  },

  toggleLocationStatus: async (id: string, active: boolean): Promise<void> => {
      await delay(300);
      const idx = currentLocations.findIndex(l => l.id === id);
      if(idx !== -1) {
          currentLocations[idx] = { ...currentLocations[idx], active };
      }
  },

  // 📅 EVENTS
  getEvents: async (): Promise<PayasoEvent[]> => {
    await delay(600);
    // In mock, add random attendance status to registered events for visualization
    return currentEvents.map(e => ({
        ...e,
        currentUserStatus: e.registered ? (Math.random() > 0.7 ? 'attended' : 'registered') : undefined
    }));
  },

  createEvent: async (data: CreateEventData): Promise<PayasoEvent> => {
    await delay(500);
    const totalCapacity = Object.values(data.capacity).reduce((sum, val) => sum + val, 0);
    const newEvent: PayasoEvent = {
        id: `e${Date.now()}`,
        type: data.type,
        title: data.title,
        date: `${data.date}T${data.time}`,
        location: data.location,
        locationId: data.locationId,
        description: data.description,
        totalAttendees: 0,
        totalCapacity: totalCapacity,
        capacity: data.capacity,
        attendeesCount: { recruit: 0, dr_payaso: 0, photographer: 0, volunteer: 0 },
        registered: false
    };
    currentEvents.push(newEvent);
    return newEvent;
  },

  toggleRegistration: async (eventId: string, type: EventType, currentStatus: boolean, userId: string): Promise<boolean> => {
    await delay(300);
    // In Mock, we just flip the boolean in the local array if we could find it, 
    // but here we just return the negated status for the UI to update optimistically
    const evt = currentEvents.find(e => e.id === eventId);
    if (evt) {
        evt.registered = !currentStatus;
        evt.totalAttendees += !currentStatus ? 1 : -1;
    }
    return !currentStatus;
  },

  // 💰 PAYMENTS MODIFIED
  getPayments: async (userId?: string): Promise<Payment[]> => {
    await delay(400);
    // Return pending items first
    const sorted = [...currentPayments].sort((a, b) => {
        if (a.status === 'pending_approval' && b.status !== 'pending_approval') return -1;
        if (a.status !== 'pending_approval' && b.status === 'pending_approval') return 1;
        return new Date(b.datePaid).getTime() - new Date(a.datePaid).getTime();
    });

    if (userId) return sorted.filter(p => p.userId === userId);
    return sorted;
  },

  createPayment: async (data: CreatePaymentData): Promise<Payment> => {
    await delay(500);
    const newPayment: Payment = {
        id: `p${Date.now()}`,
        userId: data.userId,
        amount: data.amount,
        month: data.month,
        datePaid: new Date().toISOString().split('T')[0],
        status: data.status, // Can be 'paid' or 'pending_approval'
        referenceId: data.referenceId
    };
    currentPayments.unshift(newPayment);
    return newPayment;
  },

  updatePaymentStatus: async (paymentId: string, status: 'paid' | 'rejected'): Promise<void> => {
      await delay(400);
      const idx = currentPayments.findIndex(p => p.id === paymentId);
      if (idx !== -1) {
          currentPayments[idx] = { ...currentPayments[idx], status };
      }
  },

  // Attendance Methods
  getEventAttendees: async (eventId: string): Promise<AttendanceRecord[]> => {
    await delay(400);
    // Simular que algunos usuarios están inscritos para el demo
    return currentUsers.slice(0, 3).map(u => ({
        userId: u.id,
        userFullName: u.fullName,
        userRole: u.role,
        userPhoto: u.photoUrl,
        status: Math.random() > 0.5 ? 'registered' : 'attended' // Estado random inicial para demo
    }));
  },

  markAttendance: async (eventId: string, userId: string, status: 'attended' | 'absent'): Promise<void> => {
    await delay(200);
    console.log(`User ${userId} marked as ${status} for event ${eventId}`);
  },

  // 📊 STATS & GRADUATION (NEW)
  getUserStats: async (userId: string): Promise<UserStats> => {
      await delay(300);
      // Mock logic: Random stats for demo or hardcoded for specific mock users
      if (userId === 'u3') { // Pepito Recluta
          return { trainingHours: 12, visitsCount: 3, graduationRequested: graduationRequests.includes(userId) };
      }
      return { trainingHours: 45, visitsCount: 12, graduationRequested: false };
  },

  requestGraduation: async (userId: string): Promise<void> => {
      await delay(500);
      if (!graduationRequests.includes(userId)) {
          graduationRequests.push(userId);
      }
  },

  getGraduationRequests: async (): Promise<GraduationRequest[]> => {
      await delay(600);
      return graduationRequests.map(userId => {
          const user = currentUsers.find(u => u.id === userId);
          return {
              id: `grad-${userId}`,
              userId: userId,
              userFullName: user?.fullName || 'Desconocido',
              userPhoto: user?.photoUrl || '',
              status: 'pending',
              requestDate: new Date().toISOString(),
              stats: { trainingHours: 20, visitsCount: 5 } // Mock passing stats
          }
      });
  },

  approveGraduation: async (requestId: string): Promise<void> => {
      await delay(500);
      // Extract userId from mock requestId 'grad-u3'
      const userId = requestId.split('-')[1];
      const userIdx = currentUsers.findIndex(u => u.id === userId);
      
      if (userIdx !== -1) {
          // Promote User!
          currentUsers[userIdx] = {
              ...currentUsers[userIdx],
              role: UserRole.DR_PAYASO,
              artisticName: 'Dr. Nuevo', // Placeholder
              validUntil: '2025-12-31'
          };
          // Remove from requests
          graduationRequests = graduationRequests.filter(id => id !== userId);
      }
  },

  rejectGraduation: async (requestId: string): Promise<void> => {
      await delay(300);
      const userId = requestId.split('-')[1];
      graduationRequests = graduationRequests.filter(id => id !== userId);
  },

  // Chat Methods
  getEventMessages: async (eventId: string): Promise<ChatMessage[]> => {
    await delay(300);
    return mockMessages.filter(m => m.eventId === eventId);
  },

  sendEventMessage: async (eventId: string, userId: string, text: string): Promise<ChatMessage> => {
    await delay(200);
    const user = currentUsers.find(u => u.id === userId) || currentUsers[0];
    const newMessage: ChatMessage = {
        id: `m${Date.now()}`,
        eventId,
        userId,
        userName: user.artisticName || user.fullName,
        userPhoto: user.characterPhotoUrl || user.photoUrl,
        text,
        timestamp: new Date().toISOString()
    };
    mockMessages.push(newMessage);
    return newMessage;
  },

  // Admin Messaging
  sendMassMessage: async (targetRoles: UserRole[], subject: string, body: string): Promise<SystemMessage> => {
      await delay(800);
      return {
          id: `msg-${Date.now()}`,
          targetRoles,
          subject,
          body,
          sentAt: new Date().toISOString(),
          sentBy: 'admin'
      };
  }
};

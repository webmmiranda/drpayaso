
import { supabase } from '../lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';
import { PayasoEvent, Payment, User, UserRole, EventType, ChatMessage, CreateEventData, AttendanceRecord, CreatePaymentData, SystemMessage, PayasoLocation, UserStats, GraduationRequest } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zmswleejifeuxtoqutrs.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_qwoyAUzUkJmwEPKrbK9c6Q_N8shX1dz';

// --- HELPER: Image Compression ---
const compressImage = async (file: File, maxWidth = 1024, quality = 0.7): Promise<File> => {
    // If not an image, return original
    if (!file.type.startsWith('image/')) return file;

    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.src = e.target?.result as string;
        };
        
        reader.onerror = (err) => reject(err);

        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Maintain aspect ratio
            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(file); // Fallback to original if canvas fails
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
                if (!blob) {
                    resolve(file); // Fallback
                    return;
                }
                // Create new file with compressed data
                const compressedFile = new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                });
                console.log(`Compression: ${(file.size / 1024).toFixed(2)}KB -> ${(compressedFile.size / 1024).toFixed(2)}KB`);
                resolve(compressedFile);
            }, 'image/jpeg', quality);
        };

        reader.readAsDataURL(file);
    });
};

const mapProfileToUser = (profile: any, rolesData: any[]): User => {
    // Collect all available roles based on the 'user_roles' table
    const availableRoles: UserRole[] = rolesData.map((r: any) => {
        switch (r.rol) {
            case 'admin': return UserRole.ADMIN;
            case 'dr_payaso': return UserRole.DR_PAYASO;
            case 'recluta': return UserRole.RECRUIT;
            case 'fotografo': return UserRole.PHOTOGRAPHER;
            case 'junta_directiva': return UserRole.BOARD;
            case 'tesorero': return UserRole.TREASURER;
            default: return UserRole.VOLUNTEER;
        }
    });

    // Determine primary role (Priority: Admin > Board > Dr > Photo > Recruit)
    let mainRole = UserRole.VOLUNTEER;
    if (availableRoles.includes(UserRole.ADMIN)) mainRole = UserRole.ADMIN;
    else if (availableRoles.includes(UserRole.BOARD)) mainRole = UserRole.BOARD;
    else if (availableRoles.includes(UserRole.DR_PAYASO)) mainRole = UserRole.DR_PAYASO;
    else if (availableRoles.includes(UserRole.PHOTOGRAPHER)) mainRole = UserRole.PHOTOGRAPHER;
    else if (availableRoles.includes(UserRole.RECRUIT)) mainRole = UserRole.RECRUIT;

    // Get artistic details if they exist in any role entry
    const drPayasoRoleData = rolesData.find((r:any) => r.rol === 'dr_payaso');

    return {
        id: profile.id,
        email: profile.email,
        cedula: profile.cedula || '',
        fullName: profile.nombre_completo || 'Usuario',
        phone: profile.telefono || '',
        whatsapp: profile.whatsapp || profile.telefono || '',
        photoUrl: profile.foto_personal_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.nombre_completo || 'U')}`,
        characterPhotoUrl: drPayasoRoleData?.foto_personaje_url,
        artisticName: drPayasoRoleData?.nombre_artistico,
        role: mainRole, // Initial active role
        availableRoles: availableRoles.length > 0 ? availableRoles : [UserRole.VOLUNTEER],
        isSuperAdmin: availableRoles.includes(UserRole.ADMIN) || profile.is_super_admin === true,
        status: profile.estado === 'activo' ? 'active' : 'inactive',
        validUntil: '2025-12-31',
        adminNotes: profile.notas_privadas,
        skills: profile.habilidades, 
        address: profile.direccion,
        exemptFromFees: profile.exempt_from_fees === true
    };
};

export const SupabaseService = {
  // 🔐 AUTENTICACIÓN
  authenticate: async (identifier: string, password?: string): Promise<User> => {
    if (!password) throw new Error("Se requiere contraseña.");

    let emailToUse = identifier;

    // Resolve Cedula to Email if necessary
    if (!identifier.includes('@')) {
        const { data: profileData, error: lookupError } = await supabase
            .from('profiles')
            .select('email')
            .eq('cedula', identifier)
            .single();

        if (lookupError || !profileData || !profileData.email) {
            throw new Error("Cédula no encontrada o no tiene correo asociado.");
        }
        emailToUse = profileData.email;
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password
    });

    if (authError || !authData.user) {
        throw new Error(authError?.message || "Error de autenticación.");
    }

    const userId = authData.user.id;
    return SupabaseService.fetchUser(userId);
  },

  checkSession: async (): Promise<User | null> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
          try {
            return await SupabaseService.fetchUser(session.user.id);
          } catch {
              return null;
          }
      }
      return null;
  },

  logout: async (): Promise<void> => {
      await supabase.auth.signOut();
  },

  // Helper to get user details by ID
  fetchUser: async (userId: string): Promise<User> => {
       // Fetch Profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (profileError || !profile) {
         // Should not happen for authenticated users usually unless profile deleted
         throw new Error("Perfil no encontrado.");
    }

    // Fetch Roles
    const { data: roles } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', profile.id)
        .eq('activo', true);

    return mapProfileToUser(profile, roles || []);
  },
  
  changePassword: async (newPassword: string): Promise<void> => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
  },

  // 📸 STORAGE (WITH COMPRESSION)
  uploadImage: async (file: File, folder: 'profiles' | 'characters' | 'receipts' = 'profiles'): Promise<string> => {
      // 1. Compress Image
      const compressedFile = await compressImage(file);

      // 2. Prepare Path
      const fileExt = compressedFile.name.split('.').pop() || 'jpg';
      const fileName = `${folder}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `${fileName}`; 

      // 3. Upload to 'payaso_assets' bucket
      const { error: uploadError } = await supabase.storage
          .from('payaso_assets')
          .upload(filePath, compressedFile);

      if (uploadError) {
          console.error("Upload error:", uploadError);
          throw new Error("Error subiendo imagen. Verifica que el bucket 'payaso_assets' exista y sea público.");
      }

      const { data } = supabase.storage.from('payaso_assets').getPublicUrl(filePath);
      return data.publicUrl;
  },

  // 📅 EVENTOS (Conteo Granular Real + Status Usuario)
  getEvents: async (): Promise<PayasoEvent[]> => {
    // 1. Fetch Events
    const { data: trainings } = await supabase.from('trainings').select('*, locations(nombre)');
    const { data: visits } = await supabase.from('hospital_visits').select('*, locations(nombre)');

    // 2. Fetch Registrations (Include asistio status)
    const { data: trainingRegs } = await supabase.from('training_confirmations').select('training_id, user_id, asistio');
    const { data: visitRegs } = await supabase.from('visit_registrations').select('visit_id, user_id, rol_asistencia, asistio');

    // Helper: Count registrations for training
    const getTrainingCount = (id: string) => trainingRegs?.filter((r: any) => r.training_id === id).length || 0;
    
    // Helper: Count registrations for visits (Granular by Role)
    const getVisitCounts = (id: string) => {
        const regs = visitRegs?.filter((r: any) => r.visit_id === id) || [];
        return {
            total: regs.length,
            recruit: regs.filter((r: any) => r.rol_asistencia === 'recluta').length,
            dr_payaso: regs.filter((r: any) => r.rol_asistencia === 'dr_payaso').length,
            photographer: regs.filter((r: any) => r.rol_asistencia === 'fotografo').length,
            volunteer: regs.filter((r: any) => r.rol_asistencia === 'otro').length
        }
    };

    const { data: { user } } = await supabase.auth.getUser();
    const myId = user?.id;
    
    // Determine my attendance status map
    const myTrainingStatus = new Map<string, 'registered' | 'attended' | 'absent'>();
    (trainingRegs || []).filter((r: any) => r.user_id === myId).forEach((r: any) => {
        const status = r.asistio === true ? 'attended' : r.asistio === false ? 'absent' : 'registered';
        myTrainingStatus.set(r.training_id, status);
    });

    const myVisitStatus = new Map<string, 'registered' | 'attended' | 'absent'>();
    (visitRegs || []).filter((r: any) => r.user_id === myId).forEach((r: any) => {
        const status = r.asistio === true ? 'attended' : r.asistio === false ? 'absent' : 'registered';
        myVisitStatus.set(r.visit_id, status);
    });

    // Map Trainings
    const mappedTrainings: PayasoEvent[] = (trainings || []).map((t: any) => ({
        id: t.id,
        type: EventType.TRAINING,
        title: t.titulo,
        date: t.fecha_hora,
        location: t.ubicacion_manual || t.locations?.nombre || 'Ubicación por definir',
        locationId: t.location_id,
        description: t.descripcion,
        
        // Trainings usually don't have granular quotas in MVP schema, defaulting to total
        totalCapacity: 50, 
        totalAttendees: getTrainingCount(t.id),
        capacity: { recruit: 50, dr_payaso: 50, photographer: 50, volunteer: 50 },
        attendeesCount: { recruit: 0, dr_payaso: 0, photographer: 0, volunteer: 0 }, 
        
        registered: myTrainingStatus.has(t.id),
        currentUserStatus: myTrainingStatus.get(t.id)
    }));

    // Map Visits
    const mappedVisits: PayasoEvent[] = (visits || []).map((v: any) => {
        const counts = getVisitCounts(v.id);
        return {
            id: v.id,
            type: EventType.VISIT,
            title: v.titulo,
            date: v.fecha_hora,
            location: v.ubicacion_manual || v.locations?.nombre || 'Hospital',
            locationId: v.location_id,
            description: 'Visita Hospitalaria',
            
            totalCapacity: (v.cupos_dres || 0) + (v.cupos_reclutas || 0) + (v.cupos_fotografos || 0) + (v.cupos_otros || 0),
            totalAttendees: counts.total,
            
            // Map DB columns to Granular Capacity Object
            capacity: {
                recruit: v.cupos_reclutas || 0,
                dr_payaso: v.cupos_dres || 0,
                photographer: v.cupos_fotografos || 0,
                volunteer: v.cupos_otros || 0
            },
            attendeesCount: counts,
            
            registered: myVisitStatus.has(v.id),
            currentUserStatus: myVisitStatus.get(v.id)
        };
    });

    return [...mappedTrainings, ...mappedVisits].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  },

  createEvent: async (data: CreateEventData): Promise<PayasoEvent> => {
    const isTraining = data.type === EventType.TRAINING;
    const table = isTraining ? 'trainings' : 'hospital_visits';
    
    const { data: { user } } = await supabase.auth.getUser();

    const payload: any = {
        titulo: data.title,
        fecha_hora: `${data.date}T${data.time}:00`,
        ubicacion_manual: data.locationId ? null : data.location,
        location_id: data.locationId || null,
        created_by: user?.id
    };

    if (isTraining) {
        payload.descripcion = data.description;
        payload.tipo_participantes = 'todos';
    } else {
        // Save granular quotas
        payload.cupos_dres = data.capacity.dr_payaso;
        payload.cupos_reclutas = data.capacity.recruit;
        payload.cupos_fotografos = data.capacity.photographer;
        payload.cupos_otros = data.capacity.volunteer;
    }
    
    const { data: newEvent, error } = await supabase
        .from(table)
        .insert(payload)
        .select()
        .single();

    if (error) throw error;

    return {
        id: newEvent.id,
        type: data.type,
        title: newEvent.titulo,
        date: newEvent.fecha_hora,
        location: newEvent.ubicacion_manual || 'Ubicación Seleccionada',
        description: isTraining ? newEvent.descripcion : 'Visita Hospitalaria',
        totalCapacity: 0, 
        totalAttendees: 0,
        capacity: data.capacity,
        attendeesCount: { recruit:0, dr_payaso:0, photographer:0, volunteer:0},
        registered: false
    };
  },

  // Generic toggle (Deprecated in favor of registerWithRole, but kept for compatibility)
  toggleRegistration: async (eventId: string, type: EventType, currentStatus: boolean, userId: string): Promise<boolean> => {
      // Fallback to registerWithRole using 'otro' if role not provided
      if(!currentStatus) {
          await SupabaseService.registerWithRole(eventId, type, userId, UserRole.VOLUNTEER);
          return true;
      } else {
          // Unregister logic is the same
          const table = type === EventType.TRAINING ? 'training_confirmations' : 'visit_registrations';
          const idField = type === EventType.TRAINING ? 'training_id' : 'visit_id';
          const { error } = await supabase.from(table).delete().eq(idField, eventId).eq('user_id', userId);
          if (error) throw error;
          return false;
      }
  },
  
  // ✅ CORE: Register with Specific Role
  registerWithRole: async (eventId: string, type: EventType, userId: string, role: UserRole): Promise<void> => {
      const isTraining = type === EventType.TRAINING;
      const table = isTraining ? 'training_confirmations' : 'visit_registrations';
      const idField = isTraining ? 'training_id' : 'visit_id';
      
      // Map UI Role Enum to DB String
      const dbRole = role === UserRole.DR_PAYASO ? 'dr_payaso' : 
                     role === UserRole.RECRUIT ? 'recluta' : 
                     role === UserRole.PHOTOGRAPHER ? 'fotografo' : 'otro';

      // Insert (Postgres unique constraint handles duplicates gracefully usually, or we catch error)
      const { error } = await supabase
            .from(table)
            .insert({ 
                [idField]: eventId, 
                user_id: userId, 
                asistio: null, // Null = Registered but attendance not yet taken
                ...(isTraining ? {} : { rol_asistencia: dbRole }) 
            });
      
      if (error) {
          // Handle unique violation simply
          if (error.code === '23505') { 
             // Already registered, maybe user clicked twice fast. Do nothing or throw specific error.
             return; 
          }
          throw error;
      }
  },

  // 👤 USER MANAGEMENT (MULTI-ROLE)
  getAllUsers: async (): Promise<User[]> => {
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`*, user_roles (rol, nombre_artistico, foto_personaje_url, activo)`)
        .order('nombre_completo');

    if (error) return [];
    return profiles.map(p => {
        return mapProfileToUser(p, p.user_roles || []);
    });
  },
  
  updateUserStatus: async (userId: string, status: 'active' | 'inactive'): Promise<void> => {
    await supabase.from('profiles').update({ estado: status === 'active' ? 'activo' : 'inactivo' }).eq('id', userId);
  },
  
  updateUserProfile: async (userId: string, data: Partial<User>): Promise<void> => {
      // 1. Update Profile Fields (Including email and cedula)
      const updates: any = { 
          nombre_completo: data.fullName, 
          telefono: data.phone, 
          whatsapp: data.whatsapp, 
          foto_personal_url: data.photoUrl, 
          notas_privadas: data.adminNotes, 
          exempt_from_fees: data.exemptFromFees, 
          is_super_admin: data.isSuperAdmin,
          direccion: data.address,
          habilidades: data.skills,
          // Update Email and Cedula
          email: data.email, 
          cedula: data.cedula 
      };
      await supabase.from('profiles').update(updates).eq('id', userId);

      // 2. Update Roles (Transactional logic: Delete old -> Insert new)
      if (data.availableRoles) {
          // A. Delete existing roles
          const { error: deleteError } = await supabase.from('user_roles').delete().eq('user_id', userId);
          if (deleteError) throw deleteError;

          // B. Prepare new roles payload
          const newRolesPayload = data.availableRoles.map(role => {
              const dbRole = role === UserRole.DR_PAYASO ? 'dr_payaso' : 
                             role === UserRole.RECRUIT ? 'recluta' : 
                             role === UserRole.PHOTOGRAPHER ? 'fotografo' :
                             role === UserRole.ADMIN ? 'admin' :
                             role === UserRole.BOARD ? 'junta_directiva' : 
                             role === UserRole.TREASURER ? 'tesorero' : 'otro';
              
              return {
                  user_id: userId,
                  rol: dbRole,
                  activo: true,
                  // Only add artistic details if role is Dr. Payaso
                  nombre_artistico: role === UserRole.DR_PAYASO ? data.artisticName : null,
                  foto_personaje_url: role === UserRole.DR_PAYASO ? data.characterPhotoUrl : null,
                  fecha_asignacion: new Date()
              };
          });

          // C. Insert new roles
          const { error: insertError } = await supabase.from('user_roles').insert(newRolesPayload);
          if (insertError) throw insertError;
      }
  },
  
  // 💰 FINANCE
  getPayments: async (userId?: string): Promise<Payment[]> => {
    let query = supabase.from('payments').select('*').order('created_at', { ascending: false });
    if (userId) query = query.eq('user_id', userId);
    const { data } = await query;

    return (data || []).map((p: any) => ({
        id: p.id,
        userId: p.user_id,
        amount: p.monto,
        month: p.mes_correspondiente,
        datePaid: p.fecha_pago,
        status: p.estado || 'paid', 
        referenceId: p.notas,
        receiptUrl: p.comprobante_url // Map from DB
    }));
  },

  createPayment: async (data: CreatePaymentData): Promise<Payment> => {
     const { data: payment, error } = await supabase.from('payments').insert({
         user_id: data.userId,
         monto: data.amount,
         mes_correspondiente: data.month,
         notas: data.referenceId ? `Ref: ${data.referenceId}. ${data.notes}` : data.notes,
         estado: data.status,
         comprobante_url: data.receiptUrl // Save to DB
     }).select().single();

     if (error) throw error;

     return {
         id: payment.id,
         userId: payment.user_id,
         amount: payment.monto,
         month: payment.mes_correspondiente,
         datePaid: payment.fecha_pago,
         status: payment.estado,
         referenceId: data.referenceId,
         receiptUrl: data.receiptUrl
     }
  },

  updatePaymentStatus: async (paymentId: string, status: 'paid' | 'rejected'): Promise<void> => {
      const { error } = await supabase.from('payments').update({ estado: status }).eq('id', paymentId);
      if (error) throw error;
  },
  
  // 🏥 LOCATIONS
  getLocations: async (includeInactive = false): Promise<PayasoLocation[]> => {
      let query = supabase.from('locations').select('*');
      if (!includeInactive) query = query.eq('activo', true);
      const { data, error } = await query.order('nombre');
      if (error) return [];
      
      return data.map((l: any) => ({
          id: l.id,
          name: l.nombre,
          type: l.tipo,
          address: l.direccion,
          active: l.activo
      }));
  },
  
  createLocation: async (name: string, type: PayasoLocation['type'], address: string): Promise<PayasoLocation> => {
      const { data, error } = await supabase.from('locations').insert({ nombre: name, tipo: type, direccion: address, activo: true }).select().single();
      if (error) throw error;
      return { id: data.id, name: data.nombre, type: data.tipo, address: data.direccion, active: data.activo };
  },

  updateLocation: async (id: string, data: Partial<PayasoLocation>): Promise<void> => {
      const { error } = await supabase.from('locations').update({ nombre: data.name, tipo: data.type, direccion: data.address, activo: data.active }).eq('id', id);
      if (error) throw error;
  },

  toggleLocationStatus: async (id: string, active: boolean): Promise<void> => {
      const { error } = await supabase.from('locations').update({ activo: active }).eq('id', id);
      if (error) throw error;
  },
  
  // 📊 STATS
  getUserStats: async (userId: string): Promise<UserStats> => {
      const { count: visits } = await supabase.from('visit_registrations').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('asistio', true);
      const { count: trainings } = await supabase.from('training_confirmations').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('asistio', true);
      const { data: gradReq } = await supabase.from('graduation_requests').select('id').eq('recluta_id', userId).maybeSingle();

      return { 
          trainingHours: (trainings || 0) * 2, 
          visitsCount: visits || 0,
          graduationRequested: !!gradReq
      };
  },

  requestGraduation: async (userId: string): Promise<void> => {
      const { error } = await supabase.from('graduation_requests').insert({ recluta_id: userId, estado: 'pendiente' });
      if (error) throw error;
  },

  getGraduationRequests: async (): Promise<GraduationRequest[]> => {
      const { data, error } = await supabase.from('graduation_requests').select(`*, profiles:recluta_id(nombre_completo, foto_personal_url)`).eq('estado', 'pendiente');
      if (error) return [];
      const requests: GraduationRequest[] = [];
      for (const req of data) {
          const stats = await SupabaseService.getUserStats(req.recluta_id);
          requests.push({
              id: req.id,
              userId: req.recluta_id,
              userFullName: req.profiles.nombre_completo,
              userPhoto: req.profiles.foto_personal_url,
              status: 'pending',
              requestDate: req.fecha_solicitud,
              stats: stats
          });
      }
      return requests;
  },

  approveGraduation: async (requestId: string): Promise<void> => {
      const { data: req } = await supabase.from('graduation_requests').update({ estado: 'aprobada' }).eq('id', requestId).select().single();
      if (req) {
          const { data: existingRoles } = await supabase.from('user_roles').select('id').eq('user_id', req.recluta_id).eq('activo', true);
          if (existingRoles && existingRoles.length > 0) {
              await supabase.from('user_roles').update({ rol: 'dr_payaso', fecha_asignacion: new Date() }).eq('id', existingRoles[0].id);
          } else {
              await supabase.from('user_roles').insert({ user_id: req.recluta_id, rol: 'dr_payaso' });
          }
      }
  },

  rejectGraduation: async (requestId: string): Promise<void> => {
      await supabase.from('graduation_requests').update({ estado: 'rechazada' }).eq('id', requestId);
  },
  
  // 📝 ATTENDANCE
  getEventAttendees: async (eventId: string): Promise<AttendanceRecord[]> => {
    // Try visits first
    const { data: visitRegs } = await supabase
        .from('visit_registrations')
        .select(`*, profiles:user_id(id, nombre_completo, foto_personal_url)`)
        .eq('visit_id', eventId);

    if (visitRegs && visitRegs.length > 0) {
        return visitRegs.map((r: any) => ({
            userId: r.profiles.id,
            userFullName: r.profiles.nombre_completo,
            userPhoto: r.profiles.foto_personal_url,
            userRole: r.rol_asistencia || 'Voluntario', 
            status: r.asistio === true ? 'attended' : r.asistio === false ? 'absent' : 'registered'
        }));
    }
    // Fallback for trainings
    const { data: trainingRegs } = await supabase
        .from('training_confirmations')
        .select(`*, profiles:user_id(id, nombre_completo, foto_personal_url)`)
        .eq('training_id', eventId);

    return (trainingRegs || []).map((r: any) => ({
        userId: r.profiles.id,
        userFullName: r.profiles.nombre_completo,
        userPhoto: r.profiles.foto_personal_url,
        userRole: 'Asistente',
        status: r.asistio === true ? 'attended' : r.asistio === false ? 'absent' : 'registered'
    }));
  },

  markAttendance: async (eventId: string, userId: string, status: 'attended' | 'absent'): Promise<void> => {
    const val = status === 'attended';
    // Attempt update on both tables
    await supabase.from('visit_registrations').update({ asistio: val }).eq('visit_id', eventId).eq('user_id', userId);
    await supabase.from('training_confirmations').update({ asistio: val }).eq('training_id', eventId).eq('user_id', userId);
  },
  
  // 💬 CHAT IMPLEMENTATION (Real)
  getEventMessages: async (eventId: string): Promise<ChatMessage[]> => {
      const { data, error } = await supabase
        .from('event_chat_messages')
        .select(`*, profiles:user_id(nombre_completo, foto_personal_url, user_roles(rol, nombre_artistico))`)
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data.map((msg: any) => {
          // Find artistic name if Dr. Payaso
          const drRole = msg.profiles.user_roles.find((r:any) => r.rol === 'dr_payaso');
          const displayName = drRole?.nombre_artistico || msg.profiles.nombre_completo;

          return {
              id: msg.id,
              eventId: msg.event_id,
              userId: msg.user_id,
              userName: displayName,
              userPhoto: msg.profiles.foto_personal_url,
              text: msg.message,
              timestamp: msg.created_at
          };
      });
  },

  sendEventMessage: async (eventId: string, userId: string, text: string): Promise<ChatMessage> => {
      const { data, error } = await supabase
        .from('event_chat_messages')
        .insert({
            event_id: eventId,
            user_id: userId,
            message: text
        })
        .select(`*, profiles:user_id(nombre_completo, foto_personal_url, user_roles(rol, nombre_artistico))`)
        .single();

      if (error) throw error;

      const msg = data;
      const drRole = msg.profiles.user_roles.find((r:any) => r.rol === 'dr_payaso');
      const displayName = drRole?.nombre_artistico || msg.profiles.nombre_completo;

      return {
          id: msg.id,
          eventId: msg.event_id,
          userId: msg.user_id,
          userName: displayName,
          userPhoto: msg.profiles.foto_personal_url,
          text: msg.message,
          timestamp: msg.created_at
      };
  },
  
  // 🛠️ ADMIN HELPERS
  adminCreateUser: async (userData: any): Promise<void> => {
      if (!supabaseUrl || !supabaseAnonKey || supabaseAnonKey.includes('PLACEHOLDER')) {
          throw new Error("Credenciales de Supabase no configuradas.");
      }
      
      const tempClient = createClient(supabaseUrl, supabaseAnonKey, { 
          auth: { 
              persistSession: false, 
              autoRefreshToken: false, 
              detectSessionInUrl: false 
          } 
      });
      
      const { data: authData, error: authError } = await tempClient.auth.signUp({ 
          email: userData.email, 
          password: userData.password, 
          options: { data: { full_name: userData.fullName } } 
      });
      
      if (authError) throw authError;
      if (!authData.user) throw new Error("No creado");
      
      const newUserId = authData.user.id;
      
      // Update Profile using MAIN authenticated client (to avoid RLS issues if tempClient is anonymous)
      // Actually, tempClient is ANON, so we need to rely on the backend trigger or use the current admin session to update the profile
      // But `profiles` policy usually allows update by self or admin. 
      // Safest way: Use the Main Client (which should be logged in as Admin) to insert roles/update profile
      
      await supabase.from('profiles').update({ 
          nombre_completo: userData.fullName, 
          cedula: userData.cedula, 
          telefono: userData.phone, 
          estado: 'activo',
          foto_personal_url: userData.photoUrl
      }).eq('id', newUserId);
      
      const roleData: any = { 
          user_id: newUserId, 
          rol: userData.role === UserRole.DR_PAYASO ? 'dr_payaso' : userData.role === UserRole.RECRUIT ? 'recluta' : userData.role === UserRole.ADMIN ? 'admin' : 'otro', 
          activo: true 
      };
      
      if (userData.role === UserRole.DR_PAYASO) { 
          roleData.nombre_artistico = userData.artisticName; 
      }
      
      await supabase.from('user_roles').insert(roleData);
  },
  
  sendMassMessage: async (targetRoles: UserRole[], subject: string, body: string): Promise<SystemMessage> => {
    const { data, error } = await supabase.from('messages').insert({ target_roles: targetRoles, subject, body }).select().single();
    if (error) throw error;
    return { id: data.id, targetRoles, subject, body, sentAt: data.created_at, sentBy: 'admin' }
  },

  dev_makeAdmin: async (userId: string): Promise<void> => {
      await supabase.from('profiles').update({ is_super_admin: true }).eq('id', userId);
      const { data: existing } = await supabase.from('user_roles').select('*').eq('user_id', userId).eq('rol', 'admin').maybeSingle();
      if(!existing) {
          await supabase.from('user_roles').insert({ user_id: userId, rol: 'admin', activo: true });
      }
  },
};

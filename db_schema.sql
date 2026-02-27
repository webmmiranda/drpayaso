
-- ==============================================================================
-- 🤡 DR. PAYASO MANAGER - SCHEME DE BASE DE DATOS (V1.0 FINAL)
-- Ejecutar todo este script en el SQL Editor de Supabase para inicializar.
-- ==============================================================================

-- 1. EXTENSIONES
create extension if not exists "uuid-ossp";

-- ==========================================
-- 2. DEFINICIÓN DE TABLAS
-- ==========================================

-- 2.1 PERFILES (Usuarios Base)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  cedula text,
  nombre_completo text,
  telefono text,
  whatsapp text,
  foto_personal_url text,
  estado text default 'activo', -- 'activo' | 'inactivo'
  fecha_vigencia date,
  notas_privadas text,
  habilidades text,
  direccion text,
  is_super_admin boolean default false,
  exempt_from_fees boolean default false, -- Para tesorería
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2.2 ROLES DE USUARIO (Multi-rol)
-- Guarda la información específica del personaje aquí (Nombre Dr, Foto Personaje)
create table if not exists public.user_roles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  rol text not null, -- 'admin', 'dr_payaso', 'recluta', 'fotografo', 'junta_directiva', 'tesorero', 'otro'
  nombre_artistico text, -- Solo para Dr. Payaso
  foto_personaje_url text, -- Foto para el reverso del carnet
  fecha_asignacion date default current_date,
  activo boolean default true
);

-- 2.3 UBICACIONES (Hospitales, Centros)
create table if not exists public.locations (
  id uuid default uuid_generate_v4() primary key,
  nombre text not null,
  direccion text,
  tipo text, -- 'hospital', 'albergue', 'escuela', 'otro'
  notas text,
  activo boolean default true
);

-- 2.4 ENTRENAMIENTOS (Eventos tipo Taller)
create table if not exists public.trainings (
  id uuid default uuid_generate_v4() primary key,
  titulo text not null,
  descripcion text,
  fecha_hora timestamp with time zone not null,
  location_id uuid references public.locations(id),
  ubicacion_manual text,
  tipo_participantes text, 
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2.5 VISITAS HOSPITALARIAS (Eventos con Cupos Granulares)
create table if not exists public.hospital_visits (
  id uuid default uuid_generate_v4() primary key,
  titulo text not null,
  fecha_hora timestamp with time zone not null,
  location_id uuid references public.locations(id),
  ubicacion_manual text,
  -- Cupos específicos por rol
  cupos_reclutas int default 0,
  cupos_dres int default 0,
  cupos_fotografos int default 0,
  cupos_otros int default 0,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2.6 REGISTROS/INSCRIPCIONES
create table if not exists public.visit_registrations (
  id uuid default uuid_generate_v4() primary key,
  visit_id uuid references public.hospital_visits(id) on delete cascade,
  user_id uuid references public.profiles(id),
  rol_asistencia text, -- Como qué rol asiste (ej. un Admin asistiendo como Fotógrafo)
  registered_at timestamp with time zone default timezone('utc'::text, now()),
  asistio boolean, -- Control de asistencia (Check-in)
  unique(visit_id, user_id)
);

create table if not exists public.training_confirmations (
  id uuid default uuid_generate_v4() primary key,
  training_id uuid references public.trainings(id) on delete cascade,
  user_id uuid references public.profiles(id),
  registered_at timestamp with time zone default timezone('utc'::text, now()),
  asistio boolean,
  unique(training_id, user_id)
);

-- 2.7 PAGOS Y TESORERÍA
create table if not exists public.payments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id),
  monto numeric,
  mes_correspondiente text,
  fecha_pago date default current_date,
  notas text, -- Referencia SINPE, etc.
  comprobante_url text, -- URL de la imagen del recibo
  estado text default 'pending_approval', -- 'paid', 'pending_approval', 'rejected'
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2.8 MENSAJERÍA
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  from_user_id uuid references public.profiles(id),
  target_roles text[], 
  subject text,
  body text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.event_chat_messages (
    id uuid default uuid_generate_v4() primary key,
    event_id uuid, -- ID genérico para visita o training
    user_id uuid references public.profiles(id),
    message text,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2.9 SOLICITUDES DE GRADUACIÓN
create table if not exists public.graduation_requests (
  id uuid default uuid_generate_v4() primary key,
  recluta_id uuid references public.profiles(id),
  solicitado_por uuid, 
  estado text default 'pendiente', 
  fecha_solicitud timestamp with time zone default timezone('utc'::text, now()),
  notas text
);

-- ==========================================
-- 3. CONFIGURACIÓN DE STORAGE (Imágenes)
-- ==========================================
-- Crea el bucket público para fotos de perfil y comprobantes
insert into storage.buckets (id, name, public) 
values ('payaso_assets', 'payaso_assets', true)
on conflict (id) do nothing;

-- ==========================================
-- 4. SEGURIDAD (RLS POLICIES)
-- ==========================================

-- Habilitar RLS en todas las tablas
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.payments enable row level security;
alter table public.hospital_visits enable row level security;
alter table public.trainings enable row level security;
alter table public.visit_registrations enable row level security;
alter table public.training_confirmations enable row level security;
alter table public.graduation_requests enable row level security;
alter table public.event_chat_messages enable row level security;
alter table public.locations enable row level security;

-- Limpiar políticas antiguas si existen (para evitar duplicados al re-ejecutar)
drop policy if exists "Public Profiles Read" on public.profiles;
drop policy if exists "User Update Self" on public.profiles;
drop policy if exists "Admin Update All" on public.profiles;
-- ... (se asume limpieza o creación "if not exists" lógica, simplificado aquí para creación directa)

-- 4.1 POLÍTICAS DE PERFILES
-- Todos pueden ver los perfiles (Directorio)
create policy "Public Profiles Read" on public.profiles for select using (true);
-- Usuarios editan su propio perfil
create policy "User Update Self" on public.profiles for update using (auth.uid() = id);
-- Admins pueden editar a cualquiera
create policy "Admin Update All" on public.profiles for update using (
  exists (select 1 from public.profiles where id = auth.uid() and is_super_admin = true)
);

-- 4.2 POLÍTICAS DE ROLES
create policy "Roles Read" on public.user_roles for select using (true);
create policy "Admin Manage Roles" on public.user_roles for all using (
  exists (select 1 from public.profiles where id = auth.uid() and is_super_admin = true)
);
-- Permitir al usuario editar sus roles (necesario para cuando actualiza su perfil y se recrean los roles)
create policy "User Manage Own Roles" on public.user_roles for all using (user_id = auth.uid());

-- 4.3 POLÍTICAS DE PAGOS
create policy "User View Own Payments" on public.payments for select using (auth.uid() = user_id);
create policy "Admin View All Payments" on public.payments for select using (
  exists (select 1 from public.profiles where id = auth.uid() and is_super_admin = true)
);
create policy "User Create Own Payment" on public.payments for insert with check (auth.uid() = user_id);
create policy "Admin Manage Payments" on public.payments for all using (
  exists (select 1 from public.profiles where id = auth.uid() and is_super_admin = true)
);

-- 4.4 POLÍTICAS DE EVENTOS Y CHAT
create policy "Events View" on public.hospital_visits for select using (auth.role() = 'authenticated');
create policy "Training View" on public.trainings for select using (auth.role() = 'authenticated');
create policy "Locations View" on public.locations for select using (auth.role() = 'authenticated');
create policy "Chat View" on public.event_chat_messages for select using (auth.role() = 'authenticated');
create policy "Chat Insert" on public.event_chat_messages for insert with check (auth.uid() = user_id);

create policy "Admin Manage Events" on public.hospital_visits for all using (
  exists (select 1 from public.profiles where id = auth.uid() and is_super_admin = true)
);
create policy "Admin Manage Trainings" on public.trainings for all using (
  exists (select 1 from public.profiles where id = auth.uid() and is_super_admin = true)
);
create policy "Admin Manage Locations" on public.locations for all using (
  exists (select 1 from public.profiles where id = auth.uid() and is_super_admin = true)
);

-- 4.5 POLÍTICAS DE INSCRIPCIÓN
create policy "View Own Registrations" on public.visit_registrations for select using (auth.uid() = user_id);
create policy "Create Own Registration" on public.visit_registrations for insert with check (auth.uid() = user_id);
create policy "Delete Own Registration" on public.visit_registrations for delete using (auth.uid() = user_id);
create policy "Admin Manage Registrations" on public.visit_registrations for all using (
  exists (select 1 from public.profiles where id = auth.uid() and is_super_admin = true)
);

create policy "View Own Train Reg" on public.training_confirmations for select using (auth.uid() = user_id);
create policy "Create Own Train Reg" on public.training_confirmations for insert with check (auth.uid() = user_id);
create policy "Delete Own Train Reg" on public.training_confirmations for delete using (auth.uid() = user_id);
create policy "Admin Manage Train Reg" on public.training_confirmations for all using (
  exists (select 1 from public.profiles where id = auth.uid() and is_super_admin = true)
);

-- 4.6 POLÍTICAS DE GRADUACIÓN
create policy "Read Grad Requests" on public.graduation_requests for select using (true);
create policy "Create Grad Requests" on public.graduation_requests for insert with check (auth.uid() = recluta_id);
create policy "Admin Manage Grad Requests" on public.graduation_requests for all using (
  exists (select 1 from public.profiles where id = auth.uid() and is_super_admin = true)
);

-- 4.7 POLÍTICAS DE STORAGE
-- Permitir ver imágenes a cualquiera (para que carguen en el frontend)
create policy "Public Access Bucket" on storage.objects for select using ( bucket_id = 'payaso_assets' );
-- Permitir subir imágenes a cualquier usuario autenticado (fotos perfil, recibos)
create policy "Auth Upload Bucket" on storage.objects for insert with check ( bucket_id = 'payaso_assets' and auth.role() = 'authenticated' );

-- ==========================================
-- 5. TRIGGERS (Automatización)
-- ==========================================

-- Función para crear perfil automáticamente al registrarse en Auth
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, nombre_completo, cedula)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'cedula' -- Opcional si viene en meta
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

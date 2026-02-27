
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zmswleejifeuxtoqutrs.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_qwoyAUzUkJmwEPKrbK9c6Q_N8shX1dz';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => {
    return !!supabaseUrl && !!supabaseAnonKey;
};


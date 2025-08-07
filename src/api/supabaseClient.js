import { createClient } from '@supabase/supabase-js';

// 1. Obtiene las variables de entorno específicas de Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 2. Valida que las variables de entorno estén definidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Las variables de entorno de Supabase no están configuradas.');
  console.error('Por favor, asegúrate de que VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY estén definidas en tu archivo .env.local');
  console.error('URL:', supabaseUrl ? '✅ Configurada' : '❌ Faltante');
  console.error('ANON KEY:', supabaseAnonKey ? '✅ Configurada' : '❌ Faltante');
}

// 3. Crea una única instancia del cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// 4. Función de utilidad para verificar la conexión
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('test').select('*').limit(1);
    if (error) {
      console.error('❌ Error de conexión con Supabase:', error.message);
      return false;
    }
    console.log('✅ Conexión con Supabase establecida correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con Supabase:', error);
    return false;
  }
};
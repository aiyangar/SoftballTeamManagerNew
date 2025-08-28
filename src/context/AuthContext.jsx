import { createContext, useEffect, useState, useContext } from 'react';
import { supabase } from '../supabaseClient';

// Contexto para manejar la autenticación global de la aplicación
const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  // Estado de la sesión del usuario (null = no autenticado, objeto = autenticado)
  const [session, setSession] = useState(null);
  // Estado de carga para mostrar spinners mientras se verifica la autenticación
  const [loading, setLoading] = useState(true);

  /**
   * Registra un nuevo usuario o hace signin si ya existe
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Object} - Resultado de la operación con success, data y isExistingUser
   */
  const signUpNewUser = async (email, password) => {
    // Guardar la sesión actual antes de cualquier operación
    const currentSession = session;

    try {
      // Primero intentar hacer signin (para usuarios existentes)
      // Esto evita el problema de "Email no confirmado" para usuarios ya registrados
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (signInData.user) {
        // Restaurar la sesión original si había una
        if (currentSession && currentSession !== signInData.session) {
          await supabase.auth.setSession(currentSession);
        }
        return { success: true, data: signInData, isExistingUser: true };
      }
    } catch {
      console.log('Usuario no existe, procediendo con registro');
    }

    // Si el usuario no existe, crear una nueva cuenta
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        // URL de redirección después de confirmar email
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      console.error('Error en signup:', error);
      return { success: false, error: error.message };
    }

    // Restaurar la sesión original después de crear el usuario
    if (currentSession) {
      await supabase.auth.setSession(currentSession);
    }

    return { success: true, data: data, isExistingUser: false };
  };

  /**
   * Inicia sesión con email y contraseña
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Object} - Resultado de la operación con success y data/error
   */
  const signInUser = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.error('Error en signin:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data };
    } catch (error) {
      console.error('Error inesperado en signin:', error);
      return { success: false, error: error.message };
    }
  };

  // Effect para inicializar y escuchar cambios de autenticación
  useEffect(() => {
    // Función para obtener la sesión inicial al cargar la app
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          console.error('Error obteniendo sesión inicial:', error);
        }
        setSession(session);
      } catch (error) {
        console.error('Error inesperado obteniendo sesión inicial:', error);
      } finally {
        setLoading(false); // Marcar como no cargando independientemente del resultado
      }
    };

    // Obtener sesión inicial
    getInitialSession();

    // Suscribirse a cambios de estado de autenticación
    // Esto se ejecuta cuando el usuario hace login/logout
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Cleanup: desuscribirse cuando el componente se desmonte
    return () => subscription.unsubscribe();
  }, []);

  /**
   * Cierra la sesión del usuario actual
   * @returns {Promise<void>}
   */
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Proporcionar el contexto con todos los valores y funciones necesarias
  return (
    <AuthContext.Provider
      value={{ session, loading, signUpNewUser, signInUser, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook personalizado para acceder al contexto de autenticación
 * @returns {Object} - Objeto con session, loading y funciones de auth
 */
export const UserAuth = () => {
  const context = useContext(AuthContext);

  // Verificar si el contexto está disponible
  if (context === undefined) {
    console.error('UserAuth debe ser usado dentro de un AuthContextProvider');
    // Retornar valores por defecto para evitar errores
    return {
      session: null,
      loading: true,
      signUpNewUser: async () => ({
        success: false,
        error: 'Context not available',
      }),
      signInUser: async () => ({
        success: false,
        error: 'Context not available',
      }),
      signOut: async () => {},
    };
  }

  return context;
};

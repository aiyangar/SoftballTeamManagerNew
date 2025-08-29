import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext.jsx';
import MySoftballClubLogo from '../assets/MySoftballClubLogoV2.png';

/**
 * Componente para el inicio de sesión de usuarios existentes
 * Permite autenticarse con email y contraseña
 */
const Signin = () => {
  // Estados para manejar el formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Estado de carga durante el proceso
  const [error, setError] = useState(null); // Estado para mostrar errores

  // Hook para navegación programática
  const navigate = useNavigate();

  // Obtener funciones de autenticación del contexto
  const authContext = UserAuth();
  // const session = authContext?.session
  const signInUser = authContext?.signInUser;

  /**
   * Maneja el envío del formulario de inicio de sesión
   * @param {Event} e - Evento del formulario
   */
  const handleSignIn = async e => {
    e.preventDefault(); // Prevenir envío por defecto del formulario
    setLoading(true); // Activar estado de carga
    setError(null); // Limpiar errores anteriores

    try {
      // Intentar iniciar sesión con las credenciales proporcionadas
      const result = await signInUser(email, password);

      if (result.success) {
        // Redirigir al dashboard después de autenticación exitosa
        navigate('/dashboard');
      } else {
        // Mostrar error si la autenticación falló
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Error inesperado en handleSignIn:', error);
      setError(error.message || 'Error inesperado');
    } finally {
      setLoading(false); // Desactivar estado de carga
    }
  };

  return (
    <>
      <div className='min-h-screen bg-gray-900 flex items-center justify-center'>
        <form onSubmit={handleSignIn} className='max-w-md w-full mx-4'>
          {/* Logo */}
          <div className='flex justify-center mb-6'>
            <img 
              src={MySoftballClubLogo} 
              alt='MySoftballClub Logo' 
              className='h-20 w-auto'
            />
          </div>
          
          <h2 className='font-bold pb-2 text-2xl text-white'>Iniciar Sesión</h2>
          <p className='text-gray-400 mb-6'>
            ¿No tienes una cuenta?{' '}
            <Link to='/signup' className='text-blue-400 hover:text-blue-300'>
              Regístrate
            </Link>
          </p>

          <div className='flex flex-col py-4'>
            <input
              id='email'
              name='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              className='p-3 border mt-6 border-gray-600 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              type='email'
              placeholder='Email'
              required
            />
            <input
              id='password'
              name='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              className='p-3 border mt-6 border-gray-600 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              type='password'
              placeholder='Contraseña'
              required
            />
            <button
              type='submit'
              disabled={loading}
              className='mt-6 border border-gray-600 rounded-md p-3 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors'
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>

            {error && (
              <div className='mt-4 p-3 bg-red-900 border border-red-600 text-red-200 rounded'>
                {error}
              </div>
            )}
          </div>
        </form>
      </div>
    </>
  );
};

export default Signin;

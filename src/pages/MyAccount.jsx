import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import Menu from '../components/Menu';

const MyAccount = () => {
  const navigate = useNavigate();
  const authContext = UserAuth();
  const session = authContext?.session;

  // Estados para el formulario de cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Limpiar mensaje de éxito después de 5 segundos
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Si no hay sesión, redirigir al login
  if (!session) {
    navigate('/signin');
    return null;
  }

  const handlePasswordChange = e => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar errores cuando el usuario empiece a escribir
    if (error) setError(null);
  };

  const validatePassword = password => {
    // Validar que la contraseña tenga al menos 6 caracteres
    if (password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    return null;
  };

  const handlePasswordSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validar que las contraseñas coincidan
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('Las contraseñas nuevas no coinciden');
        return;
      }

      // Validar la nueva contraseña
      const passwordError = validatePassword(passwordData.newPassword);
      if (passwordError) {
        setError(passwordError);
        return;
      }

      // Cambiar la contraseña usando Supabase
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) {
        setError('Error al cambiar la contraseña: ' + error.message);
      } else {
        setSuccess('✅ Contraseña cambiada exitosamente');
        // Limpiar el formulario
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      setError('Error inesperado al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = dateString => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <div>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-2xl font-bold text-white'>Mi Cuenta</h1>
        </div>

        {/* Mensajes de error y éxito */}
        {error && (
          <div className='bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded mb-6'>
            {error}
          </div>
        )}
        {success && (
          <div className='bg-green-900 border border-green-600 text-green-200 px-4 py-3 rounded mb-6'>
            {success}
          </div>
        )}

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Información Personal */}
          <div className='bg-neutral-900 shadow rounded-lg p-6 border border-gray-700'>
            <h2 className='text-xl font-semibold mb-6 text-white'>
              Información Personal
            </h2>

            <div className='space-y-4'>
                             <div>
                 <label className='block text-sm font-medium text-gray-300 mb-2'>
                   Correo Electrónico
                 </label>
                 <div className='p-3 bg-gray-800 border border-gray-600 rounded text-white'>
                   {session.user.email}
                 </div>
               </div>

               <div>
                 <label className='block text-sm font-medium text-gray-300 mb-2'>
                   Fecha de Registro
                 </label>
                 <div className='p-3 bg-gray-800 border border-gray-600 rounded text-white'>
                   {formatDate(session.user.created_at)}
                 </div>
               </div>

              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Última Actualización
                </label>
                <div className='p-3 bg-gray-800 border border-gray-600 rounded text-white'>
                  {formatDate(session.user.updated_at)}
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Estado de la Cuenta
                </label>
                <div className='flex items-center space-x-2'>
                  <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                  <span className='text-green-400 font-medium'>Activa</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cambio de Contraseña */}
          <div className='bg-neutral-900 shadow rounded-lg p-6 border border-gray-700'>
            <h2 className='text-xl font-semibold mb-6 text-white'>
              Cambiar Contraseña
            </h2>

            <form onSubmit={handlePasswordSubmit} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Contraseña Actual
                </label>
                <input
                  type='password'
                  name='currentPassword'
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className='w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none'
                  placeholder='Ingresa tu contraseña actual'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Nueva Contraseña
                </label>
                <input
                  type='password'
                  name='newPassword'
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className='w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none'
                  placeholder='Mínimo 6 caracteres'
                  required
                />
                <p className='text-xs text-gray-400 mt-1'>
                  La contraseña debe tener al menos 6 caracteres
                </p>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type='password'
                  name='confirmPassword'
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className='w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none'
                  placeholder='Confirma tu nueva contraseña'
                  required
                />
              </div>

              <div className='bg-blue-900 border border-blue-600 text-blue-200 px-4 py-3 rounded text-sm'>
                <div className='flex items-center space-x-2'>
                  <span className='text-blue-300'>ℹ️</span>
                  <span>
                    Después de cambiar tu contraseña, deberás iniciar sesión
                    nuevamente.
                  </span>
                </div>
              </div>

              <button
                type='submit'
                disabled={loading}
                className='w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2'
              >
                {loading ? (
                  <>
                    <svg
                      className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      ></path>
                    </svg>
                    <span>Cambiando contraseña...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className='w-5 h-5'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                      />
                    </svg>
                    <span>Cambiar Contraseña</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Información Adicional */}
        <div className='mt-8 bg-neutral-900 shadow rounded-lg p-6 border border-gray-700'>
          <h2 className='text-xl font-semibold mb-4 text-white'>
            Información de Seguridad
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-3'>
              <div className='flex items-center space-x-3'>
                <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                <span className='text-gray-300'>
                  Autenticación segura
                </span>
              </div>
              <div className='flex items-center space-x-3'>
                <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                <span className='text-gray-300'>
                  Contraseñas encriptadas
                </span>
              </div>
              <div className='flex items-center space-x-3'>
                <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                <span className='text-gray-300'>
                  Sesiones protegidas
                </span>
              </div>
            </div>

            <div className='space-y-3'>
              <div className='flex items-center space-x-3'>
                <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                <span className='text-gray-300'>
                  Acceso solo para usuarios aprobados
                </span>
              </div>
              <div className='flex items-center space-x-3'>
                <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                <span className='text-gray-300'>
                  Datos almacenados de forma segura
                </span>
              </div>
              <div className='flex items-center space-x-3'>
                <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                <span className='text-gray-300'>
                  Protección contra acceso no autorizado
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyAccount;

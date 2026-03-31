import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import { useTeam } from '../context/useTeam';
import { getFullVersion } from '../version';

/**
 * Componente Menu - Menú desplegable reutilizable
 * Se puede usar en todas las páginas de la aplicación
 */
const Menu = () => {
  const authContext = UserAuth();
  const session = authContext?.session;
  const signOut = authContext?.signOut;
  const { teams, selectedTeam, handleTeamChange } = useTeam();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  /**
   * Maneja el proceso de cerrar sesión
   */
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/signin');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  /**
   * Maneja la navegación al Dashboard
   */
  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className='flex items-center space-x-4'>
      {/* Botón fijo para ir al Dashboard */}
      <button
        onClick={handleGoToDashboard}
        className='p-2 rounded-lg text-slate-200 hover:bg-surface-700 transition-colors flex items-center border border-surface-border'
        title='Ir al Dashboard'
      >
        <svg
          className='w-6 h-6'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
          />
        </svg>
      </button>

      {/* Menú desplegable */}
      <div className='relative'>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className='p-2 rounded-lg text-slate-200 hover:bg-surface-700 transition-colors flex items-center border border-surface-border'
          title='Abrir menú de navegación'
        >
          <svg
            className='w-6 h-6'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M4 6h16M4 12h16M4 18h16'
            />
          </svg>
        </button>

        {showMenu && (
          <div className='absolute right-0 mt-2 w-64 bg-neutral-900 border border-gray-600 rounded-lg shadow-lg z-50'>
            <div className='p-4'>
              <h3 className='text-white font-semibold mb-3'>Navegación</h3>

              {/* Selector de Equipo (solo si hay más de un equipo) */}
              {teams.length > 1 && (
                <div className='mb-4'>
                  <label className='block text-white text-sm mb-2'>
                    Seleccionar Equipo
                  </label>
                  <select
                    value={selectedTeam ? String(selectedTeam) : ''}
                    onChange={e => {
                      const teamId = e.target.value === '' ? '' : e.target.value;
                      handleTeamChange(teamId);
                    }}
                    className='w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-white text-sm'
                  >
                    <option value=''>Selecciona un equipo</option>
                    {teams.map(team => (
                      <option key={team.id} value={String(team.id)}>
                        {team.nombre_equipo}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Enlaces de navegación */}
              <div className='space-y-2'>
                <button
                  onClick={() => {
                    navigate('/dashboard');
                    setShowMenu(false);
                  }}
                  className='block w-full text-left px-3 py-2 text-white hover:bg-gray-800 rounded transition-colors'
                >
                  🏠 Dashboard
                </button>
                <Link
                  to='/teams'
                  className='block w-full text-left px-3 py-2 text-white hover:bg-gray-800 rounded transition-colors'
                  onClick={() => setShowMenu(false)}
                >
                  🏟️ Gestionar Equipos
                </Link>
                <Link
                  to='/players'
                  className='block w-full text-left px-3 py-2 text-white hover:bg-gray-800 rounded transition-colors'
                  onClick={() => setShowMenu(false)}
                >
                  👥 Gestionar Jugadores
                </Link>
                <Link
                  to='/schedule'
                  className='block w-full text-left px-3 py-2 text-white hover:bg-gray-800 rounded transition-colors'
                  onClick={() => setShowMenu(false)}
                >
                  ⚾ Gestionar Partidos
                </Link>

                {/* Enlace de administración (solo para administradores) */}
                {session?.user?.email === import.meta.env.VITE_ADMIN_EMAIL && (
                  <Link
                    to='/admin'
                    className='block w-full text-left px-3 py-2 text-yellow-400 hover:bg-yellow-900 rounded transition-colors'
                    onClick={() => setShowMenu(false)}
                  >
                    ⚙️ Administración
                  </Link>
                )}
              </div>

              <div className='border-t border-gray-600 mt-4 pt-4'>
                <Link
                  to='/myaccount'
                  className='block w-full text-left px-3 py-2 text-blue-400 hover:bg-blue-900 rounded transition-colors'
                  onClick={() => setShowMenu(false)}
                >
                  👤 Mi Cuenta
                </Link>
                <button
                  onClick={handleSignOut}
                  className='block w-full text-left px-3 py-2 text-red-400 hover:bg-red-900 rounded transition-colors'
                >
                  🚪 Cerrar Sesión
                </button>
              </div>
              <div className='text-center pt-3'>
                <p className='text-gray-400 text-xs'>{getFullVersion()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Overlay para cerrar menú */}
        {showMenu && (
          <div
            className='fixed inset-0 z-40'
            onClick={() => setShowMenu(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Menu;

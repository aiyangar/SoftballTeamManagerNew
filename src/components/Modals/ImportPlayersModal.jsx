import React from 'react';
import '../../styles/modalStyles.css';

/**
 * Modal para importar jugadores de otro equipo
 * @param {boolean} isOpen - Estado del modal
 * @param {Array} teams - Lista de equipos disponibles
 * @param {string} selectedTeam - ID del equipo actual seleccionado
 * @param {string} selectedTeamToImport - ID del equipo seleccionado para importar
 * @param {Function} onTeamToImportChange - Función para cambiar el equipo a importar
 * @param {string} importError - Mensaje de error de importación
 * @param {Function} onImportErrorClose - Función para cerrar el mensaje de error
 * @param {boolean} importingPlayers - Estado de carga de importación
 * @param {Function} onClose - Función para cerrar el modal
 * @param {Function} onImport - Función para ejecutar la importación
 */
const ImportPlayersModal = ({
  isOpen,
  teams = [],
  selectedTeam,
  selectedTeamToImport,
  onTeamToImportChange,
  importError,
  onImportErrorClose,
  importingPlayers = false,
  onClose,
  onImport,
}) => {
  if (!isOpen) return null;

  const currentTeamName = teams.find(team => String(team.id) === String(selectedTeam))?.nombre_equipo || 'Sin equipo seleccionado';

  return (
    <div className='fixed inset-0 modal-overlay flex items-center justify-center z-50'>
      <div className='bg-neutral-900 border border-gray-600 rounded-lg w-full max-w-md mx-4 modal-container'>
        <div className='modal-header p-6 border-b border-gray-600'>
          <div className='flex justify-between items-center'>
            <h2 className='text-xl font-semibold text-white'>
              Importar Jugadores de Otro Equipo
            </h2>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-white text-2xl'
              title='Cerrar modal de importación'
            >
              ×
            </button>
          </div>
        </div>

        <div className='modal-content p-6'>
          {/* Mensajes de error dentro del modal */}
          {importError && (
            <div className='mb-4 p-4 bg-red-900 border border-red-600 text-red-200 rounded-lg'>
              <div className='flex items-start justify-between'>
                <p className='text-sm'>{importError}</p>
                <button
                  onClick={onImportErrorClose}
                  className='ml-2 text-red-300 hover:text-red-100 text-xl'
                  title='Cerrar mensaje de error'
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Información del equipo actual */}
          <div className='mb-6 p-4 bg-gray-800 rounded-lg'>
            <h3 className='text-lg font-semibold text-white mb-2'>
              Equipo Actual
            </h3>
            <p className='text-gray-300'>
              {currentTeamName}
            </p>
          </div>

          {/* Selector de equipo origen */}
          <div className='space-y-4'>
            <div>
              <label className='block text-white mb-2 text-sm font-medium'>
                Seleccionar equipo del cual importar jugadores
              </label>
              <select
                value={selectedTeamToImport}
                onChange={(e) => onTeamToImportChange(e.target.value)}
                className='w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white'
                disabled={importingPlayers}
              >
                <option value=''>Seleccionar equipo...</option>
                {teams.map(team => (
                  <option key={team.id} value={String(team.id)}>
                    {team.nombre_equipo}
                    {String(team.id) === String(selectedTeam) ? ' (Equipo actual)' : ''}
                  </option>
                ))}
              </select>
              {teams.length === 0 && (
                <p className='text-sm text-gray-400 mt-2'>
                  No tienes equipos disponibles
                </p>
              )}
            </div>

            {/* Información sobre la importación */}
            <div className='p-4 bg-blue-900/30 border border-blue-700 rounded-lg'>
              <p className='text-sm text-blue-200'>
                <strong>Nota:</strong> Se importarán todos los jugadores del equipo seleccionado al equipo actual. 
                Los jugadores con el mismo nombre y número serán omitidos para evitar duplicados. 
                Las posiciones de cada jugador también se copiarán.
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className='flex space-x-3 mt-6'>
            <button
              onClick={onClose}
              disabled={importingPlayers}
              className='flex-1 px-4 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
            >
              Cancelar
            </button>
            <button
              onClick={onImport}
              disabled={importingPlayers || !selectedTeamToImport}
              className='flex-1 px-4 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
            >
              {importingPlayers ? 'Importando...' : 'Importar Jugadores'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportPlayersModal;


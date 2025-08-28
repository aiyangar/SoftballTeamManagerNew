import React from 'react';

/**
 * Componente para el formulario de registro y edición de jugadores
 * @param {Object} formData - Datos del formulario
 * @param {Function} onFormDataChange - Función para manejar cambios en los datos del formulario
 * @param {Array} selectedPositions - Posiciones seleccionadas
 * @param {Function} onPositionToggle - Función para manejar selección de posiciones
 * @param {Array} positions - Lista de posiciones disponibles
 * @param {Array} teams - Lista de equipos disponibles
 * @param {Object} editingPlayer - Jugador en edición (null si es nuevo)
 * @param {boolean} loading - Estado de carga
 * @param {Function} onSubmit - Función para manejar el envío del formulario
 * @param {Function} onCancel - Función para cancelar el formulario
 */
const PlayerForm = ({
  formData,
  onFormDataChange,
  selectedPositions,
  onPositionToggle,
  positions,
  teams,
  editingPlayer,
  loading,
  onSubmit,
  onCancel,
}) => {
  const handleSubmit = e => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <div className='bg-neutral-900 shadow rounded-lg p-6 mb-8'>
      <h2 className='text-xl font-semibold mb-6 text-white'>
        {editingPlayer ? 'Editar Jugador' : 'Registrar Nuevo Jugador'}
      </h2>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Nombre *
            </label>
            <input
              id='playerName'
              name='playerName'
              type='text'
              value={formData.name}
              onChange={e => onFormDataChange('name', e.target.value)}
              className='w-full p-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-gray-800 text-white'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Número *
            </label>
            <input
              id='playerNumber'
              name='playerNumber'
              type='number'
              min='0'
              max='99'
              value={formData.numero}
              onChange={e => onFormDataChange('numero', e.target.value)}
              className='w-full p-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-gray-800 text-white'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Teléfono
            </label>
            <input
              id='playerPhone'
              name='playerPhone'
              type='tel'
              value={formData.telefono}
              onChange={e => onFormDataChange('telefono', e.target.value)}
              className='w-full p-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-gray-800 text-white'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Email
            </label>
            <input
              id='playerEmail'
              name='playerEmail'
              type='email'
              value={formData.email}
              onChange={e => onFormDataChange('email', e.target.value)}
              className='w-full p-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-gray-800 text-white'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Equipo
            </label>
            <select
              value={formData.equipoId}
              onChange={e => onFormDataChange('equipoId', e.target.value)}
              className='w-full p-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-gray-800 text-white'
            >
              <option value=''>Seleccionar equipo</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.nombre_equipo}
                </option>
              ))}
            </select>
            {formData.equipoId && (
              <p className='text-xs text-blue-400 mt-1'>
                Equipo seleccionado:{' '}
                {
                  teams.find(team => team.id === formData.equipoId)
                    ?.nombre_equipo
                }
              </p>
            )}
          </div>
        </div>

        {/* Selección de posiciones */}
        <div>
          <label className='block text-sm font-medium text-gray-300 mb-2'>
            Posiciones (máximo 3)
          </label>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
            {positions.map(position => (
              <label key={position.id} className='flex items-center space-x-2'>
                <input
                  id={`position-${position.id}`}
                  name={`position-${position.id}`}
                  type='checkbox'
                  checked={selectedPositions.includes(position.id)}
                  onChange={() => onPositionToggle(position.id)}
                  className='rounded border-gray-600 text-gray-500 focus:ring-gray-500 bg-gray-800'
                />
                <span className='text-sm text-gray-300'>
                  {position.nombre_posicion}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className='flex justify-end space-x-4'>
          <button
            type='button'
            onClick={onCancel}
            className='px-4 py-2 text-gray-300 border border-gray-600 rounded-md hover:bg-gray-800'
          >
            Cancelar
          </button>
          <button
            type='submit'
            disabled={loading}
            className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
          >
            {loading
              ? editingPlayer
                ? 'Actualizando...'
                : 'Registrando...'
              : editingPlayer
                ? 'Actualizar Jugador'
                : 'Registrar Jugador'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlayerForm;

import React from 'react';

/**
 * Componente para el formulario de creación/edición de partidos
 * @param {boolean} showForm - Estado para mostrar/ocultar el formulario
 * @param {Object} newGame - Datos del nuevo partido
 * @param {Function} onInputChange - Función para manejar cambios en los inputs
 * @param {Function} onSubmit - Función para manejar el envío del formulario
 * @param {Function} onCancel - Función para cancelar el formulario
 * @param {boolean} loading - Estado de carga
 * @param {Object} editingGame - Datos del partido que se está editando
 * @param {string} error - Mensaje de error
 */
const ScheduleForm = ({
  showForm,
  newGame,
  onInputChange,
  onSubmit,
  onCancel,
  loading,
  editingGame,
  error,
}) => {
  if (!showForm) return null;

  return (
    <div className='bg-neutral-900 shadow rounded-lg p-6 mb-8 border border-gray-700'>
      <h2 className='text-xl font-semibold mb-6 text-white'>
        {editingGame ? 'Editar Partido' : 'Registrar Nuevo Partido'}
      </h2>
      <form onSubmit={onSubmit} className='space-y-4'>
        <input
          type='text'
          name='equipo_contrario'
          placeholder='Equipo Contrario'
          value={newGame.equipo_contrario}
          onChange={onInputChange}
          className='w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white'
          required
        />
        <input
          type='date'
          name='fecha_partido'
          value={newGame.fecha_partido}
          onChange={onInputChange}
          className='w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white'
          required
        />
        <input
          type='text'
          name='lugar'
          placeholder='Lugar del partido'
          value={newGame.lugar}
          onChange={onInputChange}
          className='w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white'
          required
        />
        <input
          type='number'
          name='umpire'
          placeholder='Pago al Umpire'
          value={newGame.umpire}
          onChange={onInputChange}
          className='w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white'
          min='0'
          step='0.01'
          required
        />
        <div className='flex space-x-4'>
          <button
            type='button'
            onClick={onCancel}
            className='flex-1 px-4 py-3 border border-gray-600 text-gray-300 rounded hover:bg-gray-800 transition-colors'
          >
            Cancelar
          </button>
          <button
            type='submit'
            disabled={loading}
            className='flex-1 px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
          >
            {loading
              ? editingGame
                ? 'Actualizando...'
                : 'Registrando...'
              : editingGame
                ? 'Actualizar Partido'
                : 'Registrar Partido'}
          </button>
        </div>
        {error && <p className='text-red-500 mt-2'>{error}</p>}
      </form>
    </div>
  );
};

export default ScheduleForm;

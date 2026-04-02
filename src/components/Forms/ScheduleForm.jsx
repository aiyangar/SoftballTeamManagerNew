import React, { useState } from 'react';

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
  leagueTeams = [],
}) => {
  const [useCustomOpponent, setUseCustomOpponent] = useState(false);

  if (!showForm) return null;

  const hasLeagueTeams = leagueTeams.length > 0;

  const handleOpponentSelect = e => {
    const val = e.target.value;
    if (val === '__custom__') {
      setUseCustomOpponent(true);
      onInputChange({ target: { name: 'equipo_contrario', value: '' } });
    } else {
      setUseCustomOpponent(false);
      onInputChange({ target: { name: 'equipo_contrario', value: val } });
    }
  };

  return (
    <div className='bg-neutral-900 shadow rounded-lg p-6 mb-8 border border-gray-700'>
      <h2 className='text-xl font-semibold mb-6 text-white'>
        {editingGame ? 'Editar Partido' : 'Registrar Nuevo Partido'}
      </h2>
      <form onSubmit={onSubmit} className='space-y-4'>
        {hasLeagueTeams && !useCustomOpponent ? (
          <div>
            <select
              name='equipo_contrario_select'
              value={newGame.equipo_contrario || ''}
              onChange={handleOpponentSelect}
              className='w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white'
              required={!useCustomOpponent}
            >
              <option value=''>Seleccionar equipo contrario</option>
              {leagueTeams.map(lt => (
                <option key={lt.id} value={lt.nombre}>{lt.nombre}</option>
              ))}
              <option value='__custom__'>Otro (escribir manualmente)...</option>
            </select>
          </div>
        ) : (
          <div className='flex gap-2 items-center'>
            <input
              type='text'
              name='equipo_contrario'
              placeholder='Equipo Contrario'
              value={newGame.equipo_contrario}
              onChange={onInputChange}
              className='flex-1 p-3 border border-gray-600 rounded-md bg-gray-800 text-white'
              required
            />
            {hasLeagueTeams && (
              <button
                type='button'
                onClick={() => { setUseCustomOpponent(false); onInputChange({ target: { name: 'equipo_contrario', value: '' } }); }}
                className='text-sm text-blue-400 hover:text-blue-300 whitespace-nowrap'
              >
                ← Elegir
              </button>
            )}
          </div>
        )}
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
            className='btn btn-secondary flex-1'
          >
            Cancelar
          </button>
          <button
            type='submit'
            disabled={loading}
            className='btn btn-primary flex-1'
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

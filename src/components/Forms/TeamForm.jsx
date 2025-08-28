import React from 'react';

/**
 * Componente para el formulario de creación/edición de equipos
 * @param {boolean} showForm - Estado para mostrar/ocultar el formulario
 * @param {string} name - Nombre del equipo
 * @param {string} inscripcion - Monto de inscripción
 * @param {Function} onNameChange - Función para manejar cambios en el nombre
 * @param {Function} onInscripcionChange - Función para manejar cambios en la inscripción
 * @param {Function} onSubmit - Función para manejar el envío del formulario
 * @param {boolean} loading - Estado de carga
 * @param {Object} editingTeam - Datos del equipo que se está editando
 * @param {string} error - Mensaje de error
 */
const TeamForm = ({
  showForm,
  name,
  inscripcion,
  onNameChange,
  onInscripcionChange,
  onSubmit,
  loading,
  editingTeam,
  error,
}) => {
  if (!showForm) return null;

  return (
    <div className='fixed inset-0 modal-overlay flex items-center justify-center z-50'>
      <div className='bg-neutral-900 border border-gray-600 rounded-lg w-full max-w-md mx-4 modal-container'>
        <div className='modal-header p-6 border-b border-gray-600'>
          <div className='flex justify-between items-center'>
            <h2 className='text-xl font-semibold text-white'>
              {editingTeam ? 'Editar Equipo' : 'Crear Nuevo Equipo'}
            </h2>
            <button
              type='button'
              onClick={() => window.location.reload()}
              className='text-gray-400 hover:text-white text-2xl'
              title='Cerrar formulario'
            >
              ×
            </button>
          </div>
        </div>

        <div className='modal-content p-6'>
          <form id='team-form' onSubmit={onSubmit} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                Nombre del Equipo *
              </label>
              <input
                id='teamName'
                name='teamName'
                type='text'
                placeholder='Ej: Tigres del Norte'
                value={name}
                onChange={onNameChange}
                className='w-full p-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-gray-800 text-white'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                Monto de Inscripción ($)
              </label>
              <input
                id='teamInscripcion'
                name='teamInscripcion'
                type='number'
                step='0.01'
                min='0'
                placeholder='Ej: 1500.00'
                value={inscripcion}
                onChange={onInscripcionChange}
                className='w-full p-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-gray-800 text-white'
              />
              <p className='text-xs text-gray-400 mt-1'>
                Opcional: Deja vacío si no hay monto de inscripción
              </p>
            </div>

            {error && (
              <div className='mt-4 p-3 bg-red-900 border border-red-600 text-red-200 rounded'>
                {error}
              </div>
            )}
          </form>
        </div>

        {/* Footer con botones de acción */}
        <div className='modal-footer p-6 border-t border-gray-600 bg-gray-800'>
          <div className='flex justify-end space-x-3'>
            <button
              type='submit'
              form='team-form'
              disabled={loading}
              className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2'
            >
              <span>💾</span>
              <span>
                {loading
                  ? editingTeam
                    ? 'Actualizando...'
                    : 'Creando...'
                  : editingTeam
                    ? 'Actualizar'
                    : 'Crear'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamForm;

import React from 'react';

/**
 * Componente para el modal de detalles del equipo
 * @param {boolean} showModal - Estado para mostrar/ocultar el modal
 * @param {Object} selectedTeam - Datos del equipo seleccionado
 * @param {Function} onClose - Función para cerrar el modal
 * @param {Function} onEdit - Función para editar el equipo
 * @param {Function} onDelete - Función para eliminar el equipo
 */
const TeamHistoryModal = ({
  showModal,
  selectedTeam,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!showModal || !selectedTeam) return null;

  return (
    <div className='fixed inset-0 modal-overlay flex items-center justify-center z-50'>
      <div className='bg-neutral-900 border border-gray-600 rounded-lg w-full max-w-2xl mx-4 modal-container'>
        <div className='modal-header p-6 border-b border-gray-600'>
          <div className='flex justify-between items-center'>
            <h2 className='text-2xl font-semibold text-white'>
              Detalles del Equipo
            </h2>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-white text-2xl'
              title='Cerrar detalles del equipo'
            >
              ×
            </button>
          </div>
        </div>

        <div className='modal-content p-6'>
          {/* Información básica del equipo */}
          <div className='mb-6 p-4 bg-gray-800 rounded-lg'>
            <h3 className='text-xl font-semibold text-white mb-4'>
              {selectedTeam.nombre_equipo}
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              {/* Jugadores */}
              <div className='flex items-center space-x-3 p-3 bg-gray-700 rounded-lg'>
                <div className='text-blue-400 text-2xl'>👥</div>
                <div>
                  <div className='text-white font-semibold text-lg'>
                    {selectedTeam.totalPlayers || 0}
                  </div>
                  <div className='text-gray-400 text-sm'>Jugadores</div>
                </div>
              </div>

              {/* Record W-L-D */}
              <div className='flex items-center space-x-3 p-3 bg-gray-700 rounded-lg'>
                <div className='text-orange-400 text-2xl'>🏆</div>
                <div>
                  <div className='text-white font-semibold text-lg'>
                    {selectedTeam.wins || 0}-{selectedTeam.losses || 0}-
                    {selectedTeam.draws || 0}
                  </div>
                  <div className='text-gray-400 text-sm'>W-L-D</div>
                </div>
              </div>

              {/* Monto de Inscripción */}
              <div className='flex items-center space-x-3 p-3 bg-gray-700 rounded-lg'>
                <div className='text-green-400 text-2xl'>💰</div>
                <div>
                  <div className='text-white font-semibold text-lg'>
                    ${selectedTeam.inscripcion?.toLocaleString() || '0'}
                  </div>
                  <div className='text-gray-400 text-sm'>Inscripción</div>
                </div>
              </div>
            </div>

            {/* Estado de Pagos */}
            {selectedTeam.inscripcion && (
              <div className='mt-4 p-4 bg-gray-700 rounded-lg'>
                <h4 className='text-lg font-semibold text-white mb-3'>
                  Estado de Pagos
                </h4>

                {/* Pagado */}
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-gray-300'>Pagado:</span>
                  <span className='text-green-400 font-semibold'>
                    $
                    {(selectedTeam.totalRegistrationPaid || 0).toLocaleString()}
                  </span>
                </div>

                {/* Pendiente */}
                <div className='flex items-center justify-between mb-3'>
                  <span className='text-gray-300'>Pendiente:</span>
                  <span className='text-yellow-400 font-semibold'>
                    $
                    {Math.max(
                      0,
                      selectedTeam.inscripcion -
                        (selectedTeam.totalRegistrationPaid || 0)
                    ).toLocaleString()}
                  </span>
                </div>

                {/* Barra de progreso */}
                <div className='w-full bg-gray-600 rounded-full h-2'>
                  <div
                    className='h-2 rounded-full transition-all duration-300'
                    style={{
                      width: `${Math.min(((selectedTeam.totalRegistrationPaid || 0) / selectedTeam.inscripcion) * 100, 100)}%`,
                      backgroundColor:
                        (selectedTeam.totalRegistrationPaid || 0) >=
                        selectedTeam.inscripcion
                          ? '#10B981'
                          : (selectedTeam.totalRegistrationPaid || 0) >=
                              selectedTeam.inscripcion * 0.8
                            ? '#F59E0B'
                            : (selectedTeam.totalRegistrationPaid || 0) >=
                                selectedTeam.inscripcion * 0.5
                              ? '#F97316'
                              : '#DC2626',
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Estadísticas detalladas del record */}
          <div className='mb-6 p-4 bg-gray-800 rounded-lg'>
            <h4 className='text-lg font-semibold text-white mb-3'>
              Estadísticas del Equipo
            </h4>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              {/* Victorias */}
              <div className='text-center p-3 bg-green-900 rounded-lg border border-green-600'>
                <div className='text-green-400 text-2xl mb-1'>✅</div>
                <div className='text-white font-bold text-xl'>
                  {selectedTeam.wins || 0}
                </div>
                <div className='text-green-300 text-sm'>Victorias</div>
              </div>

              {/* Derrotas */}
              <div className='text-center p-3 bg-red-900 rounded-lg border border-red-600'>
                <div className='text-red-400 text-2xl mb-1'>❌</div>
                <div className='text-white font-bold text-xl'>
                  {selectedTeam.losses || 0}
                </div>
                <div className='text-red-300 text-sm'>Derrotas</div>
              </div>

              {/* Empates */}
              <div className='text-center p-3 bg-yellow-900 rounded-lg border border-yellow-600'>
                <div className='text-yellow-400 text-2xl mb-1'>🤝</div>
                <div className='text-white font-bold text-xl'>
                  {selectedTeam.draws || 0}
                </div>
                <div className='text-yellow-300 text-sm'>Empates</div>
              </div>
            </div>

            {/* Porcentaje de victorias */}
            {(selectedTeam.wins || 0) +
              (selectedTeam.losses || 0) +
              (selectedTeam.draws || 0) >
              0 && (
              <div className='mt-4 text-center'>
                <div className='text-gray-300 text-sm mb-1'>
                  Porcentaje de Victorias
                </div>
                <div className='text-white font-bold text-lg'>
                  {Math.round(
                    ((selectedTeam.wins || 0) /
                      ((selectedTeam.wins || 0) +
                        (selectedTeam.losses || 0) +
                        (selectedTeam.draws || 0))) *
                      100
                  )}
                  %
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer con botones de acción */}
        <div className='modal-footer p-6 border-t border-gray-600 bg-gray-800'>
          <div className='flex justify-end space-x-3'>
            <button
              onClick={() => {
                onEdit(selectedTeam);
                onClose();
              }}
              className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center space-x-2'
            >
              <span>✏️</span>
              <span>Editar Equipo</span>
            </button>
            <button
              onClick={() => {
                onDelete(selectedTeam);
                onClose();
              }}
              className='px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center space-x-2'
            >
              <span>🗑️</span>
              <span>Eliminar Equipo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamHistoryModal;

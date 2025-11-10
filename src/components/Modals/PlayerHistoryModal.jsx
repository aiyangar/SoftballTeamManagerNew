import React from 'react';
import '../../styles/modalStyles.css';

/**
 * Componente para el modal de historial del jugador
 * @param {boolean} isOpen - Estado del modal
 * @param {Object} player - Jugador seleccionado
 * @param {Object} history - Datos del historial
 * @param {boolean} loadingHistory - Estado de carga del historial
 * @param {Object} expandedSections - Secciones expandidas
 * @param {Function} onToggleSection - Función para expandir/contraer secciones
 * @param {Function} onClose - Función para cerrar el modal
 * @param {Function} onEdit - Función para editar el jugador
 * @param {Function} onDelete - Función para eliminar el jugador
 * @param {number} inscripcionTarget - Meta de inscripción calculada dinámicamente
 * @param {Function} onAcceptPayment - Función para aceptar pagos de inscripción
 */
const PlayerHistoryModal = ({
  isOpen,
  player,
  history,
  loadingHistory,
  expandedSections,
  onToggleSection,
  onClose,
  onEdit,
  onDelete,
  inscripcionTarget = 450,
  onAcceptPayment,
}) => {
  if (!isOpen || !player) return null;

  // Configuración de la meta de inscripción
  const inscripcionProgress = Math.min(
    (history.totalInscripcionPaid / inscripcionTarget) * 100,
    100
  );
  const inscripcionRemaining = Math.max(
    0,
    inscripcionTarget - history.totalInscripcionPaid
  );

  // Determinar el color de la barra de progreso
  const getProgressColor = () => {
    if (inscripcionProgress >= 100) return 'bg-green-500';
    if (inscripcionProgress >= 80) return 'bg-yellow-500';
    if (inscripcionProgress >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className='fixed inset-0 modal-overlay flex items-center justify-center z-50'>
      <div className='bg-neutral-900 border border-gray-600 rounded-lg w-full max-w-4xl mx-4 modal-container'>
        {/* Header fijo */}
        <div className='modal-header p-6 border-b border-gray-600'>
          <div className='flex justify-between items-center'>
            <h2 className='text-2xl font-semibold text-white'>
              Historial de {player.nombre}
            </h2>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-white text-2xl'
              title='Cerrar historial'
            >
              ×
            </button>
          </div>
        </div>

        {/* Contenido con scroll */}
        <div className='modal-content p-6'>
          {loadingHistory ? (
            <div className='text-center py-8'>
              <p className='text-gray-300'>Cargando historial...</p>
            </div>
          ) : (
            <div className='space-y-6'>
              {/* Estadísticas Generales */}
              <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                <div className='bg-gray-800 p-4 rounded-lg text-center'>
                  <div className='text-2xl font-bold text-blue-400'>
                    {history.gamesPlayed}
                  </div>
                  <div className='text-sm text-gray-300'>Total Partidos</div>
                </div>
                <div className='bg-gray-800 p-4 rounded-lg text-center'>
                  <div className='text-2xl font-bold text-green-400'>
                    {history.gamesAttended}
                  </div>
                  <div className='text-sm text-gray-300'>Asistencias</div>
                </div>
                <div className='bg-gray-800 p-4 rounded-lg text-center'>
                  <div className='text-2xl font-bold text-yellow-400'>
                    {history.attendanceRate}%
                  </div>
                  <div className='text-sm text-gray-300'>
                    Tasa de Asistencia
                  </div>
                </div>
                <div className='bg-gray-800 p-4 rounded-lg text-center'>
                  <div className='text-2xl font-bold text-purple-400'>
                    {history.payments.length}
                  </div>
                  <div className='text-sm text-gray-300'>Pagos Realizados</div>
                </div>
              </div>

              {/* Resumen de Pagos */}
              <div className='bg-gray-800 p-4 rounded-lg'>
                <h3 className='text-lg font-semibold text-white mb-4'>
                  Resumen de Pagos
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='bg-gray-700 p-3 rounded'>
                    <div className='flex items-center justify-between'>
                      <span className='text-gray-300'>Total Umpire:</span>
                      <span className='text-green-400 font-semibold'>
                        ${history.totalUmpirePaid.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className='bg-gray-700 p-3 rounded'>
                    <div className='flex items-center justify-between'>
                      <span className='text-gray-300'>Total Inscripción:</span>
                      <span className='text-blue-400 font-semibold'>
                        ${history.totalInscripcionPaid.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Barra de progreso de inscripción */}
                <div className='mt-4'>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='text-sm text-gray-300'>
                      Progreso de Inscripción
                    </span>
                    <span className='text-sm text-gray-300'>
                      ${history.totalInscripcionPaid.toLocaleString()} / $
                      {inscripcionTarget.toLocaleString()}
                    </span>
                  </div>
                  <div className='w-full bg-gray-700 rounded-full h-3'>
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${getProgressColor()}`}
                      style={{ width: `${inscripcionProgress}%` }}
                    ></div>
                  </div>
                  <div className='flex justify-between items-center mt-2'>
                    <span className='text-xs text-gray-400'>
                      Meta: ${inscripcionTarget.toLocaleString()}
                    </span>
                    {inscripcionRemaining > 0 ? (
                      <span
                        className={`text-xs font-semibold ${
                          inscripcionProgress >= 100
                            ? 'text-green-400'
                            : inscripcionProgress >= 80
                              ? 'text-yellow-400'
                              : inscripcionProgress >= 50
                                ? 'text-orange-400'
                                : 'text-red-400'
                        }`}
                      >
                        Faltan: ${inscripcionRemaining.toLocaleString()}
                      </span>
                    ) : (
                      <span className='text-xs text-green-400 font-semibold'>
                        ✓ Meta completada
                      </span>
                    )}
                  </div>
                </div>

              </div>

              {/* Historial de Asistencias */}
              <div className='bg-gray-800 p-4 rounded-lg'>
                <button
                  onClick={() => onToggleSection('attendance')}
                  className='w-full flex justify-between items-center text-left'
                >
                  <h3 className='text-lg font-semibold text-white'>
                    Historial de Asistencias
                  </h3>
                  <div className='flex items-center space-x-2'>
                    <span className='text-sm text-gray-400'>
                      {history.attendance.length} registros
                    </span>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.attendance ? 'rotate-180' : ''}`}
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M19 9l-7 7-7-7'
                      />
                    </svg>
                  </div>
                </button>

                {expandedSections.attendance && (
                  <div className='mt-4'>
                    {history.attendance.length === 0 ? (
                      <p className='text-gray-400 text-center py-4'>
                        No hay registros de asistencia
                      </p>
                    ) : (
                      <div className='space-y-2'>
                        {history.attendance.map((attendance, index) => (
                          <div
                            key={index}
                            className='bg-gray-700 p-3 rounded flex justify-between items-center'
                          >
                            <div>
                              <div className='font-medium text-white'>
                                vs {attendance.partidos?.equipo_contrario}
                              </div>
                              <div className='text-sm text-gray-300'>
                                {new Date(
                                  attendance.partidos?.fecha_partido
                                ).toLocaleDateString()}
                              </div>
                              <div className='text-xs text-gray-400'>
                                {attendance.partidos?.lugar}
                              </div>
                            </div>
                            <div className='text-right'>
                              {attendance.partidos?.finalizado ? (
                                <div className='text-sm'>
                                  <div
                                    className={`font-semibold ${
                                      attendance.partidos.resultado ===
                                      'Victoria'
                                        ? 'text-green-400'
                                        : attendance.partidos.resultado ===
                                            'Derrota'
                                          ? 'text-red-400'
                                          : 'text-yellow-400'
                                    }`}
                                  >
                                    {attendance.partidos.resultado}
                                  </div>
                                  <div className='text-gray-300'>
                                    {attendance.partidos.carreras_equipo_local}{' '}
                                    -{' '}
                                    {
                                      attendance.partidos
                                        .carreras_equipo_contrario
                                    }
                                  </div>
                                </div>
                              ) : (
                                <span className='text-yellow-400 text-sm'>
                                  Pendiente
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Historial de Pagos */}
              <div className='bg-gray-800 p-4 rounded-lg'>
                <button
                  onClick={() => onToggleSection('payments')}
                  className='w-full flex justify-between items-center text-left'
                >
                  <h3 className='text-lg font-semibold text-white'>
                    Historial de Pagos
                  </h3>
                  <div className='flex items-center space-x-2'>
                    <span className='text-sm text-gray-400'>
                      {history.payments.length} registros
                    </span>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.payments ? 'rotate-180' : ''}`}
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M19 9l-7 7-7-7'
                      />
                    </svg>
                  </div>
                </button>

                {expandedSections.payments && (
                  <div className='mt-4'>
                    {history.payments.length === 0 ? (
                      <p className='text-gray-400 text-center py-4'>
                        No hay registros de pagos
                      </p>
                    ) : (
                      <div className='space-y-2'>
                        {history.payments.map((payment, index) => (
                          <div key={index} className='bg-gray-700 p-3 rounded'>
                            <div className='flex justify-between items-start mb-2'>
                              <div>
                                <div className='font-medium text-white'>
                                  vs {payment.partidos?.equipo_contrario}
                                </div>
                                <div className='text-sm text-gray-300'>
                                  {new Date(
                                    payment.fecha_pago
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                              <div className='text-right'>
                                <div className='text-sm text-gray-300'>
                                  {new Date(
                                    payment.fecha_pago
                                  ).toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                            <div className='grid grid-cols-2 gap-2 text-sm'>
                              {payment.monto_umpire > 0 && (
                                <div className='bg-green-900 p-2 rounded'>
                                  <span className='text-green-300'>
                                    Umpire:
                                  </span>
                                  <span className='text-green-400 font-semibold ml-2'>
                                    ${payment.monto_umpire.toLocaleString()}
                                  </span>
                                </div>
                              )}
                              {payment.monto_inscripcion > 0 && (
                                <div className='bg-blue-900 p-2 rounded'>
                                  <span className='text-blue-300'>
                                    Inscripción:
                                  </span>
                                  <span className='text-blue-400 font-semibold ml-2'>
                                    $
                                    {payment.monto_inscripcion.toLocaleString()}
                                  </span>
                                </div>
                              )}
                            </div>
                            {payment.metodo_pago && (
                              <div className='mt-2 text-sm'>
                                <span className='text-gray-400'>
                                  Método de pago:{' '}
                                </span>
                                <span
                                  className={`font-semibold ${
                                    payment.metodo_pago === 'Efectivo'
                                      ? 'text-green-400'
                                      : 'text-blue-400'
                                  }`}
                                >
                                  {payment.metodo_pago}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer con botones de acción */}
        <div className='modal-footer p-6 border-t border-gray-600 bg-gray-800'>
          <div className='flex justify-between items-center'>
            {/* Botón de pago de inscripción (izquierda) */}
            {inscripcionRemaining > 0 && onAcceptPayment && (
              <button
                onClick={() => onAcceptPayment(player)}
                className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center space-x-2'
                title='Registrar pago de inscripción para este jugador'
              >
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
                    d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
                  />
                </svg>
                <span>Aceptar Pago</span>
              </button>
            )}
            
            {/* Botones de edición y eliminación (derecha) */}
            <div className='flex space-x-3'>
              <button
                onClick={() => {
                  onEdit(player.id);
                  // El modal se cierra desde el componente padre
                }}
                className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center space-x-2'
              >
                <span>✏️</span>
                <span>Editar Jugador</span>
              </button>
              <button
                onClick={() => {
                  onDelete(player.id);
                  onClose();
                }}
                className='px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center space-x-2'
              >
                <span>🗑️</span>
                <span>Eliminar Jugador</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerHistoryModal;

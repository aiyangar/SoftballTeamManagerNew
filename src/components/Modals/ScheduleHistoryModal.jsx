import React, { useState, useEffect } from 'react';
import PaymentStatusWidget from '../Widgets/PaymentStatusWidget';

/**
 * Componente para el modal de detalles del partido
 * @param {boolean} showModal - Estado para mostrar/ocultar el modal
 * @param {Object} selectedGame - Datos del partido seleccionado
 * @param {Object} paymentTotals - Totales de pagos por partido
 * @param {Object} gameDetailsData - Datos detallados del partido
 * @param {Function} onClose - Función para cerrar el modal

 * @param {Function} onEditGame - Función para editar partido
 * @param {Function} onDeleteGame - Función para eliminar partido
 * @param {boolean} gameFinalizationStatus - Estado de finalización del partido
 * @param {Function} onOpenPaymentForm - Función para abrir formulario de pagos
 * @param {Array} players - Lista de jugadores del equipo
 * @param {Object} attendance - Estado de asistencia por partido
 * @param {Function} onAttendanceChange - Función para cambiar asistencia
 * @param {Function} onRecordAttendance - Función para guardar asistencia
 * @param {Function} onLoadExistingAttendance - Función para cargar asistencia existente
 * @param {Function} onReloadDetails - Función para recargar detalles del modal
 * @param {Function} onOpenScoreForm - Función para abrir formulario de resultado
 * @param {Function} onOpenLineup - Función para abrir el modal de lineup
 */
const ScheduleHistoryModal = ({
  showModal,
  selectedGame,
  paymentTotals,
  gameDetailsData,
  onClose,
  onEditGame,
  onDeleteGame,
  gameFinalizationStatus,
  onOpenPaymentForm,
  players,
  attendance,
  onAttendanceChange,
  onRecordAttendance,
  onLoadExistingAttendance,
  onReloadDetails,
  onViewPlayerHistory,
  onOpenScoreForm,
  onOpenLineup,
}) => {
  const [isEditingAttendance, setIsEditingAttendance] = useState(false);
  const [localAttendance, setLocalAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    attendance: false,
    payments: false,
    lineup: false,
  });

  // Cargar asistencia existente cuando se abre el modal
  useEffect(() => {
    if (showModal && selectedGame) {
      const currentAttendance = attendance[selectedGame.id] || [];
      setLocalAttendance(currentAttendance);
    }
  }, [showModal, selectedGame, attendance]);

  // Resetear estado de edición cuando se cierra el modal
  useEffect(() => {
    if (!showModal) {
      setIsEditingAttendance(false);
      setLocalAttendance([]);
    }
  }, [showModal]);

  // Sincronizar estado local cuando cambia el estado global (solo si no estamos editando)
  useEffect(() => {
    if (showModal && selectedGame && !isEditingAttendance) {
      const currentAttendance = attendance[selectedGame.id] || [];
      setLocalAttendance(currentAttendance);
    }
  }, [attendance, selectedGame, showModal, isEditingAttendance]);

  if (!showModal || !selectedGame) return null;

  return (
    <div className='fixed inset-0 modal-overlay flex items-center justify-center z-50'>
      <div className='bg-neutral-900 border border-gray-600 rounded-lg w-full max-w-4xl mx-4 modal-container'>
        <div className='modal-header p-4 sm:p-6 border-b border-gray-600'>
          <div className='flex justify-between items-center'>
            <h2 className='text-2xl font-semibold text-white'>
              Detalles del Partido
            </h2>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-white text-2xl'
              title='Cerrar detalles del partido'
            >
              ×
            </button>
          </div>
        </div>

        <div className='modal-content p-4 sm:p-6'>
          {/* Botones de acción en la parte superior */}
          {!gameFinalizationStatus && (
            <div className='mb-6 flex flex-wrap gap-2 items-center'>
              <button
                onClick={async () => {
                  if (!isEditingAttendance) {
                    const success = await onLoadExistingAttendance(selectedGame.id);
                    if (success) setIsEditingAttendance(true);
                  } else {
                    setIsEditingAttendance(false);
                    setLocalAttendance(attendance[selectedGame.id] || []);
                  }
                }}
                className='btn bg-green-600 text-white hover:bg-green-700'
                title='Gestionar asistencia'
              >
                <span>{isEditingAttendance ? '✕' : '📋'}</span>
                <span>{isEditingAttendance ? 'Cancelar' : 'Asistencia'}</span>
              </button>
              <button
                onClick={() => { onOpenPaymentForm(selectedGame.id); onClose(); }}
                className='btn bg-yellow-600 text-white hover:bg-yellow-700'
                title='Registrar pagos'
              >
                <span>💰</span>
                <span>Pagos</span>
              </button>
              <button
                onClick={() => onOpenLineup(selectedGame)}
                className='btn bg-purple-600 text-white hover:bg-purple-700'
                title='Gestionar lineup'
              >
                <span>⚾</span>
                <span>Lineup</span>
              </button>
              <button
                onClick={() => { onOpenScoreForm(selectedGame); onClose(); }}
                className='btn bg-orange-600 text-white hover:bg-orange-700'
                title='Terminar partido'
              >
                <span>🏁</span>
                <span>Terminar</span>
              </button>

              {/* Menú de opciones (editar / eliminar) */}
              <div className='relative ml-auto'>
                <button
                  onClick={() => setShowOptionsMenu(prev => !prev)}
                  className='p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors border border-gray-600'
                  title='Más opciones'
                >
                  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                    <circle cx='12' cy='5' r='1.5' />
                    <circle cx='12' cy='12' r='1.5' />
                    <circle cx='12' cy='19' r='1.5' />
                  </svg>
                </button>
                {showOptionsMenu && (
                  <>
                    <div
                      className='fixed inset-0 z-10'
                      onClick={() => setShowOptionsMenu(false)}
                    />
                    <div className='absolute right-0 mt-1 w-40 bg-neutral-800 border border-gray-600 rounded-lg shadow-lg z-20'>
                      <button
                        onClick={() => {
                          setShowOptionsMenu(false);
                          onEditGame(selectedGame);
                          onClose();
                        }}
                        className='flex items-center gap-2 w-full px-4 py-2 text-sm text-white hover:bg-gray-700 rounded-t-lg'
                      >
                        <span>✏️</span>
                        <span>Editar partido</span>
                      </button>
                      <button
                        onClick={() => { setShowOptionsMenu(false); setShowDeleteWarning(true); }}
                        className='flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-900/50 rounded-b-lg'
                      >
                        <span>🗑️</span>
                        <span>Eliminar partido</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Información básica del partido */}
          <div className='mb-6 p-4 bg-gray-800 rounded-lg'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <h3 className='text-lg font-semibold text-white mb-2'>
                  {selectedGame.equipo_contrario}
                </h3>
                <p className='text-gray-300'>
                  Fecha:{' '}
                  {new Date(selectedGame.fecha_partido).toLocaleDateString()}
                </p>
                <p className='text-gray-300'>Lugar: {selectedGame.lugar}</p>
                <p className='text-gray-300'>
                  Umpire: ${selectedGame.umpire || 550}
                </p>
              </div>
              <div>
                {selectedGame.resultado && (
                  <div className='text-center'>
                    <p className='text-gray-300 text-sm mb-1'>Resultado:</p>
                    <p className='text-2xl font-bold text-white'>
                      {selectedGame.carreras_equipo_local || 0} -{' '}
                      {selectedGame.carreras_equipo_contrario || 0}
                    </p>
                    <p
                      className={`text-sm font-semibold ${
                        selectedGame.resultado === 'Victoria'
                          ? 'text-green-400'
                          : selectedGame.resultado === 'Derrota'
                            ? 'text-red-400'
                            : 'text-yellow-400'
                      }`}
                    >
                      {selectedGame.resultado}
                    </p>
                  </div>
                )}
                {selectedGame.finalizado && (
                  <div className='mt-2 p-2 bg-red-900 border border-red-600 rounded text-center'>
                    <span className='text-red-200 font-semibold text-sm'>
                      🔒 PARTIDO FINALIZADO
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Widget de Estado de Pagos */}
          {paymentTotals[selectedGame.id] && (
            <div className='mb-6'>
              <PaymentStatusWidget
                paymentTotals={paymentTotals[selectedGame.id]}
                umpireTarget={selectedGame.umpire || 550}
                size='large'
                showTitle={true}
              />
            </div>
          )}

          {/* Acordeón de Asistencia */}
          <div className='mb-6'>
            <div
              className='flex justify-between items-center p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors'
              onClick={() =>
                setExpandedSections(prev => ({
                  ...prev,
                  attendance: !prev.attendance,
                }))
              }
            >
              <div className='flex flex-col gap-0.5 min-w-0'>
                <h3 className='text-sm sm:text-lg font-semibold text-white'>
                  Asistencia ({gameDetailsData.attendance.length} jugadores)
                </h3>
                <div className='flex items-center flex-wrap gap-x-2 text-sm'>
                  <span className='text-gray-400'>Con pago:</span>
                  <span className='text-green-400 font-semibold'>
                    {
                      gameDetailsData.attendance.filter(att =>
                        gameDetailsData.payments.some(
                          payment =>
                            payment.jugadores?.nombre === att.jugadores?.nombre
                        )
                      ).length
                    }
                  </span>
                  <span className='text-gray-400'>Sin pago:</span>
                  <span className='text-red-400 font-semibold'>
                    {
                      gameDetailsData.attendance.filter(
                        att =>
                          !gameDetailsData.payments.some(
                            payment =>
                              payment.jugadores?.nombre ===
                              att.jugadores?.nombre
                          )
                      ).length
                    }
                  </span>
                </div>
              </div>
              <div className='flex items-center space-x-2'>
                {!gameFinalizationStatus && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      if (!isEditingAttendance) {
                        setIsEditingAttendance(true);
                      } else {
                        setIsEditingAttendance(false);
                      }
                    }}
                    className='hidden sm:inline-flex btn-sm btn-primary'
                  >
                    {isEditingAttendance ? 'Cancelar' : 'Editar'}
                  </button>
                )}
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                    expandedSections.attendance ? 'rotate-180' : ''
                  }`}
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
            </div>

            {expandedSections.attendance && (
              <div className='mt-3 p-4 bg-gray-700 rounded-lg'>
                {!gameFinalizationStatus && isEditingAttendance && (
                  <div className='flex justify-end space-x-2 mb-4'>
                    <button
                      onClick={() => {
                        setLocalAttendance([]);
                        // También limpiar el estado global
                        onAttendanceChange(selectedGame.id, []);

                        console.log('========================');
                      }}
                      className='btn-sm btn-secondary'
                    >
                      Limpiar
                    </button>
                    <button
                      onClick={async () => {
                        setLoading(true);
                        const success = await onRecordAttendance(
                          selectedGame.id
                        );
                        setLoading(false);
                        if (success) {
                          setIsEditingAttendance(false);
                          // Recargar datos del modal inmediatamente
                          if (onReloadDetails) {
                            await onReloadDetails();
                          }
                        }
                      }}
                      disabled={loading}
                      className='btn-sm btn-primary'
                    >
                      {loading ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                )}

                {isEditingAttendance && !gameFinalizationStatus ? (
                  // Modo edición
                  <div className='p-4 bg-gray-800 rounded-lg'>
                    <div className='flex justify-between items-center mb-3'>
                      <h4 className='text-white font-semibold'>
                        Seleccionar Jugadores Asistentes
                      </h4>
                      <div className='text-sm text-gray-300'>
                        {localAttendance.length} de {players.length}{' '}
                        seleccionados
                      </div>
                    </div>

                    {/* Barra de progreso */}
                    {players.length > 0 && (
                      <div className='mb-4'>
                        <div className='w-full bg-gray-700 rounded-full h-2'>
                          <div
                            className='bg-green-500 h-2 rounded-full transition-all duration-300'
                            style={{
                              width: `${(localAttendance.length / players.length) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                    {players.length === 0 ? (
                      <div className='text-yellow-500 text-center'>
                        <p>No hay jugadores registrados en este equipo.</p>
                      </div>
                    ) : (
                      <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                        {players.map(player => {
                          const isSelected = localAttendance.includes(
                            player.id
                          );
                          return (
                            <label
                              key={player.id}
                              className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                isSelected
                                  ? 'bg-green-700 border-2 border-green-500'
                                  : 'bg-gray-700 border-2 border-gray-600 hover:bg-gray-600'
                              }`}
                            >
                              <input
                                type='checkbox'
                                checked={isSelected}
                                onChange={() => {
                                  const newAttendance = isSelected
                                    ? localAttendance.filter(
                                        id => id !== player.id
                                      )
                                    : [...localAttendance, player.id];

                                  setLocalAttendance(newAttendance);
                                  // También actualizar el estado global
                                  onAttendanceChange(
                                    selectedGame.id,
                                    newAttendance
                                  );
                                }}
                                onClick={e => e.stopPropagation()}
                                className='form-checkbox h-5 w-5 text-green-600'
                              />
                              <span
                                className={`font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}
                              >
                                {player.nombre}
                              </span>
                              {isSelected && (
                                <span className='text-green-400 text-lg'>
                                  ✓
                                </span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : // Modo visualización
                gameDetailsData.attendance.length > 0 ? (
                  <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
                    {gameDetailsData.attendance.map((att, index) => {
                      // Verificar si el jugador realizó algún pago en este partido
                      const hasPayment = gameDetailsData.payments.some(
                        payment =>
                          payment.jugadores?.nombre === att.jugadores?.nombre
                      );

                      return (
                        <div
                          key={index}
                          className={`p-3 rounded-lg text-center relative cursor-pointer hover:bg-gray-700 transition-colors ${
                            hasPayment
                              ? 'bg-gray-800'
                              : 'bg-red-900 border-2 border-red-500'
                          }`}
                          onClick={() => {
                            if (onViewPlayerHistory) {
                              onViewPlayerHistory(att.jugadores);
                            }
                          }}
                          title='Haz clic para ver el historial del jugador'
                        >
                          <div
                            className={`text-2xl mb-1 ${
                              hasPayment ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            {hasPayment ? '✓' : '⚠️'}
                          </div>
                          <p className='text-white text-sm'>
                            {att.jugadores?.nombre || 'Jugador'}
                          </p>
                          {!hasPayment && (
                            <div className='absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full'>
                              Sin pago
                            </div>
                          )}
                          <div className='absolute bottom-1 right-1 text-gray-400 text-xs'>
                            👤
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className='p-4 bg-gray-800 rounded-lg text-center'>
                    <p className='text-gray-400'>
                      No hay registros de asistencia
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Acordeón de Lineup */}
          <div className='mb-6'>
            <div
              className='flex justify-between items-center p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors'
              onClick={() =>
                setExpandedSections(prev => ({
                  ...prev,
                  lineup: !prev.lineup,
                }))
              }
            >
              <div className='flex flex-col gap-0.5 min-w-0'>
                <h3 className='text-sm sm:text-lg font-semibold text-white'>
                  Lineup ({new Set(gameDetailsData.lineup.map(e => e.jugadores?.id)).size} jugadores)
                </h3>
                {gameDetailsData.lineup.length > 0 && (
                  <span className='text-sm text-gray-400'>
                    {new Set(gameDetailsData.lineup.filter(e => e.activo).map(e => e.jugadores?.id)).size} activos
                  </span>
                )}
              </div>
              <div className='flex items-center space-x-2'>
                {!gameFinalizationStatus && onOpenLineup && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onOpenLineup(selectedGame);
                    }}
                    className='hidden sm:inline-flex btn-sm bg-purple-600 text-white hover:bg-purple-700'
                  >
                    Editar
                  </button>
                )}
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                    expandedSections.lineup ? 'rotate-180' : ''
                  }`}
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
            </div>

            {expandedSections.lineup && (() => {
              const lineup = gameDetailsData.lineup;
              if (lineup.length === 0) {
                return (
                  <div className='mt-3 p-4 bg-gray-700 rounded-lg text-center'>
                    <p className='text-gray-400'>No hay lineup registrado</p>
                  </div>
                );
              }

              const isBD = e => e.posicion_campo === 'BD' && e.batea_por_id;
              const starters = lineup
                .filter(e => e.es_titular)
                .sort((a, b) => (a.orden_bateo || 0) - (b.orden_bateo || 0));
              const inGameSubs = lineup.filter(e => !e.es_titular && e.orden_bateo != null && !isBD(e));
              const bench = lineup.filter(e => !e.es_titular && e.orden_bateo == null && !isBD(e) && e.activo);
              const bdPlayers = lineup.filter(e => isBD(e));

              // Build ordered render list
              const rows = [];
              const usedIdx = new Set();
              starters.forEach(starter => {
                rows.push({ ...starter, indent: false, section: 'titular' });

                // BD players batting for this starter → appear right below them
                bdPlayers
                  .filter(bd => bd.batea_por_id === starter.jugadores?.id)
                  .forEach(bd => rows.push({ ...bd, indent: true, section: 'bd' }));

                if (!starter.activo) {
                  inGameSubs
                    .filter(s => s.orden_bateo === starter.orden_bateo)
                    .forEach(sub => {
                      rows.push({ ...sub, indent: true, section: 'sub' });
                      usedIdx.add(sub);
                    });
                }
              });
              inGameSubs.filter(s => !usedIdx.has(s)).forEach(s => bench.push(s));

              const allBench = [...bench]; // BD players are now inline

              const playerName = e =>
                `${e.jugadores?.numero ? `#${e.jugadores.numero} ` : ''}${e.jugadores?.nombre || ''}`;

              return (
                <div className='mt-3 bg-gray-700 rounded-lg overflow-hidden'>
                  <table className='w-full text-sm text-left'>
                    <thead>
                      <tr className='text-gray-400 border-b border-gray-600'>
                        <th className='pb-2 pt-3 px-3'>Turno</th>
                        <th className='pb-2 pt-3 pr-3'>Jugador</th>
                        <th className='pb-2 pt-3 pr-3'><span className='sm:hidden'>Pos.</span><span className='hidden sm:inline'>Posición</span></th>
                        <th className='pb-2 pt-3 pr-3 hidden sm:table-cell'>Estado</th>
                      </tr>
                      <tr className='bg-green-900/30'>
                        <td colSpan={4} className='px-3 py-1'>
                          <span className='text-xs font-semibold text-green-400 uppercase tracking-wide'>Titulares</span>
                        </td>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((entry, i) => (
                        <tr
                          key={i}
                          className={[
                            'border-b border-gray-600 transition-colors',
                            !entry.activo ? 'opacity-40' : '',
                            entry.section === 'bd' ? 'bg-purple-900/20' : '',
                            entry.section === 'sub' ? 'bg-yellow-900/15' : '',
                          ].join(' ')}
                        >
                          <td className={`py-2 pr-3 font-mono ${entry.section === 'bd' ? 'text-purple-300' : 'text-white'} ${entry.indent ? 'pl-6' : 'pl-3'}`}>
                            {entry.orden_bateo ?? '—'}
                          </td>
                          <td className='py-2 pr-3'>
                            {entry.indent && (
                              <span className={`mr-1 ${entry.section === 'bd' ? 'text-purple-400' : 'text-gray-500'}`}>↳</span>
                            )}
                            <span className={
                              entry.section === 'bd'
                                ? 'text-purple-200'
                                : !entry.activo
                                  ? 'line-through text-gray-500'
                                  : 'text-white'
                            }>
                              {playerName(entry)}
                            </span>
                          </td>
                          <td className={`py-2 pr-3 font-mono ${entry.section === 'bd' ? 'text-purple-300' : 'text-white'}`}>
                            {entry.posicion_campo}
                          </td>
                          <td className='py-2 pr-3 hidden sm:table-cell'>
                            {entry.section === 'bd' ? (
                              <span className='text-purple-400 text-xs'>BD</span>
                            ) : entry.es_titular ? (
                              <span className='text-green-400 text-xs'>Titular</span>
                            ) : (
                              <span className='text-yellow-400 text-xs'>Sustituto</span>
                            )}
                            {!entry.activo && (
                              <span className='ml-1 text-red-400 text-xs'>(relevado)</span>
                            )}
                          </td>
                        </tr>
                      ))}

                      {allBench.length > 0 && (
                        <>
                          <tr className='bg-gray-800/60'>
                            <td colSpan={4} className='px-3 py-1'>
                              <span className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>Banca</span>
                            </td>
                          </tr>
                          {allBench.map((entry, i) => (
                            <tr
                              key={`bench-${i}`}
                              className={[
                                'border-b border-gray-600',
                                isBD(entry) ? 'bg-purple-900/20' : '',
                              ].join(' ')}
                            >
                              <td className='py-2 pl-3 pr-3 font-mono text-gray-400'>—</td>
                              <td className='py-2 pr-3 text-white'>{playerName(entry)}</td>
                              <td className='py-2 pr-3 text-white font-mono'>{entry.posicion_campo}</td>
                              <td className='py-2 pr-3 hidden sm:table-cell'>
                                {isBD(entry) ? (
                                  <span className='text-purple-400 text-xs'>BD</span>
                                ) : (
                                  <span className='text-gray-400 text-xs'>Banca</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>

          {/* Acordeón de Pagos Registrados */}
          <div className='mb-6'>
            <div
              className='flex justify-between items-center p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors'
              onClick={() =>
                setExpandedSections(prev => ({
                  ...prev,
                  payments: !prev.payments,
                }))
              }
            >
              <div className='flex flex-col gap-0.5 min-w-0'>
                <h3 className='text-sm sm:text-lg font-semibold text-white'>
                  Pagos Registrados ({gameDetailsData.payments.length} pagos)
                </h3>
                {gameDetailsData.payments.length > 0 && (
                  <div className='flex items-center gap-1 text-sm'>
                    <span className='text-gray-400'>Total:</span>
                    <span className='text-green-400 font-semibold'>
                      $
                      {gameDetailsData.payments
                        .reduce(
                          (sum, payment) =>
                            sum +
                            (payment.monto_umpire || 0) +
                            (payment.monto_inscripcion || 0),
                          0
                        )
                        .toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                  expandedSections.payments ? 'rotate-180' : ''
                }`}
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

            {expandedSections.payments && (
              <div className='mt-3'>
                {gameDetailsData.payments.length > 0 ? (
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {gameDetailsData.payments.map(payment => (
                      <div
                        key={payment.id}
                        className='bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors cursor-pointer hover:bg-gray-600'
                        onClick={() => {
                          if (onViewPlayerHistory) {
                            onViewPlayerHistory(payment.jugadores);
                          }
                        }}
                        title='Haz clic para ver el historial del jugador'
                      >
                        {/* Header de la card */}
                        <div className='flex justify-between items-start mb-3'>
                          <div className='flex-1'>
                            <h4 className='text-white font-semibold text-lg mb-1'>
                              {payment.jugadores?.nombre || 'Jugador'}
                            </h4>
                            <p className='text-gray-400 text-sm'>
                              {new Date(payment.fecha_pago).toLocaleDateString(
                                'es-ES',
                                {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                }
                              )}
                            </p>
                          </div>
                          <div className='ml-3'>
                            {payment.metodo_pago && (
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  payment.metodo_pago === 'Efectivo'
                                    ? 'bg-green-900 text-green-300'
                                    : 'bg-blue-900 text-blue-300'
                                }`}
                              >
                                {payment.metodo_pago}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Montos */}
                        <div className='space-y-2'>
                          {payment.monto_umpire > 0 && (
                            <div className='flex justify-between items-center p-2 bg-green-900 bg-opacity-30 rounded'>
                              <span className='text-gray-300 text-sm'>
                                Umpire:
                              </span>
                              <span className='text-green-400 font-semibold'>
                                ${payment.monto_umpire.toLocaleString()}
                              </span>
                            </div>
                          )}
                          {payment.monto_inscripcion > 0 && (
                            <div className='flex justify-between items-center p-2 bg-blue-900 bg-opacity-30 rounded'>
                              <span className='text-gray-300 text-sm'>
                                Inscripción:
                              </span>
                              <span className='text-blue-400 font-semibold'>
                                ${payment.monto_inscripcion.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Total del pago */}
                        <div className='mt-3 pt-3 border-t border-gray-600'>
                          <div className='flex justify-between items-center'>
                            <span className='text-white font-semibold'>
                              Total:
                            </span>
                            <span className='text-yellow-400 font-bold text-lg'>
                              $
                              {(
                                (payment.monto_umpire || 0) +
                                (payment.monto_inscripcion || 0)
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Indicador de click */}
                        <div className='mt-2 text-center'>
                          <span className='text-gray-400 text-xs'>
                            👤 Ver jugador
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='p-6 bg-gray-700 rounded-lg text-center'>
                    <div className='text-gray-400 text-4xl mb-3'>💰</div>
                    <p className='text-gray-400 text-lg'>
                      No hay pagos registrados
                    </p>
                    <p className='text-gray-500 text-sm mt-1'>
                      Los pagos aparecerán aquí cuando se registren
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmación para eliminar partido */}
      {showDeleteWarning && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60'>
          <div className='bg-gray-800 border border-red-600 rounded-lg p-6 max-w-md mx-4'>
            <div className='text-red-200 font-semibold text-lg mb-4'>
              🗑️ Eliminar Partido
            </div>
            <div className='text-gray-200 text-sm mb-6'>
              <p className='mb-3'>
                Estás a punto de <strong>eliminar completamente</strong> este
                partido:
              </p>
              <div className='bg-gray-700 p-3 rounded mb-3'>
                <p className='text-white font-semibold'>
                  vs {selectedGame.equipo_contrario}
                </p>
                <p className='text-gray-300 text-sm'>
                  {new Date(selectedGame.fecha_partido).toLocaleDateString()} -{' '}
                  {selectedGame.lugar}
                </p>
              </div>
              <p className='text-yellow-300 text-sm'>
                ⚠️ Esta acción eliminará:
              </p>
              <ul className='text-yellow-200 text-sm ml-4 mt-2 space-y-1'>
                <li>• El registro del partido</li>
                <li>• Todos los registros de asistencia</li>
                <li>• Todos los pagos asociados</li>
              </ul>
              <p className='text-red-300 text-sm mt-3 font-semibold'>
                ⚠️ Esta acción no se puede deshacer.
              </p>
            </div>
            <div className='flex space-x-3'>
              <button
                onClick={() => setShowDeleteWarning(false)}
                className='btn btn-secondary flex-1'
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeleteGame(selectedGame.id);
                  setShowDeleteWarning(false);
                  onClose();
                }}
                className='btn btn-danger flex-1'
              >
                Sí, Eliminar Partido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleHistoryModal;

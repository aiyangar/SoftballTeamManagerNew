import React, { useState, useEffect } from 'react'
import PaymentStatusWidget from '../Widgets/PaymentStatusWidget'

/**
 * Componente para el modal de detalles del partido
 * @param {boolean} showModal - Estado para mostrar/ocultar el modal
 * @param {Object} selectedGame - Datos del partido seleccionado
 * @param {Object} paymentTotals - Totales de pagos por partido
 * @param {Object} gameDetailsData - Datos detallados del partido
 * @param {Function} onClose - Función para cerrar el modal
 * @param {Function} getLocalTeamName - Función para obtener el nombre del equipo local
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
 */
const ScheduleHistoryModal = ({
    showModal,
    selectedGame,
    paymentTotals,
    gameDetailsData,
    onClose,
    getLocalTeamName,
    onEditGame,
    onDeleteGame,
    gameFinalizationStatus,
    onOpenPaymentForm,
    players,
    attendance,
    onAttendanceChange,
    onRecordAttendance,
    onLoadExistingAttendance,
    onReloadDetails
}) => {
    const [isEditingAttendance, setIsEditingAttendance] = useState(false);
    const [localAttendance, setLocalAttendance] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDeleteWarning, setShowDeleteWarning] = useState(false);

    // Cargar asistencia existente cuando se abre el modal
    useEffect(() => {
        if (showModal && selectedGame) {
            const currentAttendance = attendance[selectedGame.id] || [];
            setLocalAttendance(currentAttendance);
        }
    }, [showModal, selectedGame]);

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

    if (!showModal || !selectedGame) return null

    return (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50">
            <div className="bg-neutral-900 border border-gray-600 rounded-lg w-full max-w-4xl mx-4 modal-container">
                <div className="modal-header p-6 border-b border-gray-600">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-semibold text-white">Detalles del Partido</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white text-2xl"
                            title="Cerrar detalles del partido"
                        >
                            ×
                        </button>
                    </div>
                </div>
                
                <div className="modal-content p-6">
                    {/* Botones de acción en la parte superior */}
                    {!gameFinalizationStatus && (
                        <div className="mb-6 flex flex-wrap gap-3">
                            <button
                                onClick={() => {
                                    onEditGame(selectedGame);
                                    onClose();
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center space-x-2"
                                title="Editar partido"
                            >
                                <span>✏️</span>
                                <span>Editar</span>
                            </button>
                            <button
                                onClick={async () => {
                                    if (!isEditingAttendance) {
                                        // Al activar el modo edición, cargar asistencia existente
                                        const success = await onLoadExistingAttendance(selectedGame.id);
                                        if (success) {
                                            setIsEditingAttendance(true);
                                        }
                                    } else {
                                        // Al cancelar, resetear el estado local al estado global
                                        setIsEditingAttendance(false);
                                        const currentAttendance = attendance[selectedGame.id] || [];
                                        setLocalAttendance(currentAttendance);
                                    }
                                }}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center space-x-2"
                                title="Gestionar asistencia"
                            >
                                <span>{isEditingAttendance ? '✕' : '📋'}</span>
                                <span>{isEditingAttendance ? 'Cancelar' : 'Asistencia'}</span>
                            </button>
                            <button
                                onClick={() => {
                                    onOpenPaymentForm(selectedGame.id);
                                    onClose();
                                }}
                                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors flex items-center space-x-2"
                                title="Registrar pagos"
                            >
                                <span>💰</span>
                                <span>Pagos</span>
                            </button>
                            <button
                                onClick={() => setShowDeleteWarning(true)}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center space-x-2"
                                title="Eliminar partido"
                            >
                                <span>🗑️</span>
                                <span>Eliminar</span>
                            </button>
                        </div>
                    )}
                    {/* Información básica del partido */}
                    <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">{selectedGame.equipo_contrario}</h3>
                                <p className="text-gray-300">Fecha: {new Date(selectedGame.fecha_partido).toLocaleDateString()}</p>
                                <p className="text-gray-300">Lugar: {selectedGame.lugar}</p>
                                <p className="text-gray-300">Umpire: ${selectedGame.umpire || 550}</p>
                            </div>
                            <div>
                                {selectedGame.resultado && (
                                    <div className="text-center">
                                        <p className="text-gray-300 text-sm mb-1">Resultado:</p>
                                        <p className="text-2xl font-bold text-white">
                                            {selectedGame.carreras_equipo_local || 0} - {selectedGame.carreras_equipo_contrario || 0}
                                        </p>
                                        <p className={`text-sm font-semibold ${
                                            selectedGame.resultado === 'Victoria' ? 'text-green-400' :
                                            selectedGame.resultado === 'Derrota' ? 'text-red-400' :
                                            'text-yellow-400'
                                        }`}>
                                            {selectedGame.resultado}
                                        </p>
                                    </div>
                                )}
                                {selectedGame.finalizado && (
                                    <div className="mt-2 p-2 bg-red-900 border border-red-600 rounded text-center">
                                        <span className="text-red-200 font-semibold text-sm">🔒 PARTIDO FINALIZADO</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Widget de Estado de Pagos */}
                    {paymentTotals[selectedGame.id] && (
                        <div className="mb-6">
                            <PaymentStatusWidget
                                paymentTotals={paymentTotals[selectedGame.id]}
                                umpireTarget={selectedGame.umpire || 550}
                                size="large"
                                showTitle={true}
                            />
                        </div>
                    )}
                    
                    {/* Asistencia */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-white">
                                Asistencia ({gameDetailsData.attendance.length} jugadores)
                            </h3>
                            {!gameFinalizationStatus && isEditingAttendance && (
                                <div className="flex space-x-2">
                                                                         <button
                                         onClick={() => {
                                             console.log('=== DEBUG LIMPIAR ===');
                                             console.log('Limpiando asistencia para partido:', selectedGame.id);
                                             console.log('Estado local antes:', localAttendance);
                                             setLocalAttendance([]);
                                             // También limpiar el estado global
                                             onAttendanceChange(selectedGame.id, []);
                                             console.log('Estado local después:', []);
                                             console.log('========================');
                                         }}
                                         className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                                     >
                                         Limpiar
                                     </button>
                                                                         <button
                                         onClick={async () => {
                                             console.log('=== DEBUG GUARDAR ===');
                                             console.log('Guardando asistencia para partido:', selectedGame.id);
                                             console.log('Estado local actual:', localAttendance);
                                             console.log('Estado global actual:', attendance);
                                             setLoading(true);
                                             const success = await onRecordAttendance(selectedGame.id);
                                             setLoading(false);
                                             if (success) {
                                                 setIsEditingAttendance(false);
                                                 // Recargar datos del modal inmediatamente
                                                 if (onReloadDetails) {
                                                     await onReloadDetails();
                                                 }
                                             }
                                             console.log('Resultado del guardado:', success);
                                             console.log('========================');
                                         }}
                                        disabled={loading}
                                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {loading ? 'Guardando...' : 'Guardar'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {isEditingAttendance && !gameFinalizationStatus ? (
                            // Modo edición
                                                         <div className="p-4 bg-gray-800 rounded-lg">
                                 <div className="flex justify-between items-center mb-3">
                                     <h4 className="text-white font-semibold">Seleccionar Jugadores Asistentes</h4>
                                     <div className="text-sm text-gray-300">
                                         {localAttendance.length} de {players.length} seleccionados
                                     </div>
                                 </div>
                                 
                                 {/* Barra de progreso */}
                                 {players.length > 0 && (
                                     <div className="mb-4">
                                         <div className="w-full bg-gray-700 rounded-full h-2">
                                             <div 
                                                 className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                                 style={{ 
                                                     width: `${(localAttendance.length / players.length) * 100}%` 
                                                 }}
                                             ></div>
                                         </div>
                                     </div>
                                 )}
                                {players.length === 0 ? (
                                    <div className="text-yellow-500 text-center">
                                        <p>No hay jugadores registrados en este equipo.</p>
                                    </div>
                                ) : (
                                                                             <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                             {players.map(player => {
                                                 const isSelected = localAttendance.includes(player.id);
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
                                                             type="checkbox"
                                                             checked={isSelected}
                                                                                                                           onChange={() => {
                                                                  const newAttendance = isSelected
                                                                      ? localAttendance.filter(id => id !== player.id)
                                                                      : [...localAttendance, player.id];
                                                                  console.log('=== DEBUG CHECKBOX CHANGE ===');
                                                                  console.log('Player ID:', player.id, 'Tipo:', typeof player.id);
                                                                  console.log('Player Name:', player.nombre);
                                                                  console.log('Is Selected:', isSelected);
                                                                  console.log('Local Attendance antes:', localAttendance);
                                                                  console.log('Local Attendance después:', newAttendance);
                                                                  console.log('Game ID:', selectedGame.id);
                                                                  console.log('================================');
                                                                  setLocalAttendance(newAttendance);
                                                                  // También actualizar el estado global
                                                                  onAttendanceChange(selectedGame.id, newAttendance);
                                                              }}
                                                              onClick={(e) => e.stopPropagation()}
                                                             className="form-checkbox h-5 w-5 text-green-600"
                                                         />
                                                         <span className={`font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                                             {player.nombre}
                                                         </span>
                                                         {isSelected && (
                                                             <span className="text-green-400 text-lg">✓</span>
                                                         )}
                                                     </label>
                                                 );
                                             })}
                                         </div>
                                )}
                            </div>
                        ) : (
                            // Modo visualización
                            gameDetailsData.attendance.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {gameDetailsData.attendance.map((att, index) => (
                                        <div key={index} className="p-3 bg-gray-800 rounded-lg text-center">
                                            <div className="text-green-400 text-2xl mb-1">✓</div>
                                            <p className="text-white text-sm">{att.jugadores?.nombre || 'Jugador'}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 bg-gray-800 rounded-lg text-center">
                                    <p className="text-gray-400">No hay registros de asistencia</p>
                                </div>
                            )
                        )}
                    </div>
                    
                    {/* Pagos Detallados */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Pagos Registrados ({gameDetailsData.payments.length} pagos)</h3>
                        {gameDetailsData.payments.length > 0 ? (
                            <div className="space-y-3">
                                {gameDetailsData.payments.map((payment) => (
                                    <div key={payment.id} className="p-4 bg-gray-800 rounded-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="text-white font-semibold">{payment.jugadores?.nombre || 'Jugador'}</p>
                                                <p className="text-gray-400 text-sm">
                                                    {new Date(payment.fecha_pago).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                {payment.monto_umpire > 0 && (
                                                    <p className="text-green-400 text-sm">
                                                        Umpire: ${payment.monto_umpire.toLocaleString()}
                                                    </p>
                                                )}
                                                {payment.monto_inscripcion > 0 && (
                                                    <p className="text-blue-400 text-sm">
                                                        Inscripción: ${payment.monto_inscripcion.toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 bg-gray-800 rounded-lg text-center">
                                <p className="text-gray-400">No hay pagos registrados</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de confirmación para eliminar partido */}
            {showDeleteWarning && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
                    <div className="bg-gray-800 border border-red-600 rounded-lg p-6 max-w-md mx-4">
                        <div className="text-red-200 font-semibold text-lg mb-4">🗑️ Eliminar Partido</div>
                        <div className="text-gray-200 text-sm mb-6">
                            <p className="mb-3">
                                Estás a punto de <strong>eliminar completamente</strong> este partido:
                            </p>
                            <div className="bg-gray-700 p-3 rounded mb-3">
                                <p className="text-white font-semibold">vs {selectedGame.equipo_contrario}</p>
                                <p className="text-gray-300 text-sm">
                                    {new Date(selectedGame.fecha_partido).toLocaleDateString()} - {selectedGame.lugar}
                                </p>
                            </div>
                            <p className="text-yellow-300 text-sm">
                                ⚠️ Esta acción eliminará:
                            </p>
                            <ul className="text-yellow-200 text-sm ml-4 mt-2 space-y-1">
                                <li>• El registro del partido</li>
                                <li>• Todos los registros de asistencia</li>
                                <li>• Todos los pagos asociados</li>
                            </ul>
                            <p className="text-red-300 text-sm mt-3 font-semibold">
                                ⚠️ Esta acción no se puede deshacer.
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowDeleteWarning(false)}
                                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    onDeleteGame(selectedGame.id);
                                    setShowDeleteWarning(false);
                                    onClose();
                                }}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
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

export default ScheduleHistoryModal

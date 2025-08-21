import React from 'react'

/**
 * Componente para el modal de detalles del partido
 * @param {boolean} showModal - Estado para mostrar/ocultar el modal
 * @param {Object} selectedGame - Datos del partido seleccionado
 * @param {Object} paymentTotals - Totales de pagos por partido
 * @param {Object} gameDetailsData - Datos detallados del partido
 * @param {Function} onClose - Función para cerrar el modal
 * @param {Function} getLocalTeamName - Función para obtener el nombre del equipo local
 */
const ScheduleHistoryModal = ({
    showModal,
    selectedGame,
    paymentTotals,
    gameDetailsData,
    onClose,
    // getLocalTeamName - función no utilizada actualmente
}) => {
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
                    
                    {/* Estado de Pagos */}
                    {paymentTotals[selectedGame.id] && (
                        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                            <h3 className="text-lg font-semibold text-white mb-4">Estado de Pagos</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Umpire */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-300">Umpire:</span>
                                        <span className="text-white font-semibold">
                                            ${paymentTotals[selectedGame.id].totalUmpire.toLocaleString()} / ${selectedGame.umpire?.toLocaleString() || '550'}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div 
                                            className="h-2 rounded-full transition-all duration-300"
                                            style={{ 
                                                width: `${Math.min((paymentTotals[selectedGame.id].totalUmpire / (selectedGame.umpire || 550)) * 100, 100)}%`,
                                                backgroundColor: paymentTotals[selectedGame.id].totalUmpire >= (selectedGame.umpire || 550) 
                                                    ? '#10B981' 
                                                    : paymentTotals[selectedGame.id].totalUmpire >= (selectedGame.umpire || 550) * 0.8
                                                    ? '#F59E0B' 
                                                    : paymentTotals[selectedGame.id].totalUmpire >= (selectedGame.umpire || 550) * 0.5
                                                    ? '#F97316' 
                                                    : '#DC2626' 
                                            }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {paymentTotals[selectedGame.id].totalUmpire >= (selectedGame.umpire || 550) 
                                            ? '✅ Meta alcanzada' 
                                            : `Faltan $${((selectedGame.umpire || 550) - paymentTotals[selectedGame.id].totalUmpire).toLocaleString()}`
                                        }
                                    </p>
                                </div>
                                
                                {/* Inscripción */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-300">Inscripción:</span>
                                        <span className="text-white font-semibold">
                                            ${paymentTotals[selectedGame.id].totalInscripcion.toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400">Total recaudado</p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Asistencia */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Asistencia ({gameDetailsData.attendance.length} jugadores)</h3>
                        {gameDetailsData.attendance.length > 0 ? (
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
        </div>
    )
}

export default ScheduleHistoryModal

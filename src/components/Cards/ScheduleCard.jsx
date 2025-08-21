import React from 'react'

/**
 * Componente para las tarjetas individuales de partidos
 * @param {Object} game - Datos del partido
 * @param {Object} paymentTotals - Totales de pagos por partido
 * @param {Object} gameFinalizationStatus - Estado de finalización de partidos
 * @param {Function} onCardClick - Función para manejar el click en la card
 * @param {Function} onActionMenuToggle - Función para manejar el menú de acciones
 * @param {Function} onAttendanceFormToggle - Función para manejar el formulario de asistencia
 * @param {Function} onEditGame - Función para editar partido
 * @param {Function} onOpenPaymentForm - Función para abrir formulario de pagos
 * @param {Function} onOpenScoreForm - Función para abrir formulario de resultado
 * @param {string} actionMenuOpen - ID del partido con menú abierto
 * @param {Array} players - Lista de jugadores
 * @param {Object} attendance - Estado de asistencia por partido
 * @param {Function} onAttendanceChange - Función para cambiar asistencia
 * @param {Function} onLoadExistingAttendance - Función para cargar asistencia existente
 * @param {Function} onRecordAttendance - Función para guardar asistencia
 * @param {Function} onFetchPlayers - Función para recargar jugadores
 * @param {string} selectedTeam - ID del equipo seleccionado
 * @param {Object} showAttendanceForm - Estado de formularios de asistencia
 */
const ScheduleCard = ({ 
    game, 
    paymentTotals, 
    gameFinalizationStatus, 
    onCardClick,
    onActionMenuToggle,
    onAttendanceFormToggle,
    onEditGame,
    onOpenPaymentForm,
    onOpenScoreForm,
    actionMenuOpen,
    players,
    attendance,
    onAttendanceChange,
    onLoadExistingAttendance,
    onRecordAttendance,
    onFetchPlayers,
    selectedTeam,
    showAttendanceForm
}) => {
    return (
        <div 
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-800 hover:border-gray-500 transition-all duration-300"
            onClick={() => onCardClick(game)}
        >
            {gameFinalizationStatus[game.id] ? (
                // Partido finalizado - Vista compacta
                <div>
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <h3 className="font-bold text-lg">{game.equipo_contrario}</h3>
                            <p>Fecha: {new Date(game.fecha_partido).toLocaleDateString()}</p>
                            
                            {/* Marcador siempre visible */}
                            {game.resultado && (
                                <div className="mt-2 p-2 bg-gray-700 rounded">
                                    <p className="text-sm font-semibold text-white">
                                        Marcador: {game.carreras_equipo_local || 0} - {game.carreras_equipo_contrario || 0}
                                    </p>
                                    <p className={`text-xs ${
                                        game.resultado === 'Victoria' ? 'text-green-400' :
                                        game.resultado === 'Derrota' ? 'text-red-400' :
                                        'text-yellow-400'
                                    }`}>
                                        Resultado: {game.resultado}
                                    </p>
                                </div>
                            )}
                            
                            {/* Estado de finalización */}
                            <div className="mt-2 p-2 bg-red-900 border border-red-600 rounded">
                                <span className="text-red-200 font-semibold text-sm">🔒 PARTIDO FINALIZADO</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // Partido no finalizado - Vista completa
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <h3 className="font-bold text-lg">{game.equipo_contrario}</h3>
                        <p>Fecha: {new Date(game.fecha_partido).toLocaleDateString()}</p>
                        <p>Lugar: {game.lugar}</p>
                        <p>Umpire: ${game.umpire || 550}</p>
                        
                        {/* Información de Pagos Acumulados */}
                        {paymentTotals[game.id] && (
                            <div className="mt-3 p-3 bg-gray-800 rounded-lg text-center">
                                <h4 className="font-semibold text-white text-sm mb-2">Estado de Pagos</h4>
                                
                                {/* Umpire */}
                                <div className="mb-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-gray-300 text-xs">Umpire:</span>
                                        <span className="text-white text-sm font-semibold">
                                            ${paymentTotals[game.id].totalUmpire.toLocaleString()} / ${game.umpire?.toLocaleString() || '550'}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                                        <div 
                                            className="h-1.5 rounded-full transition-all duration-300"
                                            style={{ 
                                                width: `${Math.min((paymentTotals[game.id].totalUmpire / (game.umpire || 550)) * 100, 100)}%`,
                                                backgroundColor: paymentTotals[game.id].totalUmpire >= (game.umpire || 550) 
                                                    ? '#10B981' // Verde cuando se alcanza el objetivo
                                                    : paymentTotals[game.id].totalUmpire >= (game.umpire || 550) * 0.8
                                                    ? '#F59E0B' // Amarillo cuando está cerca (80%+)
                                                    : paymentTotals[game.id].totalUmpire >= (game.umpire || 550) * 0.5
                                                    ? '#F97316' // Naranja cuando está a la mitad (50%+)
                                                    : '#DC2626' // Rojo por defecto
                                            }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-xs mt-1">
                                        <span className="text-gray-400">
                                            {paymentTotals[game.id].totalUmpire >= (game.umpire || 550) ? '✅ Completado' : '💰 Recaudado'}
                                        </span>
                                        <span className="text-gray-400">
                                            {paymentTotals[game.id].totalUmpire >= (game.umpire || 550) 
                                                ? 'Meta alcanzada' 
                                                : `Faltan $${((game.umpire || 550) - paymentTotals[game.id].totalUmpire).toLocaleString()}`
                                            }
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Inscripción */}
                                <div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-300 text-xs">Inscripción:</span>
                                        <span className="text-white text-sm font-semibold">
                                            ${paymentTotals[game.id].totalInscripcion.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        Total recaudado
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onActionMenuToggle(game.id);
                            }}
                            className="px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-500 transition-colors"
                            title="Opciones del partido"
                        >
                            ⋮
                        </button>
                        
                        {actionMenuOpen === game.id && (
                            <>
                                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50">
                                    <div className="py-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onAttendanceFormToggle(game.id);
                                            }}
                                            disabled={gameFinalizationStatus[game.id]}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50"
                                        >
                                            📋 Asistencia
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEditGame(game);
                                            }}
                                            disabled={gameFinalizationStatus[game.id]}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50"
                                        >
                                            ✏️ Editar Partido
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onOpenPaymentForm(game.id);
                                            }}
                                            disabled={gameFinalizationStatus[game.id]}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50"
                                        >
                                            💰 Registrar Pagos
                                        </button>
                                        {!gameFinalizationStatus[game.id] && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onOpenScoreForm(game);
                                                }}
                                                className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900 transition-colors"
                                            >
                                                ⚾ Finalizar Partido
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {/* Overlay para cerrar menú */}
                                <div 
                                    className="fixed inset-0 z-40" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onActionMenuToggle(null);
                                    }}
                                />
                            </>
                        )}
                    </div>
                </div>
            )}
            
            {/* Sección de Asistencia - Solo se muestra cuando está habilitada */}
            {showAttendanceForm[game.id] && (
                <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">Asistencia de Jugadores</h4>
                        <button
                            onClick={() => onAttendanceFormToggle(game.id)}
                            className="text-gray-400 hover:text-white"
                            title="Cerrar formulario de asistencia"
                        >
                            ✕
                        </button>
                    </div>
                    
                    {players.length === 0 ? (
                        <div className="text-yellow-500 mb-4">
                            No hay jugadores registrados en este equipo. 
                            <br />
                            <span className="text-sm">Jugadores cargados: {players.length}</span>
                            <br />
                            <button 
                                onClick={() => onFetchPlayers(selectedTeam)}
                                className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                            >
                                Recargar Jugadores
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2">
                            {players.map(player => (
                                <label key={player.id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={attendance[game.id]?.includes(player.id) || false}
                                        onChange={() => onAttendanceChange(game.id, player.id)}
                                        disabled={gameFinalizationStatus[game.id]}
                                        className="form-checkbox h-5 w-5 text-blue-600 disabled:opacity-50"
                                    />
                                    <span className={gameFinalizationStatus[game.id] ? "text-gray-400" : ""}>{player.nombre}</span>
                                </label>
                            ))}
                        </div>
                    )}
                    
                    <div className="flex space-x-2 mt-4">
                        <button
                            onClick={() => onLoadExistingAttendance(game.id)}
                            disabled={gameFinalizationStatus[game.id]}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                        >
                            Cargar Asistencia Existente
                        </button>
                        <button
                            onClick={() => onRecordAttendance(game.id)}
                            disabled={gameFinalizationStatus[game.id]}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            Guardar Asistencia
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ScheduleCard

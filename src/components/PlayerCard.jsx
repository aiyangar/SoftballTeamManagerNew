import React from 'react'

/**
 * Componente para mostrar una tarjeta de jugador individual
 * @param {Object} player - Datos del jugador
 * @param {Function} onEdit - Función para editar el jugador
 * @param {Function} onDelete - Función para eliminar el jugador
 * @param {Function} onViewHistory - Función para ver el historial del jugador
 * @param {number} actionMenuOpen - ID del jugador cuyo menú está abierto
 * @param {Function} onToggleActionMenu - Función para abrir/cerrar el menú de acciones
 */
const PlayerCard = ({ 
    player, 
    onEdit, 
    onDelete, 
    onViewHistory, 
    actionMenuOpen, 
    onToggleActionMenu 
}) => {
    // Función para obtener la abreviación de la posición
    const getPositionAbbreviation = (positionName) => {
        const abbreviations = {
            'Pitcher': 'P',
            'Catcher': 'C',
            'Primera Base': '1B',
            'Segunda Base': '2B',
            'Tercera Base': '3B',
            'Shortstop': 'SS',
            'Jardinero Izquierdo': 'LF',
            'Jardinero Central': 'CF',
            'Jardinero Derecho': 'RF',
            'Short Fielder': 'SF'
        }
        return abbreviations[positionName] || positionName
    }

    return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 hover:bg-gray-700 transition-colors">
            {/* Header de la ficha */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {player.numero || '#'}
                    </div>
                    <h3 className="text-white font-semibold truncate">{player.nombre}</h3>
                </div>
                <div className="relative">
                    <button
                        onClick={() => onToggleActionMenu(player.id)}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                        title="Opciones del jugador"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                    </button>
                    
                    {actionMenuOpen === player.id && (
                        <>
                            <div className="absolute right-0 mt-2 w-48 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-50">
                                <div className="py-1">
                                    <button
                                        onClick={() => onViewHistory(player)}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 transition-colors"
                                    >
                                        📊 Ver Historial
                                    </button>
                                    <button
                                        onClick={() => onEdit(player.id)}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 transition-colors"
                                    >
                                        ✏️ Editar
                                    </button>
                                    <button
                                        onClick={() => {
                                            onDelete(player.id)
                                            onToggleActionMenu(null)
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900 transition-colors"
                                    >
                                        🗑️ Eliminar
                                    </button>
                                </div>
                            </div>
                            {/* Overlay para cerrar menú */}
                            <div 
                                className="fixed inset-0 z-40" 
                                onClick={() => onToggleActionMenu(null)}
                            />
                        </>
                    )}
                </div>
            </div>
            
            {/* Información del jugador */}
            <div className="space-y-2">
                {/* Posiciones */}
                {player.jugador_posiciones && player.jugador_posiciones.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {player.jugador_posiciones.map((jp, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-900 text-blue-200 text-xs rounded-full">
                                {getPositionAbbreviation(jp.posiciones.nombre_posicion)}
                            </span>
                        ))}
                    </div>
                )}
                
                {/* Equipo */}
                {player.equipos && (
                    <div className="text-sm">
                        <span className="text-gray-400">Equipo: </span>
                        <span className="text-blue-400 font-medium">{player.equipos.nombre_equipo}</span>
                    </div>
                )}
                
                {/* Teléfono */}
                {player.telefono && (
                    <div className="text-sm">
                        <span className="text-gray-400">📞 </span>
                        <span className="text-gray-300">{player.telefono}</span>
                    </div>
                )}
                
                {/* Email */}
                {player.email && (
                    <div className="text-sm">
                        <span className="text-gray-400">✉️ </span>
                        <span className="text-gray-300 truncate">{player.email}</span>
                    </div>
                )}
            </div>
        </div>
    )
}

export default PlayerCard

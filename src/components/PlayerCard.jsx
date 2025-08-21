import React from 'react'

/**
 * Componente para mostrar una tarjeta de jugador individual
 * @param {Object} player - Datos del jugador
 * @param {Function} onViewHistory - Función para ver el historial del jugador
 */
const PlayerCard = ({ 
    player, 
    onViewHistory
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
        <div 
            className="bg-gray-800 border border-gray-600 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer"
            onClick={() => onViewHistory(player)}
            title="Haz clic para ver el historial del jugador"
        >
            {/* Header de la ficha */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {player.numero || '#'}
                    </div>
                    <h3 className="text-white font-semibold truncate">{player.nombre}</h3>
                </div>
                <div className="text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
            
            {/* Información del jugador */}
            <div className="space-y-2">
                                 {/* Posiciones */}
                 {player.jugador_posiciones && player.jugador_posiciones.length > 0 && (
                     <div className="flex flex-wrap gap-1">
                         {player.jugador_posiciones.map((jp, idx) => (
                             <span key={idx} className="px-2 py-1 bg-rose-800 text-rose-100 text-xs rounded-full">
                                 {getPositionAbbreviation(jp.posiciones.nombre_posicion)}
                             </span>
                         ))}
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

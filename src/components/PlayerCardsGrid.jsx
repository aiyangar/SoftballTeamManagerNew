import React from 'react'
import PlayerCard from './PlayerCard'

/**
 * Componente para mostrar la grilla de tarjetas de jugadores
 * @param {Array} players - Lista de jugadores
 * @param {boolean} loadingPlayers - Estado de carga
 * @param {Function} onEdit - Función para editar un jugador
 * @param {Function} onDelete - Función para eliminar un jugador
 * @param {Function} onViewHistory - Función para ver el historial de un jugador
 * @param {number} actionMenuOpen - ID del jugador cuyo menú está abierto
 * @param {Function} onToggleActionMenu - Función para abrir/cerrar el menú de acciones
 */
const PlayerCardsGrid = ({ 
    players, 
    loadingPlayers, 
    onEdit, 
    onDelete, 
    onViewHistory, 
    actionMenuOpen, 
    onToggleActionMenu 
}) => {
    if (loadingPlayers) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mx-auto"></div>
                <p className="mt-2 text-gray-300">Cargando jugadores...</p>
            </div>
        )
    }

    if (players.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-300">No hay jugadores registrados.</p>
                <p className="text-sm text-gray-400 mt-1">Registra tu primer jugador usando el botón de arriba.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {players.map((player) => (
                <PlayerCard
                    key={player.id}
                    player={player}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onViewHistory={onViewHistory}
                    actionMenuOpen={actionMenuOpen}
                    onToggleActionMenu={onToggleActionMenu}
                />
            ))}
        </div>
    )
}

export default PlayerCardsGrid

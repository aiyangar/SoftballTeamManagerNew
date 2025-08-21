import React from 'react'
import TeamCard from '../Cards/TeamCard'

/**
 * Componente para la cuadrícula de tarjetas de equipos
 * @param {Array} teams - Array de equipos
 * @param {boolean} loadingTeams - Estado de carga
 * @param {Function} onViewHistory - Función para ver el historial del equipo
 */
const TeamCardsGrid = ({
    teams,
    loadingTeams,
    onViewHistory
}) => {
    if (loadingTeams) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mx-auto"></div>
                <p className="mt-2 text-gray-300">Cargando equipos...</p>
            </div>
        )
    }

    if (teams.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-300">No tienes equipos creados aún.</p>
                <p className="text-sm text-gray-400 mt-1">Crea tu primer equipo usando el formulario de arriba.</p>
            </div>
        )
    }

    return (
        <div className="grid gap-4">
            {teams.map((team) => (
                <TeamCard
                    key={team.id}
                    team={team}
                    onViewHistory={onViewHistory}
                />
            ))}
        </div>
    )
}

export default TeamCardsGrid

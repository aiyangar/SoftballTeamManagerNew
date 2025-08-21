import React from 'react'
import TeamCard from './TeamCard'

/**
 * Componente para la cuadrícula de tarjetas de equipos
 * @param {Array} teams - Array de equipos
 * @param {boolean} loadingTeams - Estado de carga
 * @param {Function} onEdit - Función para editar equipo
 * @param {Function} onDelete - Función para eliminar equipo
 * @param {Function} onToggleActionMenu - Función para manejar el menú de acciones
 * @param {string} actionMenuOpen - ID del equipo con menú abierto
 */
const TeamCardsGrid = ({
    teams,
    loadingTeams,
    onEdit,
    onDelete,
    onToggleActionMenu,
    actionMenuOpen
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
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleActionMenu={onToggleActionMenu}
                    actionMenuOpen={actionMenuOpen}
                />
            ))}
        </div>
    )
}

export default TeamCardsGrid

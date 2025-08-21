import React from 'react'

/**
 * Componente para las tarjetas individuales de equipos
 * @param {Object} team - Datos del equipo
 * @param {Function} onEdit - Función para editar el equipo
 * @param {Function} onDelete - Función para eliminar el equipo
 * @param {Function} onToggleActionMenu - Función para manejar el menú de acciones
 * @param {string} actionMenuOpen - ID del equipo con menú abierto
 */
const TeamCard = ({ 
    team, 
    onEdit, 
    onDelete, 
    onToggleActionMenu, 
    actionMenuOpen 
}) => {
    return (
        <div className="border border-gray-700 rounded-lg p-4 bg-gray-800 hover:bg-gray-750 transition-all duration-300">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <h3 className="font-medium text-lg text-white mb-2">{team.nombre_equipo}</h3>
                    <div className="space-y-3">
                        {/* Jugadores */}
                        <div className="flex items-center space-x-3 p-2 bg-gray-700 rounded-lg">
                            <div className="text-blue-400 text-2xl">
                                👥
                            </div>
                            <div>
                                <div className="text-white font-semibold flex items-center">
                                    {team.totalPlayers || 0}
                                </div>
                                <div className="text-gray-400 text-xs">Jugadores</div>
                            </div>
                        </div>

                        {/* Pagos */}
                        <div className="flex items-center space-x-3 p-2 bg-gray-700 rounded-lg">
                            <div className="text-green-400 text-2xl">
                                💰
                            </div>
                            <div className="flex-1">
                                <div className="text-white font-semibold flex items-center">
                                    ${(team.totalRegistrationPaid || 0).toLocaleString()}
                                    {team.inscripcion && (
                                        <span className="text-gray-400 text-sm ml-1">
                                            / ${team.inscripcion.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                                <div className="text-green-400 text-xs">Pagado</div>
                            </div>
                        </div>

                        {/* Pendiente por pagar */}
                        {team.inscripcion && (
                            <div className="flex items-center space-x-3 p-2 bg-gray-700 rounded-lg">
                                <div className="text-yellow-400 text-2xl">
                                    ⚠️
                                </div>
                                <div className="flex-1">
                                    <div className="text-white font-semibold flex items-center">
                                        ${Math.max(0, (team.inscripcion - (team.totalRegistrationPaid || 0))).toLocaleString()}
                                    </div>
                                    <div className="text-yellow-400 text-xs">Pendiente</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="relative ml-4">
                    <button
                        onClick={() => onToggleActionMenu(team.id)}
                        className="px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-500 transition-colors"
                        title="Opciones del equipo"
                    >
                        ⋮
                    </button>
                    
                    {actionMenuOpen === team.id && (
                        <>
                            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50">
                                <div className="py-1">
                                    <button
                                        onClick={() => onEdit(team)}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                                    >
                                        ✏️ Editar
                                    </button>
                                    <button
                                        onClick={() => onDelete(team)}
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
        </div>
    )
}

export default TeamCard

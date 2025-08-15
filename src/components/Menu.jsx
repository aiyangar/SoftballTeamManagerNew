import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext'
import { useTeam } from '../context/TeamContext'

/**
 * Componente Menu - Menú desplegable reutilizable
 * Se puede usar en todas las páginas de la aplicación
 */
const Menu = () => {
    const { session, signOut } = UserAuth()
    const { teams, selectedTeam, handleTeamChange } = useTeam()
    const navigate = useNavigate()
    const [showMenu, setShowMenu] = useState(false)

    /**
     * Maneja el proceso de cerrar sesión
     */
    const handleSignOut = async () => {
        try {
            await signOut()
            navigate('/signin')
        } catch (error) {
            console.error('Error al cerrar sesión:', error)
        }
    }

    /**
     * Maneja el regreso a la página anterior
     */
    const handleGoBack = () => {
        navigate(-1)
    }

    return (
        <div className="flex items-center space-x-4">
            {/* Botón para regresar */}
            <button
                onClick={handleGoBack}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors flex items-center space-x-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Volver</span>
            </button>

            {/* Menú desplegable */}
            <div className="relative">
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors flex items-center space-x-2"
                >
                    <span>Menú</span>
                    <svg className={`w-4 h-4 transition-transform ${showMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                
                {showMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-neutral-900 border border-gray-600 rounded-lg shadow-lg z-50">
                        <div className="p-4">
                            <h3 className="text-white font-semibold mb-3">Navegación</h3>
                            
                            {/* Selector de Equipo (solo si hay más de un equipo) */}
                            {teams.length > 1 && (
                                <div className="mb-4">
                                    <label className="block text-white text-sm mb-2">Seleccionar Equipo</label>
                                    <select
                                        value={selectedTeam}
                                        onChange={(e) => handleTeamChange(e.target.value)}
                                        className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-white text-sm"
                                    >
                                        <option value="">Selecciona un equipo</option>
                                        {teams.map((team) => (
                                            <option key={team.id} value={team.id}>{team.nombre_equipo}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            
                            {/* Enlaces de navegación */}
                            <div className="space-y-2">
                                <Link 
                                    to="/dashboard"
                                    className="block w-full text-left px-3 py-2 text-white hover:bg-gray-800 rounded transition-colors"
                                    onClick={() => setShowMenu(false)}
                                >
                                    🏠 Dashboard
                                </Link>
                                <Link 
                                    to="/teams"
                                    className="block w-full text-left px-3 py-2 text-white hover:bg-gray-800 rounded transition-colors"
                                    onClick={() => setShowMenu(false)}
                                >
                                    🏟️ Gestionar Equipos
                                </Link>
                                <Link 
                                    to="/players"
                                    className="block w-full text-left px-3 py-2 text-white hover:bg-gray-800 rounded transition-colors"
                                    onClick={() => setShowMenu(false)}
                                >
                                    👥 Gestionar Jugadores
                                </Link>
                                <Link
                                    to="/schedule"
                                    className="block w-full text-left px-3 py-2 text-white hover:bg-gray-800 rounded transition-colors"
                                    onClick={() => setShowMenu(false)}
                                >
                                    ⚾ Gestionar Partidos
                                </Link>
                            </div>
                            
                            <div className="border-t border-gray-600 mt-4 pt-4">
                                <button 
                                    onClick={handleSignOut}
                                    className="block w-full text-left px-3 py-2 text-red-400 hover:bg-red-900 rounded transition-colors"
                                >
                                    🚪 Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Overlay para cerrar menú */}
                {showMenu && (
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowMenu(false)}
                    />
                )}
            </div>
        </div>
    )
}

export default Menu

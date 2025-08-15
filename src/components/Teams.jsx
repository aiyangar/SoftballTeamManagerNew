import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import Menu from './Menu'
import { useTeam } from '../context/TeamContext'

/**
 * Componente para la gestión de equipos
 * Permite crear, editar y eliminar equipos
 * Muestra la lista de equipos existentes
 */
const Teams = () => {
    // Estados para manejar el formulario
    const [name, setName] = useState('')
    const [inscripcion, setInscripcion] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const [actionMenuOpen, setActionMenuOpen] = useState(null)
    const { teams, loadingTeams, fetchTeams } = useTeam() // Usar el contexto del equipo

    // Hook para navegación programática
    const navigate = useNavigate()

    // Obtener estado de sesión del contexto
    const authContext = UserAuth()
    const session = authContext?.session

    /**
     * Crea un nuevo equipo en la base de datos
     * @param {string} nombreEquipo - Nombre del equipo
     * @param {string} inscripcion - Monto de inscripción del equipo
     * @param {string} propietarioId - ID del usuario propietario
     * @returns {Object} - Resultado de la operación
     */
    const createTeam = async (nombreEquipo, inscripcion, propietarioId) => {
        try {
            const { data, error } = await supabase
                .from('equipos')
                .insert([
                    {
                        nombre_equipo: nombreEquipo,
                        inscripcion: inscripcion ? parseFloat(inscripcion) : null,
                        propietario_id: propietarioId // ID del usuario que crea el equipo
                    }
                ])
                .select()

            if (error) {
                console.error('Error al crear equipo:', error)
                return { success: false, error: error.message }
            }

            return { success: true, data: data }
        } catch (error) {
            console.error('Error inesperado al crear equipo:', error)
            return { success: false, error: error.message }
        }
    }

    /**
     * Limpia el formulario y lo oculta
     */
    const resetForm = () => {
        setName('')
        setInscripcion('')
        setError(null)
        setShowForm(false)
    }

    /**
     * Maneja el menú de acciones
     * @param {number} teamId - ID del equipo
     */
    const toggleActionMenu = (teamId) => {
        setActionMenuOpen(actionMenuOpen === teamId ? null : teamId)
    }

    /**
     * Maneja el envío del formulario de creación de equipo
     * @param {Event} e - Evento del formulario
     */
    const handleCreateTeam = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // Verificar que el usuario esté autenticado
        if (!session?.user?.id) {
            setError('Debes estar autenticado para crear un equipo')
            setLoading(false)
            return
        }

        try {
            // Crear el equipo con el ID del usuario autenticado
            const result = await createTeam(name, inscripcion, session.user.id)

            if (result.success) {
                // Limpiar el formulario y ocultarlo
                resetForm()
                // Recargar la lista de equipos
                await fetchTeams()
                // Mostrar mensaje de éxito (podrías usar un toast aquí)
                alert('Equipo creado exitosamente')
            } else {
                // Mostrar error si la creación falló
                setError(result.error || 'Error al crear el equipo')
            }
        } catch (error) {
            console.error('Error inesperado en handleCreateTeam:', error)
            setError(error.message || 'Error inesperado')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Equipos</h1>
                <Menu />
            </div>

            {/* Botón para mostrar/ocultar formulario */}
            <div className="mb-8">
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>{showForm ? 'Cancelar' : 'Agregar Equipo'}</span>
                </button>
            </div>

            {/* Formulario de creación de equipo */}
            {showForm && (
                <div className="bg-neutral-900 shadow rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-white">Crear Nuevo Equipo</h2>
                    <form onSubmit={handleCreateTeam} className='space-y-4'>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Nombre del Equipo *
                            </label>
                            <input 
                                type="text" 
                                placeholder='Ej: Tigres del Norte' 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                className='w-full p-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-gray-800 text-white' 
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Monto de Inscripción ($)
                            </label>
                            <input 
                                type="number" 
                                step="0.01"
                                min="0"
                                placeholder='Ej: 1500.00' 
                                value={inscripcion} 
                                onChange={(e) => setInscripcion(e.target.value)} 
                                className='w-full p-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-gray-800 text-white' 
                            />
                            <p className="text-xs text-gray-400 mt-1">Opcional: Deja vacío si no hay monto de inscripción</p>
                        </div>
                        
                        <button 
                            type='submit' 
                            disabled={loading} 
                            className='w-full mt-6 border border-gray-600 rounded-md p-3 bg-gray-800 text-white hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
                        >
                            {loading ? 'Creando equipo...' : 'Crear Equipo'}
                        </button>
                        
                        {error && (
                            <div className="mt-4 p-3 bg-red-900 border border-red-600 text-red-200 rounded">
                                {error}
                            </div>
                        )}
                    </form>
                </div>
            )}

            {/* Lista de equipos existentes */}
            <div className="bg-neutral-900 shadow rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 text-white">Mis Equipos</h2>
                
                {loadingTeams ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mx-auto"></div>
                        <p className="mt-2 text-gray-300">Cargando equipos...</p>
                    </div>
                ) : teams.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-300">No tienes equipos creados aún.</p>
                        <p className="text-sm text-gray-400 mt-1">Crea tu primer equipo usando el formulario de arriba.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {teams.map((team) => (
                                                         <div key={team.id} className="border border-gray-600 rounded-lg p-4 bg-gray-700">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="font-medium text-lg text-white mb-2">{team.nombre_equipo}</h3>
                                        <div className="space-y-3">
                                                                                         {/* Jugadores */}
                                             <div className="flex items-center space-x-3 p-2 bg-gray-800 rounded-lg">
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
                                             <div className="flex items-center space-x-3 p-2 bg-gray-800 rounded-lg">
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
                                                 <div className="flex items-center space-x-3 p-2 bg-gray-800 rounded-lg">
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
                                            onClick={() => toggleActionMenu(team.id)}
                                            className="px-2 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-500 transition-colors"
                                        >
                                            ⋮
                                        </button>
                                        
                                        {actionMenuOpen === team.id && (
                                            <>
                                                <div className="absolute right-0 mt-2 w-32 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50">
                                                    <div className="py-1">
                                                        <button
                                                            onClick={() => {
                                                                alert('Función de editar equipo - próximamente')
                                                                setActionMenuOpen(null)
                                                            }}
                                                            className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                                                        >
                                                            ✏️ Editar
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                alert('Función de eliminar equipo - próximamente')
                                                                setActionMenuOpen(null)
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
                                                    onClick={() => setActionMenuOpen(null)}
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Teams
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
    const { teams } = useTeam() // Usar el contexto del equipo

    // Hook para navegación programática
    const navigate = useNavigate()

    // Obtener sesión del usuario autenticado
    const { session } = UserAuth()

    /**
     * Obtiene los equipos del usuario autenticado con información adicional
     * @param {string} propietarioId - ID del usuario propietario
     * @returns {Object} - Resultado de la operación
     */
    const fetchTeams = async (propietarioId) => {
        try {
            const { data, error } = await supabase
                .from('equipos')
                .select('*')
                .eq('propietario_id', propietarioId)
                .order('id', { ascending: false })

            if (error) {
                console.error('Error al obtener equipos:', error)
                return { success: false, error: error.message }
            }

            // Obtener información adicional para cada equipo
            const teamsWithInfo = await Promise.all(
                data.map(async (team) => {
                    // Obtener cantidad de jugadores
                    const { data: players, error: playersError } = await supabase
                        .from('jugadores')
                        .select('id')
                        .eq('equipo_id', team.id)

                                         // Obtener total pagado para registro (solo monto_inscripcion, no monto_umpire)
                     const { data: payments, error: paymentsError } = await supabase
                         .from('pagos')
                         .select('monto_inscripcion')
                         .eq('equipo_id', team.id)
                         .not('monto_inscripcion', 'is', null)

                    const totalPlayers = playersError ? 0 : (players?.length || 0)
                    const totalRegistrationPaid = paymentsError ? 0 : 
                        (payments?.reduce((sum, payment) => sum + (payment.monto_inscripcion || 0), 0) || 0)

                    return {
                        ...team,
                        totalPlayers,
                        totalRegistrationPaid
                    }
                })
            )

            console.log('Equipos obtenidos con información:', teamsWithInfo)
            return { success: true, data: teamsWithInfo }
        } catch (error) {
            console.error('Error inesperado al obtener equipos:', error)
            return { success: false, error: error.message }
        }
    }

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

            console.log('Equipo creado:', data)
            return { success: true, data: data }
        } catch (error) {
            console.error('Error inesperado al crear equipo:', error)
            return { success: false, error: error.message }
        }
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
                console.log('Equipo creado exitosamente:', result.data)
                // Limpiar el formulario
                setName('')
                setInscripcion('')
                // Recargar la lista de equipos
                // Los equipos se actualizan automáticamente a través del contexto
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
                <h1 className="text-3xl font-bold">Gestión de Equipos</h1>
                <Menu teams={teams} />
            </div>

            {/* Formulario de creación de equipo */}
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
                             <div key={team.id} className="border border-gray-600 rounded-lg p-4 hover:bg-gray-800 bg-gray-700">
                                 <div className="flex justify-between items-start">
                                     <div className="flex-1">
                                         <h3 className="font-medium text-lg text-white mb-2">{team.nombre_equipo}</h3>
                                         <div className="grid grid-cols-2 gap-4 text-sm">
                                             <div className="flex items-center space-x-2">
                                                 <span className="text-blue-400">👥</span>
                                                 <span className="text-gray-300">
                                                     <span className="font-semibold">{team.totalPlayers}</span> jugadores
                                                 </span>
                                             </div>
                                             <div className="flex items-center space-x-2">
                                                 <span className="text-green-400">💰</span>
                                                 <span className="text-gray-300">
                                                     <span className="font-semibold">${team.totalRegistrationPaid.toLocaleString()}</span> pagado
                                                 </span>
                                             </div>
                                         </div>
                                     </div>
                                     <div className="flex space-x-2 ml-4">
                                         <button 
                                             className="px-3 py-1 bg-gray-800 text-white text-sm rounded hover:bg-gray-900"
                                             onClick={() => alert('Función de editar equipo - próximamente')}
                                         >
                                             Editar
                                         </button>
                                         <button 
                                             className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                                             onClick={() => alert('Función de eliminar equipo - próximamente')}
                                         >
                                             Eliminar
                                         </button>
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
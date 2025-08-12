import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'

/**
 * Componente para la gestión de equipos
 * Permite crear, editar y eliminar equipos
 * Muestra la lista de equipos existentes
 */
const Teams = () => {
    // Estados para manejar el formulario
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [teams, setTeams] = useState([]) // Estado para almacenar los equipos
    const [loadingTeams, setLoadingTeams] = useState(true) // Estado de carga para equipos

    // Hook para navegación programática
    const navigate = useNavigate()

    // Obtener sesión del usuario autenticado
    const { session } = UserAuth()

    /**
     * Obtiene los equipos del usuario autenticado
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

            console.log('Equipos obtenidos:', data)
            return { success: true, data: data }
        } catch (error) {
            console.error('Error inesperado al obtener equipos:', error)
            return { success: false, error: error.message }
        }
    }

    /**
     * Crea un nuevo equipo en la base de datos
     * @param {string} nombreEquipo - Nombre del equipo
     * @param {string} propietarioId - ID del usuario propietario
     * @returns {Object} - Resultado de la operación
     */
    const createTeam = async (nombreEquipo, propietarioId) => {
        try {
            const { data, error } = await supabase
                .from('equipos')
                .insert([
                    {
                        nombre_equipo: nombreEquipo,
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

    // Effect para cargar los equipos cuando el componente se monta
    useEffect(() => {
        const loadTeams = async () => {
            if (session?.user?.id) {
                setLoadingTeams(true)
                const result = await fetchTeams(session.user.id)
                if (result.success) {
                    setTeams(result.data)
                } else {
                    console.error('Error al cargar equipos:', result.error)
                }
                setLoadingTeams(false)
            }
        }

        loadTeams()
    }, [session?.user?.id])

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
            const result = await createTeam(name, session.user.id)

            if (result.success) {
                console.log('Equipo creado exitosamente:', result.data)
                // Limpiar el formulario
                setName('')
                setDescription('') // Mantener por si quieres agregar descripción en el futuro
                // Recargar la lista de equipos
                const teamsResult = await fetchTeams(session.user.id)
                if (teamsResult.success) {
                    setTeams(teamsResult.data)
                }
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
                <Link 
                    to="/dashboard"
                    className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
                >
                    Volver al Dashboard
                </Link>
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
                    
                    {/* Campo de descripción comentado - no está en la base de datos actual
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Descripción
                        </label>
                        <textarea 
                            placeholder='Descripción del equipo (opcional)' 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            className='w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' 
                            rows="3"
                        />
                    </div>
                    */}
                    
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
                                    <div>
                                        <h3 className="font-medium text-lg text-white">{team.nombre_equipo}</h3>
                                        <p className="text-sm text-gray-300">ID: {team.id}</p>
                                        <p className="text-sm text-gray-300">Propietario ID: {team.propietario_id}</p>
                                    </div>
                                    <div className="flex space-x-2">
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

            {/* Información del usuario */}
            {session?.user && (
                <div className="bg-neutral-700 p-4 rounded-lg">
                    <h3 className="font-medium mb-2 text-white">Información del Creador</h3>
                    <p className="text-gray-300"><strong>Usuario:</strong> {session.user.email}</p>
                    <p className="text-gray-300"><strong>ID de Usuario:</strong> {session.user.id}</p>
                </div>
            )}
        </div>
    )
}

export default Teams
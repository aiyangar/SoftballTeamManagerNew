import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import Menu from './Menu'
import { useTeam } from '../context/TeamContext'

/**
 * Componente para la gestión de jugadores
 * Permite crear, editar y eliminar jugadores
 * Permite asignar jugadores a equipos
 * Permite eliminar jugadores de equipos
 * Permite ver la lista de jugadores existentes
 * Permite que los jugadores elijan hasta 3 posiciones
 */
const Players = () => {
    // Estados para manejar el formulario
    const [name, setName] = useState('')
    const [numero, setNumero] = useState('')
    const [telefono, setTelefono] = useState('')
    const [email, setEmail] = useState('')
    const [equipoId, setEquipoId] = useState('')
    const [selectedPositions, setSelectedPositions] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [players, setPlayers] = useState([])
    const [loadingPlayers, setLoadingPlayers] = useState(true)
    const { teams } = useTeam()
    const [positions, setPositions] = useState([])
    const [loadingPositions, setLoadingPositions] = useState(true)
    const [showForm, setShowForm] = useState(false)

    // Hook para navegación programática
    const navigate = useNavigate()

    // Obtener sesión del usuario autenticado
    const { session } = UserAuth()

    /**
     * Obtiene los jugadores del usuario autenticado
     * @param {string} propietarioId - ID del usuario propietario
     * @returns {Object} - Resultado de la operación
     */
    const fetchPlayers = async (propietarioId) => {
        try {
            const { data, error } = await supabase
                .from('jugadores')
                .select(`
                    *,
                    equipos (
                        id,
                        nombre_equipo
                    ),
                    jugador_posiciones (
                        posiciones (
                            id,
                            nombre_posicion
                        )
                    )
                `)
                .eq('propietario_id', propietarioId)
                .order('id', { ascending: false })

            if (error) {
                console.error('Error al obtener jugadores:', error)
                return { success: false, error: error.message }
            }

            console.log('Jugadores obtenidos:', data)
            setPlayers(data)
            setLoadingPlayers(false)
            return { success: true, data: data }
        } catch (error) {
            console.error('Error inesperado al obtener jugadores:', error)
            return { success: false, error: error.message }
        }
    }

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
            setTeams(data)
            setLoadingTeams(false)
            return { success: true, data: data }
        } catch (error) {
            console.error('Error inesperado al obtener equipos:', error)
            return { success: false, error: error.message }
        }
    }

    /**
     * Obtiene todas las posiciones disponibles
     * @returns {Object} - Resultado de la operación
     */
    const fetchPositions = async () => {
        try {
            const { data, error } = await supabase
                .from('posiciones')
                .select('*')
                .order('nombre_posicion', { ascending: true })

            if (error) {
                console.error('Error al obtener posiciones:', error)
                return { success: false, error: error.message }
            }

            console.log('Posiciones obtenidas:', data)
            setPositions(data)
            setLoadingPositions(false)
            return { success: true, data: data }
        } catch (error) {
            console.error('Error inesperado al obtener posiciones:', error)
            return { success: false, error: error.message }
        }
    }

    /**
     * Registra un nuevo jugador
     * @param {Object} playerData - Datos del jugador
     * @returns {Object} - Resultado de la operación
     */
    const registerPlayer = async (playerData) => {
        try {
            setLoading(true)
            setError(null)

            // Validaciones
            if (!playerData.nombre || !playerData.numero) {
                throw new Error('El nombre y número son obligatorios')
            }

            if (playerData.numero < 0 || playerData.numero > 99) {
                throw new Error('El número debe estar entre 0 y 99')
            }

            if (selectedPositions.length > 3) {
                throw new Error('Un jugador puede tener máximo 3 posiciones')
            }

            // Insertar jugador
            const { data: newPlayer, error: playerError } = await supabase
                .from('jugadores')
                .insert([{
                    nombre: playerData.nombre,
                    numero: parseInt(playerData.numero),
                    telefono: playerData.telefono || null,
                    email: playerData.email || null,
                    equipo_id: playerData.equipo_id || null,
                    propietario_id: session.user.id // Incluir el propietario_id
                }])
                .select()

            if (playerError) {
                throw new Error(`Error al registrar jugador: ${playerError.message}`)
            }

            console.log('Jugador registrado:', newPlayer[0])

            // Si hay posiciones seleccionadas, registrarlas
            if (selectedPositions.length > 0 && newPlayer[0]) {
                const positionData = selectedPositions.map(positionId => ({
                    jugador_id: newPlayer[0].id,
                    posicion_id: positionId,
                    equipo_id: playerData.equipo_id || null
                }))

                const { error: positionError } = await supabase
                    .from('jugador_posiciones')
                    .insert(positionData)

                if (positionError) {
                    console.error('Error al registrar posiciones:', positionError)
                    // No lanzamos error aquí porque el jugador ya se registró
                }
            }

            setSuccess('Jugador registrado exitosamente')
            resetForm()
            fetchPlayers(session.user.id) // Recargar lista de jugadores

            return { success: true, data: newPlayer[0] }
        } catch (error) {
            console.error('Error al registrar jugador:', error)
            setError(error.message)
            return { success: false, error: error.message }
        } finally {
            setLoading(false)
        }
    }

    /**
     * Maneja el envío del formulario
     * @param {Event} e - Evento del formulario
     */
    const handleSubmit = async (e) => {
        e.preventDefault()
        
        const playerData = {
            nombre: name,
            numero: numero,
            telefono: telefono,
            email: email,
            equipo_id: equipoId || null
        }

        await registerPlayer(playerData)
    }

    /**
     * Maneja la selección/deselección de posiciones
     * @param {number} positionId - ID de la posición
     */
    const handlePositionToggle = (positionId) => {
        setSelectedPositions(prev => {
            if (prev.includes(positionId)) {
                return prev.filter(id => id !== positionId)
            } else {
                if (prev.length >= 3) {
                    setError('Un jugador puede tener máximo 3 posiciones')
                    return prev
                }
                setError(null)
                return [...prev, positionId]
            }
        })
    }

    /**
     * Resetea el formulario
     */
    const resetForm = () => {
        setName('')
        setNumero('')
        setTelefono('')
        setEmail('')
        setEquipoId('')
        setSelectedPositions([])
        setError(null)
        setSuccess(null)
    }

    /**
     * Elimina un jugador
     * @param {number} playerId - ID del jugador a eliminar
     */
    const deletePlayer = async (playerId) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este jugador?')) {
            return
        }

        try {
            setLoading(true)
            
            // Primero eliminar las posiciones del jugador
            const { error: positionError } = await supabase
                .from('jugador_posiciones')
                .delete()
                .eq('jugador_id', playerId)

            if (positionError) {
                console.error('Error al eliminar posiciones:', positionError)
            }

            // Luego eliminar el jugador
            const { error: playerError } = await supabase
                .from('jugadores')
                .delete()
                .eq('id', playerId)

            if (playerError) {
                throw new Error(`Error al eliminar jugador: ${playerError.message}`)
            }

            setSuccess('Jugador eliminado exitosamente')
            fetchPlayers(session.user.id) // Recargar lista
        } catch (error) {
            console.error('Error al eliminar jugador:', error)
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    // Cargar datos al montar el componente
    useEffect(() => {
        if (session?.user?.id) {
            fetchPlayers(session.user.id)
            fetchPositions()
        }
    }, [session])

    // Si no hay sesión, redirigir al login
    if (!session) {
        navigate('/signin')
        return null
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Gestión de Jugadores</h1>
                <Menu teams={teams} />
            </div>

            {/* Mensajes de error y éxito */}
            {error && (
                <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-900 border border-green-600 text-green-200 px-4 py-3 rounded mb-4">
                    {success}
                </div>
            )}

            {/* Formulario de registro */}
            {showForm && (
                <div className="bg-neutral-900 shadow rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-white">Registrar Nuevo Jugador</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-gray-800 text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Número *
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="99"
                                    value={numero}
                                    onChange={(e) => setNumero(e.target.value)}
                                    className="w-full p-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-gray-800 text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value)}
                                    className="w-full p-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-gray-800 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-gray-800 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Equipo
                                </label>
                                <select
                                    value={equipoId}
                                    onChange={(e) => setEquipoId(e.target.value)}
                                    className="w-full p-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-gray-800 text-white"
                                >
                                    <option value="">Seleccionar equipo</option>
                                    {teams.map(team => (
                                        <option key={team.id} value={team.id}>
                                            {team.nombre_equipo}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Selección de posiciones */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Posiciones (máximo 3)
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {positions.map(position => (
                                    <label key={position.id} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedPositions.includes(position.id)}
                                            onChange={() => handlePositionToggle(position.id)}
                                            className="rounded border-gray-600 text-gray-500 focus:ring-gray-500 bg-gray-800"
                                        />
                                        <span className="text-sm text-gray-300">{position.nombre_posicion}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 text-gray-300 border border-gray-600 rounded-md hover:bg-gray-800"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Registrando...' : 'Registrar Jugador'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Botón para mostrar/ocultar formulario */}
            {!showForm && (
                <div className="mb-8">
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors"
                    >
                        Nuevo Jugador
                    </button>
                </div>
            )}

            {/* Lista de jugadores */}
            <div className="bg-neutral-900 shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-white">Jugadores Registrados</h2>
                <div>
                    {loadingPlayers ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mx-auto"></div>
                            <p className="mt-2 text-gray-300">Cargando jugadores...</p>
                        </div>
                    ) : players.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-300">No hay jugadores registrados.</p>
                            <p className="text-sm text-gray-400 mt-1">Registra tu primer jugador usando el botón de arriba.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-600">
                                <thead className="bg-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Nombre
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Número
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Teléfono
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Equipo
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Posiciones
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-gray-700 divide-y divide-gray-600">
                                    {players.map(player => (
                                        <tr key={player.id} className="hover:bg-gray-800">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                                {player.nombre}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                {player.numero}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                {player.telefono || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                {player.email || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                {player.equipos?.nombre_equipo || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                {player.jugador_posiciones?.map(jp => jp.posiciones.nombre_posicion).join(', ') || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => deletePlayer(player.id)}
                                                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            
        </div>
    )
}

export default Players;
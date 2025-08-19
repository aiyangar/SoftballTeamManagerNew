import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import Menu from './Menu'
import { useTeam } from '../context/TeamContext'
import { useModal } from '../hooks/useModal'
import VersionFooter from './VersionFooter'

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
    const { teams, selectedTeam } = useTeam()
    const [positions, setPositions] = useState([])
    const [loadingPositions, setLoadingPositions] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
    const [visibleColumns, setVisibleColumns] = useState({
        numero: true,
        nombre: true,
        posiciones: true,
        telefono: false,
        email: false,
        equipo: false
    })
    const [showColumnMenu, setShowColumnMenu] = useState(false)
    const [actionMenuOpen, setActionMenuOpen] = useState(null)
    const [editingPlayer, setEditingPlayer] = useState(null)
    const [showPlayerHistoryModal, setShowPlayerHistoryModal] = useState(false)
    const [selectedPlayerForHistory, setSelectedPlayerForHistory] = useState(null)
    const [playerHistory, setPlayerHistory] = useState({
        attendance: [],
        payments: [],
        totalUmpirePaid: 0,
        totalInscripcionPaid: 0,
        gamesPlayed: 0,
        gamesAttended: 0,
        attendanceRate: 0
    })
    const [loadingHistory, setLoadingHistory] = useState(false)
    const [expandedSections, setExpandedSections] = useState({
        attendance: false,
        payments: false
    })

    // Usar el hook para manejar el modal
    useModal(showPlayerHistoryModal)

    // Hook para navegación programática
    const navigate = useNavigate()

    // Obtener estado de sesión del contexto
    const authContext = UserAuth()
    const session = authContext?.session

    // Limpiar mensaje de éxito después de 5 segundos
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                setSuccess(null)
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [success])

    /**
     * Obtiene la información histórica completa de un jugador
     * @param {number} playerId - ID del jugador
     * @param {number} teamId - ID del equipo
     */
    const fetchPlayerHistory = async (playerId, teamId) => {
        setLoadingHistory(true)
        try {
            // Si no hay equipo seleccionado, obtener todos los equipos del jugador
            let teamIds = [teamId]
            if (!teamId) {
                // Obtener todos los equipos del usuario para buscar asistencia y pagos
                const { data: userTeams } = await supabase
                    .from('equipos')
                    .select('id')
                    .eq('propietario_id', session.user.id)
                
                if (userTeams && userTeams.length > 0) {
                    teamIds = userTeams.map(team => team.id)
                } else {
                    // Si no hay equipos, usar un array vacío
                    teamIds = []
                }
            }

            // Obtener asistencia a partidos (de todos los equipos si no hay equipo específico)
            let attendanceQuery = supabase
                .from('asistencia_partidos')
                .select(`
                    partido_id,
                    partidos (
                        id,
                        equipo_contrario,
                        fecha_partido,
                        lugar,
                        finalizado,
                        resultado,
                        carreras_equipo_local,
                        carreras_equipo_contrario
                    )
                `)
                .eq('jugador_id', playerId)

            if (teamIds.length > 0) {
                attendanceQuery = attendanceQuery.in('equipo_id', teamIds)
            }

            const { data: attendanceData, error: attendanceError } = await attendanceQuery

            if (attendanceError) {
                console.error('Error al obtener asistencia:', attendanceError)
            }

            // Obtener pagos realizados (de todos los equipos si no hay equipo específico)
            let paymentsQuery = supabase
                .from('pagos')
                .select(`
                    id,
                    monto_umpire,
                    monto_inscripcion,
                    fecha_pago,
                    partidos (
                        id,
                        equipo_contrario,
                        fecha_partido
                    )
                `)
                .eq('jugador_id', playerId)
                .order('fecha_pago', { ascending: false })

            if (teamIds.length > 0) {
                paymentsQuery = paymentsQuery.in('equipo_id', teamIds)
            }

            const { data: paymentsData, error: paymentsError } = await paymentsQuery

            if (paymentsError) {
                console.error('Error al obtener pagos:', paymentsError)
            }

            // Obtener todos los partidos de los equipos para calcular estadísticas
            let gamesQuery = supabase
                .from('partidos')
                .select('id, fecha_partido, finalizado')
                .order('fecha_partido', { ascending: false })

            if (teamIds.length > 0) {
                gamesQuery = gamesQuery.in('equipo_id', teamIds)
            }

            const { data: allGamesData, error: gamesError } = await gamesQuery

            if (gamesError) {
                console.error('Error al obtener partidos:', gamesError)
            }

            // Calcular estadísticas
            let attendance = attendanceData || []
            let payments = paymentsData || []
            const allGames = allGamesData || []
            
            // Ordenar asistencia por fecha del partido (más reciente primero)
            attendance = attendance.sort((a, b) => {
                const dateA = new Date(a.partidos?.fecha_partido || 0)
                const dateB = new Date(b.partidos?.fecha_partido || 0)
                return dateB - dateA
            })
            
            // Los pagos ya vienen ordenados por fecha_pago desde la consulta
            
            const totalUmpirePaid = payments.reduce((sum, payment) => sum + (payment.monto_umpire || 0), 0)
            const totalInscripcionPaid = payments.reduce((sum, payment) => sum + (payment.monto_inscripcion || 0), 0)
            const gamesPlayed = allGames.length // Total de partidos de todos los equipos
            const gamesAttended = attendance.length // Total de asistencias del jugador
            const attendanceRate = gamesPlayed > 0 ? (gamesAttended / gamesPlayed * 100).toFixed(1) : 0

            console.log('Datos del historial:', {
                attendance: attendance.length,
                payments: payments.length,
                gamesPlayed,
                gamesAttended,
                attendanceRate
            })

            setPlayerHistory({
                attendance,
                payments,
                totalUmpirePaid,
                totalInscripcionPaid,
                gamesPlayed,
                gamesAttended,
                attendanceRate
            })

        } catch (error) {
            console.error('Error al obtener historial del jugador:', error)
            setError('Error al cargar el historial del jugador')
        } finally {
            setLoadingHistory(false)
        }
    }

    /**
     * Abre el modal con la información histórica del jugador
     * @param {Object} player - Objeto del jugador
     */
    const openPlayerHistoryModal = async (player) => {
        setSelectedPlayerForHistory(player)
        setShowPlayerHistoryModal(true)
        setActionMenuOpen(null) // Cerrar el menú de acciones
        
        // Usar el equipo del jugador si está asignado, o el equipo seleccionado, o null para buscar en todos
        const teamId = player.equipo_id || selectedTeam || null
        await fetchPlayerHistory(player.id, teamId)
    }

    /**
     * Cierra el modal de historial del jugador
     */
    const closePlayerHistoryModal = () => {
        setShowPlayerHistoryModal(false)
        setSelectedPlayerForHistory(null)
        setPlayerHistory({
            attendance: [],
            payments: [],
            totalUmpirePaid: 0,
            totalInscripcionPaid: 0,
            gamesPlayed: 0,
            gamesAttended: 0,
            attendanceRate: 0
        })
        setExpandedSections({
            attendance: false,
            payments: false
        })
    }

    /**
     * Maneja la expansión/contracción de secciones del historial
     * @param {string} section - Nombre de la sección ('attendance' o 'payments')
     */
    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }))
    }

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

            if (error) {
                console.error('Error al obtener posiciones:', error)
                return { success: false, error: error.message }
            }

            // Ordenar posiciones según el orden específico del béisbol
            const orderMap = {
                'Pitcher': 1,
                'Catcher': 2,
                '1B': 3,
                '2B': 4,
                '3B': 5,
                'SS': 6,
                'LF': 7,
                'CF': 8,
                'RF': 9,
                'SF': 10
            }

            const sortedPositions = data.sort((a, b) => {
                const orderA = orderMap[a.nombre_posicion] || 999
                const orderB = orderMap[b.nombre_posicion] || 999
                return orderA - orderB
            })

      
            setPositions(sortedPositions)
            setLoadingPositions(false)
            return { success: true, data: sortedPositions }
        } catch (error) {
            console.error('Error inesperado al obtener posiciones:', error)
            return { success: false, error: error.message }
        }
    }

    /**
     * Registra un nuevo jugador o actualiza uno existente
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

            let playerResult
            
            if (editingPlayer) {
                // Actualizar jugador existente
                const { data: updatedPlayer, error: playerError } = await supabase
                    .from('jugadores')
                    .update({
                        nombre: playerData.nombre,
                        numero: parseInt(playerData.numero),
                        telefono: playerData.telefono || null,
                        email: playerData.email || null,
                        equipo_id: playerData.equipo_id || null
                    })
                    .eq('id', editingPlayer.id)
                    .select()
                
                if (playerError) {
                    throw new Error(`Error al actualizar jugador: ${playerError.message}`)
                }
                
                playerResult = updatedPlayer[0]
            } else {
                // Insertar nuevo jugador
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
                
                playerResult = newPlayer[0]
            }

            // Esta línea ya no es necesaria porque playerError se maneja dentro de cada bloque

      

            // Manejar posiciones
            if (editingPlayer) {
                // Para edición: eliminar posiciones existentes y agregar las nuevas
                const { error: deleteError } = await supabase
                    .from('jugador_posiciones')
                    .delete()
                    .eq('jugador_id', editingPlayer.id)

                if (deleteError) {
                    console.error('Error al eliminar posiciones existentes:', deleteError)
                }
            }

            // Si hay posiciones seleccionadas, registrarlas
            if (selectedPositions.length > 0 && playerResult) {
                const positionData = selectedPositions.map(positionId => ({
                    jugador_id: playerResult.id,
                    posicion_id: positionId,
                    equipo_id: playerData.equipo_id || null
                }))

                const { error: positionError } = await supabase
                    .from('jugador_posiciones')
                    .insert(positionData)

                if (positionError) {
                    console.error('Error al registrar posiciones:', positionError)
                    // No lanzamos error aquí porque el jugador ya se registró/actualizó
                }
            }

            setSuccess(editingPlayer ? 'Jugador actualizado exitosamente' : 'Jugador registrado exitosamente')
            resetForm()
            fetchPlayers(session.user.id) // Recargar lista de jugadores

            return { success: true, data: playerResult }
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
        // Mantener el equipo seleccionado actualmente
        setEquipoId(selectedTeam || '')
        setSelectedPositions([])
        setError(null)
        setSuccess(null)
        setEditingPlayer(null)
        setShowForm(false)
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

    // Establecer el equipo seleccionado por defecto cuando cambie
    useEffect(() => {
        if (selectedTeam) {
            setEquipoId(selectedTeam)
        }
    }, [selectedTeam])

    // Función para ordenar los jugadores
    const sortPlayers = (players, key, direction) => {
        return [...players].sort((a, b) => {
            let aValue = a[key]
            let bValue = b[key]

            // Para el nombre, convertir a minúsculas para ordenamiento alfabético
            if (key === 'nombre') {
                aValue = aValue.toLowerCase()
                bValue = bValue.toLowerCase()
            }

            // Para el número, convertir a números
            if (key === 'numero') {
                aValue = parseInt(aValue) || 0
                bValue = parseInt(bValue) || 0
            }

            if (aValue < bValue) {
                return direction === 'asc' ? -1 : 1
            }
            if (aValue > bValue) {
                return direction === 'asc' ? 1 : -1
            }
            return 0
        })
    }

    // Función para manejar el ordenamiento
    const handleSort = (key) => {
        let direction = 'asc'
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc'
        }
        setSortConfig({ key, direction })
    }

    // Obtener jugadores ordenados
    const sortedPlayers = sortConfig.key ? sortPlayers(players, sortConfig.key, sortConfig.direction) : players

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

    // Función para manejar la visibilidad de columnas
    const toggleColumn = (column) => {
        setVisibleColumns(prev => ({
            ...prev,
            [column]: !prev[column]
        }))
    }

    // Función para manejar el menú de acciones
    const toggleActionMenu = (playerId) => {
        setActionMenuOpen(actionMenuOpen === playerId ? null : playerId)
    }

    // Función para editar jugador
    const editPlayer = (playerId) => {
        const player = players.find(p => p.id === playerId)
        if (player) {
            setEditingPlayer(player)
            setName(player.nombre)
            setNumero(player.numero.toString())
            setTelefono(player.telefono || '')
            setEmail(player.email || '')
            setEquipoId(player.equipo_id || '')
            
            // Obtener las posiciones del jugador
            const playerPositions = player.jugador_posiciones?.map(jp => jp.posiciones.id) || []
            setSelectedPositions(playerPositions)
            
            setShowForm(true)
            setActionMenuOpen(null)
        }
    }

    // Si no hay sesión, redirigir al login
    if (!session) {
        navigate('/signin')
        return null
    }

    return (
        <>
            <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Gestión de Jugadores</h1>
            </div>

            {/* Mensajes de error y éxito */}
            {error && (
                <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-900 border border-green-600 text-green-200 px-4 py-3 rounded mb-6">
                    {success}
                </div>
            )}

            {/* Formulario de registro */}
            {showForm && (
                <div className="bg-neutral-900 shadow rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-6 text-white">
                        {editingPlayer ? 'Editar Jugador' : 'Registrar Nuevo Jugador'}
                    </h2>
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
                                 className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                             >
                                 {loading ? (editingPlayer ? 'Actualizando...' : 'Registrando...') : (editingPlayer ? 'Actualizar Jugador' : 'Registrar Jugador')}
                             </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Botón para mostrar/ocultar formulario */}
            <div className="mb-8">
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>{showForm ? 'Cancelar' : 'Agregar Jugador'}</span>
                </button>
            </div>

            {/* Lista de jugadores */}
            <div className="bg-neutral-900 shadow rounded-lg p-6">
                                 <div className="flex items-center justify-between mb-6">
                     <h2 className="text-xl font-semibold text-white">Jugadores Registrados</h2>
                     <div className="flex items-center space-x-4">
                         {selectedTeam && teams.length > 0 && (
                             <div className="text-sm text-gray-300">
                                 <span className="text-gray-400">Equipo: </span>
                                 <span className="font-medium text-blue-400">
                                     {teams.find(team => team.id === selectedTeam)?.nombre_equipo}
                                 </span>
                             </div>
                         )}
                         
                         {/* Menú de columnas */}
                         <div className="relative">
                             <button
                                 className="px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition-colors flex items-center space-x-1"
                                 onClick={() => setShowColumnMenu(!showColumnMenu)}
                             >
                                 <span>Columnas</span>
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                 </svg>
                             </button>
                             
                             {showColumnMenu && (
                                 <>
                                     <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50">
                                         <div className="p-3">
                                             <h4 className="text-white text-sm font-medium mb-2">Mostrar/Ocultar Columnas</h4>
                                             <div className="space-y-2">
                                                 <label className="flex items-center space-x-2">
                                                     <input
                                                         type="checkbox"
                                                         checked={visibleColumns.numero}
                                                         onChange={() => toggleColumn('numero')}
                                                         className="rounded border-gray-600 text-gray-500 focus:ring-gray-500 bg-gray-700"
                                                     />
                                                     <span className="text-sm text-gray-300">Número</span>
                                                 </label>
                                                 <label className="flex items-center space-x-2">
                                                     <input
                                                         type="checkbox"
                                                         checked={visibleColumns.nombre}
                                                         onChange={() => toggleColumn('nombre')}
                                                         className="rounded border-gray-600 text-gray-500 focus:ring-gray-500 bg-gray-700"
                                                     />
                                                     <span className="text-sm text-gray-300">Nombre</span>
                                                 </label>
                                                 <label className="flex items-center space-x-2">
                                                     <input
                                                         type="checkbox"
                                                         checked={visibleColumns.posiciones}
                                                         onChange={() => toggleColumn('posiciones')}
                                                         className="rounded border-gray-600 text-gray-500 focus:ring-gray-500 bg-gray-700"
                                                     />
                                                     <span className="text-sm text-gray-300">Posiciones</span>
                                                 </label>
                                                 <label className="flex items-center space-x-2">
                                                     <input
                                                         type="checkbox"
                                                         checked={visibleColumns.telefono}
                                                         onChange={() => toggleColumn('telefono')}
                                                         className="rounded border-gray-600 text-gray-500 focus:ring-gray-500 bg-gray-700"
                                                     />
                                                     <span className="text-sm text-gray-300">Teléfono</span>
                                                 </label>
                                                 <label className="flex items-center space-x-2">
                                                     <input
                                                         type="checkbox"
                                                         checked={visibleColumns.email}
                                                         onChange={() => toggleColumn('email')}
                                                         className="rounded border-gray-600 text-gray-500 focus:ring-gray-500 bg-gray-700"
                                                     />
                                                     <span className="text-sm text-gray-300">Email</span>
                                                 </label>
                                                 <label className="flex items-center space-x-2">
                                                     <input
                                                         type="checkbox"
                                                         checked={visibleColumns.equipo}
                                                         onChange={() => toggleColumn('equipo')}
                                                         className="rounded border-gray-600 text-gray-500 focus:ring-gray-500 bg-gray-700"
                                                     />
                                                     <span className="text-sm text-gray-300">Equipo</span>
                                                 </label>
                                             </div>
                                         </div>
                                     </div>
                                     {/* Overlay para cerrar menú */}
                                     <div 
                                         className="fixed inset-0 z-40" 
                                         onClick={() => setShowColumnMenu(false)}
                                     />
                                 </>
                             )}
                         </div>
                     </div>
                 </div>
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
                                             #
                                         </th>
                                         {visibleColumns.nombre && (
                                             <th 
                                                 className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700"
                                                 onClick={() => handleSort('nombre')}
                                             >
                                                 <div className="flex items-center space-x-1">
                                                     <span>Nombre</span>
                                                     {sortConfig.key === 'nombre' && (
                                                         <span className="text-blue-400">
                                                             {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                                         </span>
                                                     )}
                                                 </div>
                                             </th>
                                         )}
                                         {visibleColumns.numero && (
                                             <th 
                                                 className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700"
                                                 onClick={() => handleSort('numero')}
                                             >
                                                 <div className="flex items-center space-x-1">
                                                     <span>Número</span>
                                                     {sortConfig.key === 'numero' && (
                                                         <span className="text-blue-400">
                                                             {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                                         </span>
                                                     )}
                                                 </div>
                                             </th>
                                         )}
                                         {visibleColumns.telefono && (
                                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                 Teléfono
                                             </th>
                                         )}
                                         {visibleColumns.email && (
                                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                 Email
                                             </th>
                                         )}
                                         {visibleColumns.equipo && (
                                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                 Equipo
                                             </th>
                                         )}
                                         {visibleColumns.posiciones && (
                                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                 Posiciones
                                             </th>
                                         )}
                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                             Acciones
                                         </th>
                                     </tr>
                                 </thead>
                                <tbody className="bg-gray-700 divide-y divide-gray-600">
                                                                         {sortedPlayers.map((player, index) => (
                                         <tr key={player.id} className="hover:bg-gray-800">
                                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                 {index + 1}
                                             </td>
                                             {visibleColumns.nombre && (
                                                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                                     {player.nombre}
                                                 </td>
                                             )}
                                             {visibleColumns.numero && (
                                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                     {player.numero}
                                                 </td>
                                             )}
                                             {visibleColumns.telefono && (
                                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                     {player.telefono || '-'}
                                                 </td>
                                             )}
                                             {visibleColumns.email && (
                                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                     {player.email || '-'}
                                                 </td>
                                             )}
                                             {visibleColumns.equipo && (
                                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                     {player.equipos?.nombre_equipo || '-'}
                                                 </td>
                                             )}
                                             {visibleColumns.posiciones && (
                                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                     {player.jugador_posiciones?.map(jp => getPositionAbbreviation(jp.posiciones.nombre_posicion)).join(', ') || '-'}
                                                 </td>
                                             )}
                                                                                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                  <div className="relative">
                                                                                                                                     <button
                            onClick={() => toggleActionMenu(player.id)}
                            className="px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-500 transition-colors"
                            title="Opciones del jugador"
                        >
                            ⋮
                        </button>
                                                      
                                                      {actionMenuOpen === player.id && (
                                                          <>
                                                              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50">
                                                                  <div className="py-1">
                                                                      <button
                                                                          onClick={() => openPlayerHistoryModal(player)}
                                                                          className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                                                                      >
                                                                          📊 Ver Historial
                                                                      </button>
                                                                      <button
                                                                          onClick={() => editPlayer(player.id)}
                                                                          className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                                                                      >
                                                                          ✏️ Editar
                                                                      </button>
                                                                      <button
                                                                          onClick={() => {
                                                                              deletePlayer(player.id)
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
                                              </td>
                                         </tr>
                                     ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

                        {/* Modal de Historial del Jugador */}
            {showPlayerHistoryModal && selectedPlayerForHistory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-neutral-900 border border-gray-600 rounded-lg w-full max-w-4xl mx-4 modal-container">
                        {/* Header fijo */}
                        <div className="modal-header p-6 border-b border-gray-600">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-semibold text-white">
                                    Historial de {selectedPlayerForHistory.nombre}
                                </h2>
                                <button
                                    onClick={closePlayerHistoryModal}
                                    className="text-gray-400 hover:text-white text-2xl"
                                    title="Cerrar historial"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        {/* Contenido con scroll */}
                        <div className="modal-content p-6">
                            {loadingHistory ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-300">Cargando historial...</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Estadísticas Generales */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="bg-gray-800 p-4 rounded-lg text-center">
                                            <div className="text-2xl font-bold text-blue-400">{playerHistory.gamesPlayed}</div>
                                            <div className="text-sm text-gray-300">Total Partidos</div>
                                        </div>
                                        <div className="bg-gray-800 p-4 rounded-lg text-center">
                                            <div className="text-2xl font-bold text-green-400">{playerHistory.gamesAttended}</div>
                                            <div className="text-sm text-gray-300">Asistencias</div>
                                        </div>
                                        <div className="bg-gray-800 p-4 rounded-lg text-center">
                                            <div className="text-2xl font-bold text-yellow-400">{playerHistory.attendanceRate}%</div>
                                            <div className="text-sm text-gray-300">Tasa de Asistencia</div>
                                        </div>
                                        <div className="bg-gray-800 p-4 rounded-lg text-center">
                                            <div className="text-2xl font-bold text-purple-400">{playerHistory.payments.length}</div>
                                            <div className="text-sm text-gray-300">Pagos Realizados</div>
                                        </div>
                                    </div>

                                    {/* Resumen de Pagos */}
                                    <div className="bg-gray-800 p-4 rounded-lg">
                                        <h3 className="text-lg font-semibold text-white mb-4">Resumen de Pagos</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-gray-700 p-3 rounded">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-300">Total Umpire:</span>
                                                    <span className="text-green-400 font-semibold">
                                                        ${playerHistory.totalUmpirePaid.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="bg-gray-700 p-3 rounded">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-300">Total Inscripción:</span>
                                                    <span className="text-blue-400 font-semibold">
                                                        ${playerHistory.totalInscripcionPaid.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                                                         {/* Historial de Asistencias */}
                                     <div className="bg-gray-800 p-4 rounded-lg">
                                         <button
                                             onClick={() => toggleSection('attendance')}
                                             className="w-full flex justify-between items-center text-left"
                                         >
                                             <h3 className="text-lg font-semibold text-white">Historial de Asistencias</h3>
                                             <div className="flex items-center space-x-2">
                                                 <span className="text-sm text-gray-400">
                                                     {playerHistory.attendance.length} registros
                                                 </span>
                                                 <svg 
                                                     className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.attendance ? 'rotate-180' : ''}`}
                                                     fill="none" 
                                                     stroke="currentColor" 
                                                     viewBox="0 0 24 24"
                                                 >
                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                 </svg>
                                             </div>
                                         </button>
                                         
                                         {expandedSections.attendance && (
                                             <div className="mt-4">
                                                 {playerHistory.attendance.length === 0 ? (
                                                     <p className="text-gray-400 text-center py-4">No hay registros de asistencia</p>
                                                 ) : (
                                                     <div className="space-y-2">
                                                         {playerHistory.attendance.map((attendance, index) => (
                                                             <div key={index} className="bg-gray-700 p-3 rounded flex justify-between items-center">
                                                                 <div>
                                                                     <div className="font-medium text-white">
                                                                         vs {attendance.partidos?.equipo_contrario}
                                                                     </div>
                                                                     <div className="text-sm text-gray-300">
                                                                         {new Date(attendance.partidos?.fecha_partido).toLocaleDateString()}
                                                                     </div>
                                                                     <div className="text-xs text-gray-400">
                                                                         {attendance.partidos?.lugar}
                                                                     </div>
                                                                 </div>
                                                                 <div className="text-right">
                                                                     {attendance.partidos?.finalizado ? (
                                                                         <div className="text-sm">
                                                                             <div className={`font-semibold ${
                                                                                 attendance.partidos.resultado === 'Victoria' ? 'text-green-400' :
                                                                                 attendance.partidos.resultado === 'Derrota' ? 'text-red-400' :
                                                                                 'text-yellow-400'
                                                                             }`}>
                                                                                 {attendance.partidos.resultado}
                                                                             </div>
                                                                             <div className="text-gray-300">
                                                                                 {attendance.partidos.carreras_equipo_local} - {attendance.partidos.carreras_equipo_contrario}
                                                                             </div>
                                                                         </div>
                                                                     ) : (
                                                                         <span className="text-yellow-400 text-sm">Pendiente</span>
                                                                     )}
                                                                 </div>
                                                             </div>
                                                         ))}
                                                     </div>
                                                 )}
                                             </div>
                                         )}
                                     </div>

                                                                         {/* Historial de Pagos */}
                                     <div className="bg-gray-800 p-4 rounded-lg">
                                         <button
                                             onClick={() => toggleSection('payments')}
                                             className="w-full flex justify-between items-center text-left"
                                         >
                                             <h3 className="text-lg font-semibold text-white">Historial de Pagos</h3>
                                             <div className="flex items-center space-x-2">
                                                 <span className="text-sm text-gray-400">
                                                     {playerHistory.payments.length} registros
                                                 </span>
                                                 <svg 
                                                     className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.payments ? 'rotate-180' : ''}`}
                                                     fill="none" 
                                                     stroke="currentColor" 
                                                     viewBox="0 0 24 24"
                                                 >
                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                 </svg>
                                             </div>
                                         </button>
                                         
                                         {expandedSections.payments && (
                                             <div className="mt-4">
                                                 {playerHistory.payments.length === 0 ? (
                                                     <p className="text-gray-400 text-center py-4">No hay registros de pagos</p>
                                                 ) : (
                                                     <div className="space-y-2">
                                                         {playerHistory.payments.map((payment, index) => (
                                                             <div key={index} className="bg-gray-700 p-3 rounded">
                                                                 <div className="flex justify-between items-start mb-2">
                                                                     <div>
                                                                         <div className="font-medium text-white">
                                                                             vs {payment.partidos?.equipo_contrario}
                                                                         </div>
                                                                         <div className="text-sm text-gray-300">
                                                                             {new Date(payment.fecha_pago).toLocaleDateString()}
                                                                         </div>
                                                                     </div>
                                                                     <div className="text-right">
                                                                         <div className="text-sm text-gray-300">
                                                                             {new Date(payment.fecha_pago).toLocaleTimeString()}
                                                                         </div>
                                                                     </div>
                                                                 </div>
                                                                 <div className="grid grid-cols-2 gap-2 text-sm">
                                                                     {payment.monto_umpire > 0 && (
                                                                         <div className="bg-green-900 p-2 rounded">
                                                                             <span className="text-green-300">Umpire:</span>
                                                                             <span className="text-green-400 font-semibold ml-2">
                                                                                 ${payment.monto_umpire.toLocaleString()}
                                                                             </span>
                                                                         </div>
                                                                     )}
                                                                     {payment.monto_inscripcion > 0 && (
                                                                         <div className="bg-blue-900 p-2 rounded">
                                                                             <span className="text-blue-300">Inscripción:</span>
                                                                             <span className="text-blue-400 font-semibold ml-2">
                                                                                 ${payment.monto_inscripcion.toLocaleString()}
                                                                             </span>
                                                                         </div>
                                                                     )}
                                                                 </div>
                                                             </div>
                                                         ))}
                                                     </div>
                                                 )}
                                             </div>
                                         )}
                                     </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            </div>
            
            {/* Footer con versión */}
            <VersionFooter />
        </>
    )
}

export default Players;
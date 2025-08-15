import React, { useState, useEffect } from 'react'
import { UserAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

/**
 * Componente Dashboard - Página principal para usuarios autenticados
 * Muestra información del equipo seleccionado
 * Este componente está protegido por ProtectedRoute
 */
const Dashboard = () => {
  // Obtener estado de sesión y función de logout del contexto
  const { session, loading, signOut } = UserAuth()
  const navigate = useNavigate()

  // Estados para la información del equipo
  const [teams, setTeams] = useState([])
  const [selectedTeam, setSelectedTeam] = useState('')
  const [teamInfo, setTeamInfo] = useState({
    totalPlayers: 0,
    nextGame: null,
    totalRegistrationPaid: 0
  })
  const [loadingTeam, setLoadingTeam] = useState(false)
  const [loadingTeams, setLoadingTeams] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  // Logs para debugging
  console.log('Estado de sesión en Dashboard:', session)
  console.log('Estado de carga en Dashboard:', loading)
  console.log('Equipos cargados:', teams)

  useEffect(() => {
    if (session && !loading) {
      console.log('Iniciando carga de equipos...')
      fetchTeams()
    }
  }, [session, loading])

  const fetchTeams = async () => {
    console.log('Fetching teams for user:', session?.user?.id)
    setLoadingTeams(true)
    
    const { data, error } = await supabase
      .from('equipos')
      .select('id, nombre_equipo')
      .eq('propietario_id', session.user.id)

    console.log('Teams response:', { data, error })

    if (error) {
      console.error('Error fetching teams:', error)
    } else {
      console.log('Teams loaded successfully:', data)
      setTeams(data || [])
      
      // Si solo hay un equipo, seleccionarlo automáticamente
      if (data && data.length === 1) {
        console.log('Auto-selecting single team:', data[0].id)
        handleTeamChange(data[0].id)
      }
    }
    setLoadingTeams(false)
  }

  const handleTeamChange = async (teamId) => {
    console.log('Team selected:', teamId)
    setSelectedTeam(teamId)
    if (teamId) {
      setLoadingTeam(true)
      await fetchTeamInfo(teamId)
      setLoadingTeam(false)
    } else {
      setTeamInfo({
        totalPlayers: 0,
        nextGame: null,
        totalRegistrationPaid: 0
      })
    }
  }

  const fetchTeamInfo = async (teamId) => {
    console.log('Fetching team info for team:', teamId)
    try {
      // Obtener total de jugadores
      const { data: players, error: playersError } = await supabase
        .from('jugadores')
        .select('id')
        .eq('equipo_id', teamId)

      if (playersError) {
        console.error('Error fetching players:', playersError)
        return
      }

      console.log('Players loaded:', players)

      // Obtener próximo juego (próxima fecha)
      const { data: nextGame, error: gameError } = await supabase
        .from('partidos')
        .select('id, equipo_contrario, fecha_partido, lugar')
        .eq('equipo_id', teamId)
        .gte('fecha_partido', new Date().toISOString().split('T')[0])
        .order('fecha_partido', { ascending: true })
        .limit(1)
        .single()

      if (gameError && gameError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching next game:', gameError)
      }

      console.log('Next game loaded:', nextGame)

      // Obtener total pagado para registro del equipo
      const { data: payments, error: paymentsError } = await supabase
        .from('pagos')
        .select('monto_inscripcion')
        .eq('equipo_id', teamId)

      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError)
        return
      }

      console.log('Payments loaded:', payments)

      const totalRegistrationPaid = payments.reduce((sum, payment) => sum + (payment.monto_inscripcion || 0), 0)

      setTeamInfo({
        totalPlayers: players.length,
        nextGame: nextGame || null,
        totalRegistrationPaid
      })

    } catch (error) {
      console.error('Error fetching team info:', error)
    }
  }

  /**
   * Maneja el proceso de cerrar sesión
   * Cierra la sesión y redirige al usuario a la página de signin
   */
  const handleSignOut = async () => {
    try {
      await signOut() // Cerrar sesión en Supabase
      navigate('/signin') // Redirigir a la página de inicio de sesión
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
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
        </div>
      </div>

      {/* Mensaje de Bienvenida */}
      <div className="bg-neutral-900 shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-white">
          Bienvenido, {session?.user?.email}
        </h2>
      </div>

      {/* Información del Equipo */}
      {selectedTeam && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card: Total de Jugadores */}
          <div className="bg-neutral-900 shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Total de Jugadores</h3>
              <div className="text-4xl text-blue-400 flex items-center justify-center w-16 h-16">👥</div>
            </div>
            <div>
              {loadingTeam ? (
                <p className="text-gray-400">Cargando...</p>
              ) : (
                <p className="text-3xl font-bold text-blue-400">{teamInfo.totalPlayers}</p>
              )}
            </div>
          </div>

          {/* Card: Próximo Juego */}
          <div className="bg-neutral-900 shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Próximo Juego</h3>
              <div className="text-4xl text-green-400 flex items-center justify-center w-16 h-16">⚾</div>
            </div>
            <div>
              {loadingTeam ? (
                <p className="text-gray-400">Cargando...</p>
              ) : teamInfo.nextGame ? (
                <div className="space-y-2">
                  <p className="text-white">
                    <span className="font-semibold">Oponente:</span> {teamInfo.nextGame.equipo_contrario}
                  </p>
                  <p className="text-white">
                    <span className="font-semibold">Fecha:</span> {new Date(teamInfo.nextGame.fecha_partido).toLocaleDateString()}
                  </p>
                  <p className="text-white">
                    <span className="font-semibold">Campo:</span> {teamInfo.nextGame.lugar}
                  </p>
                  <p className="text-white">
                    <span className="font-semibold">Costo Umpire:</span> $550
                  </p>
                </div>
              ) : (
                <p className="text-gray-400">No hay próximos juegos programados</p>
              )}
            </div>
          </div>

          {/* Card: Total Pagado Registro */}
          <div className="bg-neutral-900 shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Total Pagado Registro</h3>
              <div className="text-4xl text-green-400 flex items-center justify-center w-16 h-16">💰</div>
            </div>
            <div>
              {loadingTeam ? (
                <p className="text-gray-400">Cargando...</p>
              ) : (
                <p className="text-3xl font-bold text-green-400">${teamInfo.totalRegistrationPaid.toLocaleString()}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay equipo seleccionado */}
      {!selectedTeam && !loadingTeams && (
        <div className="bg-neutral-900 shadow rounded-lg p-8 text-center">
          {teams.length === 0 ? (
            <div>
              <p className="text-gray-400 mb-4">No tienes equipos registrados</p>
              <Link 
                to="/teams"
                className="inline-block px-6 py-3 bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors"
              >
                Crear Equipo
              </Link>
            </div>
          ) : (
            <div>
              <p className="text-gray-400 mb-4">Selecciona un equipo para ver la información</p>
              <button
                onClick={() => setShowMenu(true)}
                className="inline-block px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Seleccionar Equipo
              </button>
            </div>
          )}
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
  )
}

export default Dashboard
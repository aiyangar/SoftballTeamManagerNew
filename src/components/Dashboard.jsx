import React, { useState, useEffect } from 'react'
import { UserAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Menu from './Menu'
import { useTeam } from '../context/TeamContext'

/**
 * Componente Dashboard - Página principal para usuarios autenticados
 * Muestra información del equipo seleccionado
 * Este componente está protegido por ProtectedRoute
 */
const Dashboard = () => {
  // Obtener estado de sesión y función de logout del contexto con manejo de errores
  const authContext = UserAuth()
  const session = authContext?.session
  const loading = authContext?.loading
  const signOut = authContext?.signOut
  const navigate = useNavigate()

  // Estados para la información del equipo
  const { teams, selectedTeam, loadingTeams } = useTeam()
  const [teamInfo, setTeamInfo] = useState({
    totalPlayers: 0,
    nextGame: null,
    totalRegistrationPaid: 0,
    lastGame: null,
    gameStats: {
      wins: 0,
      losses: 0,
      ties: 0
    },
    topContributors: []
  })
  const [loadingTeam, setLoadingTeam] = useState(false)

  // Logs para debugging

  useEffect(() => {
    if (selectedTeam) {
      fetchTeamInfo(selectedTeam)
    }
  }, [selectedTeam])

  const fetchTeams = async () => {
    setLoadingTeams(true)
    
    const { data, error } = await supabase
      .from('equipos')
      .select('id, nombre_equipo')
      .eq('propietario_id', session?.user?.id)

    if (error) {
      console.error('Error fetching teams:', error)
    } else {
      setTeams(data || [])
      
      // Si solo hay un equipo, seleccionarlo automáticamente
      if (data && data.length === 1) {
        handleTeamChange(data[0].id)
      }
    }
    setLoadingTeams(false)
  }

  const { handleTeamChange: contextHandleTeamChange } = useTeam()

  const handleTeamChange = async (teamId) => {
    contextHandleTeamChange(teamId)
    if (teamId) {
      setLoadingTeam(true)
      await fetchTeamInfo(teamId)
      setLoadingTeam(false)
    } else {
             setTeamInfo({
         totalPlayers: 0,
         nextGame: null,
         totalRegistrationPaid: 0,
         lastGame: null,
         gameStats: {
           wins: 0,
           losses: 0,
           ties: 0
         },
         topContributors: []
       })
    }
  }

  const fetchTeamInfo = async (teamId) => {
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

      // Obtener último partido jugado
      const { data: lastGame, error: lastGameError } = await supabase
        .from('partidos')
        .select('id, equipo_contrario, fecha_partido, lugar, carreras_equipo_local, carreras_equipo_contrario, resultado, finalizado')
        .eq('equipo_id', teamId)
        .eq('finalizado', true)
        .order('fecha_partido', { ascending: false })
        .limit(1)
        .single()

      if (lastGameError && lastGameError.code !== 'PGRST116') {
        console.error('Error fetching last game:', lastGameError)
      }

      // Obtener estadísticas de partidos
      const { data: allGames, error: statsError } = await supabase
        .from('partidos')
        .select('resultado')
        .eq('equipo_id', teamId)
        .eq('finalizado', true)

      if (statsError) {
        console.error('Error fetching game stats:', statsError)
      }

      // Calcular estadísticas
      const gameStats = {
        wins: allGames?.filter(game => game.resultado === 'Victoria').length || 0,
        losses: allGames?.filter(game => game.resultado === 'Derrota').length || 0,
        ties: allGames?.filter(game => game.resultado === 'Empate').length || 0
      }

      // Obtener total pagado para registro del equipo
      const { data: payments, error: paymentsError } = await supabase
        .from('pagos')
        .select('monto_inscripcion')
        .eq('equipo_id', teamId)

      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError)
        return
      }

             const totalRegistrationPaid = payments.reduce((sum, payment) => sum + (payment.monto_inscripcion || 0), 0)

       // Obtener los 3 jugadores que más han aportado
       const { data: contributors, error: contributorsError } = await supabase
         .from('pagos')
         .select(`
           monto_inscripcion,
           jugadores!inner(nombre)
         `)
         .eq('equipo_id', teamId)
         .not('monto_inscripcion', 'is', null)
         .gt('monto_inscripcion', 0)

             if (contributorsError) {
        console.error('Error fetching contributors:', contributorsError)
      }

       // Agrupar por jugador y sumar sus aportaciones
       const playerContributions = {}
       contributors?.forEach(payment => {
         const playerName = payment.jugadores.nombre
         if (!playerContributions[playerName]) {
           playerContributions[playerName] = 0
         }
         playerContributions[playerName] += payment.monto_inscripcion || 0
       })

       // Ordenar por cantidad y tomar los top 3
       const topContributors = Object.entries(playerContributions)
         .map(([name, amount]) => ({ name, amount }))
         .sort((a, b) => b.amount - a.amount)
         .slice(0, 3)

       setTeamInfo({
         totalPlayers: players.length,
         nextGame: nextGame || null,
         totalRegistrationPaid,
         lastGame: lastGame || null,
         gameStats,
         topContributors
       })

    } catch (error) {
      console.error('Error fetching team info:', error)
    }
  }



  return (
    <div className="max-w-6xl mx-auto p-6">
             <div className="flex justify-between items-center mb-8">
         <h1 className="text-3xl font-bold">Dashboard</h1>
         
         <Menu />
       </div>

             {/* Mensaje de Bienvenida */}
       <div className="bg-neutral-900 shadow rounded-lg p-6 mb-8">
         <h2 className="text-xl font-semibold text-white">
           Bienvenido, {session?.user?.email}
         </h2>
         {selectedTeam && (
           <p className="text-gray-300 mt-2">
             Trabajando con: <span className="font-semibold text-blue-400">
               {teams.find(team => team.id === selectedTeam)?.nombre_equipo}
             </span>
           </p>
         )}
       </div>

      {/* Información del Equipo */}
      {selectedTeam && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

          {/* Card: Último Partido */}
          <div className="bg-neutral-900 shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Último Partido</h3>
              <div className="text-4xl text-yellow-400 flex items-center justify-center w-16 h-16">🏆</div>
            </div>
            <div>
              {loadingTeam ? (
                <p className="text-gray-400">Cargando...</p>
              ) : teamInfo.lastGame ? (
                <div className="space-y-2">
                  <p className="text-white">
                    <span className="font-semibold">Oponente:</span> {teamInfo.lastGame.equipo_contrario}
                  </p>
                  <p className="text-white">
                    <span className="font-semibold">Fecha:</span> {new Date(teamInfo.lastGame.fecha_partido).toLocaleDateString()}
                  </p>
                  <p className="text-white">
                    <span className="font-semibold">Marcador:</span> {teamInfo.lastGame.carreras_equipo_local || 0} - {teamInfo.lastGame.carreras_equipo_contrario || 0}
                  </p>
                  <p className={`font-semibold ${
                    teamInfo.lastGame.resultado === 'Victoria' ? 'text-green-400' :
                    teamInfo.lastGame.resultado === 'Derrota' ? 'text-red-400' :
                    'text-yellow-400'
                  }`}>
                    {teamInfo.lastGame.resultado}
                  </p>
                </div>
              ) : (
                <p className="text-gray-400">No hay partidos jugados</p>
              )}
            </div>
          </div>

          {/* Card: Historial de Resultados */}
          <div className="bg-neutral-900 shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Historial de Resultados</h3>
              <div className="text-4xl text-purple-400 flex items-center justify-center w-16 h-16">📊</div>
            </div>
            <div>
              {loadingTeam ? (
                <p className="text-gray-400">Cargando...</p>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white">Victorias:</span>
                    <span className="text-green-400 font-bold">{teamInfo.gameStats.wins}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white">Derrotas:</span>
                    <span className="text-red-400 font-bold">{teamInfo.gameStats.losses}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white">Empates:</span>
                    <span className="text-yellow-400 font-bold">{teamInfo.gameStats.ties}</span>
                  </div>
                  <div className="border-t border-gray-600 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold">Total:</span>
                      <span className="text-blue-400 font-bold">
                        {teamInfo.gameStats.wins + teamInfo.gameStats.losses + teamInfo.gameStats.ties}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card: Top Contribuyentes */}
          <div className="bg-neutral-900 shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Top Contribuyentes</h3>
              <div className="text-4xl text-orange-400 flex items-center justify-center w-16 h-16">🏅</div>
            </div>
            <div>
              {loadingTeam ? (
                <p className="text-gray-400">Cargando...</p>
              ) : teamInfo.topContributors.length > 0 ? (
                <div className="space-y-3">
                  {teamInfo.topContributors.map((contributor, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-800 rounded">
                      <div className="flex items-center space-x-2">
                        <span className={`text-lg font-bold ${
                          index === 0 ? 'text-yellow-400' : 
                          index === 1 ? 'text-gray-300' : 
                          'text-orange-600'
                        }`}>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </span>
                        <span className="text-white font-medium">{contributor.name}</span>
                      </div>
                      <span className="text-green-400 font-bold">
                        ${contributor.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No hay contribuciones registradas</p>
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
               <p className="text-gray-400 mb-4">Tienes múltiples equipos. Selecciona uno para trabajar:</p>
               <div className="space-y-3">
                 {teams.map(team => (
                   <button
                     key={team.id}
                     onClick={() => handleTeamChange(team.id)}
                     className="block w-full px-6 py-3 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                   >
                     {team.nombre_equipo}
                   </button>
                 ))}
               </div>
             </div>
           )}
         </div>
       )}

      
    </div>
  )
}

export default Dashboard
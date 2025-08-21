import React, { useState, useEffect } from 'react'
import { UserAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Menu from '../components/Menu'
import { useTeam } from '../context/TeamContext'
import DashboardCardsGrid from '../components/CardGrids/DashboardCardsGrid'

/**
 * Componente Dashboard - Página principal para usuarios autenticados
 * Muestra información del equipo seleccionado
 * Este componente está protegido por ProtectedRoute
 */
const Dashboard = () => {
  // Obtener estado de sesión y función de logout del contexto con manejo de errores
  const authContext = UserAuth()
  const session = authContext?.session

  // Estados para la información del equipo
  const { teams, selectedTeam, loadingTeams } = useTeam()
  const [teamInfo, setTeamInfo] = useState({
    totalPlayers: 0,
    nextGame: null,
    totalRegistrationPaid: 0,
    totalRegistrationRequired: 0,
    remainingRegistration: 0,
    lastGame: null,
    gameStats: {
      wins: 0,
      losses: 0,
      ties: 0
    },
    topContributors: [],
    topAttendance: [],
    totalGames: 0,
    averageAttendance: 0
  })
  const [loadingTeam, setLoadingTeam] = useState(false)

  // Logs para debugging

  useEffect(() => {
    if (selectedTeam) {
      fetchTeamInfo(selectedTeam)
    }
  }, [selectedTeam])

  // Nota: fetchTeams se maneja a través del contexto useTeam
  // No necesitamos implementar fetchTeams aquí ya que se maneja en TeamContext

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
          totalRegistrationRequired: 0,
          remainingRegistration: 0,
          lastGame: null,
          gameStats: {
            wins: 0,
            losses: 0,
            ties: 0
          },
          topContributors: [],
          topAttendance: [],
          totalGames: 0,
          averageAttendance: 0
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
      const { data: nextGameData, error: gameError } = await supabase
        .from('partidos')
        .select('id, equipo_contrario, fecha_partido, lugar')
        .eq('equipo_id', teamId)
        .gte('fecha_partido', new Date().toISOString().split('T')[0])
        .order('fecha_partido', { ascending: true })
        .limit(1)

      if (gameError) {
        console.error('Error fetching next game:', gameError)
      }

      const nextGame = nextGameData && nextGameData.length > 0 ? nextGameData[0] : null

      // Obtener último partido jugado
      const { data: lastGameData, error: lastGameError } = await supabase
        .from('partidos')
        .select('id, equipo_contrario, fecha_partido, lugar, carreras_equipo_local, carreras_equipo_contrario, resultado, finalizado')
        .eq('equipo_id', teamId)
        .eq('finalizado', true)
        .order('fecha_partido', { ascending: false })
        .limit(1)

      if (lastGameError) {
        console.error('Error fetching last game:', lastGameError)
      }

      const lastGame = lastGameData && lastGameData.length > 0 ? lastGameData[0] : null

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

      // Obtener información del equipo (incluyendo inscripción)
      const { data: teamDataArray, error: teamError } = await supabase
        .from('equipos')
        .select('inscripcion')
        .eq('id', teamId)

      if (teamError) {
        console.error('Error fetching team data:', teamError)
        return
      }

      const teamData = teamDataArray && teamDataArray.length > 0 ? teamDataArray[0] : null
      if (!teamData) {
        console.error('Team not found')
        return
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
      const totalRegistrationRequired = teamData.inscripcion || 0
      const remainingRegistration = Math.max(0, totalRegistrationRequired - totalRegistrationPaid)

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

        // Obtener top 3 jugadores con más asistencias
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('asistencia_partidos')
          .select(`
            jugadores!inner(nombre)
          `)
          .eq('equipo_id', teamId)

        if (attendanceError) {
          console.error('Error fetching attendance data:', attendanceError)
        }

        // Contar asistencias por jugador
        const playerAttendance = {}
        attendanceData?.forEach(attendance => {
          const playerName = attendance.jugadores.nombre
          if (!playerAttendance[playerName]) {
            playerAttendance[playerName] = 0
          }
          playerAttendance[playerName] += 1
        })

        // Ordenar por asistencias y tomar los top 3
        const topAttendance = Object.entries(playerAttendance)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3)

        // Calcular estadísticas adicionales
        const totalGames = allGames?.length || 0
        const averageAttendance = totalGames > 0 ? Math.round((attendanceData?.length || 0) / totalGames) : 0

        setTeamInfo({
          totalPlayers: players.length,
          nextGame: nextGame || null,
          totalRegistrationPaid,
          totalRegistrationRequired,
          remainingRegistration,
          lastGame: lastGame || null,
          gameStats,
          topContributors,
          topAttendance,
          totalGames,
          averageAttendance
        })

    } catch (error) {
      console.error('Error fetching team info:', error)
    }
  }



    return (
    <>
      <div>
                                 <div className="flex justify-between items-center mb-8">
                      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                    </div>

             {/* Mensaje de Bienvenida */}
       <div className="bg-neutral-900 shadow rounded-lg p-6 mb-8 border border-gray-700">
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
        <DashboardCardsGrid 
          loading={loadingTeam}
          cards={[
            // Card: Total de Jugadores
            {
              title: "Total de Jugadores",
              icon: "👥",
              iconColor: "text-blue-400",
              linkTo: "/players",
              loading: loadingTeam,
              content: <p className="text-3xl font-bold text-blue-400">{teamInfo.totalPlayers}</p>
            },
            // Card: Próximo Juego
            {
              title: "Próximo Juego",
              icon: "⚾",
              iconColor: "text-green-400",
              linkTo: "/schedule",
              loading: loadingTeam,
              content: teamInfo.nextGame ? (
                <div className="space-y-2">
                  <p className="text-white text-sm">
                    <span className="font-semibold">Oponente:</span> {teamInfo.nextGame.equipo_contrario}
                  </p>
                  <p className="text-white text-sm">
                    <span className="font-semibold">Fecha:</span> {new Date(teamInfo.nextGame.fecha_partido).toLocaleDateString()}
                  </p>
                  <p className="text-white text-sm">
                    <span className="font-semibold">Campo:</span> {teamInfo.nextGame.lugar}
                  </p>
                  <p className="text-white text-sm">
                    <span className="font-semibold">Costo Umpire:</span> $550
                  </p>
                </div>
              ) : (
                <p className="text-gray-400">No hay próximos juegos programados</p>
              )
            },
            // Card: Total Pagado Registro
            {
              title: "Total Pagado Registro",
              icon: "💰",
              iconColor: "text-green-400",
              linkTo: "/teams",
              loading: loadingTeam,
              content: (
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-green-400">${teamInfo.totalRegistrationPaid.toLocaleString()}</p>
                  <div className="text-sm text-gray-300">
                    <p>Total requerido: ${teamInfo.totalRegistrationRequired.toLocaleString()}</p>
                    <p className={teamInfo.remainingRegistration > 0 ? 'text-red-400' : 'text-green-400'}>
                      Faltan: ${teamInfo.remainingRegistration.toLocaleString()}
                    </p>
                  </div>
                </div>
              )
            },
            // Card: Último Partido
            {
              title: "Último Partido",
              icon: "🏆",
              iconColor: "text-yellow-400",
              linkTo: "/schedule",
              loading: loadingTeam,
              content: teamInfo.lastGame ? (
                <div className="space-y-2">
                  <p className="text-white text-sm">
                    <span className="font-semibold">Oponente:</span> {teamInfo.lastGame.equipo_contrario}
                  </p>
                  <p className="text-white text-sm">
                    <span className="font-semibold">Fecha:</span> {new Date(teamInfo.lastGame.fecha_partido).toLocaleDateString()}
                  </p>
                  <p className="text-white text-sm">
                    <span className="font-semibold">Marcador:</span> {teamInfo.lastGame.carreras_equipo_local || 0} - {teamInfo.lastGame.carreras_equipo_contrario || 0}
                  </p>
                  <p className={`font-semibold text-sm ${
                    teamInfo.lastGame.resultado === 'Victoria' ? 'text-green-400' :
                    teamInfo.lastGame.resultado === 'Derrota' ? 'text-red-400' :
                    'text-yellow-400'
                  }`}>
                    {teamInfo.lastGame.resultado}
                  </p>
                </div>
              ) : (
                <p className="text-gray-400">No hay partidos jugados</p>
              )
            },
            // Card: Historial de Resultados
            {
              title: "Historial de Resultados",
              icon: "📊",
              iconColor: "text-purple-400",
              linkTo: "/schedule",
              loading: loadingTeam,
              content: (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white text-sm">Victorias:</span>
                    <span className="text-green-400 font-bold">{teamInfo.gameStats.wins}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white text-sm">Derrotas:</span>
                    <span className="text-red-400 font-bold">{teamInfo.gameStats.losses}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white text-sm">Empates:</span>
                    <span className="text-yellow-400 font-bold">{teamInfo.gameStats.ties}</span>
                  </div>
                  <div className="border-t border-gray-600 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold text-sm">Total:</span>
                      <span className="text-blue-400 font-bold">
                        {teamInfo.gameStats.wins + teamInfo.gameStats.losses + teamInfo.gameStats.ties}
                      </span>
                    </div>
                  </div>
                </div>
              )
            },
            // Card: Top Contribuyentes
            {
              title: "Top Contribuyentes",
              icon: "🏅",
              iconColor: "text-orange-400",
              linkTo: "/players",
              loading: loadingTeam,
              content: teamInfo.topContributors.length > 0 ? (
                <div className="space-y-2">
                  {teamInfo.topContributors.map((contributor, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-800 rounded">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <span className={`text-lg font-bold flex-shrink-0 ${
                          index === 0 ? 'text-yellow-400' : 
                          index === 1 ? 'text-gray-300' : 
                          'text-orange-600'
                        }`}>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </span>
                        <span className="text-white font-medium text-sm truncate">{contributor.name}</span>
                      </div>
                      <span className="text-green-400 font-bold text-sm flex-shrink-0 ml-2">
                        ${contributor.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No hay contribuciones registradas</p>
              )
            },
            // Card: Top Asistencias
            {
              title: "Top Asistencias",
              icon: "📋",
              iconColor: "text-blue-400",
              linkTo: "/players",
              loading: loadingTeam,
              content: teamInfo.topAttendance.length > 0 ? (
                <div className="space-y-2">
                  {teamInfo.topAttendance.map((attendance, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-800 rounded">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <span className={`text-lg font-bold flex-shrink-0 ${
                          index === 0 ? 'text-yellow-400' : 
                          index === 1 ? 'text-gray-300' : 
                          'text-orange-600'
                        }`}>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </span>
                        <span className="text-white font-medium text-sm truncate">{attendance.name}</span>
                      </div>
                      <span className="text-blue-400 font-bold text-sm flex-shrink-0 ml-2">
                        {attendance.count} partidos
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No hay asistencias registradas</p>
              )
            },
            // Card: Estadísticas Generales
            {
              title: "Estadísticas Generales",
              icon: "📈",
              iconColor: "text-purple-400",
              linkTo: "/schedule",
              loading: loadingTeam,
              content: (
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-gray-800 rounded">
                    <span className="text-white text-sm">Total Partidos:</span>
                    <span className="text-purple-400 font-bold">{teamInfo.totalGames}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-800 rounded">
                    <span className="text-white text-sm">Promedio Asistencia:</span>
                    <span className="text-blue-400 font-bold text-sm">{teamInfo.averageAttendance} jugadores</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-800 rounded">
                    <span className="text-white text-sm">Porcentaje Victoria:</span>
                    <span className="text-green-400 font-bold">
                      {teamInfo.totalGames > 0 ? Math.round((teamInfo.gameStats.wins / teamInfo.totalGames) * 100) : 0}%
                    </span>
                  </div>
                </div>
              )
            }
          ]}
        />
      )}

             {/* Mensaje cuando no hay equipo seleccionado */}
       {!selectedTeam && !loadingTeams && (
         <div className="bg-neutral-900 shadow rounded-lg p-8 text-center border border-gray-700">
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
    </>
  )
}

export default Dashboard
import React, { createContext, useContext, useState, useEffect } from 'react'
import { UserAuth } from './AuthContext'
import { supabase } from '../supabaseClient'

const TeamContext = createContext()

export const useTeam = () => {
  const context = useContext(TeamContext)
  if (!context) {
    throw new Error('useTeam must be used within a TeamProvider')
  }
  return context
}

export const TeamProvider = ({ children }) => {
  const { session } = UserAuth()
  const [teams, setTeams] = useState([])
  const [selectedTeam, setSelectedTeam] = useState('')
  const [loadingTeams, setLoadingTeams] = useState(false)

  const fetchTeams = async () => {
    if (!session?.user?.id) return
    
    setLoadingTeams(true)
    try {
      const { data, error } = await supabase
        .from('equipos')
        .select('*')
        .eq('propietario_id', session.user.id)

      if (error) {
        console.error('Error fetching teams:', error)
        return
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

      setTeams(teamsWithInfo || [])
      
      // Si solo hay un equipo, seleccionarlo automáticamente
      if (teamsWithInfo && teamsWithInfo.length === 1) {
        console.log('Auto-selecting single team:', teamsWithInfo[0].id)
        setSelectedTeam(teamsWithInfo[0].id)
      }
    } catch (error) {
      console.error('Error in fetchTeams:', error)
    } finally {
      setLoadingTeams(false)
    }
  }

  const handleTeamChange = (teamId) => {
    console.log('Team selected in context:', teamId)
    setSelectedTeam(teamId)
  }

  useEffect(() => {
    if (session?.user?.id) {
      fetchTeams()
    }
  }, [session?.user?.id])

  const value = {
    teams,
    selectedTeam,
    loadingTeams,
    handleTeamChange,
    fetchTeams
  }

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  )
}

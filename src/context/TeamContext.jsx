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
        .select('id, nombre_equipo')
        .eq('propietario_id', session.user.id)

      if (error) {
        console.error('Error fetching teams:', error)
        return
      }

      setTeams(data || [])
      
      // Si solo hay un equipo, seleccionarlo automáticamente
      if (data && data.length === 1) {
        console.log('Auto-selecting single team:', data[0].id)
        setSelectedTeam(data[0].id)
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

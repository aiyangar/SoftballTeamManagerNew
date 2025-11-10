import React, { useState, useEffect } from 'react';
import { UserAuth } from './AuthContext';
import { supabase } from '../supabaseClient';
import { TeamContext } from './TeamContext';

export const TeamProvider = ({ children }) => {
  const authContext = UserAuth();
  const session = authContext?.session; // Usar optional chaining para evitar errores

  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [loadingTeams, setLoadingTeams] = useState(false);

  const fetchTeams = async () => {
    if (!session?.user?.id) return;

    setLoadingTeams(true);
    try {
      const { data, error } = await supabase
        .from('equipos')
        .select('*')
        .eq('propietario_id', session.user.id);

      if (error) {
        console.error('Error fetching teams:', error);
        return;
      }

      // Obtener información adicional para cada equipo
      const teamsWithInfo = await Promise.all(
        data.map(async team => {
          // Obtener cantidad de jugadores
          const { data: players, error: playersError } = await supabase
            .from('jugadores')
            .select('id')
            .eq('equipo_id', team.id);

          // Obtener total pagado para registro (solo monto_inscripcion, no monto_umpire)
          const { data: payments, error: paymentsError } = await supabase
            .from('pagos')
            .select('monto_inscripcion')
            .eq('equipo_id', team.id)
            .not('monto_inscripcion', 'is', null);

          // Obtener estadísticas de partidos finalizados
          const { data: games, error: gamesError } = await supabase
            .from('partidos')
            .select('resultado')
            .eq('equipo_id', team.id)
            .eq('finalizado', true);

          const totalPlayers = playersError ? 0 : players?.length || 0;
          const totalRegistrationPaid = paymentsError
            ? 0
            : payments?.reduce(
                (sum, payment) => sum + (payment.monto_inscripcion || 0),
                0
              ) || 0;

          // Calcular estadísticas W-L-D
          const wins = gamesError
            ? 0
            : games?.filter(game => game.resultado === 'Victoria').length || 0;
          const losses = gamesError
            ? 0
            : games?.filter(game => game.resultado === 'Derrota').length || 0;
          const draws = gamesError
            ? 0
            : games?.filter(game => game.resultado === 'Empate').length || 0;

          return {
            ...team,
            totalPlayers,
            totalRegistrationPaid,
            wins,
            losses,
            draws,
          };
        })
      );

      setTeams(teamsWithInfo || []);

      // Si solo hay un equipo, seleccionarlo automáticamente
      if (teamsWithInfo && teamsWithInfo.length === 1) {
        setSelectedTeam(String(teamsWithInfo[0].id));
      }
    } catch (error) {
      console.error('Error in fetchTeams:', error);
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleTeamChange = teamId => {
    // Normalizar a string para mantener consistencia con el selector HTML
    setSelectedTeam(teamId === '' || teamId === null || teamId === undefined ? '' : String(teamId));
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchTeams();
    }
  }, [session?.user?.id]);

  const value = {
    teams,
    selectedTeam,
    loadingTeams,
    handleTeamChange,
    fetchTeams,
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
};

// Funciones utilitarias para equipos
export const calculateTeamStats = (games) => {
  const wins = games?.filter(game => game.resultado === 'Victoria').length || 0
  const losses = games?.filter(game => game.resultado === 'Derrota').length || 0
  const draws = games?.filter(game => game.resultado === 'Empate').length || 0
  
  return { wins, losses, draws }
}

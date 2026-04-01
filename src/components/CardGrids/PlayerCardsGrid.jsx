import React from 'react';
import PlayerCard from '../Cards/PlayerCard';
import PlayerCardSkeleton from '../Cards/PlayerCardSkeleton';

/**
 * Componente para mostrar la grilla de tarjetas de jugadores
 * @param {Array} players - Lista de jugadores
 * @param {boolean} loadingPlayers - Estado de carga
 * @param {Function} onViewHistory - Función para ver el historial de un jugador
 * @param {Object} playerInscripcionTotals - Totales de inscripción por jugador { [playerId]: total }
 * @param {number} inscripcionTarget - Meta de inscripción calculada dinámicamente
 */
const PlayerCardsGrid = ({
  players,
  loadingPlayers,
  onViewHistory,
  playerInscripcionTotals = {},
  inscripcionTarget = 450,
}) => {
  if (loadingPlayers) {
    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 fold:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-3 sm:gap-4'>
        {Array.from({ length: 8 }).map((_, i) => (
          <PlayerCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className='text-center py-8'>
        <p className='text-gray-300'>No hay jugadores registrados.</p>
        <p className='text-sm text-gray-400 mt-1'>
          Registra tu primer jugador usando el botón de arriba.
        </p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 fold:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-3 sm:gap-4'>
      {players.map(player => (
        <PlayerCard
          key={player.id}
          player={player}
          onViewHistory={onViewHistory}
          totalInscripcionPaid={playerInscripcionTotals[player.id] || 0}
          inscripcionTarget={inscripcionTarget}
        />
      ))}
    </div>
  );
};

export default PlayerCardsGrid;

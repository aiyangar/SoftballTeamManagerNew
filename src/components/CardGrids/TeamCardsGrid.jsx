import React from 'react';
import TeamCard from '../Cards/TeamCard';
import DashboardCardSkeleton from '../Cards/DashboardCardSkeleton';

/**
 * Componente para la cuadrícula de tarjetas de equipos
 * @param {Array} teams - Array de equipos
 * @param {boolean} loadingTeams - Estado de carga
 * @param {Function} onViewHistory - Función para ver el historial del equipo
 */
const TeamCardsGrid = ({ teams, loadingTeams, onViewHistory }) => {
  if (loadingTeams) {
    return (
      <div className='grid grid-cols-1 fold:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
        {Array.from({ length: 4 }).map((_, i) => (
          <DashboardCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className='text-center py-8'>
        <p className='text-gray-300'>No tienes equipos creados aún.</p>
        <p className='text-sm text-gray-400 mt-1'>
          Crea tu primer equipo usando el formulario de arriba.
        </p>
      </div>
    );
  }

  return (
    <div className='grid gap-4'>
      {teams.map(team => (
        <TeamCard key={team.id} team={team} onViewHistory={onViewHistory} />
      ))}
    </div>
  );
};

export default TeamCardsGrid;

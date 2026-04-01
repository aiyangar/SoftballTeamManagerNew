import React from 'react';
import DashboardCard from '../Cards/DashboardCard';
import DashboardCardSkeleton from '../Cards/DashboardCardSkeleton';

/**
 * Componente para la cuadrícula de tarjetas del dashboard
 * @param {Array} cards - Array de datos de las tarjetas
 * @param {boolean} loading - Estado de carga general
 */
const DashboardCardsGrid = ({ cards, loading }) => {
  if (loading) {
    return (
      <div className='grid grid-cols-1 fold:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 gap-6 dashboard-grid'>
        {Array.from({ length: 4 }).map((_, i) => (
          <DashboardCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 fold:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 gap-6 dashboard-grid'>
      {cards.map((cardData, index) => (
        <DashboardCard key={index} cardData={cardData} />
      ))}
    </div>
  );
};

export default DashboardCardsGrid;

import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Componente para las tarjetas individuales del dashboard
 * @param {Object} cardData - Datos de la tarjeta
 * @param {string} cardData.title - Título de la tarjeta
 * @param {string} cardData.icon - Emoji del icono
 * @param {string} cardData.iconColor - Color del icono
 * @param {string} cardData.linkTo - Ruta de navegación
 * @param {boolean} cardData.loading - Estado de carga
 * @param {React.ReactNode} cardData.content - Contenido de la tarjeta
 */
const DashboardCard = ({ cardData }) => {
  const { title, icon, iconColor, linkTo, loading, content } = cardData;

  return (
    <Link to={linkTo} className='block'>
      <div className='bg-neutral-900 shadow rounded-lg pt-4 pb-6 px-6 hover:bg-neutral-800 transition-all duration-300 cursor-pointer h-80 flex flex-col dashboard-card border border-gray-700 hover:border-gray-500'>
        <div className='flex items-center justify-between mb-3 h-16'>
          <h3 className='text-lg font-semibold text-white leading-tight'>
            {title}
          </h3>
          <div
            className={`text-4xl ${iconColor} flex items-center justify-center w-16 h-16 flex-shrink-0`}
          >
            {icon}
          </div>
        </div>
        <div className='w-[95%] mx-auto mb-3 border-t border-gray-600'></div>
        <div className='flex-1 flex items-center justify-start overflow-hidden dashboard-card-content'>
          {loading ? <p className='text-gray-400'>Cargando...</p> : content}
        </div>
      </div>
    </Link>
  );
};

export default DashboardCard;

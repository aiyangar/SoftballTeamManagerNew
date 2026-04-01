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
      <div className='bg-surface-800/50 backdrop-blur-sm rounded-lg pt-4 pb-6 px-6 hover:bg-surface-700/50 transition-all duration-200 cursor-pointer min-h-[18rem] flex flex-col dashboard-card border border-surface-border hover:border-accent-600/50'>
        <div className='flex items-center justify-between mb-3 h-16'>
          <h3 className='text-xs font-semibold text-slate-300 uppercase tracking-wider leading-tight'>
            {title}
          </h3>
          <div
            className={`text-4xl ${iconColor} flex items-center justify-center w-16 h-16 flex-shrink-0`}
          >
            {icon}
          </div>
        </div>
        <div className='w-[95%] mx-auto mb-3 border-t border-surface-border'></div>
        <div className='flex-1 flex items-center justify-start overflow-hidden dashboard-card-content'>
          {loading ? <p className='text-slate-400'>Cargando...</p> : content}
        </div>
      </div>
    </Link>
  );
};

export default DashboardCard;

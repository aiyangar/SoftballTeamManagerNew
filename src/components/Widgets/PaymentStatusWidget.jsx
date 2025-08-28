import React from 'react';

/**
 * Widget reutilizable para mostrar el estado de pagos
 * @param {Object} paymentTotals - Totales de pagos { totalUmpire, totalInscripcion }
 * @param {number} umpireTarget - Objetivo del umpire (por defecto 550)
 * @param {string} size - Tamaño del widget ('small', 'medium', 'large')
 * @param {boolean} showTitle - Si mostrar el título del widget
 * @param {string} className - Clases CSS adicionales
 */
const PaymentStatusWidget = ({
  paymentTotals,
  umpireTarget = 550,
  size = 'medium',
  showTitle = true,
  className = '',
}) => {
  const { totalUmpire = 0, totalInscripcion = 0 } = paymentTotals || {};

  // Configuración de tamaños
  const sizeConfig = {
    small: {
      container: 'p-2',
      title: 'text-xs font-semibold mb-1',
      label: 'text-xs',
      value: 'text-xs font-semibold',
      progress: 'h-1',
      status: 'text-xs',
    },
    medium: {
      container: 'p-3',
      title: 'text-sm font-semibold mb-2',
      label: 'text-sm',
      value: 'text-sm font-semibold',
      progress: 'h-1.5',
      status: 'text-xs',
    },
    large: {
      container: 'p-4',
      title: 'font-semibold mb-3',
      label: 'text-sm',
      value: 'font-semibold',
      progress: 'h-2',
      status: 'text-sm',
    },
  };

  const config = sizeConfig[size];

  // Calcular porcentaje del umpire
  const umpirePercentage = Math.min((totalUmpire / umpireTarget) * 100, 100);

  // Determinar color del progreso del umpire
  const getUmpireProgressColor = () => {
    if (totalUmpire >= umpireTarget) return '#10B981'; // Verde cuando se alcanza el objetivo
    if (totalUmpire >= umpireTarget * 0.8) return '#F59E0B'; // Amarillo cuando está cerca (80%+)
    if (totalUmpire >= umpireTarget * 0.5) return '#F97316'; // Naranja cuando está a la mitad (50%+)
    return '#DC2626'; // Rojo por defecto
  };

  return (
    <div className={`bg-gray-800 rounded-lg ${config.container} ${className}`}>
      {showTitle && (
        <h4 className={`text-white ${config.title}`}>Estado de Pagos</h4>
      )}

      {/* Umpire */}
      <div className='mb-3'>
        <div className='flex justify-between items-center mb-1'>
          <span className={`text-gray-300 ${config.label}`}>Umpire:</span>
          <span className={`text-white ${config.value}`}>
            ${totalUmpire.toLocaleString()} / ${umpireTarget.toLocaleString()}
          </span>
        </div>
        <div className='w-full bg-gray-700 rounded-full'>
          <div
            className={`rounded-full transition-all duration-300 ${config.progress}`}
            style={{
              width: `${umpirePercentage}%`,
              backgroundColor: getUmpireProgressColor(),
            }}
          ></div>
        </div>
        <div className='flex justify-between mt-1'>
          <span className={`text-gray-400 ${config.status}`}>
            {totalUmpire >= umpireTarget ? '✅ Completado' : '💰 Recaudado'}
          </span>
          <span className={`text-gray-400 ${config.status}`}>
            {totalUmpire >= umpireTarget
              ? 'Meta alcanzada'
              : `Faltan $${(umpireTarget - totalUmpire).toLocaleString()}`}
          </span>
        </div>
      </div>

      {/* Inscripción */}
      <div>
        <div className='flex justify-between items-center'>
          <span className={`text-gray-300 ${config.label}`}>Inscripción:</span>
          <span className={`text-white ${config.value}`}>
            ${totalInscripcion.toLocaleString()}
          </span>
        </div>
        <div className={`text-gray-400 mt-1 ${config.status}`}>
          Total recaudado para inscripción
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusWidget;

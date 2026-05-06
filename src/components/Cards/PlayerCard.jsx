import React from 'react';

/**
 * Componente para mostrar una tarjeta de jugador individual
 * @param {Object} player - Datos del jugador
 * @param {Function} onViewHistory - Función para ver el historial del jugador
 * @param {number} totalInscripcionPaid - Total pagado en inscripción por el jugador
 * @param {number} inscripcionTarget - Meta de inscripción calculada dinámicamente
 */
const PlayerCard = ({
  player,
  onViewHistory,
  totalInscripcionPaid = 0,
  inscripcionTarget = 450,
}) => {
  // Función para obtener la abreviación de la posición
  const getPositionAbbreviation = positionName => {
    const abbreviations = {
      Pitcher: 'P',
      Catcher: 'C',
      'Primera Base': '1B',
      'Segunda Base': '2B',
      'Tercera Base': '3B',
      Shortstop: 'SS',
      'Jardinero Izquierdo': 'LF',
      'Jardinero Central': 'CF',
      'Jardinero Derecho': 'RF',
      'Short Fielder': 'SF',
    };
    return abbreviations[positionName] || positionName;
  };

  // Per-player override beats the team default — keeps players with a
  // custom inscripcion_max in sync with what they actually owe.
  const effectiveTarget = player?.inscripcion_max ?? inscripcionTarget;
  const inscripcionProgress = effectiveTarget > 0
    ? Math.min((totalInscripcionPaid / effectiveTarget) * 100, 100)
    : 100;
  const inscripcionRemaining = Math.max(
    0,
    effectiveTarget - totalInscripcionPaid
  );

  // Determinar el color de la barra de progreso
  const getProgressColor = () => {
    if (inscripcionProgress >= 100) return 'bg-green-500';
    if (inscripcionProgress >= 80) return 'bg-yellow-500';
    if (inscripcionProgress >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div
      className='bg-gray-800 border border-gray-600 rounded-lg p-3 sm:p-4 hover:bg-gray-700 transition-colors cursor-pointer min-h-[200px] flex flex-col'
      onClick={() => onViewHistory(player)}
      title='Haz clic para ver el historial del jugador'
    >
      {/* Header de la ficha */}
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center space-x-2'>
          <div className='w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white text-sm font-bold'>
            {player.numero || '#'}
          </div>
          <h3 className='text-white font-semibold truncate'>{player.nombre}</h3>
        </div>
        <div className='text-gray-400'>
          <svg
            className='w-5 h-5'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 5l7 7-7 7'
            />
          </svg>
        </div>
      </div>

      {/* Información del jugador */}
      <div className='space-y-2'>
        {/* Posiciones */}
        {player.jugador_posiciones && player.jugador_posiciones.length > 0 && (
          <div className='flex flex-wrap gap-1'>
            {player.jugador_posiciones.map((jp, idx) => (
              <span
                key={idx}
                className='px-2 py-1 bg-rose-800 text-rose-100 text-xs rounded-full'
              >
                {getPositionAbbreviation(jp.posiciones.nombre_posicion)}
              </span>
            ))}
          </div>
        )}

        {/* Barra de progreso de inscripción */}
        <div className='mt-3'>
          <div className='flex justify-between items-center mb-1'>
            <span className='text-xs text-gray-400'>Inscripción</span>
            <span className='text-xs text-gray-300'>
              ${totalInscripcionPaid.toLocaleString()} / $
              {effectiveTarget.toLocaleString()}
            </span>
          </div>
          <div className='w-full bg-gray-700 rounded-full h-2'>
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${inscripcionProgress}%` }}
            ></div>
          </div>
          {inscripcionRemaining > 0 && (
            <div className='flex justify-between items-center mt-1'>
              <span className='text-xs text-gray-400'>Faltan:</span>
              <span
                className={`text-xs font-semibold ${
                  inscripcionProgress >= 100
                    ? 'text-green-400'
                    : inscripcionProgress >= 80
                      ? 'text-yellow-400'
                      : inscripcionProgress >= 50
                        ? 'text-orange-400'
                        : 'text-red-400'
                }`}
              >
                ${inscripcionRemaining.toLocaleString()}
              </span>
            </div>
          )}
          {inscripcionProgress >= 100 && (
            <div className='flex justify-center mt-1'>
              <span className='text-xs text-green-400 font-semibold'>
                ✓ Meta completada
              </span>
            </div>
          )}
        </div>

        {/* Teléfono */}
        {player.telefono && (
          <div className='text-sm'>
            <span className='text-gray-400'>📞 </span>
            <span className='text-gray-300'>{player.telefono}</span>
          </div>
        )}

        {/* Email */}
        {player.email && (
          <div className='text-sm'>
            <span className='text-gray-400'>✉️ </span>
            <span className='text-gray-300 truncate'>{player.email}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerCard;

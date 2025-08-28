import React from 'react';

/**
 * Componente para las tarjetas individuales de equipos
 * @param {Object} team - Datos del equipo
 * @param {Function} onViewHistory - Función para ver el historial del equipo
 */
const TeamCard = ({ team, onViewHistory }) => {
  return (
    <div
      className='border border-gray-700 rounded-lg p-6 bg-gray-800 hover:bg-gray-750 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl'
      onClick={() => onViewHistory(team)}
    >
      {/* Header con nombre del equipo */}
      <div className='mb-4'>
        <h3 className='font-bold text-xl text-white mb-1'>
          {team.nombre_equipo}
        </h3>
        <div className='w-12 h-1 bg-blue-500 rounded-full'></div>
      </div>

      {/* Grid de estadísticas principales */}
      <div className='grid grid-cols-2 gap-4 mb-4'>
        {/* Jugadores */}
        <div className='bg-gray-700 rounded-lg p-3 text-center'>
          <div className='text-blue-400 text-2xl mb-1'>👥</div>
          <div className='text-white font-bold text-lg'>
            {team.totalPlayers || 0}
          </div>
          <div className='text-gray-400 text-xs'>Jugadores</div>
        </div>

        {/* Record W-L-D */}
        <div className='bg-gray-700 rounded-lg p-3 text-center'>
          <div className='text-orange-400 text-2xl mb-1'>🏆</div>
          <div className='text-white font-bold text-lg'>
            {team.wins || 0}-{team.losses || 0}-{team.draws || 0}
          </div>
          <div className='text-gray-400 text-xs'>W-L-D</div>
        </div>
      </div>

      {/* Estado de pagos */}
      {team.inscripcion && (
        <div className='bg-gray-700 rounded-lg p-3'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-gray-300 text-sm'>Estado de Pagos</span>
            <span className='text-green-400 text-sm font-semibold'>
              ${(team.totalRegistrationPaid || 0).toLocaleString()}
            </span>
          </div>

          {/* Barra de progreso */}
          <div className='w-full bg-gray-600 rounded-full h-2 mb-2'>
            <div
              className='h-2 rounded-full transition-all duration-300'
              style={{
                width: `${Math.min(((team.totalRegistrationPaid || 0) / team.inscripcion) * 100, 100)}%`,
                backgroundColor:
                  (team.totalRegistrationPaid || 0) >= team.inscripcion
                    ? '#10B981'
                    : (team.totalRegistrationPaid || 0) >=
                        team.inscripcion * 0.8
                      ? '#F59E0B'
                      : (team.totalRegistrationPaid || 0) >=
                          team.inscripcion * 0.5
                        ? '#F97316'
                        : '#DC2626',
              }}
            ></div>
          </div>

          <div className='flex justify-between text-xs'>
            <span className='text-gray-400'>Pagado</span>
            <span className='text-gray-400'>
              ${(team.totalRegistrationPaid || 0).toLocaleString()} / $
              {team.inscripcion.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamCard;

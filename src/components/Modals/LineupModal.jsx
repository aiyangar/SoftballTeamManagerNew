import React, { useState, useEffect } from 'react';

const POSITIONS = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH'];

const LineupModal = ({
  show,
  game,
  players,
  attendingPlayerIds,
  onClose,
  onFetchLineup,
  onSave,
  onOpenSubstitution,
  gameFinalizationStatus,
}) => {
  const [lineupRows, setLineupRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && game) {
      loadLineup();
    }
  }, [show, game]);

  useEffect(() => {
    if (!show) {
      setLineupRows([]);
    }
  }, [show]);

  const loadLineup = async () => {
    setLoading(true);
    const data = await onFetchLineup(game.id);
    setLineupRows(
      data.map(entry => ({
        jugador_id: entry.jugadores.id,
        nombre: entry.jugadores.nombre,
        numero: entry.jugadores.numero,
        orden_bateo: entry.orden_bateo,
        posicion_campo: entry.posicion_campo,
        es_titular: entry.es_titular,
        activo: entry.activo,
      }))
    );
    setLoading(false);
  };

  const addRow = () => {
    const nextOrder = lineupRows.filter(r => r.es_titular).length + 1;
    setLineupRows(prev => [
      ...prev,
      {
        jugador_id: '',
        nombre: '',
        numero: '',
        orden_bateo: nextOrder,
        posicion_campo: 'P',
        es_titular: true,
        activo: true,
      },
    ]);
  };

  const removeRow = index => {
    setLineupRows(prev => prev.filter((_, i) => i !== index));
  };

  const updateRow = (index, field, value) => {
    setLineupRows(prev =>
      prev.map((row, i) => {
        if (i !== index) return row;
        if (field === 'jugador_id') {
          const player = players.find(p => String(p.id) === value);
          return {
            ...row,
            jugador_id: value,
            nombre: player?.nombre || '',
            numero: player?.numero || '',
          };
        }
        return { ...row, [field]: value };
      })
    );
  };

  const handleSave = async () => {
    const validRows = lineupRows.filter(
      r => r.jugador_id && r.posicion_campo && r.es_titular
    );
    await onSave(game.id, game.equipo_id, validRows);
  };

  if (!show || !game) return null;

  // Si se proporcionan IDs de asistencia, sólo esos jugadores pueden ser agregados al lineup
  const selectablePlayers =
    attendingPlayerIds != null
      ? players.filter(p => attendingPlayerIds.includes(p.id))
      : players;

  const activeLineup = lineupRows.filter(r => r.activo);
  const usedPlayerIds = new Set(lineupRows.map(r => String(r.jugador_id)));

  return (
    <div className='fixed inset-0 modal-overlay flex items-center justify-center z-50'>
      <div className='bg-neutral-900 border border-gray-600 rounded-lg w-full max-w-3xl mx-4 modal-container'>
        {/* Header */}
        <div className='modal-header p-6 border-b border-gray-600'>
          <div className='flex justify-between items-center'>
            <div>
              <h2 className='text-xl font-semibold text-white'>Lineup</h2>
              <p className='text-sm text-gray-400 mt-1'>
                vs {game.equipo_contrario} —{' '}
                {new Date(game.fecha_partido).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-white text-2xl'
              title='Cerrar lineup'
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='modal-content p-6'>
          {loading ? (
            <div className='text-center text-gray-400 py-8'>
              Cargando lineup...
            </div>
          ) : (
            <>
              {/* Aviso de asistencia sin jugadores */}
              {!gameFinalizationStatus &&
                attendingPlayerIds != null &&
                selectablePlayers.length === 0 && (
                  <div className='mb-4 p-3 bg-yellow-900 border border-yellow-600 rounded text-yellow-200 text-sm'>
                    ⚠️ No hay jugadores con asistencia registrada. Registra la asistencia antes de armar el lineup.
                  </div>
                )}

              {/* Acciones */}
              {!gameFinalizationStatus && (
                <div className='flex gap-3 mb-4'>
                  <button
                    onClick={addRow}
                    className='px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm'
                  >
                    + Agregar jugador
                  </button>
                  {activeLineup.length > 0 && (
                    <button
                      onClick={() => onOpenSubstitution(activeLineup)}
                      className='px-3 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors text-sm'
                    >
                      ⇄ Sustitución
                    </button>
                  )}
                </div>
              )}

              {/* Tabla */}
              {lineupRows.length === 0 ? (
                <div className='text-center text-gray-500 py-8'>
                  No hay lineup registrado para este partido.
                </div>
              ) : (
                <div className='overflow-x-auto'>
                  <table className='w-full text-sm text-left'>
                    <thead>
                      <tr className='text-gray-400 border-b border-gray-700'>
                        <th className='pb-2 pr-3'>Turno</th>
                        <th className='pb-2 pr-3'>Jugador</th>
                        <th className='pb-2 pr-3'>Posición</th>
                        <th className='pb-2 pr-3'>Estado</th>
                        {!gameFinalizationStatus && <th className='pb-2'></th>}
                      </tr>
                    </thead>
                    <tbody>
                      {lineupRows.map((row, i) => (
                        <tr
                          key={i}
                          className={`border-b border-gray-800 ${!row.activo ? 'opacity-40' : ''}`}
                        >
                          {/* Orden de bateo */}
                          <td className='py-2 pr-3'>
                            {gameFinalizationStatus || !row.es_titular ? (
                              <span className='text-white font-mono'>
                                {row.orden_bateo}
                              </span>
                            ) : (
                              <input
                                type='number'
                                min={1}
                                max={20}
                                value={row.orden_bateo}
                                onChange={e =>
                                  updateRow(
                                    i,
                                    'orden_bateo',
                                    parseInt(e.target.value) || 1
                                  )
                                }
                                className='w-14 p-1 bg-gray-800 border border-gray-600 rounded text-white text-center'
                              />
                            )}
                          </td>

                          {/* Jugador */}
                          <td className='py-2 pr-3'>
                            {gameFinalizationStatus || !row.es_titular ? (
                              <span className='text-white'>
                                {row.numero ? `#${row.numero} ` : ''}
                                {row.nombre}
                              </span>
                            ) : (
                              <select
                                value={row.jugador_id}
                                onChange={e =>
                                  updateRow(i, 'jugador_id', e.target.value)
                                }
                                className='p-1 bg-gray-800 border border-gray-600 rounded text-white text-sm min-w-36'
                              >
                                <option value=''>Seleccionar...</option>
                                {players
                                  .filter(p => {
                                    const pid = String(p.id);
                                    // El jugador ya asignado a esta fila siempre aparece
                                    if (pid === String(row.jugador_id)) return true;
                                    // Nuevas incorporaciones: requieren asistencia y no estar en otra fila
                                    const hasAttendance = selectablePlayers.some(
                                      sp => String(sp.id) === pid
                                    );
                                    return hasAttendance && !usedPlayerIds.has(pid);
                                  })
                                  .map(p => (
                                    <option key={p.id} value={p.id}>
                                      {p.numero ? `#${p.numero} ` : ''}
                                      {p.nombre}
                                    </option>
                                  ))}
                              </select>
                            )}
                          </td>

                          {/* Posición */}
                          <td className='py-2 pr-3'>
                            {gameFinalizationStatus || !row.es_titular ? (
                              <span className='text-white font-mono'>
                                {row.posicion_campo}
                              </span>
                            ) : (
                              <select
                                value={row.posicion_campo}
                                onChange={e =>
                                  updateRow(i, 'posicion_campo', e.target.value)
                                }
                                className='p-1 bg-gray-800 border border-gray-600 rounded text-white text-sm'
                              >
                                {POSITIONS.map(pos => (
                                  <option key={pos} value={pos}>
                                    {pos}
                                  </option>
                                ))}
                              </select>
                            )}
                          </td>

                          {/* Estado */}
                          <td className='py-2 pr-3'>
                            {row.es_titular ? (
                              <span className='text-green-400 text-xs'>
                                Titular
                              </span>
                            ) : (
                              <span className='text-yellow-400 text-xs'>
                                Sustituto
                              </span>
                            )}
                            {!row.activo && (
                              <span className='ml-1 text-red-400 text-xs'>
                                (relevado)
                              </span>
                            )}
                          </td>

                          {/* Eliminar (solo titulares en edición) */}
                          {!gameFinalizationStatus && (
                            <td className='py-2'>
                              {row.es_titular && (
                                <button
                                  onClick={() => removeRow(i)}
                                  className='text-red-400 hover:text-red-300 text-xs px-2'
                                  title='Quitar jugador'
                                >
                                  ✕
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className='p-6 border-t border-gray-600 flex justify-end gap-3'>
          <button
            onClick={onClose}
            className='px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors'
          >
            {gameFinalizationStatus ? 'Cerrar' : 'Cancelar'}
          </button>
          {!gameFinalizationStatus && (
            <button
              onClick={handleSave}
              className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors'
            >
              Guardar Lineup
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LineupModal;

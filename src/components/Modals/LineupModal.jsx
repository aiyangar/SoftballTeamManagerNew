import React, { useState, useEffect, useRef, useMemo } from 'react';

const MAX_BATTING_ORDER = 10;

const POSITION_LABELS = {
  BD: 'BD – Bateador Designado',
  CD: 'CD – Corredor Designado',
};

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
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const dragIndexRef = useRef(null);

  useEffect(() => {
    if (show && game) loadLineup();
  }, [show, game]);

  useEffect(() => {
    if (!show) { setLineupRows([]); setEditMode(false); }
  }, [show]);

  const loadLineup = async () => {
    setLoading(true);
    const data = await onFetchLineup(game.id);

    if (data.length > 0) {
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
    } else if (attendingPlayerIds != null && attendingPlayerIds.length > 0) {
      const attending = players
        .filter(p => attendingPlayerIds.includes(p.id))
        .sort((a, b) => (a.numero || 999) - (b.numero || 999));

      setLineupRows(
        attending.map((p, idx) => ({
          jugador_id: p.id,
          nombre: p.nombre,
          numero: p.numero,
          orden_bateo: idx < MAX_BATTING_ORDER ? idx + 1 : null,
          posicion_campo: 'P',
          es_titular: idx < MAX_BATTING_ORDER,
          activo: true,
        }))
      );
    }

    setLoading(false);
  };

  // Recalculate es_titular and orden_bateo after any reorder
  const recalcOrder = rows => {
    let counter = 1;
    return rows.map(row => {
      if (!row.activo) return row;
      if (counter <= MAX_BATTING_ORDER) {
        return { ...row, es_titular: true, orden_bateo: counter++ };
      }
      return { ...row, es_titular: false, orden_bateo: null };
    });
  };

  const addRow = () => {
    const starterCount = lineupRows.filter(r => r.es_titular && r.activo).length;
    const isTitular = starterCount < MAX_BATTING_ORDER;
    setLineupRows(prev => [
      ...prev,
      {
        jugador_id: '',
        nombre: '',
        numero: '',
        orden_bateo: isTitular ? starterCount + 1 : null,
        posicion_campo: 'P',
        es_titular: isTitular,
        activo: true,
      },
    ]);
  };

  const removeRow = index => {
    setLineupRows(prev => recalcOrder(prev.filter((_, i) => i !== index)));
  };

  const updateRow = (index, field, value) => {
    setLineupRows(prev =>
      prev.map((row, i) => {
        if (i !== index) return row;
        if (field === 'jugador_id') {
          const player = players.find(p => String(p.id) === value);
          return { ...row, jugador_id: value, nombre: player?.nombre || '', numero: player?.numero || '' };
        }
        return { ...row, [field]: value };
      })
    );
  };

  // Drag-and-drop — all active rows participate
  const canDrag = row => !gameFinalizationStatus && row.activo;

  const handleDragStart = (e, originalIndex) => {
    dragIndexRef.current = originalIndex;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, renderIndex) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(renderIndex);
  };

  const handleDrop = (e, dropOriginalIndex) => {
    e.preventDefault();
    const dragIndex = dragIndexRef.current;
    if (dragIndex === null || dragIndex === dropOriginalIndex) {
      setDragOverIndex(null);
      return;
    }

    setLineupRows(prev => {
      const rows = [...prev];
      const [moved] = rows.splice(dragIndex, 1);
      const adjustedDrop = dropOriginalIndex > dragIndex ? dropOriginalIndex - 1 : dropOriginalIndex;
      rows.splice(adjustedDrop, 0, moved);
      return recalcOrder(rows);
    });

    dragIndexRef.current = null;
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    dragIndexRef.current = null;
    setDragOverIndex(null);
  };

  const handleSave = async () => {
    const validRows = lineupRows.filter(r => r.jugador_id && r.posicion_campo);
    await onSave(game.id, game.equipo_id, validRows);
  };

  // Build render list: when substitutions exist, show subs inline below their replaced player
  const renderRows = useMemo(() => {
    const hasSubs = lineupRows.some(r => !r.es_titular);

    if (!hasSubs) {
      // Simple case: no substitutions yet — direct map, drag works normally
      return lineupRows.map((r, i) => ({
        ...r,
        originalIndex: i,
        indent: false,
        showBancoSep: false,
      }));
    }

    // With substitutions: interleave subs below the player they replaced
    const indexed = lineupRows.map((r, i) => ({ ...r, originalIndex: i }));
    const starters = indexed
      .filter(r => r.es_titular)
      .sort((a, b) => (a.orden_bateo || 0) - (b.orden_bateo || 0));
    const subs = indexed.filter(r => !r.es_titular);

    const result = [];
    const usedSubIdx = new Set();

    for (const starter of starters) {
      result.push({ ...starter, indent: false, showBancoSep: false });
      if (!starter.activo) {
        // Find substitutes with same batting position
        const linked = subs.filter(s => s.orden_bateo === starter.orden_bateo);
        for (const sub of linked) {
          result.push({ ...sub, indent: true, showBancoSep: false });
          usedSubIdx.add(sub.originalIndex);
        }
      }
    }

    // Unlinked substitutes → banco section
    let firstUnlinked = true;
    for (const sub of subs) {
      if (!usedSubIdx.has(sub.originalIndex)) {
        result.push({ ...sub, indent: false, showBancoSep: firstUnlinked });
        firstUnlinked = false;
      }
    }

    return result;
  }, [lineupRows]);

  if (!show || !game) return null;

  const selectablePlayers =
    attendingPlayerIds != null
      ? players.filter(p => attendingPlayerIds.includes(p.id))
      : players;

  const activeLineup = lineupRows.filter(r => r.activo);
  const usedPlayerIds = new Set(lineupRows.map(r => String(r.jugador_id)));
  const hasSubs = lineupRows.some(r => !r.es_titular);
  const colSpan = gameFinalizationStatus ? 4 : 6;

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
            <button onClick={onClose} className='text-gray-400 hover:text-white text-2xl' title='Cerrar lineup'>
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='modal-content p-6'>
          {loading ? (
            <div className='text-center text-gray-400 py-8'>Cargando lineup...</div>
          ) : (
            <>
              {/* Aviso sin asistencia */}
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
                  {hasSubs && (
                    <button
                      onClick={() => setEditMode(prev => !prev)}
                      className={`px-3 py-2 rounded transition-colors text-sm ${editMode ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                    >
                      {editMode ? '✓ Terminar edición' : '✎ Editar orden'}
                    </button>
                  )}
                </div>
              )}

              {/* Tabla */}
              {renderRows.length === 0 ? (
                <div className='text-center text-gray-500 py-8'>
                  No hay lineup registrado para este partido.
                </div>
              ) : (
                <>
                  {!gameFinalizationStatus && (!hasSubs || editMode) && (
                    <p className='text-xs text-gray-500 mb-2'>
                      Arrastra las filas para cambiar el orden al bat o mover jugadores al banco.
                    </p>
                  )}
                  <div className='overflow-x-auto'>
                    <table className='w-full text-sm text-left'>
                      <thead>
                        <tr className='text-gray-400 border-b border-gray-700'>
                          {!gameFinalizationStatus && <th className='pb-2 pr-2 w-6' />}
                          <th className='pb-2 pr-3'>Turno</th>
                          <th className='pb-2 pr-3'>Jugador</th>
                          <th className='pb-2 pr-3'>Posición</th>
                          <th className='pb-2 pr-3'>Estado</th>
                          {!gameFinalizationStatus && <th className='pb-2' />}
                        </tr>
                      </thead>
                      <tbody>
                        {renderRows.map((row, renderIdx) => (
                          <React.Fragment key={row.originalIndex}>
                            {row.showBancoSep && (
                              <tr>
                                <td colSpan={colSpan} className='py-2 px-0'>
                                  <div className='flex items-center gap-2 text-xs text-gray-500'>
                                    <div className='flex-1 border-t border-gray-700' />
                                    <span>Banco / Sustitutos</span>
                                    <div className='flex-1 border-t border-gray-700' />
                                  </div>
                                </td>
                              </tr>
                            )}
                            <tr
                              draggable={(!hasSubs || editMode) && canDrag(row)}
                              onDragStart={(!hasSubs || editMode) && canDrag(row) ? e => handleDragStart(e, row.originalIndex) : undefined}
                              onDragOver={(!hasSubs || editMode) && canDrag(row) ? e => handleDragOver(e, renderIdx) : undefined}
                              onDrop={(!hasSubs || editMode) && canDrag(row) ? e => handleDrop(e, row.originalIndex) : undefined}
                              onDragEnd={handleDragEnd}
                              className={[
                                'border-b border-gray-800 transition-colors',
                                !row.activo ? 'opacity-50' : '',
                                dragOverIndex === renderIdx ? 'bg-blue-900/40' : '',
                              ].join(' ')}
                            >
                              {/* Handle arrastre */}
                              {!gameFinalizationStatus && (
                                <td className='py-2 pr-2'>
                                  {(!hasSubs || editMode) && canDrag(row) && (
                                    <span
                                      className='text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing select-none text-base'
                                      title='Arrastrar para reordenar'
                                    >
                                      ⠿
                                    </span>
                                  )}
                                </td>
                              )}

                              {/* Turno */}
                              <td className={`py-2 pr-3 ${row.indent ? 'pl-6' : ''}`}>
                                <span className='text-white font-mono'>
                                  {row.orden_bateo ?? '—'}
                                </span>
                              </td>

                              {/* Jugador */}
                              <td className={`py-2 pr-3 ${row.indent ? 'pl-4' : ''}`}>
                                {row.indent && (
                                  <span className='text-gray-500 mr-1'>↳</span>
                                )}
                                {row.jugador_id ? (
                                  <span className={`${!row.activo ? 'line-through text-gray-500' : 'text-white'}`}>
                                    {row.numero ? `#${row.numero} ` : ''}
                                    {row.nombre}
                                  </span>
                                ) : (
                                  <select
                                    value={row.jugador_id}
                                    onChange={e => updateRow(row.originalIndex, 'jugador_id', e.target.value)}
                                    className='p-1 bg-gray-800 border border-gray-600 rounded text-white text-sm min-w-36'
                                  >
                                    <option value=''>Seleccionar...</option>
                                    {players
                                      .filter(p => {
                                        const pid = String(p.id);
                                        const hasAttendance = selectablePlayers.some(sp => String(sp.id) === pid);
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
                                {gameFinalizationStatus ? (
                                  <span className='text-white font-mono'>
                                    {POSITION_LABELS[row.posicion_campo] ?? row.posicion_campo}
                                  </span>
                                ) : (
                                  <select
                                    value={row.posicion_campo}
                                    onChange={e => updateRow(row.originalIndex, 'posicion_campo', e.target.value)}
                                    className='p-1 bg-gray-800 border border-gray-600 rounded text-white text-sm'
                                  >
                                    <optgroup label='Campo'>
                                      {['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CLF', 'CRF', 'RF'].map(pos => (
                                        <option key={pos} value={pos}>{pos}</option>
                                      ))}
                                    </optgroup>
                                    <optgroup label='Designados'>
                                      <option value='DH'>DH</option>
                                      <option value='BD'>BD – Bateador Designado</option>
                                      <option value='CD'>CD – Corredor Designado</option>
                                    </optgroup>
                                  </select>
                                )}
                              </td>

                              {/* Estado */}
                              <td className='py-2 pr-3'>
                                {row.es_titular ? (
                                  <span className='text-green-400 text-xs'>Titular</span>
                                ) : (
                                  <span className='text-yellow-400 text-xs'>Sustituto</span>
                                )}
                                {!row.activo && (
                                  <span className='ml-1 text-red-400 text-xs'>(relevado)</span>
                                )}
                              </td>

                              {/* Eliminar */}
                              {!gameFinalizationStatus && (
                                <td className='py-2'>
                                  <button
                                    onClick={() => removeRow(row.originalIndex)}
                                    className='text-red-400 hover:text-red-300 text-xs px-2'
                                    title='Quitar jugador'
                                  >
                                    ✕
                                  </button>
                                </td>
                              )}
                            </tr>
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
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

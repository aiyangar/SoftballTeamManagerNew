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
  refreshKey = 0,
}) => {
  const [lineupRows, setLineupRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [lineupFromDB, setLineupFromDB] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [subMsg, setSubMsg] = useState(null);
  const dragIndexRef = useRef(null);
  const prevRefreshKey = useRef(refreshKey);

  useEffect(() => {
    if (show && game) loadLineup();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, game]);

  useEffect(() => {
    if (!show) {
      setLineupRows([]);
      setEditMode(false);
      setSubMsg(null);
      setSaveError(null);
      setLineupFromDB(false);
    }
  }, [show]);

  // Recargar lineup cuando se registre una sustitución
  useEffect(() => {
    if (refreshKey !== prevRefreshKey.current) {
      prevRefreshKey.current = refreshKey;
      if (show && game) {
        loadLineup();
        setSubMsg('✅ Sustitución registrada');
        setTimeout(() => setSubMsg(null), 4000);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const loadLineup = async () => {
    setLoading(true);
    const data = await onFetchLineup(game.id);

    if (data.length > 0) {
      setLineupFromDB(true);
      setLineupRows(
        data.map(entry => ({
          jugador_id: entry.jugadores.id,
          nombre: entry.jugadores.nombre,
          numero: entry.jugadores.numero,
          orden_bateo: entry.orden_bateo,
          posicion_campo: entry.posicion_campo,
          es_titular: entry.es_titular,
          activo: entry.activo,
          batea_por_id: entry.batea_por_id || null,
          batea_por_nombre: entry.batea_por_id
            ? (players.find(p => p.id === entry.batea_por_id)?.nombre || '')
            : '',
        }))
      );
    } else if (attendingPlayerIds != null && attendingPlayerIds.length > 0) {
      setLineupFromDB(false);
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
          batea_por_id: null,
          batea_por_nombre: '',
        }))
      );
    }

    setLoading(false);
  };

  // Recalculate es_titular and orden_bateo after any reorder.
  // BD players with a batea_por target keep their inherited orden_bateo.
  const recalcOrder = rows => {
    let counter = 1;
    return rows.map(row => {
      if (!row.activo) return row;
      if (row.posicion_campo === 'BD' && row.batea_por_id) return row;
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
        batea_por_id: null,
        batea_por_nombre: '',
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
        if (field === 'posicion_campo' && row.posicion_campo === 'BD' && value !== 'BD') {
          // Changing away from BD: clear the batea_por association
          return { ...row, posicion_campo: value, batea_por_id: null, batea_por_nombre: '' };
        }
        if (field === 'batea_por_id') {
          if (!value) {
            return { ...row, batea_por_id: null, batea_por_nombre: '', es_titular: true };
          }
          const target = prev.find(r => String(r.jugador_id) === value);
          return {
            ...row,
            batea_por_id: value,
            batea_por_nombre: target?.nombre || '',
            orden_bateo: target?.orden_bateo ?? null,
            es_titular: false,
          };
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
    if (validRows.length === 0) {
      setSaveError('El lineup no puede estar vacío. Agrega al menos un jugador.');
      return;
    }
    setSaveError(null);
    setSaving(true);
    await onSave(game.id, game.equipo_id, validRows);
    setSaving(false);
    setLineupFromDB(true);
  };

  // Build render list: starters in order, then banco separator, then bench.
  // In-game subs appear indented below the player they replaced (activo=false).
  // BD players with batea_por_id appear in the bench section (available for sub).
  const renderRows = useMemo(() => {
    const isBDWithTarget = r => r.posicion_campo === 'BD' && r.batea_por_id;
    const hasInGameSubs = lineupRows.some(
      r => !r.es_titular && r.orden_bateo != null && !isBDWithTarget(r)
    );

    const indexed = lineupRows.map((r, i) => ({ ...r, originalIndex: i }));
    const starters = indexed
      .filter(r => r.es_titular)
      .sort((a, b) => (a.orden_bateo || 0) - (b.orden_bateo || 0));
    // Only active players with no batting order (excludes already-entered bench players)
    const bench = indexed.filter(
      r => !r.es_titular && r.orden_bateo == null && !isBDWithTarget(r) && r.activo
    );
    const inGameSubs = indexed.filter(
      r => !r.es_titular && r.orden_bateo != null && !isBDWithTarget(r)
    );
    // BD players always appear in bench section (available for substitution)
    const bdPlayers = indexed.filter(r => isBDWithTarget(r));

    const result = [];
    const usedIdx = new Set();

    for (const starter of starters) {
      result.push({ ...starter, indent: false, showBancoSep: false });

      // BD players batting for this starter → appear right below them, indented
      const linkedBD = bdPlayers.filter(
        r => String(r.batea_por_id) === String(starter.jugador_id)
      );
      for (const bd of linkedBD) {
        result.push({ ...bd, indent: true, showBancoSep: false, isBD: true });
      }

      // In-game subs under an inactive starter
      if (hasInGameSubs && !starter.activo) {
        const linked = inGameSubs.filter(s => s.orden_bateo === starter.orden_bateo);
        for (const sub of linked) {
          result.push({ ...sub, indent: true, showBancoSep: false });
          usedIdx.add(sub.originalIndex);
        }
      }
    }

    // Remaining in-game subs without a matched starter (edge case)
    for (const sub of inGameSubs) {
      if (!usedIdx.has(sub.originalIndex)) bench.push(sub);
    }

    // Banco section: only regular bench (BD players are now inline)
    let firstBench = true;
    for (const row of bench) {
      result.push({ ...row, indent: false, showBancoSep: firstBench });
      firstBench = false;
    }

    return result;
  }, [lineupRows]);

  if (!show || !game) return null;

  const selectablePlayers =
    attendingPlayerIds != null
      ? players.filter(p => attendingPlayerIds.includes(p.id))
      : players;

  const activeLineup = lineupRows.filter(r => r.activo && r.es_titular);
  const usedPlayerIds = new Set(lineupRows.map(r => String(r.jugador_id)));
  const hasSubs = lineupRows.some(r => !r.es_titular);

  // Detect duplicate field positions among active players (excludes DH/BD/CD)
  const FIELD_POSITIONS = new Set(['P','C','1B','2B','3B','SS','LF','CLF','CRF','RF']);
  const posCount = {};
  for (const r of lineupRows) {
    if (r.activo && r.jugador_id && FIELD_POSITIONS.has(r.posicion_campo)) {
      posCount[r.posicion_campo] = (posCount[r.posicion_campo] || []);
      posCount[r.posicion_campo].push(r.nombre || r.jugador_id);
    }
  }
  const duplicatePositions = Object.entries(posCount).filter(([, names]) => names.length > 1);
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
            <div className='flex flex-col items-center justify-center py-10 gap-3'>
              <svg
                className='animate-spin h-8 w-8 text-blue-400'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8v8z'
                />
              </svg>
              <span className='text-gray-400 text-sm'>Cargando lineup...</span>
            </div>
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

              {/* Mensaje de sustitución */}
              {subMsg && (
                <div className='mb-4 p-3 bg-green-900 border border-green-600 rounded text-green-200 text-sm'>
                  {subMsg}
                </div>
              )}

              {/* Error al guardar */}
              {saveError && (
                <div className='mb-4 p-3 bg-red-900 border border-red-600 rounded text-red-200 text-sm'>
                  ⛔ {saveError}
                </div>
              )}

              {/* Aviso posiciones duplicadas */}
              {duplicatePositions.length > 0 && (
                <div className='mb-4 p-3 bg-orange-900 border border-orange-600 rounded text-orange-200 text-sm'>
                  ⚠️ Posición duplicada en el campo:{' '}
                  {duplicatePositions.map(([pos, names]) => (
                    <span key={pos} className='font-semibold'>
                      {pos} ({names.join(', ')})
                    </span>
                  )).reduce((a, b) => [a, ', ', b])}
                  . Mueve uno de ellos a otra posición.
                </div>
              )}

              {/* Acciones */}
              {!gameFinalizationStatus && (
                <div className='flex gap-3 mb-4'>
                  <button
                    onClick={addRow}
                    className='btn-sm btn-primary'
                  >
                    + Agregar jugador
                  </button>
                  {activeLineup.length > 0 && (
                    <button
                      onClick={() => {
                        if (!lineupFromDB) {
                          setSaveError('Guarda el lineup antes de registrar una sustitución.');
                          return;
                        }
                        setSaveError(null);
                        onOpenSubstitution(activeLineup);
                      }}
                      className='btn-sm bg-yellow-600 text-white hover:bg-yellow-700'
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
                        {/* Encabezado sección Titulares */}
                        <tr className='bg-green-900/20'>
                          <td colSpan={colSpan} className='px-1 py-1'>
                            <span className='text-xs font-semibold text-green-400 uppercase tracking-wide'>
                              Titulares
                            </span>
                          </td>
                        </tr>
                      </thead>
                      <tbody>
                        {renderRows.map((row, renderIdx) => (
                          <React.Fragment key={row.originalIndex}>
                            {row.showBancoSep && (
                              <tr className='bg-gray-800/60'>
                                <td colSpan={colSpan} className='px-1 py-1'>
                                  <span className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>
                                    Banca
                                  </span>
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
                                dragOverIndex === renderIdx
                                  ? 'bg-blue-900/40'
                                  : row.isBD
                                    ? 'bg-purple-900/20'
                                    : '',
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

                              {/* Estado / Batea por */}
                              <td className='py-2 pr-3'>
                                {row.posicion_campo === 'BD' && !gameFinalizationStatus ? (
                                  <select
                                    value={row.batea_por_id || ''}
                                    onChange={e => updateRow(row.originalIndex, 'batea_por_id', e.target.value)}
                                    className='p-1 bg-purple-900 border border-purple-600 rounded text-purple-200 text-xs min-w-28'
                                  >
                                    <option value=''>Batea por...</option>
                                    {lineupRows
                                      .filter(r =>
                                        r.jugador_id &&
                                        r.es_titular &&
                                        String(r.jugador_id) !== String(row.jugador_id)
                                      )
                                      .map(r => (
                                        <option key={r.jugador_id} value={r.jugador_id}>
                                          {r.numero ? `#${r.numero} ` : ''}{r.nombre}
                                        </option>
                                      ))}
                                  </select>
                                ) : row.posicion_campo === 'BD' && row.batea_por_id ? (
                                  <span className='text-purple-400 text-xs'>
                                    por: {row.batea_por_nombre || `#${row.batea_por_id}`}
                                  </span>
                                ) : (
                                  <>
                                    {row.es_titular ? (
                                      <span className='text-green-400 text-xs'>Titular</span>
                                    ) : (
                                      <span className='text-yellow-400 text-xs'>Sustituto</span>
                                    )}
                                    {!row.activo && (
                                      <span className='ml-1 text-red-400 text-xs'>(relevado)</span>
                                    )}
                                  </>
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
            className='btn btn-secondary'
          >
            {gameFinalizationStatus ? 'Cerrar' : 'Cancelar'}
          </button>
          {!gameFinalizationStatus && (
            <button
              onClick={handleSave}
              disabled={saving}
              className='btn bg-green-600 text-white hover:bg-green-700'
            >
              {saving && (
                <svg
                  className='animate-spin h-4 w-4 text-white'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                  <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8z' />
                </svg>
              )}
              {saving ? 'Guardando...' : 'Guardar Lineup'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LineupModal;

import React, { useState, useEffect } from 'react';

const FIELD_POSITIONS = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CLF', 'CRF', 'RF'];
const DESIGNATED_POSITIONS = ['DH', 'BD', 'CD'];

const SubstitutionModal = ({
  show,
  game,
  players,
  attendingPlayerIds,
  activeLineup,
  onClose,
  onSave,
}) => {
  const [form, setForm] = useState({
    jugador_sale_id: '',
    jugador_entra_id: '',
    inning: 1,
    posicion_campo: '',
    notas: '',
  });

  useEffect(() => {
    if (!show) {
      setForm({
        jugador_sale_id: '',
        jugador_entra_id: '',
        inning: 1,
        posicion_campo: '',
        notas: '',
      });
    }
  }, [show]);

  if (!show || !game) return null;

  const activeIds = new Set(activeLineup.map(r => String(r.jugador_id)));
  const availableToEnter = players.filter(p => {
    if (activeIds.has(String(p.id))) return false;
    if (attendingPlayerIds != null && !attendingPlayerIds.includes(p.id)) return false;
    return true;
  });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.jugador_sale_id || !form.jugador_entra_id || !form.posicion_campo) return;

    const saleEntry = activeLineup.find(
      r => String(r.jugador_id) === String(form.jugador_sale_id)
    );

    await onSave(game.id, game.equipo_id, {
      ...form,
      orden_bateo: saleEntry?.orden_bateo || 1,
    });
    onClose();
  };

  return (
    <div className='fixed inset-0 modal-overlay flex items-center justify-center z-60'>
      <div className='bg-neutral-900 border border-gray-600 rounded-lg w-full max-w-md mx-4 modal-container'>
        {/* Header */}
        <div className='modal-header p-6 border-b border-gray-600'>
          <div className='flex justify-between items-center'>
            <div>
              <h2 className='text-xl font-semibold text-white'>
                Registrar Sustitución
              </h2>
              <p className='text-sm text-gray-400 mt-1'>
                vs {game.equipo_contrario}
              </p>
            </div>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-white text-2xl'
              title='Cerrar'
            >
              ×
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className='modal-content p-6 space-y-4'>
            {/* Jugador que sale */}
            <div>
              <label className='block text-gray-300 text-sm mb-1'>
                Jugador que sale
              </label>
              <select
                value={form.jugador_sale_id}
                onChange={e => {
                  const saleId = e.target.value;
                  const saleEntry = activeLineup.find(
                    r => String(r.jugador_id) === saleId
                  );
                  setForm(prev => ({
                    ...prev,
                    jugador_sale_id: saleId,
                    posicion_campo: saleEntry?.posicion_campo || prev.posicion_campo,
                  }));
                }}
                className='w-full p-2 bg-gray-800 border border-gray-600 rounded text-white'
                required
              >
                <option value=''>Seleccionar jugador...</option>
                {activeLineup.map(entry => (
                  <option key={entry.jugador_id} value={entry.jugador_id}>
                    Bat #{entry.orden_bateo} —{' '}
                    {entry.numero ? `#${entry.numero} ` : ''}
                    {entry.nombre} ({entry.posicion_campo})
                  </option>
                ))}
              </select>
            </div>

            {/* Jugador que entra */}
            <div>
              <label className='block text-gray-300 text-sm mb-1'>
                Jugador que entra
              </label>
              {availableToEnter.length === 0 ? (
                <p className='text-gray-500 text-sm italic'>
                  No hay jugadores disponibles fuera del lineup.
                </p>
              ) : (
                <select
                  value={form.jugador_entra_id}
                  onChange={e =>
                    setForm(prev => ({
                      ...prev,
                      jugador_entra_id: e.target.value,
                    }))
                  }
                  className='w-full p-2 bg-gray-800 border border-gray-600 rounded text-white'
                  required
                >
                  <option value=''>Seleccionar jugador...</option>
                  {availableToEnter.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.numero ? `#${p.numero} ` : ''}
                      {p.nombre}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Inning + Posición */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-gray-300 text-sm mb-1'>
                  Inning
                </label>
                <input
                  type='number'
                  min={1}
                  max={15}
                  value={form.inning}
                  onChange={e =>
                    setForm(prev => ({
                      ...prev,
                      inning: parseInt(e.target.value) || 1,
                    }))
                  }
                  className='w-full p-2 bg-gray-800 border border-gray-600 rounded text-white text-center'
                  required
                />
              </div>
              <div>
                <label className='block text-gray-300 text-sm mb-1'>
                  Posición
                </label>
                <select
                  value={form.posicion_campo}
                  onChange={e =>
                    setForm(prev => ({
                      ...prev,
                      posicion_campo: e.target.value,
                    }))
                  }
                  className='w-full p-2 bg-gray-800 border border-gray-600 rounded text-white'
                  required
                >
                  <option value=''>Seleccionar...</option>
                  <optgroup label='Campo'>
                    {FIELD_POSITIONS.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </optgroup>
                  <optgroup label='Designados'>
                    {DESIGNATED_POSITIONS.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className='block text-gray-300 text-sm mb-1'>
                Notas (opcional)
              </label>
              <input
                type='text'
                value={form.notas}
                onChange={e =>
                  setForm(prev => ({ ...prev, notas: e.target.value }))
                }
                placeholder='Ej: lesión, táctica...'
                className='w-full p-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-600'
              />
            </div>
          </div>

          {/* Footer */}
          <div className='p-6 border-t border-gray-600 flex justify-end gap-3'>
            <button
              type='button'
              onClick={onClose}
              className='btn btn-secondary'
            >
              Cancelar
            </button>
            <button
              type='submit'
              disabled={availableToEnter.length === 0}
              className='btn bg-yellow-600 text-white hover:bg-yellow-700'
            >
              Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubstitutionModal;

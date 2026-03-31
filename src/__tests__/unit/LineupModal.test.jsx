import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LineupModal from '../../components/Modals/LineupModal';
import {
  mockPlayers,
  mockGame,
  mockFinalizedGame,
  mockLineupFromDB,
} from '../../test/fixtures';

// ─── helpers ───────────────────────────────────────────────────────────────

const buildProps = overrides => ({
  show: true,
  game: mockGame,
  players: mockPlayers,
  // Por defecto todos los jugadores tienen asistencia
  attendingPlayerIds: mockPlayers.map(p => p.id),
  onClose: vi.fn(),
  onFetchLineup: vi.fn().mockResolvedValue(mockLineupFromDB),
  onSave: vi.fn().mockResolvedValue(undefined),
  onOpenSubstitution: vi.fn(),
  gameFinalizationStatus: false,
  ...overrides,
});

// ─── suite ─────────────────────────────────────────────────────────────────

describe('LineupModal — renderizado', () => {
  it('no monta nada cuando show=false', () => {
    const { container } = render(<LineupModal {...buildProps({ show: false })} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('no monta nada cuando game es null', () => {
    const { container } = render(<LineupModal {...buildProps({ game: null })} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('muestra título con nombre del rival y fecha', async () => {
    render(<LineupModal {...buildProps()} />);
    expect(await screen.findByText(/Tigres/)).toBeInTheDocument();
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it('muestra estado de carga inicial mientras fetch no resuelve', () => {
    // fetch nunca resuelve durante este test
    const never = new Promise(() => {});
    render(<LineupModal {...buildProps({ onFetchLineup: vi.fn().mockReturnValue(never) })} />);
    expect(screen.getByText(/Cargando lineup/i)).toBeInTheDocument();
  });
});

describe('LineupModal — carga de datos', () => {
  it('llama a onFetchLineup con el id del partido', async () => {
    const onFetchLineup = vi.fn().mockResolvedValue(mockLineupFromDB);
    render(<LineupModal {...buildProps({ onFetchLineup })} />);
    await waitFor(() => expect(onFetchLineup).toHaveBeenCalledWith(42));
  });

  it('vuelve a cargar al recibir un juego distinto', async () => {
    const onFetchLineup = vi.fn().mockResolvedValue(mockLineupFromDB);
    const { rerender } = render(<LineupModal {...buildProps({ onFetchLineup })} />);
    await waitFor(() => expect(onFetchLineup).toHaveBeenCalledTimes(1));

    const otherGame = { ...mockGame, id: 99 };
    rerender(<LineupModal {...buildProps({ onFetchLineup, game: otherGame })} />);
    await waitFor(() => expect(onFetchLineup).toHaveBeenCalledWith(99));
  });

  it('muestra los jugadores del lineup cargado', async () => {
    render(<LineupModal {...buildProps()} />);
    expect(await screen.findByText(/Juan García/)).toBeInTheDocument();
    expect(await screen.findByText(/Pedro López/)).toBeInTheDocument();
    expect(await screen.findByText(/Carlos Ruiz/)).toBeInTheDocument();
  });

  it('muestra el número de camiseta de cada jugador', async () => {
    render(<LineupModal {...buildProps()} />);
    expect(await screen.findByText(/#5/)).toBeInTheDocument();
    expect(await screen.findByText(/#10/)).toBeInTheDocument();
  });

  it('muestra "No hay lineup" cuando el fetch devuelve vacío', async () => {
    render(<LineupModal {...buildProps({ onFetchLineup: vi.fn().mockResolvedValue([]) })} />);
    expect(
      await screen.findByText(/No hay lineup registrado/i)
    ).toBeInTheDocument();
  });

  it('limpia el lineup cuando show pasa a false', async () => {
    const { rerender } = render(<LineupModal {...buildProps()} />);
    expect(await screen.findByText(/Juan García/)).toBeInTheDocument();

    rerender(<LineupModal {...buildProps({ show: false })} />);
    // el modal desaparece completamente
    expect(screen.queryByText(/Juan García/)).not.toBeInTheDocument();
  });
});

describe('LineupModal — modo edición (partido no finalizado)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('muestra el botón "Agregar jugador"', async () => {
    render(<LineupModal {...buildProps()} />);
    expect(await screen.findByRole('button', { name: /Agregar jugador/i })).toBeInTheDocument();
  });

  it('agregar jugador añade una fila con selects de edición', async () => {
    const user = userEvent.setup();
    render(<LineupModal {...buildProps()} />);
    await screen.findByText(/Juan García/);

    const addBtn = screen.getByRole('button', { name: /Agregar jugador/i });
    await user.click(addBtn);

    // Debe aparecer al menos un select de jugador (las filas nuevas son select, no span)
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThan(0);
  });

  it('el select de jugador excluye jugadores ya seleccionados', async () => {
    const user = userEvent.setup();
    render(<LineupModal {...buildProps()} />);
    await screen.findByText(/Juan García/);

    await user.click(screen.getByRole('button', { name: /Agregar jugador/i }));

    // Cada fila tiene [player_select, pos_select].
    // Con 3 filas cargadas + 1 nueva = 4 filas → 8 comboboxes.
    // El player select de la nueva fila es el antepenúltimo (length - 2).
    const selects = screen.getAllByRole('combobox');
    const newRowPlayerSelect = selects[selects.length - 2];
    const optionValues = Array.from(newRowPlayerSelect.options).map(o => o.value);

    // Juan García (1), Pedro López (2), Carlos Ruiz (3) ya están en lineup
    expect(optionValues).not.toContain('1');
    expect(optionValues).not.toContain('2');
    expect(optionValues).not.toContain('3');
    // Miguel Soto (4) está libre
    expect(optionValues).toContain('4');
  });

  it('eliminar fila quita la fila del lineup', async () => {
    const user = userEvent.setup();
    // Empezar con un solo jugador para simplificar
    const singleEntry = [mockLineupFromDB[0]];
    render(<LineupModal {...buildProps({ onFetchLineup: vi.fn().mockResolvedValue(singleEntry) })} />);
    await screen.findByText(/Juan García/);

    const removeBtn = screen.getByTitle(/Quitar jugador/i);
    await user.click(removeBtn);

    expect(screen.queryByText(/Juan García/)).not.toBeInTheDocument();
  });

  it('el botón "Sustitución" aparece cuando hay jugadores activos', async () => {
    render(<LineupModal {...buildProps()} />);
    expect(await screen.findByRole('button', { name: /Sustitución/i })).toBeInTheDocument();
  });

  it('"Sustitución" llama a onOpenSubstitution con el lineup activo', async () => {
    const user = userEvent.setup();
    const onOpenSubstitution = vi.fn();
    render(<LineupModal {...buildProps({ onOpenSubstitution })} />);
    await screen.findByText(/Juan García/);

    await user.click(screen.getByRole('button', { name: /Sustitución/i }));

    expect(onOpenSubstitution).toHaveBeenCalledOnce();
    const passedLineup = onOpenSubstitution.mock.calls[0][0];
    // Debe recibir sólo los activos
    expect(passedLineup.every(r => r.activo)).toBe(true);
    expect(passedLineup.length).toBeGreaterThan(0);
  });

  it('"Guardar Lineup" llama a onSave con filas válidas (jugador + posición)', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<LineupModal {...buildProps({ onSave })} />);
    await screen.findByText(/Juan García/);

    await user.click(screen.getByRole('button', { name: /Guardar Lineup/i }));

    expect(onSave).toHaveBeenCalledWith(
      mockGame.id,
      mockGame.equipo_id,
      expect.arrayContaining([
        expect.objectContaining({ jugador_id: 1, posicion_campo: 'SS', es_titular: true }),
        expect.objectContaining({ jugador_id: 2, posicion_campo: 'P', es_titular: true }),
      ])
    );
  });

  it('"Cerrar" llama a onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<LineupModal {...buildProps({ onClose })} />);
    await screen.findByText(/Juan García/);

    await user.click(screen.getByTitle(/Cerrar lineup/i));
    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe('LineupModal — modo lectura (partido finalizado)', () => {
  const finalizedProps = () =>
    buildProps({
      game: mockFinalizedGame,
      gameFinalizationStatus: true,
    });

  it('no muestra botón "Agregar jugador"', async () => {
    render(<LineupModal {...finalizedProps()} />);
    await screen.findByText(/Juan García/);
    expect(screen.queryByRole('button', { name: /Agregar jugador/i })).not.toBeInTheDocument();
  });

  it('no muestra botón "Sustitución"', async () => {
    render(<LineupModal {...finalizedProps()} />);
    await screen.findByText(/Juan García/);
    expect(screen.queryByRole('button', { name: /Sustitución/i })).not.toBeInTheDocument();
  });

  it('no muestra botón "Guardar Lineup"', async () => {
    render(<LineupModal {...finalizedProps()} />);
    await screen.findByText(/Juan García/);
    expect(screen.queryByRole('button', { name: /Guardar Lineup/i })).not.toBeInTheDocument();
  });

  it('muestra el orden de bateo como texto (no input)', async () => {
    render(<LineupModal {...finalizedProps()} />);
    await screen.findByText('1'); // orden_bateo como <span>
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });

  it('muestra botón "Cerrar" (no "Cancelar")', async () => {
    render(<LineupModal {...finalizedProps()} />);
    await screen.findByText(/Juan García/);
    expect(screen.getByRole('button', { name: /^Cerrar$/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Cancelar$/i })).not.toBeInTheDocument();
  });
});

describe('LineupModal — filtro de asistencia (attendingPlayerIds)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sólo muestra en el select a los jugadores con asistencia', async () => {
    const user = userEvent.setup();
    // Solo jugadores 1 y 2 tienen asistencia; 3 y 4 no
    render(
      <LineupModal
        {...buildProps({
          onFetchLineup: vi.fn().mockResolvedValue([]),
          attendingPlayerIds: [1, 2],
        })}
      />
    );
    await screen.findByText(/No hay lineup registrado/i);

    await user.click(screen.getByRole('button', { name: /Agregar jugador/i }));

    const options = Array.from(screen.getAllByRole('combobox')[0].options).map(o => o.value);
    expect(options).toContain('1'); // Juan García ✓
    expect(options).toContain('2'); // Pedro López ✓
    expect(options).not.toContain('3'); // Carlos Ruiz — sin asistencia
    expect(options).not.toContain('4'); // Miguel Soto — sin asistencia
  });

  it('muestra advertencia cuando attendingPlayerIds está vacío', async () => {
    render(
      <LineupModal
        {...buildProps({
          onFetchLineup: vi.fn().mockResolvedValue([]),
          attendingPlayerIds: [],
        })}
      />
    );
    expect(
      await screen.findByText(/No hay jugadores con asistencia registrada/i)
    ).toBeInTheDocument();
  });

  it('no muestra advertencia cuando hay jugadores con asistencia', async () => {
    render(
      <LineupModal
        {...buildProps({
          onFetchLineup: vi.fn().mockResolvedValue([]),
          attendingPlayerIds: [1, 2],
        })}
      />
    );
    await screen.findByText(/No hay lineup registrado/i);
    expect(
      screen.queryByText(/No hay jugadores con asistencia registrada/i)
    ).not.toBeInTheDocument();
  });

  it('sin prop attendingPlayerIds muestra todos los jugadores (sin filtro)', async () => {
    const user = userEvent.setup();
    render(
      <LineupModal
        {...buildProps({
          onFetchLineup: vi.fn().mockResolvedValue([]),
          attendingPlayerIds: undefined,
        })}
      />
    );
    await screen.findByText(/No hay lineup registrado/i);

    await user.click(screen.getByRole('button', { name: /Agregar jugador/i }));

    const options = Array.from(screen.getAllByRole('combobox')[0].options).map(o => o.value);
    expect(options).toContain('1');
    expect(options).toContain('2');
    expect(options).toContain('3');
    expect(options).toContain('4');
  });

  it('un jugador en el lineup pero sin asistencia sigue visible en la tabla (read-only)', async () => {
    // Carlos Ruiz (id=3) está en el lineup cargado pero no tiene asistencia
    render(
      <LineupModal
        {...buildProps({
          attendingPlayerIds: [1, 2], // solo 1 y 2 tienen asistencia
        })}
      />
    );
    // Carlos Ruiz debe aparecer en la tabla (fue guardado antes)
    expect(await screen.findByText(/Carlos Ruiz/)).toBeInTheDocument();
  });
});

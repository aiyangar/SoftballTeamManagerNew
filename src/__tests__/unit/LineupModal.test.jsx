import { render, screen, waitFor } from '@testing-library/react';
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

// Devuelve el select del jugador en la fila vacía añadida por "+ Agregar jugador".
// Los selects de posición no tienen opción con value=''; el de jugador sí ("Seleccionar...").
const findPlayerSelect = () =>
  screen.getAllByRole('combobox').find(s =>
    Array.from(s.options).some(o => o.value === '')
  );

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

  it('muestra spinner de carga mientras fetch no resuelve', () => {
    const never = new Promise(() => {});
    render(<LineupModal {...buildProps({ onFetchLineup: vi.fn().mockReturnValue(never) })} />);
    // El SVG del spinner está presente
    const svg = document.querySelector('svg.animate-spin');
    expect(svg).toBeInTheDocument();
    // El texto también
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

  it('muestra "No hay lineup" cuando DB vacía y sin asistencia registrada', async () => {
    // attendingPlayerIds vacío: no hay auto-fill → lineup queda vacío
    render(
      <LineupModal
        {...buildProps({
          onFetchLineup: vi.fn().mockResolvedValue([]),
          attendingPlayerIds: [],
        })}
      />
    );
    expect(
      await screen.findByText(/No hay lineup registrado/i)
    ).toBeInTheDocument();
  });

  it('limpia el lineup cuando show pasa a false', async () => {
    const { rerender } = render(<LineupModal {...buildProps()} />);
    expect(await screen.findByText(/Juan García/)).toBeInTheDocument();

    rerender(<LineupModal {...buildProps({ show: false })} />);
    expect(screen.queryByText(/Juan García/)).not.toBeInTheDocument();
  });
});

describe('LineupModal — modo edición (partido no finalizado)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('muestra el botón "Agregar jugador"', async () => {
    render(<LineupModal {...buildProps()} />);
    expect(await screen.findByRole('button', { name: /Agregar jugador/i })).toBeInTheDocument();
  });

  it('agregar jugador añade una fila con select de jugador', async () => {
    const user = userEvent.setup();
    render(<LineupModal {...buildProps()} />);
    await screen.findByText(/Juan García/);

    await user.click(screen.getByRole('button', { name: /Agregar jugador/i }));

    expect(findPlayerSelect()).toBeInTheDocument();
  });

  it('el select de jugador excluye jugadores ya seleccionados', async () => {
    const user = userEvent.setup();
    render(<LineupModal {...buildProps()} />);
    await screen.findByText(/Juan García/);

    await user.click(screen.getByRole('button', { name: /Agregar jugador/i }));

    const playerSelect = findPlayerSelect();
    const optionValues = Array.from(playerSelect.options).map(o => o.value);

    // Juan García (1), Pedro López (2), Carlos Ruiz (3) ya están en lineup
    expect(optionValues).not.toContain('1');
    expect(optionValues).not.toContain('2');
    expect(optionValues).not.toContain('3');
    // Miguel Soto (4) está libre
    expect(optionValues).toContain('4');
  });

  it('eliminar fila quita la fila del lineup', async () => {
    const user = userEvent.setup();
    const singleEntry = [mockLineupFromDB[0]];
    render(<LineupModal {...buildProps({ onFetchLineup: vi.fn().mockResolvedValue(singleEntry) })} />);
    await screen.findByText(/Juan García/);

    const removeBtn = screen.getByTitle(/Quitar jugador/i);
    await user.click(removeBtn);

    expect(screen.queryByText(/Juan García/)).not.toBeInTheDocument();
  });

  it('el botón "Sustitución" aparece cuando hay jugadores activos (lineup de BD)', async () => {
    render(<LineupModal {...buildProps()} />);
    expect(await screen.findByRole('button', { name: /Sustitución/i })).toBeInTheDocument();
  });

  it('"Sustitución" llama a onOpenSubstitution con el lineup activo cuando viene de BD', async () => {
    const user = userEvent.setup();
    const onOpenSubstitution = vi.fn();
    render(<LineupModal {...buildProps({ onOpenSubstitution })} />);
    await screen.findByText(/Juan García/);

    await user.click(screen.getByRole('button', { name: /Sustitución/i }));

    expect(onOpenSubstitution).toHaveBeenCalledOnce();
    const passedLineup = onOpenSubstitution.mock.calls[0][0];
    expect(passedLineup.every(r => r.activo)).toBe(true);
    expect(passedLineup.length).toBeGreaterThan(0);
  });

  it('"Guardar Lineup" llama a onSave con filas válidas', async () => {
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
    await screen.findByText('1');
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

  it('sólo muestra en el select a los jugadores con asistencia al agregar fila', async () => {
    const user = userEvent.setup();
    // Jugadores 1 y 2 asisten; DB vacía → auto-fill con 1 y 2 como spans (no selects)
    render(
      <LineupModal
        {...buildProps({
          onFetchLineup: vi.fn().mockResolvedValue([]),
          attendingPlayerIds: [1, 2],
        })}
      />
    );
    // findAllByText: Juan García puede aparecer también en el aviso de posición duplicada
    await screen.findAllByText(/Juan García/); // auto-fill listo

    await user.click(screen.getByRole('button', { name: /Agregar jugador/i }));

    const playerSelect = findPlayerSelect();
    const optionValues = Array.from(playerSelect.options).map(o => o.value);

    // 1 y 2 ya están en lineup auto-fill → excluidos del select
    expect(optionValues).not.toContain('1');
    expect(optionValues).not.toContain('2');
    // 3 y 4 no tienen asistencia → también excluidos por attendingPlayerIds
    expect(optionValues).not.toContain('3');
    expect(optionValues).not.toContain('4');
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

  it('no muestra advertencia de asistencia cuando hay jugadores con asistencia', async () => {
    render(
      <LineupModal
        {...buildProps({
          onFetchLineup: vi.fn().mockResolvedValue([]),
          attendingPlayerIds: [1, 2],
        })}
      />
    );
    await screen.findAllByText(/Juan García/); // auto-fill listo (puede aparecer en aviso de posición)
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

    const playerSelect = findPlayerSelect();
    const optionValues = Array.from(playerSelect.options).map(o => o.value);
    expect(optionValues).toContain('1');
    expect(optionValues).toContain('2');
    expect(optionValues).toContain('3');
    expect(optionValues).toContain('4');
  });

  it('un jugador en el lineup de BD pero sin asistencia sigue visible (read-only)', async () => {
    render(
      <LineupModal
        {...buildProps({
          attendingPlayerIds: [1, 2], // Carlos Ruiz (3) sin asistencia
        })}
      />
    );
    // Carlos Ruiz estaba en BD → debe aparecer igualmente
    expect(await screen.findByText(/Carlos Ruiz/)).toBeInTheDocument();
  });
});

// ─── FASE 5: Nuevos tests de pulido ────────────────────────────────────────

describe('LineupModal — Fase 5: validación de lineup vacío', () => {
  beforeEach(() => vi.clearAllMocks());

  it('no llama a onSave y muestra error cuando el lineup está vacío', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <LineupModal
        {...buildProps({
          onFetchLineup: vi.fn().mockResolvedValue([]),
          attendingPlayerIds: [],
          onSave,
        })}
      />
    );
    await screen.findByText(/No hay lineup registrado/i);

    await user.click(screen.getByRole('button', { name: /Guardar Lineup/i }));

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText(/El lineup no puede estar vacío/i)).toBeInTheDocument();
  });

  it('no llama a onSave cuando todas las filas tienen jugador_id vacío', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <LineupModal
        {...buildProps({
          onFetchLineup: vi.fn().mockResolvedValue([]),
          attendingPlayerIds: undefined,
          onSave,
        })}
      />
    );
    await screen.findByText(/No hay lineup registrado/i);

    // Agregar fila vacía (sin seleccionar jugador)
    await user.click(screen.getByRole('button', { name: /Agregar jugador/i }));
    await user.click(screen.getByRole('button', { name: /Guardar Lineup/i }));

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText(/El lineup no puede estar vacío/i)).toBeInTheDocument();
  });

  it('el mensaje de error desaparece al cerrar y reabrir el modal', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const { rerender } = render(
      <LineupModal
        {...buildProps({
          onFetchLineup: vi.fn().mockResolvedValue([]),
          attendingPlayerIds: [],
          onSave,
        })}
      />
    );
    await screen.findByText(/No hay lineup registrado/i);

    await user.click(screen.getByRole('button', { name: /Guardar Lineup/i }));
    expect(screen.getByText(/El lineup no puede estar vacío/i)).toBeInTheDocument();

    // Cerrar y reabrir
    rerender(<LineupModal {...buildProps({ show: false, onSave })} />);
    rerender(
      <LineupModal
        {...buildProps({
          onFetchLineup: vi.fn().mockResolvedValue([]),
          attendingPlayerIds: [],
          onSave,
        })}
      />
    );
    await screen.findByText(/No hay lineup registrado/i);
    expect(screen.queryByText(/El lineup no puede estar vacío/i)).not.toBeInTheDocument();
  });

  it('llama a onSave correctamente cuando hay filas válidas', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<LineupModal {...buildProps({ onSave })} />);
    await screen.findByText(/Juan García/);

    await user.click(screen.getByRole('button', { name: /Guardar Lineup/i }));

    expect(onSave).toHaveBeenCalledOnce();
    expect(screen.queryByText(/El lineup no puede estar vacío/i)).not.toBeInTheDocument();
  });
});

describe('LineupModal — Fase 5: estado de guardado (saving)', () => {
  it('el botón muestra "Guardando..." y se deshabilita mientras onSave está pendiente', async () => {
    const user = userEvent.setup();
    let resolve;
    const onSave = vi.fn().mockReturnValue(new Promise(r => { resolve = r; }));
    render(<LineupModal {...buildProps({ onSave })} />);
    await screen.findByText(/Juan García/);

    const saveBtn = screen.getByRole('button', { name: /Guardar Lineup/i });
    await user.click(saveBtn);

    // Mientras la promesa no resuelve, el botón debe cambiar
    expect(screen.getByRole('button', { name: /Guardando/i })).toBeDisabled();

    resolve();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Guardar Lineup/i })).not.toBeDisabled()
    );
  });
});

describe('LineupModal — Fase 5: control de sustituciones (lineupFromDB)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('bloquea la sustitución y muestra error cuando el lineup NO ha sido guardado', async () => {
    const user = userEvent.setup();
    const onOpenSubstitution = vi.fn();
    // DB vacía pero hay asistencia → auto-fill (lineupFromDB = false)
    render(
      <LineupModal
        {...buildProps({
          onFetchLineup: vi.fn().mockResolvedValue([]),
          attendingPlayerIds: [1, 2, 3],
          onOpenSubstitution,
        })}
      />
    );
    await screen.findAllByText(/Juan García/); // auto-fill listo (puede aparecer en aviso de posición)

    await user.click(screen.getByRole('button', { name: /Sustitución/i }));

    expect(onOpenSubstitution).not.toHaveBeenCalled();
    expect(screen.getByText(/Guarda el lineup antes de registrar una sustitución/i)).toBeInTheDocument();
  });

  it('permite la sustitución cuando el lineup viene de BD (lineupFromDB = true)', async () => {
    const user = userEvent.setup();
    const onOpenSubstitution = vi.fn();
    // DB devuelve datos → lineupFromDB = true
    render(<LineupModal {...buildProps({ onOpenSubstitution })} />);
    await screen.findByText(/Juan García/);

    await user.click(screen.getByRole('button', { name: /Sustitución/i }));

    expect(onOpenSubstitution).toHaveBeenCalledOnce();
  });

  it('permite la sustitución después de guardar el lineup por primera vez', async () => {
    const user = userEvent.setup();
    const onOpenSubstitution = vi.fn();
    const onSave = vi.fn().mockResolvedValue(undefined);
    // DB vacía, asistencia → auto-fill, lineupFromDB = false
    render(
      <LineupModal
        {...buildProps({
          onFetchLineup: vi.fn().mockResolvedValue([]),
          attendingPlayerIds: [1, 2, 3],
          onOpenSubstitution,
          onSave,
        })}
      />
    );
    await screen.findAllByText(/Juan García/); // puede aparecer en aviso de posición duplicada

    // Guardar el lineup (lo marca como lineupFromDB = true)
    await user.click(screen.getByRole('button', { name: /Guardar Lineup/i }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());

    // Ahora la sustitución debe funcionar
    await user.click(screen.getByRole('button', { name: /Sustitución/i }));
    expect(onOpenSubstitution).toHaveBeenCalledOnce();
  });
});

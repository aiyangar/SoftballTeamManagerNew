/**
 * Pruebas de integración: flujo completo de lineup y sustituciones
 *
 * Simula el flujo end-to-end:
 *   1. Abrir LineupModal y guardar un lineup
 *   2. Desde LineupModal abrir SubstitutionModal
 *   3. SubstitutionModal registra la sustitución y actualiza el lineup
 *
 * Supabase está completamente mockeado; no se requiere conexión a red.
 */
import React, { useState } from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LineupModal from '../../components/Modals/LineupModal';
import SubstitutionModal from '../../components/Modals/SubstitutionModal';
import ScheduleHistoryModal from '../../components/Modals/ScheduleHistoryModal';
import {
  mockPlayers,
  mockGame,
  mockLineupFromDB,
  mockGameDetailsData,
  mockPaymentTotals,
} from '../../test/fixtures';

// ──────────────────────────────────────────────────────────────────────────────
// Mock del cliente Supabase (no hay llamadas reales en estos tests)
// ──────────────────────────────────────────────────────────────────────────────

vi.mock('../../supabaseClient', () => {
  const chain = {};
  chain.select = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.order = vi.fn(() => Promise.resolve({ data: [], error: null }));
  chain.insert = vi.fn(() => Promise.resolve({ error: null }));
  chain.delete = vi.fn(() => chain);
  chain.update = vi.fn(() => chain);

  return {
    supabase: {
      from: vi.fn(() => chain),
    },
  };
});

// ──────────────────────────────────────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────────────────────────────────────

describe('Flujo: abrir LineupModal desde ScheduleHistoryModal', () => {
  it('el botón Lineup llama a onOpenLineup con el partido correcto', async () => {
    const user = userEvent.setup();
    const onOpenLineup = vi.fn();

    render(
      <ScheduleHistoryModal
        showModal={true}
        selectedGame={mockGame}
        paymentTotals={mockPaymentTotals}
        gameDetailsData={mockGameDetailsData}
        onClose={vi.fn()}
        onEditGame={vi.fn()}
        onDeleteGame={vi.fn()}
        gameFinalizationStatus={false}
        onOpenPaymentForm={vi.fn()}
        players={mockPlayers}
        attendance={{}}
        onAttendanceChange={vi.fn()}
        onRecordAttendance={vi.fn()}
        onLoadExistingAttendance={vi.fn()}
        onReloadDetails={vi.fn()}
        onViewPlayerHistory={vi.fn()}
        onOpenScoreForm={vi.fn()}
        onOpenLineup={onOpenLineup}
      />
    );

    await user.click(screen.getByTitle('Gestionar lineup'));
    expect(onOpenLineup).toHaveBeenCalledWith(mockGame);
  });
});

describe('Flujo: LineupModal — carga y guardado', () => {
  let fetchLineup;
  let saveLineup;

  beforeEach(() => {
    fetchLineup = vi.fn().mockResolvedValue([]);
    saveLineup = vi.fn().mockResolvedValue(undefined);
  });

  it('muestra "No hay lineup" cuando DB está vacía y sin asistencia', async () => {
    // attendingPlayerIds vacío → no hay auto-fill → lineup queda vacío
    render(
      <LineupModal
        show={true}
        game={mockGame}
        players={mockPlayers}
        attendingPlayerIds={[]}
        onClose={vi.fn()}
        onFetchLineup={fetchLineup}
        onSave={saveLineup}
        onOpenSubstitution={vi.fn()}
        gameFinalizationStatus={false}
      />
    );
    expect(await screen.findByText(/No hay lineup registrado/i)).toBeInTheDocument();
  });

  it('carga y muestra el lineup existente desde BD', async () => {
    fetchLineup = vi.fn().mockResolvedValue(mockLineupFromDB);
    render(
      <LineupModal
        show={true}
        game={mockGame}
        players={mockPlayers}
        attendingPlayerIds={mockPlayers.map(p => p.id)}
        onClose={vi.fn()}
        onFetchLineup={fetchLineup}
        onSave={saveLineup}
        onOpenSubstitution={vi.fn()}
        gameFinalizationStatus={false}
      />
    );
    expect(await screen.findByText(/Juan García/)).toBeInTheDocument();
    expect(screen.getByText(/Pedro López/)).toBeInTheDocument();
  });

  it('agregar fila y guardar llama a saveLineup con los datos correctos', async () => {
    render(
      <LineupModal
        show={true}
        game={mockGame}
        players={mockPlayers}
        attendingPlayerIds={undefined}
        onClose={vi.fn()}
        onFetchLineup={fetchLineup}
        onSave={saveLineup}
        onOpenSubstitution={vi.fn()}
        gameFinalizationStatus={false}
      />
    );
    await screen.findByText(/No hay lineup registrado/i);

    // Agregar un jugador
    await userEvent.click(screen.getByRole('button', { name: /Agregar jugador/i }));

    // Seleccionar jugador en el select (el que tiene option value='')
    const playerSelect = screen
      .getAllByRole('combobox')
      .find(s => Array.from(s.options).some(o => o.value === ''));
    fireEvent.change(playerSelect, { target: { value: '1' } }); // Juan García

    // Guardar
    await userEvent.click(screen.getByRole('button', { name: /Guardar Lineup/i }));

    await waitFor(() => {
      expect(saveLineup).toHaveBeenCalledWith(
        mockGame.id,
        mockGame.equipo_id,
        expect.arrayContaining([
          expect.objectContaining({
            jugador_id: '1',
            es_titular: true,
          }),
        ])
      );
    });
  });

  it('guardar con lineup vacío muestra error y NO llama a saveLineup', async () => {
    render(
      <LineupModal
        show={true}
        game={mockGame}
        players={mockPlayers}
        attendingPlayerIds={[]}
        onClose={vi.fn()}
        onFetchLineup={fetchLineup}
        onSave={saveLineup}
        onOpenSubstitution={vi.fn()}
        gameFinalizationStatus={false}
      />
    );
    await screen.findByText(/No hay lineup registrado/i);

    await userEvent.click(screen.getByRole('button', { name: /Guardar Lineup/i }));

    expect(saveLineup).not.toHaveBeenCalled();
    expect(await screen.findByText(/El lineup no puede estar vacío/i)).toBeInTheDocument();
  });
});

describe('Flujo: apertura de SubstitutionModal desde LineupModal', () => {
  it('el botón Sustitución pasa el lineup activo a onOpenSubstitution (lineup de BD)', async () => {
    const user = userEvent.setup();
    const onOpenSubstitution = vi.fn();
    const fetchLineup = vi.fn().mockResolvedValue(mockLineupFromDB);

    render(
      <LineupModal
        show={true}
        game={mockGame}
        players={mockPlayers}
        attendingPlayerIds={mockPlayers.map(p => p.id)}
        onClose={vi.fn()}
        onFetchLineup={fetchLineup}
        onSave={vi.fn()}
        onOpenSubstitution={onOpenSubstitution}
        gameFinalizationStatus={false}
      />
    );

    await screen.findByText(/Juan García/);
    await user.click(screen.getByRole('button', { name: /Sustitución/i }));

    expect(onOpenSubstitution).toHaveBeenCalledOnce();
    const passedLineup = onOpenSubstitution.mock.calls[0][0];

    expect(passedLineup.every(r => r.activo)).toBe(true);
    passedLineup.forEach(entry => {
      expect(entry).toHaveProperty('jugador_id');
      expect(entry).toHaveProperty('nombre');
      expect(entry).toHaveProperty('orden_bateo');
      expect(entry).toHaveProperty('posicion_campo');
    });
  });

  it('LineupModal + SubstitutionModal funcionan juntos sin errores', async () => {
    const user = userEvent.setup();

    const Wrapper = () => {
      const [activeLineup, setActiveLineup] = useState([]);
      const [showSub, setShowSub] = useState(false);

      return (
        <>
          <LineupModal
            show={true}
            game={mockGame}
            players={mockPlayers}
            attendingPlayerIds={mockPlayers.map(p => p.id)}
            onClose={vi.fn()}
            onFetchLineup={vi.fn().mockResolvedValue(mockLineupFromDB)}
            onSave={vi.fn()}
            onOpenSubstitution={lineup => {
              setActiveLineup(lineup);
              setShowSub(true);
            }}
            gameFinalizationStatus={false}
          />
          <SubstitutionModal
            show={showSub}
            game={mockGame}
            players={mockPlayers}
            activeLineup={activeLineup}
            onClose={() => setShowSub(false)}
            onSave={vi.fn().mockResolvedValue(undefined)}
          />
        </>
      );
    };

    render(<Wrapper />);

    await screen.findByText(/Juan García/);

    // Abrir SubstitutionModal (lineup viene de BD → lineupFromDB = true)
    await user.click(screen.getByRole('button', { name: /Sustitución/i }));

    expect(await screen.findByText(/Registrar Sustitución/i)).toBeInTheDocument();

    const juanOptions = screen.getAllByText(/Juan García/, { selector: 'option' });
    expect(juanOptions.length).toBeGreaterThan(0);
  });
});

describe('Flujo: registrar sustitución', () => {
  it('onSave recibe los datos correctos de la sustitución (con posición heredada)', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    const activeLineup = [
      { jugador_id: 1, nombre: 'Juan García', numero: '5', orden_bateo: 1, posicion_campo: 'SS' },
      { jugador_id: 2, nombre: 'Pedro López', numero: '10', orden_bateo: 2, posicion_campo: 'P' },
    ];

    render(
      <SubstitutionModal
        show={true}
        game={mockGame}
        players={mockPlayers}
        activeLineup={activeLineup}
        onClose={onClose}
        onSave={onSave}
      />
    );

    // Juan García sale → posición SS se hereda automáticamente en el select
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: '1' } });
    // Carlos Ruiz entra
    fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: '3' } });
    fireEvent.submit(screen.getAllByRole('combobox')[0].closest('form'));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        mockGame.id,
        mockGame.equipo_id,
        expect.objectContaining({
          jugador_sale_id: '1',
          jugador_entra_id: '3',
          orden_bateo: 1,
          posicion_campo: 'SS', // heredada al seleccionar jugador que sale
        })
      );
    });
  });

  it('después del submit el modal se cierra', async () => {
    const onClose = vi.fn();
    const activeLineup = [
      { jugador_id: 1, nombre: 'Juan García', numero: '5', orden_bateo: 1, posicion_campo: 'SS' },
    ];

    render(
      <SubstitutionModal
        show={true}
        game={mockGame}
        players={mockPlayers}
        activeLineup={activeLineup}
        onClose={onClose}
        onSave={vi.fn().mockResolvedValue(undefined)}
      />
    );

    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: '1' } });
    fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: '2' } });
    fireEvent.submit(screen.getAllByRole('combobox')[0].closest('form'));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});

describe('Flujo: partido finalizado — modo lectura completo', () => {
  it('LineupModal en modo finalizado sólo muestra datos, sin edición', async () => {
    const fetchLineup = vi.fn().mockResolvedValue(mockLineupFromDB);

    render(
      <LineupModal
        show={true}
        game={{ ...mockGame, finalizado: true }}
        players={mockPlayers}
        attendingPlayerIds={mockPlayers.map(p => p.id)}
        onClose={vi.fn()}
        onFetchLineup={fetchLineup}
        onSave={vi.fn()}
        onOpenSubstitution={vi.fn()}
        gameFinalizationStatus={true}
      />
    );

    expect(await screen.findByText(/Juan García/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Guardar Lineup/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Agregar jugador/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Sustitución/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Cerrar$/i })).toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });
});

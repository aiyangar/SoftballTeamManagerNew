/**
 * Pruebas de integración: ScheduleHistoryModal con acordeón de lineup
 *
 * Verifica que el modal de detalles del partido muestra correctamente el
 * resumen del lineup y expone el botón de acceso al LineupModal.
 */
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ScheduleHistoryModal from '../../components/Modals/ScheduleHistoryModal';
import {
  mockGame,
  mockFinalizedGame,
  mockPlayers,
  mockGameDetailsData,
  mockPaymentTotals,
} from '../../test/fixtures';

// ─── helpers ───────────────────────────────────────────────────────────────

const buildProps = overrides => ({
  showModal: true,
  selectedGame: mockGame,
  paymentTotals: mockPaymentTotals,
  gameDetailsData: mockGameDetailsData,
  onClose: vi.fn(),
  onEditGame: vi.fn(),
  onDeleteGame: vi.fn(),
  gameFinalizationStatus: false,
  onOpenPaymentForm: vi.fn(),
  players: mockPlayers,
  attendance: {},
  onAttendanceChange: vi.fn(),
  onRecordAttendance: vi.fn().mockResolvedValue(true),
  onLoadExistingAttendance: vi.fn().mockResolvedValue(true),
  onReloadDetails: vi.fn(),
  onViewPlayerHistory: vi.fn(),
  onOpenScoreForm: vi.fn(),
  onOpenLineup: vi.fn(),
  ...overrides,
});

// ─── suite ─────────────────────────────────────────────────────────────────

describe('ScheduleHistoryModal — acordeón de Lineup', () => {
  it('muestra la sección de Lineup con el conteo correcto', () => {
    render(<ScheduleHistoryModal {...buildProps()} />);
    expect(screen.getByText(/Lineup \(3 jugadores\)/i)).toBeInTheDocument();
  });

  it('muestra cuántos jugadores están activos en el resumen del acordeón', () => {
    render(<ScheduleHistoryModal {...buildProps()} />);
    expect(screen.getByText(/3 activos/i)).toBeInTheDocument();
  });

  it('el contenido del lineup está oculto por defecto (acordeón cerrado)', () => {
    render(<ScheduleHistoryModal {...buildProps()} />);
    expect(screen.queryByText(/Juan García/)).not.toBeInTheDocument();
  });

  it('expande el acordeón al hacer clic y muestra los jugadores', async () => {
    const user = userEvent.setup();
    render(<ScheduleHistoryModal {...buildProps()} />);

    const header = screen.getByText(/Lineup \(3 jugadores\)/i).closest('div[class]');
    await user.click(header);

    expect(await screen.findByText(/Juan García/)).toBeInTheDocument();
    expect(screen.getByText(/Pedro López/)).toBeInTheDocument();
    expect(screen.getByText(/Carlos Ruiz/)).toBeInTheDocument();
  });

  it('muestra columnas de Turno, Jugador, Posición y Estado en la tabla', async () => {
    const user = userEvent.setup();
    render(<ScheduleHistoryModal {...buildProps()} />);

    const header = screen.getByText(/Lineup \(3 jugadores\)/i).closest('div[class]');
    await user.click(header);

    expect(screen.getByText('Turno')).toBeInTheDocument();
    expect(screen.getByText('Jugador')).toBeInTheDocument();
    expect(screen.getByText('Posición')).toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
  });

  it('muestra turno de bateo y posición de cada jugador', async () => {
    const user = userEvent.setup();
    render(<ScheduleHistoryModal {...buildProps()} />);

    const header = screen.getByText(/Lineup \(3 jugadores\)/i).closest('div[class]');
    await user.click(header);

    // Juan García, turno 1, posición SS
    const rows = screen.getAllByRole('row');
    const juanRow = rows.find(r => r.textContent.includes('Juan García'));
    expect(within(juanRow).getByText('1')).toBeInTheDocument();
    expect(within(juanRow).getByText('SS')).toBeInTheDocument();
  });

  it('muestra conteo 0 cuando el lineup está vacío', () => {
    const noLineupData = { ...mockGameDetailsData, lineup: [] };
    render(<ScheduleHistoryModal {...buildProps({ gameDetailsData: noLineupData })} />);
    expect(screen.getByText(/Lineup \(0 jugadores\)/i)).toBeInTheDocument();
  });

  it('muestra "No hay lineup registrado" al expandir acordeón vacío', async () => {
    const user = userEvent.setup();
    const noLineupData = { ...mockGameDetailsData, lineup: [] };
    render(<ScheduleHistoryModal {...buildProps({ gameDetailsData: noLineupData })} />);

    const header = screen.getByText(/Lineup \(0 jugadores\)/i).closest('div[class]');
    await user.click(header);

    expect(await screen.findByText(/No hay lineup registrado/i)).toBeInTheDocument();
  });
});

describe('ScheduleHistoryModal — botón Lineup en barra de acciones', () => {
  it('muestra el botón "Lineup" cuando el partido no está finalizado', () => {
    render(<ScheduleHistoryModal {...buildProps()} />);
    // El botón tiene emoji ⚾ + texto "Lineup"; usar title para identificarlo sin ambigüedad
    expect(screen.getByTitle('Gestionar lineup')).toBeInTheDocument();
  });

  it('el botón "Lineup" no aparece cuando el partido está finalizado', () => {
    render(
      <ScheduleHistoryModal
        {...buildProps({
          selectedGame: mockFinalizedGame,
          gameFinalizationStatus: true,
        })}
      />
    );
    expect(screen.queryByTitle('Gestionar lineup')).not.toBeInTheDocument();
  });

  it('el botón "Lineup" llama a onOpenLineup con el partido seleccionado', async () => {
    const user = userEvent.setup();
    const onOpenLineup = vi.fn();
    render(<ScheduleHistoryModal {...buildProps({ onOpenLineup })} />);

    await user.click(screen.getByTitle('Gestionar lineup'));

    expect(onOpenLineup).toHaveBeenCalledWith(mockGame);
  });

  it('el botón "Lineup" NO cierra el modal de detalles', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ScheduleHistoryModal {...buildProps({ onClose })} />);

    await user.click(screen.getByTitle('Gestionar lineup'));

    expect(onClose).not.toHaveBeenCalled();
  });
});

describe('ScheduleHistoryModal — botón Editar dentro del acordeón de Lineup', () => {
  // El botón "Editar" del acordeón de Lineup tiene clase bg-purple-600,
  // mientras que el del acordeón de Asistencia tiene bg-blue-600.
  const getLineupEditBtn = () =>
    screen.getAllByRole('button', { name: /Editar/i })
      .find(b => b.className.includes('purple'));

  it('muestra botón "Editar" en el header del acordeón (partido no finalizado)', () => {
    render(<ScheduleHistoryModal {...buildProps()} />);
    expect(getLineupEditBtn()).toBeInTheDocument();
    expect(getLineupEditBtn()).toHaveClass('bg-purple-600');
  });

  it('"Editar" en el acordeón llama a onOpenLineup', async () => {
    const user = userEvent.setup();
    const onOpenLineup = vi.fn();
    render(<ScheduleHistoryModal {...buildProps({ onOpenLineup })} />);

    await user.click(getLineupEditBtn());

    expect(onOpenLineup).toHaveBeenCalledWith(mockGame);
  });

  it('"Editar" no expande el acordeón (stopPropagation)', async () => {
    const user = userEvent.setup();
    render(<ScheduleHistoryModal {...buildProps()} />);

    await user.click(getLineupEditBtn());

    // El contenido del acordeón debe seguir oculto
    expect(screen.queryByText(/Juan García/)).not.toBeInTheDocument();
  });
});

describe('ScheduleHistoryModal — compatibilidad sin onOpenLineup', () => {
  it('no falla si onOpenLineup no se proporciona', () => {
    const propsWithoutLineup = buildProps({ onOpenLineup: undefined });
    expect(() => render(<ScheduleHistoryModal {...propsWithoutLineup} />)).not.toThrow();
  });
});

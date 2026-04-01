import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ScheduleCard from '../../components/Cards/ScheduleCard';

const mockGame = {
  id: 42,
  equipo_contrario: 'Tigres',
  fecha_partido: '2026-04-01',
  lugar: 'Estadio Central',
  umpire: 550,
  resultado: null,
  carreras_equipo_local: null,
  carreras_equipo_contrario: null,
};

const mockFinalizedGame = {
  ...mockGame,
  id: 99,
  resultado: 'Victoria',
  carreras_equipo_local: 8,
  carreras_equipo_contrario: 3,
};

const mockPlayers = [
  { id: 1, nombre: 'Juan García' },
  { id: 2, nombre: 'Pedro López' },
];

const baseProps = {
  game: mockGame,
  paymentTotals: {},
  gameFinalizationStatus: { 42: false },
  onCardClick: vi.fn(),
  onAttendanceFormToggle: vi.fn(),
  players: mockPlayers,
  attendance: {},
  onAttendanceChange: vi.fn(),
  onLoadExistingAttendance: vi.fn(),
  onRecordAttendance: vi.fn(),
  onFetchPlayers: vi.fn(),
  selectedTeam: '7',
  showAttendanceForm: {},
};

describe('ScheduleCard', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('partido no finalizado', () => {
    it('muestra el nombre del equipo contrario', () => {
      render(<ScheduleCard {...baseProps} />);
      expect(screen.getByText('Tigres')).toBeInTheDocument();
    });

    it('muestra el lugar', () => {
      render(<ScheduleCard {...baseProps} />);
      expect(screen.getByText('Lugar: Estadio Central')).toBeInTheDocument();
    });

    it('muestra el costo del umpire', () => {
      render(<ScheduleCard {...baseProps} />);
      expect(screen.getByText('Umpire: $550')).toBeInTheDocument();
    });

    it('muestra $550 como umpire por defecto cuando no hay valor', () => {
      render(
        <ScheduleCard {...baseProps} game={{ ...mockGame, umpire: undefined }} />
      );
      expect(screen.getByText('Umpire: $550')).toBeInTheDocument();
    });

    it('no muestra el banner de partido finalizado', () => {
      render(<ScheduleCard {...baseProps} />);
      expect(screen.queryByText('🔒 PARTIDO FINALIZADO')).not.toBeInTheDocument();
    });

    it('muestra el PaymentStatusWidget cuando hay paymentTotals para el partido', () => {
      render(
        <ScheduleCard
          {...baseProps}
          paymentTotals={{ 42: { totalUmpire: 330, totalInscripcion: 0 } }}
        />
      );
      expect(screen.getByText('Estado de Pagos')).toBeInTheDocument();
    });

    it('no muestra PaymentStatusWidget cuando no hay paymentTotals para el partido', () => {
      render(<ScheduleCard {...baseProps} paymentTotals={{}} />);
      expect(screen.queryByText('Estado de Pagos')).not.toBeInTheDocument();
    });
  });

  describe('partido finalizado', () => {
    const finalizedProps = {
      ...baseProps,
      game: mockFinalizedGame,
      gameFinalizationStatus: { 99: true },
      showAttendanceForm: {},
    };

    it('muestra el banner de partido finalizado', () => {
      render(<ScheduleCard {...finalizedProps} />);
      expect(screen.getByText('🔒 PARTIDO FINALIZADO')).toBeInTheDocument();
    });

    it('muestra el marcador cuando hay resultado', () => {
      render(<ScheduleCard {...finalizedProps} />);
      expect(screen.getByText('Marcador: 8 - 3')).toBeInTheDocument();
    });

    it('muestra el resultado Victoria/Derrota/Empate', () => {
      render(<ScheduleCard {...finalizedProps} />);
      expect(screen.getByText('Resultado: Victoria')).toBeInTheDocument();
    });

    it('no muestra marcador cuando no hay resultado', () => {
      render(
        <ScheduleCard
          {...finalizedProps}
          game={{ ...mockFinalizedGame, resultado: null }}
        />
      );
      expect(screen.queryByText(/Marcador:/)).not.toBeInTheDocument();
    });

    it('no muestra lugar ni umpire', () => {
      render(<ScheduleCard {...finalizedProps} />);
      expect(screen.queryByText(/Estadio Central/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Umpire:/)).not.toBeInTheDocument();
    });
  });

  describe('click en la tarjeta', () => {
    it('llama a onCardClick con el partido al hacer click', async () => {
      const onCardClick = vi.fn();
      const user = userEvent.setup();
      render(<ScheduleCard {...baseProps} onCardClick={onCardClick} />);
      await user.click(screen.getByText('Tigres'));
      expect(onCardClick).toHaveBeenCalledWith(mockGame);
    });
  });

  describe('formulario de asistencia', () => {
    const withAttendanceForm = {
      ...baseProps,
      showAttendanceForm: { 42: true },
    };

    it('no muestra el formulario de asistencia por defecto', () => {
      render(<ScheduleCard {...baseProps} />);
      expect(screen.queryByText('Asistencia de Jugadores')).not.toBeInTheDocument();
    });

    it('muestra el formulario de asistencia cuando showAttendanceForm[game.id]=true', () => {
      render(<ScheduleCard {...withAttendanceForm} />);
      expect(screen.getByText('Asistencia de Jugadores')).toBeInTheDocument();
    });

    it('lista los jugadores como checkboxes', () => {
      render(<ScheduleCard {...withAttendanceForm} />);
      expect(screen.getByText('Juan García')).toBeInTheDocument();
      expect(screen.getByText('Pedro López')).toBeInTheDocument();
    });

    it('marca como checked los jugadores que ya asistieron', () => {
      render(
        <ScheduleCard
          {...withAttendanceForm}
          attendance={{ 42: [1] }}
        />
      );
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).not.toBeChecked();
    });

    it('llama a onAttendanceChange al hacer click en un checkbox', async () => {
      const onAttendanceChange = vi.fn();
      const user = userEvent.setup();
      render(
        <ScheduleCard
          {...withAttendanceForm}
          onAttendanceChange={onAttendanceChange}
        />
      );
      await user.click(screen.getByText('Juan García'));
      expect(onAttendanceChange).toHaveBeenCalledWith(42, 1);
    });

    it('muestra mensaje cuando no hay jugadores', () => {
      render(<ScheduleCard {...withAttendanceForm} players={[]} />);
      expect(
        screen.getByText('No hay jugadores registrados en este equipo.')
      ).toBeInTheDocument();
    });

    it('llama a onAttendanceFormToggle al cerrar el formulario', async () => {
      const onAttendanceFormToggle = vi.fn();
      const user = userEvent.setup();
      render(
        <ScheduleCard
          {...withAttendanceForm}
          onAttendanceFormToggle={onAttendanceFormToggle}
        />
      );
      await user.click(screen.getByTitle('Cerrar formulario de asistencia'));
      expect(onAttendanceFormToggle).toHaveBeenCalledWith(42);
    });

    it('los checkboxes están deshabilitados cuando el partido está finalizado', () => {
      render(
        <ScheduleCard
          {...withAttendanceForm}
          gameFinalizationStatus={{ 42: true }}
        />
      );
      screen.getAllByRole('checkbox').forEach(cb => {
        expect(cb).toBeDisabled();
      });
    });

    it('llama a onRecordAttendance al guardar asistencia', async () => {
      const onRecordAttendance = vi.fn();
      const user = userEvent.setup();
      render(
        <ScheduleCard
          {...withAttendanceForm}
          onRecordAttendance={onRecordAttendance}
        />
      );
      await user.click(screen.getByRole('button', { name: 'Guardar Asistencia' }));
      expect(onRecordAttendance).toHaveBeenCalledWith(42);
    });

    it('llama a onLoadExistingAttendance al cargar asistencia', async () => {
      const onLoadExistingAttendance = vi.fn();
      const user = userEvent.setup();
      render(
        <ScheduleCard
          {...withAttendanceForm}
          onLoadExistingAttendance={onLoadExistingAttendance}
        />
      );
      await user.click(
        screen.getByRole('button', { name: 'Cargar Asistencia Existente' })
      );
      expect(onLoadExistingAttendance).toHaveBeenCalledWith(42);
    });
  });
});

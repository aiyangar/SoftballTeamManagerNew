import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ScheduleCardsGrid from '../../components/CardGrids/ScheduleCardsGrid';

// Mockear ScheduleCard para aislar el grid de sus dependencias
vi.mock('../../components/Cards/ScheduleCard', () => ({
  default: ({ game }) => (
    <div data-testid="schedule-card">{game?.equipo_contrario}</div>
  ),
}));

// Mockear ScheduleCardSkeleton para contar instancias fácilmente
vi.mock('../../components/Cards/ScheduleCardSkeleton', () => ({
  default: () => <div data-testid="schedule-card-skeleton" />,
}));

const mockGames = [
  { id: 1, equipo_contrario: 'Tigres', fecha_partido: '2026-04-05' },
  { id: 2, equipo_contrario: 'Leones', fecha_partido: '2026-04-12' },
  { id: 3, equipo_contrario: 'Águilas', fecha_partido: '2026-04-19' },
];

const defaultProps = {
  games: [],
  loading: false,
  paymentTotals: {},
  gameFinalizationStatus: {},
  onCardClick: vi.fn(),
  onAttendanceFormToggle: vi.fn(),
  onEditGame: vi.fn(),
  onOpenPaymentForm: vi.fn(),
  onOpenScoreForm: vi.fn(),
  players: [],
  attendance: {},
  onAttendanceChange: vi.fn(),
  onLoadExistingAttendance: vi.fn(),
  onRecordAttendance: vi.fn(),
  onFetchPlayers: vi.fn(),
  selectedTeam: '1',
  showAttendanceForm: {},
};

describe('ScheduleCardsGrid', () => {
  describe('estado de carga (Fase D)', () => {
    it('muestra exactamente 4 skeletons cuando loading=true', () => {
      render(<ScheduleCardsGrid {...defaultProps} loading={true} />);
      const skeletons = screen.getAllByTestId('schedule-card-skeleton');
      expect(skeletons).toHaveLength(4);
    });

    it('no muestra cards reales cuando loading=true', () => {
      render(
        <ScheduleCardsGrid {...defaultProps} games={mockGames} loading={true} />
      );
      expect(screen.queryByTestId('schedule-card')).toBeNull();
    });

    it('no muestra el mensaje vacío cuando loading=true', () => {
      render(<ScheduleCardsGrid {...defaultProps} loading={true} />);
      expect(screen.queryByText(/No hay partidos/)).toBeNull();
    });
  });

  describe('estado vacío', () => {
    it('muestra mensaje cuando no hay partidos y no está cargando', () => {
      render(<ScheduleCardsGrid {...defaultProps} games={[]} loading={false} />);
      expect(screen.getByText('No hay partidos registrados aún.')).toBeInTheDocument();
    });

    it('muestra sugerencia para registrar primer partido', () => {
      render(<ScheduleCardsGrid {...defaultProps} games={[]} loading={false} />);
      expect(screen.getByText(/Registra tu primer partido/)).toBeInTheDocument();
    });

    it('no muestra skeletons en estado vacío', () => {
      render(<ScheduleCardsGrid {...defaultProps} games={[]} loading={false} />);
      expect(screen.queryByTestId('schedule-card-skeleton')).toBeNull();
    });
  });

  describe('estado normal con datos', () => {
    it('renderiza una card por cada partido en games[]', () => {
      render(<ScheduleCardsGrid {...defaultProps} games={mockGames} loading={false} />);
      expect(screen.getAllByTestId('schedule-card')).toHaveLength(3);
    });

    it('pasa el objeto game a cada ScheduleCard', () => {
      render(<ScheduleCardsGrid {...defaultProps} games={mockGames} loading={false} />);
      expect(screen.getByText('Tigres')).toBeInTheDocument();
      expect(screen.getByText('Leones')).toBeInTheDocument();
      expect(screen.getByText('Águilas')).toBeInTheDocument();
    });

    it('no muestra skeletons cuando hay partidos', () => {
      render(<ScheduleCardsGrid {...defaultProps} games={mockGames} loading={false} />);
      expect(screen.queryByTestId('schedule-card-skeleton')).toBeNull();
    });

    it('no muestra mensaje de vacío cuando hay partidos', () => {
      render(<ScheduleCardsGrid {...defaultProps} games={mockGames} loading={false} />);
      expect(screen.queryByText(/No hay partidos/)).toBeNull();
    });
  });
});

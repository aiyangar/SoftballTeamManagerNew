import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TeamCardsGrid from '../../components/CardGrids/TeamCardsGrid';

// Mockear TeamCard para aislar el grid de sus dependencias
vi.mock('../../components/Cards/TeamCard', () => ({
  default: ({ team }) => (
    <div data-testid="team-card">{team?.nombre_equipo}</div>
  ),
}));

// Mockear DashboardCardSkeleton (reusado por TeamCardsGrid) para contar instancias
vi.mock('../../components/Cards/DashboardCardSkeleton', () => ({
  default: () => <div data-testid="dashboard-card-skeleton" />,
}));

const mockTeams = [
  { id: 1, nombre_equipo: 'Los Tigres', inscripcion: 450 },
  { id: 2, nombre_equipo: 'Las Águilas', inscripcion: 500 },
  { id: 3, nombre_equipo: 'Los Leones', inscripcion: 400 },
];

describe('TeamCardsGrid', () => {
  describe('estado de carga (Fase D)', () => {
    it('muestra exactamente 4 skeletons cuando loadingTeams=true', () => {
      render(
        <TeamCardsGrid teams={[]} loadingTeams={true} onViewHistory={vi.fn()} />
      );
      const skeletons = screen.getAllByTestId('dashboard-card-skeleton');
      expect(skeletons).toHaveLength(4);
    });

    it('no muestra cards reales cuando loadingTeams=true', () => {
      render(
        <TeamCardsGrid teams={mockTeams} loadingTeams={true} onViewHistory={vi.fn()} />
      );
      expect(screen.queryByTestId('team-card')).toBeNull();
    });

    it('no muestra el mensaje vacío cuando loadingTeams=true', () => {
      render(
        <TeamCardsGrid teams={[]} loadingTeams={true} onViewHistory={vi.fn()} />
      );
      expect(screen.queryByText(/No tienes equipos/)).toBeNull();
    });

    it('reutiliza DashboardCardSkeleton (misma skeleton que Dashboard) para consistencia visual', () => {
      render(
        <TeamCardsGrid teams={[]} loadingTeams={true} onViewHistory={vi.fn()} />
      );
      // DashboardCardSkeleton se usa en Teams también (reutilización de componentes)
      expect(screen.getAllByTestId('dashboard-card-skeleton')).toHaveLength(4);
    });
  });

  describe('estado vacío', () => {
    it('muestra mensaje cuando no hay equipos y no está cargando', () => {
      render(
        <TeamCardsGrid teams={[]} loadingTeams={false} onViewHistory={vi.fn()} />
      );
      expect(screen.getByText('No tienes equipos creados aún.')).toBeInTheDocument();
    });

    it('muestra sugerencia para crear primer equipo', () => {
      render(
        <TeamCardsGrid teams={[]} loadingTeams={false} onViewHistory={vi.fn()} />
      );
      expect(screen.getByText(/Crea tu primer equipo/)).toBeInTheDocument();
    });

    it('no muestra skeletons en estado vacío', () => {
      render(
        <TeamCardsGrid teams={[]} loadingTeams={false} onViewHistory={vi.fn()} />
      );
      expect(screen.queryByTestId('dashboard-card-skeleton')).toBeNull();
    });
  });

  describe('estado normal con datos', () => {
    it('renderiza una card por cada equipo en teams[]', () => {
      render(
        <TeamCardsGrid
          teams={mockTeams}
          loadingTeams={false}
          onViewHistory={vi.fn()}
        />
      );
      expect(screen.getAllByTestId('team-card')).toHaveLength(3);
    });

    it('pasa el objeto team a cada TeamCard', () => {
      render(
        <TeamCardsGrid
          teams={mockTeams}
          loadingTeams={false}
          onViewHistory={vi.fn()}
        />
      );
      expect(screen.getByText('Los Tigres')).toBeInTheDocument();
      expect(screen.getByText('Las Águilas')).toBeInTheDocument();
      expect(screen.getByText('Los Leones')).toBeInTheDocument();
    });

    it('no muestra skeletons cuando hay equipos', () => {
      render(
        <TeamCardsGrid
          teams={mockTeams}
          loadingTeams={false}
          onViewHistory={vi.fn()}
        />
      );
      expect(screen.queryByTestId('dashboard-card-skeleton')).toBeNull();
    });

    it('no muestra mensaje de vacío cuando hay equipos', () => {
      render(
        <TeamCardsGrid
          teams={mockTeams}
          loadingTeams={false}
          onViewHistory={vi.fn()}
        />
      );
      expect(screen.queryByText(/No tienes equipos/)).toBeNull();
    });
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DashboardCardsGrid from '../../components/CardGrids/DashboardCardsGrid';

// Mockear DashboardCard para aislar el grid de sus dependencias
vi.mock('../../components/Cards/DashboardCard', () => ({
  default: ({ cardData }) => (
    <div data-testid="dashboard-card">{cardData?.title}</div>
  ),
}));

// Mockear DashboardCardSkeleton para contar instancias fácilmente
vi.mock('../../components/Cards/DashboardCardSkeleton', () => ({
  default: () => <div data-testid="dashboard-card-skeleton" />,
}));

describe('DashboardCardsGrid', () => {
  describe('estado de carga (Fase D)', () => {
    it('muestra exactamente 4 skeletons cuando loading=true', () => {
      render(<DashboardCardsGrid cards={[]} loading={true} />);
      const skeletons = screen.getAllByTestId('dashboard-card-skeleton');
      expect(skeletons).toHaveLength(4);
    });

    it('no muestra cards reales cuando loading=true', () => {
      const cards = [{ title: 'Test' }];
      render(<DashboardCardsGrid cards={cards} loading={true} />);
      expect(screen.queryByTestId('dashboard-card')).toBeNull();
    });

    it('el grid de skeletons tiene las mismas clases que el grid normal', () => {
      const { container: loadingContainer } = render(
        <DashboardCardsGrid cards={[]} loading={true} />
      );
      const { container: normalContainer } = render(
        <DashboardCardsGrid cards={[]} loading={false} />
      );
      const loadingGrid = loadingContainer.firstChild;
      const normalGrid = normalContainer.firstChild;
      expect(loadingGrid.className).toBe(normalGrid.className);
    });
  });

  describe('estado normal (sin carga)', () => {
    it('no muestra skeletons cuando loading=false', () => {
      render(<DashboardCardsGrid cards={[]} loading={false} />);
      expect(screen.queryByTestId('dashboard-card-skeleton')).toBeNull();
    });

    it('renderiza una card por cada elemento en cards[]', () => {
      const cards = [
        { title: 'Jugadores' },
        { title: 'Partidos' },
        { title: 'Victorias' },
      ];
      render(<DashboardCardsGrid cards={cards} loading={false} />);
      expect(screen.getAllByTestId('dashboard-card')).toHaveLength(3);
    });

    it('pasa el objeto cardData completo a cada DashboardCard', () => {
      const cards = [{ title: 'Asistencia' }, { title: 'Pagos' }];
      render(<DashboardCardsGrid cards={cards} loading={false} />);
      expect(screen.getByText('Asistencia')).toBeInTheDocument();
      expect(screen.getByText('Pagos')).toBeInTheDocument();
    });

    it('renderiza grid vacío sin errores cuando cards=[]', () => {
      const { container } = render(<DashboardCardsGrid cards={[]} loading={false} />);
      expect(container.firstChild).toBeTruthy();
      expect(screen.queryByTestId('dashboard-card')).toBeNull();
    });
  });
});

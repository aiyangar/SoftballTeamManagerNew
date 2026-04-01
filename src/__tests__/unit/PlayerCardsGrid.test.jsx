import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PlayerCardsGrid from '../../components/CardGrids/PlayerCardsGrid';

// Mockear PlayerCard para aislar el grid de sus dependencias (supabase, auth, etc.)
vi.mock('../../components/Cards/PlayerCard', () => ({
  default: ({ player }) => (
    <div data-testid="player-card">{player?.nombre}</div>
  ),
}));

// Mockear PlayerCardSkeleton para contar instancias fácilmente
vi.mock('../../components/Cards/PlayerCardSkeleton', () => ({
  default: () => <div data-testid="player-card-skeleton" />,
}));

const mockPlayers = [
  { id: 1, nombre: 'Carlos López', posiciones: ['Pitcher'] },
  { id: 2, nombre: 'Ana García', posiciones: ['Catcher'] },
  { id: 3, nombre: 'Pedro Martínez', posiciones: ['1B'] },
];

describe('PlayerCardsGrid', () => {
  describe('estado de carga (Fase D)', () => {
    it('muestra exactamente 8 skeletons cuando loadingPlayers=true', () => {
      render(<PlayerCardsGrid players={[]} loadingPlayers={true} />);
      const skeletons = screen.getAllByTestId('player-card-skeleton');
      expect(skeletons).toHaveLength(8);
    });

    it('no muestra cards reales cuando loadingPlayers=true', () => {
      render(<PlayerCardsGrid players={mockPlayers} loadingPlayers={true} />);
      expect(screen.queryByTestId('player-card')).toBeNull();
    });

    it('no muestra el mensaje vacío cuando loadingPlayers=true', () => {
      render(<PlayerCardsGrid players={[]} loadingPlayers={true} />);
      expect(screen.queryByText(/No hay jugadores/)).toBeNull();
    });
  });

  describe('estado vacío', () => {
    it('muestra mensaje cuando no hay jugadores y no está cargando', () => {
      render(<PlayerCardsGrid players={[]} loadingPlayers={false} />);
      expect(screen.getByText('No hay jugadores registrados.')).toBeInTheDocument();
    });

    it('muestra sugerencia para registrar primer jugador', () => {
      render(<PlayerCardsGrid players={[]} loadingPlayers={false} />);
      expect(screen.getByText(/Registra tu primer jugador/)).toBeInTheDocument();
    });

    it('no muestra skeletons en estado vacío', () => {
      render(<PlayerCardsGrid players={[]} loadingPlayers={false} />);
      expect(screen.queryByTestId('player-card-skeleton')).toBeNull();
    });
  });

  describe('estado normal con datos', () => {
    it('renderiza una card por cada jugador en players[]', () => {
      render(
        <PlayerCardsGrid
          players={mockPlayers}
          loadingPlayers={false}
          onViewHistory={vi.fn()}
          playerInscripcionTotals={{}}
          inscripcionTarget={450}
        />
      );
      expect(screen.getAllByTestId('player-card')).toHaveLength(3);
    });

    it('pasa el objeto player a cada PlayerCard', () => {
      render(
        <PlayerCardsGrid
          players={mockPlayers}
          loadingPlayers={false}
          onViewHistory={vi.fn()}
        />
      );
      expect(screen.getByText('Carlos López')).toBeInTheDocument();
      expect(screen.getByText('Ana García')).toBeInTheDocument();
      expect(screen.getByText('Pedro Martínez')).toBeInTheDocument();
    });

    it('no muestra skeletons cuando hay jugadores', () => {
      render(<PlayerCardsGrid players={mockPlayers} loadingPlayers={false} />);
      expect(screen.queryByTestId('player-card-skeleton')).toBeNull();
    });

    it('no muestra mensaje de vacío cuando hay jugadores', () => {
      render(<PlayerCardsGrid players={mockPlayers} loadingPlayers={false} />);
      expect(screen.queryByText(/No hay jugadores/)).toBeNull();
    });
  });
});

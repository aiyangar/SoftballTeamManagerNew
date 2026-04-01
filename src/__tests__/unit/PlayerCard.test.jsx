import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlayerCard from '../../components/Cards/PlayerCard';

const mockPlayer = {
  id: 1,
  nombre: 'Juan García',
  numero: '5',
  telefono: '555-1234',
  email: 'juan@example.com',
  jugador_posiciones: [
    { posiciones: { nombre_posicion: 'Shortstop' } },
    { posiciones: { nombre_posicion: 'Pitcher' } },
  ],
};

describe('PlayerCard', () => {
  describe('renderizado básico', () => {
    it('muestra el nombre del jugador', () => {
      render(<PlayerCard player={mockPlayer} onViewHistory={vi.fn()} />);
      expect(screen.getByText('Juan García')).toBeInTheDocument();
    });

    it('muestra el número del jugador', () => {
      render(<PlayerCard player={mockPlayer} onViewHistory={vi.fn()} />);
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('muestra "#" cuando no hay número', () => {
      render(
        <PlayerCard
          player={{ ...mockPlayer, numero: undefined }}
          onViewHistory={vi.fn()}
        />
      );
      expect(screen.getByText('#')).toBeInTheDocument();
    });

    it('muestra el teléfono del jugador', () => {
      render(<PlayerCard player={mockPlayer} onViewHistory={vi.fn()} />);
      expect(screen.getByText('555-1234')).toBeInTheDocument();
    });

    it('muestra el email del jugador', () => {
      render(<PlayerCard player={mockPlayer} onViewHistory={vi.fn()} />);
      expect(screen.getByText('juan@example.com')).toBeInTheDocument();
    });

    it('no muestra teléfono cuando no está definido', () => {
      render(
        <PlayerCard
          player={{ ...mockPlayer, telefono: undefined }}
          onViewHistory={vi.fn()}
        />
      );
      expect(screen.queryByText('555-1234')).not.toBeInTheDocument();
    });

    it('no muestra email cuando no está definido', () => {
      render(
        <PlayerCard
          player={{ ...mockPlayer, email: undefined }}
          onViewHistory={vi.fn()}
        />
      );
      expect(screen.queryByText('juan@example.com')).not.toBeInTheDocument();
    });
  });

  describe('posiciones', () => {
    it('muestra las abreviaciones de posiciones', () => {
      render(<PlayerCard player={mockPlayer} onViewHistory={vi.fn()} />);
      expect(screen.getByText('SS')).toBeInTheDocument();
      expect(screen.getByText('P')).toBeInTheDocument();
    });

    it('no muestra sección de posiciones cuando el array está vacío', () => {
      render(
        <PlayerCard
          player={{ ...mockPlayer, jugador_posiciones: [] }}
          onViewHistory={vi.fn()}
        />
      );
      expect(screen.queryByText('SS')).not.toBeInTheDocument();
    });

    it('no muestra sección de posiciones cuando jugador_posiciones es undefined', () => {
      render(
        <PlayerCard
          player={{ ...mockPlayer, jugador_posiciones: undefined }}
          onViewHistory={vi.fn()}
        />
      );
      expect(screen.queryByText('SS')).not.toBeInTheDocument();
    });

    it('mapea correctamente las abreviaciones conocidas', () => {
      const allPositions = [
        { posiciones: { nombre_posicion: 'Pitcher' } },
        { posiciones: { nombre_posicion: 'Catcher' } },
        { posiciones: { nombre_posicion: 'Primera Base' } },
        { posiciones: { nombre_posicion: 'Segunda Base' } },
        { posiciones: { nombre_posicion: 'Tercera Base' } },
        { posiciones: { nombre_posicion: 'Shortstop' } },
        { posiciones: { nombre_posicion: 'Jardinero Izquierdo' } },
        { posiciones: { nombre_posicion: 'Jardinero Central' } },
        { posiciones: { nombre_posicion: 'Jardinero Derecho' } },
        { posiciones: { nombre_posicion: 'Short Fielder' } },
      ];
      render(
        <PlayerCard
          player={{ ...mockPlayer, jugador_posiciones: allPositions }}
          onViewHistory={vi.fn()}
        />
      );
      ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'SF'].forEach(abbr => {
        expect(screen.getByText(abbr)).toBeInTheDocument();
      });
    });

    it('usa el nombre completo cuando no hay abreviación registrada', () => {
      render(
        <PlayerCard
          player={{
            ...mockPlayer,
            jugador_posiciones: [{ posiciones: { nombre_posicion: 'Posición Desconocida' } }],
          }}
          onViewHistory={vi.fn()}
        />
      );
      expect(screen.getByText('Posición Desconocida')).toBeInTheDocument();
    });
  });

  describe('barra de progreso de inscripción', () => {
    it('muestra los montos de inscripción', () => {
      render(
        <PlayerCard
          player={mockPlayer}
          onViewHistory={vi.fn()}
          totalInscripcionPaid={200}
          inscripcionTarget={450}
        />
      );
      expect(screen.getByText('$200 / $450')).toBeInTheDocument();
    });

    it('muestra "Faltan: $X" cuando no se completó la meta', () => {
      render(
        <PlayerCard
          player={mockPlayer}
          onViewHistory={vi.fn()}
          totalInscripcionPaid={200}
          inscripcionTarget={450}
        />
      );
      expect(screen.getByText('$250')).toBeInTheDocument();
    });

    it('muestra "✓ Meta completada" cuando se alcanzó la meta', () => {
      render(
        <PlayerCard
          player={mockPlayer}
          onViewHistory={vi.fn()}
          totalInscripcionPaid={450}
          inscripcionTarget={450}
        />
      );
      expect(screen.getByText('✓ Meta completada')).toBeInTheDocument();
    });

    it('no muestra faltante cuando la meta está completada', () => {
      render(
        <PlayerCard
          player={mockPlayer}
          onViewHistory={vi.fn()}
          totalInscripcionPaid={500}
          inscripcionTarget={450}
        />
      );
      expect(screen.queryByText(/Faltan/)).not.toBeInTheDocument();
    });

    it('usa valor por defecto 0 para totalInscripcionPaid', () => {
      render(
        <PlayerCard player={mockPlayer} onViewHistory={vi.fn()} inscripcionTarget={450} />
      );
      expect(screen.getByText('$0 / $450')).toBeInTheDocument();
    });
  });

  describe('interacción', () => {
    it('llama a onViewHistory con el jugador al hacer click', async () => {
      const onViewHistory = vi.fn();
      const user = userEvent.setup();
      render(<PlayerCard player={mockPlayer} onViewHistory={onViewHistory} />);
      await user.click(screen.getByTitle('Haz clic para ver el historial del jugador'));
      expect(onViewHistory).toHaveBeenCalledWith(mockPlayer);
    });
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TeamHistoryModal from '../../components/Modals/TeamHistoryModal';

const mockTeam = {
  id: 7,
  nombre_equipo: 'Águilas del Norte',
  totalPlayers: 12,
  wins: 8,
  losses: 3,
  draws: 1,
  inscripcion: 1500,
  totalRegistrationPaid: 900,
};

const baseProps = {
  showModal: true,
  selectedTeam: mockTeam,
  onClose: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
};

describe('TeamHistoryModal', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('visibilidad', () => {
    it('no renderiza cuando showModal=false', () => {
      const { container } = render(
        <TeamHistoryModal {...baseProps} showModal={false} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('no renderiza cuando selectedTeam=null', () => {
      const { container } = render(
        <TeamHistoryModal {...baseProps} selectedTeam={null} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renderiza cuando showModal=true y hay equipo', () => {
      render(<TeamHistoryModal {...baseProps} />);
      expect(screen.getByText('Detalles del Equipo')).toBeInTheDocument();
    });
  });

  describe('información básica', () => {
    it('muestra el nombre del equipo', () => {
      render(<TeamHistoryModal {...baseProps} />);
      expect(screen.getByText('Águilas del Norte')).toBeInTheDocument();
    });

    it('muestra el total de jugadores', () => {
      render(<TeamHistoryModal {...baseProps} />);
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('Jugadores')).toBeInTheDocument();
    });

    it('muestra el record W-L-D', () => {
      render(<TeamHistoryModal {...baseProps} />);
      expect(screen.getByText('8-3-1')).toBeInTheDocument();
      expect(screen.getByText('W-L-D')).toBeInTheDocument();
    });

    it('muestra el monto de inscripción', () => {
      render(<TeamHistoryModal {...baseProps} />);
      expect(screen.getByText('$1,500')).toBeInTheDocument();
      expect(screen.getByText('Inscripción')).toBeInTheDocument();
    });

    it('muestra 0 para valores faltantes', () => {
      render(
        <TeamHistoryModal
          {...baseProps}
          selectedTeam={{
            id: 1,
            nombre_equipo: 'Nuevo',
            totalPlayers: undefined,
            wins: undefined,
            losses: undefined,
            draws: undefined,
          }}
        />
      );
      // Múltiples "0" en pantalla (jugadores, victorias, derrotas, empates)
      expect(screen.getAllByText('0').length).toBeGreaterThan(0);
      expect(screen.getByText('0-0-0')).toBeInTheDocument();
    });
  });

  describe('estado de pagos', () => {
    it('muestra la sección de Estado de Pagos cuando hay inscripcion', () => {
      render(<TeamHistoryModal {...baseProps} />);
      expect(screen.getByText('Estado de Pagos')).toBeInTheDocument();
    });

    it('no muestra Estado de Pagos cuando no hay inscripcion', () => {
      render(
        <TeamHistoryModal
          {...baseProps}
          selectedTeam={{ ...mockTeam, inscripcion: null }}
        />
      );
      expect(screen.queryByText('Estado de Pagos')).not.toBeInTheDocument();
    });

    it('muestra el monto pagado', () => {
      render(<TeamHistoryModal {...baseProps} />);
      expect(screen.getByText('$900')).toBeInTheDocument();
    });

    it('calcula correctamente el monto pendiente', () => {
      render(<TeamHistoryModal {...baseProps} />);
      // pendiente = 1500 - 900 = 600
      expect(screen.getByText('$600')).toBeInTheDocument();
    });
  });

  describe('estadísticas detalladas', () => {
    it('muestra las victorias en la sección de estadísticas', () => {
      render(<TeamHistoryModal {...baseProps} />);
      expect(screen.getByText('Victorias')).toBeInTheDocument();
      expect(screen.getByText('Derrotas')).toBeInTheDocument();
      expect(screen.getByText('Empates')).toBeInTheDocument();
    });

    it('muestra el porcentaje de victorias cuando hay partidos jugados', () => {
      render(<TeamHistoryModal {...baseProps} />);
      // 8 / (8+3+1) = 66.67% -> 67%
      expect(screen.getByText('67%')).toBeInTheDocument();
      expect(screen.getByText('Porcentaje de Victorias')).toBeInTheDocument();
    });

    it('no muestra porcentaje de victorias cuando no hay partidos', () => {
      render(
        <TeamHistoryModal
          {...baseProps}
          selectedTeam={{
            ...mockTeam,
            wins: 0,
            losses: 0,
            draws: 0,
          }}
        />
      );
      expect(screen.queryByText('Porcentaje de Victorias')).not.toBeInTheDocument();
    });
  });

  describe('botones de acción', () => {
    it('llama a onClose al hacer click en ×', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      render(<TeamHistoryModal {...baseProps} onClose={onClose} />);
      await user.click(screen.getByTitle('Cerrar detalles del equipo'));
      expect(onClose).toHaveBeenCalledOnce();
    });

    it('llama a onEdit con el equipo y luego a onClose al hacer click en Editar', async () => {
      const onEdit = vi.fn();
      const onClose = vi.fn();
      const user = userEvent.setup();
      render(<TeamHistoryModal {...baseProps} onEdit={onEdit} onClose={onClose} />);
      await user.click(screen.getByRole('button', { name: /Editar Equipo/ }));
      expect(onEdit).toHaveBeenCalledWith(mockTeam);
      expect(onClose).toHaveBeenCalledOnce();
    });

    it('llama a onDelete con el equipo y luego a onClose al hacer click en Eliminar', async () => {
      const onDelete = vi.fn();
      const onClose = vi.fn();
      const user = userEvent.setup();
      render(<TeamHistoryModal {...baseProps} onDelete={onDelete} onClose={onClose} />);
      await user.click(screen.getByRole('button', { name: /Eliminar Equipo/ }));
      expect(onDelete).toHaveBeenCalledWith(mockTeam);
      expect(onClose).toHaveBeenCalledOnce();
    });
  });
});

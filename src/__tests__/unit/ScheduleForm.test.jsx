import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ScheduleForm from '../../components/Forms/ScheduleForm';

const mockGame = {
  equipo_contrario: '',
  fecha_partido: '',
  lugar: '',
  umpire: '',
};

const baseProps = {
  showForm: true,
  newGame: mockGame,
  onInputChange: vi.fn(),
  onSubmit: vi.fn(),
  onCancel: vi.fn(),
  loading: false,
  editingGame: null,
  error: null,
};

describe('ScheduleForm', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('visibilidad', () => {
    it('no renderiza nada cuando showForm=false', () => {
      const { container } = render(<ScheduleForm {...baseProps} showForm={false} />);
      expect(container.firstChild).toBeNull();
    });

    it('renderiza el formulario cuando showForm=true', () => {
      render(<ScheduleForm {...baseProps} />);
      expect(screen.getByText('Registrar Nuevo Partido')).toBeInTheDocument();
    });
  });

  describe('título según modo', () => {
    it('muestra "Registrar Nuevo Partido" para partido nuevo', () => {
      render(<ScheduleForm {...baseProps} />);
      expect(screen.getByText('Registrar Nuevo Partido')).toBeInTheDocument();
    });

    it('muestra "Editar Partido" cuando hay partido en edición', () => {
      render(<ScheduleForm {...baseProps} editingGame={{ id: 1 }} />);
      expect(screen.getByText('Editar Partido')).toBeInTheDocument();
    });
  });

  describe('texto del botón de submit', () => {
    it('muestra "Registrar Partido" en modo nuevo', () => {
      render(<ScheduleForm {...baseProps} />);
      expect(
        screen.getByRole('button', { name: 'Registrar Partido' })
      ).toBeInTheDocument();
    });

    it('muestra "Actualizar Partido" en modo edición', () => {
      render(<ScheduleForm {...baseProps} editingGame={{ id: 1 }} />);
      expect(
        screen.getByRole('button', { name: 'Actualizar Partido' })
      ).toBeInTheDocument();
    });

    it('muestra "Registrando..." cuando loading en modo nuevo', () => {
      render(<ScheduleForm {...baseProps} loading={true} />);
      expect(screen.getByRole('button', { name: 'Registrando...' })).toBeInTheDocument();
    });

    it('muestra "Actualizando..." cuando loading en modo edición', () => {
      render(<ScheduleForm {...baseProps} editingGame={{ id: 1 }} loading={true} />);
      expect(screen.getByRole('button', { name: 'Actualizando...' })).toBeInTheDocument();
    });

    it('botón de submit deshabilitado cuando loading=true', () => {
      render(<ScheduleForm {...baseProps} loading={true} />);
      expect(screen.getByRole('button', { name: 'Registrando...' })).toBeDisabled();
    });
  });

  describe('campos del formulario', () => {
    it('muestra el campo Equipo Contrario', () => {
      render(<ScheduleForm {...baseProps} />);
      expect(screen.getByPlaceholderText('Equipo Contrario')).toBeInTheDocument();
    });

    it('muestra el campo Lugar', () => {
      render(<ScheduleForm {...baseProps} />);
      expect(screen.getByPlaceholderText('Lugar del partido')).toBeInTheDocument();
    });

    it('muestra el campo Umpire', () => {
      render(<ScheduleForm {...baseProps} />);
      expect(screen.getByPlaceholderText('Pago al Umpire')).toBeInTheDocument();
    });

    it('llama a onInputChange al cambiar el equipo contrario', () => {
      const onInputChange = vi.fn();
      render(<ScheduleForm {...baseProps} onInputChange={onInputChange} />);
      fireEvent.change(screen.getByPlaceholderText('Equipo Contrario'), {
        target: { value: 'Leones' },
      });
      expect(onInputChange).toHaveBeenCalledOnce();
    });

    it('llama a onInputChange al cambiar el lugar', () => {
      const onInputChange = vi.fn();
      render(<ScheduleForm {...baseProps} onInputChange={onInputChange} />);
      fireEvent.change(screen.getByPlaceholderText('Lugar del partido'), {
        target: { value: 'Parque Norte' },
      });
      expect(onInputChange).toHaveBeenCalledOnce();
    });
  });

  describe('mensaje de error', () => {
    it('muestra el error cuando se provee', () => {
      render(<ScheduleForm {...baseProps} error='Error al guardar el partido' />);
      expect(screen.getByText('Error al guardar el partido')).toBeInTheDocument();
    });

    it('no muestra error cuando es null', () => {
      render(<ScheduleForm {...baseProps} error={null} />);
      expect(screen.queryByText(/Error/)).not.toBeInTheDocument();
    });
  });

  describe('botones de acción', () => {
    it('llama a onCancel al hacer click en Cancelar', async () => {
      const onCancel = vi.fn();
      const user = userEvent.setup();
      render(<ScheduleForm {...baseProps} onCancel={onCancel} />);
      await user.click(screen.getByRole('button', { name: 'Cancelar' }));
      expect(onCancel).toHaveBeenCalledOnce();
    });

    it('llama a onSubmit al enviar el formulario', () => {
      const onSubmit = vi.fn();
      const { container } = render(<ScheduleForm {...baseProps} onSubmit={onSubmit} />);
      // Disparar submit directamente para evitar validación HTML5 (campos required vacíos)
      fireEvent.submit(container.querySelector('form'));
      expect(onSubmit).toHaveBeenCalledOnce();
    });
  });
});

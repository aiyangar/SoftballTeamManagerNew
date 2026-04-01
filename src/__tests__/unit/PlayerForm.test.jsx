import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlayerForm from '../../components/Forms/PlayerForm';

const mockPositions = [
  { id: 1, nombre_posicion: 'Pitcher' },
  { id: 2, nombre_posicion: 'Catcher' },
  { id: 3, nombre_posicion: 'Shortstop' },
];

const mockTeams = [
  { id: 7, nombre_equipo: 'Águilas' },
  { id: 8, nombre_equipo: 'Tigres' },
];

const baseFormData = {
  name: '',
  numero: '',
  telefono: '',
  email: '',
  equipoId: '',
};

const baseProps = {
  formData: baseFormData,
  onFormDataChange: vi.fn(),
  selectedPositions: [],
  onPositionToggle: vi.fn(),
  positions: mockPositions,
  teams: mockTeams,
  editingPlayer: null,
  loading: false,
  onSubmit: vi.fn(),
  onCancel: vi.fn(),
};

describe('PlayerForm', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('título según modo', () => {
    it('muestra "Registrar Nuevo Jugador" cuando es jugador nuevo', () => {
      render(<PlayerForm {...baseProps} />);
      expect(screen.getByText('Registrar Nuevo Jugador')).toBeInTheDocument();
    });

    it('muestra "Editar Jugador" cuando hay jugador en edición', () => {
      render(
        <PlayerForm {...baseProps} editingPlayer={{ id: 1, nombre: 'Juan' }} />
      );
      expect(screen.getByText('Editar Jugador')).toBeInTheDocument();
    });
  });

  describe('texto del botón de submit', () => {
    it('muestra "Registrar Jugador" en modo nuevo', () => {
      render(<PlayerForm {...baseProps} />);
      expect(
        screen.getByRole('button', { name: 'Registrar Jugador' })
      ).toBeInTheDocument();
    });

    it('muestra "Actualizar Jugador" en modo edición', () => {
      render(
        <PlayerForm {...baseProps} editingPlayer={{ id: 1 }} />
      );
      expect(
        screen.getByRole('button', { name: 'Actualizar Jugador' })
      ).toBeInTheDocument();
    });

    it('muestra "Registrando..." cuando loading en modo nuevo', () => {
      render(<PlayerForm {...baseProps} loading={true} />);
      expect(screen.getByRole('button', { name: 'Registrando...' })).toBeInTheDocument();
    });

    it('muestra "Actualizando..." cuando loading en modo edición', () => {
      render(
        <PlayerForm {...baseProps} editingPlayer={{ id: 1 }} loading={true} />
      );
      expect(screen.getByRole('button', { name: 'Actualizando...' })).toBeInTheDocument();
    });

    it('botón de submit deshabilitado cuando loading=true', () => {
      render(<PlayerForm {...baseProps} loading={true} />);
      expect(screen.getByRole('button', { name: 'Registrando...' })).toBeDisabled();
    });
  });

  describe('campos del formulario', () => {
    it('muestra los campos principales', () => {
      render(<PlayerForm {...baseProps} />);
      // Las etiquetas no usan htmlFor, se verifican por texto
      expect(screen.getByText('Nombre *')).toBeInTheDocument();
      expect(screen.getByText('Número *')).toBeInTheDocument();
      expect(screen.getByText('Teléfono')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('llama a onFormDataChange con "name" al cambiar el nombre', () => {
      const onFormDataChange = vi.fn();
      const { container } = render(
        <PlayerForm {...baseProps} onFormDataChange={onFormDataChange} />
      );
      fireEvent.change(container.querySelector('#playerName'), {
        target: { value: 'Pedro' },
      });
      expect(onFormDataChange).toHaveBeenCalledWith('name', 'Pedro');
    });

    it('llama a onFormDataChange con "numero" al cambiar el número', () => {
      const onFormDataChange = vi.fn();
      const { container } = render(
        <PlayerForm {...baseProps} onFormDataChange={onFormDataChange} />
      );
      fireEvent.change(container.querySelector('#playerNumber'), {
        target: { value: '7' },
      });
      expect(onFormDataChange).toHaveBeenCalledWith('numero', '7');
    });
  });

  describe('selector de equipo', () => {
    it('muestra los equipos disponibles en el select', () => {
      render(<PlayerForm {...baseProps} />);
      expect(screen.getByText('Águilas')).toBeInTheDocument();
      expect(screen.getByText('Tigres')).toBeInTheDocument();
    });

    it('muestra "Equipo seleccionado: X" cuando hay un equipo elegido', () => {
      // El componente usa ===, el id debe ser el mismo tipo (number)
      render(
        <PlayerForm {...baseProps} formData={{ ...baseFormData, equipoId: 7 }} />
      );
      expect(
        screen.getByText('Equipo seleccionado: Águilas')
      ).toBeInTheDocument();
    });

    it('no muestra "Equipo seleccionado" cuando no hay equipo elegido', () => {
      render(<PlayerForm {...baseProps} />);
      expect(screen.queryByText(/Equipo seleccionado/)).not.toBeInTheDocument();
    });

    it('llama a onFormDataChange con "equipoId" al cambiar el equipo', () => {
      const onFormDataChange = vi.fn();
      render(<PlayerForm {...baseProps} onFormDataChange={onFormDataChange} />);
      fireEvent.change(screen.getByRole('combobox'), { target: { value: '8' } });
      expect(onFormDataChange).toHaveBeenCalledWith('equipoId', '8');
    });
  });

  describe('posiciones', () => {
    it('muestra todas las posiciones como checkboxes', () => {
      render(<PlayerForm {...baseProps} />);
      expect(screen.getByText('Pitcher')).toBeInTheDocument();
      expect(screen.getByText('Catcher')).toBeInTheDocument();
      expect(screen.getByText('Shortstop')).toBeInTheDocument();
    });

    it('marca como checked las posiciones seleccionadas', () => {
      render(<PlayerForm {...baseProps} selectedPositions={[1, 3]} />);
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toBeChecked(); // Pitcher (id=1)
      expect(checkboxes[1]).not.toBeChecked(); // Catcher (id=2)
      expect(checkboxes[2]).toBeChecked(); // Shortstop (id=3)
    });

    it('llama a onPositionToggle con el id de la posición al hacer click', async () => {
      const onPositionToggle = vi.fn();
      const user = userEvent.setup();
      render(<PlayerForm {...baseProps} onPositionToggle={onPositionToggle} />);
      await user.click(screen.getByText('Pitcher'));
      expect(onPositionToggle).toHaveBeenCalledWith(1);
    });
  });

  describe('botones de acción', () => {
    it('llama a onCancel al hacer click en Cancelar', async () => {
      const onCancel = vi.fn();
      const user = userEvent.setup();
      render(<PlayerForm {...baseProps} onCancel={onCancel} />);
      await user.click(screen.getByRole('button', { name: 'Cancelar' }));
      expect(onCancel).toHaveBeenCalledOnce();
    });

    it('llama a onSubmit al enviar el formulario', () => {
      const onSubmit = vi.fn();
      const { container } = render(<PlayerForm {...baseProps} onSubmit={onSubmit} />);
      // Disparar submit directamente en el form para evitar validación HTML5
      fireEvent.submit(container.querySelector('form'));
      expect(onSubmit).toHaveBeenCalledOnce();
    });
  });
});

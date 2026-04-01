import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TeamForm from '../../components/Forms/TeamForm';

const baseProps = {
  showForm: true,
  name: '',
  inscripcion: '',
  onNameChange: vi.fn(),
  onInscripcionChange: vi.fn(),
  onSubmit: vi.fn(),
  loading: false,
  editingTeam: null,
  error: null,
};

describe('TeamForm', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('visibilidad', () => {
    it('no renderiza nada cuando showForm=false', () => {
      const { container } = render(<TeamForm {...baseProps} showForm={false} />);
      expect(container.firstChild).toBeNull();
    });

    it('renderiza el formulario cuando showForm=true', () => {
      render(<TeamForm {...baseProps} />);
      expect(screen.getByText('Crear Nuevo Equipo')).toBeInTheDocument();
    });
  });

  describe('título según modo', () => {
    it('muestra "Crear Nuevo Equipo" para equipo nuevo', () => {
      render(<TeamForm {...baseProps} />);
      expect(screen.getByText('Crear Nuevo Equipo')).toBeInTheDocument();
    });

    it('muestra "Editar Equipo" cuando hay equipo en edición', () => {
      render(<TeamForm {...baseProps} editingTeam={{ id: 1 }} />);
      expect(screen.getByText('Editar Equipo')).toBeInTheDocument();
    });
  });

  describe('texto del botón de submit', () => {
    it('muestra "Crear" en modo nuevo', () => {
      render(<TeamForm {...baseProps} />);
      expect(screen.getByRole('button', { name: /Crear/ })).toBeInTheDocument();
    });

    it('muestra "Actualizar" en modo edición', () => {
      render(<TeamForm {...baseProps} editingTeam={{ id: 1 }} />);
      expect(screen.getByRole('button', { name: /Actualizar/ })).toBeInTheDocument();
    });

    it('muestra "Creando..." cuando loading en modo nuevo', () => {
      render(<TeamForm {...baseProps} loading={true} />);
      expect(screen.getByText('Creando...')).toBeInTheDocument();
    });

    it('muestra "Actualizando..." cuando loading en modo edición', () => {
      render(<TeamForm {...baseProps} editingTeam={{ id: 1 }} loading={true} />);
      expect(screen.getByText('Actualizando...')).toBeInTheDocument();
    });

    it('botón de submit deshabilitado cuando loading=true', () => {
      render(<TeamForm {...baseProps} loading={true} />);
      expect(screen.getByRole('button', { name: /💾/ })).toBeDisabled();
    });
  });

  describe('campos del formulario', () => {
    it('muestra el campo Nombre del Equipo', () => {
      render(<TeamForm {...baseProps} />);
      expect(screen.getByPlaceholderText('Ej: Tigres del Norte')).toBeInTheDocument();
    });

    it('muestra el campo Monto de Inscripción', () => {
      render(<TeamForm {...baseProps} />);
      expect(screen.getByPlaceholderText('Ej: 1500.00')).toBeInTheDocument();
    });

    it('llama a onNameChange al cambiar el nombre', () => {
      const onNameChange = vi.fn();
      render(<TeamForm {...baseProps} onNameChange={onNameChange} />);
      fireEvent.change(screen.getByPlaceholderText('Ej: Tigres del Norte'), {
        target: { value: 'Leones' },
      });
      expect(onNameChange).toHaveBeenCalledOnce();
    });

    it('llama a onInscripcionChange al cambiar la inscripción', () => {
      const onInscripcionChange = vi.fn();
      render(<TeamForm {...baseProps} onInscripcionChange={onInscripcionChange} />);
      fireEvent.change(screen.getByPlaceholderText('Ej: 1500.00'), {
        target: { value: '1200' },
      });
      expect(onInscripcionChange).toHaveBeenCalledOnce();
    });

    it('refleja el valor actual del nombre en el input', () => {
      render(<TeamForm {...baseProps} name='Águilas' />);
      expect(screen.getByPlaceholderText('Ej: Tigres del Norte')).toHaveValue('Águilas');
    });

    it('refleja el valor actual de la inscripción en el input', () => {
      render(<TeamForm {...baseProps} inscripcion='1500' />);
      expect(screen.getByPlaceholderText('Ej: 1500.00')).toHaveValue(1500);
    });
  });

  describe('mensaje de error', () => {
    it('muestra el error cuando se provee', () => {
      render(<TeamForm {...baseProps} error='El nombre ya existe' />);
      expect(screen.getByText('El nombre ya existe')).toBeInTheDocument();
    });

    it('no muestra error cuando es null', () => {
      render(<TeamForm {...baseProps} error={null} />);
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });
  });

  describe('nota de inscripción opcional', () => {
    it('muestra el texto de ayuda sobre inscripción opcional', () => {
      render(<TeamForm {...baseProps} />);
      expect(
        screen.getByText(/Opcional: Deja vacío si no hay monto de inscripción/)
      ).toBeInTheDocument();
    });
  });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImportPlayersModal from '../../components/Modals/ImportPlayersModal';

const mockTeams = [
  { id: 7, nombre_equipo: 'Águilas' },
  { id: 8, nombre_equipo: 'Tigres' },
  { id: 9, nombre_equipo: 'Leones' },
];

const baseProps = {
  isOpen: true,
  teams: mockTeams,
  selectedTeam: '7',
  selectedTeamToImport: '',
  onTeamToImportChange: vi.fn(),
  importError: null,
  onImportErrorClose: vi.fn(),
  importingPlayers: false,
  onClose: vi.fn(),
  onImport: vi.fn(),
};

describe('ImportPlayersModal', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('visibilidad', () => {
    it('no renderiza cuando isOpen=false', () => {
      const { container } = render(<ImportPlayersModal {...baseProps} isOpen={false} />);
      expect(container.firstChild).toBeNull();
    });

    it('renderiza cuando isOpen=true', () => {
      render(<ImportPlayersModal {...baseProps} />);
      expect(
        screen.getByText('Importar Jugadores de Otro Equipo')
      ).toBeInTheDocument();
    });
  });

  describe('equipo actual', () => {
    it('muestra el nombre del equipo actual', () => {
      render(<ImportPlayersModal {...baseProps} />);
      expect(screen.getByText('Águilas')).toBeInTheDocument();
    });

    it('muestra "Sin equipo seleccionado" cuando selectedTeam no coincide', () => {
      render(<ImportPlayersModal {...baseProps} selectedTeam='99' />);
      expect(screen.getByText('Sin equipo seleccionado')).toBeInTheDocument();
    });
  });

  describe('selector de equipo a importar', () => {
    it('lista todos los equipos en el selector', () => {
      render(<ImportPlayersModal {...baseProps} />);
      const options = screen.getAllByRole('option');
      // 1 opción vacía + 3 equipos
      expect(options).toHaveLength(4);
    });

    it('marca el equipo actual con "(Equipo actual)" en el selector', () => {
      render(<ImportPlayersModal {...baseProps} />);
      expect(screen.getByText('Águilas (Equipo actual)')).toBeInTheDocument();
    });

    it('no marca otros equipos con "(Equipo actual)"', () => {
      render(<ImportPlayersModal {...baseProps} />);
      expect(screen.queryByText('Tigres (Equipo actual)')).not.toBeInTheDocument();
    });

    it('llama a onTeamToImportChange al cambiar la selección', () => {
      const onTeamToImportChange = vi.fn();
      render(
        <ImportPlayersModal
          {...baseProps}
          onTeamToImportChange={onTeamToImportChange}
        />
      );
      fireEvent.change(screen.getByRole('combobox'), { target: { value: '8' } });
      expect(onTeamToImportChange).toHaveBeenCalledWith('8');
    });

    it('el selector está deshabilitado cuando importingPlayers=true', () => {
      render(<ImportPlayersModal {...baseProps} importingPlayers={true} />);
      expect(screen.getByRole('combobox')).toBeDisabled();
    });

    it('muestra "No tienes equipos disponibles" cuando teams está vacío', () => {
      render(<ImportPlayersModal {...baseProps} teams={[]} />);
      expect(screen.getByText('No tienes equipos disponibles')).toBeInTheDocument();
    });
  });

  describe('mensaje de error', () => {
    it('muestra el error cuando se provee', () => {
      render(
        <ImportPlayersModal
          {...baseProps}
          importError='No se pudo importar: equipo inválido'
        />
      );
      expect(
        screen.getByText('No se pudo importar: equipo inválido')
      ).toBeInTheDocument();
    });

    it('no muestra error cuando importError es null', () => {
      render(<ImportPlayersModal {...baseProps} importError={null} />);
      expect(screen.queryByText(/No se pudo/)).not.toBeInTheDocument();
    });

    it('llama a onImportErrorClose al cerrar el error', async () => {
      const onImportErrorClose = vi.fn();
      const user = userEvent.setup();
      render(
        <ImportPlayersModal
          {...baseProps}
          importError='Error de prueba'
          onImportErrorClose={onImportErrorClose}
        />
      );
      await user.click(screen.getByTitle('Cerrar mensaje de error'));
      expect(onImportErrorClose).toHaveBeenCalledOnce();
    });
  });

  describe('botones de acción', () => {
    it('llama a onClose al hacer click en el botón de cerrar (×)', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      render(<ImportPlayersModal {...baseProps} onClose={onClose} />);
      await user.click(screen.getByTitle('Cerrar modal de importación'));
      expect(onClose).toHaveBeenCalledOnce();
    });

    it('llama a onClose al hacer click en Cancelar', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      render(<ImportPlayersModal {...baseProps} onClose={onClose} />);
      await user.click(screen.getByRole('button', { name: 'Cancelar' }));
      expect(onClose).toHaveBeenCalledOnce();
    });

    it('llama a onImport al hacer click en Importar Jugadores', async () => {
      const onImport = vi.fn();
      const user = userEvent.setup();
      render(
        <ImportPlayersModal
          {...baseProps}
          selectedTeamToImport='8'
          onImport={onImport}
        />
      );
      await user.click(screen.getByRole('button', { name: 'Importar Jugadores' }));
      expect(onImport).toHaveBeenCalledOnce();
    });

    it('botón Importar deshabilitado cuando no hay equipo seleccionado', () => {
      render(<ImportPlayersModal {...baseProps} selectedTeamToImport='' />);
      expect(
        screen.getByRole('button', { name: 'Importar Jugadores' })
      ).toBeDisabled();
    });

    it('botón Importar deshabilitado cuando importingPlayers=true', () => {
      render(
        <ImportPlayersModal
          {...baseProps}
          selectedTeamToImport='8'
          importingPlayers={true}
        />
      );
      expect(screen.getByRole('button', { name: 'Importando...' })).toBeDisabled();
    });

    it('botón Cancelar deshabilitado cuando importingPlayers=true', () => {
      render(<ImportPlayersModal {...baseProps} importingPlayers={true} />);
      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    });

    it('muestra "Importando..." cuando importingPlayers=true', () => {
      render(<ImportPlayersModal {...baseProps} importingPlayers={true} />);
      expect(screen.getByText('Importando...')).toBeInTheDocument();
    });
  });

  describe('nota informativa', () => {
    it('muestra la nota sobre deduplicación', () => {
      render(<ImportPlayersModal {...baseProps} />);
      expect(
        screen.getByText(/Los jugadores con el mismo nombre y número serán omitidos/)
      ).toBeInTheDocument();
    });
  });
});

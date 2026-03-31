import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SubstitutionModal from '../../components/Modals/SubstitutionModal';
import { mockPlayers, mockGame } from '../../test/fixtures';

// ─── helpers ───────────────────────────────────────────────────────────────

// Lineup activo: jugadores 1, 2 y 3 ya están en el campo
const mockActiveLineup = [
  { jugador_id: 1, nombre: 'Juan García', numero: '5', orden_bateo: 1, posicion_campo: 'SS' },
  { jugador_id: 2, nombre: 'Pedro López', numero: '10', orden_bateo: 2, posicion_campo: 'P' },
  { jugador_id: 3, nombre: 'Carlos Ruiz', numero: '23', orden_bateo: 3, posicion_campo: '1B' },
];

const buildProps = overrides => ({
  show: true,
  game: mockGame,
  players: mockPlayers, // incluye al id=4 (Miguel Soto), que no está en campo
  activeLineup: mockActiveLineup,
  onClose: vi.fn(),
  onSave: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

// Helpers para los selects del formulario
const getSaleSelect = () => screen.getAllByRole('combobox')[0];
const getEnterSelect = () => screen.getAllByRole('combobox')[1];
const getPosSelect = () => screen.getAllByRole('combobox')[2];
const getForm = () => getSaleSelect().closest('form');

// ─── suite ─────────────────────────────────────────────────────────────────

describe('SubstitutionModal — renderizado', () => {
  it('no monta nada cuando show=false', () => {
    const { container } = render(<SubstitutionModal {...buildProps({ show: false })} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('no monta nada cuando game es null', () => {
    const { container } = render(<SubstitutionModal {...buildProps({ game: null })} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('muestra el nombre del rival en el header', () => {
    render(<SubstitutionModal {...buildProps()} />);
    expect(screen.getByText(/Tigres/)).toBeInTheDocument();
  });

  it('el select "Jugador que sale" incluye los tres activos del lineup', () => {
    render(<SubstitutionModal {...buildProps()} />);
    // Opciones con formato "Bat #N — #NUM Nombre (POS)"
    expect(screen.getAllByText(/Juan García/, { selector: 'option' }).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Pedro López/, { selector: 'option' }).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Carlos Ruiz/, { selector: 'option' }).length).toBeGreaterThan(0);
  });

  it('el select "Jugador que entra" sólo contiene jugadores fuera del lineup', () => {
    render(<SubstitutionModal {...buildProps()} />);
    const enterSelect = getEnterSelect();
    const optionTexts = Array.from(enterSelect.options).map(o => o.textContent);
    // Miguel Soto (id=4) está disponible
    expect(optionTexts.some(t => t.includes('Miguel Soto'))).toBe(true);
    // Los del lineup no deben estar en "entra"
    expect(optionTexts.some(t => t.includes('Juan García'))).toBe(false);
    expect(optionTexts.some(t => t.includes('Pedro López'))).toBe(false);
    expect(optionTexts.some(t => t.includes('Carlos Ruiz'))).toBe(false);
  });

  it('muestra mensaje cuando no hay jugadores disponibles para entrar', () => {
    const allInField = mockPlayers.map((p, i) => ({
      jugador_id: p.id, nombre: p.nombre, numero: p.numero,
      orden_bateo: i + 1, posicion_campo: 'P',
    }));
    render(<SubstitutionModal {...buildProps({ activeLineup: allInField })} />);
    expect(screen.getByText(/No hay jugadores disponibles/i)).toBeInTheDocument();
  });
});

describe('SubstitutionModal — herencia de posición', () => {
  it('hereda la posición del jugador que sale al seleccionarlo', async () => {
    render(<SubstitutionModal {...buildProps()} />);
    fireEvent.change(getSaleSelect(), { target: { value: '1' } }); // Juan García → SS
    await waitFor(() => expect(getPosSelect().value).toBe('SS'));
  });

  it('hereda la posición P al seleccionar al pitcher', async () => {
    render(<SubstitutionModal {...buildProps()} />);
    fireEvent.change(getSaleSelect(), { target: { value: '2' } }); // Pedro López → P
    await waitFor(() => expect(getPosSelect().value).toBe('P'));
  });
});

describe('SubstitutionModal — envío del formulario', () => {
  beforeEach(() => vi.clearAllMocks());

  it('el botón Registrar está deshabilitado si no hay jugadores disponibles', () => {
    const allInField = mockPlayers.map((p, i) => ({
      jugador_id: p.id, nombre: p.nombre, numero: p.numero,
      orden_bateo: i + 1, posicion_campo: 'P',
    }));
    render(<SubstitutionModal {...buildProps({ activeLineup: allInField })} />);
    expect(screen.getByRole('button', { name: /Registrar/i })).toBeDisabled();
  });

  it('envía onSave con los datos correctos al hacer submit', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    render(<SubstitutionModal {...buildProps({ onSave, onClose })} />);

    // Juan García sale (SS, turno 1); Miguel Soto entra
    fireEvent.change(getSaleSelect(), { target: { value: '1' } });
    fireEvent.change(getEnterSelect(), { target: { value: '4' } });
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '3' } });
    fireEvent.submit(getForm());

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        mockGame.id,
        mockGame.equipo_id,
        expect.objectContaining({
          jugador_sale_id: '1',
          jugador_entra_id: '4',
          inning: 3,
          orden_bateo: 1,   // hereda del turno de Juan García
          posicion_campo: 'SS', // hereda posición
        })
      );
    });
  });

  it('cierra el modal después de un submit exitoso', async () => {
    const onClose = vi.fn();
    render(<SubstitutionModal {...buildProps({ onClose })} />);

    fireEvent.change(getSaleSelect(), { target: { value: '1' } });
    fireEvent.change(getEnterSelect(), { target: { value: '4' } });
    fireEvent.submit(getForm());

    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });

  it('no llama a onSave si falta jugador que sale', async () => {
    const onSave = vi.fn();
    render(<SubstitutionModal {...buildProps({ onSave })} />);

    // Solo el que entra, jugador_sale vacío
    fireEvent.change(getEnterSelect(), { target: { value: '4' } });
    fireEvent.submit(getForm());

    await waitFor(() => expect(onSave).not.toHaveBeenCalled());
  });

  it('no llama a onSave si falta jugador que entra', async () => {
    const onSave = vi.fn();
    render(<SubstitutionModal {...buildProps({ onSave })} />);

    // Solo el que sale, jugador_entra vacío
    fireEvent.change(getSaleSelect(), { target: { value: '1' } });
    fireEvent.submit(getForm());

    await waitFor(() => expect(onSave).not.toHaveBeenCalled());
  });

  it('resetea el formulario al cerrar y volver a abrir', () => {
    const { rerender } = render(<SubstitutionModal {...buildProps()} />);

    fireEvent.change(getSaleSelect(), { target: { value: '1' } });
    expect(getSaleSelect()).toHaveValue('1');

    rerender(<SubstitutionModal {...buildProps({ show: false })} />);
    rerender(<SubstitutionModal {...buildProps({ show: true })} />);

    expect(getSaleSelect()).toHaveValue('');
  });

  it('"Cancelar" llama a onClose sin llamar a onSave', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onClose = vi.fn();
    render(<SubstitutionModal {...buildProps({ onSave, onClose })} />);

    await user.click(screen.getByRole('button', { name: /Cancelar/i }));

    expect(onClose).toHaveBeenCalledOnce();
    expect(onSave).not.toHaveBeenCalled();
  });
});

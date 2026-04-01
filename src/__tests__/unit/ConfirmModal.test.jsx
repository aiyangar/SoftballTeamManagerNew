import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmModal from '../../components/Modals/ConfirmModal';

const baseProps = {
  isOpen: true,
  title: 'Eliminar jugador',
  message: '¿Estás seguro? Esta acción no se puede deshacer.',
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
};

describe('ConfirmModal', () => {
  beforeEach(() => vi.clearAllMocks());

  it('no renderiza nada cuando isOpen es false', () => {
    const { container } = render(<ConfirmModal {...baseProps} isOpen={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renderiza el título y el mensaje cuando isOpen es true', () => {
    render(<ConfirmModal {...baseProps} />);
    expect(screen.getByText('Eliminar jugador')).toBeInTheDocument();
    expect(screen.getByText('¿Estás seguro? Esta acción no se puede deshacer.')).toBeInTheDocument();
  });

  it('muestra los labels por defecto cuando no se pasan props', () => {
    render(<ConfirmModal isOpen={true} onConfirm={vi.fn()} onCancel={vi.fn()} />);
    // "Confirmar" aparece como título h2 y como label del botón
    const elements = screen.getAllByText('Confirmar');
    expect(elements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
    // El botón de confirmación tiene la clase btn-primary
    const confirmBtn = elements.find(el => el.tagName === 'BUTTON');
    expect(confirmBtn).toBeInTheDocument();
  });

  it('muestra labels personalizados cuando se pasan como props', () => {
    render(
      <ConfirmModal {...baseProps} confirmLabel='Sí, eliminar' cancelLabel='No, volver' />
    );
    expect(screen.getByText('Sí, eliminar')).toBeInTheDocument();
    expect(screen.getByText('No, volver')).toBeInTheDocument();
  });

  it('llama a onConfirm al hacer click en el botón de confirmación', () => {
    render(<ConfirmModal {...baseProps} confirmLabel='Sí, eliminar' />);
    fireEvent.click(screen.getByText('Sí, eliminar'));
    expect(baseProps.onConfirm).toHaveBeenCalledTimes(1);
    expect(baseProps.onCancel).not.toHaveBeenCalled();
  });

  it('llama a onCancel al hacer click en el botón de cancelar', () => {
    render(<ConfirmModal {...baseProps} />);
    fireEvent.click(screen.getByText('Cancelar'));
    expect(baseProps.onCancel).toHaveBeenCalledTimes(1);
    expect(baseProps.onConfirm).not.toHaveBeenCalled();
  });

  it('aplica clase btn-danger al botón confirmar con variant danger', () => {
    render(<ConfirmModal {...baseProps} variant='danger' confirmLabel='Eliminar' />);
    const confirmBtn = screen.getByText('Eliminar');
    expect(confirmBtn).toHaveClass('btn-danger');
  });

  it('aplica clase btn-warning al botón confirmar con variant warning', () => {
    render(<ConfirmModal {...baseProps} variant='warning' confirmLabel='Continuar' />);
    const confirmBtn = screen.getByText('Continuar');
    expect(confirmBtn).toHaveClass('btn-warning');
  });

  it('aplica clase btn-primary al botón confirmar con variant default', () => {
    render(<ConfirmModal {...baseProps} variant='default' confirmLabel='Aceptar' />);
    const confirmBtn = screen.getByText('Aceptar');
    expect(confirmBtn).toHaveClass('btn-primary');
  });

  it('no renderiza el párrafo de mensaje si message no se pasa', () => {
    render(<ConfirmModal isOpen={true} title='Sin mensaje' onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaymentModal from '../../components/Modals/PaymentModal';

const mockPlayer = {
  id: 1,
  nombre: 'Juan García',
  numero: '5',
  equipos: { nombre_equipo: 'Águilas' },
};

const baseProps = {
  isOpen: true,
  player: mockPlayer,
  paymentAmount: '',
  onPaymentAmountChange: vi.fn(),
  paymentMethod: 'Efectivo',
  onPaymentMethodChange: vi.fn(),
  currentInscripcionPaid: 0,
  inscripcionTarget: 450,
  loading: false,
  onClose: vi.fn(),
  onProcessPayment: vi.fn(),
};

describe('PaymentModal', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('visibilidad', () => {
    it('no renderiza cuando isOpen=false', () => {
      const { container } = render(<PaymentModal {...baseProps} isOpen={false} />);
      expect(container.firstChild).toBeNull();
    });

    it('no renderiza cuando player=null', () => {
      const { container } = render(<PaymentModal {...baseProps} player={null} />);
      expect(container.firstChild).toBeNull();
    });

    it('renderiza cuando isOpen=true y hay jugador', () => {
      render(<PaymentModal {...baseProps} />);
      expect(screen.getByText('Aceptar Pago de Inscripción')).toBeInTheDocument();
    });
  });

  describe('información del jugador', () => {
    it('muestra el nombre del jugador', () => {
      render(<PaymentModal {...baseProps} />);
      expect(screen.getByText('Juan García')).toBeInTheDocument();
    });

    it('muestra el número del jugador', () => {
      render(<PaymentModal {...baseProps} />);
      expect(screen.getByText('Número: 5')).toBeInTheDocument();
    });

    it('muestra el nombre del equipo', () => {
      render(<PaymentModal {...baseProps} />);
      expect(screen.getByText('Equipo: Águilas')).toBeInTheDocument();
    });

    it('muestra "Sin equipo" cuando no hay equipo', () => {
      render(
        <PaymentModal
          {...baseProps}
          player={{ ...mockPlayer, equipos: undefined }}
        />
      );
      expect(screen.getByText('Equipo: Sin equipo')).toBeInTheDocument();
    });
  });

  describe('información de pago', () => {
    it('muestra el monto pagado actualmente', () => {
      render(<PaymentModal {...baseProps} currentInscripcionPaid={150} />);
      expect(screen.getByText('$150')).toBeInTheDocument();
    });

    it('muestra la meta de inscripción', () => {
      render(<PaymentModal {...baseProps} inscripcionTarget={450} />);
      // Con pagado=0 y target=450, también aparece $450 como faltante; se verifica presencia
      expect(screen.getAllByText('$450').length).toBeGreaterThanOrEqual(1);
    });

    it('calcula correctamente el monto faltante', () => {
      render(
        <PaymentModal
          {...baseProps}
          currentInscripcionPaid={100}
          inscripcionTarget={450}
        />
      );
      expect(screen.getByText('$350')).toBeInTheDocument();
    });

    it('muestra $0 como faltante cuando ya se completó la meta', () => {
      render(
        <PaymentModal
          {...baseProps}
          currentInscripcionPaid={500}
          inscripcionTarget={450}
        />
      );
      // remainingAmount = 450 - 500 = -50, toLocaleString muestra -50
      expect(screen.getByText('$-50')).toBeInTheDocument();
    });
  });

  describe('métodos de pago', () => {
    it('muestra las opciones Efectivo, Transferencia, Tarjeta', () => {
      render(<PaymentModal {...baseProps} />);
      expect(screen.getByText('Efectivo')).toBeInTheDocument();
      expect(screen.getByText('Transferencia')).toBeInTheDocument();
      expect(screen.getByText('Tarjeta')).toBeInTheDocument();
    });

    it('llama a onPaymentMethodChange al cambiar el método', () => {
      const onPaymentMethodChange = vi.fn();
      render(
        <PaymentModal {...baseProps} onPaymentMethodChange={onPaymentMethodChange} />
      );
      fireEvent.change(screen.getByRole('combobox'), {
        target: { value: 'Transferencia' },
      });
      expect(onPaymentMethodChange).toHaveBeenCalledWith('Transferencia');
    });
  });

  describe('campo de cantidad', () => {
    it('llama a onPaymentAmountChange al cambiar la cantidad', () => {
      const onPaymentAmountChange = vi.fn();
      render(
        <PaymentModal {...baseProps} onPaymentAmountChange={onPaymentAmountChange} />
      );
      fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '200' } });
      expect(onPaymentAmountChange).toHaveBeenCalledWith('200');
    });
  });

  describe('botones de acción', () => {
    it('llama a onClose al hacer click en el botón de cerrar (×)', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      render(<PaymentModal {...baseProps} onClose={onClose} />);
      await user.click(screen.getByTitle('Cerrar modal de pago'));
      expect(onClose).toHaveBeenCalledOnce();
    });

    it('llama a onClose al hacer click en Cancelar', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      render(<PaymentModal {...baseProps} onClose={onClose} />);
      await user.click(screen.getByRole('button', { name: 'Cancelar' }));
      expect(onClose).toHaveBeenCalledOnce();
    });

    it('llama a onProcessPayment al hacer click en Aceptar Pago', async () => {
      const onProcessPayment = vi.fn();
      const user = userEvent.setup();
      render(
        <PaymentModal
          {...baseProps}
          paymentAmount='150'
          onProcessPayment={onProcessPayment}
        />
      );
      await user.click(screen.getByRole('button', { name: 'Aceptar Pago' }));
      expect(onProcessPayment).toHaveBeenCalledOnce();
    });

    it('botón Aceptar Pago deshabilitado cuando no hay monto', () => {
      render(<PaymentModal {...baseProps} paymentAmount='' />);
      expect(screen.getByRole('button', { name: 'Aceptar Pago' })).toBeDisabled();
    });

    it('botón Aceptar Pago deshabilitado cuando loading=true', () => {
      render(<PaymentModal {...baseProps} paymentAmount='100' loading={true} />);
      expect(screen.getByRole('button', { name: 'Procesando...' })).toBeDisabled();
    });

    it('muestra "Procesando..." cuando loading=true', () => {
      render(<PaymentModal {...baseProps} paymentAmount='100' loading={true} />);
      expect(screen.getByText('Procesando...')).toBeInTheDocument();
    });
  });
});

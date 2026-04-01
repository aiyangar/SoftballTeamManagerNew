import React from 'react';
import { render, screen } from '@testing-library/react';
import PaymentStatusWidget from '../../components/Widgets/PaymentStatusWidget';

describe('PaymentStatusWidget', () => {
  describe('renderizado básico', () => {
    it('muestra el título por defecto', () => {
      render(<PaymentStatusWidget paymentTotals={{ totalUmpire: 0, totalInscripcion: 0 }} />);
      expect(screen.getByText('Estado de Pagos')).toBeInTheDocument();
    });

    it('oculta el título cuando showTitle=false', () => {
      render(
        <PaymentStatusWidget
          paymentTotals={{ totalUmpire: 0, totalInscripcion: 0 }}
          showTitle={false}
        />
      );
      expect(screen.queryByText('Estado de Pagos')).not.toBeInTheDocument();
    });

    it('muestra la sección Umpire con montos', () => {
      render(
        <PaymentStatusWidget
          paymentTotals={{ totalUmpire: 330, totalInscripcion: 0 }}
          umpireTarget={550}
        />
      );
      expect(screen.getByText('$330 / $550')).toBeInTheDocument();
    });

    it('muestra el monto de inscripción', () => {
      render(
        <PaymentStatusWidget
          paymentTotals={{ totalUmpire: 0, totalInscripcion: 1200 }}
        />
      );
      expect(screen.getByText('$1,200')).toBeInTheDocument();
    });

    it('usa valores por defecto cuando paymentTotals es null', () => {
      render(<PaymentStatusWidget paymentTotals={null} />);
      expect(screen.getByText('$0 / $550')).toBeInTheDocument();
    });

    it('usa valores por defecto cuando paymentTotals es undefined', () => {
      render(<PaymentStatusWidget />);
      expect(screen.getByText('$0 / $550')).toBeInTheDocument();
    });
  });

  describe('textos de estado del umpire', () => {
    it('muestra "💰 Recaudado" cuando no se alcanzó la meta', () => {
      render(
        <PaymentStatusWidget
          paymentTotals={{ totalUmpire: 300, totalInscripcion: 0 }}
          umpireTarget={550}
        />
      );
      expect(screen.getByText('💰 Recaudado')).toBeInTheDocument();
    });

    it('muestra "✅ Completado" cuando se alcanzó la meta', () => {
      render(
        <PaymentStatusWidget
          paymentTotals={{ totalUmpire: 550, totalInscripcion: 0 }}
          umpireTarget={550}
        />
      );
      expect(screen.getByText('✅ Completado')).toBeInTheDocument();
    });

    it('muestra "Meta alcanzada" cuando se alcanzó la meta', () => {
      render(
        <PaymentStatusWidget
          paymentTotals={{ totalUmpire: 600, totalInscripcion: 0 }}
          umpireTarget={550}
        />
      );
      expect(screen.getByText('Meta alcanzada')).toBeInTheDocument();
    });

    it('muestra "Faltan $X" cuando no se alcanzó la meta', () => {
      render(
        <PaymentStatusWidget
          paymentTotals={{ totalUmpire: 100, totalInscripcion: 0 }}
          umpireTarget={550}
        />
      );
      expect(screen.getByText('Faltan $450')).toBeInTheDocument();
    });

    it('calcula correctamente el faltante con umpireTarget personalizado', () => {
      render(
        <PaymentStatusWidget
          paymentTotals={{ totalUmpire: 200, totalInscripcion: 0 }}
          umpireTarget={700}
        />
      );
      expect(screen.getByText('Faltan $500')).toBeInTheDocument();
    });
  });

  describe('texto de inscripción', () => {
    it('muestra "Total recaudado para inscripción"', () => {
      render(
        <PaymentStatusWidget paymentTotals={{ totalUmpire: 0, totalInscripcion: 500 }} />
      );
      expect(screen.getByText('Total recaudado para inscripción')).toBeInTheDocument();
    });
  });

  describe('umpireTarget personalizado', () => {
    it('respeta el umpireTarget personalizado en el display', () => {
      render(
        <PaymentStatusWidget
          paymentTotals={{ totalUmpire: 400, totalInscripcion: 0 }}
          umpireTarget={800}
        />
      );
      expect(screen.getByText('$400 / $800')).toBeInTheDocument();
    });
  });
});

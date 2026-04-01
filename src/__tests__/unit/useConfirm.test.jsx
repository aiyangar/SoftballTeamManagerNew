import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { useConfirm } from '../../hooks/useConfirm';
import ConfirmModal from '../../components/Modals/ConfirmModal';

describe('useConfirm', () => {
  it('confirmProps.isOpen comienza en false', () => {
    const { result } = renderHook(() => useConfirm());
    expect(result.current.confirmProps.isOpen).toBe(false);
  });

  it('confirm() abre el modal con las opciones pasadas', async () => {
    const { result } = renderHook(() => useConfirm());

    act(() => {
      result.current.confirm({
        title: 'Eliminar',
        message: '¿Confirmar?',
        confirmLabel: 'Sí',
        variant: 'danger',
      });
    });

    expect(result.current.confirmProps.isOpen).toBe(true);
    expect(result.current.confirmProps.title).toBe('Eliminar');
    expect(result.current.confirmProps.message).toBe('¿Confirmar?');
    expect(result.current.confirmProps.confirmLabel).toBe('Sí');
    expect(result.current.confirmProps.variant).toBe('danger');
  });

  it('onConfirm resuelve la promesa con true y cierra el modal', async () => {
    const { result } = renderHook(() => useConfirm());

    let resolvedValue;
    await act(async () => {
      result.current.confirm({ title: 'Test' }).then(v => { resolvedValue = v; });
    });

    expect(result.current.confirmProps.isOpen).toBe(true);

    await act(async () => {
      result.current.confirmProps.onConfirm();
    });

    expect(resolvedValue).toBe(true);
    expect(result.current.confirmProps.isOpen).toBe(false);
  });

  it('onCancel resuelve la promesa con false y cierra el modal', async () => {
    const { result } = renderHook(() => useConfirm());

    let resolvedValue;
    await act(async () => {
      result.current.confirm({ title: 'Test' }).then(v => { resolvedValue = v; });
    });

    await act(async () => {
      result.current.confirmProps.onCancel();
    });

    expect(resolvedValue).toBe(false);
    expect(result.current.confirmProps.isOpen).toBe(false);
  });

  it('integración: ConfirmModal + useConfirm funcionan juntos', async () => {
    const TestComponent = ({ onResult }) => {
      const { confirmProps, confirm } = useConfirm();
      return (
        <>
          <button onClick={async () => {
            const result = await confirm({ title: 'Borrar', message: '¿Seguro?', confirmLabel: 'Sí, borrar' });
            onResult(result);
          }}>
            Abrir
          </button>
          <ConfirmModal {...confirmProps} />
        </>
      );
    };

    const onResult = vi.fn();
    render(<TestComponent onResult={onResult} />);

    // Modal no visible al inicio
    expect(screen.queryByText('Borrar')).not.toBeInTheDocument();

    // Click en "Abrir" → modal aparece
    await act(async () => { fireEvent.click(screen.getByText('Abrir')); });
    expect(screen.getByText('Borrar')).toBeInTheDocument();
    expect(screen.getByText('¿Seguro?')).toBeInTheDocument();

    // Click en "Sí, borrar" → promesa resuelve true
    await act(async () => { fireEvent.click(screen.getByText('Sí, borrar')); });
    expect(onResult).toHaveBeenCalledWith(true);
    expect(screen.queryByText('Borrar')).not.toBeInTheDocument();
  });

  it('integración: cancelar desde el modal resuelve false', async () => {
    const TestComponent = ({ onResult }) => {
      const { confirmProps, confirm } = useConfirm();
      return (
        <>
          <button onClick={async () => {
            const result = await confirm({ title: 'Prueba' });
            onResult(result);
          }}>Abrir</button>
          <ConfirmModal {...confirmProps} />
        </>
      );
    };

    const onResult = vi.fn();
    render(<TestComponent onResult={onResult} />);
    await act(async () => { fireEvent.click(screen.getByText('Abrir')); });
    await act(async () => { fireEvent.click(screen.getByText('Cancelar')); });
    expect(onResult).toHaveBeenCalledWith(false);
  });
});

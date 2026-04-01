import { renderHook } from '@testing-library/react';
import { useToast } from '../../hooks/useToast';

vi.mock('react-hot-toast', () => ({
  default: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

import toast from 'react-hot-toast';

describe('useToast', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devuelve las tres funciones', () => {
    const { result } = renderHook(() => useToast());
    expect(typeof result.current.success).toBe('function');
    expect(typeof result.current.error).toBe('function');
    expect(typeof result.current.info).toBe('function');
  });

  it('success llama a toast.success con el mensaje', () => {
    const { result } = renderHook(() => useToast());
    result.current.success('Jugador creado');
    expect(toast.success).toHaveBeenCalledWith('Jugador creado');
    expect(toast.success).toHaveBeenCalledTimes(1);
  });

  it('error llama a toast.error con el mensaje', () => {
    const { result } = renderHook(() => useToast());
    result.current.error('Error de red');
    expect(toast.error).toHaveBeenCalledWith('Error de red');
    expect(toast.error).toHaveBeenCalledTimes(1);
  });

  it('info llama a toast (base) con el mensaje', () => {
    const { result } = renderHook(() => useToast());
    result.current.info('Información');
    expect(toast).toHaveBeenCalledWith('Información');
  });

  it('success y error son independientes entre sí', () => {
    const { result } = renderHook(() => useToast());
    result.current.success('ok');
    result.current.error('fail');
    expect(toast.success).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledTimes(1);
  });
});

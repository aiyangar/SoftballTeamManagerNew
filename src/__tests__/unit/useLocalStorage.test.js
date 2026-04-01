import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('retorna el valor por defecto cuando no hay nada en localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test_key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('retorna el valor almacenado si ya existe en localStorage', () => {
    localStorage.setItem('test_key', JSON.stringify('stored'));
    const { result } = renderHook(() => useLocalStorage('test_key', 'default'));
    expect(result.current[0]).toBe('stored');
  });

  it('actualiza el valor y lo persiste en localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test_key', ''));
    act(() => result.current[1]('nuevo valor'));
    expect(result.current[0]).toBe('nuevo valor');
    expect(JSON.parse(localStorage.getItem('test_key'))).toBe('nuevo valor');
  });

  it('acepta un objeto como valor por defecto', () => {
    const defaultFilters = { nombre: '', posiciones: [] };
    const { result } = renderHook(() => useLocalStorage('filters', defaultFilters));
    expect(result.current[0]).toEqual(defaultFilters);
  });

  it('persiste y recupera correctamente un objeto', () => {
    const { result } = renderHook(() => useLocalStorage('filters', {}));
    act(() => result.current[1]({ nombre: 'Juan', posiciones: ['Pitcher'] }));
    expect(result.current[0]).toEqual({ nombre: 'Juan', posiciones: ['Pitcher'] });
    expect(JSON.parse(localStorage.getItem('filters'))).toEqual({ nombre: 'Juan', posiciones: ['Pitcher'] });
  });

  it('acepta función como nuevo valor (forma funcional)', () => {
    const { result } = renderHook(() => useLocalStorage('count', 0));
    act(() => result.current[1](prev => prev + 1));
    expect(result.current[0]).toBe(1);
  });

  it('dos hooks con distinta clave son independientes', () => {
    const { result: r1 } = renderHook(() => useLocalStorage('key1', 'a'));
    const { result: r2 } = renderHook(() => useLocalStorage('key2', 'b'));
    act(() => r1.current[1]('X'));
    expect(r1.current[0]).toBe('X');
    expect(r2.current[0]).toBe('b');
  });

  it('persiste boolean false correctamente (no confunde con null)', () => {
    const { result } = renderHook(() => useLocalStorage('show', true));
    act(() => result.current[1](false));
    expect(result.current[0]).toBe(false);
    expect(JSON.parse(localStorage.getItem('show'))).toBe(false);
  });

  it('recupera false desde localStorage sin caer al default', () => {
    localStorage.setItem('show', JSON.stringify(false));
    const { result } = renderHook(() => useLocalStorage('show', true));
    expect(result.current[0]).toBe(false);
  });

  it('recupera array vacío correctamente', () => {
    localStorage.setItem('list', JSON.stringify([]));
    const { result } = renderHook(() => useLocalStorage('list', ['default']));
    expect(result.current[0]).toEqual([]);
  });

  it('usa el default si el valor en localStorage está corrupto (JSON inválido)', () => {
    localStorage.setItem('corrupted', 'not-valid-json{{{');
    const { result } = renderHook(() => useLocalStorage('corrupted', 'fallback'));
    expect(result.current[0]).toBe('fallback');
  });

  // Verifica integración con los filtros de Players (caso de uso real)
  describe('integración con players_filters', () => {
    const DEFAULT_FILTERS = {
      nombre: '',
      numero: '',
      posiciones: [],
      posicionMatchType: 'any',
    };

    it('persiste filtros de jugadores entre montajes del hook', () => {
      const { result, unmount } = renderHook(() =>
        useLocalStorage('players_filters', DEFAULT_FILTERS)
      );

      act(() => result.current[1]({ ...DEFAULT_FILTERS, nombre: 'Carlos', posiciones: ['Catcher'] }));
      unmount();

      // Simula remontaje (nueva instancia del hook)
      const { result: result2 } = renderHook(() =>
        useLocalStorage('players_filters', DEFAULT_FILTERS)
      );
      expect(result2.current[0].nombre).toBe('Carlos');
      expect(result2.current[0].posiciones).toEqual(['Catcher']);
    });

    it('limpiar filtros persiste el estado vacío', () => {
      localStorage.setItem('players_filters', JSON.stringify({ ...DEFAULT_FILTERS, nombre: 'Ana' }));
      const { result } = renderHook(() =>
        useLocalStorage('players_filters', DEFAULT_FILTERS)
      );

      act(() => result.current[1](DEFAULT_FILTERS));

      expect(result.current[0]).toEqual(DEFAULT_FILTERS);
      expect(JSON.parse(localStorage.getItem('players_filters'))).toEqual(DEFAULT_FILTERS);
    });
  });
});

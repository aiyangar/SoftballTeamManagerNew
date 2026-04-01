/**
 * Pruebas de integración: Filtros persistentes en Players (Fase C)
 *
 * Verifica que useLocalStorage integrado con Players guarda y recupera
 * correctamente los filtros entre ciclos de montaje/desmontaje del hook.
 *
 * Nota: estas pruebas ejercitan el hook directamente con las claves exactas
 * que usa Players.jsx ('players_filters', 'players_show_filters') para
 * simular el comportamiento real sin tener que montar la página completa.
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const DEFAULT_FILTERS = {
  nombre: '',
  numero: '',
  posiciones: [],
  posicionMatchType: 'any',
};

describe('Integración: filtros persistentes de jugadores (Fase C)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('los filtros empiezan en el estado por defecto si localStorage está vacío', () => {
    const { result } = renderHook(() =>
      useLocalStorage('players_filters', DEFAULT_FILTERS)
    );
    expect(result.current[0]).toEqual(DEFAULT_FILTERS);
  });

  it('filtrar por nombre persiste en localStorage inmediatamente', () => {
    const { result } = renderHook(() =>
      useLocalStorage('players_filters', DEFAULT_FILTERS)
    );

    act(() => result.current[1]({ ...DEFAULT_FILTERS, nombre: 'Carlos' }));

    const stored = JSON.parse(localStorage.getItem('players_filters'));
    expect(stored.nombre).toBe('Carlos');
  });

  it('los filtros sobreviven al desmontaje y remontaje del hook (simula navegar y volver)', () => {
    const { result: r1, unmount } = renderHook(() =>
      useLocalStorage('players_filters', DEFAULT_FILTERS)
    );

    act(() =>
      r1.current[1]({
        nombre: 'Juan',
        numero: '7',
        posiciones: ['Pitcher', 'Catcher'],
        posicionMatchType: 'all',
      })
    );

    unmount(); // Simula salir de la página Players

    const { result: r2 } = renderHook(() =>
      useLocalStorage('players_filters', DEFAULT_FILTERS)
    );

    // Simula volver a la página Players
    expect(r2.current[0].nombre).toBe('Juan');
    expect(r2.current[0].numero).toBe('7');
    expect(r2.current[0].posiciones).toEqual(['Pitcher', 'Catcher']);
    expect(r2.current[0].posicionMatchType).toBe('all');
  });

  it('showFilters persiste entre montajes (el panel de filtros queda abierto si así estaba)', () => {
    const { result: r1, unmount } = renderHook(() =>
      useLocalStorage('players_show_filters', false)
    );

    act(() => r1.current[1](true));
    expect(r1.current[0]).toBe(true);
    unmount();

    const { result: r2 } = renderHook(() =>
      useLocalStorage('players_show_filters', false)
    );
    expect(r2.current[0]).toBe(true);
  });

  it('los filtros y la visibilidad del panel son claves independientes', () => {
    const { result: filters } = renderHook(() =>
      useLocalStorage('players_filters', DEFAULT_FILTERS)
    );
    const { result: showFilters } = renderHook(() =>
      useLocalStorage('players_show_filters', false)
    );

    act(() => filters.current[1]({ ...DEFAULT_FILTERS, nombre: 'Ana' }));
    act(() => showFilters.current[1](true));

    expect(filters.current[0].nombre).toBe('Ana');
    expect(showFilters.current[0]).toBe(true);
    // Cambiar uno no afecta al otro
    act(() => showFilters.current[1](false));
    expect(filters.current[0].nombre).toBe('Ana');
  });

  it('limpiar filtros persiste el estado vacío y lo recupera en remontaje', () => {
    // Prerrequisito: hay filtros aplicados
    localStorage.setItem(
      'players_filters',
      JSON.stringify({ ...DEFAULT_FILTERS, nombre: 'Test', posiciones: ['1B'] })
    );

    const { result } = renderHook(() =>
      useLocalStorage('players_filters', DEFAULT_FILTERS)
    );

    // Simula el botón "Limpiar filtros"
    act(() => result.current[1](DEFAULT_FILTERS));

    expect(result.current[0]).toEqual(DEFAULT_FILTERS);

    // Verificar que el reseteo también se persiste
    const stored = JSON.parse(localStorage.getItem('players_filters'));
    expect(stored).toEqual(DEFAULT_FILTERS);
  });

  it('actualizar solo posicionMatchType no pierde los demás filtros', () => {
    const initialFilters = {
      nombre: 'Carlos',
      numero: '10',
      posiciones: ['Pitcher'],
      posicionMatchType: 'any',
    };

    const { result } = renderHook(() =>
      useLocalStorage('players_filters', DEFAULT_FILTERS)
    );

    act(() => result.current[1](initialFilters));
    act(() =>
      result.current[1](prev => ({ ...prev, posicionMatchType: 'all' }))
    );

    expect(result.current[0].nombre).toBe('Carlos');
    expect(result.current[0].numero).toBe('10');
    expect(result.current[0].posiciones).toEqual(['Pitcher']);
    expect(result.current[0].posicionMatchType).toBe('all');
  });

  it('agregar posición a un array existente usando la forma funcional', () => {
    const { result } = renderHook(() =>
      useLocalStorage('players_filters', DEFAULT_FILTERS)
    );

    act(() =>
      result.current[1]({ ...DEFAULT_FILTERS, posiciones: ['Pitcher'] })
    );

    act(() =>
      result.current[1](prev => ({
        ...prev,
        posiciones: [...prev.posiciones, 'Catcher'],
      }))
    );

    expect(result.current[0].posiciones).toEqual(['Pitcher', 'Catcher']);
    const stored = JSON.parse(localStorage.getItem('players_filters'));
    expect(stored.posiciones).toEqual(['Pitcher', 'Catcher']);
  });
});

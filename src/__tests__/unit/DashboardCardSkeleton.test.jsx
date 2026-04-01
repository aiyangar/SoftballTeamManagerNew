import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DashboardCardSkeleton from '../../components/Cards/DashboardCardSkeleton';

describe('DashboardCardSkeleton', () => {
  it('renderiza sin errores', () => {
    const { container } = render(<DashboardCardSkeleton />);
    expect(container.firstChild).toBeTruthy();
  });

  it('el contenedor raíz es un div', () => {
    const { container } = render(<DashboardCardSkeleton />);
    expect(container.firstChild.tagName).toBe('DIV');
  });

  it('tiene la clase min-h-[18rem] para coincidir con DashboardCard real', () => {
    const { container } = render(<DashboardCardSkeleton />);
    expect(container.firstChild.className).toContain('min-h-[18rem]');
  });

  it('tiene diseño flex flex-col', () => {
    const { container } = render(<DashboardCardSkeleton />);
    expect(container.firstChild).toHaveClass('flex');
    expect(container.firstChild).toHaveClass('flex-col');
  });

  it('tiene borde visible para mantener proporciones de layout', () => {
    const { container } = render(<DashboardCardSkeleton />);
    expect(container.firstChild).toHaveClass('border');
  });

  it('contiene múltiples elementos Skeleton animados', () => {
    const { container } = render(<DashboardCardSkeleton />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    // Debe haber al menos 4 bloques skeleton (título, ícono, valor, descripción)
    expect(skeletons.length).toBeGreaterThanOrEqual(4);
  });

  it('incluye un skeleton de ícono cuadrado (w-12 h-12)', () => {
    const { container } = render(<DashboardCardSkeleton />);
    const iconSkeleton = container.querySelector('.w-12.h-12');
    expect(iconSkeleton).toBeTruthy();
  });

  it('incluye un skeleton de valor grande (h-8)', () => {
    const { container } = render(<DashboardCardSkeleton />);
    const valueSkeleton = container.querySelector('.h-8');
    expect(valueSkeleton).toBeTruthy();
  });

  it('incluye un divisor visual entre encabezado y cuerpo', () => {
    const { container } = render(<DashboardCardSkeleton />);
    const divider = container.querySelector('.border-t');
    expect(divider).toBeTruthy();
  });

  it('renderiza de forma idéntica en múltiples instancias (sin estado interno)', () => {
    const { container: c1 } = render(<DashboardCardSkeleton />);
    const { container: c2 } = render(<DashboardCardSkeleton />);
    expect(c1.innerHTML).toBe(c2.innerHTML);
  });
});

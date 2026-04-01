import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ScheduleCardSkeleton from '../../components/Cards/ScheduleCardSkeleton';

describe('ScheduleCardSkeleton', () => {
  it('renderiza sin errores', () => {
    const { container } = render(<ScheduleCardSkeleton />);
    expect(container.firstChild).toBeTruthy();
  });

  it('el contenedor raíz es un div', () => {
    const { container } = render(<ScheduleCardSkeleton />);
    expect(container.firstChild.tagName).toBe('DIV');
  });

  it('tiene padding p-4 para coincidir con ScheduleCard real', () => {
    const { container } = render(<ScheduleCardSkeleton />);
    expect(container.firstChild).toHaveClass('p-4');
  });

  it('tiene borde y rounded para coincidir con ScheduleCard real', () => {
    const { container } = render(<ScheduleCardSkeleton />);
    expect(container.firstChild).toHaveClass('border');
    expect(container.firstChild).toHaveClass('rounded-lg');
  });

  it('contiene skeleton de nombre del rival (h-5 w-32)', () => {
    const { container } = render(<ScheduleCardSkeleton />);
    const rivalSkeleton = container.querySelector('.h-5.w-32');
    expect(rivalSkeleton).toBeTruthy();
  });

  it('contiene skeleton de estado/badge (h-6 w-16 rounded-full)', () => {
    const { container } = render(<ScheduleCardSkeleton />);
    const badge = container.querySelector('.h-6.w-16.rounded-full');
    expect(badge).toBeTruthy();
  });

  it('contiene un divisor entre la info y los botones', () => {
    const { container } = render(<ScheduleCardSkeleton />);
    const divider = container.querySelector('.border-t');
    expect(divider).toBeTruthy();
  });

  it('contiene dos skeletons de botones de acción', () => {
    const { container } = render(<ScheduleCardSkeleton />);
    const buttons = container.querySelectorAll('.h-8');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('contiene múltiples elementos Skeleton animados', () => {
    const { container } = render(<ScheduleCardSkeleton />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    // rival + fecha x2 + badge + 2 botones = mínimo 6
    expect(skeletons.length).toBeGreaterThanOrEqual(6);
  });

  it('renderiza de forma idéntica en múltiples instancias (sin estado interno)', () => {
    const { container: c1 } = render(<ScheduleCardSkeleton />);
    const { container: c2 } = render(<ScheduleCardSkeleton />);
    expect(c1.innerHTML).toBe(c2.innerHTML);
  });
});

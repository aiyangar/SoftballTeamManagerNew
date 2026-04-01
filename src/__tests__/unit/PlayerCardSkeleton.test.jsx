import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PlayerCardSkeleton from '../../components/Cards/PlayerCardSkeleton';

describe('PlayerCardSkeleton', () => {
  it('renderiza sin errores', () => {
    const { container } = render(<PlayerCardSkeleton />);
    expect(container.firstChild).toBeTruthy();
  });

  it('el contenedor raíz es un div', () => {
    const { container } = render(<PlayerCardSkeleton />);
    expect(container.firstChild.tagName).toBe('DIV');
  });

  it('tiene la clase min-h-[200px] para coincidir con PlayerCard real', () => {
    const { container } = render(<PlayerCardSkeleton />);
    expect(container.firstChild.className).toContain('min-h-[200px]');
  });

  it('tiene diseño flex flex-col', () => {
    const { container } = render(<PlayerCardSkeleton />);
    expect(container.firstChild).toHaveClass('flex');
    expect(container.firstChild).toHaveClass('flex-col');
  });

  it('contiene skeleton de avatar circular (rounded-full)', () => {
    const { container } = render(<PlayerCardSkeleton />);
    const avatar = container.querySelector('.rounded-full.w-8.h-8');
    expect(avatar).toBeTruthy();
  });

  it('contiene skeletons de nombre y subtítulo del jugador', () => {
    const { container } = render(<PlayerCardSkeleton />);
    const nameSkeleton = container.querySelector('.h-4.w-24');
    const subtitleSkeleton = container.querySelector('.h-3.w-16');
    expect(nameSkeleton).toBeTruthy();
    expect(subtitleSkeleton).toBeTruthy();
  });

  it('contiene skeletons de posiciones (badges)', () => {
    const { container } = render(<PlayerCardSkeleton />);
    // Dos badges de posición (h-5 w-8)
    const badges = container.querySelectorAll('.h-5.w-8');
    expect(badges.length).toBeGreaterThanOrEqual(2);
  });

  it('contiene skeleton de barra de progreso (h-2 w-full)', () => {
    const { container } = render(<PlayerCardSkeleton />);
    const progressBar = container.querySelector('.h-2.w-full');
    expect(progressBar).toBeTruthy();
  });

  it('contiene múltiples elementos Skeleton animados', () => {
    const { container } = render(<PlayerCardSkeleton />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    // Header (avatar + nombre + subtítulo + número) + badges x2 + progress labels x2 + barra
    expect(skeletons.length).toBeGreaterThanOrEqual(6);
  });

  it('renderiza de forma idéntica en múltiples instancias (sin estado interno)', () => {
    const { container: c1 } = render(<PlayerCardSkeleton />);
    const { container: c2 } = render(<PlayerCardSkeleton />);
    expect(c1.innerHTML).toBe(c2.innerHTML);
  });
});

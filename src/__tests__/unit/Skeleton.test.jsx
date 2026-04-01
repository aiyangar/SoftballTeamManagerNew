import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Skeleton from '../../components/UI/Skeleton';

describe('Skeleton', () => {
  it('renderiza un elemento div', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild.tagName).toBe('DIV');
  });

  it('incluye la clase animate-pulse', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveClass('animate-pulse');
  });

  it('incluye la clase bg-gray-700', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveClass('bg-gray-700');
  });

  it('incluye la clase rounded', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveClass('rounded');
  });

  it('aplica className adicional cuando se pasa como prop', () => {
    const { container } = render(<Skeleton className="h-4 w-32" />);
    expect(container.firstChild).toHaveClass('h-4');
    expect(container.firstChild).toHaveClass('w-32');
  });

  it('mantiene las clases base junto con el className personalizado', () => {
    const { container } = render(<Skeleton className="h-8 w-8 rounded-full" />);
    expect(container.firstChild).toHaveClass('animate-pulse');
    expect(container.firstChild).toHaveClass('bg-gray-700');
    expect(container.firstChild).toHaveClass('h-8');
    expect(container.firstChild).toHaveClass('w-8');
    expect(container.firstChild).toHaveClass('rounded-full');
  });

  it('sin className prop no tiene clases adicionales inesperadas', () => {
    const { container } = render(<Skeleton />);
    const classList = Array.from(container.firstChild.classList);
    expect(classList).toContain('animate-pulse');
    expect(classList).toContain('bg-gray-700');
    expect(classList).toContain('rounded');
    // El className vacío no debe agregar clases extrañas
    expect(classList.every(c => ['animate-pulse', 'bg-gray-700', 'rounded'].includes(c))).toBe(true);
  });

  it('no renderiza hijos', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild.childNodes.length).toBe(0);
  });
});

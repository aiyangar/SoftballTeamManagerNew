import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Layout from '../../components/Layout';

// Mockear el componente Menu para aislar el test de Layout
vi.mock('../../components/Menu', () => ({
  default: () => <nav data-testid="menu">Menu</nav>,
}));

// Mockear el logo para evitar problemas con assets en tests
vi.mock('../../assets/MySoftballClubLogoV2.png', () => ({
  default: 'logo.png',
}));

const renderLayout = (children = null) =>
  render(
    <MemoryRouter>
      <Layout>{children}</Layout>
    </MemoryRouter>
  );

describe('Layout — Sticky Header (Fase E)', () => {
  it('renderiza el contenido hijo correctamente', () => {
    renderLayout(<div data-testid="child-content">Contenido</div>);
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('renderiza el componente Menu dentro del header', () => {
    renderLayout();
    expect(screen.getByTestId('menu')).toBeInTheDocument();
  });

  it('renderiza el logo como imagen', () => {
    renderLayout();
    const logo = screen.getByAltText('My Softball Club Logo');
    expect(logo).toBeInTheDocument();
    expect(logo.tagName).toBe('IMG');
  });

  it('el header usa la etiqueta semántica <header>', () => {
    const { container } = renderLayout();
    const header = container.querySelector('header');
    expect(header).toBeTruthy();
  });

  it('el header tiene la clase sticky para fijarse al scroll', () => {
    const { container } = renderLayout();
    const header = container.querySelector('header');
    expect(header).toHaveClass('sticky');
  });

  it('el header tiene top-0 para pegarse al borde superior', () => {
    const { container } = renderLayout();
    const header = container.querySelector('header');
    expect(header).toHaveClass('top-0');
  });

  it('el header tiene z-40 para quedar sobre el contenido pero bajo los modales (z-50)', () => {
    const { container } = renderLayout();
    const header = container.querySelector('header');
    expect(header).toHaveClass('z-40');
  });

  it('el header tiene backdrop-blur-sm para el efecto de cristal al hacer scroll', () => {
    const { container } = renderLayout();
    const header = container.querySelector('header');
    expect(header).toHaveClass('backdrop-blur-sm');
  });

  it('el header tiene fondo semitransparente (bg-surface-900/95)', () => {
    const { container } = renderLayout();
    const header = container.querySelector('header');
    expect(header.className).toContain('bg-surface-900/95');
  });

  it('el header tiene borde inferior separador', () => {
    const { container } = renderLayout();
    const header = container.querySelector('header');
    expect(header).toHaveClass('border-b');
  });

  it('el logo enlaza a /dashboard', () => {
    renderLayout();
    const logo = screen.getByAltText('My Softball Club Logo');
    const link = logo.closest('a');
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('/dashboard');
  });

  it('el contenedor del contenido tiene el ancho máximo correcto (max-w-7xl)', () => {
    const { container } = renderLayout(<span>X</span>);
    // El contenedor de children es el div fuera del header
    const contentDiv = container.querySelector('header + div');
    expect(contentDiv).toHaveClass('max-w-7xl');
  });

  it('el contenedor del contenido tiene padding responsive', () => {
    const { container } = renderLayout(<span>X</span>);
    const contentDiv = container.querySelector('header + div');
    expect(contentDiv).toHaveClass('mx-auto');
  });

  it('header y contenido son hermanos (header sticky separado del scroll)', () => {
    const { container } = renderLayout(<span>contenido</span>);
    const root = container.firstChild;
    // El primer hijo del root debe ser el header
    expect(root.children[0].tagName).toBe('HEADER');
    // El segundo hijo debe ser el div de contenido
    expect(root.children[1].tagName).toBe('DIV');
  });

  it('el fondo raíz mantiene min-h-screen para ocupar toda la pantalla', () => {
    const { container } = renderLayout();
    expect(container.firstChild).toHaveClass('min-h-screen');
  });
});

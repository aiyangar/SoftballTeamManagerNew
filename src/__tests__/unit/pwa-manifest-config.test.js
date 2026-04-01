import { PWA_MANIFEST } from '../../config/pwaManifest';

describe('PWA Manifest Config — campos obligatorios', () => {
  it('name es "Softball Team Manager"', () => {
    expect(PWA_MANIFEST.name).toBe('Softball Team Manager');
  });

  it('short_name existe y tiene ≤ 12 caracteres (límite de pantalla de inicio)', () => {
    expect(PWA_MANIFEST.short_name).toBeDefined();
    expect(PWA_MANIFEST.short_name.length).toBeLessThanOrEqual(12);
  });

  it('description existe y no está vacía', () => {
    expect(typeof PWA_MANIFEST.description).toBe('string');
    expect(PWA_MANIFEST.description.length).toBeGreaterThan(0);
  });

  it('start_url es "/"', () => {
    expect(PWA_MANIFEST.start_url).toBe('/');
  });

  it('display es "standalone" (requerido para ser instalable)', () => {
    expect(PWA_MANIFEST.display).toBe('standalone');
  });

  it('theme_color es un color hex válido', () => {
    expect(PWA_MANIFEST.theme_color).toMatch(/^#[0-9a-fA-F]{3,8}$/);
  });

  it('background_color es un color hex válido', () => {
    expect(PWA_MANIFEST.background_color).toMatch(/^#[0-9a-fA-F]{3,8}$/);
  });
});

describe('PWA Manifest Config — iconos', () => {
  it('icons es un array no vacío', () => {
    expect(Array.isArray(PWA_MANIFEST.icons)).toBe(true);
    expect(PWA_MANIFEST.icons.length).toBeGreaterThan(0);
  });

  it('todos los íconos tienen src, sizes y type definidos', () => {
    PWA_MANIFEST.icons.forEach((icon) => {
      expect(icon.src).toBeDefined();
      expect(icon.sizes).toBeDefined();
      expect(icon.type).toBe('image/png');
    });
  });

  it('incluye ícono de 192×192 (requerido por Android/Chrome)', () => {
    const icon = PWA_MANIFEST.icons.find((i) => i.sizes === '192x192');
    expect(icon).toBeDefined();
    expect(icon.src).toBe('pwa-192x192.png');
  });

  it('incluye ícono de 512×512 (requerido por Lighthouse)', () => {
    const icon = PWA_MANIFEST.icons.find((i) => i.sizes === '512x512');
    expect(icon).toBeDefined();
    expect(icon.src).toBe('pwa-512x512.png');
  });

  it('tiene al menos un ícono con purpose "maskable" (necesario para app stores)', () => {
    const maskable = PWA_MANIFEST.icons.find((i) => i.purpose?.includes('maskable'));
    expect(maskable).toBeDefined();
  });

  it('los src de íconos son nombres de archivo PNG relativos (sin ruta absoluta)', () => {
    PWA_MANIFEST.icons.forEach((icon) => {
      expect(icon.src).not.toContain('/');
      expect(icon.src).toMatch(/\.png$/);
    });
  });
});

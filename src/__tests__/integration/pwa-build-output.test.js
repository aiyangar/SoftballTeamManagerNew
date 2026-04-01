// @vitest-environment node
/**
 * Tests de integración para los artefactos generados por vite-plugin-pwa.
 * Requieren que `npm run build` haya sido ejecutado previamente.
 * En CI se ejecutan después del step de build.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PWA_MANIFEST } from '../../config/pwaManifest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '../../../dist');
const PUBLIC_DIR = path.resolve(__dirname, '../../../public');

const buildExists = fs.existsSync(DIST_DIR);

describe.skipIf(!buildExists)('Artefactos PWA en dist/ (requiere npm run build)', () => {
  describe('archivos generados por vite-plugin-pwa', () => {
    it('genera manifest.webmanifest', () => {
      expect(fs.existsSync(path.join(DIST_DIR, 'manifest.webmanifest'))).toBe(true);
    });

    it('genera sw.js (Service Worker)', () => {
      expect(fs.existsSync(path.join(DIST_DIR, 'sw.js'))).toBe(true);
    });

    it('genera registerSW.js', () => {
      expect(fs.existsSync(path.join(DIST_DIR, 'registerSW.js'))).toBe(true);
    });

    it('genera al menos un archivo workbox-*.js', () => {
      const files = fs.readdirSync(DIST_DIR);
      const workboxFile = files.find((f) => f.startsWith('workbox-') && f.endsWith('.js'));
      expect(workboxFile).toBeDefined();
    });

    it('sw.js y workbox-*.js no están vacíos', () => {
      const swStats = fs.statSync(path.join(DIST_DIR, 'sw.js'));
      expect(swStats.size).toBeGreaterThan(0);

      const files = fs.readdirSync(DIST_DIR);
      const workboxFile = files.find((f) => f.startsWith('workbox-') && f.endsWith('.js'));
      const wbStats = fs.statSync(path.join(DIST_DIR, workboxFile));
      expect(wbStats.size).toBeGreaterThan(0);
    });
  });

  describe('contenido de manifest.webmanifest', () => {
    let manifest;

    beforeAll(() => {
      const raw = fs.readFileSync(path.join(DIST_DIR, 'manifest.webmanifest'), 'utf-8');
      manifest = JSON.parse(raw);
    });

    it('es JSON válido con estructura de objeto', () => {
      expect(manifest).toBeTypeOf('object');
      expect(manifest).not.toBeNull();
    });

    it('name coincide con PWA_MANIFEST', () => {
      expect(manifest.name).toBe(PWA_MANIFEST.name);
    });

    it('short_name coincide con PWA_MANIFEST', () => {
      expect(manifest.short_name).toBe(PWA_MANIFEST.short_name);
    });

    it('display es "standalone"', () => {
      expect(manifest.display).toBe('standalone');
    });

    it('start_url es "/"', () => {
      expect(manifest.start_url).toBe('/');
    });

    it('theme_color coincide con PWA_MANIFEST', () => {
      expect(manifest.theme_color).toBe(PWA_MANIFEST.theme_color);
    });

    it('background_color coincide con PWA_MANIFEST', () => {
      expect(manifest.background_color).toBe(PWA_MANIFEST.background_color);
    });

    it('tiene array de íconos no vacío', () => {
      expect(Array.isArray(manifest.icons)).toBe(true);
      expect(manifest.icons.length).toBeGreaterThan(0);
    });

    it('todos los íconos referenciados existen en public/', () => {
      manifest.icons.forEach((icon) => {
        const iconPath = path.join(PUBLIC_DIR, icon.src);
        expect(fs.existsSync(iconPath), `public/${icon.src} no encontrado`).toBe(true);
      });
    });

    it('incluye entrada para 192×192', () => {
      const icon = manifest.icons.find((i) => i.sizes === '192x192');
      expect(icon).toBeDefined();
    });

    it('incluye entrada para 512×512', () => {
      const icon = manifest.icons.find((i) => i.sizes === '512x512');
      expect(icon).toBeDefined();
    });

    it('incluye ícono maskable', () => {
      const maskable = manifest.icons.find((i) => i.purpose?.includes('maskable'));
      expect(maskable).toBeDefined();
    });
  });

  describe('Service Worker (sw.js)', () => {
    let swContent;

    beforeAll(() => {
      swContent = fs.readFileSync(path.join(DIST_DIR, 'sw.js'), 'utf-8');
    });

    it('referencia al runtime de workbox', () => {
      expect(swContent).toContain('workbox');
    });

    it('implementa estrategia de precaché', () => {
      // vite-plugin-pwa en modo generateSW incluye precacheAndRoute o similar
      expect(swContent.toLowerCase()).toContain('precache');
    });
  });
});

// Este bloque se ejecuta siempre (no depende del build)
describe('Coherencia entre config y assets', () => {
  it('cada src de ícono en PWA_MANIFEST tiene un archivo correspondiente en public/', () => {
    const uniqueSrcs = [...new Set(PWA_MANIFEST.icons.map((i) => i.src))];
    uniqueSrcs.forEach((src) => {
      const iconPath = path.join(PUBLIC_DIR, src);
      expect(fs.existsSync(iconPath), `public/${src} no encontrado`).toBe(true);
    });
  });

  it('apple-touch-icon.png existe en public/ (referenciado en includeAssets)', () => {
    expect(fs.existsSync(path.join(PUBLIC_DIR, 'apple-touch-icon.png'))).toBe(true);
  });
});

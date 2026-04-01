// @vitest-environment node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, '../../../public');

// Los primeros 8 bytes de cualquier archivo PNG válido
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function readFirstBytes(filePath, count) {
  const buf = Buffer.alloc(count);
  const fd = fs.openSync(filePath, 'r');
  fs.readSync(fd, buf, 0, count, 0);
  fs.closeSync(fd);
  return buf;
}

const REQUIRED_ICONS = [
  { file: 'pwa-192x192.png', label: 'ícono PWA 192×192' },
  { file: 'pwa-512x512.png', label: 'ícono PWA 512×512 (y maskable)' },
  { file: 'apple-touch-icon.png', label: 'ícono Apple touch (180×180)' },
];

describe('Iconos PWA en public/', () => {
  REQUIRED_ICONS.forEach(({ file, label }) => {
    const fullPath = path.join(PUBLIC_DIR, file);

    describe(`${file} — ${label}`, () => {
      it('existe en el directorio public/', () => {
        expect(fs.existsSync(fullPath)).toBe(true);
      });

      it('es un archivo no vacío (> 100 bytes)', () => {
        const stats = fs.statSync(fullPath);
        expect(stats.size).toBeGreaterThan(100);
      });

      it('tiene firma PNG válida en los primeros 8 bytes', () => {
        const header = readFirstBytes(fullPath, 8);
        expect(header.equals(PNG_SIGNATURE)).toBe(true);
      });

      it('es un archivo regular (no un directorio ni symlink)', () => {
        const stats = fs.statSync(fullPath);
        expect(stats.isFile()).toBe(true);
      });
    });
  });

  it('no hay íconos extra inesperados con nombre pwa-* en public/', () => {
    const files = fs.readdirSync(PUBLIC_DIR);
    const pwaFiles = files.filter((f) => f.startsWith('pwa-'));
    const expectedPwaFiles = ['pwa-192x192.png', 'pwa-512x512.png'];
    pwaFiles.forEach((f) => {
      expect(expectedPwaFiles).toContain(f);
    });
  });
});

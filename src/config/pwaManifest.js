export const PWA_MANIFEST = {
  name: 'Softball Team Manager',
  short_name: 'SoftballMgr',
  description: 'Gestión de equipos de softball',
  theme_color: '#0f0f0f',
  background_color: '#0f0f0f',
  display: 'standalone',
  start_url: '/',
  icons: [
    { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
    { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
    { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
  ],
};

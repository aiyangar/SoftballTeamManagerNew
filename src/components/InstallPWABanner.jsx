import React, { useState, useEffect } from 'react';

const DISMISSED_KEY = 'pwa_install_dismissed';

const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isInStandaloneMode = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;

const InstallPWABanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIOSHint, setShowIOSHint] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isInStandaloneMode()) return;
    if (localStorage.getItem(DISMISSED_KEY)) return;

    if (isIOS()) {
      setShowIOSHint(true);
      setVisible(true);
      return;
    }

    const handler = e => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setVisible(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, '1');
  };

  if (!visible) return null;

  return (
    <div className='fixed bottom-0 inset-x-0 z-50 bg-gray-800 border-t border-gray-600 px-4 py-3 flex items-center gap-3 shadow-lg'>
      <span className='text-2xl'>📲</span>
      {showIOSHint ? (
        <p className='flex-1 text-sm text-gray-200'>
          Para instalar: toca <strong>Compartir</strong> y luego{' '}
          <strong>"Añadir a pantalla de inicio"</strong>
        </p>
      ) : (
        <>
          <p className='flex-1 text-sm text-gray-200'>
            Instala la app para acceso rápido sin abrir el navegador
          </p>
          <button onClick={handleInstall} className='btn-sm btn-primary shrink-0'>
            Instalar
          </button>
        </>
      )}
      <button
        onClick={handleDismiss}
        className='text-gray-400 hover:text-white text-xl leading-none shrink-0'
        aria-label='Cerrar'
      >
        ✕
      </button>
    </div>
  );
};

export default InstallPWABanner;

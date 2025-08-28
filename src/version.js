// Control de versión de Softball Team Manager
export const APP_VERSION = '0.14.0';
export const APP_NAME = 'Softball Team Manager';

// Función para obtener la versión completa
export const getFullVersion = () => {
  return `${APP_NAME} v${APP_VERSION}`;
};

// Función para obtener solo la versión
export const getVersion = () => {
  return APP_VERSION;
};

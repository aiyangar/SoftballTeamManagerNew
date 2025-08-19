import { useEffect } from 'react';

/**
 * Hook personalizado para manejar modales
 * Controla el scroll del body cuando el modal está abierto
 * @param {boolean} isOpen - Estado del modal
 */
export const useModal = (isOpen) => {
  useEffect(() => {
    if (isOpen) {
      // Agregar clase para eliminar scroll del body
      document.body.classList.add('modal-open');
    } else {
      // Remover clase para restaurar scroll del body
      document.body.classList.remove('modal-open');
    }

    // Cleanup: asegurar que se remueva la clase al desmontar
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);
};

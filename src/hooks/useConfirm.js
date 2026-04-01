import { useState, useCallback } from 'react';

export function useConfirm() {
  const [state, setState] = useState({ isOpen: false, resolve: null, options: {} });

  const confirm = useCallback((options = {}) => {
    return new Promise(resolve => {
      setState({ isOpen: true, resolve, options });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    state.resolve?.(true);
    setState({ isOpen: false, resolve: null, options: {} });
  }, [state]);

  const handleCancel = useCallback(() => {
    state.resolve?.(false);
    setState({ isOpen: false, resolve: null, options: {} });
  }, [state]);

  const confirmProps = {
    isOpen: state.isOpen,
    title: state.options.title,
    message: state.options.message,
    confirmLabel: state.options.confirmLabel,
    cancelLabel: state.options.cancelLabel,
    variant: state.options.variant,
    onConfirm: handleConfirm,
    onCancel: handleCancel,
  };

  return { confirmProps, confirm };
}

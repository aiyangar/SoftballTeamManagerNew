import React from 'react';

const ICONS = {
  danger: (
    <svg className='w-6 h-6 text-red-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
        d='M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z' />
    </svg>
  ),
  warning: (
    <svg className='w-6 h-6 text-amber-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
        d='M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z' />
    </svg>
  ),
  default: (
    <svg className='w-6 h-6 text-blue-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
        d='M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
    </svg>
  ),
};

const CONFIRM_BTN = {
  danger: 'btn btn-danger',
  warning: 'btn btn-warning',
  default: 'btn btn-primary',
};

const ConfirmModal = ({
  isOpen,
  title = 'Confirmar',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  variant = 'default',
}) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 modal-overlay flex items-center justify-center z-50'>
      <div className='bg-neutral-900 border border-gray-600 rounded-lg w-full max-w-sm mx-4 modal-container'>
        <div className='p-6'>
          <div className='flex items-center gap-3 mb-3'>
            {ICONS[variant] ?? ICONS.default}
            <h2 className='text-lg font-semibold text-white'>{title}</h2>
          </div>
          {message && (
            <p className='text-gray-300 text-sm mb-6 leading-relaxed'>{message}</p>
          )}
          <div className='flex justify-end gap-3'>
            <button className='btn btn-secondary' onClick={onCancel}>
              {cancelLabel}
            </button>
            <button className={CONFIRM_BTN[variant] ?? CONFIRM_BTN.default} onClick={onConfirm}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

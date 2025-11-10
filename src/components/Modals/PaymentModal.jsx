import React from 'react';
import '../../styles/modalStyles.css';

/**
 * Modal para aceptar pagos de inscripción
 * @param {boolean} isOpen - Estado del modal
 * @param {Object} player - Jugador seleccionado para el pago
 * @param {string} paymentAmount - Cantidad del pago
 * @param {Function} onPaymentAmountChange - Función para cambiar la cantidad
 * @param {string} paymentMethod - Método de pago seleccionado
 * @param {Function} onPaymentMethodChange - Función para cambiar el método de pago
 * @param {number} currentInscripcionPaid - Cantidad pagada actualmente
 * @param {number} inscripcionTarget - Meta de inscripción
 * @param {boolean} loading - Estado de carga
 * @param {Function} onClose - Función para cerrar el modal
 * @param {Function} onProcessPayment - Función para procesar el pago
 */
const PaymentModal = ({
  isOpen,
  player,
  paymentAmount,
  onPaymentAmountChange,
  paymentMethod,
  onPaymentMethodChange,
  currentInscripcionPaid = 0,
  inscripcionTarget = 450,
  loading = false,
  onClose,
  onProcessPayment,
}) => {
  if (!isOpen || !player) return null;

  const remainingAmount = inscripcionTarget - currentInscripcionPaid;

  return (
    <div className='fixed inset-0 modal-overlay flex items-center justify-center z-50'>
      <div className='bg-neutral-900 border border-gray-600 rounded-lg w-full max-w-md mx-4 modal-container'>
        <div className='modal-header p-6 border-b border-gray-600'>
          <div className='flex justify-between items-center'>
            <h2 className='text-xl font-semibold text-white'>
              Aceptar Pago de Inscripción
            </h2>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-white text-2xl'
              title='Cerrar modal de pago'
            >
              ×
            </button>
          </div>
        </div>

        <div className='modal-content p-6'>
          {/* Información del jugador */}
          <div className='mb-6 p-4 bg-gray-800 rounded-lg'>
            <h3 className='text-lg font-semibold text-white mb-2'>
              {player.nombre}
            </h3>
            <p className='text-gray-300'>
              Número: {player.numero}
            </p>
            <p className='text-gray-300'>
              Equipo: {player.equipos?.nombre_equipo || 'Sin equipo'}
            </p>
          </div>

          {/* Información de pago actual */}
          <div className='mb-6 p-4 bg-gray-800 rounded-lg'>
            <div className='flex justify-between items-center mb-2'>
              <span className='text-gray-300'>Pagado actualmente:</span>
              <span className='text-blue-400 font-semibold'>
                ${currentInscripcionPaid.toLocaleString()}
              </span>
            </div>
            <div className='flex justify-between items-center mb-2'>
              <span className='text-gray-300'>Meta de inscripción:</span>
              <span className='text-white font-semibold'>
                ${inscripcionTarget.toLocaleString()}
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-300'>Falta por pagar:</span>
              <span className='text-red-400 font-semibold'>
                ${remainingAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Formulario de pago */}
          <div className='space-y-4'>
            <div>
              <label className='block text-white mb-2 text-sm font-medium'>
                Cantidad a pagar
              </label>
              <input
                type='number'
                value={paymentAmount}
                onChange={(e) => onPaymentAmountChange(e.target.value)}
                min='0'
                step='0.01'
                className='w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white text-lg font-semibold'
                placeholder='0.00'
                required
              />
            </div>

            <div>
              <label className='block text-white mb-2 text-sm font-medium'>
                Método de pago
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => onPaymentMethodChange(e.target.value)}
                className='w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white'
              >
                <option value='Efectivo'>Efectivo</option>
                <option value='Transferencia'>Transferencia</option>
                <option value='Tarjeta'>Tarjeta</option>
              </select>
            </div>
          </div>

          {/* Botones */}
          <div className='flex space-x-3 mt-6'>
            <button
              onClick={onClose}
              className='flex-1 px-4 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors'
            >
              Cancelar
            </button>
            <button
              onClick={onProcessPayment}
              disabled={loading || !paymentAmount}
              className='flex-1 px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
            >
              {loading ? 'Procesando...' : 'Aceptar Pago'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;


import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Link } from 'react-router-dom';
import { useModal } from '../../hooks/useModal';
import PaymentStatusWidget from '../Widgets/PaymentStatusWidget';

const PaymentForm = ({ gameId, teamId, onClose, onPaymentComplete }) => {
    const [players, setPlayers] = useState([]);
    const [selectedPlayer, setSelectedPlayer] = useState('');
    const [montoUmpire, setMontoUmpire] = useState('');
    const [montoRegistro, setMontoRegistro] = useState('');
    const [metodoPago, setMetodoPago] = useState('Efectivo');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [gameInfo, setGameInfo] = useState(null);
    const [existingPayments, setExistingPayments] = useState({});
    const [showUpdateWarning, setShowUpdateWarning] = useState(false);
    const [showCancelWarning, setShowCancelWarning] = useState(false);
    const [paymentTotals, setPaymentTotals] = useState({
        totalUmpire: 0,
        totalInscripcion: 0,
        umpireTarget: 0
    });
    const [successMessage, setSuccessMessage] = useState('');

    // Usar el hook para manejar el modal
    useModal(true); // Siempre true porque este componente es un modal

    useEffect(() => {
        const initializeForm = async () => {
            // Primero limpiar pagos en 0
            await cleanZeroPayments();
            // Luego cargar los datos
            await fetchPlayers();
            await fetchGameInfo();
            await fetchExistingPayments();
        };
        
        initializeForm();
    }, [teamId, gameId]);

    const fetchPlayers = async () => {
        // Get only players who marked attendance for this game
        const { data, error } = await supabase
            .from('asistencia_partidos')
            .select(`
                jugador_id,
                jugadores!inner(id, nombre)
            `)
            .eq('partido_id', gameId);
        
        if (error) {
            console.error('Error fetching players:', error);
            setError('Error al cargar jugadores: ' + error.message);
        } else {
            // Transform the data to match the expected format
            const playersData = data.map(item => ({
                id: item.jugadores.id,
                nombre: item.jugadores.nombre
            }));
            setPlayers(playersData || []);
        }
    };

    const handlePlayerChange = (playerId) => {
        setSelectedPlayer(playerId);
        setShowUpdateWarning(false);
        setShowCancelWarning(false);
        setSuccessMessage(''); // Limpiar mensaje de éxito al cambiar jugador
        
        if (playerId && existingPayments[playerId]) {
            const payment = existingPayments[playerId];
            setMontoUmpire(payment.monto_umpire.toString());
            setMontoRegistro(payment.monto_inscripcion.toString());
            setMetodoPago(payment.metodo_pago);
        } else {
            setMontoUmpire('');
            setMontoRegistro('');
            setMetodoPago('Efectivo');
        }
    };

    const fetchGameInfo = async () => {
        const { data, error } = await supabase
            .from('partidos')
            .select('equipo_contrario, fecha_partido, lugar, umpire')
            .eq('id', gameId)
            .single();
        
        if (error) {
            console.error('Error fetching game info:', error);
        } else {
            setGameInfo(data);
            // Actualizar el target del umpire
            setPaymentTotals(prev => ({
                ...prev,
                umpireTarget: data.umpire || 550
            }));
        }
    };

    const cleanZeroPayments = async () => {
        // Función para limpiar pagos que tengan monto total de 0
        const { data, error } = await supabase
            .from('pagos')
            .select('jugador_id, monto_umpire, monto_inscripcion')
            .eq('partido_id', gameId);
        
        if (error) {
            console.error('Error al verificar pagos en 0:', error);
            return;
        }
        
        const paymentsToDelete = data.filter(payment => {
            const totalPayment = (payment.monto_umpire || 0) + (payment.monto_inscripcion || 0);
            return totalPayment === 0;
        });
        
        if (paymentsToDelete.length > 0) {
            console.log(`Encontrados ${paymentsToDelete.length} pagos en 0 para limpiar`);
            
            for (const payment of paymentsToDelete) {
                const { error: deleteError } = await supabase
                    .from('pagos')
                    .delete()
                    .eq('partido_id', gameId)
                    .eq('jugador_id', payment.jugador_id);
                
                if (deleteError) {
                    console.error(`Error al eliminar pago en 0 para jugador ${payment.jugador_id}:`, deleteError);
                }
            }
        }
    };

    const fetchExistingPayments = async () => {
        const { data, error } = await supabase
            .from('pagos')
            .select('jugador_id, monto_umpire, monto_inscripcion, metodo_pago')
            .eq('partido_id', gameId);
        
        if (error) {
            console.error('Error fetching existing payments:', error);
        } else {
            const paymentsMap = {};
            let totalUmpire = 0;
            let totalInscripcion = 0;
            
            // Solo procesar pagos con monto total mayor a 0
            data.forEach(payment => {
                const totalPayment = (payment.monto_umpire || 0) + (payment.monto_inscripcion || 0);
                
                if (totalPayment > 0) {
                    paymentsMap[payment.jugador_id] = payment;
                    totalUmpire += payment.monto_umpire || 0;
                    totalInscripcion += payment.monto_inscripcion || 0;
                }
            });
            
            setExistingPayments(paymentsMap);
            setPaymentTotals(prev => ({
                ...prev,
                totalUmpire,
                totalInscripcion
            }));
        }
    };

    const updatePaymentState = async () => {
        // Función para actualizar inmediatamente el estado de pagos después de una operación
        const { data, error } = await supabase
            .from('pagos')
            .select('jugador_id, monto_umpire, monto_inscripcion, metodo_pago')
            .eq('partido_id', gameId);
        
        if (error) {
            console.error('Error actualizando estado de pagos:', error);
            return;
        }
        
        const paymentsMap = {};
        let totalUmpire = 0;
        let totalInscripcion = 0;
        
        // Solo procesar pagos con monto total mayor a 0
        data.forEach(payment => {
            const totalPayment = (payment.monto_umpire || 0) + (payment.monto_inscripcion || 0);
            
            if (totalPayment > 0) {
                paymentsMap[payment.jugador_id] = payment;
                totalUmpire += payment.monto_umpire || 0;
                totalInscripcion += payment.monto_inscripcion || 0;
            }
        });
        
        // Actualizar estado inmediatamente
        setExistingPayments(paymentsMap);
        setPaymentTotals(prev => ({
            ...prev,
            totalUmpire,
            totalInscripcion
        }));
        
        // También actualizar la lista de jugadores para reflejar cambios en el estado de pago
        await fetchPlayers();
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedPlayer) {
            setError('Por favor, selecciona un jugador.');
            return;
        }

        // Verificar que al menos se ingrese un monto, pero permitir solo inscripción si el umpire está completo
        const totalPayment = (montoUmpire ? parseFloat(montoUmpire) : 0) + (montoRegistro ? parseFloat(montoRegistro) : 0);
        
        // Permitir pago en 0 solo si es una actualización de un pago existente
        if (totalPayment === 0 && !existingPayments[selectedPlayer]) {
            setError('Por favor, ingresa al menos un monto mayor a 0. No se pueden registrar pagos nuevos con monto total de $0.');
            return;
        }

        // Si el umpire está completo, solo permitir inscripción
        if (paymentTotals.totalUmpire >= paymentTotals.umpireTarget && montoUmpire && parseFloat(montoUmpire) > 0) {
            setError('El objetivo del umpire ya ha sido alcanzado. Solo puedes registrar inscripción.');
            return;
        }

        // Check if player already has a payment
        if (existingPayments[selectedPlayer] && !showUpdateWarning && !showCancelWarning) {
            setShowUpdateWarning(true);
            return;
        }
        
        // Check if updating payment to 0 (canceling payment)
        if (existingPayments[selectedPlayer] && totalPayment === 0 && !showCancelWarning) {
            setShowCancelWarning(true);
            return;
        }

        setLoading(true);
        setError(null);

        const paymentData = {
            jugador_id: selectedPlayer,
            partido_id: gameId,
            equipo_id: teamId,
            fecha_pago: new Date().toISOString(),
            monto_umpire: (montoUmpire && paymentTotals.totalUmpire < paymentTotals.umpireTarget) ? parseFloat(montoUmpire) : 0,
            monto_inscripcion: montoRegistro ? parseFloat(montoRegistro) : 0,
            concepto: `Pago partido vs ${gameInfo?.equipo_contrario || 'Equipo contrario'}`,
            metodo_pago: metodoPago
        };

        let result;
        if (existingPayments[selectedPlayer]) {
            // Update existing payment
            result = await supabase
                .from('pagos')
                .update(paymentData)
                .eq('partido_id', gameId)
                .eq('jugador_id', selectedPlayer);
        } else {
            // Insert new payment
            result = await supabase
                .from('pagos')
                .insert([paymentData]);
        }

        if (result.error) {
            setError('Error al registrar el pago: ' + result.error.message);
        } else {
            // Verificar si el pago quedó en 0 (se canceló el pago)
            const totalPayment = (montoUmpire ? parseFloat(montoUmpire) : 0) + (montoRegistro ? parseFloat(montoRegistro) : 0);
            const wasExistingPayment = existingPayments[selectedPlayer];
            
            if (wasExistingPayment && totalPayment === 0) {
                // Si era un pago existente y ahora quedó en 0, eliminar el registro
                const { error: deleteError } = await supabase
                    .from('pagos')
                    .delete()
                    .eq('partido_id', gameId)
                    .eq('jugador_id', selectedPlayer);
                
                if (deleteError) {
                    console.error('Error al eliminar pago en 0:', deleteError);
                } else {
                    setSuccessMessage('Pago borrado exitosamente. El jugador ha sido desmarcado y puede registrar un nuevo pago.');
                    // Ocultar la advertencia de cancelación después del borrado exitoso
                    setShowCancelWarning(false);
                }
            } else {
                // Mostrar mensaje de éxito normal
                setSuccessMessage(wasExistingPayment ? 'Pago actualizado con éxito! El formulario se ha limpiado para el siguiente jugador.' : 'Pago registrado con éxito! El formulario se ha limpiado para el siguiente jugador.');
            }
            
            // Actualizar inmediatamente el estado local de pagos
            await updatePaymentState();
            
            // Limpiar mensaje de éxito después de 3 segundos
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
            
            // Reset form para el siguiente jugador (pero mantener el modal abierto)
            setSelectedPlayer('');
            setMontoUmpire('');
            setMontoRegistro('');
            setMetodoPago('Efectivo');
            setShowUpdateWarning(false);
            setShowCancelWarning(false);
            
            // NO llamar a onPaymentComplete aquí para evitar que se cierre el modal
            // El modal permanecerá abierto para registrar más pagos
        }
        
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50">
            <div className="bg-neutral-900 rounded-lg w-full max-w-md mx-4 modal-container">
                <div className="modal-header p-6 border-b border-gray-600">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-white">Registrar Pago</h2>
                        <button
                            onClick={() => {
                                // Solo recargar datos si se registró un pago
                                if (onPaymentComplete) {
                                    onPaymentComplete(false); // false = no se registró pago
                                }
                                onClose();
                            }}
                            className="text-gray-400 hover:text-white text-2xl"
                            title="Cerrar formulario de pago"
                        >
                            ×
                        </button>
                    </div>
                </div>

                <div className="modal-content p-6">
                    
                                         {gameInfo && (
                         <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                          <h3 className="font-semibold text-white mb-2">Información del Partido</h3>
                          <p className="text-gray-300">vs {gameInfo.equipo_contrario}</p>
                          <p className="text-gray-300">Fecha: {new Date(gameInfo.fecha_partido).toLocaleDateString()}</p>
                          <p className="text-gray-300">Lugar: {gameInfo.lugar}</p>
                          
                          {/* Widget de Estado de Pagos */}
                          <div className="mt-4 pt-4 border-t border-gray-600">
                              <PaymentStatusWidget
                                  paymentTotals={paymentTotals}
                                  umpireTarget={paymentTotals.umpireTarget}
                                  size="medium"
                                  showTitle={true}
                              />
                          </div>
                      </div>
                  )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-white mb-2">Seleccionar Jugador</label>
                        {players.length === 0 ? (
                            <div className="text-yellow-500 p-3 bg-gray-800 rounded-md border border-gray-600">
                                No hay jugadores con asistencia registrada para este partido.
                                <br />
                                <span className="text-sm">Primero debes marcar la asistencia de los jugadores.</span>
                            </div>
                                                 ) : (
                             <select
                                 value={selectedPlayer}
                                 onChange={(e) => handlePlayerChange(e.target.value)}
                                 className="w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white"
                                 required
                             >
                                                                   <option value="">Selecciona un jugador</option>
                                  {players
                                      .sort((a, b) => {
                                          // Primero ordenar por estado de pago (no pagado primero)
                                          const aHasPaid = existingPayments[a.id];
                                          const bHasPaid = existingPayments[b.id];
                                          
                                          if (aHasPaid && !bHasPaid) return 1; // a va después si ya pagó
                                          if (!aHasPaid && bHasPaid) return -1; // a va antes si no ha pagado
                                          
                                          // Si ambos tienen el mismo estado de pago, ordenar alfabéticamente
                                          return a.nombre.localeCompare(b.nombre);
                                      })
                                      .map((player) => (
                                          <option key={player.id} value={player.id}>
                                              {player.nombre} {existingPayments[player.id] ? '✓' : ''}
                                          </option>
                                      ))}
                             </select>
                         )}
                    </div>

                                                                                   <div>
                          <label className="block text-white mb-2">Monto Umpire ($)</label>
                                                    <input
                               id="montoUmpire"
                               name="montoUmpire"
                               type="number"
                               step="10"
                               min="0"
                               value={montoUmpire}
                               onChange={(e) => setMontoUmpire(e.target.value)}
                               placeholder="0.00"
                               disabled={paymentTotals.totalUmpire >= paymentTotals.umpireTarget}
                               className={`w-full p-3 border border-gray-600 rounded-md text-white ${
                                   paymentTotals.totalUmpire >= paymentTotals.umpireTarget 
                                       ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                                       : 'bg-gray-800'
                               }`}
                           />
                           {paymentTotals.totalUmpire >= paymentTotals.umpireTarget && (
                               <div className="text-green-400 text-xs mt-1">
                                   ✅ Objetivo del umpire alcanzado
                               </div>
                           )}
                      </div>

                                         <div>
                         <label className="block text-white mb-2">Monto Registro ($)</label>
                                                                              <input
                               id="montoRegistro"
                               name="montoRegistro"
                               type="number"
                               step="10"
                               min="0"
                               value={montoRegistro}
                               onChange={(e) => setMontoRegistro(e.target.value)}
                               placeholder="0.00"
                               className="w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white"
                           />
                     </div>

                                           <div>
                          <label className="block text-white mb-2">Método de Pago</label>
                          <select
                              value={metodoPago}
                              onChange={(e) => setMetodoPago(e.target.value)}
                              className="w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white"
                          >
                             <option value="Efectivo">Efectivo</option>
                             <option value="Transferencia">Transferencia</option>
                         </select>
                      </div>

                      {/* Botón para borrar pago existente */}
                      {selectedPlayer && existingPayments[selectedPlayer] && (
                          <div className="pt-2">
                              <button
                                  type="button"
                                  onClick={() => {
                                      setMontoUmpire('0');
                                      setMontoRegistro('0');
                                      setShowCancelWarning(true);
                                  }}
                                  className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                                  title="Borrar el pago de este jugador"
                              >
                                  <span>🗑️</span>
                                  <span>Borrar Pago</span>
                              </button>
                              <div className="text-xs text-gray-400 mt-1 text-center">
                                  Establece ambos montos en $0 para cancelar el pago
                              </div>
                          </div>
                      )}

                                         {error && (
                         <div className="text-red-500 text-sm">{error}</div>
                     )}

                     {successMessage && (
                         <div className="bg-green-900 border border-green-600 text-green-200 px-4 py-3 rounded-md text-sm">
                             <div className="flex items-center space-x-2">
                                 <span className="text-green-300">✅</span>
                                 <span>{successMessage}</span>
                             </div>
                         </div>
                     )}

                                           {showUpdateWarning && (
                          <div className="bg-yellow-900 border border-yellow-600 rounded-md p-3">
                              <div className="text-yellow-200 font-semibold mb-2">⚠️ Advertencia</div>
                              <div className="text-yellow-100 text-sm mb-3">
                                  Este jugador ya tiene un pago registrado para este partido. 
                                  Al continuar, se actualizará el pago existente.
                              </div>
                              <div className="flex space-x-2">
                                  <button
                                      type="button"
                                      onClick={() => setShowUpdateWarning(false)}
                                      className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                                  >
                                      Cancelar
                                  </button>
                                  <button
                                      type="submit"
                                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                                  >
                                      Actualizar Pago
                                  </button>
                              </div>
                          </div>
                      )}

                                             {showCancelWarning && (
                           <div className="bg-red-900 border border-red-600 rounded-md p-3">
                               <div className="text-red-200 font-semibold mb-2">🗑️ Borrar Pago</div>
                               <div className="text-red-100 text-sm mb-3">
                                   Estás a punto de <strong>borrar completamente</strong> el pago de este jugador. 
                                   El registro será eliminado de la base de datos y el jugador aparecerá como no pagado.
                                   <br /><br />
                                   <span className="text-yellow-300">⚠️ Esta acción no se puede deshacer.</span>
                               </div>
                              <div className="flex space-x-2">
                                  <button
                                      type="button"
                                      onClick={() => setShowCancelWarning(false)}
                                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                                  >
                                      Cancelar
                                  </button>
                                                                     <button
                                       type="submit"
                                       className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                                   >
                                       Sí, Borrar Pago
                                   </button>
                              </div>
                          </div>
                      )}

                                          <div className="flex space-x-3 pt-4">
                         <button
                             type="button"
                             onClick={() => {
                                 // Solo cerrar sin actualizar datos
                                 onClose();
                             }}
                             className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                         >
                             Cancelar
                         </button>
                                                   <button
                              type="submit"
                              disabled={loading || players.length === 0 || showUpdateWarning || showCancelWarning}
                              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                          >
                              {loading ? 'Registrando...' : 'Registrar Pago'}
                          </button>
                         <button
                             type="button"
                             onClick={() => {
                                 // Recargar datos y cerrar modal
                                 if (onPaymentComplete) {
                                     onPaymentComplete(true); // true = se registraron pagos
                                 }
                                 onClose();
                             }}
                             className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                         >
                             Terminar
                         </button>
                     </div>
                </form>
                </div>
            </div>
        </div>
    );
};

export default PaymentForm;

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

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
    const [paymentTotals, setPaymentTotals] = useState({
        totalUmpire: 0,
        totalInscripcion: 0,
        umpireTarget: 0
    });
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchPlayers();
        fetchGameInfo();
        fetchExistingPayments();
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
            
            data.forEach(payment => {
                paymentsMap[payment.jugador_id] = payment;
                totalUmpire += payment.monto_umpire || 0;
                totalInscripcion += payment.monto_inscripcion || 0;
            });
            
            setExistingPayments(paymentsMap);
            setPaymentTotals(prev => ({
                ...prev,
                totalUmpire,
                totalInscripcion
            }));
        }
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedPlayer) {
            setError('Por favor, selecciona un jugador.');
            return;
        }

        if (!montoUmpire && !montoRegistro) {
            setError('Por favor, ingresa al menos un monto.');
            return;
        }

        // Check if player already has a payment
        if (existingPayments[selectedPlayer] && !showUpdateWarning) {
            setShowUpdateWarning(true);
            return;
        }

        setLoading(true);
        setError(null);

        const paymentData = {
            jugador_id: selectedPlayer,
            partido_id: gameId,
            equipo_id: teamId,
            fecha_pago: new Date().toISOString(),
            monto_umpire: montoUmpire ? parseFloat(montoUmpire) : 0,
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
            // Mostrar mensaje de éxito
            setSuccessMessage(existingPayments[selectedPlayer] ? 'Pago actualizado con éxito!' : 'Pago registrado con éxito!');
            // Reset form
            setSelectedPlayer('');
            setMontoUmpire('');
            setMontoRegistro('');
            setMetodoPago('Efectivo');
            setShowUpdateWarning(false);
            // Refresh existing payments
            fetchExistingPayments();
            // Limpiar mensaje de éxito después de 3 segundos
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
            // No llamar a onPaymentComplete para mantener el modal abierto
        }
        
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-neutral-900 rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white">Registrar Pago</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-2xl"
                    >
                        ×
                    </button>
                </div>

                                 {gameInfo && (
                     <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                         <h3 className="font-semibold text-white mb-2">Información del Partido</h3>
                         <p className="text-gray-300">vs {gameInfo.equipo_contrario}</p>
                         <p className="text-gray-300">Fecha: {new Date(gameInfo.fecha_partido).toLocaleDateString()}</p>
                         <p className="text-gray-300">Lugar: {gameInfo.lugar}</p>
                         
                         {/* Información de Pagos Acumulados */}
                         <div className="mt-4 pt-4 border-t border-gray-600">
                             <h4 className="font-semibold text-white mb-3">Estado de Pagos</h4>
                             
                             {/* Umpire */}
                             <div className="mb-3">
                                 <div className="flex justify-between items-center mb-1">
                                     <span className="text-gray-300 text-sm">Umpire:</span>
                                     <span className="text-white font-semibold">
                                         ${paymentTotals.totalUmpire.toLocaleString()} / ${paymentTotals.umpireTarget.toLocaleString()}
                                     </span>
                                 </div>
                                 <div className="w-full bg-gray-700 rounded-full h-2">
                                     <div 
                                         className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                         style={{ 
                                             width: `${Math.min((paymentTotals.totalUmpire / paymentTotals.umpireTarget) * 100, 100)}%` 
                                         }}
                                     ></div>
                                 </div>
                                 <div className="flex justify-between text-xs mt-1">
                                     <span className="text-gray-400">
                                         {paymentTotals.totalUmpire >= paymentTotals.umpireTarget ? '✅ Completado' : '💰 Recaudado'}
                                     </span>
                                     <span className="text-gray-400">
                                         {paymentTotals.totalUmpire >= paymentTotals.umpireTarget 
                                             ? 'Meta alcanzada' 
                                             : `Faltan $${(paymentTotals.umpireTarget - paymentTotals.totalUmpire).toLocaleString()}`
                                         }
                                     </span>
                                 </div>
                             </div>
                             
                             {/* Inscripción */}
                             <div>
                                 <div className="flex justify-between items-center">
                                     <span className="text-gray-300 text-sm">Inscripción:</span>
                                     <span className="text-white font-semibold">
                                         ${paymentTotals.totalInscripcion.toLocaleString()}
                                     </span>
                                 </div>
                                 <div className="text-xs text-gray-400 mt-1">
                                     Total recaudado para inscripción
                                 </div>
                             </div>
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
                              type="number"
                              step="0.01"
                              min="0"
                              value={montoUmpire}
                              onChange={(e) => setMontoUmpire(e.target.value)}
                              placeholder="0.00"
                              className="w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white"
                          />
                     </div>

                                         <div>
                         <label className="block text-white mb-2">Monto Registro ($)</label>
                                                                              <input
                               type="number"
                               step="0.01"
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

                                          <div className="flex space-x-3 pt-4">
                         <button
                             type="button"
                             onClick={onClose}
                             className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                         >
                             Cancelar
                         </button>
                         <button
                             type="submit"
                             disabled={loading || players.length === 0 || showUpdateWarning}
                             className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                         >
                             {loading ? 'Registrando...' : 'Registrar Pago'}
                         </button>
                     </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentForm;

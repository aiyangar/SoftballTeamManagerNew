import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { UserAuth } from '../context/AuthContext';
import PaymentForm from './PaymentForm';
import Menu from './Menu';
import { useTeam } from '../context/TeamContext';

const Schedule = () => {
    const { session } = UserAuth();
    const { teams, selectedTeam, handleTeamChange: contextHandleTeamChange } = useTeam();
    const [players, setPlayers] = useState([]);
    const [games, setGames] = useState([]);
    const [newGame, setNewGame] = useState({
        equipo_contrario: '',
        fecha_partido: '',
        lugar: '',
        umpire: 550
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [attendance, setAttendance] = useState({}); // { [gameId]: [playerId1, playerId2] }
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [selectedGameForPayment, setSelectedGameForPayment] = useState(null);
    const [gameFinalizationStatus, setGameFinalizationStatus] = useState({});
    const [showGameForm, setShowGameForm] = useState(false);



    const fetchTeams = async () => {
        const { data, error } = await supabase
            .from('equipos')
            .select('id, nombre_equipo')
            .eq('propietario_id', session.user.id);

        if (error) {
            console.error('Error fetching teams:', error);
        } else {
            setTeams(data);
        }
    };

    const handleTeamChange = async (teamId) => {
        contextHandleTeamChange(teamId);
        if (teamId) {
            fetchPlayers(teamId);
            fetchGames(teamId);
        } else {
            setPlayers([]);
            setGames([]);
        }
    };

    const fetchPlayers = async (teamId) => {
        console.log('Fetching players for team:', teamId);
        const { data, error } = await supabase
            .from('jugadores')
            .select('id, nombre')
            .eq('equipo_id', teamId);
        if (error) {
            console.error('Error fetching players:', error);
            setError('Error al cargar jugadores: ' + error.message);
        } else {
            console.log('Players loaded:', data);
            setPlayers(data || []);
        }
    };

    const fetchGames = async (teamId) => {
        const { data, error } = await supabase
            .from('partidos')
            .select('*, asistencia_partidos(jugador_id)')
            .eq('equipo_id', teamId)
            .order('fecha_partido', { ascending: false });
        if (error) {
            console.error('Error fetching games:', error);
        } else {
            setGames(data);
            // Initialize attendance state with existing attendance data
            const initialAttendance = data.reduce((acc, game) => {
                // Only include players that are already marked as attending
                acc[game.id] = game.asistencia_partidos ? game.asistencia_partidos.map(a => a.jugador_id) : [];
                return acc;
            }, {});
            setAttendance(initialAttendance);
            
            // Initialize finalization status
            const finalizationStatus = data.reduce((acc, game) => {
                acc[game.id] = game.finalizado || false;
                return acc;
            }, {});
            setGameFinalizationStatus(finalizationStatus);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewGame({ 
            ...newGame, 
            [name]: name === 'umpire' ? parseFloat(value) || 0 : value 
        });
    };

    const handleCreateGame = async (e) => {
        e.preventDefault();
        if (!selectedTeam) {
            setError("Por favor, selecciona un equipo.");
            return;
        }
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
            .from('partidos')
            .insert([{ ...newGame, equipo_id: selectedTeam }])
            .select();

        if (error) {
            setError(error.message);
        } else {
            setGames([data[0], ...games]);
            setNewGame({ equipo_contrario: '', fecha_partido: '', lugar: '', umpire: 550 });
            setShowGameForm(false); // Ocultar el formulario después de crear el partido
        }
        setLoading(false);
    };

    const openPaymentForm = (gameId) => {
        setSelectedGameForPayment(gameId);
        setShowPaymentForm(true);
    };

    const closePaymentForm = () => {
        setShowPaymentForm(false);
        setSelectedGameForPayment(null);
    };

    const handlePaymentComplete = () => {
        closePaymentForm();
        // Optionally refresh data or show success message
    };

    const finalizeGame = async (gameId) => {
        if (!confirm('¿Estás seguro de que quieres finalizar este partido? No se podrán registrar más pagos.')) {
            return;
        }

        setLoading(true);
        const { error } = await supabase
            .from('partidos')
            .update({ finalizado: true })
            .eq('id', gameId);

        if (error) {
            setError('Error al finalizar el partido: ' + error.message);
        } else {
            setGameFinalizationStatus(prev => ({
                ...prev,
                [gameId]: true
            }));
            alert('Partido finalizado con éxito. No se pueden registrar más pagos.');
        }
        setLoading(false);
    };

    const handleAttendanceChange = (gameId, playerId) => {
        setAttendance(prev => {
            const gameAttendance = prev[gameId] || [];
            if (gameAttendance.includes(playerId)) {
                return { ...prev, [gameId]: gameAttendance.filter(id => id !== playerId) };
            } else {
                return { ...prev, [gameId]: [...gameAttendance, playerId] };
            }
        });
    };

    const recordAttendance = async (gameId) => {
        setLoading(true);
        const playerIds = attendance[gameId] || [];

        // First, remove existing attendance for this game
        const { error: deleteError } = await supabase
            .from('asistencia_partidos')
            .delete()
            .eq('partido_id', gameId);

        if (deleteError) {
            setError(deleteError.message);
            setLoading(false);
            return;
        }

        // Then, insert new attendance
        const attendanceToInsert = playerIds.map(playerId => ({
            partido_id: gameId,
            jugador_id: playerId,
            equipo_id: selectedTeam
        }));

        const { error: insertError } = await supabase
            .from('asistencia_partidos')
            .insert(attendanceToInsert);

        if (insertError) {
            setError(insertError.message);
        } else {
            alert('Asistencia guardada con éxito!');
            // Refresh the games to show updated attendance
            fetchGames(selectedTeam);
        }
        setLoading(false);
    };

    const loadExistingAttendance = async (gameId) => {
        const { data, error } = await supabase
            .from('asistencia_partidos')
            .select('jugador_id')
            .eq('partido_id', gameId);

        if (error) {
            console.error('Error loading attendance:', error);
        } else {
            const playerIds = data.map(a => a.jugador_id);
            setAttendance(prev => ({
                ...prev,
                [gameId]: playerIds
            }));
        }
    };

    // Cargar datos cuando cambia el equipo seleccionado
    useEffect(() => {
        if (selectedTeam) {
            fetchPlayers(selectedTeam);
            fetchGames(selectedTeam);
        } else {
            setPlayers([]);
            setGames([]);
        }
    }, [selectedTeam]);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Gestión de Partidos</h1>
                                 <Menu />
            </div>

            {selectedTeam ? (
                <>
                    {/* Botón para mostrar/ocultar formulario */}
                    <div className="mb-8">
                        <button
                            onClick={() => setShowGameForm(!showGameForm)}
                            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>{showGameForm ? 'Cancelar' : 'Agregar Partido'}</span>
                        </button>
                    </div>

                    {/* Game Creation Form */}
                    {showGameForm && (
                        <div className="bg-neutral-900 shadow rounded-lg p-6 mb-8">
                        <h2 className="text-xl font-semibold mb-4 text-white">Registrar Nuevo Partido</h2>
                        <form onSubmit={handleCreateGame} className="space-y-4">
                            <input
                                type="text"
                                name="equipo_contrario"
                                placeholder="Equipo Contrario"
                                value={newGame.equipo_contrario}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white"
                                required
                            />
                            <input
                                type="date"
                                name="fecha_partido"
                                value={newGame.fecha_partido}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white"
                                required
                            />
                            <input
                                type="text"
                                name="lugar"
                                placeholder="Lugar del partido"
                                value={newGame.lugar}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white"
                                required
                            />
                            <input
                                type="number"
                                name="umpire"
                                placeholder="Pago al Umpire"
                                value={newGame.umpire}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white"
                                min="0"
                                step="0.01"
                                required
                            />
                                                         <div className="flex space-x-4">
                                 <button 
                                     type="button"
                                     onClick={() => setShowGameForm(false)}
                                     className="flex-1 px-4 py-3 border border-gray-600 text-gray-300 rounded hover:bg-gray-800 transition-colors"
                                 >
                                     Cancelar
                                 </button>
                                 <button 
                                     type="submit" 
                                     disabled={loading} 
                                     className="flex-1 px-4 py-3 bg-gray-800 text-white rounded hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                 >
                                     {loading ? 'Registrando...' : 'Registrar Partido'}
                                 </button>
                             </div>
                             {error && <p className="text-red-500 mt-2">{error}</p>}
                         </form>
                     </div>
                     )}

                    {/* Games List */}
                    <div className="bg-neutral-900 shadow rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4 text-white">Partidos Registrados</h2>
                        <div className="space-y-4">
                            {games.map(game => (
                                <div key={game.id} className="border border-gray-600 rounded-lg p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg">{game.equipo_contrario}</h3>
                                            <p>Fecha: {new Date(game.fecha_partido).toLocaleDateString()}</p>
                                            <p>Lugar: {game.lugar}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <h4 className="font-semibold mb-2">Asistencia de Jugadores</h4>
                                                                                 {players.length === 0 ? (
                                             <div className="text-yellow-500 mb-4">
                                                 No hay jugadores registrados en este equipo. 
                                                 <br />
                                                 <span className="text-sm">Jugadores cargados: {players.length}</span>
                                                 <br />
                                                 <button 
                                                     onClick={() => fetchPlayers(selectedTeam)}
                                                     className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                                                 >
                                                     Recargar Jugadores
                                                 </button>
                                             </div>
                                         ) : (
                                             <div className="grid grid-cols-2 gap-2">
                                                 {players.map(player => (
                                                     <label key={player.id} className="flex items-center space-x-2">
                                                         <input
                                                             type="checkbox"
                                                             checked={attendance[game.id]?.includes(player.id) || false}
                                                             onChange={() => handleAttendanceChange(game.id, player.id)}
                                                             disabled={gameFinalizationStatus[game.id]}
                                                             className="form-checkbox h-5 w-5 text-blue-600 disabled:opacity-50"
                                                         />
                                                         <span className={gameFinalizationStatus[game.id] ? "text-gray-400" : ""}>{player.nombre}</span>
                                                     </label>
                                                 ))}
                                             </div>
                                         )}
                                                                                 <div className="flex space-x-2 mt-4">
                                             <button
                                                 onClick={() => loadExistingAttendance(game.id)}
                                                 disabled={gameFinalizationStatus[game.id]}
                                                 className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                                             >
                                                 Cargar Asistencia Existente
                                             </button>
                                             <button
                                                 onClick={() => recordAttendance(game.id)}
                                                 disabled={gameFinalizationStatus[game.id]}
                                                 className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                             >
                                                 Guardar Asistencia
                                             </button>
                                             <button
                                                 onClick={() => openPaymentForm(game.id)}
                                                 disabled={gameFinalizationStatus[game.id]}
                                                 className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                             >
                                                 Registrar Pagos
                                             </button>
                                         </div>
                                        
                                                                                 {gameFinalizationStatus[game.id] ? (
                                             <div className="mt-4 p-3 bg-red-900 border border-red-600 rounded">
                                                 <span className="text-red-200 font-semibold">🔒 PARTIDO FINALIZADO</span>
                                                 <p className="text-red-100 text-sm">No se pueden modificar la asistencia ni registrar más pagos</p>
                                             </div>
                                         ) : (
                                            <div className="mt-4 pt-3 border-t border-gray-600">
                                                <button
                                                    onClick={() => finalizeGame(game.id)}
                                                    disabled={loading}
                                                    className="w-full px-4 py-3 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 font-semibold"
                                                >
                                                    {loading ? 'Finalizando...' : '🔒 Finalizar Partido'}
                                                </button>
                                                                                                 <p className="text-gray-400 text-xs text-center mt-2">
                                                     Al finalizar no se podrán modificar la asistencia ni registrar más pagos
                                                 </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-neutral-900 shadow rounded-lg p-8 text-center">
                    <p className="text-gray-400 mb-4">No hay equipo seleccionado</p>
                    <p className="text-sm text-gray-500">Selecciona un equipo desde el Dashboard para gestionar partidos</p>
                </div>
            )}

            {/* Payment Form Modal */}
            {showPaymentForm && selectedGameForPayment && (
                <PaymentForm
                    gameId={selectedGameForPayment}
                    teamId={selectedTeam}
                    onClose={closePaymentForm}
                    onPaymentComplete={handlePaymentComplete}
                />
            )}
        </div>
    );
};

export default Schedule;

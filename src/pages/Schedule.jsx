import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { UserAuth } from '../context/AuthContext';
import PaymentForm from '../components/PaymentForm';
import Menu from '../components/Menu';
import { useTeam } from '../context/TeamContext';
import { useModal } from '../hooks/useModal';
import ScheduleCardsGrid from '../components/ScheduleCardsGrid';
import ScheduleForm from '../components/ScheduleForm';
import ScheduleHistoryModal from '../components/ScheduleHistoryModal';

const Schedule = () => {
    const authContext = UserAuth();
    const session = authContext?.session;
    const { teams, selectedTeam, handleTeamChange: contextHandleTeamChange } = useTeam();
    
    // Obtener el nombre del equipo local
    const getLocalTeamName = () => {
        const localTeam = teams.find(team => team.id === selectedTeam);
        return localTeam ? localTeam.nombre_equipo : 'Tu Equipo';
    };

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
    const [success, setSuccess] = useState(null);
    const [attendance, setAttendance] = useState({}); // { [gameId]: [playerId1, playerId2] }
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [selectedGameForPayment, setSelectedGameForPayment] = useState(null);
    const [gameFinalizationStatus, setGameFinalizationStatus] = useState({});
    const [showGameForm, setShowGameForm] = useState(false);
    const [actionMenuOpen, setActionMenuOpen] = useState(null);
    const [showAttendanceForm, setShowAttendanceForm] = useState({});
    const [editingGame, setEditingGame] = useState(null);
    const [paymentTotals, setPaymentTotals] = useState({});
    const [showScoreForm, setShowScoreForm] = useState(false);
    const [selectedGameForScore, setSelectedGameForScore] = useState(null);
    const [scoreData, setScoreData] = useState({
        carreras_equipo_local: 0,
        carreras_equipo_contrario: 0
    });
    const [showGameDetailsModal, setShowGameDetailsModal] = useState(false);
    const [selectedGameForDetails, setSelectedGameForDetails] = useState(null);
    const [gameDetailsData, setGameDetailsData] = useState({
        attendance: [],
        payments: []
    });

    // Usar el hook para manejar los modales
    useModal(showGameDetailsModal || showScoreForm);

    // Limpiar mensaje de éxito después de 5 segundos
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                setSuccess(null)
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [success])

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
        const { data, error } = await supabase
            .from('jugadores')
            .select('id, nombre')
            .eq('equipo_id', teamId);
        if (error) {
            console.error('Error fetching players:', error);
            setError('Error al cargar jugadores: ' + error.message);
        } else {
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
            
            // Fetch payment totals for each game
            await fetchPaymentTotals(data);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewGame({ 
            ...newGame, 
            [name]: name === 'umpire' ? parseFloat(value) || 0 : value 
        });
    };

    // Función para manejar el menú de acciones
    const toggleActionMenu = (gameId) => {
        setActionMenuOpen(actionMenuOpen === gameId ? null : gameId);
    };



    // Función para habilitar/deshabilitar formulario de asistencia
    const toggleAttendanceForm = (gameId) => {
        setShowAttendanceForm(prev => ({
            ...prev,
            [gameId]: !prev[gameId]
        }));
        setActionMenuOpen(null);
    };

    // Función para editar partido
    const editGame = (game) => {
        setEditingGame(game);
        setNewGame({
            equipo_contrario: game.equipo_contrario,
            fecha_partido: game.fecha_partido,
            lugar: game.lugar,
            umpire: game.umpire || 550
        });
        setShowGameForm(true);
        setActionMenuOpen(null);
    };

    // Función para actualizar partido
    const updateGame = async (e) => {
        e.preventDefault();
        if (!editingGame) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('partidos')
                .update({
                    equipo_contrario: newGame.equipo_contrario,
                    fecha_partido: newGame.fecha_partido,
                    lugar: newGame.lugar,
                    umpire: newGame.umpire
                })
                .eq('id', editingGame.id);

            if (error) {
                setError('Error al actualizar partido: ' + error.message);
            } else {
                setSuccess('Partido actualizado exitosamente');
                setEditingGame(null);
                setShowGameForm(false);
                setNewGame({ equipo_contrario: '', fecha_partido: '', lugar: '', umpire: 550 });
                await fetchGames(selectedTeam);
            }
        } catch (error) {
            setError('Error inesperado al actualizar partido');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGame = async (e) => {
        e.preventDefault();
        if (!selectedTeam) {
            setError("Por favor, selecciona un equipo.");
            return;
        }
        setLoading(true);
        setError(null);

        try {
            if (editingGame) {
                // Actualizar partido existente
                const { error } = await supabase
                    .from('partidos')
                    .update({
                        equipo_contrario: newGame.equipo_contrario,
                        fecha_partido: newGame.fecha_partido,
                        lugar: newGame.lugar,
                        umpire: newGame.umpire
                    })
                    .eq('id', editingGame.id);

                if (error) {
                    setError('Error al actualizar partido: ' + error.message);
                } else {
                    setSuccess('Partido actualizado exitosamente');
                    setEditingGame(null);
                    setShowGameForm(false);
                    setNewGame({ equipo_contrario: '', fecha_partido: '', lugar: '', umpire: 550 });
                    await fetchGames(selectedTeam);
                }
            } else {
                // Crear nuevo partido
                const { data, error } = await supabase
                    .from('partidos')
                    .insert([{ ...newGame, equipo_id: selectedTeam }])
                    .select();

                if (error) {
                    setError(error.message);
                } else {
                    // Recargar la lista completa para mantener el orden correcto
                    await fetchGames(selectedTeam);
                    setNewGame({ equipo_contrario: '', fecha_partido: '', lugar: '', umpire: 550 });
                    setShowGameForm(false); // Ocultar el formulario después de crear el partido
                }
            }
        } catch (error) {
            setError('Error inesperado al registrar partido');
        } finally {
            setLoading(false);
        }
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
        // Refresh payment totals after payment is completed
        if (games.length > 0) {
            fetchPaymentTotals(games);
        }
    };

    const openScoreForm = (game) => {
        setSelectedGameForScore(game);
        setScoreData({
            carreras_equipo_local: game.carreras_equipo_local || 0,
            carreras_equipo_contrario: game.carreras_equipo_contrario || 0
        });
        setShowScoreForm(true);
        setActionMenuOpen(null);
    };

    const closeScoreForm = () => {
        setShowScoreForm(false);
        setSelectedGameForScore(null);
        setScoreData({ carreras_equipo_local: 0, carreras_equipo_contrario: 0 });
    };

    const handleScoreSubmit = async (e) => {
        e.preventDefault();
        if (!selectedGameForScore) return;

        setLoading(true);
        try {
            // Calcular el resultado
            let resultado = 'Pendiente';
            if (scoreData.carreras_equipo_local > scoreData.carreras_equipo_contrario) {
                resultado = 'Victoria';
            } else if (scoreData.carreras_equipo_local < scoreData.carreras_equipo_contrario) {
                resultado = 'Derrota';
            } else {
                resultado = 'Empate';
            }

            const { error } = await supabase
                .from('partidos')
                .update({
                    carreras_equipo_local: scoreData.carreras_equipo_local,
                    carreras_equipo_contrario: scoreData.carreras_equipo_contrario,
                    resultado: resultado,
                    finalizado: true
                })
                .eq('id', selectedGameForScore.id);

            if (error) {
                setError('Error al finalizar el partido: ' + error.message);
            } else {
                setSuccess(`Partido finalizado con éxito. Resultado: ${resultado}`);
                setGameFinalizationStatus(prev => ({
                    ...prev,
                    [selectedGameForScore.id]: true
                }));
                closeScoreForm();
                await fetchGames(selectedTeam);
            }
        } catch (error) {
            setError('Error inesperado al finalizar el partido');
        } finally {
            setLoading(false);
        }
    };

    const handleScoreInputChange = (e) => {
        const { name, value } = e.target;
        setScoreData(prev => ({
            ...prev,
            [name]: parseInt(value) || 0
        }));
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
            setSuccess('Asistencia guardada con éxito!');
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

    const fetchPaymentTotals = async (gamesData) => {
        const totals = {};
        
        for (const game of gamesData) {
            const { data, error } = await supabase
                .from('pagos')
                .select('monto_umpire, monto_inscripcion')
                .eq('partido_id', game.id);
            
            if (error) {
                console.error('Error fetching payment totals for game:', game.id, error);
                totals[game.id] = { totalUmpire: 0, totalInscripcion: 0 };
            } else {
                const totalUmpire = data.reduce((sum, payment) => sum + (payment.monto_umpire || 0), 0);
                const totalInscripcion = data.reduce((sum, payment) => sum + (payment.monto_inscripcion || 0), 0);
                totals[game.id] = { totalUmpire, totalInscripcion };
            }
        }
        
        setPaymentTotals(totals);
    };

    const openGameDetailsModal = async (game) => {
        setSelectedGameForDetails(game);
        setShowGameDetailsModal(true);
        
        // Cargar datos detallados del partido
        try {
            // Obtener asistencia detallada
            const { data: attendanceData, error: attendanceError } = await supabase
                .from('asistencia_partidos')
                .select(`
                    jugador_id,
                    jugadores!inner(nombre)
                `)
                .eq('partido_id', game.id);
            
            if (attendanceError) {
                console.error('Error fetching attendance details:', attendanceError);
            }
            
            // Obtener pagos detallados
            const { data: paymentsData, error: paymentsError } = await supabase
                .from('pagos')
                .select(`
                    id,
                    monto_umpire,
                    monto_inscripcion,
                    fecha_pago,
                    jugadores!inner(nombre)
                `)
                .eq('partido_id', game.id)
                .order('fecha_pago', { ascending: false });
            
            if (paymentsError) {
                console.error('Error fetching payment details:', paymentsError);
            }
            
            setGameDetailsData({
                attendance: attendanceData || [],
                payments: paymentsData || []
            });
        } catch (error) {
            console.error('Error loading game details:', error);
        }
    };

    const closeGameDetailsModal = () => {
        setShowGameDetailsModal(false);
        setSelectedGameForDetails(null);
        setGameDetailsData({ attendance: [], payments: [] });
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
        <>
            <div>
                                <div className="flex justify-between items-center mb-8">
                        <h1 className="text-2xl font-bold text-white">Gestión de Partidos</h1>
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
                    <ScheduleForm
                        showForm={showGameForm}
                        newGame={newGame}
                        onInputChange={handleInputChange}
                        onSubmit={handleCreateGame}
                        onCancel={() => {
                            setShowGameForm(false);
                            setEditingGame(null);
                            setNewGame({ equipo_contrario: '', fecha_partido: '', lugar: '', umpire: 550 });
                        }}
                        loading={loading}
                        editingGame={editingGame}
                        error={error}
                    />

                                         {/* Games List */}
                     <div className="bg-neutral-900 shadow rounded-lg p-6 border border-gray-700">
                        <h2 className="text-xl font-semibold mb-6 text-white">Partidos Registrados</h2>
                        
                        {/* Mensajes de error y éxito */}
                        {error && (
                            <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded mb-6">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-green-900 border border-green-600 text-green-200 px-4 py-3 rounded mb-6">
                                {success}
                            </div>
                        )}
                        
                                                <ScheduleCardsGrid
                            games={games}
                            paymentTotals={paymentTotals}
                            gameFinalizationStatus={gameFinalizationStatus}
                            onCardClick={openGameDetailsModal}
                            onActionMenuToggle={toggleActionMenu}
                            onAttendanceFormToggle={toggleAttendanceForm}
                            onEditGame={editGame}
                            onOpenPaymentForm={openPaymentForm}
                            onOpenScoreForm={openScoreForm}
                            actionMenuOpen={actionMenuOpen}
                            players={players}
                            attendance={attendance}
                            onAttendanceChange={handleAttendanceChange}
                            onLoadExistingAttendance={loadExistingAttendance}
                            onRecordAttendance={recordAttendance}
                            onFetchPlayers={fetchPlayers}
                            selectedTeam={selectedTeam}
                            showAttendanceForm={showAttendanceForm}
                        />
                    </div>
                </>
            ) : (
                                 <div className="bg-neutral-900 shadow rounded-lg p-8 text-center border border-gray-700">
                    <p className="text-gray-300 mb-4">No hay equipo seleccionado</p>
                    <p className="text-sm text-gray-400">Selecciona un equipo desde el Dashboard para gestionar partidos</p>
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

                                                   {/* Game Details Modal */}
                          <ScheduleHistoryModal
                              showModal={showGameDetailsModal}
                              selectedGame={selectedGameForDetails}
                              paymentTotals={paymentTotals}
                              gameDetailsData={gameDetailsData}
                              onClose={closeGameDetailsModal}
                              getLocalTeamName={getLocalTeamName}
                          />

             {/* Score Form Modal */}
             {showScoreForm && selectedGameForScore && (
                <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50">
                    <div className="bg-neutral-900 border border-gray-600 rounded-lg w-full max-w-md mx-4 modal-container">
                        <div className="modal-header p-6 border-b border-gray-600">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-white">Finalizar Partido</h2>
                                <button
                                    onClick={closeScoreForm}
                                    className="text-gray-400 hover:text-white text-2xl"
                                    title="Cerrar formulario de resultado"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                        
                        <div className="modal-content p-6">
                            <div className="mb-4 p-3 bg-gray-800 rounded">
                                <p className="text-gray-300 text-xs">Fecha: {new Date(selectedGameForScore.fecha_partido).toLocaleDateString()}</p>
                            </div>

                            <form onSubmit={handleScoreSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-white mb-2 text-sm">{getLocalTeamName()}</label>
                                    <input
                                        type="number"
                                        name="carreras_equipo_local"
                                        value={scoreData.carreras_equipo_local}
                                        onChange={handleScoreInputChange}
                                        min="0"
                                        className="w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white text-center text-lg font-semibold"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-white mb-2 text-sm">{selectedGameForScore.equipo_contrario}</label>
                                    <input
                                        type="number"
                                        name="carreras_equipo_contrario"
                                        value={scoreData.carreras_equipo_contrario}
                                        onChange={handleScoreInputChange}
                                        min="0"
                                        className="w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white text-center text-lg font-semibold"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Preview del resultado */}
                            <div className="p-3 bg-gray-800 rounded text-center">
                                <p className="text-white text-sm mb-1">Resultado:</p>
                                <p className="text-2xl font-bold text-white">
                                    {scoreData.carreras_equipo_local} - {scoreData.carreras_equipo_contrario}
                                </p>
                                <p className={`text-sm font-semibold ${
                                    scoreData.carreras_equipo_local > scoreData.carreras_equipo_contrario ? 'text-green-400' :
                                    scoreData.carreras_equipo_local < scoreData.carreras_equipo_contrario ? 'text-red-400' :
                                    'text-yellow-400'
                                }`}>
                                    {scoreData.carreras_equipo_local > scoreData.carreras_equipo_contrario ? 'Victoria' :
                                     scoreData.carreras_equipo_local < scoreData.carreras_equipo_contrario ? 'Derrota' :
                                     'Empate'}
                                </p>
                            </div>

                            <div className="bg-yellow-900 border border-yellow-600 text-yellow-200 px-4 py-3 rounded text-sm">
                                <div className="flex items-center space-x-2">
                                    <span className="text-yellow-300">⚠️</span>
                                    <span>Al finalizar el partido no se podrán registrar más pagos ni modificar la asistencia.</span>
                                </div>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    onClick={closeScoreForm}
                                    className="flex-1 px-4 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? 'Finalizando...' : 'Finalizar Partido'}
                                </button>
                            </div>
                        </form>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </>
    );
};

export default Schedule;

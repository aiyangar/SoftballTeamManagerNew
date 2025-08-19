import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { UserAuth } from '../context/AuthContext';
import PaymentForm from './PaymentForm';
import Menu from './Menu';
import { useTeam } from '../context/TeamContext';
import { useModal } from '../hooks/useModal';

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
                    {showGameForm && (
                        <div className="bg-neutral-900 shadow rounded-lg p-6 mb-8">
                            <h2 className="text-xl font-semibold mb-6 text-white">
                                {editingGame ? 'Editar Partido' : 'Registrar Nuevo Partido'}
                            </h2>
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
                                        onClick={() => {
                                            setShowGameForm(false);
                                            setEditingGame(null);
                                            setNewGame({ equipo_contrario: '', fecha_partido: '', lugar: '', umpire: 550 });
                                        }}
                                        className="flex-1 px-4 py-3 border border-gray-600 text-gray-300 rounded hover:bg-gray-800 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={loading} 
                                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {loading ? (editingGame ? 'Actualizando...' : 'Registrando...') : (editingGame ? 'Actualizar Partido' : 'Registrar Partido')}
                                    </button>
                                </div>
                                {error && <p className="text-red-500 mt-2">{error}</p>}
                            </form>
                        </div>
                    )}

                    {/* Games List */}
                    <div className="bg-neutral-900 shadow rounded-lg p-6">
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
                        
                        {games.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-300">No hay partidos registrados aún.</p>
                                <p className="text-sm text-gray-400 mt-1">Registra tu primer partido usando el formulario de arriba.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {games.map(game => (
                                    <div 
                                        key={game.id} 
                                        className="border border-gray-600 rounded-lg p-4 cursor-pointer hover:bg-gray-800 transition-colors"
                                        onClick={() => openGameDetailsModal(game)}
                                    >
                                                                                 {gameFinalizationStatus[game.id] ? (
                                             // Partido finalizado - Vista compacta
                                             <div>
                                                 <div className="flex justify-between items-start">
                                                     <div className="flex-1">
                                                         <h3 className="font-bold text-lg">{game.equipo_contrario}</h3>
                                                         <p>Fecha: {new Date(game.fecha_partido).toLocaleDateString()}</p>
                                                         
                                                         {/* Marcador siempre visible */}
                                                         {game.resultado && (
                                                             <div className="mt-2 p-2 bg-gray-700 rounded">
                                                                 <p className="text-sm font-semibold text-white">
                                                                     Marcador: {game.carreras_equipo_local || 0} - {game.carreras_equipo_contrario || 0}
                                                                 </p>
                                                                 <p className={`text-xs ${
                                                                     game.resultado === 'Victoria' ? 'text-green-400' :
                                                                     game.resultado === 'Derrota' ? 'text-red-400' :
                                                                     'text-yellow-400'
                                                                 }`}>
                                                                     Resultado: {game.resultado}
                                                                 </p>
                                                             </div>
                                                         )}
                                                         
                                                         {/* Estado de finalización */}
                                                         <div className="mt-2 p-2 bg-red-900 border border-red-600 rounded">
                                                             <span className="text-red-200 font-semibold text-sm">🔒 PARTIDO FINALIZADO</span>
                                                         </div>
                                                     </div>
                                                 </div>
                                             </div>
                                        ) : (
                                            // Partido no finalizado - Vista completa
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-lg">{game.equipo_contrario}</h3>
                                                    <p>Fecha: {new Date(game.fecha_partido).toLocaleDateString()}</p>
                                                    <p>Lugar: {game.lugar}</p>
                                                    <p>Umpire: ${game.umpire || 550}</p>
                                                    
                                                    {/* Información de Pagos Acumulados */}
                                                    {paymentTotals[game.id] && (
                                                        <div className="mt-3 p-3 bg-gray-800 rounded-lg text-center">
                                                            <h4 className="font-semibold text-white text-sm mb-2">Estado de Pagos</h4>
                                                            
                                                            {/* Umpire */}
                                                            <div className="mb-2">
                                                                <div className="flex justify-between items-center mb-1">
                                                                    <span className="text-gray-300 text-xs">Umpire:</span>
                                                                    <span className="text-white text-sm font-semibold">
                                                                        ${paymentTotals[game.id].totalUmpire.toLocaleString()} / ${game.umpire?.toLocaleString() || '550'}
                                                                    </span>
                                                                </div>
                                                                <div className="w-full bg-gray-700 rounded-full h-1.5">
                                                                    <div 
                                                                        className="h-1.5 rounded-full transition-all duration-300"
                                                                        style={{ 
                                                                            width: `${Math.min((paymentTotals[game.id].totalUmpire / (game.umpire || 550)) * 100, 100)}%`,
                                                                            backgroundColor: paymentTotals[game.id].totalUmpire >= (game.umpire || 550) 
                                                                                ? '#10B981' // Verde cuando se alcanza el objetivo
                                                                                : paymentTotals[game.id].totalUmpire >= (game.umpire || 550) * 0.8
                                                                                ? '#F59E0B' // Amarillo cuando está cerca (80%+)
                                                                                : paymentTotals[game.id].totalUmpire >= (game.umpire || 550) * 0.5
                                                                                ? '#F97316' // Naranja cuando está a la mitad (50%+)
                                                                                : '#DC2626' // Rojo por defecto
                                                                        }}
                                                                    ></div>
                                                                </div>
                                                                <div className="flex justify-between text-xs mt-1">
                                                                    <span className="text-gray-400">
                                                                        {paymentTotals[game.id].totalUmpire >= (game.umpire || 550) ? '✅ Completado' : '💰 Recaudado'}
                                                                    </span>
                                                                    <span className="text-gray-400">
                                                                        {paymentTotals[game.id].totalUmpire >= (game.umpire || 550) 
                                                                            ? 'Meta alcanzada' 
                                                                            : `Faltan $${((game.umpire || 550) - paymentTotals[game.id].totalUmpire).toLocaleString()}`
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Inscripción */}
                                                            <div>
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-gray-300 text-xs">Inscripción:</span>
                                                                    <span className="text-white text-sm font-semibold">
                                                                        ${paymentTotals[game.id].totalInscripcion.toLocaleString()}
                                                                    </span>
                                                                </div>
                                                                <div className="text-xs text-gray-400 mt-1">
                                                                    Total recaudado
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="relative">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleActionMenu(game.id);
                                                        }}
                                                        className="px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-500 transition-colors"
                                                        title="Opciones del partido"
                                                    >
                                                        ⋮
                                                    </button>
                                                    
                                                                                                         {actionMenuOpen === game.id && (
                                                         <>
                                                             <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50">
                                                                 <div className="py-1">
                                                                     <button
                                                                         onClick={(e) => {
                                                                             e.stopPropagation();
                                                                             toggleAttendanceForm(game.id);
                                                                         }}
                                                                         disabled={gameFinalizationStatus[game.id]}
                                                                         className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50"
                                                                     >
                                                                         📋 Asistencia
                                                                     </button>
                                                                     <button
                                                                         onClick={(e) => {
                                                                             e.stopPropagation();
                                                                             editGame(game);
                                                                         }}
                                                                         disabled={gameFinalizationStatus[game.id]}
                                                                         className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50"
                                                                     >
                                                                         ✏️ Editar Partido
                                                                     </button>
                                                                     <button
                                                                         onClick={(e) => {
                                                                             e.stopPropagation();
                                                                             openPaymentForm(game.id);
                                                                         }}
                                                                         disabled={gameFinalizationStatus[game.id]}
                                                                         className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50"
                                                                     >
                                                                         💰 Registrar Pagos
                                                                     </button>
                                                                     {!gameFinalizationStatus[game.id] && (
                                                                         <button
                                                                             onClick={(e) => {
                                                                                 e.stopPropagation();
                                                                                 openScoreForm(game);
                                                                             }}
                                                                             className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900 transition-colors"
                                                                         >
                                                                             ⚾ Finalizar Partido
                                                                         </button>
                                                                     )}
                                                                 </div>
                                                             </div>
                                                             {/* Overlay para cerrar menú */}
                                                             <div 
                                                                 className="fixed inset-0 z-40" 
                                                                 onClick={(e) => {
                                                                     e.stopPropagation();
                                                                     setActionMenuOpen(null);
                                                                 }}
                                                             />
                                                         </>
                                                     )}
                                                </div>
                                            </div>
                                        )}
                                        
                                                                                 {/* Sección de Asistencia - Solo se muestra cuando está habilitada */}
                                         {showAttendanceForm[game.id] && (
                                             <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                                                 <div className="flex justify-between items-center mb-2">
                                                     <h4 className="font-semibold">Asistencia de Jugadores</h4>
                                                     <button
                                                         onClick={() => toggleAttendanceForm(game.id)}
                                                         className="text-gray-400 hover:text-white"
                                                         title="Cerrar formulario de asistencia"
                                                     >
                                                         ✕
                                                     </button>
                                                 </div>
                                                
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
                                                </div>
                                            </div>
                                        )}
                                        
                                        
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="bg-neutral-900 shadow rounded-lg p-8 text-center">
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
             {showGameDetailsModal && selectedGameForDetails && (
                 <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50">
                     <div className="bg-neutral-900 border border-gray-600 rounded-lg w-full max-w-4xl mx-4 modal-container">
                         <div className="modal-header p-6 border-b border-gray-600">
                             <div className="flex justify-between items-center">
                                 <h2 className="text-2xl font-semibold text-white">Detalles del Partido</h2>
                                 <button
                                     onClick={closeGameDetailsModal}
                                     className="text-gray-400 hover:text-white text-2xl"
                                     title="Cerrar detalles del partido"
                                 >
                                     ×
                                 </button>
                             </div>
                         </div>
                         
                         <div className="modal-content p-6">
                             {/* Información básica del partido */}
                             <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div>
                                     <h3 className="text-lg font-semibold text-white mb-2">{selectedGameForDetails.equipo_contrario}</h3>
                                     <p className="text-gray-300">Fecha: {new Date(selectedGameForDetails.fecha_partido).toLocaleDateString()}</p>
                                     <p className="text-gray-300">Lugar: {selectedGameForDetails.lugar}</p>
                                     <p className="text-gray-300">Umpire: ${selectedGameForDetails.umpire || 550}</p>
                                 </div>
                                 <div>
                                     {selectedGameForDetails.resultado && (
                                         <div className="text-center">
                                             <p className="text-gray-300 text-sm mb-1">Resultado:</p>
                                             <p className="text-2xl font-bold text-white">
                                                 {selectedGameForDetails.carreras_equipo_local || 0} - {selectedGameForDetails.carreras_equipo_contrario || 0}
                                             </p>
                                             <p className={`text-sm font-semibold ${
                                                 selectedGameForDetails.resultado === 'Victoria' ? 'text-green-400' :
                                                 selectedGameForDetails.resultado === 'Derrota' ? 'text-red-400' :
                                                 'text-yellow-400'
                                             }`}>
                                                 {selectedGameForDetails.resultado}
                                             </p>
                                         </div>
                                     )}
                                     {selectedGameForDetails.finalizado && (
                                         <div className="mt-2 p-2 bg-red-900 border border-red-600 rounded text-center">
                                             <span className="text-red-200 font-semibold text-sm">🔒 PARTIDO FINALIZADO</span>
                                         </div>
                                     )}
                                 </div>
                             </div>
                         </div>
                         
                         {/* Estado de Pagos */}
                         {paymentTotals[selectedGameForDetails.id] && (
                             <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                                 <h3 className="text-lg font-semibold text-white mb-4">Estado de Pagos</h3>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     {/* Umpire */}
                                     <div>
                                         <div className="flex justify-between items-center mb-2">
                                             <span className="text-gray-300">Umpire:</span>
                                             <span className="text-white font-semibold">
                                                 ${paymentTotals[selectedGameForDetails.id].totalUmpire.toLocaleString()} / ${selectedGameForDetails.umpire?.toLocaleString() || '550'}
                                             </span>
                                         </div>
                                         <div className="w-full bg-gray-700 rounded-full h-2">
                                             <div 
                                                 className="h-2 rounded-full transition-all duration-300"
                                                 style={{ 
                                                     width: `${Math.min((paymentTotals[selectedGameForDetails.id].totalUmpire / (selectedGameForDetails.umpire || 550)) * 100, 100)}%`,
                                                     backgroundColor: paymentTotals[selectedGameForDetails.id].totalUmpire >= (selectedGameForDetails.umpire || 550) 
                                                         ? '#10B981' 
                                                         : paymentTotals[selectedGameForDetails.id].totalUmpire >= (selectedGameForDetails.umpire || 550) * 0.8
                                                         ? '#F59E0B' 
                                                         : paymentTotals[selectedGameForDetails.id].totalUmpire >= (selectedGameForDetails.umpire || 550) * 0.5
                                                         ? '#F97316' 
                                                         : '#DC2626' 
                                                 }}
                                             ></div>
                                         </div>
                                         <p className="text-xs text-gray-400 mt-1">
                                             {paymentTotals[selectedGameForDetails.id].totalUmpire >= (selectedGameForDetails.umpire || 550) 
                                                 ? '✅ Meta alcanzada' 
                                                 : `Faltan $${((selectedGameForDetails.umpire || 550) - paymentTotals[selectedGameForDetails.id].totalUmpire).toLocaleString()}`
                                             }
                                         </p>
                                     </div>
                                     
                                     {/* Inscripción */}
                                     <div>
                                         <div className="flex justify-between items-center mb-2">
                                             <span className="text-gray-300">Inscripción:</span>
                                             <span className="text-white font-semibold">
                                                 ${paymentTotals[selectedGameForDetails.id].totalInscripcion.toLocaleString()}
                                             </span>
                                         </div>
                                         <p className="text-xs text-gray-400">Total recaudado</p>
                                     </div>
                                 </div>
                             </div>
                         )}
                         
                         {/* Asistencia */}
                         <div className="mb-6">
                             <h3 className="text-lg font-semibold text-white mb-4">Asistencia ({gameDetailsData.attendance.length} jugadores)</h3>
                             {gameDetailsData.attendance.length > 0 ? (
                                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                     {gameDetailsData.attendance.map((att, index) => (
                                         <div key={index} className="p-3 bg-gray-800 rounded-lg text-center">
                                             <div className="text-green-400 text-2xl mb-1">✓</div>
                                             <p className="text-white text-sm">{att.jugadores?.nombre || 'Jugador'}</p>
                                         </div>
                                     ))}
                                 </div>
                             ) : (
                                 <div className="p-4 bg-gray-800 rounded-lg text-center">
                                     <p className="text-gray-400">No hay registros de asistencia</p>
                                 </div>
                             )}
                         </div>
                         
                         {/* Pagos Detallados */}
                         <div>
                             <h3 className="text-lg font-semibold text-white mb-4">Pagos Registrados ({gameDetailsData.payments.length} pagos)</h3>
                             {gameDetailsData.payments.length > 0 ? (
                                 <div className="space-y-3">
                                     {gameDetailsData.payments.map((payment) => (
                                         <div key={payment.id} className="p-4 bg-gray-800 rounded-lg">
                                             <div className="flex justify-between items-start mb-2">
                                                 <div>
                                                     <p className="text-white font-semibold">{payment.jugadores?.nombre || 'Jugador'}</p>
                                                     <p className="text-gray-400 text-sm">
                                                         {new Date(payment.fecha_pago).toLocaleDateString()}
                                                     </p>
                                                 </div>
                                                 <div className="text-right">
                                                     {payment.monto_umpire > 0 && (
                                                         <p className="text-green-400 text-sm">
                                                             Umpire: ${payment.monto_umpire.toLocaleString()}
                                                         </p>
                                                     )}
                                                     {payment.monto_inscripcion > 0 && (
                                                         <p className="text-blue-400 text-sm">
                                                             Inscripción: ${payment.monto_inscripcion.toLocaleString()}
                                                         </p>
                                                     )}
                                                 </div>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             ) : (
                                 <div className="p-4 bg-gray-800 rounded-lg text-center">
                                     <p className="text-gray-400">No hay pagos registrados</p>
                                 </div>
                             )}
                         </div>
                         </div>
                     </div>
                 </div>
             )}

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

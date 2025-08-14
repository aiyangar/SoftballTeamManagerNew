import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { UserAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Schedule = () => {
    const { session } = UserAuth();
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);
    const [games, setGames] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState('');
    const [newGame, setNewGame] = useState({
        equipo_contrario: '',
        fecha_partido: '',
        lugar: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [attendance, setAttendance] = useState({}); // { [gameId]: [playerId1, playerId2] }

    useEffect(() => {
        if (session) {
            fetchTeams();
        }
    }, [session]);

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
        setSelectedTeam(teamId);
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
            .select('id, nombre_completo')
            .eq('equipo_id', teamId);
        if (error) {
            console.error('Error fetching players:', error);
        } else {
            setPlayers(data);
        }
    };

    const fetchGames = async (teamId) => {
        const { data, error } = await supabase
            .from('partidos')
            .select('*, asistencia(jugador_id)')
            .eq('equipo_id', teamId)
            .order('fecha_partido', { ascending: false });
        if (error) {
            console.error('Error fetching games:', error);
        } else {
            setGames(data);
            // Initialize attendance state
            const initialAttendance = data.reduce((acc, game) => {
                acc[game.id] = game.asistencia.map(a => a.jugador_id);
                return acc;
            }, {});
            setAttendance(initialAttendance);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewGame({ ...newGame, [name]: value });
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
            setNewGame({ equipo_contrario: '', fecha_partido: '', lugar: '' });
        }
        setLoading(false);
    };

    const registerPayments = async (gameId) => {
        setLoading(true);
        const playerIds = attendance[gameId] || [];

        if (playerIds.length === 0) {
            alert("No hay jugadores en la lista de asistencia para este partido.");
            setLoading(false);
            return;
        }

        const paymentsToInsert = playerIds.map(playerId => ({
            jugador_id: playerId,
            fecha_pago: new Date(),
            monto_umpire: 10, // Example value
            monto_inscripcion: 5, // Example value
            concepto: 'Pago de partido',
            metodo_pago: 'Efectivo',
            equipo_id: selectedTeam
        }));

        const { error } = await supabase
            .from('pagos')
            .insert(paymentsToInsert);

        if (error) {
            setError(error.message);
            alert('Error al registrar los pagos.');
        } else {
            alert('Pagos registrados con éxito para los asistentes.');
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
            .from('asistencia')
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
            .from('asistencia')
            .insert(attendanceToInsert);

        if (insertError) {
            setError(insertError.message);
        } else {
            alert('Asistencia guardada con éxito!');
            // Optional: trigger payment registration here or with another button
        }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Gestión de Partidos</h1>
                <Link to="/dashboard" className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900">
                    Volver al Dashboard
                </Link>
            </div>

            {/* Team Selector */}
            <div className="bg-neutral-900 shadow rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 text-white">Seleccionar Equipo</h2>
                <select
                    value={selectedTeam}
                    onChange={(e) => handleTeamChange(e.target.value)}
                    className="w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white"
                >
                    <option value="">Selecciona un equipo</option>
                    {teams.map((team) => (
                        <option key={team.id} value={team.id}>{team.nombre_equipo}</option>
                    ))}
                </select>
            </div>

            {selectedTeam && (
                <>
                    {/* Game Creation Form */}
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
                            <button type="submit" disabled={loading} className="w-full mt-6 border border-gray-600 rounded-md p-3 bg-gray-800 text-white hover:bg-gray-900">
                                {loading ? 'Registrando...' : 'Registrar Partido'}
                            </button>
                            {error && <p className="text-red-500 mt-2">{error}</p>}
                        </form>
                    </div>

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
                                        <div className="grid grid-cols-2 gap-2">
                                            {players.map(player => (
                                                <label key={player.id} className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={attendance[game.id]?.includes(player.id) || false}
                                                        onChange={() => handleAttendanceChange(game.id, player.id)}
                                                        className="form-checkbox h-5 w-5 text-blue-600"
                                                    />
                                                    <span>{player.nombre_completo}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <div className="flex space-x-2 mt-4">
                                            <button
                                                onClick={() => recordAttendance(game.id)}
                                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                            >
                                                Actualizar Asistencia
                                            </button>
                                            <button
                                                onClick={() => registerPayments(game.id)}
                                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                            >
                                                Registrar Pagos
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Schedule;

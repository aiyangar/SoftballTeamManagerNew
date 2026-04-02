import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../supabaseClient';
import { UserAuth } from '../context/AuthContext';
import PaymentForm from '../components/Forms/PaymentForm';
import Menu from '../components/Menu';
import { useTeam } from '../context/useTeam';
import { useModal } from '../hooks/useModal';
import ScheduleCardsGrid from '../components/CardGrids/ScheduleCardsGrid';
import ScheduleForm from '../components/Forms/ScheduleForm';
import ScheduleHistoryModal from '../components/Modals/ScheduleHistoryModal';
import PlayerHistoryModal from '../components/Modals/PlayerHistoryModal';
import LineupModal from '../components/Modals/LineupModal';
import SubstitutionModal from '../components/Modals/SubstitutionModal';

const Schedule = () => {
  const { teams, selectedTeam } = useTeam();
  const { session } = UserAuth() || {};

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
    umpire: 550,
  });
  const [loading, setLoading] = useState(false);
  const [loadingGames, setLoadingGames] = useState(false);
  const [lineupRefreshKey, setLineupRefreshKey] = useState(0);
  const [attendance, setAttendance] = useState({}); // { [gameId]: [playerId1, playerId2] }
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedGameForPayment, setSelectedGameForPayment] = useState(null);
  const [gameFinalizationStatus, setGameFinalizationStatus] = useState({});
  const [showGameForm, setShowGameForm] = useState(false);
  const [showAttendanceForm, setShowAttendanceForm] = useState({});
  const [editingGame, setEditingGame] = useState(null);
  const [paymentTotals, setPaymentTotals] = useState({});
  const [showScoreForm, setShowScoreForm] = useState(false);
  const [selectedGameForScore, setSelectedGameForScore] = useState(null);
  const [scoreData, setScoreData] = useState({
    carreras_equipo_local: 0,
    carreras_equipo_contrario: 0,
  });
  const [showGameDetailsModal, setShowGameDetailsModal] = useState(false);
  const [selectedGameForDetails, setSelectedGameForDetails] = useState(null);
  const [gameDetailsData, setGameDetailsData] = useState({
    attendance: [],
    payments: [],
    lineup: [],
  });

  // Estados para el modal de historial del jugador
  const [showPlayerHistoryModal, setShowPlayerHistoryModal] = useState(false);
  const [selectedPlayerForHistory, setSelectedPlayerForHistory] =
    useState(null);
  const [playerHistory, setPlayerHistory] = useState({
    attendance: [],
    payments: [],
    totalUmpirePaid: 0,
    totalInscripcionPaid: 0,
    gamesPlayed: 0,
    gamesAttended: 0,
    attendanceRate: 0,
  });
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    attendance: false,
    payments: false,
  });
  const [_inscripcionTarget, setInscripcionTarget] = useState(450);
  const [playerInscripcionTarget, setPlayerInscripcionTarget] = useState(450);

  // Estados para lineup y sustituciones
  const [showLineupModal, setShowLineupModal] = useState(false);
  const [selectedGameForLineup, setSelectedGameForLineup] = useState(null);
  const [showSubstitutionModal, setShowSubstitutionModal] = useState(false);
  const [activeLineupForSubstitution, setActiveLineupForSubstitution] = useState([]);
  const [leagueTeams, setLeagueTeams] = useState([]);

  // Usar el hook para manejar los modales
  useModal(
    showGameDetailsModal ||
      showScoreForm ||
      showPlayerHistoryModal ||
      showLineupModal ||
      showSubstitutionModal
  );

  // Calcular la meta de inscripción dinámicamente
  const calculateInscripcionTarget = async () => {
    if (!selectedTeam) return;

    try {
      // Obtener el total de inscripción requerida del equipo
      const { data: teamData, error: teamError } = await supabase
        .from('equipos')
        .select('inscripcion')
        .eq('id', selectedTeam)
        .single();

      if (teamError) throw teamError;

      // Obtener el promedio de asistentes por partido
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('asistencia_partidos')
        .select('partido_id, partidos!inner(equipo_id)')
        .eq('partidos.equipo_id', selectedTeam);

      if (attendanceError) throw attendanceError;

      // Calcular promedio de asistentes por partido
      const totalGames = attendanceData.length;
      const totalAttendance = attendanceData.length; // Cada registro es una asistencia

      if (totalGames > 0) {
        const averageAttendance = totalAttendance / totalGames;
        const target = Math.round(
          teamData.inscripcion / averageAttendance
        );
        setInscripcionTarget(target);
      }
    } catch (_error) {
      setInscripcionTarget(450); // Valor por defecto
    }
  };

  // Calcular meta de inscripción cuando cambie el equipo
  useEffect(() => {
    if (selectedTeam) {
      calculateInscripcionTarget();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeam]);

  /**
   * Calcula la meta personal de inscripción para un jugador específico
   * @param {number} playerId - ID del jugador
   * @param {number} teamId - ID del equipo del jugador
   * @returns {number} - Meta personal calculada
   */
  const calculatePlayerInscripcionTarget = async (playerId, teamId) => {
    if (!playerId || !teamId) return 450;

    try {
      // Obtener información del equipo del jugador
      const { data: teamData, error: teamError } = await supabase
        .from('equipos')
        .select('inscripcion')
        .eq('id', teamId)
        .single();

      if (teamError || !teamData) {
        return 450;
      }

      const totalInscripcion = teamData.inscripcion || 0;
      if (totalInscripcion === 0) return 450;

      // Obtener estadísticas de asistencia del equipo del jugador
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('asistencia_partidos')
        .select('partido_id')
        .eq('equipo_id', teamId);

      if (attendanceError) {
        return 450;
      }

      // Obtener total de partidos del equipo del jugador
      const { data: gamesData, error: gamesError } = await supabase
        .from('partidos')
        .select('id')
        .eq('equipo_id', teamId);

      if (gamesError) {
        return 450;
      }

      const totalGames = gamesData?.length || 0;
      const totalAttendance = attendanceData?.length || 0;

      // Calcular promedio de asistentes por juego
      const averageAttendance =
        totalGames > 0 ? totalAttendance / totalGames : 0;

      // Si no hay asistencias registradas, usar un promedio estimado de 12 jugadores
      const effectiveAverageAttendance =
        averageAttendance > 0 ? averageAttendance : 12;

      // Calcular meta: total de inscripción / promedio de asistentes
      const calculatedTarget = Math.round(
        totalInscripcion / effectiveAverageAttendance
      );

      // Asegurar que la meta esté en un rango razonable ($200 - $800)
      const finalTarget = Math.max(200, Math.min(800, calculatedTarget));

      return finalTarget;
    } catch (_error) {
      return 450;
    }
  };

  /**
   * Obtiene la información histórica completa de un jugador
   * @param {number} playerId - ID del jugador
   * @param {number} teamId - ID del equipo
   */
  const fetchPlayerHistory = async (playerId, teamId) => {
    setLoadingHistory(true);
    try {
      // Obtener asistencia a partidos (filtrar por partidos del equipo específico)
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('asistencia_partidos')
        .select(
          `
                    partido_id,
                    partidos!inner (
                        id,
                        equipo_contrario,
                        fecha_partido,
                        lugar,
                        finalizado,
                        resultado,
                        carreras_equipo_local,
                        carreras_equipo_contrario
                    )
                `
        )
        .eq('jugador_id', playerId)
        .eq('partidos.equipo_id', teamId);

      if (attendanceError) {
        // Error al obtener asistencia
      }

      // Obtener pagos realizados (filtrar por partidos del equipo específico)
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('pagos')
        .select(
          `
                    id,
                    monto_umpire,
                    monto_inscripcion,
                    fecha_pago,
                    metodo_pago,
                    partidos!inner (
                        id,
                        equipo_contrario,
                        fecha_partido
                    )
                `
        )
        .eq('jugador_id', playerId)
        .eq('partidos.equipo_id', teamId)
        .order('fecha_pago', { ascending: false });

      if (paymentsError) {
        // Error al obtener pagos
      }

      // Obtener todos los partidos del equipo
      const { data: allGamesData, error: gamesError } = await supabase
        .from('partidos')
        .select('id, fecha_partido, finalizado')
        .eq('equipo_id', teamId)
        .order('fecha_partido', { ascending: false });

      if (gamesError) {
        // Error al obtener partidos
      }

      // Calcular estadísticas
      const attendance = attendanceData || [];
      const payments = paymentsData || [];
      const allGames = allGamesData || [];

      const totalUmpirePaid = payments.reduce(
        (sum, payment) => sum + (payment.monto_umpire || 0),
        0
      );
      const totalInscripcionPaid = payments.reduce(
        (sum, payment) => sum + (payment.monto_inscripcion || 0),
        0
      );
      const gamesPlayed = allGames.length;
      const gamesAttended = attendance.length;
      const attendanceRate =
        gamesPlayed > 0 ? ((gamesAttended / gamesPlayed) * 100).toFixed(1) : 0;

      const historyData = {
        attendance,
        payments,
        totalUmpirePaid,
        totalInscripcionPaid,
        gamesPlayed,
        gamesAttended,
        attendanceRate,
      };

      setPlayerHistory(historyData);
    } catch (_err) {
      // Error al obtener historial del jugador
    } finally {
      setLoadingHistory(false);
    }
  };

  /**
   * Abre el modal con la información histórica del jugador
   * @param {Object} player - Objeto del jugador
   */
  const openPlayerHistoryModal = async player => {
    if (!player || !player.id) {
      return;
    }

    if (!selectedTeam) {
      return;
    }

    setSelectedPlayerForHistory(player);
    setShowPlayerHistoryModal(true);

    // Calcular la meta personal del jugador basada en su equipo
    const playerTeamId = player.equipo_id || selectedTeam;
    const personalTarget = await calculatePlayerInscripcionTarget(player.id, playerTeamId);
    setPlayerInscripcionTarget(personalTarget);

    // Cargar los datos del historial después de abrir el modal
    try {
      await fetchPlayerHistory(player.id, selectedTeam);
    } catch (_error) {
      // Error al cargar historial
    }
  };

  /**
   * Cierra el modal de historial del jugador
   */
  const closePlayerHistoryModal = () => {
    setShowPlayerHistoryModal(false);
    setSelectedPlayerForHistory(null);
    setPlayerInscripcionTarget(450); // Resetear la meta personal
    setPlayerHistory({
      attendance: [],
      payments: [],
      totalUmpirePaid: 0,
      totalInscripcionPaid: 0,
      gamesPlayed: 0,
      gamesAttended: 0,
      attendanceRate: 0,
    });
    setExpandedSections({
      attendance: false,
      payments: false,
    });
  };

  /**
   * Cambia el estado de expansión de las secciones del modal
   * @param {string} section - Nombre de la sección
   */
  const toggleSection = section => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Nota: fetchTeams y handleTeamChange se manejan a través del contexto useTeam
  // No necesitamos implementar estas funciones aquí ya que se manejan en TeamContext

  const fetchPlayers = async teamId => {
    const { data, error } = await supabase
      .from('jugadores')
      .select('id, nombre, numero')
      .eq('equipo_id', teamId)
      .order('numero', { ascending: true });
    if (error) {
      toast.error('Error al cargar jugadores: ' + error.message);
    } else {
      setPlayers(data || []);
    }
  };

  const fetchGames = async teamId => {
    setLoadingGames(true);
    const { data, error } = await supabase
      .from('partidos')
      .select('*, asistencia_partidos(jugador_id)')
      .eq('equipo_id', teamId)
      .order('fecha_partido', { ascending: false });
    if (error) {
      // Error fetching games
    } else {
      setGames(data);
      // Initialize attendance state with existing attendance data
      const initialAttendance = data.reduce((acc, game) => {
        // Only include players that are already marked as attending
        acc[game.id] = game.asistencia_partidos
          ? game.asistencia_partidos.map(a => a.jugador_id)
          : [];
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
    setLoadingGames(false);
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setNewGame({
      ...newGame,
      [name]: name === 'umpire' ? parseFloat(value) || 0 : value,
    });
  };

  // Función para habilitar/deshabilitar formulario de asistencia
  const toggleAttendanceForm = gameId => {
    setShowAttendanceForm(prev => ({
      ...prev,
      [gameId]: !prev[gameId],
    }));
  };

  // Función para editar partido
  const editGame = game => {
    setEditingGame(game);
    setNewGame({
      equipo_contrario: game.equipo_contrario,
      fecha_partido: game.fecha_partido,
      lugar: game.lugar,
      umpire: game.umpire || 550,
    });
    setShowGameForm(true);
  };

  // Función para actualizar partido (comentada por no uso actual)
  // const updateGame = async (e) => {
  //     e.preventDefault();
  //     if (!editingGame) return;

  //     setLoading(true);
  //     try {
  //         const { error } = await supabase
  //             .from('partidos')
  //             .update({
  //                 equipo_contrario: newGame.equipo_contrario,
  //                 fecha_partido: newGame.fecha_partido,
  //                 lugar: newGame.lugar,
  //                 umpire: newGame.umpire
  //             })
  //             .eq('id', editingGame.id);

  //         if (error) {
  //             toast.error('Error al actualizar partido: ' + error.message);
  //         } else {
  //             toast.success('Partido actualizado exitosamente');
  //             setEditingGame(null);
  //             setShowGameForm(false);
  //             setNewGame({ equipo_contrario: '', fecha_partido: '', lugar: '', umpire: 550 });
  //             await fetchGames(selectedTeam);
  //         }
  //     } catch (error) {
  //         toast.error('Error inesperado al actualizar partido');
  //     } finally {
  //         setLoading(false);
  //     }
  // };

  const handleCreateGame = async e => {
    e.preventDefault();
    if (!selectedTeam) {
      toast.error('Por favor, selecciona un equipo.');
      return;
    }
    setLoading(true);
    try {
      if (editingGame) {
        // Actualizar partido existente
        const { error } = await supabase
          .from('partidos')
          .update({
            equipo_contrario: newGame.equipo_contrario,
            fecha_partido: newGame.fecha_partido,
            lugar: newGame.lugar,
            umpire: newGame.umpire,
          })
          .eq('id', editingGame.id);

        if (error) {
          toast.error('Error al actualizar partido: ' + error.message);
        } else {
          toast.success('Partido actualizado exitosamente');
          setEditingGame(null);
          setShowGameForm(false);
          setNewGame({
            equipo_contrario: '',
            fecha_partido: '',
            lugar: '',
            umpire: 550,
          });
          await fetchGames(selectedTeam);
        }
      } else {
        // Crear nuevo partido
        const { error } = await supabase
          .from('partidos')
          .insert([{ ...newGame, equipo_id: selectedTeam }])
          .select();

        if (error) {
          toast.error(error.message);
        } else {
          // Recargar la lista completa para mantener el orden correcto
          await fetchGames(selectedTeam);
          setNewGame({
            equipo_contrario: '',
            fecha_partido: '',
            lugar: '',
            umpire: 550,
          });
          setShowGameForm(false); // Ocultar el formulario después de crear el partido
        }
      }
    } catch {
      toast.error('Error inesperado al registrar partido');
    } finally {
      setLoading(false);
    }
  };

  const openPaymentForm = gameId => {
    setSelectedGameForPayment(gameId);
    setShowPaymentForm(true);
  };

  const closePaymentForm = () => {
    setShowPaymentForm(false);
    setSelectedGameForPayment(null);
  };

  const handlePaymentComplete = async (paymentRegistered = false) => {
    closePaymentForm();

    // Actualizar los datos del juego específico después del pago
    if (selectedGameForPayment) {
      await updateGameAfterPayment(selectedGameForPayment);
    }

    // Solo mostrar mensaje y abrir modal si se registró un pago
    if (paymentRegistered) {
      // Mostrar mensaje de éxito temporal
      toast.success(
        '✅ Pago registrado exitosamente. Abriendo detalles del partido...'
      );

      // Pequeño delay para transición suave
      setTimeout(async () => {
        // Abrir automáticamente el modal de detalles del partido
        if (selectedGameForPayment) {
          const game = games.find(g => g.id === selectedGameForPayment);
          if (game) {
            await openGameDetailsModal(game);
          }
        }
      }, 800); // 800ms de delay para que se vea el mensaje
    } else {
      // Si no se registró un pago pero el modal de detalles está abierto, actualizar sus datos
      if (showGameDetailsModal && selectedGameForDetails) {
        await loadGameDetails(selectedGameForDetails.id);
      }
    }
  };

  const openScoreForm = game => {
    setSelectedGameForScore(game);
    setScoreData({
      carreras_equipo_local: game.carreras_equipo_local || 0,
      carreras_equipo_contrario: game.carreras_equipo_contrario || 0,
    });
    setShowScoreForm(true);
  };

  const closeScoreForm = () => {
    setShowScoreForm(false);
    setSelectedGameForScore(null);
    setScoreData({ carreras_equipo_local: 0, carreras_equipo_contrario: 0 });
  };

  const handleScoreSubmit = async e => {
    e.preventDefault();
    if (!selectedGameForScore) return;

    setLoading(true);
    try {
      // Calcular el resultado
      let resultado = 'Pendiente';
      if (
        scoreData.carreras_equipo_local > scoreData.carreras_equipo_contrario
      ) {
        resultado = 'Victoria';
      } else if (
        scoreData.carreras_equipo_local < scoreData.carreras_equipo_contrario
      ) {
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
          finalizado: true,
        })
        .eq('id', selectedGameForScore.id);

      if (error) {
        toast.error('Error al finalizar el partido: ' + error.message);
      } else {
        toast.success(`Partido finalizado con éxito. Resultado: ${resultado}`);
        setGameFinalizationStatus(prev => ({
          ...prev,
          [selectedGameForScore.id]: true,
        }));
        closeScoreForm();
        await fetchGames(selectedTeam);
      }
    } catch {
      toast.error('Error inesperado al finalizar el partido');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreInputChange = e => {
    const { name, value } = e.target;
    setScoreData(prev => ({
      ...prev,
      [name]: parseInt(value) || 0,
    }));
  };

  const handleAttendanceChange = (gameId, playerIds) => {
    // Asegurar que playerIds sea siempre un array
    const ids = Array.isArray(playerIds) ? playerIds : [playerIds];

    setAttendance(prev => {
      return { ...prev, [gameId]: ids };
    });
  };

  const recordAttendance = async gameId => {
    const playerIds = attendance[gameId] || [];

    try {
      // First, remove existing attendance for this game
      const { error: deleteError } = await supabase
        .from('asistencia_partidos')
        .delete()
        .eq('partido_id', gameId);

      if (deleteError) {
        toast.error(
          'Error al limpiar asistencia anterior: ' + deleteError.message
        );
        return false;
      }

      // Then, insert new attendance only if there are players
      if (playerIds.length > 0) {
        // Validar que todos los IDs sean números válidos
        const validPlayerIds = playerIds.filter(id => {
          const isValid =
            typeof id === 'number' ||
            (typeof id === 'string' && !isNaN(parseInt(id)));
          return isValid;
        });

        if (validPlayerIds.length !== playerIds.length) {
          toast.error('Error: Algunos IDs de jugadores no son válidos');
          return false;
        }

        const attendanceToInsert = validPlayerIds.map(playerId => ({
          partido_id: parseInt(gameId),
          jugador_id: parseInt(playerId),
          equipo_id: parseInt(selectedTeam),
        }));

        const { data: _data, error: insertError } = await supabase
          .from('asistencia_partidos')
          .insert(attendanceToInsert)
          .select();

        if (insertError) {
          toast.error('Error al guardar asistencia: ' + insertError.message);
          return false;
        }
      }

      toast.success(`✅ Asistencia guardada: ${playerIds.length} jugadores`);

      // Update local state instead of refetching everything
      const updatedGames = games.map(game => {
        if (game.id === gameId) {
          return {
            ...game,
            asistencia_partidos: playerIds.map(id => ({ jugador_id: id })),
          };
        }
        return game;
      });
      setGames(updatedGames);

      return true;
    } catch (error) {
      toast.error('Error inesperado al guardar asistencia: ' + error.message);
      return false;
    }
  };

  const loadExistingAttendance = async gameId => {
    try {
      const { data: attendanceData, error } = await supabase
        .from('asistencia_partidos')
        .select('jugador_id')
        .eq('partido_id', gameId);

      if (error) {
        toast.error('Error al cargar asistencia existente: ' + error.message);
        return false;
      }

      const playerIds = attendanceData.map(a => a.jugador_id);
      setAttendance(prev => ({
        ...prev,
        [gameId]: playerIds,
      }));

      // Mostrar feedback visual
      if (playerIds.length > 0) {
        toast.success(
          `📋 Cargada asistencia existente: ${playerIds.length} jugadores`
        );
      } else {
        toast.success('📋 No hay asistencia previa registrada');
      }

      return true;
    } catch (error) {
      toast.error('Error inesperado al cargar asistencia: ' + error.message);
      return false;
    }
  };

  const fetchPaymentTotals = async gamesData => {
    const totals = {};

    for (const game of gamesData) {
      const { data: paymentData, error } = await supabase
        .from('pagos')
        .select('monto_umpire, monto_inscripcion')
        .eq('partido_id', game.id);

      if (error) {
        totals[game.id] = { totalUmpire: 0, totalInscripcion: 0 };
      } else {
        const totalUmpire = paymentData.reduce(
          (sum, payment) => sum + (payment.monto_umpire || 0),
          0
        );
        const totalInscripcion = paymentData.reduce(
          (sum, payment) => sum + (payment.monto_inscripcion || 0),
          0
        );
        totals[game.id] = { totalUmpire, totalInscripcion };
      }
    }

    setPaymentTotals(totals);

    // También actualizar el estado local de los juegos para reflejar los nuevos totales
    setGames(prevGames =>
      prevGames.map(game => ({
        ...game,
        paymentTotals: totals[game.id] || {
          totalUmpire: 0,
          totalInscripcion: 0,
        },
      }))
    );
  };

  const openGameDetailsModal = async game => {
    setSelectedGameForDetails(game);
    setShowGameDetailsModal(true);

    // Cargar datos detallados del partido
    await loadGameDetails(game.id);
  };

  // Función para recargar datos del modal
  const reloadGameDetails = async () => {
    if (selectedGameForDetails) {
      await loadGameDetails(selectedGameForDetails.id);
    }
  };

  const updateGameAfterPayment = async gameId => {
    // Actualizar los totales de pagos para el juego específico
    const { data: paymentData, error } = await supabase
      .from('pagos')
      .select('monto_umpire, monto_inscripcion')
      .eq('partido_id', gameId);

    if (!error && paymentData) {
      const totalUmpire = paymentData.reduce(
        (sum, payment) => sum + (payment.monto_umpire || 0),
        0
      );
      const totalInscripcion = paymentData.reduce(
        (sum, payment) => sum + (payment.monto_inscripcion || 0),
        0
      );

      // Actualizar el estado de paymentTotals
      setPaymentTotals(prev => ({
        ...prev,
        [gameId]: { totalUmpire, totalInscripcion },
      }));

      // Actualizar el estado de games
      setGames(prevGames =>
        prevGames.map(game =>
          game.id === gameId
            ? { ...game, paymentTotals: { totalUmpire, totalInscripcion } }
            : game
        )
      );
    }
  };

  const loadGameDetails = async gameId => {
    try {
      // Obtener asistencia detallada
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('asistencia_partidos')
        .select(
          `
                    jugador_id,
                    jugadores!inner(id, nombre)
                `
        )
        .eq('partido_id', gameId);

      if (attendanceError) {
        // Error fetching attendance details
      }

      // Obtener pagos detallados
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('pagos')
        .select(
          `
                    id,
                    monto_umpire,
                    monto_inscripcion,
                    fecha_pago,
                    metodo_pago,
                    jugadores!inner(id, nombre)
                `
        )
        .eq('partido_id', gameId)
        .order('fecha_pago', { ascending: false });

      if (paymentsError) {
        // Error fetching payment details
      }

      // Obtener lineup del partido
      const { data: lineupData, error: lineupError } = await supabase
        .from('lineup_partidos')
        .select('orden_bateo, posicion_campo, es_titular, activo, batea_por_id, jugadores!lineup_partidos_jugador_id_fkey(id, nombre, numero)')
        .eq('partido_id', gameId)
        .order('orden_bateo');

      if (lineupError) {
        // Error fetching lineup details
      }

      setGameDetailsData({
        attendance: attendanceData || [],
        payments: paymentsData || [],
        lineup: lineupData || [],
      });
    } catch (_err) {
      // Error loading game details
    }
  };

  const closeGameDetailsModal = () => {
    setShowGameDetailsModal(false);
    setSelectedGameForDetails(null);
    setGameDetailsData({ attendance: [], payments: [], lineup: [] });
  };

  // ---- Lineup ----

  const fetchLineup = async partidoId => {
    const { data, error } = await supabase
      .from('lineup_partidos')
      .select(
        `id, orden_bateo, posicion_campo, es_titular, activo, batea_por_id,
         jugadores!lineup_partidos_jugador_id_fkey(id, nombre, numero)`
      )
      .eq('partido_id', partidoId)
      .order('orden_bateo');
    if (error) {
      toast.error('Error al cargar lineup: ' + error.message);
      return [];
    }
    return data || [];
  };

  const saveLineup = async (partidoId, equipoId, lineupRows) => {
    setLoading(true);
    try {
      const { error: deleteError } = await supabase
        .from('lineup_partidos')
        .delete()
        .eq('partido_id', parseInt(partidoId));
      if (deleteError) throw deleteError;

      if (lineupRows.length > 0) {
        const { error: insertError } = await supabase
          .from('lineup_partidos')
          .insert(
            lineupRows.map(row => ({
              partido_id: parseInt(partidoId),
              equipo_id: parseInt(equipoId),
              jugador_id: parseInt(row.jugador_id),
              ...(row.orden_bateo != null && { orden_bateo: row.orden_bateo }),
              posicion_campo: row.posicion_campo,
              es_titular: row.es_titular ?? true,
              activo: row.activo ?? true,
              ...(row.batea_por_id && { batea_por_id: parseInt(row.batea_por_id) }),
            }))
          );
        if (insertError) throw insertError;
      }
      toast.success('✅ Lineup guardado exitosamente');
    } catch (err) {
      toast.error('Error al guardar lineup: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveSubstitution = async (partidoId, equipoId, sub) => {
    setLoading(true);
    try {
      const { error: sustError } = await supabase
        .from('sustituciones_partidos')
        .insert([
          {
            partido_id: parseInt(partidoId),
            equipo_id: parseInt(equipoId),
            jugador_sale_id: parseInt(sub.jugador_sale_id),
            jugador_entra_id: parseInt(sub.jugador_entra_id),
            inning: sub.inning,
            orden_bateo: sub.orden_bateo,
            posicion_campo: sub.posicion_campo,
            notas: sub.notas || null,
          },
        ]);
      if (sustError) throw sustError;

      const { error: updateError } = await supabase
        .from('lineup_partidos')
        .update({ activo: false })
        .eq('partido_id', parseInt(partidoId))
        .eq('jugador_id', parseInt(sub.jugador_sale_id));
      if (updateError) throw updateError;

      const { error: insertError } = await supabase
        .from('lineup_partidos')
        .insert([
          {
            partido_id: parseInt(partidoId),
            equipo_id: parseInt(equipoId),
            jugador_id: parseInt(sub.jugador_entra_id),
            orden_bateo: sub.orden_bateo,
            posicion_campo: sub.posicion_campo,
            es_titular: false,
            activo: true,
          },
        ]);
      if (insertError) throw insertError;

      // Desactivar fila de banca del jugador que entra (si existía)
      await supabase
        .from('lineup_partidos')
        .update({ activo: false })
        .eq('partido_id', parseInt(partidoId))
        .eq('jugador_id', parseInt(sub.jugador_entra_id))
        .is('orden_bateo', null);

      setLineupRefreshKey(prev => prev + 1);
    } catch (err) {
      toast.error('Error al registrar sustitución: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const openLineupModal = game => {
    setSelectedGameForLineup(game);
    setShowLineupModal(true);
  };

  const closeLineupModal = () => {
    setShowLineupModal(false);
    setSelectedGameForLineup(null);
  };

  const openSubstitutionModal = activeLineup => {
    setActiveLineupForSubstitution(activeLineup);
    setShowSubstitutionModal(true);
  };

  const closeSubstitutionModal = () => {
    setShowSubstitutionModal(false);
    setActiveLineupForSubstitution([]);
  };

  // Función para eliminar partido
  const deleteGame = async gameId => {
    setLoading(true);
    try {
      // Primero eliminar registros relacionados
      const { error: attendanceError } = await supabase
        .from('asistencia_partidos')
        .delete()
        .eq('partido_id', gameId);

      if (attendanceError) {
        // Error deleting attendance
      }

      const { error: paymentsError } = await supabase
        .from('pagos')
        .delete()
        .eq('partido_id', gameId);

      if (paymentsError) {
        // Error deleting payments
      }

      // Luego eliminar el partido
      const { error } = await supabase
        .from('partidos')
        .delete()
        .eq('id', gameId);

      if (error) {
        toast.error('Error al eliminar partido: ' + error.message);
      } else {
        toast.success('Partido eliminado exitosamente');
        await fetchGames(selectedTeam);
      }
    } catch (_err) {
      toast.error('Error inesperado al eliminar partido');
    } finally {
      setLoading(false);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeam]);

  // Cargar equipos de la liga
  useEffect(() => {
    const fetchLeagueTeams = async () => {
      const userId = session?.user?.id;
      if (!userId) return;
      const { data } = await supabase
        .from('equipos_liga')
        .select('id, nombre')
        .eq('user_id', userId)
        .order('nombre', { ascending: true });
      if (data) setLeagueTeams(data);
    };
    fetchLeagueTeams();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  return (
    <>
      <div>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-2xl font-bold text-white'>Gestión de Partidos</h1>
        </div>

        {selectedTeam ? (
          <>
            {/* Botón para mostrar/ocultar formulario */}
            <div className='mb-8'>
              <button
                onClick={() => setShowGameForm(!showGameForm)}
                className='btn btn-primary'
              >
                <svg
                  className='w-5 h-5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                  />
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
                setNewGame({
                  equipo_contrario: '',
                  fecha_partido: '',
                  lugar: '',
                  umpire: 550,
                });
              }}
              loading={loading}
              editingGame={editingGame}
              leagueTeams={leagueTeams}
            />

            {/* Games List */}
            <div className='bg-neutral-900 shadow rounded-lg p-6 border border-gray-700'>
              <h2 className='text-xl font-semibold mb-6 text-white'>
                Partidos Registrados
              </h2>

              <ScheduleCardsGrid
                games={games}
                loading={loadingGames}
                paymentTotals={paymentTotals}
                gameFinalizationStatus={gameFinalizationStatus}
                onCardClick={openGameDetailsModal}
                onAttendanceFormToggle={toggleAttendanceForm}
                onEditGame={editGame}
                onOpenPaymentForm={openPaymentForm}
                onOpenScoreForm={openScoreForm}
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
          <div className='bg-neutral-900 shadow rounded-lg p-8 text-center border border-gray-700'>
            <p className='text-gray-300 mb-4'>No hay equipo seleccionado</p>
            <p className='text-sm text-gray-400'>
              Selecciona un equipo desde el Dashboard para gestionar partidos
            </p>
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
          onEditGame={editGame}
          onDeleteGame={deleteGame}
          gameFinalizationStatus={
            selectedGameForDetails
              ? gameFinalizationStatus[selectedGameForDetails.id]
              : false
          }
          onOpenPaymentForm={openPaymentForm}
          players={players}
          attendance={attendance}
          onAttendanceChange={handleAttendanceChange}
          onRecordAttendance={recordAttendance}
          onLoadExistingAttendance={loadExistingAttendance}
          onReloadDetails={reloadGameDetails}
          onViewPlayerHistory={openPlayerHistoryModal}
          onOpenScoreForm={openScoreForm}
          onOpenLineup={openLineupModal}
        />

        {/* Lineup Modal */}
        <LineupModal
          show={showLineupModal}
          game={selectedGameForLineup}
          players={players}
          attendingPlayerIds={gameDetailsData.attendance.map(a => a.jugadores.id)}
          onClose={closeLineupModal}
          onFetchLineup={fetchLineup}
          onSave={saveLineup}
          onOpenSubstitution={openSubstitutionModal}
          refreshKey={lineupRefreshKey}
          gameFinalizationStatus={
            selectedGameForLineup
              ? gameFinalizationStatus[selectedGameForLineup.id]
              : false
          }
        />

        {/* Substitution Modal */}
        <SubstitutionModal
          show={showSubstitutionModal}
          game={selectedGameForLineup}
          players={players}
          attendingPlayerIds={gameDetailsData.attendance.map(a => a.jugadores.id)}
          activeLineup={activeLineupForSubstitution}
          onClose={closeSubstitutionModal}
          onSave={saveSubstitution}
        />

        {/* Score Form Modal */}
        {showScoreForm && selectedGameForScore && (
          <div className='fixed inset-0 modal-overlay flex items-center justify-center z-50'>
            <div className='bg-neutral-900 border border-gray-600 rounded-lg w-full max-w-md mx-4 modal-container'>
              <div className='modal-header p-6 border-b border-gray-600'>
                <div className='flex justify-between items-center'>
                  <h2 className='text-xl font-semibold text-white'>
                    Finalizar Partido
                  </h2>
                  <button
                    onClick={closeScoreForm}
                    className='text-gray-400 hover:text-white text-2xl'
                    title='Cerrar formulario de resultado'
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className='modal-content p-6'>
                <div className='mb-4 p-3 bg-gray-800 rounded'>
                  <p className='text-gray-300 text-xs'>
                    Fecha:{' '}
                    {new Date(
                      selectedGameForScore.fecha_partido
                    ).toLocaleDateString()}
                  </p>
                </div>

                <form onSubmit={handleScoreSubmit} className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-white mb-2 text-sm'>
                        {getLocalTeamName()}
                      </label>
                      <input
                        type='number'
                        name='carreras_equipo_local'
                        value={scoreData.carreras_equipo_local}
                        onChange={handleScoreInputChange}
                        min='0'
                        className='w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white text-center text-lg font-semibold'
                        required
                      />
                    </div>
                    <div>
                      <label className='block text-white mb-2 text-sm'>
                        {selectedGameForScore.equipo_contrario}
                      </label>
                      <input
                        type='number'
                        name='carreras_equipo_contrario'
                        value={scoreData.carreras_equipo_contrario}
                        onChange={handleScoreInputChange}
                        min='0'
                        className='w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white text-center text-lg font-semibold'
                        required
                      />
                    </div>
                  </div>

                  {/* Preview del resultado */}
                  <div className='p-3 bg-gray-800 rounded text-center'>
                    <p className='text-white text-sm mb-1'>Resultado:</p>
                    <p className='text-2xl font-bold text-white'>
                      {scoreData.carreras_equipo_local} -{' '}
                      {scoreData.carreras_equipo_contrario}
                    </p>
                    <p
                      className={`text-sm font-semibold ${
                        scoreData.carreras_equipo_local >
                        scoreData.carreras_equipo_contrario
                          ? 'text-green-400'
                          : scoreData.carreras_equipo_local <
                              scoreData.carreras_equipo_contrario
                            ? 'text-red-400'
                            : 'text-yellow-400'
                      }`}
                    >
                      {scoreData.carreras_equipo_local >
                      scoreData.carreras_equipo_contrario
                        ? 'Victoria'
                        : scoreData.carreras_equipo_local <
                            scoreData.carreras_equipo_contrario
                          ? 'Derrota'
                          : 'Empate'}
                    </p>
                  </div>

                  <div className='bg-yellow-900 border border-yellow-600 text-yellow-200 px-4 py-3 rounded text-sm'>
                    <div className='flex items-center space-x-2'>
                      <span className='text-yellow-300'>⚠️</span>
                      <span>
                        Al finalizar el partido no se podrán registrar más pagos
                        ni modificar la asistencia.
                      </span>
                    </div>
                  </div>

                  <div className='flex space-x-3'>
                    <button
                      type='button'
                      onClick={closeScoreForm}
                      className='btn btn-secondary flex-1'
                    >
                      Cancelar
                    </button>
                    <button
                      type='submit'
                      disabled={loading}
                      className='btn btn-danger flex-1'
                    >
                      {loading ? 'Finalizando...' : 'Finalizar Partido'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Player History Modal */}
        <PlayerHistoryModal
          isOpen={showPlayerHistoryModal}
          player={selectedPlayerForHistory}
          history={playerHistory}
          loadingHistory={loadingHistory}
          expandedSections={expandedSections}
          inscripcionTarget={playerInscripcionTarget}
          onToggleSection={toggleSection}
          onClose={closePlayerHistoryModal}
          onEdit={() => {
            // Aquí podrías implementar la edición del jugador si es necesario
          }}
          onDelete={() => {
            // Aquí podrías implementar la eliminación del jugador si es necesario
          }}
        />
      </div>
    </>
  );
};

export default Schedule;

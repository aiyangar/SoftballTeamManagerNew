import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import Menu from '../components/Menu';
import { useTeam } from '../context/useTeam';
import { useModal } from '../hooks/useModal';
import PlayerCard from '../components/Cards/PlayerCard';
import PlayerCardsGrid from '../components/CardGrids/PlayerCardsGrid';
import PlayerForm from '../components/Forms/PlayerForm';
import PlayerFilters from '../components/PlayerFilters';
import PlayerHistoryModal from '../components/Modals/PlayerHistoryModal';

/**
 * Componente para la gestión de jugadores
 * Permite crear, editar y eliminar jugadores
 * Permite asignar jugadores a equipos
 * Permite eliminar jugadores de equipos
 * Permite ver la lista de jugadores existentes
 * Permite que los jugadores elijan hasta 3 posiciones
 */
const Players = () => {
  // Estados para manejar el formulario
  const [name, setName] = useState('');
  const [numero, setNumero] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [equipoId, setEquipoId] = useState('');
  const [selectedPositions, setSelectedPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const { teams, selectedTeam } = useTeam();
  const [positions, setPositions] = useState([]);
  // const [loadingPositions, setLoadingPositions] = useState(false)
  const [showForm, setShowForm] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Estados para filtros
  const [filters, setFilters] = useState({
    nombre: '',
    numero: '',
    posiciones: [],
    posicionMatchType: 'any', // 'any' = al menos una, 'all' = todas
  });
  const [showFilters, setShowFilters] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
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
  const [playerInscripcionTotals, setPlayerInscripcionTotals] = useState({});
  const [inscripcionTarget, setInscripcionTarget] = useState(450);

  // Usar el hook para manejar el modal
  useModal(showPlayerHistoryModal);

  // Hook para navegación programática
  const navigate = useNavigate();

  // Obtener estado de sesión del contexto
  const authContext = UserAuth();
  const session = authContext?.session;

  // Limpiar mensaje de éxito después de 5 segundos
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  /**
   * Obtiene la información histórica completa de un jugador
   * @param {number} playerId - ID del jugador
   * @param {number} teamId - ID del equipo
   */
  const fetchPlayerHistory = async (playerId, teamId) => {
    setLoadingHistory(true);
    try {
      // Si no hay equipo seleccionado, obtener todos los equipos del jugador
      let teamIds = [teamId];
      if (!teamId) {
        // Obtener todos los equipos del usuario para buscar asistencia y pagos
        const { data: userTeams } = await supabase
          .from('equipos')
          .select('id')
          .eq('propietario_id', session.user.id);

        if (userTeams && userTeams.length > 0) {
          teamIds = userTeams.map(team => team.id);
        } else {
          // Si no hay equipos, usar un array vacío
          teamIds = [];
        }
      } else {
      }

      // Obtener asistencia a partidos (de todos los equipos si no hay equipo específico)

      let attendanceQuery = supabase
        .from('asistencia_partidos')
        .select(
          `
                    partido_id,
                    partidos (
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
        .eq('jugador_id', playerId);

      if (teamIds.length > 0) {
        attendanceQuery = attendanceQuery.in('equipo_id', teamIds);
      }

      const { data: attendanceData, error: attendanceError } =
        await attendanceQuery;

      if (attendanceError) {
        // Error al obtener asistencia
      } else {
      }

      // Obtener pagos realizados (de todos los equipos si no hay equipo específico)

      let paymentsQuery = supabase
        .from('pagos')
        .select(
          `
                    id,
                    monto_umpire,
                    monto_inscripcion,
                    fecha_pago,
                    metodo_pago,
                    partidos (
                        id,
                        equipo_contrario,
                        fecha_partido
                    )
                `
        )
        .eq('jugador_id', playerId)
        .order('fecha_pago', { ascending: false });

      if (teamIds.length > 0) {
        paymentsQuery = paymentsQuery.in('equipo_id', teamIds);
      }

      const { data: paymentsData, error: paymentsError } = await paymentsQuery;

      if (paymentsError) {
        // Error al obtener pagos
      } else {
      }

      // Obtener todos los partidos de los equipos para calcular estadísticas

      let gamesQuery = supabase
        .from('partidos')
        .select('id, fecha_partido, finalizado')
        .order('fecha_partido', { ascending: false });

      if (teamIds.length > 0) {
        gamesQuery = gamesQuery.in('equipo_id', teamIds);
      }

      const { data: allGamesData, error: gamesError } = await gamesQuery;

      if (gamesError) {
        // Error al obtener partidos
      } else {
      }

      // Calcular estadísticas
      let attendance = attendanceData || [];
      let payments = paymentsData || [];
      const allGames = allGamesData || [];

      // Ordenar asistencia por fecha del partido (más reciente primero)
      attendance = attendance.sort((a, b) => {
        const dateA = new Date(a.partidos?.fecha_partido || 0);
        const dateB = new Date(b.partidos?.fecha_partido || 0);
        return dateB - dateA;
      });

      // Los pagos ya vienen ordenados por fecha_pago desde la consulta

      const totalUmpirePaid = payments.reduce(
        (sum, payment) => sum + (payment.monto_umpire || 0),
        0
      );
      const totalInscripcionPaid = payments.reduce(
        (sum, payment) => sum + (payment.monto_inscripcion || 0),
        0
      );
      const gamesPlayed = allGames.length; // Total de partidos de todos los equipos
      const gamesAttended = attendance.length; // Total de asistencias del jugador
      const attendanceRate =
        gamesPlayed > 0 ? ((gamesAttended / gamesPlayed) * 100).toFixed(1) : 0;

      setPlayerHistory({
        attendance,
        payments,
        totalUmpirePaid,
        totalInscripcionPaid,
        gamesPlayed,
        gamesAttended,
        attendanceRate,
      });
    } catch (error) {
      setError('Error al cargar el historial del jugador');
    } finally {
      setLoadingHistory(false);
    }
  };

  /**
   * Abre el modal con la información histórica del jugador
   * @param {Object} player - Objeto del jugador
   */
  const openPlayerHistoryModal = async player => {
    setSelectedPlayerForHistory(player);
    setShowPlayerHistoryModal(true);

    // Usar el equipo del jugador si está asignado, o el equipo seleccionado, o null para buscar en todos
    const teamId = player.equipo_id || selectedTeam || null;

    await fetchPlayerHistory(player.id, teamId);
  };

  /**
   * Cierra el modal de historial del jugador
   */
  const closePlayerHistoryModal = () => {
    setShowPlayerHistoryModal(false);
    setSelectedPlayerForHistory(null);
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
   * Maneja la expansión/contracción de secciones del historial
   * @param {string} section - Nombre de la sección ('attendance' o 'payments')
   */
  const toggleSection = section => {
    setExpandedSections(prev => {
      const newSections = {
        ...prev,
        [section]: !prev[section],
      };

      return newSections;
    });
  };

  /**
   * Calcula la meta dinámica de inscripción basada en el total del equipo y promedio de asistentes
   * @param {number} teamId - ID del equipo
   * @returns {number} - Meta de inscripción calculada
   */
  const calculateInscripcionTarget = async teamId => {
    if (!teamId) return 450; // Valor por defecto si no hay equipo seleccionado

    try {
      // Obtener información del equipo (inscripción total)
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

      // Obtener estadísticas de asistencia
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('asistencia_partidos')
        .select('partido_id')
        .eq('equipo_id', teamId);

      if (attendanceError) {
        return 450;
      }

      // Obtener total de partidos del equipo
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
    } catch (error) {
      return 450;
    }
  };

  /**
   * Obtiene los totales de inscripción de todos los jugadores
   * @param {Array} playerIds - Array de IDs de jugadores
   * @returns {Object} - Totales de inscripción por jugador
   */
  const fetchPlayerInscripcionTotals = async playerIds => {
    if (!playerIds || playerIds.length === 0) return {};

    try {
      const { data, error } = await supabase
        .from('pagos')
        .select('jugador_id, monto_inscripcion')
        .in('jugador_id', playerIds)
        .not('monto_inscripcion', 'is', null)
        .gt('monto_inscripcion', 0);

      if (error) {
        return {};
      }

      const totals = {};
      data.forEach(payment => {
        const playerId = payment.jugador_id;
        if (!totals[playerId]) {
          totals[playerId] = 0;
        }
        totals[playerId] += payment.monto_inscripcion || 0;
      });

      return totals;
    } catch (error) {
      return {};
    }
  };

  /**
   * Obtiene los jugadores del usuario autenticado
   * @param {string} propietarioId - ID del usuario propietario
   * @returns {Object} - Resultado de la operación
   */
  const fetchPlayers = async propietarioId => {
    try {
      const { data, error } = await supabase
        .from('jugadores')
        .select(
          `
                    *,
                    equipos (
                        id,
                        nombre_equipo
                    ),
                    jugador_posiciones (
                        posiciones (
                            id,
                            nombre_posicion
                        )
                    )
                `
        )
        .eq('propietario_id', propietarioId)
        .order('id', { ascending: false });

      if (error) {
        setLoadingPlayers(false);
        return { success: false, error: error.message };
      }

      setPlayers(data || []);

      // Obtener totales de inscripción para todos los jugadores
      if (data && data.length > 0) {
        const playerIds = data.map(player => player.id);
        const inscripcionTotals = await fetchPlayerInscripcionTotals(playerIds);
        setPlayerInscripcionTotals(inscripcionTotals);
      }

      // Calcular meta de inscripción dinámica
      const calculatedTarget = await calculateInscripcionTarget(selectedTeam);
      setInscripcionTarget(calculatedTarget);

      setLoadingPlayers(false);
      return { success: true, data: data };
    } catch (error) {
      setLoadingPlayers(false);
      return { success: false, error: error.message };
    }
  };

  /**
   * Obtiene los equipos del usuario autenticado
   * @param {string} propietarioId - ID del usuario propietario
   * @returns {Object} - Resultado de la operación
   */
  // Nota: fetchTeams se maneja a través del contexto useTeam
  // No necesitamos implementar fetchTeams aquí ya que se maneja en TeamContext

  /**
   * Obtiene todas las posiciones disponibles
   * @returns {Object} - Resultado de la operación
   */
  const fetchPositions = async () => {
    try {
      const { data, error } = await supabase.from('posiciones').select('*');

      if (error) {
        return { success: false, error: error.message };
      }

      // Ordenar posiciones según el orden específico del béisbol
      const orderMap = {
        Pitcher: 1,
        Catcher: 2,
        '1B': 3,
        '2B': 4,
        '3B': 5,
        SS: 6,
        LF: 7,
        CF: 8,
        RF: 9,
        SF: 10,
      };

      const sortedPositions = data.sort((a, b) => {
        const orderA = orderMap[a.nombre_posicion] || 999;
        const orderB = orderMap[b.nombre_posicion] || 999;
        return orderA - orderB;
      });

      setPositions(sortedPositions);
      // setLoadingPositions(false)
      return { success: true, data: sortedPositions };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  /**
   * Registra un nuevo jugador o actualiza uno existente
   * @param {Object} playerData - Datos del jugador
   * @returns {Object} - Resultado de la operación
   */
  const registerPlayer = async playerData => {
    try {
      setLoading(true);
      setError(null);

      // Verificar que hay sesión
      if (!session?.user?.id) {
        throw new Error('No hay sesión activa');
      }

      // Validaciones
      if (!playerData.nombre || !playerData.numero) {
        throw new Error('El nombre y número son obligatorios');
      }

      if (playerData.numero < 0 || playerData.numero > 99) {
        throw new Error('El número debe estar entre 0 y 99');
      }

      if (selectedPositions.length > 3) {
        throw new Error('Un jugador puede tener máximo 3 posiciones');
      }

      // Validar que el equipo existe si se especifica uno
      if (
        playerData.equipo_id &&
        !teams.find(team => team.id === playerData.equipo_id)
      ) {
        throw new Error('El equipo seleccionado no es válido');
      }

      let playerResult;

      if (editingPlayer) {
        // Actualizar jugador existente

        const { data: updatedPlayer, error: playerError } = await supabase
          .from('jugadores')
          .update({
            nombre: playerData.nombre,
            numero: parseInt(playerData.numero),
            telefono: playerData.telefono || null,
            email: playerData.email || null,
            equipo_id: playerData.equipo_id,
          })
          .eq('id', editingPlayer.id)
          .select();

        if (playerError) {
          throw new Error(
            `Error al actualizar jugador: ${playerError.message}`
          );
        }

        playerResult = updatedPlayer[0];
      } else {
        // Insertar nuevo jugador

        const { data: newPlayer, error: playerError } = await supabase
          .from('jugadores')
          .insert([
            {
              nombre: playerData.nombre,
              numero: parseInt(playerData.numero),
              telefono: playerData.telefono || null,
              email: playerData.email || null,
              equipo_id: playerData.equipo_id,
              propietario_id: session.user.id, // Incluir el propietario_id
            },
          ])
          .select();

        if (playerError) {
          throw new Error(`Error al registrar jugador: ${playerError.message}`);
        }

        playerResult = newPlayer[0];
      }

      // Esta línea ya no es necesaria porque playerError se maneja dentro de cada bloque

      // Manejar posiciones
      if (editingPlayer) {
        // Para edición: eliminar posiciones existentes y agregar las nuevas
        const { error: deleteError } = await supabase
          .from('jugador_posiciones')
          .delete()
          .eq('jugador_id', editingPlayer.id);

        if (deleteError) {
          // Error al eliminar posiciones existentes
        }
      }

      // Si hay posiciones seleccionadas, registrarlas
      if (selectedPositions.length > 0 && playerResult) {
        const positionData = selectedPositions.map(positionId => ({
          jugador_id: playerResult.id,
          posicion_id: positionId,
        }));

        const { error: positionError } = await supabase
          .from('jugador_posiciones')
          .insert(positionData);

        if (positionError) {
          // Error al registrar posiciones - no lanzamos error aquí porque el jugador ya se registró/actualizó
        } else {
        }
      }

      const mensaje = editingPlayer
        ? 'Jugador actualizado exitosamente'
        : 'Jugador registrado exitosamente';
      const equipoNombre =
        teams.find(team => team.id === playerData.equipo_id)?.nombre_equipo ||
        'Sin equipo';
      setSuccess(`${mensaje} en el equipo: ${equipoNombre}`);
      resetForm();

      // Recargar lista de jugadores y totales de inscripción
      await fetchPlayers(session.user.id);

      return { success: true, data: playerResult };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja el envío del formulario
   * @param {Event} e - Evento del formulario
   */
  const handleSubmit = async e => {
    e.preventDefault();

    // Determinar el equipo correcto: usar el seleccionado en el formulario o el equipo actualmente seleccionado
    const equipoSeleccionado = equipoId || selectedTeam || null;

    const playerData = {
      nombre: name,
      numero: numero,
      telefono: telefono,
      email: email,
      equipo_id: equipoSeleccionado,
    };

    const result = await registerPlayer(playerData);

    if (result.success) {
      // Recargar la lista de jugadores después de un registro exitoso
      await fetchPlayers(session.user.id);
    }
  };

  /**
   * Maneja la selección/deselección de posiciones
   * @param {number} positionId - ID de la posición
   */
  const handlePositionToggle = positionId => {
    setSelectedPositions(prev => {
      if (prev.includes(positionId)) {
        const newPositions = prev.filter(id => id !== positionId);

        return newPositions;
      } else {
        if (prev.length >= 3) {
          setError('Un jugador puede tener máximo 3 posiciones');
          return prev;
        }
        setError(null);
        const newPositions = [...prev, positionId];

        return newPositions;
      }
    });
  };

  /**
   * Resetea el formulario
   */
  const resetForm = () => {
    setName('');
    setNumero('');
    setTelefono('');
    setEmail('');
    // Mantener el equipo seleccionado actualmente
    setEquipoId(selectedTeam || '');
    setSelectedPositions([]);
    setError(null);
    setSuccess(null);
    setEditingPlayer(null);
    setShowForm(false);
  };

  /**
   * Elimina un jugador
   * @param {number} playerId - ID del jugador a eliminar
   */
  const deletePlayer = async playerId => {
    if (!confirm('¿Estás seguro de que quieres eliminar este jugador?')) {
      return;
    }

    try {
      setLoading(true);

      // Primero eliminar las posiciones del jugador
      const { error: positionError } = await supabase
        .from('jugador_posiciones')
        .delete()
        .eq('jugador_id', playerId);

      if (positionError) {
        // Error al eliminar posiciones
      } else {
      }

      // Luego eliminar el jugador
      const { error: playerError } = await supabase
        .from('jugadores')
        .delete()
        .eq('id', playerId);

      if (playerError) {
        throw new Error(`Error al eliminar jugador: ${playerError.message}`);
      }

      setSuccess('Jugador eliminado exitosamente');
      await fetchPlayers(session.user.id); // Recargar lista, totales y meta
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    if (session?.user?.id) {
      fetchPlayers(session.user.id);
      fetchPositions();
    } else {
    }
  }, [session]);

  // Establecer el equipo seleccionado por defecto cuando cambie
  useEffect(() => {
    if (selectedTeam) {
      setEquipoId(selectedTeam);

      // Recalcular meta de inscripción cuando cambie el equipo
      calculateInscripcionTarget(selectedTeam).then(target => {
        setInscripcionTarget(target);
      });
    }
  }, [selectedTeam]);

  // Función para ordenar los jugadores
  const sortPlayers = (players, key, direction) => {
    const sortedPlayers = [...players].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      // Para el nombre, convertir a minúsculas para ordenamiento alfabético
      if (key === 'nombre') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      // Para el número, convertir a números
      if (key === 'numero') {
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      }

      if (aValue < bValue) {
        return direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sortedPlayers;
  };

  // Función para manejar el ordenamiento
  const handleSort = key => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key, direction });
  };

  // Función para filtrar jugadores
  const filterPlayers = (players, filters) => {
    const filteredPlayers = players.filter(player => {
      // Filtro por nombre (búsqueda parcial, case-insensitive)
      if (
        filters.nombre &&
        !player.nombre.toLowerCase().includes(filters.nombre.toLowerCase())
      ) {
        return false;
      }

      // Filtro por número
      if (filters.numero && player.numero.toString() !== filters.numero) {
        return false;
      }

      // Filtro por posiciones
      if (filters.posiciones && filters.posiciones.length > 0) {
        const playerPositions =
          player.jugador_posiciones?.map(jp => jp.posiciones.nombre_posicion) ||
          [];

        if (filters.posicionMatchType === 'all') {
          // Todas las posiciones seleccionadas deben coincidir
          if (!filters.posiciones.every(pos => playerPositions.includes(pos))) {
            return false;
          }
        } else {
          // Al menos una posición debe coincidir
          if (!filters.posiciones.some(pos => playerPositions.includes(pos))) {
            return false;
          }
        }
      }

      return true;
    });

    return filteredPlayers;
  };

  // Función para manejar cambios en los filtros
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [filterType]: value,
      };

      return newFilters;
    });
  };

  // Función para manejar la selección/deselección de posiciones en filtros
  const handlePositionFilterToggle = positionName => {
    setFilters(prev => {
      const newPositions = prev.posiciones.includes(positionName)
        ? prev.posiciones.filter(pos => pos !== positionName)
        : [...prev.posiciones, positionName];
      const newFilters = {
        ...prev,
        posiciones: newPositions,
      };

      return newFilters;
    });
  };

  // Función para cambiar el tipo de coincidencia de posiciones
  const handlePositionMatchTypeChange = matchType => {
    setFilters(prev => {
      const newFilters = {
        ...prev,
        posicionMatchType: matchType,
      };

      return newFilters;
    });
  };

  // Función para limpiar todos los filtros
  const clearFilters = () => {
    setFilters({
      nombre: '',
      numero: '',
      posiciones: [],
      posicionMatchType: 'any',
    });
    setShowFilters(false);
  };

  // Obtener jugadores filtrados y ordenados
  const filteredPlayers = filterPlayers(players, filters);
  const sortedPlayers = sortConfig.key
    ? sortPlayers(filteredPlayers, sortConfig.key, sortConfig.direction)
    : filteredPlayers;

  // Función para manejar el menú de acciones

  // Función para editar jugador
  const editPlayer = playerId => {
    const player = players.find(p => p.id === playerId);
    if (player) {
      setEditingPlayer(player);
      setName(player.nombre);
      setNumero(player.numero.toString());
      setTelefono(player.telefono || '');
      setEmail(player.email || '');
      // Usar el equipo del jugador o el equipo seleccionado actualmente
      setEquipoId(player.equipo_id || selectedTeam || '');

      // Obtener las posiciones del jugador
      const playerPositions =
        player.jugador_posiciones
          ?.map(jp => jp.posiciones?.id)
          .filter(id => id) || [];

      setSelectedPositions(playerPositions);

      setShowForm(true);
    } else {
    }
  };

  // Si no hay sesión, redirigir al login
  if (!session) {
    navigate('/signin');
    return null;
  }

  return (
    <>
      <div>
        <div className='flex justify-between items-center mb-8 '>
          <h1 className='text-2xl font-bold text-white'>
            Gestión de Jugadores
          </h1>
        </div>

        {/* Mensajes de error y éxito */}
        {error && (
          <div className='bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded mb-6'>
            {error}
          </div>
        )}
        {success && (
          <div className='bg-green-900 border border-green-600 text-green-200 px-4 py-3 rounded mb-6'>
            {success}
          </div>
        )}

        {/* Formulario de registro */}
        {showForm && (
          <PlayerForm
            formData={{
              name,
              numero,
              telefono,
              email,
              equipoId,
            }}
            onFormDataChange={(field, value) => {
              switch (field) {
                case 'name':
                  setName(value);
                  break;
                case 'numero':
                  setNumero(value);
                  break;
                case 'telefono':
                  setTelefono(value);
                  break;
                case 'email':
                  setEmail(value);
                  break;
                case 'equipoId':
                  setEquipoId(value);
                  break;
              }
            }}
            selectedPositions={selectedPositions}
            onPositionToggle={positionId => {
              handlePositionToggle(positionId);
            }}
            positions={positions}
            teams={teams}
            editingPlayer={editingPlayer}
            loading={loading}
            onSubmit={e => {
              handleSubmit(e);
            }}
            onCancel={() => {
              setShowForm(false);
            }}
          />
        )}

        {/* Botón para mostrar/ocultar formulario */}
        <div className='mb-6 sm:mb-8'>
          <button
            onClick={() => setShowForm(!showForm)}
            className='w-full sm:w-auto px-4 sm:px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center sm:justify-start space-x-2'
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
            <span>{showForm ? 'Cancelar' : 'Agregar Jugador'}</span>
          </button>
        </div>

        {/* Lista de jugadores */}
        <div className='bg-neutral-900 shadow rounded-lg p-4 sm:p-6 border border-gray-700'>
          {/* Header superior con título, equipo, ordenamiento y botón de filtro */}
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
            <h2 className='text-xl font-semibold text-white'>
              Jugadores Registrados
            </h2>
            <div className='flex flex-col sm:flex-row sm:items-center gap-4 sm:space-x-4'>
              {selectedTeam && teams.length > 0 && (
                <div className='text-sm text-gray-300'>
                  <span className='text-gray-400'>Equipo: </span>
                  <span className='font-medium text-blue-400'>
                    {
                      teams.find(team => team.id === selectedTeam)
                        ?.nombre_equipo
                    }
                  </span>
                </div>
              )}

              {/* Botón de ordenamiento */}
              <div className='flex items-center space-x-2'>
                <span className='text-sm text-gray-300'>Ordenar por:</span>
                <select
                  value={sortConfig.key || ''}
                  onChange={e => handleSort(e.target.value)}
                  className='px-3 py-2 bg-gray-700 text-white text-sm rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none'
                >
                  <option value=''>Seleccionar</option>
                  <option value='nombre'>Nombre</option>
                  <option value='numero'>Número</option>
                </select>
                {sortConfig.key && (
                  <button
                    onClick={() =>
                      setSortConfig({
                        key: sortConfig.key,
                        direction:
                          sortConfig.direction === 'asc' ? 'desc' : 'asc',
                      })
                    }
                    className='px-2 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-500'
                  >
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </button>
                )}
              </div>

              {/* Botón de filtro */}
              <PlayerFilters
                filters={filters}
                filteredCount={sortedPlayers.length}
                totalCount={players.length}
                showFilters={showFilters}
                onToggleFilters={() => {
                  setShowFilters(!showFilters);
                }}
              />
            </div>
          </div>

          {/* Sección de filtros (se muestra debajo del header) */}
          {showFilters && (
            <div className='mb-6'>
              <div className='p-4 bg-gray-800 rounded-lg border border-gray-600'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-lg font-medium text-white'>Filtros</h3>
                  <button
                    onClick={clearFilters}
                    className='px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-500 transition-colors'
                  >
                    Limpiar Filtros
                  </button>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  {/* Filtro por nombre */}
                  <div>
                    <label className='block text-sm font-medium text-gray-300 mb-2'>
                      Buscar por nombre
                    </label>
                    <input
                      type='text'
                      value={filters.nombre}
                      onChange={e =>
                        handleFilterChange('nombre', e.target.value)
                      }
                      placeholder='Escribir nombre...'
                      className='w-full p-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none'
                    />
                  </div>

                  {/* Filtro por número */}
                  <div>
                    <label className='block text-sm font-medium text-gray-300 mb-2'>
                      Número de playera
                    </label>
                    <input
                      type='number'
                      value={filters.numero}
                      onChange={e =>
                        handleFilterChange('numero', e.target.value)
                      }
                      placeholder='Ej: 10'
                      min='0'
                      max='99'
                      className='w-full p-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none'
                    />
                  </div>
                </div>

                {/* Filtro por posiciones */}
                <div className='mt-4'>
                  <label className='block text-sm font-medium text-gray-300 mb-2'>
                    Posiciones
                  </label>

                  {/* Tipo de coincidencia */}
                  <div className='mb-3'>
                    <div className='flex flex-col sm:flex-row sm:items-center gap-3 sm:space-x-4'>
                      <label className='flex items-center space-x-2'>
                        <input
                          type='radio'
                          name='positionMatchType'
                          value='any'
                          checked={filters.posicionMatchType === 'any'}
                          onChange={e =>
                            handlePositionMatchTypeChange(e.target.value)
                          }
                          className='text-blue-500 focus:ring-blue-500 bg-gray-700 border-gray-600'
                        />
                        <span className='text-sm text-gray-300'>
                          Al menos una posición
                        </span>
                      </label>
                      <label className='flex items-center space-x-2'>
                        <input
                          type='radio'
                          name='positionMatchType'
                          value='all'
                          checked={filters.posicionMatchType === 'all'}
                          onChange={e =>
                            handlePositionMatchTypeChange(e.target.value)
                          }
                          className='text-blue-500 focus:ring-blue-500 bg-gray-700 border-gray-600'
                        />
                        <span className='text-sm text-gray-300'>
                          Todas las posiciones
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Selección de posiciones */}
                  <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2'>
                    {positions.map(position => (
                      <label
                        key={position.id}
                        className='flex items-center space-x-2 p-2 bg-gray-700 rounded border border-gray-600 hover:bg-gray-600 transition-colors'
                      >
                        <input
                          type='checkbox'
                          checked={filters.posiciones.includes(
                            position.nombre_posicion
                          )}
                          onChange={() =>
                            handlePositionFilterToggle(position.nombre_posicion)
                          }
                          className='rounded border-gray-600 text-blue-500 focus:ring-blue-500 bg-gray-800'
                        />
                        <span className='text-sm text-gray-300'>
                          {position.nombre_posicion}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Indicador de resultados */}
                <div className='mt-4 pt-4 border-t border-gray-600'>
                  <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                    <div className='text-sm text-gray-300'>
                      <span className='text-gray-400'>Mostrando </span>
                      <span className='font-medium text-blue-400'>
                        {sortedPlayers.length}
                      </span>
                      <span className='text-gray-400'> de </span>
                      <span className='font-medium text-white'>
                        {players.length}
                      </span>
                      <span className='text-gray-400'> jugadores</span>
                      {(filters.nombre ||
                        filters.numero ||
                        filters.posiciones.length > 0) && (
                        <span className='text-gray-400'> (filtrados)</span>
                      )}
                    </div>
                    {(filters.nombre ||
                      filters.numero ||
                      filters.posiciones.length > 0) && (
                      <div className='text-xs text-gray-400 flex flex-wrap gap-1'>
                        <span>Filtros activos:</span>
                        {filters.nombre && (
                          <span className='px-2 py-1 bg-blue-900 text-blue-200 rounded'>
                            Nombre: {filters.nombre}
                          </span>
                        )}
                        {filters.numero && (
                          <span className='px-2 py-1 bg-green-900 text-green-200 rounded'>
                            Número: {filters.numero}
                          </span>
                        )}
                        {filters.posiciones.length > 0 && (
                          <span className='px-2 py-1 bg-purple-900 text-purple-200 rounded'>
                            Posiciones: {filters.posiciones.join(', ')} (
                            {filters.posicionMatchType === 'all'
                              ? 'todas'
                              : 'al menos una'}
                            )
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contenido principal - Grid de jugadores */}
          <div>
            {sortedPlayers.length === 0 &&
            !loadingPlayers &&
            players.length > 0 ? (
              <div className='text-center py-8'>
                <p className='text-gray-300'>
                  No se encontraron jugadores con los filtros aplicados.
                </p>
                <p className='text-sm text-gray-400 mt-1'>
                  Intenta ajustar los filtros o limpiarlos para ver todos los
                  jugadores.
                </p>
              </div>
            ) : (
              <PlayerCardsGrid
                players={sortedPlayers}
                loadingPlayers={loadingPlayers}
                onViewHistory={player => {
                  openPlayerHistoryModal(player);
                }}
                playerInscripcionTotals={playerInscripcionTotals}
                inscripcionTarget={inscripcionTarget}
              />
            )}
          </div>
        </div>

        {/* Modal de Historial del Jugador */}
        <PlayerHistoryModal
          isOpen={showPlayerHistoryModal}
          player={selectedPlayerForHistory}
          history={playerHistory}
          loadingHistory={loadingHistory}
          expandedSections={expandedSections}
          inscripcionTarget={inscripcionTarget}
          onToggleSection={section => {
            toggleSection(section);
          }}
          onClose={() => {
            closePlayerHistoryModal();
          }}
          onEdit={playerId => {
            editPlayer(playerId);
          }}
          onDelete={playerId => {
            deletePlayer(playerId);
          }}
        />
      </div>
    </>
  );
};

export default Players;

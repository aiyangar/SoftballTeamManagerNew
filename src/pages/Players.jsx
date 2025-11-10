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
 * Permite ver la lista de jugadores 
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlayerForPayment, setSelectedPlayerForPayment] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedTeamToImport, setSelectedTeamToImport] = useState('');
  const [importingPlayers, setImportingPlayers] = useState(false);
  const [importError, setImportError] = useState(null);

  // Usar el hook para manejar los modales
  useModal(showPlayerHistoryModal || showPaymentModal || showImportModal);

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
   * @param {string} teamId - ID del equipo para filtrar (opcional)
   * @returns {Object} - Resultado de la operación
   */
  const fetchPlayers = async (propietarioId, teamId = null) => {
    try {
      let query = supabase
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
        .eq('propietario_id', propietarioId);

      // Filtrar por equipo si hay uno seleccionado
      // Si no hay equipo seleccionado, no mostrar ningún jugador
      if (teamId) {
        query = query.eq('equipo_id', teamId);
      } else {
        // Si no hay equipo seleccionado, retornar array vacío
        setPlayers([]);
        setLoadingPlayers(false);
        return { success: true, data: [] };
      }

      const { data, error } = await query.order('id', { ascending: false });

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
      if (playerData.equipo_id) {
        // Normalizar tipos para la comparación (convertir ambos a número)
        const equipoIdNormalizado = Number(playerData.equipo_id);
        const equipoEncontrado = teams.find(team => Number(team.id) === equipoIdNormalizado);
        
        if (!equipoEncontrado) {
          throw new Error('El equipo seleccionado no es válido');
        }
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
        teams.find(team => Number(team.id) === Number(playerData.equipo_id))?.nombre_equipo ||
        'Sin equipo';
      setSuccess(`${mensaje} en el equipo: ${equipoNombre}`);
      resetForm();

      // Recargar lista de jugadores y totales de inscripción
      await fetchPlayers(session.user.id, selectedTeam);

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
    // Convertir cadenas vacías a null y normalizar el tipo
    let equipoSeleccionado = equipoId || selectedTeam || null;
    
    // Convertir a número si es una cadena numérica, o mantener null si está vacío
    if (equipoSeleccionado === '' || equipoSeleccionado === null || equipoSeleccionado === undefined) {
      equipoSeleccionado = null;
    } else {
      // Asegurar que sea un número para la comparación
      equipoSeleccionado = typeof equipoSeleccionado === 'string' && equipoSeleccionado !== '' 
        ? parseInt(equipoSeleccionado, 10) 
        : equipoSeleccionado;
    }

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
      await fetchPlayers(session.user.id, selectedTeam);
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
      await fetchPlayers(session.user.id, selectedTeam); // Recargar lista, totales y meta
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente (solo cuando cambia la sesión)
  useEffect(() => {
    if (session?.user?.id) {
      fetchPlayers(session.user.id, selectedTeam);
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

      // Recargar jugadores cuando cambie el equipo seleccionado
      if (session?.user?.id) {
        fetchPlayers(session.user.id, selectedTeam);
      }
    } else {
      // Si no hay equipo seleccionado, no mostrar jugadores
      setPlayers([]);
      setPlayerInscripcionTotals({});
      setInscripcionTarget(450);
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

  /**
   * Obtiene los datos de pagos de umpire para todos los jugadores
   * @param {Array} playerIds - Array de IDs de jugadores
   * @returns {Object} - Totales de umpire por jugador
   */
  const fetchPlayerUmpireTotals = async playerIds => {
    if (!playerIds || playerIds.length === 0) return {};

    try {
      const { data, error } = await supabase
        .from('pagos')
        .select('jugador_id, monto_umpire')
        .in('jugador_id', playerIds)
        .not('monto_umpire', 'is', null)
        .gt('monto_umpire', 0);

      if (error) {
        return {};
      }

      const totals = {};
      data.forEach(payment => {
        const playerId = payment.jugador_id;
        if (!totals[playerId]) {
          totals[playerId] = 0;
        }
        totals[playerId] += payment.monto_umpire || 0;
      });

      return totals;
    } catch (error) {
      return {};
    }
  };

  /**
   * Abre el modal para aceptar pagos de inscripción
   * @param {Object} player - Jugador para el cual aceptar el pago
   */
  const handleAcceptInscripcionPayment = (player) => {
    // Calcular el monto restante de inscripción
    const currentInscripcionPaid = playerInscripcionTotals[player.id] || 0;
    const remainingAmount = inscripcionTarget - currentInscripcionPaid;
    
    if (remainingAmount <= 0) {
      setError('Este jugador ya ha completado su pago de inscripción');
      return;
    }

    setSelectedPlayerForPayment(player);
    setPaymentAmount(remainingAmount.toString());
    setPaymentMethod('Efectivo');
    setShowPaymentModal(true);
  };

  /**
   * Cierra el modal de pago
   */
  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedPlayerForPayment(null);
    setPaymentAmount('');
    setPaymentMethod('Efectivo');
  };

  /**
   * Procesa el pago de inscripción
   */
  const processInscripcionPayment = async () => {
    if (!selectedPlayerForPayment || !paymentAmount) {
      setError('Por favor, ingresa una cantidad válida');
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Por favor, ingresa una cantidad válida mayor a 0');
      return;
    }

    try {
      setLoading(true);
      
      // Crear un pago de inscripción
      const { data: paymentData, error: paymentError } = await supabase
        .from('pagos')
        .insert([
          {
            jugador_id: selectedPlayerForPayment.id,
            equipo_id: selectedPlayerForPayment.equipo_id || selectedTeam,
            monto_umpire: 0,
            monto_inscripcion: amount,
            fecha_pago: new Date().toISOString(),
            metodo_pago: paymentMethod,
          },
        ])
        .select();

      if (paymentError) {
        setError('Error al registrar el pago: ' + paymentError.message);
        return;
      }

      setSuccess(`✅ Pago de inscripción registrado exitosamente: $${amount.toLocaleString()} para ${selectedPlayerForPayment.nombre}`);
      
      // Cerrar modal
      closePaymentModal();
      
      // Recargar datos del jugador y totales
      await fetchPlayers(session.user.id, selectedTeam);
      
      // Si el modal de historial está abierto, recargar sus datos
      if (showPlayerHistoryModal && selectedPlayerForHistory?.id === selectedPlayerForPayment.id) {
        await fetchPlayerHistory(selectedPlayerForPayment.id, selectedPlayerForPayment.equipo_id || selectedTeam);
      }
      
    } catch (error) {
      setError('Error inesperado al registrar el pago: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Exporta los datos de jugadores a un archivo CSV
   */
  const exportPlayersToCSV = async () => {
    try {
      setLoading(true);
      
      // Obtener todos los jugadores del usuario
      const { data: allPlayers, error: playersError } = await supabase
        .from('jugadores')
        .select(`
          *,
          equipos (
            id,
            nombre_equipo
          )
        `)
        .eq('propietario_id', session.user.id)
        .order('numero', { ascending: true });

      if (playersError) {
        setError('Error al obtener datos de jugadores: ' + playersError.message);
        return;
      }

      if (!allPlayers || allPlayers.length === 0) {
        setError('No hay jugadores para exportar');
        return;
      }

      // Obtener IDs de todos los jugadores
      const playerIds = allPlayers.map(player => player.id);

      // Obtener totales de umpire e inscripción
      const [umpireTotals, inscripcionTotals] = await Promise.all([
        fetchPlayerUmpireTotals(playerIds),
        fetchPlayerInscripcionTotals(playerIds)
      ]);

      // Calcular meta de inscripción
      const targetInscripcion = await calculateInscripcionTarget(selectedTeam);

      // Preparar datos para CSV
      const csvData = allPlayers.map(player => {
        const umpirePaid = umpireTotals[player.id] || 0;
        const inscripcionPaid = inscripcionTotals[player.id] || 0;
        const inscripcionDifference = targetInscripcion - inscripcionPaid;
        
        return {
          'Número de Playera': player.numero,
          'Nombre': player.nombre,
          'Equipo': player.equipos?.nombre_equipo || 'Sin equipo',
          'Teléfono': player.telefono || '',
          'Email': player.email || '',
          'Umpire Pagado': `$${umpirePaid.toLocaleString()}`,
          'Inscripción Pagada': `$${inscripcionPaid.toLocaleString()}`,
          'Meta Inscripción': `$${targetInscripcion.toLocaleString()}`,
          'Diferencia Inscripción': inscripcionDifference > 0 
            ? `$${inscripcionDifference.toLocaleString()} (Debe)` 
            : inscripcionDifference < 0 
            ? `$${Math.abs(inscripcionDifference).toLocaleString()} (Sobrepago)`
            : '$0 (Completo)'
        };
      });

      // Convertir a CSV
      const headers = Object.keys(csvData[0]);
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => 
          headers.map(header => {
            const value = row[header];
            // Convertir a string y manejar valores nulos/undefined
            const stringValue = value !== null && value !== undefined ? String(value) : '';
            // Escapar comillas y envolver en comillas si contiene comas o comillas
            return stringValue.includes(',') || stringValue.includes('"') 
              ? `"${stringValue.replace(/"/g, '""')}"` 
              : stringValue;
          }).join(',')
        )
      ].join('\n');

      // Crear y descargar archivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      // Generar nombre de archivo con fecha
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const teamName = teams.find(team => String(team.id) === String(selectedTeam))?.nombre_equipo || 'Todos';
      link.setAttribute('download', `jugadores_${teamName}_${dateStr}.csv`);
      
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccess(`✅ Datos exportados exitosamente: ${allPlayers.length} jugadores. Para importar a Google Sheets: 1) Ve a sheets.google.com, 2) Crea una nueva hoja, 3) Archivo > Importar > Subir archivo, 4) Selecciona el archivo CSV descargado`);
    } catch (error) {
      setError('Error al exportar datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Importa todos los jugadores de otro equipo al equipo actual
   * @param {number} sourceTeamId - ID del equipo del cual importar jugadores
   * @param {number} targetTeamId - ID del equipo al cual importar jugadores
   */
  const importPlayersFromTeam = async (sourceTeamId, targetTeamId) => {
    if (!sourceTeamId || !targetTeamId) {
      setImportError('Debes seleccionar un equipo para importar jugadores');
      return;
    }

    // Normalizar los IDs para comparación
    const normalizedSourceId = Number(sourceTeamId);
    const normalizedTargetId = Number(targetTeamId);
    
    if (normalizedSourceId === normalizedTargetId) {
      setImportError('No puedes importar jugadores del mismo equipo. Selecciona un equipo diferente.');
      return;
    }

    // Validar que el usuario sea dueño de ambos equipos
    const sourceTeam = teams.find(team => Number(team.id) === Number(sourceTeamId));
    const targetTeam = teams.find(team => Number(team.id) === Number(targetTeamId));

    if (!sourceTeam || !targetTeam) {
      setImportError('Uno o ambos equipos no son válidos o no te pertenecen');
      return;
    }

    try {
      setImportingPlayers(true);
      setImportError(null);

      // Obtener todos los jugadores del equipo origen con sus posiciones
      const { data: sourcePlayers, error: playersError } = await supabase
        .from('jugadores')
        .select(
          `
            *,
            jugador_posiciones (
              posicion_id,
              posiciones (
                id
              )
            )
          `
        )
        .eq('equipo_id', sourceTeamId)
        .eq('propietario_id', session.user.id);

      if (playersError) {
        throw new Error(`Error al obtener jugadores: ${playersError.message}`);
      }

      if (!sourcePlayers || sourcePlayers.length === 0) {
        setImportError('El equipo seleccionado no tiene jugadores para importar');
        return;
      }

      // Verificar si hay jugadores duplicados SOLO en el equipo destino
      // Permitimos que un jugador esté en múltiples equipos, solo verificamos duplicados en el mismo equipo
      const { data: existingPlayers, error: existingError } = await supabase
        .from('jugadores')
        .select('nombre, numero, telefono, email')
        .eq('equipo_id', targetTeamId)
        .eq('propietario_id', session.user.id);

      if (existingError) {
        throw new Error(`Error al verificar jugadores existentes: ${existingError.message}`);
      }

      // Verificar también jugadores con teléfono/email únicos a nivel de propietario
      // para evitar conflictos con restricciones únicas en la base de datos
      const { data: allExistingPlayers, error: allExistingError } = await supabase
        .from('jugadores')
        .select('telefono, email')
        .eq('propietario_id', session.user.id);

      if (allExistingError) {
        console.warn('Error al verificar jugadores con teléfono/email:', allExistingError);
      }

      // Crear Sets con las claves de jugadores existentes
      const existingPlayerKeys = new Set(
        (existingPlayers || []).map(p => `${p.nombre.toLowerCase()}_${p.numero}`)
      );
      
      // Crear Sets con teléfonos y emails existentes para detectar conflictos
      const existingTelefonos = new Set(
        (allExistingPlayers || [])
          .filter(p => p.telefono)
          .map(p => p.telefono)
      );
      
      const existingEmails = new Set(
        (allExistingPlayers || [])
          .filter(p => p.email)
          .map(p => p.email.toLowerCase())
      );

      // Filtrar jugadores que no estén duplicados en el equipo destino
      // y preparar datos sin teléfono/email si hay conflictos
      const playersToImport = sourcePlayers
        .filter(player => {
          const playerKey = `${player.nombre.toLowerCase()}_${player.numero}`;
          return !existingPlayerKeys.has(playerKey);
        })
        .map(player => {
          // Si hay conflicto con teléfono o email, establecerlos como null
          const hasTelefonoConflict = player.telefono && existingTelefonos.has(player.telefono);
          const hasEmailConflict = player.email && existingEmails.has(player.email.toLowerCase());
          
          return {
            ...player,
            telefono: hasTelefonoConflict ? null : (player.telefono || null),
            email: hasEmailConflict ? null : (player.email || null),
            _hasConflicts: hasTelefonoConflict || hasEmailConflict,
            _conflictReasons: [
              hasTelefonoConflict ? 'teléfono' : null,
              hasEmailConflict ? 'email' : null
            ].filter(Boolean)
          };
        });

      if (playersToImport.length === 0) {
        setImportError('Todos los jugadores del equipo seleccionado ya existen en el equipo actual');
        return;
      }

      // Insertar jugadores uno por uno para manejar errores individuales
      const newPlayers = [];
      const failedImports = [];
      
      for (const player of playersToImport) {
        try {
          const playerData = {
            nombre: player.nombre,
            numero: parseInt(player.numero),
            telefono: player.telefono || null,
            email: player.email || null,
            equipo_id: Number(targetTeamId),
            propietario_id: session.user.id,
          };

          const { data: newPlayer, error: insertError } = await supabase
            .from('jugadores')
            .insert([playerData])
            .select();

          if (insertError) {
            // Si hay un error de conflicto, intentar insertar sin teléfono/email si el conflicto es por esos campos
            if (insertError.code === '23505' || insertError.message.includes('duplicate') || insertError.message.includes('unique')) {
              // Verificar si el error es por teléfono o email
              const isTelefonoConflict = insertError.message.toLowerCase().includes('telefono') || insertError.message.toLowerCase().includes('phone');
              const isEmailConflict = insertError.message.toLowerCase().includes('email') || insertError.message.toLowerCase().includes('correo');
              
              if (isTelefonoConflict || isEmailConflict) {
                // Intentar insertar sin el campo conflictivo
                try {
                  const retryPlayerData = {
                    nombre: player.nombre,
                    numero: parseInt(player.numero),
                    telefono: isTelefonoConflict ? null : (player.telefono || null),
                    email: isEmailConflict ? null : (player.email || null),
                    equipo_id: Number(targetTeamId),
                    propietario_id: session.user.id,
                  };

                  const { data: retryPlayer, error: retryError } = await supabase
                    .from('jugadores')
                    .insert([retryPlayerData])
                    .select();

                  if (retryError) {
                    // Si aún falla, agregar a la lista de fallidos
                    failedImports.push({
                      nombre: player.nombre,
                      numero: player.numero,
                      razon: `Conflicto con ${isTelefonoConflict ? 'teléfono' : ''}${isTelefonoConflict && isEmailConflict ? ' y ' : ''}${isEmailConflict ? 'email' : ''}`
                    });
                  } else if (retryPlayer && retryPlayer.length > 0) {
                    newPlayers.push(retryPlayer[0]);
                  }
                } catch (retryError) {
                  failedImports.push({
                    nombre: player.nombre,
                    numero: player.numero,
                    razon: `Conflicto con ${isTelefonoConflict ? 'teléfono' : ''}${isTelefonoConflict && isEmailConflict ? ' y ' : ''}${isEmailConflict ? 'email' : ''}`
                  });
                }
              } else {
                // Si el conflicto no es por teléfono/email, agregar a la lista de fallidos
                failedImports.push({
                  nombre: player.nombre,
                  numero: player.numero,
                  razon: 'Ya existe un jugador con el mismo nombre y número o hay un conflicto de restricción única'
                });
              }
            } else {
              failedImports.push({
                nombre: player.nombre,
                numero: player.numero,
                razon: insertError.message
              });
            }
          } else if (newPlayer && newPlayer.length > 0) {
            newPlayers.push(newPlayer[0]);
          }
        } catch (error) {
          failedImports.push({
            nombre: player.nombre,
            numero: player.numero,
            razon: error.message || 'Error desconocido'
          });
        }
      }

      if (newPlayers.length === 0) {
        throw new Error('No se pudo importar ningún jugador. Todos los jugadores ya existen o hubo un error.');
      }

      // Copiar las posiciones de cada jugador importado
      // Crear un mapa de jugadores originales por nombre y número para mapear correctamente
      const originalPlayersMap = new Map();
      playersToImport.forEach(player => {
        const key = `${player.nombre.toLowerCase()}_${player.numero}`;
        originalPlayersMap.set(key, player);
      });

      const positionInserts = [];
      for (const newPlayer of newPlayers) {
        // Buscar el jugador original correspondiente
        const originalPlayer = originalPlayersMap.get(`${newPlayer.nombre.toLowerCase()}_${newPlayer.numero}`);
        
        if (originalPlayer && originalPlayer.jugador_posiciones && originalPlayer.jugador_posiciones.length > 0) {
          originalPlayer.jugador_posiciones.forEach(jp => {
            // Usar posicion_id directamente o posiciones.id como respaldo
            const posicionId = jp.posicion_id || jp.posiciones?.id;
            if (posicionId) {
              positionInserts.push({
                jugador_id: newPlayer.id,
                posicion_id: posicionId,
              });
            }
          });
        }
      }

      if (positionInserts.length > 0) {
        const { error: positionError } = await supabase
          .from('jugador_posiciones')
          .insert(positionInserts);

        if (positionError) {
          // No lanzar error aquí, solo registrar que hubo un problema con las posiciones
          console.warn('Error al importar posiciones:', positionError);
        }
      }

      const skippedCount = sourcePlayers.length - playersToImport.length;
      const importedCount = newPlayers.length;
      const failedCount = failedImports.length;

      let successMessage = `✅ ${importedCount} jugador${importedCount !== 1 ? 'es' : ''} importado${importedCount !== 1 ? 's' : ''} exitosamente`;
      
      if (skippedCount > 0 || failedCount > 0) {
        const totalSkipped = skippedCount + failedCount;
        successMessage += ` (${totalSkipped} jugador${totalSkipped !== 1 ? 'es' : ''} omitido${totalSkipped !== 1 ? 's' : ''}`;
        if (skippedCount > 0 && failedCount > 0) {
          successMessage += `: ${skippedCount} por duplicados, ${failedCount} por errores)`;
        } else if (skippedCount > 0) {
          successMessage += ` por duplicados)`;
        } else {
          successMessage += ` por errores)`;
        }
      }

      setSuccess(successMessage);
      setShowImportModal(false);
      setSelectedTeamToImport('');

      // Recargar la lista de jugadores
      await fetchPlayers(session.user.id, targetTeamId);
    } catch (error) {
      setImportError(error.message);
    } finally {
      setImportingPlayers(false);
    }
  };

  /**
   * Abre el modal de importación de jugadores
   */
  const openImportModal = () => {
    if (!selectedTeam) {
      setError('Debes seleccionar un equipo primero');
      return;
    }
    setShowImportModal(true);
    setSelectedTeamToImport('');
    setImportError(null);
  };

  /**
   * Cierra el modal de importación
   */
  const closeImportModal = () => {
    setShowImportModal(false);
    setSelectedTeamToImport('');
    setImportError(null);
    setError(null);
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

        {/* Botones de acción */}
        <div className='mb-6 sm:mb-8 flex flex-col sm:flex-row gap-3'>
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
          
          <button
            onClick={exportPlayersToCSV}
            disabled={loading || players.length === 0}
            className='w-full sm:w-auto px-4 sm:px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center sm:justify-start space-x-2'
            title='Exportar datos de jugadores a hoja de cálculo'
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
                d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              />
            </svg>
            <span>{loading ? 'Exportando...' : 'Exportar a CSV'}</span>
          </button>

          <button
            onClick={openImportModal}
            disabled={!selectedTeam || loading}
            className='w-full sm:w-auto px-4 sm:px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center sm:justify-start space-x-2'
            title='Importar jugadores de otro equipo'
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
                d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12'
              />
            </svg>
            <span>Importar Jugadores</span>
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
                      teams.find(team => String(team.id) === String(selectedTeam))
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
          onAcceptPayment={handleAcceptInscripcionPayment}
        />

        {/* Modal de Confirmación de Pago */}
        {showPaymentModal && selectedPlayerForPayment && (
          <div className='fixed inset-0 modal-overlay flex items-center justify-center z-50'>
            <div className='bg-neutral-900 border border-gray-600 rounded-lg w-full max-w-md mx-4 modal-container'>
              <div className='modal-header p-6 border-b border-gray-600'>
                <div className='flex justify-between items-center'>
                  <h2 className='text-xl font-semibold text-white'>
                    Aceptar Pago de Inscripción
                  </h2>
                  <button
                    onClick={closePaymentModal}
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
                    {selectedPlayerForPayment.nombre}
                  </h3>
                  <p className='text-gray-300'>
                    Número: {selectedPlayerForPayment.numero}
                  </p>
                  <p className='text-gray-300'>
                    Equipo: {selectedPlayerForPayment.equipos?.nombre_equipo || 'Sin equipo'}
                  </p>
                </div>

                {/* Información de pago actual */}
                <div className='mb-6 p-4 bg-gray-800 rounded-lg'>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='text-gray-300'>Pagado actualmente:</span>
                    <span className='text-blue-400 font-semibold'>
                      ${(playerInscripcionTotals[selectedPlayerForPayment.id] || 0).toLocaleString()}
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
                      ${(inscripcionTarget - (playerInscripcionTotals[selectedPlayerForPayment.id] || 0)).toLocaleString()}
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
                      onChange={(e) => setPaymentAmount(e.target.value)}
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
                      onChange={(e) => setPaymentMethod(e.target.value)}
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
                    onClick={closePaymentModal}
                    className='flex-1 px-4 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors'
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={processInscripcionPayment}
                    disabled={loading || !paymentAmount}
                    className='flex-1 px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
                  >
                    {loading ? 'Procesando...' : 'Aceptar Pago'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Importación de Jugadores */}
        {showImportModal && (
          <div className='fixed inset-0 modal-overlay flex items-center justify-center z-50'>
            <div className='bg-neutral-900 border border-gray-600 rounded-lg w-full max-w-md mx-4 modal-container'>
              <div className='modal-header p-6 border-b border-gray-600'>
                <div className='flex justify-between items-center'>
                  <h2 className='text-xl font-semibold text-white'>
                    Importar Jugadores de Otro Equipo
                  </h2>
                  <button
                    onClick={closeImportModal}
                    className='text-gray-400 hover:text-white text-2xl'
                    title='Cerrar modal de importación'
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className='modal-content p-6'>
                {/* Mensajes de error dentro del modal */}
                {importError && (
                  <div className='mb-4 p-4 bg-red-900 border border-red-600 text-red-200 rounded-lg'>
                    <div className='flex items-start justify-between'>
                      <p className='text-sm'>{importError}</p>
                      <button
                        onClick={() => setImportError(null)}
                        className='ml-2 text-red-300 hover:text-red-100 text-xl'
                        title='Cerrar mensaje de error'
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}

                {/* Información del equipo actual */}
                <div className='mb-6 p-4 bg-gray-800 rounded-lg'>
                  <h3 className='text-lg font-semibold text-white mb-2'>
                    Equipo Actual
                  </h3>
                  <p className='text-gray-300'>
                    {teams.find(team => String(team.id) === String(selectedTeam))?.nombre_equipo || 'Sin equipo seleccionado'}
                  </p>
                </div>

                {/* Selector de equipo origen */}
                <div className='space-y-4'>
                  <div>
                    <label className='block text-white mb-2 text-sm font-medium'>
                      Seleccionar equipo del cual importar jugadores
                    </label>
                    <select
                      value={selectedTeamToImport}
                      onChange={(e) => setSelectedTeamToImport(e.target.value)}
                      className='w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white'
                      disabled={importingPlayers}
                    >
                      <option value=''>Seleccionar equipo...</option>
                      {teams.map(team => (
                        <option key={team.id} value={String(team.id)}>
                          {team.nombre_equipo}
                          {String(team.id) === String(selectedTeam) ? ' (Equipo actual)' : ''}
                        </option>
                      ))}
                    </select>
                    {teams.length === 0 && (
                      <p className='text-sm text-gray-400 mt-2'>
                        No tienes equipos disponibles
                      </p>
                    )}
                  </div>

                  {/* Información sobre la importación */}
                  <div className='p-4 bg-blue-900/30 border border-blue-700 rounded-lg'>
                    <p className='text-sm text-blue-200'>
                      <strong>Nota:</strong> Se importarán todos los jugadores del equipo seleccionado al equipo actual. 
                      Los jugadores con el mismo nombre y número serán omitidos para evitar duplicados. 
                      Las posiciones de cada jugador también se copiarán.
                    </p>
                  </div>
                </div>

                {/* Botones */}
                <div className='flex space-x-3 mt-6'>
                  <button
                    onClick={closeImportModal}
                    disabled={importingPlayers}
                    className='flex-1 px-4 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      if (selectedTeamToImport && selectedTeam) {
                        importPlayersFromTeam(selectedTeamToImport, selectedTeam);
                      } else {
                        setImportError('Por favor, selecciona un equipo para importar');
                      }
                    }}
                    disabled={importingPlayers || !selectedTeamToImport}
                    className='flex-1 px-4 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
                  >
                    {importingPlayers ? 'Importando...' : 'Importar Jugadores'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Players;

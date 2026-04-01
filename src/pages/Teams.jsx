import React, { useState } from 'react';
import toast from 'react-hot-toast';
// import { useNavigate } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import Menu from '../components/Menu';
import { useTeam } from '../context/useTeam';
import TeamForm from '../components/Forms/TeamForm';
import TeamCardsGrid from '../components/CardGrids/TeamCardsGrid';
import TeamHistoryModal from '../components/Modals/TeamHistoryModal';

/**
 * Componente para la gestión de equipos
 * Permite crear, editar y eliminar equipos
 * Muestra la lista de equipos existentes
 */
const Teams = () => {
  // Estados para manejar el formulario
  const [name, setName] = useState('');
  const [inscripcion, setInscripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showTeamHistoryModal, setShowTeamHistoryModal] = useState(false);
  const [selectedTeamForHistory, setSelectedTeamForHistory] = useState(null);
  const [editingTeam, setEditingTeam] = useState(null); // Para manejar la edición
  const { teams, loadingTeams, fetchTeams } = useTeam(); // Usar el contexto del equipo

  // Hook para navegación programática
  // const navigate = useNavigate()

  // Obtener estado de sesión del contexto
  const authContext = UserAuth();
  const session = authContext?.session;

  /**
   * Crea un nuevo equipo en la base de datos
   * @param {string} nombreEquipo - Nombre del equipo
   * @param {string} inscripcion - Monto de inscripción del equipo
   * @param {string} propietarioId - ID del usuario propietario
   * @returns {Object} - Resultado de la operación
   */
  const createTeam = async (nombreEquipo, inscripcion, propietarioId) => {
    try {
      const { data, error } = await supabase
        .from('equipos')
        .insert([
          {
            nombre_equipo: nombreEquipo,
            inscripcion: inscripcion ? parseFloat(inscripcion) : null,
            propietario_id: propietarioId, // ID del usuario que crea el equipo
          },
        ])
        .select();

      if (error) {
        console.error('Error al crear equipo:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data };
    } catch (error) {
      console.error('Error inesperado al crear equipo:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Actualiza un equipo existente en la base de datos
   * @param {number} teamId - ID del equipo a actualizar
   * @param {string} nombreEquipo - Nuevo nombre del equipo
   * @param {string} inscripcion - Nuevo monto de inscripción del equipo
   * @returns {Object} - Resultado de la operación
   */
  const updateTeam = async (teamId, nombreEquipo, inscripcion) => {
    try {
      const { data, error } = await supabase
        .from('equipos')
        .update({
          nombre_equipo: nombreEquipo,
          inscripcion: inscripcion ? parseFloat(inscripcion) : null,
        })
        .eq('id', teamId)
        .select();

      if (error) {
        console.error('Error al actualizar equipo:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data };
    } catch (error) {
      console.error('Error inesperado al actualizar equipo:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Limpia el formulario y lo oculta
   */
  const resetForm = () => {
    setName('');
    setInscripcion('');
    setShowForm(false);
    setEditingTeam(null); // Limpiar también el equipo en edición
  };

  /**
   * Inicia la edición de un equipo
   * @param {Object} team - Equipo a editar
   */
  const startEditing = team => {
    setName(team.nombre_equipo);
    setInscripcion(team.inscripcion ? team.inscripcion.toString() : '');
    setEditingTeam(team);
    setShowForm(true);
    setShowTeamHistoryModal(false); // Cerrar el modal de historial
  };

  /**
   * Maneja la visualización del historial del equipo
   * @param {Object} team - Equipo para ver su historial
   */
  const handleViewTeamHistory = team => {
    setSelectedTeamForHistory(team);
    setShowTeamHistoryModal(true);
  };

  /**
   * Maneja la eliminación de un equipo
   * @param {Object} team - Equipo a eliminar
   */
  const handleDeleteTeam = _team => {
    alert('Función de eliminar equipo - próximamente');
  };

  /**
   * Cierra el modal de historial del equipo
   */
  const closeTeamHistoryModal = () => {
    setShowTeamHistoryModal(false);
    setSelectedTeamForHistory(null);
  };

  /**
   * Maneja el envío del formulario de creación/edición de equipo
   * @param {Event} e - Evento del formulario
   */
  const handleSubmitTeam = async e => {
    e.preventDefault();
    setLoading(true);

    // Verificar que el usuario esté autenticado
    if (!session?.user?.id) {
      toast.error('Debes estar autenticado para gestionar equipos');
      setLoading(false);
      return;
    }

    try {
      let result;

      if (editingTeam) {
        // Actualizar equipo existente
        result = await updateTeam(editingTeam.id, name, inscripcion);
        if (result.success) {
          resetForm();
          await fetchTeams();
          toast.success('Equipo actualizado exitosamente');
        } else {
          toast.error(result.error || 'Error al actualizar el equipo');
        }
      } else {
        // Crear nuevo equipo
        result = await createTeam(name, inscripcion, session.user.id);
        if (result.success) {
          resetForm();
          await fetchTeams();
          toast.success('Equipo creado exitosamente');
        } else {
          toast.error(result.error || 'Error al crear el equipo');
        }
      }
    } catch (error) {
      console.error('Error inesperado en handleSubmitTeam:', error);
      toast.error(error.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-2xl font-bold text-white'>Gestión de Equipos</h1>
        </div>

        {/* Botón para mostrar/ocultar formulario */}
        <div className='mb-8'>
          <button
            onClick={() => {
              if (showForm) {
                resetForm(); // Limpiar formulario si está abierto
              } else {
                setShowForm(true);
              }
            }}
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
            <span>{showForm ? 'Cancelar' : 'Agregar Equipo'}</span>
          </button>
        </div>

        {/* Formulario de creación/edición de equipo */}
        <TeamForm
          showForm={showForm}
          name={name}
          inscripcion={inscripcion}
          onNameChange={e => setName(e.target.value)}
          onInscripcionChange={e => setInscripcion(e.target.value)}
          onSubmit={handleSubmitTeam}
          loading={loading}
          editingTeam={editingTeam}
        />

        {/* Lista de equipos existentes */}
        <div className='bg-neutral-900 shadow rounded-lg p-6 mb-8 border border-gray-700'>
          <h2 className='text-xl font-semibold mb-6 text-white'>Mis Equipos</h2>

          <TeamCardsGrid
            teams={teams}
            loadingTeams={loadingTeams}
            onViewHistory={handleViewTeamHistory}
          />
        </div>

        {/* Modal de historial del equipo */}
        <TeamHistoryModal
          showModal={showTeamHistoryModal}
          selectedTeam={selectedTeamForHistory}
          onClose={closeTeamHistoryModal}
          onEdit={startEditing}
          onDelete={handleDeleteTeam}
        />
      </div>
    </>
  );
};

export default Teams;

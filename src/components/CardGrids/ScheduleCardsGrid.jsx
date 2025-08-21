import React from 'react'
import ScheduleCard from '../Cards/ScheduleCard'

/**
 * Componente para la cuadrícula de tarjetas de partidos
 * @param {Array} games - Array de partidos
 * @param {Object} paymentTotals - Totales de pagos por partido
 * @param {Object} gameFinalizationStatus - Estado de finalización de partidos
 * @param {Function} onCardClick - Función para manejar el click en la card
 * @param {Function} onActionMenuToggle - Función para manejar el menú de acciones
 * @param {Function} onAttendanceFormToggle - Función para manejar el formulario de asistencia
 * @param {Function} onEditGame - Función para editar partido
 * @param {Function} onOpenPaymentForm - Función para abrir formulario de pagos
 * @param {Function} onOpenScoreForm - Función para abrir formulario de resultado
 * @param {string} actionMenuOpen - ID del partido con menú abierto
 * @param {Array} players - Lista de jugadores
 * @param {Object} attendance - Estado de asistencia por partido
 * @param {Function} onAttendanceChange - Función para cambiar asistencia
 * @param {Function} onLoadExistingAttendance - Función para cargar asistencia existente
 * @param {Function} onRecordAttendance - Función para guardar asistencia
 * @param {Function} onFetchPlayers - Función para recargar jugadores
 * @param {string} selectedTeam - ID del equipo seleccionado
 * @param {Object} showAttendanceForm - Estado de formularios de asistencia
 */
const ScheduleCardsGrid = ({
    games,
    paymentTotals,
    gameFinalizationStatus,
    onCardClick,
    onActionMenuToggle,
    onAttendanceFormToggle,
    onEditGame,
    onOpenPaymentForm,
    onOpenScoreForm,
    actionMenuOpen,
    players,
    attendance,
    onAttendanceChange,
    onLoadExistingAttendance,
    onRecordAttendance,
    onFetchPlayers,
    selectedTeam,
    showAttendanceForm
}) => {
    if (games.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-300">No hay partidos registrados aún.</p>
                <p className="text-sm text-gray-400 mt-1">Registra tu primer partido usando el formulario de arriba.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {games.map(game => (
                <ScheduleCard
                    key={game.id}
                    game={game}
                    paymentTotals={paymentTotals}
                    gameFinalizationStatus={gameFinalizationStatus}
                    onCardClick={onCardClick}
                    onActionMenuToggle={onActionMenuToggle}
                    onAttendanceFormToggle={onAttendanceFormToggle}
                    onEditGame={onEditGame}
                    onOpenPaymentForm={onOpenPaymentForm}
                    onOpenScoreForm={onOpenScoreForm}
                    actionMenuOpen={actionMenuOpen}
                    players={players}
                    attendance={attendance}
                    onAttendanceChange={onAttendanceChange}
                    onLoadExistingAttendance={onLoadExistingAttendance}
                    onRecordAttendance={onRecordAttendance}
                    onFetchPlayers={onFetchPlayers}
                    selectedTeam={selectedTeam}
                    showAttendanceForm={showAttendanceForm}
                />
            ))}
        </div>
    )
}

export default ScheduleCardsGrid

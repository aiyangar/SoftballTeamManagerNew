import React from 'react'

/**
 * Componente para el botón de filtros de jugadores
 * @param {Object} filters - Estado de los filtros
 * @param {number} filteredCount - Cantidad de jugadores filtrados
 * @param {number} totalCount - Cantidad total de jugadores
 * @param {boolean} showFilters - Estado para mostrar/ocultar filtros
 * @param {Function} onToggleFilters - Función para mostrar/ocultar filtros
 */
const PlayerFilters = ({
    filters,
    filteredCount,
    totalCount,
    showFilters,
    onToggleFilters
}) => {
    return (
        <div className="flex flex-col">
            {/* Botón para mostrar/ocultar filtros */}
            <button
                onClick={onToggleFilters}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors relative self-start"
                title={showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                {(filters.nombre || filters.numero || filters.posiciones.length > 0) && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                        {filteredCount}
                    </span>
                )}
            </button>

            {/* Indicador de resultados cuando los filtros están ocultos */}
            {!showFilters && (filters.nombre || filters.numero || filters.posiciones.length > 0) && (
                <div className="mt-2 text-sm text-gray-300">
                    <span className="text-gray-400">Mostrando </span>
                    <span className="font-medium text-blue-400">{filteredCount}</span>
                    <span className="text-gray-400"> de </span>
                    <span className="font-medium text-white">{totalCount}</span>
                    <span className="text-gray-400"> jugadores (filtrados)</span>
                </div>
            )}
        </div>
    )
}

export default PlayerFilters

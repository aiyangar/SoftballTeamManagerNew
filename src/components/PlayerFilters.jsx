import React from 'react'

/**
 * Componente para los filtros de jugadores
 * @param {Object} filters - Estado de los filtros
 * @param {Function} onFilterChange - Función para manejar cambios en los filtros
 * @param {Function} onPositionFilterToggle - Función para manejar selección de posiciones en filtros
 * @param {Function} onPositionMatchTypeChange - Función para cambiar el tipo de coincidencia de posiciones
 * @param {Function} onClearFilters - Función para limpiar todos los filtros
 * @param {Array} positions - Lista de posiciones disponibles
 * @param {number} filteredCount - Cantidad de jugadores filtrados
 * @param {number} totalCount - Cantidad total de jugadores
 * @param {boolean} showFilters - Estado para mostrar/ocultar filtros
 * @param {Function} onToggleFilters - Función para mostrar/ocultar filtros
 */
const PlayerFilters = ({
    filters,
    onFilterChange,
    onPositionFilterToggle,
    onPositionMatchTypeChange,
    onClearFilters,
    positions,
    filteredCount,
    totalCount,
    showFilters,
    onToggleFilters
}) => {
    return (
        <>
            {/* Botón para mostrar/ocultar filtros */}
            <button
                onClick={onToggleFilters}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors flex items-center space-x-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span>{showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}</span>
                {(filters.nombre || filters.numero || filters.posiciones.length > 0) && (
                    <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                        {filteredCount}
                    </span>
                )}
            </button>

            {/* Indicador de resultados cuando los filtros están ocultos */}
            {!showFilters && (filters.nombre || filters.numero || filters.posiciones.length > 0) && (
                <div className="mb-6 text-sm text-gray-300">
                    <span className="text-gray-400">Mostrando </span>
                    <span className="font-medium text-blue-400">{filteredCount}</span>
                    <span className="text-gray-400"> de </span>
                    <span className="font-medium text-white">{totalCount}</span>
                    <span className="text-gray-400"> jugadores (filtrados)</span>
                </div>
            )}

            {/* Sección de filtros */}
            {showFilters && (
                <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-600">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-white">Filtros</h3>
                        <button
                            onClick={onClearFilters}
                            className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-500 transition-colors"
                        >
                            Limpiar Filtros
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Filtro por nombre */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Buscar por nombre
                            </label>
                            <input
                                type="text"
                                value={filters.nombre}
                                onChange={(e) => onFilterChange('nombre', e.target.value)}
                                placeholder="Escribir nombre..."
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        
                        {/* Filtro por número */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Número de playera
                            </label>
                            <input
                                type="number"
                                value={filters.numero}
                                onChange={(e) => onFilterChange('numero', e.target.value)}
                                placeholder="Ej: 10"
                                min="0"
                                max="99"
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Filtro por posiciones */}
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Posiciones
                        </label>
                        
                        {/* Tipo de coincidencia */}
                        <div className="mb-3">
                            <div className="flex items-center space-x-4">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="positionMatchType"
                                        value="any"
                                        checked={filters.posicionMatchType === 'any'}
                                        onChange={(e) => onPositionMatchTypeChange(e.target.value)}
                                        className="text-blue-500 focus:ring-blue-500 bg-gray-700 border-gray-600"
                                    />
                                    <span className="text-sm text-gray-300">Al menos una posición</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="positionMatchType"
                                        value="all"
                                        checked={filters.posicionMatchType === 'all'}
                                        onChange={(e) => onPositionMatchTypeChange(e.target.value)}
                                        className="text-blue-500 focus:ring-blue-500 bg-gray-700 border-gray-600"
                                    />
                                    <span className="text-sm text-gray-300">Todas las posiciones</span>
                                </label>
                            </div>
                        </div>
                        
                        {/* Selección de posiciones */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                            {positions.map(position => (
                                <label key={position.id} className="flex items-center space-x-2 p-2 bg-gray-700 rounded border border-gray-600 hover:bg-gray-600 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={filters.posiciones.includes(position.nombre_posicion)}
                                        onChange={() => onPositionFilterToggle(position.nombre_posicion)}
                                        className="rounded border-gray-600 text-blue-500 focus:ring-blue-500 bg-gray-800"
                                    />
                                    <span className="text-sm text-gray-300">{position.nombre_posicion}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    
                    {/* Indicador de resultados */}
                    <div className="mt-4 pt-4 border-t border-gray-600">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-300">
                                <span className="text-gray-400">Mostrando </span>
                                <span className="font-medium text-blue-400">{filteredCount}</span>
                                <span className="text-gray-400"> de </span>
                                <span className="font-medium text-white">{totalCount}</span>
                                <span className="text-gray-400"> jugadores</span>
                                {(filters.nombre || filters.numero || filters.posiciones.length > 0) && (
                                    <span className="text-gray-400"> (filtrados)</span>
                                )}
                            </div>
                            {(filters.nombre || filters.numero || filters.posiciones.length > 0) && (
                                <div className="text-xs text-gray-400">
                                    Filtros activos: 
                                    {filters.nombre && <span className="ml-1 px-2 py-1 bg-blue-900 text-blue-200 rounded">Nombre: {filters.nombre}</span>}
                                    {filters.numero && <span className="ml-1 px-2 py-1 bg-green-900 text-green-200 rounded">Número: {filters.numero}</span>}
                                    {filters.posiciones.length > 0 && (
                                        <span className="ml-1 px-2 py-1 bg-purple-900 text-purple-200 rounded">
                                            Posiciones: {filters.posiciones.join(', ')} ({filters.posicionMatchType === 'all' ? 'todas' : 'al menos una'})
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default PlayerFilters

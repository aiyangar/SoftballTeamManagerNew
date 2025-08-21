import React from 'react'

/**
 * Componente para el formulario de creación/edición de equipos
 * @param {boolean} showForm - Estado para mostrar/ocultar el formulario
 * @param {string} name - Nombre del equipo
 * @param {string} inscripcion - Monto de inscripción
 * @param {Function} onNameChange - Función para manejar cambios en el nombre
 * @param {Function} onInscripcionChange - Función para manejar cambios en la inscripción
 * @param {Function} onSubmit - Función para manejar el envío del formulario
 * @param {boolean} loading - Estado de carga
 * @param {Object} editingTeam - Datos del equipo que se está editando
 * @param {string} error - Mensaje de error
 */
const TeamForm = ({
    showForm,
    name,
    inscripcion,
    onNameChange,
    onInscripcionChange,
    onSubmit,
    loading,
    editingTeam,
    error
}) => {
    if (!showForm) return null

    return (
        <div className="bg-neutral-900 shadow rounded-lg p-6 mb-8 border border-gray-700">
            <h2 className="text-xl font-semibold mb-6 text-white">
                {editingTeam ? 'Editar Equipo' : 'Crear Nuevo Equipo'}
            </h2>
            <form onSubmit={onSubmit} className='space-y-4'>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nombre del Equipo *
                    </label>
                    <input 
                        id="teamName"
                        name="teamName"
                        type="text" 
                        placeholder='Ej: Tigres del Norte' 
                        value={name} 
                        onChange={onNameChange} 
                        className='w-full p-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-gray-800 text-white' 
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Monto de Inscripción ($)
                    </label>
                    <input 
                        id="teamInscripcion"
                        name="teamInscripcion"
                        type="number" 
                        step="0.01"
                        min="0"
                        placeholder='Ej: 1500.00' 
                        value={inscripcion} 
                        onChange={onInscripcionChange} 
                        className='w-full p-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-gray-800 text-white' 
                    />
                    <p className="text-xs text-gray-400 mt-1">Opcional: Deja vacío si no hay monto de inscripción</p>
                </div>
                
                <button 
                    type='submit' 
                    disabled={loading} 
                    className='w-full mt-6 border border-gray-600 rounded-md p-3 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
                >
                    {loading ? (editingTeam ? 'Actualizando equipo...' : 'Creando equipo...') : (editingTeam ? 'Actualizar Equipo' : 'Crear Equipo')}
                </button>
                
                {error && (
                    <div className="mt-4 p-3 bg-red-900 border border-red-600 text-red-200 rounded">
                        {error}
                    </div>
                )}
            </form>
        </div>
    )
}

export default TeamForm

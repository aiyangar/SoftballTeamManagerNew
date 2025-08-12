import React, { useState } from 'react'
import { Link,useNavigate } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext'

/**
 * Componente para la gestión de equipos
 * Permite crear, editar y eliminar equipos
 * Muestra la lista de equipos existentes
 */
const Teams = () => {
    // Estados para manejar el formulario
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Hook para navegación programática
    const navigate = useNavigate()

    // Obtener función de signin del contexto de autenticación
    const { session, signInUser } = UserAuth()

    /**
     * Maneja el envío del formulario de creación de equipo
     * @param {Event} e - Evento del formulario
     */
    const handleCreateTeam = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // Intentar crear el equipo con los datos proporcionados
            const result = await createTeam(name)

            if (result.success) {
                console.log('Equipo creado exitosamente:', result.data)
                // Redirigir a la página de equipos después de crear uno
                navigate('/teams')
            } else {
                // Mostrar error si la creación falló
                setError(result.error || 'Error al crear el equipo')
            }
        } catch (error) {
            console.error('Error inesperado en handleCreateTeam:', error)
            setError(error.message || 'Error inesperado')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h1 className='text-2xl font-bold text-center py-24'>Gestión de Equipos</h1>
            <form onSubmit={handleCreateTeam} className='max-w-md m-auto pt-24'>
                <h2 className="font-bold pb-2 text-2xl">Crear Equipo</h2>
                <div className='flex flex-col py-4'>
                    <input 
                        type="text" 
                        placeholder='Nombre del equipo' 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        className='p-3 border mt-6 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' 
                    />
                    
                    <button 
                        type='submit' 
                        disabled={loading} 
                        className='mt-6 border border-gray-300 rounded-md p-3 bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
                    >
                        {loading ? 'Creando equipo...' : 'Crear Equipo'}
                    </button>
                    {error && (
                        <p className='text-red-500 mt-2'>{error}</p>
                    )}
                </div>
            </form>
        </div>
    )
}

export default Teams
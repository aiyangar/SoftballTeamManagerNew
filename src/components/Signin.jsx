import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext.jsx'

/**
 * Componente para el inicio de sesión de usuarios existentes
 * Permite autenticarse con email y contraseña
 */
const Signin = () => {
    // Estados para manejar el formulario
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false) // Estado de carga durante el proceso
    const [error, setError] = useState(null) // Estado para mostrar errores
    
    // Hook para navegación programática
    const navigate = useNavigate()

    // Obtener función de signin del contexto de autenticación
    const { session, signInUser } = UserAuth()

    /**
     * Maneja el envío del formulario de inicio de sesión
     * @param {Event} e - Evento del formulario
     */
    const handleSignIn = async (e) => {
        e.preventDefault() // Prevenir envío por defecto del formulario
        setLoading(true) // Activar estado de carga
        setError(null) // Limpiar errores anteriores
        
        try {
            // Intentar iniciar sesión con las credenciales proporcionadas
            const result = await signInUser(email, password)
            
            if (result.success) {
                console.log('Inicio de sesión exitoso:', result.data)
                // Redirigir al dashboard después de autenticación exitosa
                navigate('/dashboard')
            } else {
                // Mostrar error si la autenticación falló
                setError(result.error || 'Error al iniciar sesión')
            }
        } catch (error) {
            console.error('Error inesperado en handleSignIn:', error)
            setError(error.message || 'Error inesperado')
        } finally {
            setLoading(false) // Desactivar estado de carga
        }
    }

    return (
        <div>
            <form onSubmit={handleSignIn} className='max-w-md m-auto pt-24'>
                <h2 className="font-bold pb-2 text-2xl">Iniciar Sesión</h2>
                <p className="text-gray-600 mb-6">
                    ¿No tienes una cuenta? <Link to="/signup" className="text-blue-500 hover:text-blue-700">Regístrate</Link>
                </p>
                
                <div className='flex flex-col py-4'>
                    <input 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className='p-3 border mt-6 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' 
                        type="email" 
                        placeholder='Email' 
                        required
                    />
                    <input 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className='p-3 border mt-6 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' 
                        type="password" 
                        placeholder='Contraseña' 
                        required
                    />
                    <button 
                        type='submit' 
                        disabled={loading} 
                        className='mt-6 border border-gray-300 rounded-md p-3 bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
                    >
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                    
                    {error && (
                        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}
                </div>
            </form>
        </div>
    )
}

export default Signin
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext.jsx'

/**
 * Componente para el registro de nuevos usuarios
 * Permite crear una cuenta nueva o hacer signin si el usuario ya existe
 */
const Signup = () => {
    // Estados para manejar el formulario
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false) // Estado de carga durante el proceso
    const [error, setError] = useState(null) // Estado para mostrar errores
    
    // Hook para navegación programática
    const navigate = useNavigate()

    // Obtener funciones y estado del contexto de autenticación
    const { session, signUpNewUser, signInUser, signOut } = UserAuth()
    console.log('Estado de sesión actual:', session)
    /**
     * Maneja el envío del formulario de registro
     * @param {Event} e - Evento del formulario
     */
    const handleSignUp = async (e) => {
        e.preventDefault() // Prevenir envío por defecto del formulario
        setLoading(true) // Activar estado de carga
        setError(null) // Limpiar errores anteriores
        
        try {
            // Intentar registrar o hacer signin del usuario
            // La función signUpNewUser maneja automáticamente usuarios existentes
            const result = await signUpNewUser(email, password)
            
            if (result.success) {
                console.log('Operación exitosa:', result.data)
                
                // Log para debugging según el tipo de operación
                if (result.isExistingUser) {
                    console.log('Usuario existente, ya autenticado')
                } else {
                    console.log('Nuevo usuario registrado')
                }
                
                // Redirigir al dashboard después de autenticación exitosa
                navigate('/dashboard')
            } else {
                // Mostrar error si la operación falló
                setError(result.error || 'Error en el proceso')
            }
        } catch (error) {
            console.error('Error inesperado en handleSignUp:', error)
            setError(error.message || 'Error inesperado')
        } finally {
            setLoading(false) // Desactivar estado de carga
        }
    }
    
  return (
    <div>
        <form onSubmit={handleSignUp} className='max-w-md m-auto pt-24'>
            <h2 className="font-bold pb-2 text-2xl">Registrarse</h2>
            <p className="text-gray-600 mb-6">
                ¿Ya tienes una cuenta? <Link to="/signin" className="text-blue-500 hover:text-blue-700">Inicia sesión</Link>
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
                  {loading ? 'Registrando...' : 'Registrarse'}
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

export default Signup
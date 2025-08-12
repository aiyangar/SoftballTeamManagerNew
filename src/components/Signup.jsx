import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext.jsx'

const Signup = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const { session, signUpNewUser, signInUser, signOut } = UserAuth()
    console.log(session)
    const handleSignUp = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        
        try {
            // Registrar o hacer signin del usuario
            const result = await signUpNewUser(email, password)
            
            if (result.success) {
                console.log('Operación exitosa:', result.data)
                
                if (result.isExistingUser) {
                    console.log('Usuario existente, ya autenticado')
                } else {
                    console.log('Nuevo usuario registrado')
                }
                
                // Redirigir al dashboard
                navigate('/dashboard')
            } else {
                setError(result.error || 'Error en el proceso')
            }
        } catch (error) {
            console.error('Error en handleSignUp:', error)
            setError(error.message || 'Error inesperado')
        } finally {
            setLoading(false)
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
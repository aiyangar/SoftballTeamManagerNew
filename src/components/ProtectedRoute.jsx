import React from 'react'
import { Navigate } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext'

/**
 * Componente de protección de rutas
 * Verifica si el usuario está autenticado antes de mostrar el contenido
 * Si no está autenticado, redirige a la página de signin
 * 
 * @param {React.ReactNode} children - Componentes hijos a proteger
 * @returns {React.ReactNode} - Componentes protegidos o redirección
 */
const ProtectedRoute = ({ children }) => {
    // Obtener estado de autenticación del contexto con manejo de errores
    const authContext = UserAuth()
    const session = authContext?.session
    const loading = authContext?.loading

    // Mostrar spinner de carga mientras se verifica la autenticación
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4">Cargando...</p>
                </div>
            </div>
        )
    }

    // Si no hay sesión, redirigir a signin
    if (!session) {
        return <Navigate to="/signin" replace />
    }

    // Si hay sesión, mostrar el contenido protegido
    return children
}

export default ProtectedRoute

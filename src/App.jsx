import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserAuth } from './context/AuthContext'

/**
 * Componente principal de la aplicación
 * Maneja la navegación automática basada en el estado de autenticación
 * - Si el usuario está autenticado: redirige al dashboard
 * - Si el usuario no está autenticado: redirige al signin
 * - Mientras carga: muestra un spinner
 */
export default function App() {
  // Obtener estado de autenticación del contexto con manejo de errores
  const authContext = UserAuth()
  const session = authContext?.session
  const loading = authContext?.loading
  const navigate = useNavigate()

  // Effect para manejar navegación automática según el estado de autenticación
  useEffect(() => {
    if (!loading && session) {
      // Usuario autenticado: ir al dashboard
      navigate('/dashboard')
    } else if (!loading && !session) {
      // Usuario no autenticado: ir al signin
      navigate('/signin')
    }
  }, [session, loading, navigate])

  // Mostrar spinner mientras se verifica el estado de autenticación
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

  // No renderizar nada mientras se maneja la navegación
  return null
}

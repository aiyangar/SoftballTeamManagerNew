import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserAuth } from './context/AuthContext'

export default function App() {
  const { session, loading } = UserAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && session) {
      navigate('/dashboard')
    } else if (!loading && !session) {
      navigate('/signin')
    }
  }, [session, loading, navigate])

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

  return null
}

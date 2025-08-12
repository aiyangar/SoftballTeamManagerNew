import React from 'react'
import { UserAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const { session, loading, signOut } = UserAuth()
  const navigate = useNavigate()

  console.log('Session:', session)
  console.log('Loading:', loading)

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/signin')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }



  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button 
          onClick={handleSignOut}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Cerrar Sesión
        </button>
      </div>
      
      <div className="bg-neutral-900 shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          Bienvenido, {session.user.email}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-neutral-700 p-4 rounded">
            <h3 className="font-medium mb-2">Información del Usuario</h3>
            <p><strong>Email:</strong> {session.user.email}</p>
            <p><strong>ID:</strong> {session.user.id}</p>
            <p><strong>Último acceso:</strong> {new Date(session.user.last_sign_in_at).toLocaleString()}</p>
          </div>
          <div className="bg-neutral-700 p-4 rounded">
            <h3 className="font-medium mb-2">Estado de Sesión</h3>
            <p><strong>Token expira:</strong> {new Date(session.expires_at * 1000).toLocaleString()}</p>
            <p><strong>Proveedor:</strong> {session.user.app_metadata?.provider || 'email'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
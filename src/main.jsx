import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { RouterProvider } from 'react-router-dom'
import { router } from './router.jsx'
import { AuthContextProvider } from './context/AuthContext.jsx'
import { TeamProvider } from './context/TeamContext.jsx'

// Manejador de errores global para capturar errores de CSS y otros
window.addEventListener('error', (event) => {
  // Filtrar errores relacionados con selectores CSS inválidos
  if (event.error && event.error.message && event.error.message.includes('has-text')) {
    console.warn('Error de selector CSS no estándar detectado:', event.error.message)
    event.preventDefault() // Prevenir que el error se propague
    return false
  }
  
  // Para otros errores, solo loggear en desarrollo
  if (import.meta.env.DEV) {
    console.error('Error global capturado:', event.error)
  }
})

// Manejador para errores de promesas no manejadas
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && event.reason.message.includes('has-text')) {
    console.warn('Error de promesa con selector CSS no estándar:', event.reason.message)
    event.preventDefault()
    return false
  }
  
  if (import.meta.env.DEV) {
    console.error('Promesa rechazada no manejada:', event.reason)
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthContextProvider>
      <TeamProvider>
        <div>
          <h1 className="text-center pt-4 text-3xl">
            SoftBall Team Manager
          </h1>
          <RouterProvider router={router} />
        </div>
      </TeamProvider>
    </AuthContextProvider>
  </StrictMode>,
)

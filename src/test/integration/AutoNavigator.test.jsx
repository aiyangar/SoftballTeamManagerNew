import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { AuthContextProvider } from '../../context/AuthContext'
import AutoNavigator from '../../components/AutoNavigator'

// Mock de react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock del cliente de Supabase
vi.mock('../../supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
    }
  }
}))

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthContextProvider>
        {component}
      </AuthContextProvider>
    </BrowserRouter>
  )
}

describe('AutoNavigator Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería mostrar spinner mientras carga', async () => {
    const { supabase } = await import('../../supabaseClient')
    supabase.auth.getSession.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: { session: null } }), 100))
    )

    renderWithProviders(<AutoNavigator />)

    expect(screen.getByText('Cargando...')).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument() // El spinner
  })

  it('debería redirigir al dashboard cuando el usuario está autenticado', async () => {
    const { supabase } = await import('../../supabaseClient')
    const mockSession = { user: { id: '123', email: 'test@test.com' } }
    
    supabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null
    })

    renderWithProviders(<AutoNavigator />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('debería redirigir al signin cuando el usuario no está autenticado', async () => {
    const { supabase } = await import('../../supabaseClient')
    
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    })

    renderWithProviders(<AutoNavigator />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/signin')
    })
  })

  it('debería manejar errores de autenticación', async () => {
    const { supabase } = await import('../../supabaseClient')
    
    supabase.auth.getSession.mockRejectedValue(new Error('Network error'))

    renderWithProviders(<AutoNavigator />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/signin')
    })
  })

  it('debería limpiar la suscripción al desmontar', async () => {
    const { supabase } = await import('../../supabaseClient')
    const mockUnsubscribe = vi.fn()
    
    supabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } }
    })

    const { unmount } = renderWithProviders(<AutoNavigator />)
    
    unmount()

    expect(mockUnsubscribe).toHaveBeenCalled()
  })
})

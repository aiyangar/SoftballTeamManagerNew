import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { AuthContextProvider } from '../../context/AuthContext'
import ProtectedRoute from '../../components/ProtectedRoute'

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

const TestComponent = () => <div>Contenido protegido</div>

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthContextProvider>
        {component}
      </AuthContextProvider>
    </BrowserRouter>
  )
}

describe('ProtectedRoute Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería mostrar spinner mientras verifica autenticación', async () => {
    const { supabase } = await import('../../supabaseClient')
    supabase.auth.getSession.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: { session: null } }), 100))
    )

    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('debería renderizar contenido cuando el usuario está autenticado', async () => {
    const { supabase } = await import('../../supabaseClient')
    const mockSession = { user: { id: '123', email: 'test@test.com' } }
    
    supabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null
    })

    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )

    await waitFor(() => {
      expect(screen.getByText('Contenido protegido')).toBeInTheDocument()
    })
  })

  it('debería redirigir al signin cuando el usuario no está autenticado', async () => {
    const { supabase } = await import('../../supabaseClient')
    
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    })

    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/signin')
    })
  })

  it('debería manejar errores de autenticación redirigiendo al signin', async () => {
    const { supabase } = await import('../../supabaseClient')
    
    supabase.auth.getSession.mockRejectedValue(new Error('Network error'))

    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/signin')
    })
  })

  it('debería mostrar múltiples elementos hijos correctamente', async () => {
    const { supabase } = await import('../../supabaseClient')
    const mockSession = { user: { id: '123', email: 'test@test.com' } }
    
    supabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null
    })

    renderWithProviders(
      <ProtectedRoute>
        <div>Elemento 1</div>
        <div>Elemento 2</div>
        <TestComponent />
      </ProtectedRoute>
    )

    await waitFor(() => {
      expect(screen.getByText('Elemento 1')).toBeInTheDocument()
      expect(screen.getByText('Elemento 2')).toBeInTheDocument()
      expect(screen.getByText('Contenido protegido')).toBeInTheDocument()
    })
  })
})

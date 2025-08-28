import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RouterProvider } from 'react-router-dom'
import { AuthContextProvider } from '../../context/AuthContext'
import { router } from '../../router'

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

// Mock de los componentes de página
vi.mock('../../pages/Signin', () => ({
  default: () => <div data-testid="signin-page">Página de Inicio de Sesión</div>
}))

vi.mock('../../pages/Signup', () => ({
  default: () => <div data-testid="signup-page">Página de Registro</div>
}))

vi.mock('../../pages/Dashboard', () => ({
  default: () => <div data-testid="dashboard-page">Dashboard</div>
}))

vi.mock('../../pages/Teams', () => ({
  default: () => <div data-testid="teams-page">Gestión de Equipos</div>
}))

vi.mock('../../pages/Players', () => ({
  default: () => <div data-testid="players-page">Gestión de Jugadores</div>
}))

vi.mock('../../pages/Schedule', () => ({
  default: () => <div data-testid="schedule-page">Calendario</div>
}))

vi.mock('../../pages/AdminPanel', () => ({
  default: () => <div data-testid="admin-page">Panel de Administración</div>
}))

vi.mock('../../pages/MyAccount', () => ({
  default: () => <div data-testid="myaccount-page">Mi Cuenta</div>
}))

const renderWithProviders = () => {
  return render(
    <AuthContextProvider>
      <RouterProvider router={router} />
    </AuthContextProvider>
  )
}

describe('Router Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería renderizar la ruta principal correctamente', () => {
    renderWithProviders()
    // La ruta principal debería mostrar el AutoNavigator
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('debería manejar rutas públicas correctamente', async () => {
    const { supabase } = await import('../../supabaseClient')
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    })

    // Simular navegación a rutas públicas
    window.history.pushState({}, '', '/signin')
    renderWithProviders()
    
    // Las rutas públicas deberían ser accesibles sin autenticación
    expect(screen.getByTestId('signin-page')).toBeInTheDocument()
  })

  it('debería proteger rutas privadas cuando no hay autenticación', async () => {
    const { supabase } = await import('../../supabaseClient')
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    })

    // Simular navegación a ruta protegida
    window.history.pushState({}, '', '/dashboard')
    renderWithProviders()
    
    // Debería redirigir al signin
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(mockNavigate).toHaveBeenCalledWith('/signin')
  })

  it('debería permitir acceso a rutas protegidas cuando hay autenticación', async () => {
    const { supabase } = await import('../../supabaseClient')
    const mockSession = { user: { id: '123', email: 'test@test.com' } }
    
    supabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null
    })

    // Simular navegación a ruta protegida
    window.history.pushState({}, '', '/dashboard')
    renderWithProviders()
    
    // Debería mostrar el dashboard
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
  })

  it('debería manejar rutas de equipos correctamente', async () => {
    const { supabase } = await import('../../supabaseClient')
    const mockSession = { user: { id: '123', email: 'test@test.com' } }
    
    supabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null
    })

    window.history.pushState({}, '', '/teams')
    renderWithProviders()
    
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(screen.getByTestId('teams-page')).toBeInTheDocument()
  })

  it('debería manejar rutas de jugadores correctamente', async () => {
    const { supabase } = await import('../../supabaseClient')
    const mockSession = { user: { id: '123', email: 'test@test.com' } }
    
    supabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null
    })

    window.history.pushState({}, '', '/players')
    renderWithProviders()
    
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(screen.getByTestId('players-page')).toBeInTheDocument()
  })

  it('debería manejar rutas de calendario correctamente', async () => {
    const { supabase } = await import('../../supabaseClient')
    const mockSession = { user: { id: '123', email: 'test@test.com' } }
    
    supabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null
    })

    window.history.pushState({}, '', '/schedule')
    renderWithProviders()
    
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(screen.getByTestId('schedule-page')).toBeInTheDocument()
  })

  it('debería manejar rutas de administración correctamente', async () => {
    const { supabase } = await import('../../supabaseClient')
    const mockSession = { user: { id: '123', email: 'test@test.com' } }
    
    supabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null
    })

    window.history.pushState({}, '', '/admin')
    renderWithProviders()
    
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(screen.getByTestId('admin-page')).toBeInTheDocument()
  })

  it('debería manejar rutas de mi cuenta correctamente', async () => {
    const { supabase } = await import('../../supabaseClient')
    const mockSession = { user: { id: '123', email: 'test@test.com' } }
    
    supabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null
    })

    window.history.pushState({}, '', '/myaccount')
    renderWithProviders()
    
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(screen.getByTestId('myaccount-page')).toBeInTheDocument()
  })
})

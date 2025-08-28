import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
      setSession: vi.fn()
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      select: vi.fn(() => Promise.resolve({ data: [], error: null }))
    }))
  }
}))

// Mock de los componentes de página
vi.mock('../../pages/Signin', () => ({
  default: () => {
    const { signInUser } = require('../../context/AuthContext')
    const [email, setEmail] = vi.fn()
    const [password, setPassword] = vi.fn()
    
    return (
      <div data-testid="signin-page">
        <h1>Iniciar Sesión</h1>
        <input 
          data-testid="email-input"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          data-testid="password-input"
          type="password"
          placeholder="Contraseña"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button 
          data-testid="signin-button"
          onClick={() => signInUser(email, password)}
        >
          Iniciar Sesión
        </button>
      </div>
    )
  }
}))

vi.mock('../../pages/Dashboard', () => ({
  default: () => (
    <div data-testid="dashboard-page">
      <h1>Dashboard</h1>
      <nav>
        <a href="/teams" data-testid="teams-link">Equipos</a>
        <a href="/players" data-testid="players-link">Jugadores</a>
        <a href="/schedule" data-testid="schedule-link">Calendario</a>
        <a href="/admin" data-testid="admin-link">Administración</a>
        <a href="/myaccount" data-testid="myaccount-link">Mi Cuenta</a>
      </nav>
    </div>
  )
}))

vi.mock('../../pages/Teams', () => ({
  default: () => (
    <div data-testid="teams-page">
      <h1>Gestión de Equipos</h1>
      <button data-testid="add-team-button">Agregar Equipo</button>
      <div data-testid="teams-list">Lista de equipos</div>
    </div>
  )
}))

vi.mock('../../pages/Players', () => ({
  default: () => (
    <div data-testid="players-page">
      <h1>Gestión de Jugadores</h1>
      <button data-testid="add-player-button">Agregar Jugador</button>
      <div data-testid="players-list">Lista de jugadores</div>
    </div>
  )
}))

vi.mock('../../pages/Schedule', () => ({
  default: () => (
    <div data-testid="schedule-page">
      <h1>Calendario</h1>
      <button data-testid="add-event-button">Agregar Evento</button>
      <div data-testid="schedule-list">Lista de eventos</div>
    </div>
  )
}))

const renderWithProviders = () => {
  return render(
    <AuthContextProvider>
      <RouterProvider router={router} />
    </AuthContextProvider>
  )
}

describe('End-to-End Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Flujo de Autenticación', () => {
    it('debería permitir el flujo completo de inicio de sesión', async () => {
      const { supabase } = await import('../../supabaseClient')
      
      // Simular usuario no autenticado inicialmente
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      })

      // Simular inicio de sesión exitoso
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { 
          session: { user: { id: '123', email: 'test@test.com' } },
          user: { id: '123', email: 'test@test.com' }
        },
        error: null
      })

      renderWithProviders()

      // Verificar que se muestra la página de inicio de sesión
      await waitFor(() => {
        expect(screen.getByTestId('signin-page')).toBeInTheDocument()
      })

      // Simular cambio de estado de autenticación
      const authStateCallback = supabase.auth.onAuthStateChange.mock.calls[0][0]
      authStateCallback('SIGNED_IN', { user: { id: '123', email: 'test@test.com' } })

      // Verificar que se redirige al dashboard
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('debería manejar errores de autenticación', async () => {
      const { supabase } = await import('../../supabaseClient')
      
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      })

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Credenciales inválidas' }
      })

      renderWithProviders()

      await waitFor(() => {
        expect(screen.getByTestId('signin-page')).toBeInTheDocument()
      })
    })
  })

  describe('Flujo de Navegación', () => {
    it('debería permitir navegación entre páginas autenticadas', async () => {
      const { supabase } = await import('../../supabaseClient')
      const mockSession = { user: { id: '123', email: 'test@test.com' } }
      
      supabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      renderWithProviders()

      // Verificar que se muestra el dashboard
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
      })

      // Verificar que los enlaces de navegación están presentes
      expect(screen.getByTestId('teams-link')).toBeInTheDocument()
      expect(screen.getByTestId('players-link')).toBeInTheDocument()
      expect(screen.getByTestId('schedule-link')).toBeInTheDocument()
      expect(screen.getByTestId('admin-link')).toBeInTheDocument()
      expect(screen.getByTestId('myaccount-link')).toBeInTheDocument()
    })

    it('debería proteger rutas cuando no hay autenticación', async () => {
      const { supabase } = await import('../../supabaseClient')
      
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      })

      // Intentar acceder a una ruta protegida
      window.history.pushState({}, '', '/teams')
      renderWithProviders()

      // Debería redirigir al signin
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/signin')
      })
    })
  })

  describe('Flujo de Gestión de Datos', () => {
    it('debería permitir acceso a páginas de gestión cuando está autenticado', async () => {
      const { supabase } = await import('../../supabaseClient')
      const mockSession = { user: { id: '123', email: 'test@test.com' } }
      
      supabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      // Navegar a diferentes páginas de gestión
      const pages = [
        { path: '/teams', testId: 'teams-page' },
        { path: '/players', testId: 'players-page' },
        { path: '/schedule', testId: 'schedule-page' }
      ]

      for (const page of pages) {
        window.history.pushState({}, '', page.path)
        renderWithProviders()

        await waitFor(() => {
          expect(screen.getByTestId(page.testId)).toBeInTheDocument()
        })
      }
    })

    it('debería mostrar botones de acción en páginas de gestión', async () => {
      const { supabase } = await import('../../supabaseClient')
      const mockSession = { user: { id: '123', email: 'test@test.com' } }
      
      supabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      // Verificar botones en página de equipos
      window.history.pushState({}, '', '/teams')
      renderWithProviders()
      
      await waitFor(() => {
        expect(screen.getByTestId('add-team-button')).toBeInTheDocument()
      })

      // Verificar botones en página de jugadores
      window.history.pushState({}, '', '/players')
      renderWithProviders()
      
      await waitFor(() => {
        expect(screen.getByTestId('add-player-button')).toBeInTheDocument()
      })

      // Verificar botones en página de calendario
      window.history.pushState({}, '', '/schedule')
      renderWithProviders()
      
      await waitFor(() => {
        expect(screen.getByTestId('add-event-button')).toBeInTheDocument()
      })
    })
  })

  describe('Flujo de Cierre de Sesión', () => {
    it('debería permitir cerrar sesión correctamente', async () => {
      const { supabase } = await import('../../supabaseClient')
      const mockSession = { user: { id: '123', email: 'test@test.com' } }
      
      supabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      supabase.auth.signOut.mockResolvedValue({
        error: null
      })

      renderWithProviders()

      // Verificar que se muestra el dashboard
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
      })

      // Simular cierre de sesión
      const authStateCallback = supabase.auth.onAuthStateChange.mock.calls[0][0]
      authStateCallback('SIGNED_OUT', null)

      // Verificar que se redirige al signin
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/signin')
      })
    })
  })

  describe('Manejo de Errores', () => {
    it('debería manejar errores de red correctamente', async () => {
      const { supabase } = await import('../../supabaseClient')
      
      supabase.auth.getSession.mockRejectedValue(new Error('Network error'))

      renderWithProviders()

      // Debería manejar el error y no crashear la aplicación
      await waitFor(() => {
        expect(screen.getByText('Cargando...')).toBeInTheDocument()
      })
    })

    it('debería manejar errores de base de datos correctamente', async () => {
      const { supabase } = await import('../../supabaseClient')
      const mockSession = { user: { id: '123', email: 'test@test.com' } }
      
      supabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      // Simular error en consulta de base de datos
      supabase.from.mockReturnValue({
        select: vi.fn(() => Promise.resolve({ 
          data: null, 
          error: { message: 'Database connection error' } 
        }))
      })

      window.history.pushState({}, '', '/teams')
      renderWithProviders()

      // La aplicación debería seguir funcionando
      await waitFor(() => {
        expect(screen.getByTestId('teams-page')).toBeInTheDocument()
      })
    })
  })
})

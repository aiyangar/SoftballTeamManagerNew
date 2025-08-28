import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AuthContextProvider, UserAuth } from '../../context/AuthContext'

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
    }
  }
}))

// Componente de prueba para acceder al contexto
const TestComponent = () => {
  const { session, loading, signInUser, signUpNewUser, signOut } = UserAuth()
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="session">{session ? 'authenticated' : 'not-authenticated'}</div>
      <button onClick={() => signInUser('test@test.com', 'password')}>Sign In</button>
      <button onClick={() => signUpNewUser('test@test.com', 'password')}>Sign Up</button>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}

describe('AuthContext Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería mostrar estado de carga inicial', async () => {
    const { supabase } = await import('../../supabaseClient')
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    })

    render(
      <AuthContextProvider>
        <TestComponent />
      </AuthContextProvider>
    )

    expect(screen.getByTestId('loading')).toHaveTextContent('loading')
  })

  it('debería manejar sesión autenticada correctamente', async () => {
    const { supabase } = await import('../../supabaseClient')
    const mockSession = { user: { id: '123', email: 'test@test.com' } }
    
    supabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null
    })

    render(
      <AuthContextProvider>
        <TestComponent />
      </AuthContextProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
      expect(screen.getByTestId('session')).toHaveTextContent('authenticated')
    })
  })

  it('debería manejar sesión no autenticada correctamente', async () => {
    const { supabase } = await import('../../supabaseClient')
    
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    })

    render(
      <AuthContextProvider>
        <TestComponent />
      </AuthContextProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
      expect(screen.getByTestId('session')).toHaveTextContent('not-authenticated')
    })
  })

  it('debería manejar errores de autenticación', async () => {
    const { supabase } = await import('../../supabaseClient')
    
    supabase.auth.getSession.mockRejectedValue(new Error('Network error'))

    render(
      <AuthContextProvider>
        <TestComponent />
      </AuthContextProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
    })
  })
})

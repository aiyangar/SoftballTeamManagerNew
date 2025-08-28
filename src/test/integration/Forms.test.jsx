import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { AuthContextProvider } from '../../context/AuthContext'
import PlayerForm from '../../components/Forms/PlayerForm'
import TeamForm from '../../components/Forms/TeamForm'
import ScheduleForm from '../../components/Forms/ScheduleForm'
import PaymentForm from '../../components/Forms/PaymentForm'

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
      }))
    }))
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

describe('Forms Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('PlayerForm Integration Tests', () => {
    it('debería renderizar el formulario de jugador correctamente', () => {
      renderWithProviders(<PlayerForm />)
      
      expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/apellido/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/posición/i)).toBeInTheDocument()
    })

    it('debería validar campos requeridos', async () => {
      renderWithProviders(<PlayerForm />)
      
      const submitButton = screen.getByRole('button', { name: /guardar/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/el nombre es requerido/i)).toBeInTheDocument()
        expect(screen.getByText(/el apellido es requerido/i)).toBeInTheDocument()
        expect(screen.getByText(/el email es requerido/i)).toBeInTheDocument()
      })
    })

    it('debería validar formato de email', async () => {
      renderWithProviders(<PlayerForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      
      const submitButton = screen.getByRole('button', { name: /guardar/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/email inválido/i)).toBeInTheDocument()
      })
    })

    it('debería permitir envío con datos válidos', async () => {
      renderWithProviders(<PlayerForm />)
      
      // Llenar formulario con datos válidos
      fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Juan' } })
      fireEvent.change(screen.getByLabelText(/apellido/i), { target: { value: 'Pérez' } })
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'juan@test.com' } })
      fireEvent.change(screen.getByLabelText(/teléfono/i), { target: { value: '123456789' } })
      fireEvent.change(screen.getByLabelText(/posición/i), { target: { value: 'Pitcher' } })
      
      const submitButton = screen.getByRole('button', { name: /guardar/i })
      fireEvent.click(submitButton)
      
      // No debería mostrar errores de validación
      await waitFor(() => {
        expect(screen.queryByText(/el nombre es requerido/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/el apellido es requerido/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/el email es requerido/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('TeamForm Integration Tests', () => {
    it('debería renderizar el formulario de equipo correctamente', () => {
      renderWithProviders(<TeamForm />)
      
      expect(screen.getByLabelText(/nombre del equipo/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/categoría/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/liga/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/temporada/i)).toBeInTheDocument()
    })

    it('debería validar campos requeridos del equipo', async () => {
      renderWithProviders(<TeamForm />)
      
      const submitButton = screen.getByRole('button', { name: /guardar/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/el nombre del equipo es requerido/i)).toBeInTheDocument()
        expect(screen.getByText(/la categoría es requerida/i)).toBeInTheDocument()
      })
    })

    it('debería permitir envío con datos válidos del equipo', async () => {
      renderWithProviders(<TeamForm />)
      
      // Llenar formulario con datos válidos
      fireEvent.change(screen.getByLabelText(/nombre del equipo/i), { target: { value: 'Los Tigres' } })
      fireEvent.change(screen.getByLabelText(/categoría/i), { target: { value: 'Senior' } })
      fireEvent.change(screen.getByLabelText(/liga/i), { target: { value: 'Liga Metropolitana' } })
      fireEvent.change(screen.getByLabelText(/temporada/i), { target: { value: '2024' } })
      
      const submitButton = screen.getByRole('button', { name: /guardar/i })
      fireEvent.click(submitButton)
      
      // No debería mostrar errores de validación
      await waitFor(() => {
        expect(screen.queryByText(/el nombre del equipo es requerido/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/la categoría es requerida/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('ScheduleForm Integration Tests', () => {
    it('debería renderizar el formulario de calendario correctamente', () => {
      renderWithProviders(<ScheduleForm />)
      
      expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/fecha/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/hora/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/tipo/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument()
    })

    it('debería validar campos requeridos del calendario', async () => {
      renderWithProviders(<ScheduleForm />)
      
      const submitButton = screen.getByRole('button', { name: /guardar/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/el título es requerido/i)).toBeInTheDocument()
        expect(screen.getByText(/la fecha es requerida/i)).toBeInTheDocument()
        expect(screen.getByText(/la hora es requerida/i)).toBeInTheDocument()
      })
    })

    it('debería permitir envío con datos válidos del calendario', async () => {
      renderWithProviders(<ScheduleForm />)
      
      // Llenar formulario con datos válidos
      fireEvent.change(screen.getByLabelText(/título/i), { target: { value: 'Partido vs Los Leones' } })
      fireEvent.change(screen.getByLabelText(/fecha/i), { target: { value: '2024-12-25' } })
      fireEvent.change(screen.getByLabelText(/hora/i), { target: { value: '15:00' } })
      fireEvent.change(screen.getByLabelText(/tipo/i), { target: { value: 'Partido' } })
      fireEvent.change(screen.getByLabelText(/descripción/i), { target: { value: 'Partido de liga' } })
      
      const submitButton = screen.getByRole('button', { name: /guardar/i })
      fireEvent.click(submitButton)
      
      // No debería mostrar errores de validación
      await waitFor(() => {
        expect(screen.queryByText(/el título es requerido/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/la fecha es requerida/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/la hora es requerida/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('PaymentForm Integration Tests', () => {
    it('debería renderizar el formulario de pago correctamente', () => {
      renderWithProviders(<PaymentForm />)
      
      expect(screen.getByLabelText(/jugador/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/monto/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/fecha de pago/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/método de pago/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/notas/i)).toBeInTheDocument()
    })

    it('debería validar campos requeridos del pago', async () => {
      renderWithProviders(<PaymentForm />)
      
      const submitButton = screen.getByRole('button', { name: /guardar/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/el jugador es requerido/i)).toBeInTheDocument()
        expect(screen.getByText(/el monto es requerido/i)).toBeInTheDocument()
        expect(screen.getByText(/la fecha de pago es requerida/i)).toBeInTheDocument()
      })
    })

    it('debería validar monto numérico', async () => {
      renderWithProviders(<PaymentForm />)
      
      const amountInput = screen.getByLabelText(/monto/i)
      fireEvent.change(amountInput, { target: { value: 'invalid-amount' } })
      
      const submitButton = screen.getByRole('button', { name: /guardar/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/el monto debe ser un número válido/i)).toBeInTheDocument()
      })
    })

    it('debería permitir envío con datos válidos del pago', async () => {
      renderWithProviders(<PaymentForm />)
      
      // Llenar formulario con datos válidos
      fireEvent.change(screen.getByLabelText(/jugador/i), { target: { value: 'Juan Pérez' } })
      fireEvent.change(screen.getByLabelText(/monto/i), { target: { value: '150.00' } })
      fireEvent.change(screen.getByLabelText(/fecha de pago/i), { target: { value: '2024-12-25' } })
      fireEvent.change(screen.getByLabelText(/método de pago/i), { target: { value: 'Efectivo' } })
      fireEvent.change(screen.getByLabelText(/notas/i), { target: { value: 'Pago de cuota mensual' } })
      
      const submitButton = screen.getByRole('button', { name: /guardar/i })
      fireEvent.click(submitButton)
      
      // No debería mostrar errores de validación
      await waitFor(() => {
        expect(screen.queryByText(/el jugador es requerido/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/el monto es requerido/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/la fecha de pago es requerida/i)).not.toBeInTheDocument()
      })
    })
  })
})

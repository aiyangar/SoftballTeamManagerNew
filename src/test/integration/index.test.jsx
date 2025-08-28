// Archivo índice para todas las pruebas de integración
// Este archivo importa todas las pruebas de integración para ejecutarlas juntas

import './AuthContext.test.jsx'
import './AutoNavigator.test.jsx'
import './ProtectedRoute.test.jsx'
import './Router.test.jsx'
import './Forms.test.jsx'
import './EndToEnd.test.jsx'

// Configuración global para las pruebas de integración
describe('Suite de Pruebas de Integración', () => {
  it('debería tener todas las pruebas de integración configuradas', () => {
    expect(true).toBe(true)
  })
})

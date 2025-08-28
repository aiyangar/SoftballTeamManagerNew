import { describe, it, expect } from 'vitest'

describe('Prueba Básica', () => {
  it('debería funcionar correctamente', () => {
    expect(true).toBe(true)
  })

  it('debería poder usar mocks globales', () => {
    expect(global.supabase).toBeDefined()
    expect(global.supabase.auth.getSession).toBeDefined()
  })
})

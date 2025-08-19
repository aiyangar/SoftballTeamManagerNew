import React from 'react'
import { Link } from 'react-router-dom'
import VersionFooter from './VersionFooter'

/**
 * Componente para el registro de nuevos usuarios
 * Actualmente deshabilitado - solo el administrador puede crear usuarios
 */
const Signup = () => {
  return (
    <>
      <div className='max-w-md m-auto pt-24'>
          <div className="bg-neutral-900 border border-gray-600 rounded-lg p-8 shadow-lg">
              <div className="text-center">
                  {/* Icono de candado */}
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-800 mb-6">
                      <svg className="h-8 w-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                  </div>
                  
                  <h2 className="font-bold pb-2 text-2xl text-white">Registro Deshabilitado</h2>
                  
                  <div className="mt-4 space-y-4">
                      <p className="text-gray-300 leading-relaxed">
                          El registro público está actualmente deshabilitado. 
                          Solo el administrador puede crear nuevas cuentas de usuario.
                      </p>
                      
                      <div className="bg-blue-900 border border-blue-600 rounded-lg p-4">
                          <h3 className="font-semibold text-blue-200 mb-2">¿Necesitas acceso?</h3>
                          <p className="text-blue-100 text-sm">
                              Contacta al administrador del sistema para solicitar una cuenta.
                          </p>
                      </div>
                      
                      <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-4">
                          <h3 className="font-semibold text-yellow-200 mb-2">¿Ya tienes una cuenta?</h3>
                          <p className="text-yellow-100 text-sm mb-3">
                              Si ya tienes credenciales, puedes iniciar sesión.
                          </p>
                          <Link 
                              to="/signin" 
                              className="inline-block bg-black text-white px-4 py-2 rounded-md hover:bg-gray-900 transition-colors text-sm"
                          >
                              Iniciar Sesión
                          </Link>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      
      {/* Footer con versión */}
      <VersionFooter />
    </>
  )
}

export default Signup
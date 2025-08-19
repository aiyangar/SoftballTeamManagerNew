import React from 'react'

/**
 * Componente VersionFooter - Muestra el número de versión como disclaimer
 * Se usa en todas las páginas que no son modales
 */
const VersionFooter = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-gray-600 py-2 px-4 z-10">
      <div className="text-center">
        <p className="text-gray-400 text-xs">
          Versión 0.8.0 - Softball Team Manager
        </p>
      </div>
    </div>
  )
}

export default VersionFooter

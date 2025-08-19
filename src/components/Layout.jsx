import React from 'react'
import Menu from './Menu.jsx'

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-left text-3xl text-white">STM</h1>
          <Menu />
        </div>
        {children}
      </div>
    </div>
  )
}

export default Layout

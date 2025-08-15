import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { RouterProvider } from 'react-router-dom'
import { router } from './router.jsx'
import { AuthContextProvider } from './context/AuthContext.jsx'
import { TeamProvider } from './context/TeamContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <>
      <h1 className="text-center pt-4 text-3xl">
        SoftBall Team Manager
      </h1>
      <AuthContextProvider>
        <TeamProvider>
          <RouterProvider router={router} />
        </TeamProvider>
      </AuthContextProvider>
    </>
  </StrictMode>,
)

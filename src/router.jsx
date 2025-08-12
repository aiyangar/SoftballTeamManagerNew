import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Signup from "./components/Signup";
import Signin from "./components/Signin";
import Dashboard from "./components/Dashboard";
import Teams from "./components/Teams";
import Players from "./components/Players";
import ProtectedRoute from "./components/ProtectedRoute";

/**
 * Configuración de rutas de la aplicación
 * Define todas las rutas disponibles y sus componentes correspondientes
 */
export const router = createBrowserRouter([
    // Ruta principal que maneja la navegación automática
    { path: "/", element: <App /> },
    
    // Rutas públicas (no requieren autenticación)
    { path: "/signup", element: <Signup /> },
    { path: "/signin", element: <Signin /> },
    
    // Rutas protegidas (requieren autenticación)
    { 
        path: "/teams", 
        element: (
            <ProtectedRoute>
                <Teams />
            </ProtectedRoute>
        ) 
    },
    
    // Ruta protegida para gestión de jugadores
    { 
        path: "/players", 
        element: (
            <ProtectedRoute>
                <Players />
            </ProtectedRoute>
        ) 
    },
    
    // Ruta protegida (requiere autenticación)
    { 
        path: "/dashboard", 
        element: (
            <ProtectedRoute>
                <Dashboard />
            </ProtectedRoute>
        ) 
    },
]);
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import Dashboard from "./pages/Dashboard";
import Teams from "./pages/Teams";
import Players from "./pages/Players";
import Schedule from "./pages/Schedule";
import AdminPanel from "./pages/AdminPanel";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout.jsx";

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
                <Layout>
                    <Teams />
                </Layout>
            </ProtectedRoute>
        ) 
    },
    
    // Ruta protegida para gestión de jugadores
    { 
        path: "/players", 
        element: (
            <ProtectedRoute>
                <Layout>
                    <Players />
                </Layout>
            </ProtectedRoute>
        ) 
    },
    
    {
        path: "/schedule",
        element: (
            <ProtectedRoute>
                <Layout>
                    <Schedule />
                </Layout>
            </ProtectedRoute>
        )
    },

    // Ruta protegida (requiere autenticación)
    { 
        path: "/dashboard", 
        element: (
            <ProtectedRoute>
                <Layout>
                    <Dashboard />
                </Layout>
            </ProtectedRoute>
        ) 
    },

    // Ruta protegida para panel de administración
    { 
        path: "/admin", 
        element: (
            <ProtectedRoute>
                <Layout>
                    <AdminPanel />
                </Layout>
            </ProtectedRoute>
        ) 
    },
]);
import {createBrowserRouter} from 'react-router-dom'
import App from './App'
import Signin from './components/Signin'
import Signup from './components/Signup'
import Dashboard from './pages/Dashboard'

export const router = createBrowserRouter([
    { path: '/', element: <App /> },
    { path: '/signin', element: <Signin /> },
    { path: '/signup', element: <Signup /> },
    { path: '/dashboard', element: <Dashboard /> },
])

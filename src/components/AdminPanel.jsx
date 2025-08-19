import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { UserAuth } from '../context/AuthContext';
import VersionFooter from './VersionFooter';
import Menu from './Menu';

const AdminPanel = () => {
    const authContext = UserAuth();
    const session = authContext?.session;

    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [newUser, setNewUser] = useState({
        email: '',
        password: ''
    });
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Limpiar mensaje de éxito después de 5 segundos
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                setSuccess(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    const createUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Usar signUp en lugar de admin.createUser
            const { data, error } = await supabase.auth.signUp({
                email: newUser.email,
                password: newUser.password,
                options: {
                    emailRedirectTo: window.location.origin + '/signin'
                }
            });

            if (error) {
                setError('Error al crear usuario: ' + error.message);
            } else {
                setSuccess('Usuario creado exitosamente. Se ha enviado un email de confirmación.');
                setNewUser({ email: '', password: '' });
                setShowCreateForm(false);
            }
        } catch (error) {
            setError('Error inesperado al crear usuario');
        } finally {
            setLoading(false);
        }
    };

    // Verificar si el usuario actual es administrador
    // Cambia esta línea con tu email real
    const isAdmin = session?.user?.email === adminEmail; // Cambia por tu email real

    if (!isAdmin) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-white">Panel de Administración</h1>
                    <Menu />
                </div>
                <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded">
                    <p className="font-semibold mb-2">No tienes permisos para acceder al panel de administración.</p>
                                         <p className="text-sm">Para acceder, debes:</p>
                     <ol className="list-decimal list-inside text-sm mt-2 space-y-1">
                         <li>Configurar la variable VITE_ADMIN_EMAIL en el archivo .env</li>
                         <li>Agregar tu email real como valor de la variable</li>
                         <li>Reiniciar el servidor de desarrollo</li>
                     </ol>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="max-w-6xl mx-auto p-6">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-white">Panel de Administración</h1>
                    <Menu />
                </div>

                {/* Mensajes de error y éxito */}
                {error && (
                    <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-900 border border-green-600 text-green-200 px-4 py-3 rounded mb-6">
                        {success}
                    </div>
                )}

                

                {/* Botón para crear usuario */}
                <div className="mb-8">
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>{showCreateForm ? 'Cancelar' : 'Crear Nuevo Usuario'}</span>
                    </button>
                </div>

                {/* Formulario para crear usuario */}
                {showCreateForm && (
                    <div className="bg-neutral-900 shadow rounded-lg p-6 mb-8">
                        <h2 className="text-xl font-semibold mb-6 text-white">Crear Nuevo Usuario</h2>
                        <div className="bg-blue-900 border border-blue-600 rounded-lg p-4 mb-6">
                            <h3 className="font-semibold text-blue-200 mb-2">📧 Proceso de Creación</h3>
                            <p className="text-blue-100 text-sm">
                                Al crear un usuario, se enviará un email de confirmación. 
                                El usuario deberá confirmar su email antes de poder acceder al sistema.
                            </p>
                        </div>
                        <form onSubmit={createUser} className="space-y-4">
                            <input
                                type="email"
                                placeholder="Email del usuario"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                className="w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white"
                                required
                            />
                            <input
                                type="password"
                                placeholder="Contraseña temporal"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                className="w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white"
                                required
                                minLength={6}
                            />
                            <div className="flex space-x-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateForm(false);
                                        setNewUser({ email: '', password: '' });
                                    }}
                                    className="flex-1 px-4 py-3 border border-gray-600 text-gray-300 rounded hover:bg-gray-800 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? 'Creando...' : 'Crear Usuario'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Instrucciones de administración */}
                <div className="bg-neutral-900 shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-6 text-white">Instrucciones de Administración</h2>
                    <div className="space-y-4 text-gray-300">
                        <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-4">
                            <h3 className="font-semibold text-yellow-200 mb-2">🔧 Configuración en Supabase</h3>
                            <ol className="list-decimal list-inside space-y-1 text-sm">
                                <li>Ve al Dashboard de Supabase</li>
                                <li>Navega a <strong>Authentication</strong> → <strong>Settings</strong></li>
                                <li>Desactiva <strong>"Enable sign up"</strong> para deshabilitar registro público</li>
                                <li>Ve a <strong>Authentication</strong> → <strong>Users</strong> para gestionar usuarios</li>
                            </ol>
                        </div>
                        
                        <div className="bg-green-900 border border-green-600 rounded-lg p-4">
                            <h3 className="font-semibold text-green-200 mb-2">✅ Gestión de Usuarios</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>Los usuarios creados recibirán un email de confirmación</li>
                                <li>Puedes confirmar usuarios manualmente desde el Dashboard de Supabase</li>
                                <li>Puedes deshabilitar usuarios desde <strong>Authentication</strong> → <strong>Users</strong></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Footer con versión */}
            <VersionFooter />
        </>
    );
};

export default AdminPanel;

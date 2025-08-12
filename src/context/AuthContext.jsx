import { createContext, useEffect, useState, useContext } from "react";
import { supabase } from "../supabaseClient"

const AuthContext = createContext()

export const AuthContextProvider = ({ children }) => {
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)

    // Sign up
    const signUpNewUser = async (email, password) => {
        try {
            // Intentar hacer signin directamente (si el usuario ya existe)
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            })
            
            if (signInData.user) {
                console.log('Usuario ya existe, signin exitoso:', signInData)
                return { success: true, data: signInData, isExistingUser: true }
            }
        } catch (error) {
            console.log('Usuario no existe, procediendo con registro...')
        }
        
        // Si no existe, crear nuevo usuario
        const { data, error } = await supabase.auth.signUp({ 
            email: email, 
            password: password,
            options: {
                emailRedirectTo: `${window.location.origin}/dashboard`
            }
        })
        
        if (error) {
            console.error('Error en signup:', error)
            return { success: false, error: error.message }
        } 
        
        console.log('Signup response:', data)
        return { success: true, data: data, isExistingUser: false }
    }

    // Sign in
    const signInUser = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ 
                email: email,
                password: password 
                })
            if (error) {
                console.error(error)
                return { success: false, error: error.message }
            }
            console.log(data)
            return { success: true, data: data }
        } catch (error) {
            console.error(error)
            return { success: false, error: error.message }
        }
    }

    useEffect(() => {
        // Obtener sesión inicial
        const getInitialSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()
                if (error) {
                    console.error('Error getting session:', error)
                }
                setSession(session)
            } catch (error) {
                console.error('Error in getInitialSession:', error)
            } finally {
                setLoading(false)
            }
        }

        getInitialSession()

        // Escuchar cambios de autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log('Auth state changed:', _event, session)
            setSession(session)
        })

        // Limpiar subscription
        return () => subscription.unsubscribe()
    }, [])

    // Sign out
    const signOut = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
            console.error(error)
        }
    }

    return (
        <AuthContext.Provider value={{ session, loading, signUpNewUser, signInUser, signOut }}>{children}</AuthContext.Provider>    
    )
}

export const UserAuth = () => {
    return useContext(AuthContext)
}
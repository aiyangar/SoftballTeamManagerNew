import { createContext, useEffect, useState, useContext } from "react";

const AuthContext = createContext()

export const AuthContextProvider = ({ children }) => {
    const [session, setSession] = useState(undefined )

    useEffect(() => {
        const session = localStorage.getItem('session')
        if (session) {
            setSession(session)
        }
    }, [])
    return (
        <AuthContext.Provider value={{ session, setSession }}>
            {children}
        </AuthContext.Provider>
    )
}

export const UserAuth = () => {
    return useContext(AuthContext)
}
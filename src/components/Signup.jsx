import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext.jsx'

const Signup = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const { session, signUpNewUser, signInUser, signOut } = UserAuth()
    console.log(session)
    console.log(email, password)
    const handleSignUp = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const result = await signUpNewUser(email, password)
            if (result.success) {
                navigate('/dashboard')
            }
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }
    
  return (
    <div>
        <form onSubmit={handleSignUp} className='max-w-md m-auto pt-24'>
            <h2 className="font-bold pb-2">Sign up</h2>
            <p>Ya tienes una cuenta? <Link to="/signin">Inicia sesión</Link></p>
            <div className='flex flex-col py-4'>
                <input 
                  onChange={(e) => setEmail(e.target.value)}
                  className='p-3 border mt-6 
                  border-gray-300 rounded-md' 
                  type="email" 
                  placeholder='Email' 
                />
                <input 
                  onChange={(e) => setPassword(e.target.value)}
                  className='p-3 
                  border mt-6 
                  border-gray-300 
                  rounded-md' 
                  type="password" 
                  placeholder='Password' 
                />
                <button type='submit' disabled={loading} className='mt-6 border border-gray-300 rounded-md'>
                  Signup
                </button>
                {error && <p className='text-red-500 text-center pt-4'>{error}</p>}
            </div>
        </form>
    </div>
  )
}

export default Signup
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext.jsx'

const Signup = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const { session } = UserAuth()
    console.log(session)
    
  return (
    <div>
        <form className='max-w-md m-auto pt-24'>
            <h2 className="font-bold pb-2">Sign up</h2>
            <p>Ya tienes una cuenta? <Link to="/signin">Inicia sesión</Link></p>
            <div className='flex flex-col py-4'>
                <input className='p-3 border mt-6 border-gray-300 rounded-md' type="email" placeholder='Email' />
                <input className='p-3 border mt-6 border-gray-300 rounded-md' type="password" placeholder='Password' />
                <button type='submit' disabled={loading} className='mt-6 border border-gray-300 rounded-md'>Signup</button>
            </div>
        </form>
    </div>
  )
}

export default Signup
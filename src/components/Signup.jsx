import React from 'react'
import { Link } from 'react-router-dom'

const Signup = () => {
  return (
    <div>
        <form>
            <h2>Sign up</h2>
            <p>Ya tienes una cuenta? <Link to="/signin">Inicia sesión</Link></p>
            <div className='flex flex-col py-4'>
                <input type="text" placeholder='Username' />
                <input type="email" placeholder='Email' />
                <input type="password" placeholder='Password' />
                <button type='submit'>Signup</button>
            </div>
            
        </form>
    </div>
  )
}

export default Signup
import React from 'react'

const Signup = () => {
  return (
    <div>
        <form>
            <h2>Sign up</h2>
            <p>Ya tienes una cuenta? <Link to="/signin">Inicia sesión</Link></p>
            <input type="text" placeholder='Username' />
            <input type="email" placeholder='Email' />
            <input type="password" placeholder='Password' />
            <button type='submit'>Signup</button>
        </form>
    </div>
  )
}

export default Signup
import React from 'react'
import { UserAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const { session, signOut } = UserAuth()
  const navigate = useNavigate()

  console.log(session)

  return (
    <div>
      <h1>Dashboard</h1>
      <h2>Welcome {session?.user?.email}</h2>
      <div className='flex justify-center'>
        <p className='text-red-500'>Sign out</p>
      </div>
    </div>
  )
}

export default Dashboard
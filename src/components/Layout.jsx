import React from 'react';
import { Link } from 'react-router-dom';
import Menu from './Menu.jsx';
import MySoftballClubLogo from '../assets/MySoftballClubLogoV2.png';

const Layout = ({ children }) => {
  return (
    <div className='min-h-screen bg-gray-900'>
      <div className='max-w-6xl mx-auto p-6'>
        <div className='flex justify-between items-center mb-8'>
          <Link to="/dashboard" className="hover:opacity-80 transition-opacity">
            <img 
              src={MySoftballClubLogo} 
              alt="My Softball Club Logo" 
              className='h-14 sm:h-16 md:h-18 lg:h-20 w-auto'
            />
          </Link>
          <Menu />
        </div>
        {children}
      </div>
    </div>
  );
};

export default Layout;

import React from 'react';
import { Link } from 'react-router-dom';
import Menu from './Menu.jsx';
import MySoftballClubLogo from '../assets/MySoftballClubLogoV2.png';

const Layout = ({ children }) => {
  return (
    <div className='min-h-screen bg-surface-900'>
      <header className='sticky top-0 z-40 bg-surface-900/95 backdrop-blur-sm border-b border-surface-border'>
        <div className='max-w-7xl 3xl:max-w-[1680px] mx-auto px-3 fold:px-4 sm:px-6 py-3 flex justify-between items-center'>
          <Link to="/dashboard" className="hover:opacity-80 transition-opacity">
            <img
              src={MySoftballClubLogo}
              alt="My Softball Club Logo"
              className='h-12 sm:h-14 md:h-16 lg:h-18 w-auto'
            />
          </Link>
          <Menu />
        </div>
      </header>
      <div className='max-w-7xl 3xl:max-w-[1680px] mx-auto p-3 fold:p-4 sm:p-6'>
        {children}
      </div>
    </div>
  );
};

export default Layout;

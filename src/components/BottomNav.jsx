import React from 'react';
import { NavLink } from 'react-router-dom';
import { navItems } from './navItems.jsx';

const BottomNav = () => (
  <nav className='fixed bottom-0 left-0 right-0 z-30 md:hidden bg-neutral-900/95 backdrop-blur-sm border-t border-surface-border'>
    <div className='flex items-stretch justify-around'>
      {navItems.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-xs transition-colors ${
              isActive ? 'text-blue-400' : 'text-gray-400 hover:text-white'
            }`
          }
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </div>
  </nav>
);

export default BottomNav;

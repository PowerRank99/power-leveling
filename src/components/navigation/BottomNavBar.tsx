
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, TrophyIcon, DumbbellIcon, UserIcon, UsersIcon } from '@/components/icons/NavIcons';

const BottomNavBar: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  
  const isActive = (route: string): boolean => {
    if (route === '/' && path === '/') return true;
    if (route !== '/' && path.startsWith(route)) return true;
    return false;
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-midnight-100/90 backdrop-blur-lg border-t border-arcane/20 shadow-lg z-10">
      <div className="grid grid-cols-5 h-full">
        <Link 
          to="/" 
          className={`flex flex-col items-center justify-center ${
            isActive('/') 
              ? 'text-arcane' 
              : 'text-ghost-500 hover:text-ghost-300'
          }`}
        >
          <div className={`relative ${isActive('/') ? 'nav-active' : ''}`}>
            <HomeIcon className="w-6 h-6" />
            {isActive('/') && <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-arcane"></div>}
          </div>
          <span className="text-[10px] mt-1 font-display tracking-wide">Feed</span>
        </Link>
        
        <Link 
          to="/treino" 
          className={`flex flex-col items-center justify-center ${
            isActive('/treino') 
              ? 'text-arcane' 
              : 'text-ghost-500 hover:text-ghost-300'
          }`}
        >
          <div className={`relative ${isActive('/treino') ? 'nav-active' : ''}`}>
            <DumbbellIcon className="w-6 h-6" />
            {isActive('/treino') && <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-arcane"></div>}
          </div>
          <span className="text-[10px] mt-1 font-display tracking-wide">Treino</span>
        </Link>
        
        <Link 
          to="/guilds" 
          className={`flex flex-col items-center justify-center ${
            isActive('/guilds') 
              ? 'text-arcane' 
              : 'text-ghost-500 hover:text-ghost-300'
          }`}
        >
          <div className={`relative ${isActive('/guilds') ? 'nav-active' : ''}`}>
            <UsersIcon className="w-6 h-6" />
            {isActive('/guilds') && <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-arcane"></div>}
          </div>
          <span className="text-[10px] mt-1 font-display tracking-wide">Guildas</span>
        </Link>
        
        <Link 
          to="/conquistas" 
          className={`flex flex-col items-center justify-center ${
            isActive('/conquistas') 
              ? 'text-arcane' 
              : 'text-ghost-500 hover:text-ghost-300'
          }`}
        >
          <div className={`relative ${isActive('/conquistas') ? 'nav-active' : ''}`}>
            <TrophyIcon className="w-6 h-6" />
            {isActive('/conquistas') && <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-arcane"></div>}
          </div>
          <span className="text-[10px] mt-1 font-display tracking-wide">Conquistas</span>
        </Link>
        
        <Link 
          to="/perfil" 
          className={`flex flex-col items-center justify-center ${
            isActive('/perfil') 
              ? 'text-arcane' 
              : 'text-ghost-500 hover:text-ghost-300'
          }`}
        >
          <div className={`relative ${isActive('/perfil') ? 'nav-active' : ''}`}>
            <UserIcon className="w-6 h-6" />
            {isActive('/perfil') && <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-arcane"></div>}
          </div>
          <span className="text-[10px] mt-1 font-display tracking-wide">Perfil</span>
        </Link>
      </div>
    </div>
  );
};

export default BottomNavBar;

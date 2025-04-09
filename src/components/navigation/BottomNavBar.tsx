
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Dumbbell, Trophy, UserCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const BottomNavBar = () => {
  const location = useLocation();
  const path = location.pathname;
  const { user } = useAuth();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-around">
      <Link to="/" className="flex flex-col items-center">
        <Home 
          className={path === '/' ? 'fill-fitblue stroke-fitblue' : 'text-gray-500'} 
          size={24} 
        />
        <span className={`text-xs mt-1 ${path === '/' ? 'text-fitblue' : 'text-gray-500'}`}>Início</span>
      </Link>
      
      <Link to="/treino" className="flex flex-col items-center">
        <Dumbbell 
          className={path.includes('/treino') ? 'fill-fitblue stroke-fitblue' : 'text-gray-500'} 
          size={24} 
        />
        <span className={`text-xs mt-1 ${path.includes('/treino') ? 'text-fitblue' : 'text-gray-500'}`}>Treinos</span>
      </Link>
      
      <Link to="/guilds" className="flex flex-col items-center">
        <Trophy 
          className={path.includes('/guilds') ? 'fill-fitblue stroke-fitblue' : 'text-gray-500'} 
          size={24} 
        />
        <span className={`text-xs mt-1 ${path.includes('/guilds') ? 'text-fitblue' : 'text-gray-500'}`}>Guildas</span>
      </Link>
      
      <Link to={user ? "/perfil" : "/auth"} className="flex flex-col items-center">
        <UserCircle2 
          className={path.includes('/perfil') || path.includes('/auth') ? 'fill-fitblue stroke-fitblue' : 'text-gray-500'} 
          size={24} 
        />
        <span className={`text-xs mt-1 ${path.includes('/perfil') || path.includes('/auth') ? 'text-fitblue' : 'text-gray-500'}`}>
          {user ? 'Perfil' : 'Entrar'}
        </span>
      </Link>
    </div>
  );
};

export default BottomNavBar;

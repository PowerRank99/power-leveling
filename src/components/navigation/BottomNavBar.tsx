
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Dumbbell, Trophy, UserCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const BottomNavBar = () => {
  const location = useLocation();
  const path = location.pathname;
  const { user } = useAuth();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-2 flex justify-around">
      <Link to="/" className="flex flex-col items-center">
        <Home 
          className={path === '/' 
            ? 'fill-fitblue stroke-fitblue dark:fill-fitblue-400 dark:stroke-fitblue-400' 
            : 'text-gray-500 dark:text-gray-400'} 
          size={24} 
        />
        <span className={`text-xs mt-1 ${path === '/' 
          ? 'text-fitblue dark:text-fitblue-400' 
          : 'text-gray-500 dark:text-gray-400'}`}>Início</span>
      </Link>
      
      <Link to="/treino" className="flex flex-col items-center">
        <Dumbbell 
          className={path.includes('/treino') 
            ? 'fill-fitblue stroke-fitblue dark:fill-fitblue-400 dark:stroke-fitblue-400' 
            : 'text-gray-500 dark:text-gray-400'} 
          size={24} 
        />
        <span className={`text-xs mt-1 ${path.includes('/treino') 
          ? 'text-fitblue dark:text-fitblue-400' 
          : 'text-gray-500 dark:text-gray-400'}`}>Treinos</span>
      </Link>
      
      <Link to="/guilds" className="flex flex-col items-center">
        <Trophy 
          className={path.includes('/guilds') 
            ? 'fill-fitblue stroke-fitblue dark:fill-fitblue-400 dark:stroke-fitblue-400' 
            : 'text-gray-500 dark:text-gray-400'} 
          size={24} 
        />
        <span className={`text-xs mt-1 ${path.includes('/guilds') 
          ? 'text-fitblue dark:text-fitblue-400' 
          : 'text-gray-500 dark:text-gray-400'}`}>Guildas</span>
      </Link>
      
      <Link to={user ? "/perfil" : "/auth"} className="flex flex-col items-center">
        <UserCircle2 
          className={path.includes('/perfil') || path.includes('/auth') 
            ? 'fill-fitblue stroke-fitblue dark:fill-fitblue-400 dark:stroke-fitblue-400' 
            : 'text-gray-500 dark:text-gray-400'} 
          size={24} 
        />
        <span className={`text-xs mt-1 ${path.includes('/perfil') || path.includes('/auth') 
          ? 'text-fitblue dark:text-fitblue-400' 
          : 'text-gray-500 dark:text-gray-400'}`}>
          {user ? 'Perfil' : 'Entrar'}
        </span>
      </Link>
    </div>
  );
};

export default BottomNavBar;

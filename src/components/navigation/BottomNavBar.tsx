
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Dumbbell, Trophy, UserCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const BottomNavBar = () => {
  const location = useLocation();
  const path = location.pathname;
  const { user } = useAuth();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-midnight-card border-t border-divider px-4 py-2 flex justify-around shadow-elevated backdrop-blur-lg z-10">
      <Link to="/" className="flex flex-col items-center">
        <Home 
          className={path === '/' ? 'fill-arcane stroke-arcane' : 'text-text-tertiary'} 
          size={24} 
        />
        <span className={`text-xs mt-1 font-sora ${path === '/' ? 'text-arcane' : 'text-text-tertiary'}`}>Início</span>
      </Link>
      
      <Link to="/treino" className="flex flex-col items-center">
        <Dumbbell 
          className={path.includes('/treino') ? 'fill-arcane stroke-arcane' : 'text-text-tertiary'} 
          size={24} 
        />
        <span className={`text-xs mt-1 font-sora ${path.includes('/treino') ? 'text-arcane' : 'text-text-tertiary'}`}>Treinos</span>
      </Link>
      
      <Link to="/guilds" className="flex flex-col items-center">
        <Trophy 
          className={path.includes('/guilds') ? 'fill-arcane stroke-arcane' : 'text-text-tertiary'} 
          size={24} 
        />
        <span className={`text-xs mt-1 font-sora ${path.includes('/guilds') ? 'text-arcane' : 'text-text-tertiary'}`}>Guildas</span>
      </Link>
      
      <Link to={user ? "/perfil" : "/auth"} className="flex flex-col items-center">
        <UserCircle2 
          className={path.includes('/perfil') || path.includes('/auth') ? 'fill-arcane stroke-arcane' : 'text-text-tertiary'} 
          size={24} 
        />
        <span className={`text-xs mt-1 font-sora ${path.includes('/perfil') || path.includes('/auth') ? 'text-arcane' : 'text-text-tertiary'}`}>
          {user ? 'Perfil' : 'Entrar'}
        </span>
      </Link>
    </div>
  );
};

export default BottomNavBar;

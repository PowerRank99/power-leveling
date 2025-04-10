
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
      <NavItem 
        to="/" 
        icon={<Home size={26} className={path === '/' ? 'fill-arcane stroke-arcane' : 'text-text-tertiary'} />}
        label="Início"
        isActive={path === '/'}
      />
      
      <NavItem 
        to="/treino" 
        icon={<Dumbbell size={26} className={path.includes('/treino') ? 'fill-arcane stroke-arcane' : 'text-text-tertiary'} />}
        label="Treinos"
        isActive={path.includes('/treino')}
      />
      
      <NavItem 
        to="/guilds" 
        icon={<Trophy size={26} className={path.includes('/guilds') ? 'fill-arcane stroke-arcane' : 'text-text-tertiary'} />}
        label="Guildas"
        isActive={path.includes('/guilds')}
      />
      
      <NavItem 
        to={user ? "/perfil" : "/auth"} 
        icon={<UserCircle2 size={26} className={path.includes('/perfil') || path.includes('/auth') ? 'fill-arcane stroke-arcane' : 'text-text-tertiary'} />}
        label={user ? 'Perfil' : 'Entrar'}
        isActive={path.includes('/perfil') || path.includes('/auth')}
      />
    </div>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isActive }) => {
  return (
    <Link to={to} className="flex flex-col items-center relative w-1/4">
      {isActive && (
        <div className="absolute -top-3 w-10 h-1 bg-arcane rounded-full animate-fade-in" />
      )}
      <div className={`${isActive ? 'transform scale-110' : ''} transition-transform`}>
        {icon}
      </div>
      <span className={`text-xs mt-1 font-sora ${isActive ? 'text-arcane font-medium' : 'text-text-tertiary'}`}>
        {label}
      </span>
    </Link>
  );
};

export default BottomNavBar;

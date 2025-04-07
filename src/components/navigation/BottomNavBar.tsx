
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, WorkoutIcon, RankingIcon, ProfileIcon } from '../icons/NavIcons';
import { useAuth } from '@/hooks/useAuth';

const BottomNavBar = () => {
  const location = useLocation();
  const path = location.pathname;
  const { user } = useAuth();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-around">
      <Link to="/" className="nav-item">
        <HomeIcon className="nav-item-icon" active={path === '/'} />
        <span className={path === '/' ? 'text-fitblue' : 'text-gray-500'}>Início</span>
      </Link>
      
      <Link to="/treino" className="nav-item">
        <WorkoutIcon className="nav-item-icon" active={path.includes('/treino')} />
        <span className={path.includes('/treino') ? 'text-fitblue' : 'text-gray-500'}>Treino</span>
      </Link>
      
      <Link to="/ranking" className="nav-item">
        <RankingIcon className="nav-item-icon" active={path.includes('/ranking')} />
        <span className={path.includes('/ranking') ? 'text-fitblue' : 'text-gray-500'}>Ranking</span>
      </Link>
      
      <Link to={user ? "/perfil" : "/auth"} className="nav-item">
        <ProfileIcon className="nav-item-icon" active={path.includes('/perfil') || path.includes('/auth')} />
        <span className={path.includes('/perfil') || path.includes('/auth') ? 'text-fitblue' : 'text-gray-500'}>
          {user ? 'Perfil' : 'Entrar'}
        </span>
      </Link>
    </div>
  );
};

export default BottomNavBar;

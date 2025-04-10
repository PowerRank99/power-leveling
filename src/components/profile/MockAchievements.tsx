
import React from 'react';
import { Flame, Dumbbell, Award } from 'lucide-react';

export interface Achievement {
  id: string;
  icon: React.ReactNode;
  name: string;
  isLocked?: boolean;
}

const MockAchievements: React.FC = () => {
  // Mock recent achievements data
  const recentAchievements: Achievement[] = [
    {
      id: 'streak',
      icon: <Flame className="w-5 h-5" />,
      name: '7 Dias Seguidos'
    },
    {
      id: 'workouts',
      icon: <Dumbbell className="w-5 h-5" />,
      name: '50 Treinos'
    },
    {
      id: 'locked',
      icon: <Award className="w-5 h-5" />,
      name: 'Bloqueada',
      isLocked: true
    }
  ];

  return (
    <>
      {recentAchievements}
    </>
  );
};

export const getMockAchievements = (): Achievement[] => {
  return [
    {
      id: 'streak',
      icon: <Flame className="w-5 h-5" />,
      name: '7 Dias Seguidos'
    },
    {
      id: 'workouts',
      icon: <Dumbbell className="w-5 h-5" />,
      name: '50 Treinos'
    },
    {
      id: 'locked',
      icon: <Award className="w-5 h-5" />,
      name: 'Bloqueada',
      isLocked: true
    }
  ];
};

export default MockAchievements;


import React from 'react';
import { Flame, Dumbbell, Award } from 'lucide-react';

export interface Achievement {
  id: string;
  icon: React.ReactNode;
  name: string;
  isLocked?: boolean;
}

const MockAchievements: React.FC = () => {
  // This component is now deprecated - we should use real achievements from the database
  // These mock achievements are only used as fallback when data is not yet loaded
  const recentAchievements: Achievement[] = [
    {
      id: 'streak',
      icon: <Flame className="w-5 h-5" />,
      name: 'Conquista de Streak'
    },
    {
      id: 'workouts',
      icon: <Dumbbell className="w-5 h-5" />,
      name: 'Conquista de Treino'
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
  // Generic mock achievements for loading states and placeholders
  return [
    {
      id: 'streak',
      icon: <Flame className="w-5 h-5" />,
      name: 'Conquista de Streak'
    },
    {
      id: 'workouts',
      icon: <Dumbbell className="w-5 h-5" />,
      name: 'Conquista de Treino'
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

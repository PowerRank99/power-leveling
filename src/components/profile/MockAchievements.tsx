
import React from 'react';
import { Flame, Dumbbell, Award } from 'lucide-react';

export interface Achievement {
  id: string;
  icon: React.ReactNode;
  name: string;
  isLocked?: boolean;
  description?: string;
  xpReward?: number;
  date?: string;
  progress?: {
    current: number;
    total: number;
  };
}

// This component is now deprecated - we are using the achievement data from the database
const MockAchievements: React.FC = () => {
  const recentAchievements: Achievement[] = [
    {
      id: 'streak',
      icon: <Flame className="w-5 h-5" />,
      name: 'Conquista de Streak',
      isLocked: false,
      description: 'Conquista obtida ao manter um streak de treinos',
      xpReward: 50,
      date: '10/04/2025'
    },
    {
      id: 'workouts',
      icon: <Dumbbell className="w-5 h-5" />,
      name: 'Conquista de Treino',
      isLocked: false,
      description: 'Conquista obtida ao completar treinos',
      xpReward: 50,
      date: '10/04/2025'
    },
    {
      id: 'locked',
      icon: <Award className="w-5 h-5" />,
      name: 'Bloqueada',
      isLocked: true,
      description: 'Esta conquista ainda está bloqueada',
      progress: {
        current: 3,
        total: 10
      }
    }
  ];

  return (
    <>
      {recentAchievements}
    </>
  );
};

// This function is provided for loading states and placeholders when database data is not available yet
export const getMockAchievements = (): Achievement[] => {
  return [
    {
      id: 'streak',
      icon: <Flame className="w-5 h-5" />,
      name: 'Conquista de Streak',
      isLocked: false,
      description: 'Conquista obtida ao manter um streak de treinos',
      xpReward: 50,
      date: '10/04/2025'
    },
    {
      id: 'workouts',
      icon: <Dumbbell className="w-5 h-5" />,
      name: 'Conquista de Treino',
      isLocked: false,
      description: 'Conquista obtida ao completar treinos',
      xpReward: 50,
      date: '10/04/2025'
    },
    {
      id: 'locked',
      icon: <Award className="w-5 h-5" />,
      name: 'Bloqueada',
      isLocked: true,
      description: 'Esta conquista ainda está bloqueada',
      progress: {
        current: 3,
        total: 10
      }
    }
  ];
};

export default MockAchievements;


import { AchievementCategory } from '@/types/achievementTypes';

export const STREAK_ACHIEVEMENTS = {
  THREE_DAYS: {
    id: 'streak-3',
    name: 'Trinca Poderosa',
    description: 'Treine por 3 dias consecutivos',
    category: AchievementCategory.STREAK,
    rank: 'E',
    points: 1,
    xpReward: 75,
    iconName: 'flame',
    requirementType: 'streak_days',
    requirementValue: 3
  },
  SEVEN_DAYS: {
    id: 'streak-7',
    name: 'Semana Perfeita',
    description: 'Treine por 7 dias consecutivos',
    category: AchievementCategory.STREAK,
    rank: 'D',
    points: 3,
    xpReward: 150,
    iconName: 'flame',
    requirementType: 'streak_days',
    requirementValue: 7
  },
  FOURTEEN_DAYS: {
    id: 'streak-14',
    name: 'Duas Semanas de Fogo',
    description: 'Treine por 14 dias consecutivos',
    category: AchievementCategory.STREAK,
    rank: 'C',
    points: 5,
    xpReward: 200,
    iconName: 'flame',
    requirementType: 'streak_days',
    requirementValue: 14
  },
  THIRTY_DAYS: {
    id: 'streak-30',
    name: 'Um Mês Invicto',
    description: 'Treine por 30 dias consecutivos',
    category: AchievementCategory.STREAK,
    rank: 'B',
    points: 10,
    xpReward: 300,
    iconName: 'flame',
    requirementType: 'streak_days',
    requirementValue: 30
  },
  SIXTY_DAYS: {
    id: 'streak-60',
    name: 'Dois Meses Implacáveis',
    description: 'Treine por 60 dias consecutivos',
    category: AchievementCategory.STREAK,
    rank: 'A',
    points: 15,
    xpReward: 400,
    iconName: 'flame',
    requirementType: 'streak_days',
    requirementValue: 60
  },
  HUNDRED_DAYS: {
    id: 'streak-100',
    name: 'Centenário do Fogo',
    description: 'Treine por 100 dias consecutivos',
    category: AchievementCategory.STREAK,
    rank: 'S',
    points: 20,
    xpReward: 500,
    iconName: 'flame',
    requirementType: 'streak_days',
    requirementValue: 100
  },
  YEAR_STREAK: {
    id: 'streak-365',
    name: 'Um Ano de Lenda',
    description: 'Treine por 365 dias consecutivos',
    category: AchievementCategory.STREAK,
    rank: 'S',
    points: 25,
    xpReward: 1000,
    iconName: 'crown',
    requirementType: 'streak_days',
    requirementValue: 365
  }
};

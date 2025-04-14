
import { AchievementCategory } from '@/types/achievementTypes';

export const MANUAL_ACHIEVEMENTS = {
  FIRST_MANUAL: {
    id: 'manual-first',
    name: 'Esporte de Primeira',
    description: 'Registre seu primeiro treino manual',
    category: AchievementCategory.MANUAL,
    rank: 'E',
    points: 1,
    xpReward: 50,
    iconName: 'camera',
    requirementType: 'manual_count',
    requirementValue: 1
  },
  FIVE_MANUAL: {
    id: 'manual-5',
    name: 'Aventuras Fitness',
    description: 'Registre 5 treinos manuais',
    category: AchievementCategory.MANUAL,
    rank: 'D',
    points: 3,
    xpReward: 100,
    iconName: 'camera',
    requirementType: 'manual_count',
    requirementValue: 5
  },
  TEN_MANUAL: {
    id: 'manual-10',
    name: 'Manual na Veia',
    description: 'Registre 10 treinos manuais',
    category: AchievementCategory.MANUAL,
    rank: 'C',
    points: 5,
    xpReward: 150,
    iconName: 'camera',
    requirementType: 'manual_count',
    requirementValue: 10
  },
  TWENTY_FIVE_MANUAL: {
    id: 'manual-25',
    name: 'Explorador Fitness',
    description: 'Registre 25 treinos manuais',
    category: AchievementCategory.MANUAL,
    rank: 'B',
    points: 10,
    xpReward: 200,
    iconName: 'camera',
    requirementType: 'manual_count',
    requirementValue: 25
  }
};


import { AchievementCategory } from '@/types/achievementTypes';

export const SPECIAL_ACHIEVEMENTS = {
  SUPREME_POWER: {
    id: 'supreme-power',
    name: 'Poder Supremo',
    description: 'Desbloqueie todas as outras conquistas',
    category: AchievementCategory.SPECIAL,
    rank: 'S',
    points: 25,
    xpReward: 1000,
    iconName: 'crown',
    requirementType: 'all_achievements',
    requirementValue: 1
  }
};

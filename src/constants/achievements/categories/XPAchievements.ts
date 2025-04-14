
import { AchievementCategory } from '@/types/achievementTypes';

export const XP_ACHIEVEMENTS = {
  XP_1000: {
    id: 'xp-1000',
    name: 'Primeiro Milhar',
    description: 'Acumule 1.000 XP',
    category: AchievementCategory.XP,
    rank: 'D',
    points: 3,
    xpReward: 100,
    iconName: 'trending-up',
    requirementType: 'total_xp',
    requirementValue: 1000
  },
  XP_5000: {
    id: 'xp-5000',
    name: 'Cinco Mil',
    description: 'Acumule 5.000 XP',
    category: AchievementCategory.XP,
    rank: 'C',
    points: 5,
    xpReward: 150,
    iconName: 'trending-up',
    requirementType: 'total_xp',
    requirementValue: 5000
  },
  XP_10000: {
    id: 'xp-10000',
    name: 'Dez Mil',
    description: 'Acumule 10.000 XP',
    category: AchievementCategory.XP,
    rank: 'B',
    points: 10,
    xpReward: 200,
    iconName: 'trending-up',
    requirementType: 'total_xp',
    requirementValue: 10000
  },
  XP_50000: {
    id: 'xp-50000',
    name: 'Cinquenta Mil',
    description: 'Acumule 50.000 XP',
    category: AchievementCategory.XP,
    rank: 'A',
    points: 15,
    xpReward: 300,
    iconName: 'trending-up',
    requirementType: 'total_xp',
    requirementValue: 50000
  },
  XP_100000: {
    id: 'xp-100000',
    name: 'Cem Mil',
    description: 'Acumule 100.000 XP',
    category: AchievementCategory.XP,
    rank: 'S',
    points: 25,
    xpReward: 500,
    iconName: 'trending-up',
    requirementType: 'total_xp',
    requirementValue: 100000
  }
};

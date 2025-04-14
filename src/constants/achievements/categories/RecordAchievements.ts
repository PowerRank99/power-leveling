
import { AchievementCategory } from '@/types/achievementTypes';

export const RECORD_ACHIEVEMENTS = {
  FIRST_PR: {
    id: 'pr-first',
    name: 'Quebra-Recorde',
    description: 'Estabeleça seu primeiro recorde pessoal',
    category: AchievementCategory.RECORD,
    rank: 'D',
    points: 3,
    xpReward: 100,
    iconName: 'trending-up',
    requirementType: 'pr_count',
    requirementValue: 1
  },
  FIVE_PR: {
    id: 'pr-5',
    name: 'Quebrando Barreiras',
    description: 'Estabeleça 5 recordes pessoais',
    category: AchievementCategory.RECORD,
    rank: 'D',
    points: 3,
    xpReward: 125,
    iconName: 'trending-up',
    requirementType: 'pr_count',
    requirementValue: 5
  },
  TEN_PR: {
    id: 'pr-10',
    name: 'Recordista Experiente',
    description: 'Estabeleça 10 recordes pessoais',
    category: AchievementCategory.RECORD,
    rank: 'C',
    points: 5,
    xpReward: 150,
    iconName: 'trending-up',
    requirementType: 'pr_count',
    requirementValue: 10
  },
  TWENTY_FIVE_PR: {
    id: 'pr-25',
    name: 'Recordista Dedicado',
    description: 'Estabeleça 25 recordes pessoais',
    category: AchievementCategory.RECORD,
    rank: 'B',
    points: 10,
    xpReward: 200,
    iconName: 'trending-up',
    requirementType: 'pr_count',
    requirementValue: 25
  },
  FIFTY_PR: {
    id: 'pr-50',
    name: 'Mestre dos Recordes',
    description: 'Estabeleça 50 recordes pessoais',
    category: AchievementCategory.RECORD,
    rank: 'A',
    points: 15,
    xpReward: 300,
    iconName: 'trending-up',
    requirementType: 'pr_count',
    requirementValue: 50
  }
};

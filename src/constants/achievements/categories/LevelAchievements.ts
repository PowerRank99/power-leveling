
import { AchievementCategory } from '@/types/achievementTypes';

export const LEVEL_ACHIEVEMENTS = {
  LEVEL_10: {
    id: 'level-10',
    name: 'Subida Poderosa',
    description: 'Atinja o nível 10',
    category: AchievementCategory.LEVEL,
    rank: 'D',
    points: 3,
    xpReward: 100,
    iconName: 'arrow-up',
    requirementType: 'level',
    requirementValue: 10
  },
  LEVEL_25: {
    id: 'level-25',
    name: 'Dedicação Total',
    description: 'Atinja o nível 25',
    category: AchievementCategory.LEVEL,
    rank: 'C',
    points: 5,
    xpReward: 150,
    iconName: 'arrow-up',
    requirementType: 'level',
    requirementValue: 25
  },
  LEVEL_50: {
    id: 'level-50',
    name: 'Meio Caminho',
    description: 'Atinja o nível 50',
    category: AchievementCategory.LEVEL,
    rank: 'B',
    points: 10,
    xpReward: 200,
    iconName: 'arrow-up',
    requirementType: 'level',
    requirementValue: 50
  },
  LEVEL_75: {
    id: 'level-75',
    name: 'Quase Lá',
    description: 'Atinja o nível 75',
    category: AchievementCategory.LEVEL,
    rank: 'A',
    points: 15,
    xpReward: 300,
    iconName: 'arrow-up',
    requirementType: 'level',
    requirementValue: 75
  },
  LEVEL_99: {
    id: 'level-99',
    name: 'O Ápice',
    description: 'Atinja o nível máximo de 99',
    category: AchievementCategory.LEVEL,
    rank: 'S',
    points: 25,
    xpReward: 500,
    iconName: 'award',
    requirementType: 'level',
    requirementValue: 99
  }
};

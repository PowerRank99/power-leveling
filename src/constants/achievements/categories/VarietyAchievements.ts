
import { AchievementCategory } from '@/types/achievementTypes';

export const VARIETY_ACHIEVEMENTS = {
  THREE_TYPES: {
    id: 'variety-3',
    name: 'Combo Fitness',
    description: 'Faça 1 treino cardio, 1 força e 1 mobilidade',
    category: AchievementCategory.VARIETY,
    rank: 'D',
    points: 3,
    xpReward: 100,
    iconName: 'layers',
    requirementType: 'exercise_types',
    requirementValue: 3
  },
  THREE_WORKOUTS: {
    id: 'workout-types-3',
    name: 'Aventuras Fitness',
    description: 'Registre 3 tipos diferentes de treinos',
    category: AchievementCategory.VARIETY,
    rank: 'D',
    points: 3,
    xpReward: 100,
    iconName: 'shuffle',
    requirementType: 'workout_types',
    requirementValue: 3
  },
  FOUR_TYPES_WEEKLY: {
    id: 'workout-types-weekly-4',
    name: 'Semana Multitarefa',
    description: 'Faça 4 tipos de treinos em uma única semana',
    category: AchievementCategory.VARIETY,
    rank: 'C',
    points: 5,
    xpReward: 150,
    iconName: 'calendar',
    requirementType: 'weekly_variety',
    requirementValue: 4
  },
  FIVE_TYPES: {
    id: 'variety-5',
    name: 'Experiência Completa',
    description: 'Pratique 5 tipos diferentes de exercícios',
    category: AchievementCategory.VARIETY,
    rank: 'C',
    points: 5,
    xpReward: 150,
    iconName: 'layers',
    requirementType: 'exercise_types',
    requirementValue: 5
  },
  TEN_TYPES: {
    id: 'variety-10',
    name: 'Enciclopédia Fitness',
    description: 'Pratique 10 tipos diferentes de exercícios',
    category: AchievementCategory.VARIETY,
    rank: 'B',
    points: 10,
    xpReward: 200,
    iconName: 'layers',
    requirementType: 'exercise_types',
    requirementValue: 10
  }
};

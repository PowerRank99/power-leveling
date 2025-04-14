
import { AchievementCategory } from '@/types/achievementTypes';

export const WORKOUT_ACHIEVEMENTS = {
  FIRST_WORKOUT: {
    id: 'first-workout',
    name: 'Primeiro Treino',
    description: 'Complete seu primeiro treino no PowerLeveling',
    category: AchievementCategory.WORKOUT,
    rank: 'E',
    points: 1,
    xpReward: 50,
    iconName: 'dumbbell',
    requirementType: 'workouts_count',
    requirementValue: 1
  },
  WEEKLY_THREE: {
    id: 'weekly-workouts',
    name: 'Trio na Semana',
    description: 'Complete 3 treinos em uma semana',
    category: AchievementCategory.WORKOUT,
    rank: 'E',
    points: 1,
    xpReward: 75,
    iconName: 'calendar',
    requirementType: 'weekly_workouts',
    requirementValue: 3
  },
  TOTAL_SEVEN: {
    id: 'total-7',
    name: 'Embalo Fitness',
    description: 'Complete 7 treinos no total',
    category: AchievementCategory.WORKOUT,
    rank: 'E',
    points: 1,
    xpReward: 100,
    iconName: 'activity',
    requirementType: 'workouts_count',
    requirementValue: 7
  },
  TOTAL_TEN: {
    id: 'total-10',
    name: 'Dedicação Inicial',
    description: 'Complete 10 treinos no total',
    category: AchievementCategory.WORKOUT,
    rank: 'D',
    points: 3,
    xpReward: 150,
    iconName: 'activity',
    requirementType: 'workouts_count',
    requirementValue: 10
  },
  TOTAL_TWENTY_FIVE: {
    id: 'total-25',
    name: 'Persistência',
    description: 'Complete 25 treinos no total',
    category: AchievementCategory.WORKOUT,
    rank: 'C',
    points: 5,
    xpReward: 200,
    iconName: 'award',
    requirementType: 'workouts_count',
    requirementValue: 25
  },
  TOTAL_FIFTY: {
    id: 'total-50',
    name: 'Metade do Caminho',
    description: 'Complete 50 treinos no total',
    category: AchievementCategory.WORKOUT,
    rank: 'B',
    points: 10,
    xpReward: 250,
    iconName: 'medal',
    requirementType: 'workouts_count',
    requirementValue: 50
  },
  TOTAL_HUNDRED: {
    id: 'total-100',
    name: 'Centenário',
    description: 'Complete 100 treinos no total',
    category: AchievementCategory.WORKOUT,
    rank: 'A',
    points: 15,
    xpReward: 300,
    iconName: 'trophy',
    requirementType: 'workouts_count',
    requirementValue: 100
  },
  TOTAL_TWO_HUNDRED: {
    id: 'total-200',
    name: 'Dedicação Lendária',
    description: 'Complete 200 treinos no total',
    category: AchievementCategory.WORKOUT,
    rank: 'S',
    points: 25,
    xpReward: 500,
    iconName: 'crown',
    requirementType: 'workouts_count',
    requirementValue: 200
  },
  EARLY_MORNING: {
    id: 'early-morning',
    name: 'Levanta e Racha',
    description: 'Complete um treino antes das 7h da manhã',
    category: AchievementCategory.WORKOUT,
    rank: 'D',
    points: 3,
    xpReward: 100,
    iconName: 'sunrise',
    requirementType: 'workout_time',
    requirementValue: 7
  },
  SIXTY_MINUTE_TEN: {
    id: 'workout-60min-10',
    name: 'Maratonista',
    description: 'Complete 10 treinos com mais de 60 minutos',
    category: AchievementCategory.WORKOUT,
    rank: 'C',
    points: 5,
    xpReward: 200,
    iconName: 'clock',
    requirementType: 'long_workouts',
    requirementValue: 10
  }
};

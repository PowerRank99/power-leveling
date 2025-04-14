
/**
 * Centralized achievement definitions with consistent IDs
 */

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rank: AchievementRank;
  points: number;
  xpReward: number;
  iconName: string;
  requirementType: string;
  requirementValue: number;
}

export type AchievementCategory = 'workout' | 'streak' | 'record' | 'xp' | 'level' | 'guild' | 'special' | 'variety' | 'manual';
export type AchievementRank = 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'Unranked';

/**
 * Centralized achievement constants for consistent reference
 */
export const ACHIEVEMENTS = {
  // Rank E Achievements (Basic)
  WORKOUTS: {
    FIRST_WORKOUT: {
      id: 'first-workout',
      name: 'Primeiro Treino',
      description: 'Complete seu primeiro treino',
      category: 'workout',
      rank: 'E',
      points: 1,
      xpReward: 50,
      iconName: 'dumbbell',
      requirementType: 'workouts_count',
      requirementValue: 1
    },
    WEEKLY_THREE: {
      id: 'weekly-3',
      name: 'Trio na Semana',
      description: 'Complete 3 treinos em uma semana',
      category: 'workout',
      rank: 'E',
      points: 1,
      xpReward: 50,
      iconName: 'calendar',
      requirementType: 'weekly_workouts',
      requirementValue: 3
    },
    TOTAL_SEVEN: {
      id: 'total-7',
      name: 'Embalo Fitness',
      description: 'Complete 7 treinos no total',
      category: 'workout',
      rank: 'E',
      points: 1,
      xpReward: 75,
      iconName: 'dumbbell',
      requirementType: 'workouts_count',
      requirementValue: 7
    }
  },
  STREAK: {
    THREE_DAYS: {
      id: 'streak-3',
      name: 'Trinca Poderosa',
      description: 'Treine por 3 dias consecutivos',
      category: 'streak',
      rank: 'E',
      points: 1,
      xpReward: 75,
      iconName: 'flame',
      requirementType: 'streak_days',
      requirementValue: 3
    },
    SEVEN_DAYS: {
      id: 'streak-7',
      name: 'Sequência Iniciante',
      description: '7 dias seguidos treinando',
      category: 'streak',
      rank: 'D',
      points: 3,
      xpReward: 100,
      iconName: 'flame',
      requirementType: 'streak_days',
      requirementValue: 7
    },
    THIRTY_DAYS: {
      id: 'streak-30',
      name: 'Rei da Consistência',
      description: '30 dias seguidos treinando',
      category: 'streak',
      rank: 'B',
      points: 10,
      xpReward: 300,
      iconName: 'zap',
      requirementType: 'streak_days',
      requirementValue: 30
    },
    HUNDRED_DAYS: {
      id: 'streak-100',
      name: 'Lendário',
      description: '100 dias seguidos treinando',
      category: 'streak',
      rank: 'S',
      points: 25,
      xpReward: 500,
      iconName: 'star',
      requirementType: 'streak_days',
      requirementValue: 100
    }
  },
  // Rank D Achievements (Moderate)
  PROGRESSION: {
    TOTAL_TEN: {
      id: 'total-10',
      name: 'Dedicação Semanal',
      description: 'Complete 10 treinos no total',
      category: 'workout',
      rank: 'D',
      points: 3,
      xpReward: 100,
      iconName: 'activity',
      requirementType: 'workouts_count',
      requirementValue: 10
    },
    MONTHLY_TEN: {
      id: 'monthly-10',
      name: 'Maratona Mensal',
      description: 'Treine em 10 dias diferentes em um mês',
      category: 'workout',
      rank: 'D',
      points: 3,
      xpReward: 150,
      iconName: 'calendar',
      requirementType: 'monthly_workouts',
      requirementValue: 10
    }
  },
  RECORDS: {
    FIRST_PR: {
      id: 'pr-first',
      name: 'Quebra-Recorde',
      description: 'Estabeleça seu primeiro recorde pessoal',
      category: 'record',
      rank: 'D',
      points: 3,
      xpReward: 100,
      iconName: 'award',
      requirementType: 'pr_count',
      requirementValue: 1
    }
  },
  // Add more achievement categories and definitions as needed...
};

/**
 * Helper functions to work with achievement definitions
 */
export const AchievementUtils = {
  /**
   * Get all achievement definitions as a flat array
   */
  getAllAchievements(): AchievementDefinition[] {
    const allAchievements: AchievementDefinition[] = [];
    
    // Iterate through all categories and add each achievement
    Object.values(ACHIEVEMENTS).forEach(category => {
      Object.values(category).forEach(achievement => {
        allAchievements.push(achievement as AchievementDefinition);
      });
    });
    
    return allAchievements;
  },
  
  /**
   * Get achievement by ID
   */
  getAchievementById(id: string): AchievementDefinition | undefined {
    return this.getAllAchievements().find(achievement => achievement.id === id);
  },
  
  /**
   * Get achievements by rank
   */
  getAchievementsByRank(rank: AchievementRank): AchievementDefinition[] {
    return this.getAllAchievements().filter(achievement => achievement.rank === rank);
  },
  
  /**
   * Get achievements by category
   */
  getAchievementsByCategory(category: AchievementCategory): AchievementDefinition[] {
    return this.getAllAchievements().filter(achievement => achievement.category === category);
  }
};

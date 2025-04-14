
import { z } from 'zod';

// Enhanced Achievement Definition Schema with Zod for runtime validation
export const AchievementDefinitionSchema = z.object({
  id: z.string().regex(/^[a-z]+(-[a-z]+)*$/, "ID must be lowercase with optional hyphen separators"),
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum([
    'workout', 
    'streak', 
    'record', 
    'xp', 
    'level', 
    'guild', 
    'special', 
    'variety', 
    'manual',
    'time_based',
    'milestone'
  ]),
  rank: z.enum(['S', 'A', 'B', 'C', 'D', 'E', 'Unranked']),
  points: z.number().int().min(1).max(25),
  xpReward: z.number().int().min(10).max(500),
  iconName: z.string(),
  requirementType: z.string(),
  requirementValue: z.number(),
});

export type AchievementDefinition = z.infer<typeof AchievementDefinitionSchema>;

export type AchievementCategory = AchievementDefinition['category'];
export type AchievementRank = AchievementDefinition['rank'];

export const ACHIEVEMENTS = {
  WORKOUTS: {
    FIRST_WORKOUT: {
      id: 'first-workout',
      name: 'Primeiro Treino',
      description: 'Complete seu primeiro treino no PowerLeveling',
      category: 'workout',
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
      category: 'workout',
      rank: 'E',
      points: 1,
      xpReward: 75,
      iconName: 'calendar',
      requirementType: 'weekly_workouts',
      requirementValue: 3
    },
    // More workout achievements...
  },
  
  STREAK: {
    THREE_DAYS: {
      id: 'streak-three-days',
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
    // More streak achievements...
  },
  
  // Additional achievement categories...
};

export const AchievementUtils = {
  /**
   * Validate an achievement definition
   */
  validateAchievement(achievement: AchievementDefinition): boolean {
    try {
      AchievementDefinitionSchema.parse(achievement);
      return true;
    } catch (error) {
      console.error('Invalid achievement definition:', error);
      return false;
    }
  },
  
  /**
   * Get all achievement definitions as a flat array
   */
  getAllAchievements(): AchievementDefinition[] {
    const allAchievements: AchievementDefinition[] = [];
    
    Object.values(ACHIEVEMENTS).forEach(category => {
      Object.values(category).forEach(achievement => {
        if (this.validateAchievement(achievement as AchievementDefinition)) {
          allAchievements.push(achievement as AchievementDefinition);
        }
      });
    });
    
    return allAchievements;
  },
  
  /**
   * Get achievement by ID with optional validation
   */
  getAchievementById(id: string, validateDefinition = true): AchievementDefinition | undefined {
    const achievement = this.getAllAchievements().find(a => a.id === id);
    
    if (achievement && (!validateDefinition || this.validateAchievement(achievement))) {
      return achievement;
    }
    
    return undefined;
  },
  
  /**
   * Get achievements by rank
   */
  getAchievementsByRank(rank: AchievementRank, validateDefinition = true): AchievementDefinition[] {
    return this.getAllAchievements().filter(achievement => 
      achievement.rank === rank && 
      (!validateDefinition || this.validateAchievement(achievement))
    );
  },
  
  /**
   * Get achievements by category
   */
  getAchievementsByCategory(category: AchievementCategory, validateDefinition = true): AchievementDefinition[] {
    return this.getAllAchievements().filter(achievement => 
      achievement.category === category && 
      (!validateDefinition || this.validateAchievement(achievement))
    );
  }
};

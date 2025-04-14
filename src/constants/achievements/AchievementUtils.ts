
import { Achievement, AchievementCategory, AchievementRank, AchievementRequirement } from '@/types/achievementTypes';
import { AchievementDefinition, AchievementDefinitionSchema } from './AchievementSchema';
import { ACHIEVEMENTS } from './index';

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
  },
  
  /**
   * Get achievement requirements
   */
  getAchievementRequirements(id: string): { type: string, value: number } | undefined {
    const achievement = this.getAchievementById(id);
    
    if (achievement) {
      return {
        type: achievement.requirementType,
        value: achievement.requirementValue
      };
    }
    
    return undefined;
  },
  
  /**
   * Get achievement points by rank
   */
  getPointsByRank(rank: AchievementRank): number {
    const pointsMap: Record<AchievementRank, number> = {
      'S': 25,
      'A': 15,
      'B': 10,
      'C': 5,
      'D': 3,
      'E': 1,
      'Unranked': 0
    };
    
    return pointsMap[rank] || 0;
  },
  
  /**
   * Convert AchievementDefinition to Achievement interface
   * Provides a standardized way to convert between the two formats
   */
  convertToAchievement(definition: AchievementDefinition): Achievement {
    return {
      id: definition.id,
      name: definition.name,
      description: definition.description,
      category: definition.category as AchievementCategory,
      rank: definition.rank as AchievementRank,
      points: definition.points,
      xpReward: definition.xpReward,
      iconName: definition.iconName,
      requirements: {
        type: definition.requirementType,
        value: definition.requirementValue,
        metadata: definition.metadata
      },
      metadata: definition.metadata
    };
  },
  
  /**
   * Convert Achievement to AchievementDefinition
   */
  convertToDefinition(achievement: Achievement): AchievementDefinition {
    return {
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      category: achievement.category as AchievementCategory,
      rank: achievement.rank as AchievementRank,
      points: achievement.points,
      xpReward: achievement.xpReward,
      iconName: achievement.iconName,
      requirementType: achievement.requirements.type,
      requirementValue: achievement.requirements.value,
      metadata: achievement.metadata
    };
  }
};

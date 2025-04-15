
import { Achievement, AchievementCategory, AchievementRank } from '@/types/achievementTypes';
import { AchievementDefinition, AchievementDefinitionSchema } from './AchievementSchema';
import { AchievementDatabaseService } from '@/services/common/AchievementDatabaseService';

// Cache achievements for performance
let achievementsCache: Achievement[] | null = null;

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
   * Get all achievements from the database
   * This is now the single source of truth
   */
  async getAllAchievements(): Promise<AchievementDefinition[]> {
    // Use cache if available
    if (achievementsCache) {
      return achievementsCache.map(a => this.convertToDefinition(a));
    }
    
    // Fetch from database
    const response = await AchievementDatabaseService.getAllAchievements();
    
    if (response.success && response.data) {
      // Update cache
      achievementsCache = response.data;
      return response.data.map(a => this.convertToDefinition(a));
    }
    
    // Return empty array if fetch failed
    console.error('Failed to fetch achievements:', response.message);
    return [];
  },
  
  /**
   * Get achievement by ID with optional validation
   */
  async getAchievementById(id: string): Promise<AchievementDefinition | undefined> {
    // Check cache first
    if (achievementsCache) {
      const achievement = achievementsCache.find(a => a.stringId === id || a.id === id);
      if (achievement) {
        return this.convertToDefinition(achievement);
      }
    }
    
    // Fetch from database
    const response = await AchievementDatabaseService.getAchievementByStringId(id);
    
    if (response.success && response.data) {
      return this.convertToDefinition(response.data);
    }
    
    return undefined;
  },
  
  /**
   * Get achievements by rank
   */
  async getAchievementsByRank(rank: AchievementRank): Promise<AchievementDefinition[]> {
    // Check cache first
    if (achievementsCache) {
      const achievements = achievementsCache.filter(a => a.rank === rank);
      return achievements.map(a => this.convertToDefinition(a));
    }
    
    // Fetch from database
    const response = await AchievementDatabaseService.getAchievementsByRank(rank);
    
    if (response.success && response.data) {
      return response.data.map(a => this.convertToDefinition(a));
    }
    
    return [];
  },
  
  /**
   * Get achievements by category
   */
  async getAchievementsByCategory(category: AchievementCategory): Promise<AchievementDefinition[]> {
    // Check cache first
    if (achievementsCache) {
      const achievements = achievementsCache.filter(a => a.category === category);
      return achievements.map(a => this.convertToDefinition(a));
    }
    
    // Fetch from database
    const response = await AchievementDatabaseService.getAchievementsByCategory(category);
    
    if (response.success && response.data) {
      return response.data.map(a => this.convertToDefinition(a));
    }
    
    return [];
  },
  
  /**
   * Get achievement requirements
   */
  async getAchievementRequirements(id: string): Promise<{ type: string, value: number } | undefined> {
    const achievement = await this.getAchievementById(id);
    
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
   * Clear achievements cache
   */
  clearCache() {
    achievementsCache = null;
  },
  
  /**
   * Convert AchievementDefinition to Achievement interface
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
      stringId: definition.id, // Use the string ID directly
      metadata: definition.metadata
    };
  },
  
  /**
   * Convert Achievement to AchievementDefinition
   */
  convertToDefinition(achievement: Achievement): AchievementDefinition {
    return {
      id: achievement.stringId || achievement.id, // Prefer string ID
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

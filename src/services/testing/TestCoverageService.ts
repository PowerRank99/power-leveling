
import { supabase } from '@/integrations/supabase/client';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';
import { Achievement, AchievementCategory, AchievementRank } from '@/types/achievementTypes';

export class TestCoverageService {
  private static achievements: Achievement[] = [];
  private static testMap: Map<string, boolean> = new Map();
  private static initialized = false;
  
  /**
   * Initialize the service by loading all achievements
   */
  static async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      this.achievements = await AchievementUtils.getAllAchievements();
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing TestCoverageService:', error);
      throw new Error('Failed to initialize test coverage service');
    }
  }
  
  /**
   * Mark an achievement as tested
   */
  static markTested(achievementId: string, success: boolean): void {
    this.testMap.set(achievementId, success);
  }
  
  /**
   * Check if an achievement has been tested
   */
  static isTested(achievementId: string): boolean {
    return this.testMap.has(achievementId);
  }
  
  /**
   * Check if an achievement has been successfully tested
   */
  static isSuccessfullyTested(achievementId: string): boolean {
    return this.testMap.get(achievementId) === true;
  }
  
  /**
   * Generate a coverage report
   */
  static generateCoverageReport() {
    if (!this.initialized) {
      throw new Error('TestCoverageService not initialized');
    }
    
    const totalAchievements = this.achievements.length;
    const testedAchievements = this.testMap.size;
    const coveragePercentage = totalAchievements > 0 
      ? Math.round((testedAchievements / totalAchievements) * 100) 
      : 0;
    
    const categoryBreakdown = this.getCategoryBreakdown();
    const rankBreakdown = this.getRankBreakdown();
    
    return {
      totalAchievements,
      testedAchievements,
      coveragePercentage,
      categoryBreakdown,
      rankBreakdown
    };
  }
  
  /**
   * Get coverage breakdown by category
   */
  private static getCategoryBreakdown() {
    const categories = Object.values(AchievementCategory);
    const result: Record<string, { total: number; tested: number; coverage: number }> = {};
    
    // Initialize all categories with zeros
    categories.forEach(category => {
      result[category] = { total: 0, tested: 0, coverage: 0 };
    });
    
    // Count achievements by category
    this.achievements.forEach(achievement => {
      const category = achievement.category;
      if (result[category]) {
        result[category].total++;
        
        if (this.isTested(achievement.id)) {
          result[category].tested++;
        }
      }
    });
    
    // Calculate coverage percentages
    Object.keys(result).forEach(category => {
      const { total, tested } = result[category];
      result[category].coverage = total > 0 ? Math.round((tested / total) * 100) : 0;
    });
    
    return result;
  }
  
  /**
   * Get coverage breakdown by rank
   */
  private static getRankBreakdown() {
    const ranks = Object.values(AchievementRank);
    const result: Record<string, { total: number; tested: number; coverage: number }> = {};
    
    // Initialize all ranks with zeros
    ranks.forEach(rank => {
      result[rank] = { total: 0, tested: 0, coverage: 0 };
    });
    
    // Count achievements by rank
    this.achievements.forEach(achievement => {
      const rank = achievement.rank;
      if (result[rank]) {
        result[rank].total++;
        
        if (this.isTested(achievement.id)) {
          result[rank].tested++;
        }
      }
    });
    
    // Calculate coverage percentages
    Object.keys(result).forEach(rank => {
      const { total, tested } = result[rank];
      result[rank].coverage = total > 0 ? Math.round((tested / total) * 100) : 0;
    });
    
    return result;
  }
  
  /**
   * Reset test coverage data
   */
  static reset(): void {
    this.testMap.clear();
  }
}

import { Achievement, AchievementCategory } from '@/types/achievementTypes';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';

export interface TestCoverageReport {
  totalAchievements: number;
  testedAchievements: number;
  coveragePercentage: number;
  byCategory: Record<AchievementCategory, {
    total: number;
    tested: number;
    coverage: number;
  }>;
  untestedAchievements: Achievement[];
}

export class TestCoverageService {
  private static testedAchievements = new Set<string>();
  private static cachedAchievements: Achievement[] | null = null;

  /**
   * Record a tested achievement
   */
  static recordTestedAchievement(achievementId: string): void {
    this.testedAchievements.add(achievementId);
  }

  /**
   * Clear test coverage data
   */
  static clearCoverage(): void {
    this.testedAchievements.clear();
    this.cachedAchievements = null;
  }
  
  /**
   * Get all achievements, caching results for performance
   */
  static async getAllAchievements(): Promise<Achievement[]> {
    if (this.cachedAchievements) {
      return this.cachedAchievements;
    }
    
    try {
      const achievements = await AchievementUtils.getAllAchievements();
      this.cachedAchievements = achievements;
      return achievements;
    } catch (error) {
      console.error('Error fetching achievements for test coverage:', error);
      return [];
    }
  }

  /**
   * Generate coverage report with improved type safety
   */
  static generateCoverageReport(): TestCoverageReport {
    // If we don't have cached achievements yet, return an empty report
    if (!this.cachedAchievements) {
      // Initialize with empty data for all categories
      const emptyCategoryStats = Object.values(AchievementCategory).reduce((acc, category) => ({
        ...acc,
        [category]: { total: 0, tested: 0, coverage: 0 }
      }), {} as Record<AchievementCategory, { total: number; tested: number; coverage: number }>);
      
      return {
        totalAchievements: 0,
        testedAchievements: 0,
        coveragePercentage: 0,
        byCategory: emptyCategoryStats,
        untestedAchievements: []
      };
    }
    
    // Use the sync version to avoid Promise issues
    const allAchievements = this.cachedAchievements;
    
    const byCategory: Record<AchievementCategory, { total: number; tested: number; coverage: number }> = 
      Object.values(AchievementCategory).reduce((acc, category) => ({
        ...acc,
        [category]: { total: 0, tested: 0, coverage: 0 }
      }), {} as Record<AchievementCategory, { total: number; tested: number; coverage: number }>);

    // Count achievements by category
    allAchievements.forEach(achievement => {
      const category = achievement.category as AchievementCategory;
      if (byCategory[category]) {
        byCategory[category].total++;
        if (this.testedAchievements.has(achievement.id)) {
          byCategory[category].tested++;
        }
      }
    });

    // Calculate coverage percentages
    Object.values(byCategory).forEach(stats => {
      stats.coverage = stats.total > 0 ? (stats.tested / stats.total) * 100 : 0;
    });

    const untestedAchievements = allAchievements.filter(
      achievement => !this.testedAchievements.has(achievement.id)
    );

    return {
      totalAchievements: allAchievements.length,
      testedAchievements: this.testedAchievements.size,
      coveragePercentage: allAchievements.length > 0 ? (this.testedAchievements.size / allAchievements.length) * 100 : 0,
      byCategory,
      untestedAchievements
    };
  }
  
  /**
   * Initialize the service by preloading achievements
   */
  static async initialize(): Promise<void> {
    this.cachedAchievements = await this.getAllAchievements();
  }
}

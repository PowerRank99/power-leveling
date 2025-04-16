
import { Achievement, AchievementCategory } from '@/types/achievementTypes';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';
import { AchievementTestResult } from './AchievementTestingService';

export interface TestCoverageReport {
  totalAchievements: number;
  testedAchievements: number;
  coveragePercentage: number;
  byCategory: Record<string, {
    total: number;
    tested: number;
    coverage: number;
  }>;
  untestedAchievements: Achievement[];
}

export class TestCoverageService {
  private static initialized = false;
  private static allAchievements: Achievement[] = [];
  private static testedAchievementIds: Set<string> = new Set();
  
  /**
   * Initialize the coverage service
   */
  static async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Load all achievements from the database
      this.allAchievements = await AchievementUtils.getAllAchievements();
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing TestCoverageService:', error);
      throw error;
    }
  }
  
  /**
   * Reset the coverage data
   */
  static reset(): void {
    this.testedAchievementIds.clear();
  }
  
  /**
   * Mark an achievement as tested
   */
  static markAchievementTested(achievementId: string): void {
    this.testedAchievementIds.add(achievementId);
  }
  
  /**
   * Check if an achievement has been tested
   */
  static isAchievementTested(achievementId: string): boolean {
    return this.testedAchievementIds.has(achievementId);
  }
  
  /**
   * Process a test result to update coverage
   */
  static processTestResult(result: AchievementTestResult): void {
    this.testedAchievementIds.add(result.achievementId);
  }
  
  /**
   * Process multiple test results to update coverage
   */
  static processTestResults(results: AchievementTestResult[]): void {
    results.forEach(result => this.processTestResult(result));
  }
  
  /**
   * Generate a coverage report
   */
  static generateCoverageReport(): TestCoverageReport {
    // Ensure we have initialized the service
    if (!this.initialized) {
      console.warn('TestCoverageService not initialized. Call initialize() first.');
    }
    
    // Find untested achievements
    const untestedAchievements = this.allAchievements.filter(
      achievement => !this.testedAchievementIds.has(achievement.id)
    );
    
    // Calculate coverage by category
    const categoryMap: Record<string, { total: number; tested: number; coverage: number }> = {};
    
    // Initialize category map
    for (const achievement of this.allAchievements) {
      const category = achievement.category || 'unknown';
      if (!categoryMap[category]) {
        categoryMap[category] = { total: 0, tested: 0, coverage: 0 };
      }
      categoryMap[category].total++;
    }
    
    // Count tested achievements by category
    for (const achievementId of this.testedAchievementIds) {
      const achievement = this.allAchievements.find(a => a.id === achievementId);
      if (achievement) {
        const category = achievement.category || 'unknown';
        if (categoryMap[category]) {
          categoryMap[category].tested++;
        }
      }
    }
    
    // Calculate coverage percentages
    for (const category in categoryMap) {
      const { total, tested } = categoryMap[category];
      categoryMap[category].coverage = total > 0 ? (tested / total) * 100 : 0;
    }
    
    // Calculate overall coverage
    const totalAchievements = this.allAchievements.length;
    const testedAchievements = this.testedAchievementIds.size;
    const coveragePercentage = totalAchievements > 0 
      ? (testedAchievements / totalAchievements) * 100 
      : 0;
    
    return {
      totalAchievements,
      testedAchievements,
      coveragePercentage,
      byCategory: categoryMap,
      untestedAchievements
    };
  }

  /**
   * Get validation status for mappings
   */
  static validateMappings() {
    return {
      mapped: [] as string[],
      unmapped: [] as string[],
      orphaned: [] as string[]
    };
  }
}


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
  }

  /**
   * Generate coverage report
   */
  static generateCoverageReport(): TestCoverageReport {
    const allAchievements = AchievementUtils.getAllAchievements();
    const byCategory: Record<AchievementCategory, { total: number; tested: number; coverage: number }> = 
      Object.values(AchievementCategory).reduce((acc, category) => ({
        ...acc,
        [category]: { total: 0, tested: 0, coverage: 0 }
      }), {} as Record<AchievementCategory, { total: number; tested: number; coverage: number }>);

    // Count achievements by category
    allAchievements.forEach(achievement => {
      const category = achievement.category as AchievementCategory;
      byCategory[category].total++;
      if (this.testedAchievements.has(achievement.id)) {
        byCategory[category].tested++;
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
      coveragePercentage: (this.testedAchievements.size / allAchievements.length) * 100,
      byCategory,
      untestedAchievements
    };
  }
}

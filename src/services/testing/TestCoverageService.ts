
import { supabase } from '@/integrations/supabase/client';
import { AchievementCategory } from '@/types/achievementTypes';
import { TestCoverageReportData } from '@/components/achievement-testing/TestCoverageReport';

export class TestCoverageService {
  private static initialized = false;
  private static achievements: any[] = [];
  private static testedAchievements: Set<string> = new Set();
  
  static async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Load all achievements from the database
      const { data, error } = await supabase
        .from('achievements')
        .select('*');
        
      if (error) {
        throw error;
      }
      
      this.achievements = data || [];
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing TestCoverageService:', error);
      throw error;
    }
  }
  
  static addTestedAchievement(achievementId: string): void {
    this.testedAchievements.add(achievementId);
  }
  
  static clearTestedAchievements(): void {
    this.testedAchievements.clear();
  }
  
  static getTestedAchievements(): string[] {
    return Array.from(this.testedAchievements);
  }
  
  static generateCoverageReport(): TestCoverageReportData {
    const totalAchievements = this.achievements.length;
    const testedAchievements = this.testedAchievements.size;
    const coveragePercentage = totalAchievements > 0 ? (testedAchievements / totalAchievements) * 100 : 0;
    
    // Calculate coverage by category
    const byCategory: Record<string, { total: number; tested: number; coverage: number }> = {};
    
    // Initialize categories
    Object.values(AchievementCategory).forEach(category => {
      byCategory[category] = {
        total: 0,
        tested: 0,
        coverage: 0
      };
    });
    
    // Count totals by category
    this.achievements.forEach(achievement => {
      const category = achievement.category;
      if (byCategory[category]) {
        byCategory[category].total += 1;
      }
    });
    
    // Count tested by category
    const testedIds = Array.from(this.testedAchievements);
    this.achievements
      .filter(achievement => testedIds.includes(achievement.id))
      .forEach(achievement => {
        const category = achievement.category;
        if (byCategory[category]) {
          byCategory[category].tested += 1;
        }
      });
    
    // Calculate coverage percentage by category
    Object.keys(byCategory).forEach(category => {
      const { total, tested } = byCategory[category];
      byCategory[category].coverage = total > 0 ? (tested / total) * 100 : 0;
    });
    
    // Get untested achievements
    const untestedAchievements = this.achievements.filter(
      achievement => !testedIds.includes(achievement.id)
    );
    
    return {
      totalAchievements,
      testedAchievements,
      coveragePercentage,
      byCategory,
      untestedAchievements
    };
  }
}

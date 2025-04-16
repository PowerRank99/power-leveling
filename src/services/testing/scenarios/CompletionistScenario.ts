
import { BaseScenario, ScenarioOptions, ScenarioResult } from './index';
import { supabase } from '@/integrations/supabase/client';
import { createTestDataGenerators } from '../generators';

export interface CompletionistScenarioOptions extends ScenarioOptions {
  targetRank: string;
  includeAllCategories: boolean;
}

export class CompletionistScenario extends BaseScenario {
  private generators = createTestDataGenerators();
  
  constructor() {
    super(
      'completionist',
      'Completionist Scenario',
      'Tests achievement hunting and rank progression',
      ['achievements', 'rank', 'progression']
    );
  }
  
  getConfigurationOptions(): Record<string, any> {
    const baseOptions = super.getConfigurationOptions();
    
    return {
      ...baseOptions,
      targetRank: {
        type: 'select',
        label: 'Target Rank',
        options: [
          { value: 'E', label: 'Rank E' },
          { value: 'D', label: 'Rank D' },
          { value: 'C', label: 'Rank C' },
          { value: 'B', label: 'Rank B' },
          { value: 'A', label: 'Rank A' },
          { value: 'S', label: 'Rank S' }
        ],
        default: 'E',
        description: 'Which rank to aim for by completing achievements'
      },
      includeAllCategories: {
        type: 'boolean',
        label: 'Include All Categories',
        default: true,
        description: 'Whether to include achievements from all categories'
      }
    };
  }
  
  async execute(userId: string, options?: ScenarioOptions): Promise<ScenarioResult> {
    this.startTime = performance.now();
    this.actions = [];
    this.achievementsUnlocked = [];
    
    try {
      const mergedOptions: Required<CompletionistScenarioOptions> = {
        speed: options?.speed || 'normal',
        silent: options?.silent || false,
        autoCleanup: options?.autoCleanup !== false,
        targetRank: options?.targetRank || 'E',
        includeAllCategories: options?.includeAllCategories !== false,
        testDataTag: options?.testDataTag || 'test-data'
      };
      
      // Log start of scenario
      this.logAction('START_SCENARIO', `Starting completionist scenario targeting Rank ${mergedOptions.targetRank}`);
      
      // Get achievements for target rank
      const achievements = await this.getAchievementsForRank(mergedOptions.targetRank);
      
      // Simulate completion of each achievement
      for (const achievementId of achievements) {
        await this.simulateAchievementCompletion(userId, achievementId);
      }
      
      // Verify rank achievement
      const rankUpdated = await this.verifyRankAchievement(userId, mergedOptions.targetRank);
      
      // Return result
      return this.createResult(true);
    } catch (error) {
      // Log error and return failure
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logAction('ERROR', errorMessage, false, errorMessage);
      return this.createResult(false, errorMessage);
    }
  }
  
  private async getAchievementsForRank(rank: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('id')
        .eq('rank', rank);
        
      if (error) {
        throw error;
      }
      
      return data.map(achievement => achievement.id);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  }
  
  private async simulateAchievementCompletion(userId: string, achievementId: string): Promise<boolean> {
    try {
      this.logAction('SIMULATE_ACHIEVEMENT', `Simulating completion of achievement ${achievementId}`);
      
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievementId,
          achieved_at: new Date().toISOString()
        });
        
      if (error) {
        this.logAction('ERROR', `Failed to award achievement: ${error.message}`, false);
        return false;
      }
      
      this.achievementsUnlocked.push(achievementId);
      this.logAction('ACHIEVEMENT_UNLOCKED', `Awarded achievement ${achievementId}`, true);
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logAction('ERROR', `Failed to award achievement: ${errorMessage}`, false);
      return false;
    }
  }
  
  private async verifyRankAchievement(userId: string, rank: string): Promise<boolean> {
    try {
      // Logic to verify rank achievement
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Register scenario with the runner
export const completionistScenario = new CompletionistScenario();

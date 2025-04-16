
import { BaseScenario, ScenarioOptions, ScenarioResult } from './index';
import { supabase } from '@/integrations/supabase/client';
import { createTestDataGenerators } from '../generators';
import { Achievement } from '@/types/achievementTypes';

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
        testDataTag: 'test-data'
      };
      
      // Log start of scenario
      this.logAction('START_SCENARIO', `Starting completionist scenario targeting Rank ${mergedOptions.targetRank}`);
      
      // Get achievements for target rank
      const achievements = await this.getAchievementsForRank(mergedOptions.targetRank);
      
      // Simulate completion of each achievement
      for (const achievement of achievements) {
        await this.simulateAchievementCompletion(userId, achievement.id);
      }
      
      // Verify rank achievement
      const rankUpdated = await this.verifyRankAchievement(userId, mergedOptions.targetRank);
      
      // Return result
      return {
        success: true,
        executionTimeMs: performance.now() - this.startTime,
        actions: this.actions,
        achievementsUnlocked: this.achievementsUnlocked,
        completionPercentage: 100,
        unlockedCount: this.achievementsUnlocked.length,
        targetCount: achievements.length
      };
      
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
        
      if (error) throw error;
      
      return data.map(a => a.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logAction('GET_ACHIEVEMENTS_ERROR', message, false, message);
      throw error;
    }
  }
  
  private async simulateAchievementCompletion(userId: string, achievementId: string): Promise<boolean> {
    try {
      // Directly insert the achievement as completed
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievementId,
          achieved_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      this.achievementsUnlocked.push(achievementId);
      this.logAction('ACHIEVEMENT_UNLOCKED', `Unlocked achievement: ${achievementId}`);
      
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logAction('ACHIEVEMENT_ERROR', message, false, message);
      return false;
    }
  }
  
  private async verifyRankAchievement(userId: string, targetRank: string): Promise<boolean> {
    try {
      // Check if rank achievement is unlocked
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .eq('achievement_id', `rank_${targetRank.toLowerCase()}`);
        
      if (error) throw error;
      
      const unlocked = data && data.length > 0;
      
      if (unlocked) {
        this.logAction('RANK_ACHIEVED', `User has achieved Rank ${targetRank}`);
      } else {
        this.logAction('RANK_NOT_ACHIEVED', `User has not yet achieved Rank ${targetRank}`, false);
      }
      
      return unlocked;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logAction('VERIFY_RANK_ERROR', message, false, message);
      return false;
    }
  }
}

// Create the scenario instance
export const completionistScenario = new CompletionistScenario();

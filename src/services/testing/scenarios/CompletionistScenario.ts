
import { supabase } from '@/integrations/supabase/client';
import { BaseScenario, ScenarioOptions, ScenarioResult } from './index';

export interface CompletionistScenarioOptions extends ScenarioOptions {
  targetAchievementCount?: number;
  includeAllRanks?: boolean;
  includeAllCategories?: boolean;
}

export class CompletionistScenario extends BaseScenario {
  constructor() {
    super(
      'completionist',
      'Completionist',
      'Simulates a user who has completed many achievements',
      ['achievements', 'completionist', 'ranks'],
      ['achievement', 'completion']
    );
  }

  async execute(userId: string, options?: CompletionistScenarioOptions): Promise<ScenarioResult> {
    this.startTime = performance.now();
    this.actions = [];
    this.achievementsUnlocked = [];
    
    // Default options
    const defaultOptions: Required<CompletionistScenarioOptions> = {
      speed: 'normal',
      silent: false,
      autoCleanup: true,
      testDataTag: 'completionist',
      targetAchievementCount: 20,
      includeAllRanks: true,
      includeAllCategories: true
    };
    
    const mergedOptions = { ...defaultOptions, ...(options || {}) };
    
    try {
      // Fetch available achievements
      this.logAction('FETCH_ACHIEVEMENTS', 'Fetching available achievements');
      
      const { data: achievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .order('rank', { ascending: true });
        
      if (achievementsError) {
        throw new Error(`Failed to fetch achievements: ${achievementsError.message}`);
      }
      
      if (!achievements || achievements.length === 0) {
        throw new Error('No achievements found to award');
      }
      
      // Get currently unlocked achievements
      const { data: existingAchievements, error: existingError } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId);
        
      if (existingError) {
        this.logAction('WARNING', `Failed to check existing achievements: ${existingError.message}`, false);
      }
      
      const existingIds = existingAchievements?.map(a => a.achievement_id) || [];
      
      // Filter out already unlocked achievements
      const availableAchievements = achievements.filter(a => !existingIds.includes(a.id));
      
      if (availableAchievements.length === 0) {
        this.logAction('INFO', 'User has already unlocked all achievements', true);
        return this.createResult(true, 'User has already unlocked all achievements');
      }
      
      // Determine how many to award
      const countToAward = Math.min(mergedOptions.targetAchievementCount, availableAchievements.length);
      this.logAction('AWARD_ACHIEVEMENTS', `Awarding ${countToAward} achievements to user`);
      
      // Create a balanced selection across ranks and categories if specified
      let selectedAchievements: any[] = [];
      
      if (mergedOptions.includeAllRanks || mergedOptions.includeAllCategories) {
        // Group by rank
        const byRank: Record<string, any[]> = {};
        availableAchievements.forEach(a => {
          byRank[a.rank] = byRank[a.rank] || [];
          byRank[a.rank].push(a);
        });
        
        // Group by category
        const byCategory: Record<string, any[]> = {};
        availableAchievements.forEach(a => {
          byCategory[a.category] = byCategory[a.category] || [];
          byCategory[a.category].push(a);
        });
        
        // Select some from each rank
        if (mergedOptions.includeAllRanks) {
          Object.keys(byRank).forEach(rank => {
            const rankAchievements = byRank[rank];
            const countPerRank = Math.max(1, Math.floor(countToAward / Object.keys(byRank).length));
            const toSelect = Math.min(countPerRank, rankAchievements.length);
            
            // Select random achievements from this rank
            for (let i = 0; i < toSelect; i++) {
              if (rankAchievements.length > 0) {
                const randomIndex = Math.floor(Math.random() * rankAchievements.length);
                selectedAchievements.push(rankAchievements[randomIndex]);
                rankAchievements.splice(randomIndex, 1);
              }
            }
          });
        }
        
        // Add some from each category if needed
        if (mergedOptions.includeAllCategories) {
          Object.keys(byCategory).forEach(category => {
            const categoryAchievements = byCategory[category];
            const countPerCategory = Math.max(1, Math.floor(countToAward / Object.keys(byCategory).length));
            const toSelect = Math.min(countPerCategory, categoryAchievements.length);
            
            // Select random achievements from this category
            for (let i = 0; i < toSelect; i++) {
              if (categoryAchievements.length > 0) {
                const randomIndex = Math.floor(Math.random() * categoryAchievements.length);
                const achievement = categoryAchievements[randomIndex];
                
                // Check if already selected
                if (!selectedAchievements.some(a => a.id === achievement.id)) {
                  selectedAchievements.push(achievement);
                }
                
                categoryAchievements.splice(randomIndex, 1);
              }
            }
          });
        }
      }
      
      // Fill remaining slots with random achievements if needed
      const remaining = countToAward - selectedAchievements.length;
      if (remaining > 0) {
        // Filter out already selected
        const selectedIds = selectedAchievements.map(a => a.id);
        const remainingAchievements = availableAchievements.filter(a => !selectedIds.includes(a.id));
        
        // Select random ones
        for (let i = 0; i < remaining && remainingAchievements.length > 0; i++) {
          const randomIndex = Math.floor(Math.random() * remainingAchievements.length);
          selectedAchievements.push(remainingAchievements[randomIndex]);
          remainingAchievements.splice(randomIndex, 1);
        }
      }
      
      // Award the achievements
      for (const achievement of selectedAchievements) {
        this.logAction('AWARD', `Awarding achievement: ${achievement.name}`, true);
        
        const { error: awardError } = await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_id: achievement.id,
            achieved_at: new Date().toISOString()
          });
          
        if (awardError) {
          this.logAction('ERROR', `Failed to award achievement: ${awardError.message}`, false);
        } else {
          this.achievementsUnlocked.push(achievement.id);
          
          // Add delay between awards for realism
          await this.delayBySpeed(mergedOptions.speed);
        }
      }
      
      // Update profile counters
      this.logAction('UPDATE_PROFILE', `Updating profile with ${this.achievementsUnlocked.length} achievements`);
      
      await supabase
        .from('profiles')
        .update({
          achievements_count: existingIds.length + this.achievementsUnlocked.length
        })
        .eq('id', userId);
      
      // Return success
      return this.createResult(true, `Successfully awarded ${this.achievementsUnlocked.length} achievements`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logAction('ERROR', `Scenario failed: ${errorMessage}`, false);
      
      return this.createResult(false, `Failed to execute completionist scenario: ${errorMessage}`);
    }
  }
}

// Register the scenario
export const completionistScenario = new CompletionistScenario();

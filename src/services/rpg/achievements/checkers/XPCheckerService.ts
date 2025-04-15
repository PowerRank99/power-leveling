
import { ServiceResponse, ErrorHandlingService, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import { BaseAchievementChecker } from './BaseAchievementChecker';
import { AchievementService } from '@/services/rpg/AchievementService';
import { supabase } from '@/integrations/supabase/client';
import { Achievement } from '@/types/achievementTypes';

export class XPCheckerService extends BaseAchievementChecker {
  async checkAchievements(userId: string, totalXP?: number): Promise<ServiceResponse<string[]>> {
    return this.executeWithErrorHandling(
      async () => {
        // Get user's total XP if not provided
        if (totalXP === undefined) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('xp')
            .eq('id', userId)
            .maybeSingle();
            
          if (profileError) {
            throw new Error(`Failed to get user profile for XP check: ${profileError.message}`);
          }
          
          totalXP = profile?.xp || 0;
        }
        
        // Fetch XP-related achievements from the database
        const { data: xpAchievements, error } = await supabase
          .from('achievements')
          .select('*')
          .eq('category', 'xp')
          .order('requirements->total_xp', { ascending: true });
        
        if (error) {
          throw new Error(`Failed to fetch XP achievements: ${error.message}`);
        }
        
        // Filter achievements based on current XP
        const achievementsToCheck = xpAchievements
          .filter((achievement: Achievement) => {
            // Safely access total_xp from requirements, defaulting to 0 if not found
            const requiredXP = achievement.requirements?.value || 0;
            return totalXP >= requiredXP;
          })
          .map((achievement: Achievement) => achievement.id);
        
        // If no achievements to check, return empty array
        if (achievementsToCheck.length === 0) {
          return [];
        }
        
        // Update progress in batch first
        const progressUpdates = achievementsToCheck.map(achievementId => {
          const achievement = xpAchievements.find((a: Achievement) => a.id === achievementId);
          return {
            achievementId,
            currentValue: totalXP,
            targetValue: achievement?.requirements?.value || 0,
            isComplete: true
          };
        });
        
        // Update progress first using the service's batch update method
        const progressResult = await AchievementService.updateMultipleProgressValues(userId, progressUpdates);
        
        if (!progressResult.success) {
          console.error('Failed to update XP achievement progress:', progressResult.error);
        }
        
        // Award achievements and return the IDs of awarded achievements
        return this.awardAchievementsBatch(userId, achievementsToCheck);
      },
      'XP_MILESTONE_ACHIEVEMENTS'
    );
  }
}

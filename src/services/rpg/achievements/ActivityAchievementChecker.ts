
import { ServiceResponse } from '@/services/common/ErrorHandlingService';
import { BaseAchievementChecker } from './BaseAchievementChecker';
import { ManualWorkoutAchievementChecker } from './checkers/ManualWorkoutAchievementChecker';
import { ActivityVarietyChecker } from './checkers/ActivityVarietyChecker';
import { ExerciseVarietyChecker } from './checkers/ExerciseVarietyChecker';

export class ActivityAchievementChecker extends BaseAchievementChecker {
  async checkAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    return this.executeWithErrorHandling(
      async () => {
        const manualChecker = new ManualWorkoutAchievementChecker();
        const varietyChecker = new ActivityVarietyChecker();
        const exerciseChecker = new ExerciseVarietyChecker();
        
        const [manualResults, varietyResults, exerciseResults] = await Promise.all([
          manualChecker.checkAchievements(userId),
          varietyChecker.checkAchievements(userId),
          exerciseChecker.checkAchievements(userId)
        ]);
        
        const allAchievements = [
          ...(manualResults.success ? manualResults.data || [] : []),
          ...(varietyResults.success ? varietyResults.data || [] : []),
          ...(exerciseResults.success ? exerciseResults.data || [] : [])
        ];
        
        return allAchievements;
      },
      'ACTIVITY_ACHIEVEMENTS'
    );
  }
}

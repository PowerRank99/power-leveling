
import { ServiceResponse } from '@/services/common/ErrorHandlingService';
import { BaseAchievementChecker } from './BaseAchievementChecker';
import { ManualWorkoutAchievementChecker } from './checkers/ManualWorkoutAchievementChecker';
import { ActivityVarietyChecker } from './checkers/ActivityVarietyChecker';
import { ExerciseVarietyChecker } from './checkers/ExerciseVarietyChecker';
import { WorkoutCategoryChecker } from './workout/WorkoutCategoryChecker';
import { WorkoutHistoryChecker } from './workout/WorkoutHistoryChecker';

export class ActivityAchievementChecker extends BaseAchievementChecker {
  async checkAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    return this.executeWithErrorHandling(
      async () => {
        const manualChecker = new ManualWorkoutAchievementChecker();
        const varietyChecker = new ActivityVarietyChecker();
        const exerciseChecker = new ExerciseVarietyChecker();
        const categoryChecker = new WorkoutCategoryChecker();
        const historyChecker = new WorkoutHistoryChecker();
        
        const [
          manualResults,
          varietyResults,
          exerciseResults,
          categoryResults,
          historyResults
        ] = await Promise.all([
          manualChecker.checkAchievements(userId),
          varietyChecker.checkAchievements(userId),
          exerciseChecker.checkAchievements(userId),
          categoryChecker.checkAchievements(userId),
          historyChecker.checkAchievements(userId)
        ]);
        
        const allAchievements = [
          ...(manualResults.success ? manualResults.data || [] : []),
          ...(varietyResults.success ? varietyResults.data || [] : []),
          ...(exerciseResults.success ? exerciseResults.data || [] : []),
          ...(categoryResults.success ? categoryResults.data || [] : []),
          ...(historyResults.success ? historyResults.data || [] : [])
        ];
        
        return allAchievements;
      },
      'ACTIVITY_ACHIEVEMENTS'
    );
  }
}

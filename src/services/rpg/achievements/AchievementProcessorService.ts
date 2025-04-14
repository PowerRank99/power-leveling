
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { UnifiedAchievementChecker } from './UnifiedAchievementChecker';
import { AchievementProgressService } from './AchievementProgressService';
import { AchievementService } from '../AchievementService';
import { PersonalRecordData } from './AchievementCheckerInterface';

/**
 * Top-level service for processing achievement events
 * Uses the UnifiedAchievementChecker to check for achievements
 */
export class AchievementProcessorService {
  /**
   * Process a completed workout for achievements
   */
  static async processWorkoutCompletion(userId: string, workoutId: string): Promise<ServiceResponse<string[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Use unified checker to check all achievement types
        const result = await UnifiedAchievementChecker.processCompletedWorkout(userId);
        
        // Update achievement progress for tracking
        if (result.success) {
          await AchievementProgressService.updateWorkoutCountProgress(userId, 0);
        }
        
        return result.success ? result.data || [] : [];
      },
      'PROCESS_WORKOUT_COMPLETION',
      { showToast: false }
    );
  }
  
  /**
   * Process a personal record for achievements
   */
  static async processPersonalRecord(userId: string, recordData: PersonalRecordData): Promise<ServiceResponse<string[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        const result = await UnifiedAchievementChecker.checkPersonalRecordAchievements(userId, recordData);
        return result.success ? result.data || [] : [];
      },
      'PROCESS_PERSONAL_RECORD',
      { showToast: false }
    );
  }
  
  /**
   * Process a streak update for achievements
   */
  static async processStreakUpdate(userId: string, streak: number): Promise<ServiceResponse<string[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Update streak progress
        await AchievementProgressService.updateStreakProgress(userId, streak);
        
        // Check for streak achievements
        const result = await UnifiedAchievementChecker.checkStreakAchievements(userId);
        return result.success ? result.data || [] : [];
      },
      'PROCESS_STREAK_UPDATE',
      { showToast: false }
    );
  }
  
  /**
   * Process an XP milestone for achievements
   */
  static async processXPMilestone(userId: string, totalXP: number): Promise<ServiceResponse<string[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        const result = await UnifiedAchievementChecker.checkXPAchievements(userId, totalXP);
        return result.success ? result.data || [] : [];
      },
      'PROCESS_XP_MILESTONE',
      { showToast: false }
    );
  }
}

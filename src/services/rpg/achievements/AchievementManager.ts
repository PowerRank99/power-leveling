
import { ServiceResponse } from '@/services/common/ErrorHandlingService';
import { AchievementInitializationService } from './services/AchievementInitializationService';
import { WorkoutAchievementProcessor } from './services/WorkoutAchievementProcessor';
import { ManualWorkoutAchievementProcessor } from './services/ManualWorkoutAchievementProcessor';
import { StreakAchievementProcessor } from './services/StreakAchievementProcessor';
import { MilestoneAchievementProcessor } from './services/MilestoneAchievementProcessor';

/**
 * Centralized manager for achievement-related operations
 * Delegates to specialized services for specific functionality
 */
export class AchievementManager {
  /**
   * Initialize achievements for a new user
   */
  static async initializeUserAchievements(userId: string): Promise<ServiceResponse<void>> {
    return AchievementInitializationService.initializeUserAchievements(userId);
  }
  
  /**
   * Process workout completion for achievements
   */
  static async processWorkoutCompletion(userId: string, workoutId: string): Promise<ServiceResponse<string[]>> {
    return WorkoutAchievementProcessor.processWorkoutCompletion(userId, workoutId);
  }
  
  /**
   * Process manual workout submission for achievements
   */
  static async processManualWorkout(userId: string): Promise<ServiceResponse<string[]>> {
    return ManualWorkoutAchievementProcessor.processManualWorkout(userId);
  }
  
  /**
   * Process streak update for achievements
   */
  static async processStreakUpdate(userId: string, currentStreak: number): Promise<ServiceResponse<string[]>> {
    return StreakAchievementProcessor.processStreakUpdate(userId, currentStreak);
  }
  
  /**
   * Process level up for achievements
   */
  static async processLevelUp(userId: string, currentLevel: number): Promise<ServiceResponse<string[]>> {
    return MilestoneAchievementProcessor.processLevelUp(userId, currentLevel);
  }
  
  /**
   * Process XP milestone for achievements
   */
  static async processXPMilestone(userId: string, totalXP: number): Promise<ServiceResponse<string[]>> {
    return MilestoneAchievementProcessor.processXPMilestone(userId, totalXP);
  }
}

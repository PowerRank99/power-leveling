import { ProfileService } from '@/services/profile/ProfileService';
import { StreakService } from '@/services/rpg/StreakService';
import { XPService } from '@/services/rpg/XPService';
import { WorkoutExerciseService } from './WorkoutExerciseService';
import { AchievementService } from '@/services/rpg/AchievementService';

/**
 * Service for processing workout completion
 */
export class WorkoutCompletionService {
  /**
   * Process workout completion
   */
  public static async processWorkoutCompletion(
    userId: string,
    workoutId: string,
    durationSeconds: number,
    exerciseCount: number,
    setCount: number,
    exerciseCategories: string[]
  ): Promise<{ xp: number; streakUpdated: boolean; }> {
    try {
      // Validate inputs
      if (!userId || !workoutId) {
        throw new Error('Invalid input: userId and workoutId are required.');
      }

      // Award XP for completing the workout
      const xp = await XPService.calculateWorkoutXP(durationSeconds, exerciseCount, setCount);
      await XPService.awardXP(userId, xp, 'workout', { workoutId });

      // Update user's workout streak
      const streakUpdated = await StreakService.updateWorkoutStreak(userId);

      // Update user's profile stats
      await ProfileService.updateProfileStats(userId, durationSeconds, exerciseCount, setCount);

      // Update workout exercises
      await WorkoutExerciseService.processWorkoutExercises(workoutId);
      
      // Check for workout-related achievements
      await AchievementService.checkWorkoutAchievements(userId, workoutId);

      return { xp, streakUpdated };
    } catch (error) {
      console.error('Error processing workout completion:', error);
      return { xp: 0, streakUpdated: false };
    }
  }
}

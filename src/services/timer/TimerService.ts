
import { DatabaseResult } from '@/types/workoutTypes';
import { TimerDurationService } from './TimerDurationService';
import { TimerSettingsService } from './TimerSettingsService';

/**
 * Service for managing exercise-specific rest timers
 * This is a facade that coordinates between the specialized timer services
 */
export class TimerService {
  /**
   * Get the rest timer duration for a specific exercise
   */
  static async getExerciseTimerDuration(
    userId: string,
    exerciseId: string
  ): Promise<DatabaseResult<number>> {
    return TimerDurationService.getExerciseTimerDuration(userId, exerciseId);
  }
  
  /**
   * Get the user's default timer duration
   */
  static async getDefaultTimerDuration(
    userId: string
  ): Promise<DatabaseResult<number>> {
    return TimerDurationService.getDefaultTimerDuration(userId);
  }
  
  /**
   * Save a timer duration for a specific exercise
   */
  static async saveExerciseTimerDuration(
    userId: string,
    exerciseId: string,
    durationSeconds: number
  ): Promise<DatabaseResult<void>> {
    return TimerDurationService.saveExerciseTimerDuration(userId, exerciseId, durationSeconds);
  }
  
  /**
   * Save the user's default timer duration
   */
  static async saveDefaultTimerDuration(
    userId: string,
    durationSeconds: number
  ): Promise<DatabaseResult<void>> {
    return TimerDurationService.saveDefaultTimerDuration(userId, durationSeconds);
  }
  
  /**
   * Get all timer settings for a user
   */
  static async getUserTimerSettings(userId: string): Promise<DatabaseResult<{
    timer_sound_enabled: boolean;
    timer_vibration_enabled: boolean;
    timer_notification_enabled: boolean;
    default_rest_timer_seconds: number;
  }>> {
    return TimerSettingsService.getUserTimerSettings(userId);
  }
  
  /**
   * Save user timer settings
   */
  static async saveUserTimerSettings(
    userId: string,
    settings: {
      timer_sound_enabled?: boolean;
      timer_vibration_enabled?: boolean;
      timer_notification_enabled?: boolean;
      default_rest_timer_seconds?: number;
    }
  ): Promise<DatabaseResult<void>> {
    return TimerSettingsService.saveUserTimerSettings(userId, settings);
  }
}

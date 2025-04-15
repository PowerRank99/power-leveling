/**
 * Streak Data Generator
 * Simulates workout streaks by creating properly-dated workout records
 */
import { supabase } from '@/integrations/supabase/client';
import { TransactionService } from '@/services/common/TransactionService';
import { toast } from 'sonner';
import { formatDateForDB, GeneratorOptions, GeneratorResult, generateSequentialDates } from './index';
import { WorkoutGenerator, WorkoutType } from './WorkoutGenerator';

/**
 * Options for streak pattern generation
 */
export interface StreakPatternOptions extends GeneratorOptions {
  /** Pattern of days to generate workouts (1 = workout, 0 = no workout) */
  pattern: number[];
  /** Start date for the pattern */
  startDate: Date;
  /** Type of workouts to generate */
  workoutType?: WorkoutType;
  /** Whether to update the profile streak count */
  updateProfileStreak?: boolean;
  /** Whether to backdate workouts (default: true) */
  allowBackdating?: boolean;
}

/**
 * Result of streak generation operations
 */
export interface StreakGenerationResult extends GeneratorResult {
  /** IDs of generated workouts */
  workoutIds?: string[];
  /** Current streak value */
  currentStreak?: number;
}

/**
 * Streak data generator for testing achievements
 */
export class StreakGenerator {
  /** Default tag for identifying test data */
  private readonly DEFAULT_TEST_TAG = 'streak-test-data';
  /** Workout generator for creating streak workouts */
  private workoutGenerator: WorkoutGenerator;

  constructor() {
    this.workoutGenerator = new WorkoutGenerator();
  }

  /**
   * Generate a single workout with configurable parameters
   * @param userId User ID to generate workout for
   * @param days Number of consecutive days to generate
   * @param options Additional options
   * @returns Promise with generation result
   * 
   * @example
   * ```typescript
   * // Generate a basic strength workout
   * const result = await workoutGenerator.generateWorkout('user-123', {
   *   workoutType: WorkoutType.STRENGTH,
   *   exerciseCount: 3,
   *   setsPerExercise: 3
   * });
   * 
   * // Generate a cardio workout for a specific date
   * const result = await workoutGenerator.generateWorkout('user-123', {
   *   workoutType: WorkoutType.CARDIO,
   *   workoutDate: new Date('2023-05-15'),
   *   durationMinutes: 45
   * });
   * ```
   */
  async generateStreak(
    userId: string,
    days: number,
    options: Omit<StreakPatternOptions, 'pattern'> = { startDate: new Date() }
  ): Promise<StreakGenerationResult> {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    if (!days || days <= 0) {
      return { success: false, error: 'Days must be greater than 0' };
    }

    // Create a perfect streak pattern (all 1s)
    const pattern = Array(days).fill(1);
    
    return this.generateStreakPattern(userId, {
      pattern,
      ...options
    });
  }

  /**
   * Generate a custom streak pattern
   * @param userId User ID to generate streak for
   * @param options Pattern configuration options
   * @returns Promise with generation result
   * 
   * @example
   * ```typescript
   * // Generate a streak with custom pattern (workout on days 0, 2, 3, 5, 6)
   * const result = await streakGenerator.generateStreakPattern('user-123', {
   *   pattern: [1, 0, 1, 1, 0, 1, 1],
   *   startDate: new Date('2023-05-01')
   * });
   * 
   * // Generate a pattern with varying workout types
   * const result = await streakGenerator.generateStreakPattern('user-123', {
   *   pattern: [1, 0, 1, 1, 0, 1, 1],
   *   startDate: new Date('2023-05-01'),
   *   workoutType: WorkoutType.MIXED,
   *   updateProfileStreak: true
   * });
   * ```
   */
  async generateStreakPattern(
    userId: string,
    options: StreakPatternOptions
  ): Promise<StreakGenerationResult> {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    const {
      pattern,
      startDate = new Date(),
      workoutType = WorkoutType.STRENGTH,
      updateProfileStreak = true,
      allowBackdating = true,
      isTestData = true,
      testDataTag = this.DEFAULT_TEST_TAG,
      silent = false
    } = options;

    if (!pattern || pattern.length === 0) {
      return { success: false, error: 'Pattern is required' };
    }

    // Check if pattern contains valid values (0 or 1)
    if (!pattern.every(day => day === 0 || day === 1)) {
      return { success: false, error: 'Pattern must only contain 0 or 1 values' };
    }

    try {
      // Generate dates based on pattern
      const workoutDates: Date[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      pattern.forEach((day, index) => {
        if (day === 1) {
          const date = new Date(startDate);
          date.setDate(date.getDate() + index);
          
          // Skip future dates
          if (date <= today || allowBackdating) {
            workoutDates.push(date);
          }
        }
      });

      if (workoutDates.length === 0) {
        return { success: false, error: 'No valid workout dates in pattern' };
      }

      // Generate workouts for each date
      const allWorkoutIds: string[] = [];
      
      for (const date of workoutDates) {
        const result = await this.workoutGenerator.generateWorkout(userId, {
          workoutDate: date,
          workoutType,
          durationMinutes: 30 + Math.floor(Math.random() * 30), // 30-60 minutes
          exerciseCount: 2 + Math.floor(Math.random() * 3), // 2-4 exercises
          completed: true,
          isTestData,
          testDataTag,
          silent: true // Silence individual notifications
        });

        if (result.success && result.workoutIds) {
          allWorkoutIds.push(...result.workoutIds);
        }
      }

      // Update profile with current streak if requested
      let currentStreak = 0;
      if (updateProfileStreak) {
        // Calculate current streak based on pattern
        let streak = 0;
        for (let i = pattern.length - 1; i >= 0; i--) {
          if (pattern[i] === 0) break;
          streak++;
        }
        
        currentStreak = streak;
        
        // Update profile streak
        await supabase
          .from('profiles')
          .update({ 
            streak: currentStreak,
            last_workout_at: formatDateForDB(workoutDates[workoutDates.length - 1])
          })
          .eq('id', userId);
      }

      if (!silent) {
        toast.success('Streak pattern generated', {
          description: `Created ${allWorkoutIds.length} workouts in streak pattern`
        });
      }

      return {
        success: true,
        workoutIds: allWorkoutIds,
        currentStreak
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error generating streak pattern';
      if (!options.silent) {
        toast.error('Failed to generate streak pattern', {
          description: errorMessage
        });
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Simulate breaking a streak by updating the last workout date
   * @param userId User ID to break streak for
   * @param options Additional options
   * @returns Promise with operation result
   * 
   * @example
   * ```typescript
   * // Break an existing streak
   * const result = await streakGenerator.simulateStreakBreak('user-123');
   * 
   * // Break streak and set to a specific value
   * const result = await streakGenerator.simulateStreakBreak('user-123', {
   *   newStreakValue: 0
   * });
   * ```
   */
  async simulateStreakBreak(
    userId: string,
    options: {
      daysAgo?: number;
      newStreakValue?: number;
      silent?: boolean;
    } = {}
  ): Promise<GeneratorResult> {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    try {
      const { 
        daysAgo = 2, 
        newStreakValue = 0,
        silent = false
      } = options;

      // Set last workout date to n days ago
      const lastWorkoutDate = new Date();
      lastWorkoutDate.setDate(lastWorkoutDate.getDate() - daysAgo);

      await supabase
        .from('profiles')
        .update({ 
          streak: newStreakValue,
          last_workout_at: formatDateForDB(lastWorkoutDate)
        })
        .eq('id', userId);

      if (!silent) {
        toast.success('Streak break simulated', {
          description: `Streak set to ${newStreakValue}, last workout ${daysAgo} days ago`
        });
      }

      return {
        success: true
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error breaking streak';
      if (!options.silent) {
        toast.error('Failed to simulate streak break', {
          description: errorMessage
        });
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Remove all test-generated streak data for a user
   * @param userId User ID to clean up data for
   * @param options Cleanup options
   * @returns Promise with cleanup result
   * 
   * @example
   * ```typescript
   * // Clean up all streak test data
   * const result = await streakGenerator.cleanupStreakData('user-123');
   * 
   * // Clean up silently
   * const result = await streakGenerator.cleanupStreakData('user-123', { 
   *   silent: true 
   * });
   * ```
   */
  async cleanupStreakData(
    userId: string,
    options: { silent?: boolean; testDataTag?: string; resetStreak?: boolean } = {}
  ): Promise<GeneratorResult> {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    try {
      const { 
        silent = false, 
        testDataTag = this.DEFAULT_TEST_TAG,
        resetStreak = true
      } = options;

      // Clean up workouts generated for streak testing
      const result = await this.workoutGenerator.cleanupGeneratedWorkouts(userId, {
        silent: true,
        testDataTag
      });

      // Reset streak in profile if requested
      if (resetStreak) {
        await supabase
          .from('profiles')
          .update({ 
            streak: 0
          })
          .eq('id', userId);
      }

      if (!silent) {
        toast.success('Streak test data cleaned up', {
          description: `Removed ${result.ids?.length || 0} streak test workouts`
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error cleaning up streak data';
      if (!options.silent) {
        toast.error('Failed to clean up streak data', {
          description: errorMessage
        });
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }
}

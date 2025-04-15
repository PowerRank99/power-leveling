
/**
 * Activity Data Generator
 * Simulates manual workout submissions with different activity types
 */
import { supabase } from '@/integrations/supabase/client';
import { TransactionService } from '@/services/common/TransactionService';
import { toast } from 'sonner';
import { formatDateForDB, GeneratorOptions, GeneratorResult, getRandomPastDate, generateSequentialDates } from './index';

/**
 * Activity types for manual workout submissions
 */
export enum ActivityType {
  RUNNING = 'running',
  CYCLING = 'cycling',
  HIKING = 'hiking',
  SWIMMING = 'swimming',
  YOGA = 'yoga',
  SOCCER = 'soccer',
  BASKETBALL = 'basketball',
  TENNIS = 'tennis',
  GOLF = 'golf',
  VOLLEYBALL = 'volleyball',
  MARTIAL_ARTS = 'martial_arts',
  DANCE = 'dance',
  PILATES = 'pilates',
  CROSSFIT = 'crossfit',
  OTHER = 'other'
}

/**
 * Options for manual workout generation
 */
export interface ManualWorkoutOptions extends GeneratorOptions {
  /** Type of activity */
  activityType?: ActivityType;
  /** Description for the workout */
  description?: string;
  /** Date of the workout */
  workoutDate?: Date;
  /** URL for mock photo (optional) */
  photoUrl?: string;
  /** Whether this is a "Power Day" workout */
  isPowerDay?: boolean;
  /** Custom XP amount (default: 100) */
  xpAmount?: number;
  /** Whether to update profile with XP and last workout date */
  updateProfile?: boolean;
}

/**
 * Options for generating a mix of activities
 */
export interface ActivityMixOptions extends GeneratorOptions {
  /** Activity types to include */
  activityTypes?: ActivityType[];
  /** Number of activities to generate */
  count?: number;
  /** Start date for the activities */
  startDate?: Date;
  /** End date for the activities */
  endDate?: Date;
  /** Whether activities should be on consecutive days */
  consecutive?: boolean;
  /** Custom pattern of days (0-based indices to skip) */
  skipDays?: number[];
  /** Whether to include power days */
  includePowerDays?: boolean;
  /** Maximum number of power days to include */
  maxPowerDays?: number;
}

/**
 * Result of activity generation operations
 */
export interface ActivityGenerationResult extends GeneratorResult {
  /** IDs of generated activities */
  activityIds?: string[];
}

/**
 * Activity data generator for testing achievements
 */
export class ActivityGenerator {
  /** Default tag for identifying test data */
  private readonly DEFAULT_TEST_TAG = 'activity-test-data';
  /** Default placeholder image URL */
  private readonly DEFAULT_PHOTO_URL = 'https://frzgnszosqvcgycjtntz.supabase.co/storage/v1/object/public/activity-photos/placeholder.jpg';

  /**
   * Generate a single manual workout entry
   * @param userId User ID to generate activity for
   * @param options Configuration options
   * @returns Promise with generation result
   * 
   * @example
   * ```typescript
   * // Generate a basic running activity
   * const result = await activityGenerator.generateManualWorkout('user-123', {
   *   activityType: ActivityType.RUNNING
   * });
   * 
   * // Generate a power day activity with description
   * const result = await activityGenerator.generateManualWorkout('user-123', {
   *   activityType: ActivityType.HIKING,
   *   description: 'Mountain hike with friends',
   *   isPowerDay: true,
   *   workoutDate: new Date('2023-05-15')
   * });
   * ```
   */
  async generateManualWorkout(
    userId: string,
    options: ManualWorkoutOptions = {}
  ): Promise<ActivityGenerationResult> {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    try {
      const {
        activityType = ActivityType.RUNNING,
        description = `${activityType} workout`,
        workoutDate = new Date(),
        photoUrl = this.DEFAULT_PHOTO_URL,
        isPowerDay = false,
        xpAmount = 100,
        updateProfile = true,
        isTestData = true,
        testDataTag = this.DEFAULT_TEST_TAG,
        silent = false
      } = options;

      // Create the manual workout within a transaction
      const transactionResult = await TransactionService.executeInTransaction(async () => {
        // Create the manual workout record
        const { data: workout, error: workoutError } = await supabase
          .from('manual_workouts')
          .insert({
            user_id: userId,
            activity_type: activityType,
            description: description,
            photo_url: photoUrl,
            workout_date: formatDateForDB(workoutDate),
            is_power_day: isPowerDay,
            xp_awarded: xpAmount,
            metadata: isTestData ? { isTestData: true, tag: testDataTag } : undefined
          })
          .select()
          .single();

        if (workoutError || !workout) {
          throw new Error(`Failed to create manual workout: ${workoutError?.message || 'Unknown error'}`);
        }

        // Update profile if requested
        if (updateProfile) {
          // Update workouts count
          await supabase
            .rpc('increment_profile_counter', {
              user_id_param: userId,
              counter_name: 'workouts_count',
              increment_amount: 1
            });

          // Update daily XP
          const { data: profile } = await supabase
            .from('profiles')
            .select('daily_xp, xp')
            .eq('id', userId)
            .single();

          if (profile) {
            const newDailyXP = (profile.daily_xp || 0) + xpAmount;
            const newTotalXP = (profile.xp || 0) + xpAmount;

            await supabase
              .from('profiles')
              .update({
                daily_xp: newDailyXP,
                xp: newTotalXP,
                last_workout_at: formatDateForDB(workoutDate)
              })
              .eq('id', userId);
          }

          // Record power day usage if this is a power day
          if (isPowerDay) {
            const weekNumber = this.getWeekNumber(workoutDate);
            const year = workoutDate.getFullYear();

            await supabase
              .rpc('create_power_day_usage', {
                p_user_id: userId,
                p_week_number: weekNumber,
                p_year: year
              });
          }
        }

        return {
          success: true,
          activityIds: [workout.id]
        };
      }, 'generate_test_manual_workout');

      if (!silent && transactionResult.success) {
        toast.success('Test manual workout generated', {
          description: `Created ${activityType} activity${isPowerDay ? ' (Power Day)' : ''}`
        });
      }

      // Return a properly typed result
      return {
        success: transactionResult.success,
        error: transactionResult.error ? String(transactionResult.error) : undefined,
        activityIds: transactionResult.success && transactionResult.data ? transactionResult.data.activityIds : undefined
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error generating manual workout';
      if (!options.silent) {
        toast.error('Failed to generate test manual workout', {
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
   * Generate a mix of different activities over time
   * @param userId User ID to generate activities for
   * @param options Configuration options
   * @returns Promise with generation result
   * 
   * @example
   * ```typescript
   * // Generate 5 random activities
   * const result = await activityGenerator.generateActivityMix('user-123', {
   *   count: 5
   * });
   * 
   * // Generate specific activities over a timespan
   * const result = await activityGenerator.generateActivityMix('user-123', {
   *   activityTypes: [ActivityType.RUNNING, ActivityType.CYCLING, ActivityType.YOGA],
   *   count: 10,
   *   startDate: new Date('2023-05-01'),
   *   endDate: new Date('2023-05-31'),
   *   includePowerDays: true
   * });
   * ```
   */
  async generateActivityMix(
    userId: string,
    options: ActivityMixOptions = {}
  ): Promise<ActivityGenerationResult> {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    try {
      const {
        activityTypes = Object.values(ActivityType),
        count = 5,
        startDate = new Date(new Date().setDate(new Date().getDate() - 30)), // Default to 30 days ago
        endDate = new Date(),
        consecutive = false,
        skipDays = [],
        includePowerDays = false,
        maxPowerDays = 2,
        isTestData = true,
        testDataTag = this.DEFAULT_TEST_TAG,
        silent = false
      } = options;

      if (count <= 0) {
        return { success: false, error: 'Count must be greater than 0' };
      }

      // Generate dates for activities
      let activityDates: Date[] = [];
      
      if (consecutive) {
        // Generate consecutive dates, skipping specified days
        activityDates = generateSequentialDates(startDate, 
          Math.ceil(count * 1.5), // Generate extra days to account for skips
          skipDays
        ).slice(0, count); // Take only what we need
      } else {
        // Generate random dates within the timespan
        const daysRange = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        
        for (let i = 0; i < count; i++) {
          const randomDayOffset = Math.floor(Math.random() * daysRange);
          const date = new Date(startDate);
          date.setDate(date.getDate() + randomDayOffset);
          activityDates.push(date);
        }
        
        // Sort dates chronologically
        activityDates.sort((a, b) => a.getTime() - b.getTime());
      }

      // Select which dates will be power days
      let powerDayIndices: number[] = [];
      if (includePowerDays && maxPowerDays > 0) {
        const powerDayCount = Math.min(maxPowerDays, Math.floor(count / 2));
        
        // Create an array of indices and select random ones for power days
        const indices = Array.from({ length: count }, (_, i) => i);
        powerDayIndices = this.getRandomElements(indices, powerDayCount);
      }

      // Generate each activity
      const activityIds: string[] = [];
      
      for (let i = 0; i < activityDates.length; i++) {
        // Select random activity type
        const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
        const isPowerDay = powerDayIndices.includes(i);
        
        // Generate descriptive text
        const descriptions = [
          `${activityType} session`,
          `${activityType} workout with friends`,
          `Morning ${activityType}`,
          `Evening ${activityType}`,
          `Weekend ${activityType}`,
          `${activityType} class`,
          `Intense ${activityType} session`,
          `Relaxing ${activityType} session`,
          `${activityType} training`,
          `${activityType} practice`
        ];
        const description = descriptions[Math.floor(Math.random() * descriptions.length)];
        
        // Generate the activity
        const result = await this.generateManualWorkout(userId, {
          activityType,
          description,
          workoutDate: activityDates[i],
          isPowerDay,
          isTestData,
          testDataTag,
          silent: true // Silence individual notifications
        });
        
        if (result.success && result.activityIds) {
          activityIds.push(...result.activityIds);
        }
      }

      if (!silent) {
        toast.success('Activity mix generated', {
          description: `Created ${activityIds.length} activities over ${activityDates.length} days`
        });
      }

      return {
        success: true,
        activityIds
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error generating activity mix';
      if (!options.silent) {
        toast.error('Failed to generate activity mix', {
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
   * Remove all test-generated activity data for a user
   * @param userId User ID to clean up data for
   * @param options Cleanup options
   * @returns Promise with cleanup result
   * 
   * @example
   * ```typescript
   * // Clean up all test activities
   * const result = await activityGenerator.cleanupActivityData('user-123');
   * 
   * // Clean up with a specific test data tag
   * const result = await activityGenerator.cleanupActivityData('user-123', {
   *   testDataTag: 'activity-mix',
   *   silent: true
   * });
   * ```
   */
  async cleanupActivityData(
    userId: string,
    options: { silent?: boolean; testDataTag?: string; updateProfile?: boolean } = {}
  ): Promise<GeneratorResult> {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    try {
      const { 
        silent = false, 
        testDataTag = this.DEFAULT_TEST_TAG,
        updateProfile = true
      } = options;

      // Find all test activities
      const { data: activities, error: fetchError } = await supabase
        .from('manual_workouts')
        .select('id')
        .eq('user_id', userId)
        .contains('metadata', { isTestData: true, tag: testDataTag });
      
      if (fetchError) {
        throw new Error(`Failed to fetch test activities: ${fetchError.message}`);
      }
      
      if (!activities || activities.length === 0) {
        return { success: true, ids: [] };
      }
      
      const activityIds = activities.map(a => a.id);
      
      // Delete the activities within a transaction
      await TransactionService.executeInTransaction(async () => {
        // Delete all power day usage records for test data
        await supabase
          .from('power_day_usage')
          .delete()
          .eq('user_id', userId)
          .contains('metadata', { isTestData: true, tag: testDataTag });
        
        // Delete the activities
        await supabase
          .from('manual_workouts')
          .delete()
          .in('id', activityIds);
        
        // Update profile if requested
        if (updateProfile) {
          // Recalculate workouts count
          const { count: manualCount } = await supabase
            .from('manual_workouts')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId);
          
          const { count: workoutCount } = await supabase
            .from('workouts')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId);
            
          const totalCount = (manualCount || 0) + (workoutCount || 0);
          
          await supabase
            .from('profiles')
            .update({ workouts_count: totalCount })
            .eq('id', userId);
        }
      }, 'cleanup_test_activities');
      
      if (!silent) {
        toast.success('Test activities cleaned up', {
          description: `Removed ${activityIds.length} test activities`
        });
      }
      
      return {
        success: true,
        ids: activityIds
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error cleaning up activities';
      if (!options.silent) {
        toast.error('Failed to clean up test activities', {
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
   * Get the week number for a date
   * @private
   */
  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  /**
   * Get random elements from an array
   * @private
   */
  private getRandomElements<T>(array: T[], count: number): T[] {
    if (count >= array.length) {
      return [...array]; // Return a copy of the entire array
    }
    
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}

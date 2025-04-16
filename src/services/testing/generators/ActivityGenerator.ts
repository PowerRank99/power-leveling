
import { supabase } from '@/integrations/supabase/client';
import { GeneratorOptions, GeneratorResult, CleanupOptions, TestDataGenerator } from './index';

export interface ManualWorkoutOptions extends GeneratorOptions {
  date?: Date;
  activityType?: string;
  description?: string;
  isPowerDay?: boolean;
}

export interface ActivityMixOptions extends GeneratorOptions {
  count: number;
  startDate?: Date;
  types?: string[];
}

export class ActivityGenerator implements TestDataGenerator {
  /**
   * Generate a manual workout
   */
  async generateManualWorkout(userId: string, options: ManualWorkoutOptions = {}): Promise<GeneratorResult> {
    try {
      const date = options.date || new Date();
      const activityType = options.activityType || 'running';
      const description = options.description || `Manual ${activityType} workout`;
      const isPowerDay = options.isPowerDay || false;
      const testDataTag = options.testDataTag || 'test-data';
      
      // Create manual workout record
      const { data, error } = await supabase
        .from('manual_workouts')
        .insert({
          user_id: userId,
          description,
          activity_type: activityType,
          photo_url: 'https://via.placeholder.com/300x200?text=Manual+Workout',
          xp_awarded: isPowerDay ? 200 : 100,
          workout_date: date.toISOString(),
          is_power_day: isPowerDay,
          meta: options.isTestData !== false ? { testData: true, tag: testDataTag } : undefined
        })
        .select('id')
        .single();
      
      if (error || !data) {
        return {
          success: false,
          error: error?.message || 'Failed to create manual workout'
        };
      }

      // Update profile workout count
      await supabase.rpc('increment_profile_counter', {
        user_id_param: userId,
        counter_name: 'workouts_count',
        increment_amount: 1
      });

      return {
        success: true,
        ids: [data.id]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate a mix of different activities
   */
  async generateActivityMix(userId: string, options: ActivityMixOptions): Promise<GeneratorResult> {
    try {
      const count = options.count;
      const startDate = options.startDate || new Date();
      const types = options.types || ['running', 'yoga', 'swimming', 'cycling', 'hiking'];
      
      const activityIds: string[] = [];
      
      for (let i = 0; i < count; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() - i);
        
        const randomType = types[Math.floor(Math.random() * types.length)];
        const isPowerDay = Math.random() > 0.8; // 20% chance of power day
        
        const result = await this.generateManualWorkout(userId, {
          ...options,
          date,
          activityType: randomType,
          isPowerDay
        });
        
        if (result.success && result.ids) {
          activityIds.push(...result.ids);
        }
      }
      
      return {
        success: true,
        ids: activityIds
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create a manual workout (alias for generateManualWorkout)
   */
  async createManualWorkout(userId: string, options: ManualWorkoutOptions = {}): Promise<GeneratorResult> {
    return this.generateManualWorkout(userId, options);
  }

  /**
   * Clean up test data
   */
  async cleanup(userId: string, options: CleanupOptions = {}): Promise<boolean> {
    try {
      const tag = options.testDataTag || 'test-data';
      
      // Delete test manual workouts
      await supabase
        .from('manual_workouts')
        .delete()
        .eq('user_id', userId)
        .contains('meta', { testData: true, tag });
        
      return true;
    } catch (error) {
      console.error('Error cleaning up test manual workouts:', error);
      return false;
    }
  }

  /**
   * Get the generators associated with this test data generator
   */
  getGenerators(): any[] {
    return [];
  }
}

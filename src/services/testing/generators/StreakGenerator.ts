
import { supabase } from '@/integrations/supabase/client';
import { TestDataGenerator, GeneratorResult } from './index';
import { WorkoutGenerator, WorkoutType } from './WorkoutGenerator';
import { ActivityGenerator, ActivityType } from './ActivityGenerator';

export interface StreakGenerationOptions {
  days?: number;
  startDate?: Date;
  endDate?: Date;
  includeToday?: boolean;
  workoutType?: string;
  activityType?: string;
  mixedTypes?: boolean;
}

export class StreakGenerator implements TestDataGenerator {
  private workoutGenerator: WorkoutGenerator;
  private activityGenerator: ActivityGenerator;
  
  constructor() {
    this.workoutGenerator = new WorkoutGenerator();
    this.activityGenerator = new ActivityGenerator();
  }
  
  async generate(userId: string, options: StreakGenerationOptions = {}): Promise<GeneratorResult> {
    try {
      const {
        days = 3,
        includeToday = true,
        workoutType = WorkoutType.STRENGTH,
        activityType = ActivityType.YOGA,
        mixedTypes = false
      } = options;
      
      // Determine start and end dates
      let startDate = options.startDate ? new Date(options.startDate) : new Date();
      const endDate = options.endDate ? new Date(options.endDate) : new Date();
      
      if (!options.startDate && !options.endDate) {
        // If neither start nor end date specified, set start date based on days
        startDate = new Date();
        startDate.setDate(startDate.getDate() - days + (includeToday ? 1 : 0));
      }
      
      // Generate dates between start and end
      const dates: Date[] = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      const workoutIds: string[] = [];
      const activityIds: string[] = [];
      
      // Generate workouts and activities for each date
      for (let i = 0; i < dates.length; i++) {
        const date = dates[i];
        const useActivity = mixedTypes ? i % 2 === 1 : false;
        
        if (useActivity) {
          // Create manual workout/activity for this date
          const activityResult = await this.activityGenerator.generate(userId, {
            count: 1,
            type: activityType,
            activityDate: date,
            isTestData: true
          });
          
          if (activityResult.success && activityResult.ids && activityResult.ids.length > 0) {
            activityIds.push(...activityResult.ids);
          }
        } else {
          // Create workout for this date
          const workoutResult = await this.workoutGenerator.generate(userId, {
            count: 1,
            type: workoutType,
            workoutDate: date,
            durationMinutes: 45,
            isTestData: true
          });
          
          if (workoutResult.success && workoutResult.workoutIds) {
            workoutIds.push(...workoutResult.workoutIds);
          }
        }
      }
      
      // Update profile streak
      const streak = dates.length;
      const lastWorkoutDate = dates[dates.length - 1];
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          streak: streak,
          last_workout_at: lastWorkoutDate.toISOString()
        })
        .eq('id', userId);
        
      if (profileError) {
        console.error(`Error updating profile streak: ${profileError.message}`);
      }
      
      return {
        success: true,
        message: `Generated streak of ${streak} days`,
        ids: [...workoutIds, ...activityIds],
        workoutIds: workoutIds,
        data: {
          workoutIds,
          activityIds,
          streak,
          dates: dates.map(d => d.toISOString())
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  async cleanup(userId: string): Promise<boolean> {
    try {
      await this.workoutGenerator.cleanup(userId);
      await this.activityGenerator.cleanup(userId);
      
      // Reset streak
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          streak: 0,
          last_workout_at: null
        })
        .eq('id', userId);
        
      if (profileError) {
        console.error(`Error resetting profile streak: ${profileError.message}`);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error cleaning up streak:', error);
      return false;
    }
  }
}

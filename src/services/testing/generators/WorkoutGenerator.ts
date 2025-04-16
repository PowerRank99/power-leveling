
import { supabase } from '@/integrations/supabase/client';
import { TestDataGenerator, GeneratorResult, formatDateForDB, GeneratorOptions } from './index';

// Define workout types
export enum WorkoutType {
  STRENGTH = 'strength',
  CARDIO = 'cardio',
  HIIT = 'hiit',
  MOBILITY = 'mobility',
  SPORT = 'sport'
}

export interface WorkoutGenerationOptions extends GeneratorOptions {
  type?: WorkoutType | string;
  durationMinutes?: number;
  setCount?: number;
  daysAgo?: number;
  workoutDate?: Date;
}

export class WorkoutGenerator implements TestDataGenerator {
  async generate(userId: string, options: WorkoutGenerationOptions = {}): Promise<GeneratorResult> {
    try {
      const {
        count = 1,
        type = WorkoutType.STRENGTH,
        durationMinutes = 45,
        setCount = 3,
        daysAgo = 0,
        isTestData = true,
        workoutDate
      } = options;
      
      const workoutIds: string[] = [];
      
      for (let i = 0; i < count; i++) {
        // Create a base workout date
        const actualWorkoutDate = workoutDate || new Date();
        
        // If daysAgo is specified, adjust the date
        if (daysAgo > 0) {
          actualWorkoutDate.setDate(actualWorkoutDate.getDate() - daysAgo - i);
        }
        
        // Create workout
        const { data: workout, error: workoutError } = await supabase
          .from('workouts')
          .insert({
            user_id: userId,
            started_at: new Date(actualWorkoutDate.getTime() - durationMinutes * 60 * 1000).toISOString(),
            completed_at: actualWorkoutDate.toISOString(),
            duration_seconds: durationMinutes * 60,
            type: type
          })
          .select('id')
          .single();
          
        if (workoutError || !workout) {
          throw new Error(`Error creating workout: ${workoutError?.message}`);
        }
        
        workoutIds.push(workout.id);
        
        // Update profile
        const { error: profileError } = await supabase
          .rpc('increment_profile_counter', {
            user_id_param: userId,
            counter_name: 'workouts_count',
            increment_amount: 1
          });
          
        if (profileError) {
          console.error(`Error updating profile: ${profileError.message}`);
        }
      }
      
      return {
        success: true,
        message: `Generated ${count} ${type} workouts`,
        workoutIds
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to generate workouts: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
  
  async createRandomWorkouts(userId: string, count: number, options: any = {}): Promise<GeneratorResult> {
    return this.generate(userId, { ...options, count });
  }
  
  async createWorkout(userId: string, options: any = {}): Promise<GeneratorResult> {
    return this.generate(userId, { ...options, count: 1 });
  }
  
  async cleanup(userId: string): Promise<boolean> {
    try {
      // Clean up workouts created for testing
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('user_id', userId)
        .contains('metadata', { isTestData: true });
        
      return !error;
    } catch (error) {
      console.error(`Error cleaning up workouts: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }
  
  async cleanupGeneratedWorkouts(userId: string): Promise<boolean> {
    return this.cleanup(userId);
  }
}


import { supabase } from '@/integrations/supabase/client';
import { TestDataGenerator, GeneratorResult } from './index';

// Define workout types
export enum WorkoutType {
  STRENGTH = 'strength',
  CARDIO = 'cardio',
  HIIT = 'hiit',
  MOBILITY = 'mobility',
  SPORT = 'sport'
}

export interface WorkoutGenerationOptions {
  count?: number;
  type?: WorkoutType | string;
  durationMinutes?: number;
  setCount?: number;
  daysAgo?: number;
  isTestData?: boolean;
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
        isTestData = true
      } = options;
      
      const workoutIds: string[] = [];
      
      for (let i = 0; i < count; i++) {
        // Create a base workout date
        const workoutDate = options.workoutDate || new Date();
        
        // If daysAgo is specified, adjust the date
        if (daysAgo > 0) {
          workoutDate.setDate(workoutDate.getDate() - daysAgo - i);
        }
        
        // Create workout
        const { data: workout, error: workoutError } = await supabase
          .from('workouts')
          .insert({
            user_id: userId,
            started_at: new Date(workoutDate.getTime() - durationMinutes * 60 * 1000).toISOString(),
            completed_at: workoutDate.toISOString(),
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
        message: `Generated ${count} workout(s)`,
        ids: workoutIds,
        workoutIds: workoutIds,
        data: { workoutIds }
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  async createWorkout(userId: string, options: WorkoutGenerationOptions = {}): Promise<string | null> {
    try {
      const result = await this.generate(userId, { ...options, count: 1 });
      if (result.success && result.workoutIds && result.workoutIds.length > 0) {
        return result.workoutIds[0];
      }
      return null;
    } catch (error) {
      console.error('Error creating workout:', error);
      return null;
    }
  }
  
  async createRandomWorkouts(userId: string, count: number, type?: WorkoutType): Promise<string[]> {
    try {
      const result = await this.generate(userId, { count, type });
      return result.workoutIds || [];
    } catch (error) {
      console.error('Error creating random workouts:', error);
      return [];
    }
  }
  
  async cleanup(userId: string): Promise<boolean> {
    try {
      // Delete workouts
      const { error: workoutError } = await supabase
        .from('workouts')
        .delete()
        .eq('user_id', userId)
        .eq('started_at', new Date().toISOString().substring(0, 10));
        
      if (workoutError) {
        console.error(`Error cleaning up workouts: ${workoutError.message}`);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error cleaning up workouts:', error);
      return false;
    }
  }
  
  async cleanupGeneratedWorkouts(userId: string): Promise<boolean> {
    return this.cleanup(userId);
  }
}


import { supabase } from '@/integrations/supabase/client';
import { GeneratorOptions, GeneratorResult, CleanupOptions, TestDataGenerator } from './index';
import { generateSequentialDates, formatDateForDB } from './index';

export interface WorkoutGenerationOptions extends GeneratorOptions {
  date?: Date;
  duration?: number;
  exerciseCount?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  type?: string;
}

export interface WorkoutSeriesOptions extends GeneratorOptions {
  count: number;
  startDate?: Date;
  skipDays?: number[];
  duration?: number;
  exerciseCount?: number;
}

export interface WorkoutWithPROptions extends WorkoutGenerationOptions {
  prWeight?: number;
  previousPRWeight?: number;
  exerciseId?: string;
}

export class WorkoutGenerator implements TestDataGenerator {
  /**
   * Generate a single workout
   */
  async generateWorkout(userId: string, options: WorkoutGenerationOptions = {}): Promise<GeneratorResult> {
    try {
      const date = options.date || new Date();
      const duration = options.duration || Math.floor(Math.random() * 45) + 30;
      const testDataTag = options.testDataTag || 'test-data';
      
      // Create workout record
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: userId,
          started_at: new Date(date.getTime() - duration * 1000).toISOString(),
          completed_at: date.toISOString(),
          duration_seconds: duration * 60,
          type: options.type || 'strength',
          difficulty: options.difficulty || 'intermediate',
          meta: options.isTestData !== false ? { testData: true, tag: testDataTag } : undefined
        })
        .select('id')
        .single();
      
      if (workoutError || !workout) {
        return {
          success: false,
          error: workoutError?.message || 'Failed to create workout'
        };
      }

      // Create exercises for this workout
      const exerciseCount = options.exerciseCount || 3;
      const exerciseResult = await this.addExercisesToWorkout(workout.id, exerciseCount);
      
      // Update profile workout count
      await supabase.rpc('increment_profile_counter', {
        user_id_param: userId,
        counter_name: 'workouts_count',
        increment_amount: 1
      });

      return {
        success: true,
        ids: [workout.id]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create a workout with a personal record
   */
  async generateWorkoutWithPR(userId: string, options: WorkoutWithPROptions = {}): Promise<GeneratorResult> {
    try {
      // First create the workout
      const workoutResult = await this.generateWorkout(userId, options);
      if (!workoutResult.success || !workoutResult.ids || workoutResult.ids.length === 0) {
        return workoutResult;
      }
      
      const workoutId = workoutResult.ids[0];
      
      // Now create a personal record
      let exerciseId = options.exerciseId;
      
      if (!exerciseId) {
        // Get random exercise
        const { data: exercise, error: exerciseError } = await supabase
          .from('exercises')
          .select('id')
          .eq('type', 'strength')
          .limit(1)
          .single();
          
        if (exerciseError || !exercise) {
          return {
            success: false,
            error: exerciseError?.message || 'Failed to get exercise'
          };
        }
        
        exerciseId = exercise.id;
      }
      
      // Add the PR
      const weight = options.prWeight || 100;
      const previousWeight = options.previousPRWeight || weight - 10;
      
      const { error: prError } = await supabase
        .from('personal_records')
        .insert({
          user_id: userId,
          exercise_id: exerciseId,
          weight,
          previous_weight: previousWeight,
          recorded_at: new Date().toISOString(),
          meta: options.isTestData !== false ? { testData: true, tag: options.testDataTag || 'test-data' } : undefined
        });
        
      if (prError) {
        return {
          success: false,
          error: prError.message
        };
      }
      
      // Update profile records count
      await supabase.rpc('increment_profile_counter', {
        user_id_param: userId,
        counter_name: 'records_count',
        increment_amount: 1
      });
      
      return {
        success: true,
        ids: workoutResult.ids
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate a series of workouts over time
   */
  async generateWorkoutSeries(userId: string, options: WorkoutSeriesOptions): Promise<GeneratorResult> {
    try {
      const count = options.count;
      const startDate = options.startDate || new Date();
      const skipDays = options.skipDays || [];
      
      // Generate dates for the workouts
      const dates = generateSequentialDates(startDate, count + skipDays.length, skipDays);
      
      const workoutIds: string[] = [];
      
      // Create each workout
      for (const date of dates) {
        const result = await this.generateWorkout(userId, {
          ...options,
          date
        });
        
        if (result.success && result.ids) {
          workoutIds.push(...result.ids);
        }
      }
      
      return {
        success: true,
        ids: workoutIds
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create random workouts for testing
   */
  async createRandomWorkouts(userId: string, count: number, options: WorkoutGenerationOptions = {}): Promise<GeneratorResult> {
    try {
      const workoutIds: string[] = [];
      
      for (let i = 0; i < count; i++) {
        // Generate a random date within the last 30 days
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        
        const result = await this.generateWorkout(userId, {
          ...options,
          date
        });
        
        if (result.success && result.ids) {
          workoutIds.push(...result.ids);
        }
      }
      
      return {
        success: true,
        ids: workoutIds
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create a workout for testing
   */
  async createWorkout(userId: string, options: WorkoutGenerationOptions = {}): Promise<GeneratorResult> {
    return this.generateWorkout(userId, options);
  }

  /**
   * Add exercise sets to a workout
   */
  private async addExercisesToWorkout(workoutId: string, count: number = 3): Promise<GeneratorResult> {
    try {
      // Get random exercises
      const { data: exercises, error: exercisesError } = await supabase
        .from('exercises')
        .select('id')
        .limit(count);
        
      if (exercisesError || !exercises || exercises.length === 0) {
        // Create a fallback exercise if none exist
        const { data: fallbackExercise, error: fallbackError } = await supabase
          .from('exercises')
          .insert({
            name: 'Test Exercise',
            category: 'strength',
            type: 'strength',
            level: 'intermediate'
          })
          .select('id')
          .single();
          
        if (fallbackError || !fallbackExercise) {
          return {
            success: false,
            error: fallbackError?.message || 'Failed to create fallback exercise'
          };
        }
        
        exercises.push(fallbackExercise);
      }
      
      const setIds: string[] = [];
      
      // Add sets for each exercise
      for (let i = 0; i < exercises.length; i++) {
        const setsCount = Math.floor(Math.random() * 3) + 2; // 2-4 sets
        
        for (let j = 0; j < setsCount; j++) {
          const { data: set, error: setError } = await supabase
            .from('workout_sets')
            .insert({
              workout_id: workoutId,
              exercise_id: exercises[i].id,
              set_order: j + 1,
              weight: Math.floor(Math.random() * 50) + 10,
              reps: Math.floor(Math.random() * 12) + 5,
              completed: true,
              completed_at: new Date().toISOString()
            })
            .select('id')
            .single();
            
          if (set && !setError) {
            setIds.push(set.id);
          }
        }
      }
      
      return {
        success: true,
        ids: setIds
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Clean up test data
   */
  async cleanup(userId: string, options: CleanupOptions = {}): Promise<boolean> {
    try {
      const tag = options.testDataTag || 'test-data';
      
      // Delete workout sets for test workouts
      const { data: workouts, error: workoutError } = await supabase
        .from('workouts')
        .select('id')
        .eq('user_id', userId)
        .contains('meta', { testData: true, tag });
        
      if (!workoutError && workouts && workouts.length > 0) {
        const workoutIds = workouts.map(w => w.id);
        
        // Delete sets
        await supabase
          .from('workout_sets')
          .delete()
          .in('workout_id', workoutIds);
          
        // Delete workouts
        await supabase
          .from('workouts')
          .delete()
          .in('id', workoutIds);
      }
      
      // Delete test personal records
      await supabase
        .from('personal_records')
        .delete()
        .eq('user_id', userId)
        .contains('meta', { testData: true, tag });
        
      return true;
    } catch (error) {
      console.error('Error cleaning up test workouts:', error);
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

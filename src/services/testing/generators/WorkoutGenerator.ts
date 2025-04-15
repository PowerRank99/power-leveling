
/**
 * Workout Data Generator
 * Simulates complete workout sessions with exercises, sets, and reps
 */
import { supabase } from '@/integrations/supabase/client';
import { TransactionService } from '@/services/common/TransactionService';
import { toast } from 'sonner';
import { formatDateForDB, GeneratorOptions, GeneratorResult } from './index';

/**
 * Workout types for simulation
 */
export enum WorkoutType {
  STRENGTH = 'strength',
  CARDIO = 'cardio',
  FLEXIBILITY = 'flexibility',
  CALISTHENICS = 'calisthenics',
  HIIT = 'hiit',
  SPORT = 'sport',
  MIXED = 'mixed'
}

/**
 * Exercise difficulty levels
 */
export enum ExerciseDifficulty {
  BEGINNER = 'Iniciante',
  INTERMEDIATE = 'Intermediário', 
  ADVANCED = 'Avançado'
}

/**
 * Configuration options for workout generation
 */
export interface WorkoutGenerationOptions extends GeneratorOptions {
  /** Type of workout to generate */
  workoutType?: WorkoutType;
  /** Duration of workout in minutes */
  durationMinutes?: number;
  /** Number of exercises to include */
  exerciseCount?: number;
  /** Number of sets per exercise */
  setsPerExercise?: number;
  /** Specific date for the workout */
  workoutDate?: Date;
  /** Specific exercise IDs to include */
  exerciseIds?: string[];
  /** Whether the workout should be completed */
  completed?: boolean;
  /** Difficulty level of exercises */
  difficulty?: ExerciseDifficulty;
  /** Whether to simulate personal records */
  includePRs?: boolean;
  /** Specific routine ID to use */
  routineId?: string;
}

/**
 * Options for generating a series of workouts
 */
export interface WorkoutSeriesOptions extends WorkoutGenerationOptions {
  /** Number of workouts to generate in series */
  count: number;
  /** Start date for the series */
  startDate: Date;
  /** Whether workouts should be on consecutive days */
  consecutive?: boolean;
  /** Custom pattern of days (0-based indices to skip) */
  skipDays?: number[];
  /** Whether to randomize workout parameters for each workout */
  randomizeWorkouts?: boolean;
}

/**
 * Options for generating workouts with personal records
 */
export interface WorkoutWithPROptions extends WorkoutGenerationOptions {
  /** Number of PRs to simulate */
  prCount?: number;
  /** Percentage increase over previous records */
  prIncreasePercentage?: number;
  /** Specific exercise IDs for PRs */
  prExerciseIds?: string[];
}

/**
 * Result of workout generation operations
 */
export interface WorkoutGenerationResult extends GeneratorResult {
  /** IDs of generated workouts */
  workoutIds?: string[];
  /** IDs of generated personal records */
  prIds?: string[];
}

/**
 * Workout data generator for testing achievements
 */
export class WorkoutGenerator {
  /** Default tag for identifying test data */
  private readonly DEFAULT_TEST_TAG = 'test-data';

  /**
   * Generate a single workout with configurable parameters
   * @param userId User ID to generate workout for
   * @param options Configuration options
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
  async generateWorkout(
    userId: string,
    options: WorkoutGenerationOptions = {}
  ): Promise<WorkoutGenerationResult> {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    try {
      const {
        workoutType = WorkoutType.STRENGTH,
        durationMinutes = 60,
        exerciseCount = 3,
        setsPerExercise = 3,
        workoutDate = new Date(),
        exerciseIds = [],
        completed = true,
        difficulty = ExerciseDifficulty.INTERMEDIATE,
        includePRs = false,
        routineId,
        isTestData = true,
        testDataTag = this.DEFAULT_TEST_TAG,
        silent = false
      } = options;

      // Execute within a transaction for data consistency
      const result = await TransactionService.executeInTransaction(async () => {
        // Step 1: Get exercise IDs if not provided
        let workoutExerciseIds = [...exerciseIds];
        if (workoutExerciseIds.length === 0) {
          const { data: exercises } = await supabase
            .from('exercises')
            .select('id, type')
            .eq('level', difficulty)
            .order('created_at', { ascending: false })
            .limit(50);

          if (!exercises || exercises.length === 0) {
            throw new Error('No exercises found to generate workout');
          }

          // Filter by type if specified
          let filteredExercises = exercises;
          if (workoutType !== WorkoutType.MIXED) {
            filteredExercises = exercises.filter(e => this.mapWorkoutTypeToExerciseType(workoutType).includes(e.type));
          }

          // Fallback to all exercises if filtered list is empty
          if (filteredExercises.length === 0) {
            filteredExercises = exercises;
          }

          // Select random exercises
          const selectedCount = Math.min(exerciseCount, filteredExercises.length);
          workoutExerciseIds = this.getRandomElements(filteredExercises, selectedCount).map(e => e.id);
        }

        if (workoutExerciseIds.length === 0) {
          throw new Error('No exercises available for workout');
        }

        // Step 2: Create the workout record
        const workoutStartTime = formatDateForDB(workoutDate);
        const workoutEndTime = completed ? formatDateForDB(new Date(workoutDate.getTime() + durationMinutes * 60000)) : null;

        const { data: workout, error: workoutError } = await supabase
          .from('workouts')
          .insert({
            user_id: userId,
            routine_id: routineId,
            started_at: workoutStartTime,
            completed_at: workoutEndTime,
            duration_seconds: completed ? durationMinutes * 60 : null,
            metadata: isTestData ? { isTestData: true, tag: testDataTag } : undefined
          })
          .select()
          .single();

        if (workoutError || !workout) {
          throw new Error(`Failed to create workout: ${workoutError?.message || 'Unknown error'}`);
        }

        // Step 3: Create workout sets
        for (const [index, exerciseId] of workoutExerciseIds.entries()) {
          for (let setIndex = 0; setIndex < setsPerExercise; setIndex++) {
            const weight = this.generateRandomWeight(workoutType);
            const reps = this.generateRandomReps(workoutType);

            await supabase
              .from('workout_sets')
              .insert({
                workout_id: workout.id,
                exercise_id: exerciseId,
                set_order: setIndex + 1,
                weight: weight,
                reps: reps,
                completed: completed,
                completed_at: completed ? formatDateForDB(new Date(workoutDate.getTime() + (setIndex * 2 * 60000))) : null
              });
          }
        }

        // Step 4: Generate PRs if requested
        let prIds: string[] = [];
        if (includePRs && completed) {
          const prResult = await this.generateWorkoutPRs(userId, workout.id, {
            exerciseIds: workoutExerciseIds,
            isTestData,
            testDataTag
          });
          
          if (prResult.success && prResult.prIds) {
            prIds = prResult.prIds;
          }
        }

        // Step 5: Update profile workout count and streak if completed
        if (completed) {
          await supabase
            .rpc('increment_profile_counter', {
              user_id_param: userId,
              counter_name: 'workouts_count',
              increment_amount: 1
            });

          // Update streak and last_workout_at
          await supabase
            .from('profiles')
            .update({ 
              last_workout_at: workoutEndTime 
            })
            .eq('id', userId);
        }

        return {
          success: true,
          workoutIds: [workout.id],
          prIds
        };
      }, 'generate_test_workout');

      if (!silent && result.success) {
        toast.success('Test workout generated', {
          description: `Created workout with ${exerciseCount} exercises`
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error generating workout';
      if (!options.silent) {
        toast.error('Failed to generate test workout', {
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
   * Generate a series of workouts over time
   * @param userId User ID to generate workouts for
   * @param options Series configuration options
   * @returns Promise with generation result
   * 
   * @example
   * ```typescript
   * // Generate 5 consecutive daily workouts
   * const result = await workoutGenerator.generateWorkoutSeries('user-123', {
   *   count: 5,
   *   startDate: new Date('2023-05-01'),
   *   consecutive: true
   * });
   * 
   * // Generate 3 workouts with a custom pattern
   * const result = await workoutGenerator.generateWorkoutSeries('user-123', {
   *   count: 3,
   *   startDate: new Date('2023-05-01'),
   *   skipDays: [1, 3, 5], // Skip days 1, 3, and 5
   *   randomizeWorkouts: true
   * });
   * ```
   */
  async generateWorkoutSeries(
    userId: string,
    options: WorkoutSeriesOptions
  ): Promise<WorkoutGenerationResult> {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    if (!options.count || options.count <= 0) {
      return { success: false, error: 'Count must be greater than 0' };
    }

    if (!options.startDate) {
      return { success: false, error: 'Start date is required' };
    }

    try {
      const {
        count,
        startDate,
        consecutive = true,
        skipDays = [],
        randomizeWorkouts = false,
        silent = false,
        testDataTag = this.DEFAULT_TEST_TAG,
        isTestData = true
      } = options;

      const workoutIds: string[] = [];
      const prIds: string[] = [];
      let currentDate = new Date(startDate);

      // Generate dates for all workouts
      const workoutDates: Date[] = [];
      
      if (consecutive) {
        // Generate consecutive dates, skipping specified days
        for (let i = 0; i < count + skipDays.length; i++) {
          const dayToAdd = new Date(startDate);
          dayToAdd.setDate(dayToAdd.getDate() + i);
          
          if (!skipDays.includes(i)) {
            workoutDates.push(dayToAdd);
            
            // Stop when we have enough dates
            if (workoutDates.length >= count) {
              break;
            }
          }
        }
      } else {
        // Generate random dates within a reasonable timespan
        const maxDays = count * 3; // Spread across 3x the workout count
        const availableDays = Array.from({ length: maxDays }, (_, i) => i)
          .filter(day => !skipDays.includes(day));
        
        // Select random days
        const selectedDays = this.getRandomElements(availableDays, count);
        selectedDays.sort((a, b) => a - b); // Sort in ascending order
        
        // Convert to dates
        for (const day of selectedDays) {
          const date = new Date(startDate);
          date.setDate(date.getDate() + day);
          workoutDates.push(date);
        }
      }

      // Generate each workout
      for (let i = 0; i < workoutDates.length; i++) {
        // Create base options for this workout
        const workoutOptions: WorkoutGenerationOptions = {
          ...options,
          workoutDate: workoutDates[i],
          silent: true, // Silence individual notifications
          isTestData,
          testDataTag
        };
        
        // Randomize workout parameters if requested
        if (randomizeWorkouts) {
          workoutOptions.workoutType = this.getRandomWorkoutType();
          workoutOptions.exerciseCount = Math.floor(Math.random() * 5) + 1; // 1-5 exercises
          workoutOptions.setsPerExercise = Math.floor(Math.random() * 3) + 2; // 2-4 sets
          workoutOptions.durationMinutes = Math.floor(Math.random() * 60) + 30; // 30-90 minutes
          workoutOptions.difficulty = this.getRandomDifficulty();
          workoutOptions.includePRs = Math.random() > 0.7; // 30% chance of PRs
        }
        
        // Generate the workout
        const result = await this.generateWorkout(userId, workoutOptions);
        
        if (result.success) {
          if (result.workoutIds) workoutIds.push(...result.workoutIds);
          if (result.prIds) prIds.push(...result.prIds);
        } else {
          // Continue despite errors
          console.error(`Failed to generate workout ${i+1}:`, result.error);
        }
      }

      if (!silent) {
        toast.success('Workout series generated', {
          description: `Created ${workoutIds.length} workouts over ${workoutDates.length} days`
        });
      }

      return {
        success: true,
        workoutIds,
        prIds
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error generating workout series';
      if (!options.silent) {
        toast.error('Failed to generate workout series', {
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
   * Generate a workout with personal records for specific exercises
   * @param userId User ID to generate workout for
   * @param options Configuration options
   * @returns Promise with generation result
   * 
   * @example
   * ```typescript
   * // Generate a workout with 2 personal records
   * const result = await workoutGenerator.generateWorkoutWithPR('user-123', {
   *   prCount: 2,
   *   prIncreasePercentage: 10, // 10% increase over previous records
   *   workoutType: WorkoutType.STRENGTH
   * });
   * 
   * // Generate a workout with PRs for specific exercises
   * const result = await workoutGenerator.generateWorkoutWithPR('user-123', {
   *   prExerciseIds: ['exercise-id-1', 'exercise-id-2'],
   *   prIncreasePercentage: 5
   * });
   * ```
   */
  async generateWorkoutWithPR(
    userId: string,
    options: WorkoutWithPROptions = {}
  ): Promise<WorkoutGenerationResult> {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    try {
      const {
        prCount = 1,
        prIncreasePercentage = 5,
        prExerciseIds = [],
        workoutType = WorkoutType.STRENGTH,
        workoutDate = new Date(),
        silent = false,
        testDataTag = this.DEFAULT_TEST_TAG,
        isTestData = true
      } = options;

      // First, generate a regular workout
      const workoutResult = await this.generateWorkout(userId, {
        ...options,
        workoutType,
        workoutDate,
        includePRs: false, // We'll handle PRs manually
        exerciseIds: prExerciseIds.length > 0 ? prExerciseIds : undefined,
        silent: true,
        isTestData,
        testDataTag
      });

      if (!workoutResult.success || !workoutResult.workoutIds || workoutResult.workoutIds.length === 0) {
        return { 
          success: false, 
          error: workoutResult.error || 'Failed to generate base workout' 
        };
      }

      const workoutId = workoutResult.workoutIds[0];

      // Now generate PRs for the workout
      const prResult = await this.generateWorkoutPRs(userId, workoutId, {
        exerciseIds: prExerciseIds,
        prCount,
        increasePercentage: prIncreasePercentage,
        isTestData,
        testDataTag
      });

      if (!silent) {
        if (prResult.success) {
          toast.success('Workout with PRs generated', {
            description: `Created workout with ${prResult.prIds?.length || 0} personal records`
          });
        } else {
          toast.error('Failed to generate PRs', {
            description: prResult.error
          });
        }
      }

      // Convert the result directly, bypassing ServiceResponse type
      return {
        success: true,
        workoutIds: workoutResult.workoutIds,
        prIds: prResult.prIds
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error generating workout with PRs';
      if (!options.silent) {
        toast.error('Failed to generate workout with PRs', {
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
   * Remove all test-generated workouts for a user
   * @param userId User ID to clean up data for
   * @param options Cleanup options
   * @returns Promise with cleanup result
   * 
   * @example
   * ```typescript
   * // Clean up all test workouts
   * const result = await workoutGenerator.cleanupGeneratedWorkouts('user-123');
   * 
   * // Clean up with a specific test data tag
   * const result = await workoutGenerator.cleanupGeneratedWorkouts('user-123', {
   *   testDataTag: 'streak-test',
   *   silent: true
   * });
   * ```
   */
  async cleanupGeneratedWorkouts(
    userId: string,
    options: { silent?: boolean; testDataTag?: string } = {}
  ): Promise<GeneratorResult> {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    try {
      const { silent = false, testDataTag = this.DEFAULT_TEST_TAG } = options;

      // First get all test workouts to clean up
      const { data: workouts, error: fetchError } = await supabase
        .from('workouts')
        .select('id')
        .eq('user_id', userId)
        .contains('metadata', { isTestData: true, tag: testDataTag });
      
      if (fetchError) {
        throw new Error(`Failed to fetch test workouts: ${fetchError.message}`);
      }
      
      if (!workouts || workouts.length === 0) {
        return { success: true, ids: [] };
      }
      
      const workoutIds = workouts.map(w => w.id);
      
      // Execute cleanup in a transaction
      await TransactionService.executeInTransaction(async () => {
        // Delete workout sets
        for (const workoutId of workoutIds) {
          await supabase
            .from('workout_sets')
            .delete()
            .eq('workout_id', workoutId);
        }
        
        // Delete the workouts
        await supabase
          .from('workouts')
          .delete()
          .in('id', workoutIds);
        
        // Recalculate workout count
        const { count } = await supabase
          .from('workouts')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId);
        
        await supabase
          .from('profiles')
          .update({ workouts_count: count || 0 })
          .eq('id', userId);
      }, 'cleanup_test_workouts');
      
      if (!silent) {
        toast.success('Test workouts cleaned up', {
          description: `Removed ${workoutIds.length} test workouts`
        });
      }
      
      return {
        success: true,
        ids: workoutIds
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error cleaning up workouts';
      if (!options.silent) {
        toast.error('Failed to clean up test workouts', {
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
   * Generate personal records for a specific workout
   * @private
   */
  private async generateWorkoutPRs(
    userId: string,
    workoutId: string,
    options: {
      exerciseIds?: string[];
      prCount?: number;
      increasePercentage?: number;
      isTestData?: boolean;
      testDataTag?: string;
    } = {}
  ): Promise<{ success: boolean; error?: string; prIds?: string[] }> {
    try {
      const {
        exerciseIds = [],
        prCount = 1,
        increasePercentage = 5,
        isTestData = true,
        testDataTag = this.DEFAULT_TEST_TAG
      } = options;

      // Get exercises from the workout if not specified
      let targetExerciseIds = [...exerciseIds];
      if (targetExerciseIds.length === 0) {
        const { data: sets } = await supabase
          .from('workout_sets')
          .select('exercise_id')
          .eq('workout_id', workoutId)
          .order('set_order', { ascending: true });

        if (sets && sets.length > 0) {
          targetExerciseIds = [...new Set(sets.map(s => s.exercise_id))]; // Unique exercise IDs
        }
      }

      if (targetExerciseIds.length === 0) {
        return { success: false, error: 'No exercises available for PRs' };
      }

      // Limit to requested PR count
      const selectedExerciseIds = prCount >= targetExerciseIds.length
        ? targetExerciseIds
        : this.getRandomElements(targetExerciseIds, prCount);

      const prIds: string[] = [];

      // Get current PRs
      const { data: currentPRs } = await supabase
        .from('personal_records')
        .select('*')
        .eq('user_id', userId)
        .in('exercise_id', selectedExerciseIds);

      const prMap = new Map();
      if (currentPRs) {
        currentPRs.forEach(pr => prMap.set(pr.exercise_id, pr));
      }

      // Create or update PRs
      for (const exerciseId of selectedExerciseIds) {
        const currentPR = prMap.get(exerciseId);
        const currentWeight = currentPR ? currentPR.weight : 50; // Default starting weight
        const newWeight = currentPR
          ? currentWeight * (1 + increasePercentage / 100)
          : currentWeight;

        const { data: pr, error: prError } = await supabase
          .from('personal_records')
          .upsert({
            user_id: userId,
            exercise_id: exerciseId,
            weight: Math.round(newWeight * 10) / 10, // Round to 1 decimal place
            previous_weight: currentWeight,
            recorded_at: new Date().toISOString(),
            metadata: isTestData ? { isTestData: true, tag: testDataTag } : undefined
          })
          .select()
          .single();

        if (prError) {
          console.error(`Failed to create PR for exercise ${exerciseId}:`, prError);
          continue;
        }

        if (pr) {
          prIds.push(pr.id);
        }
      }

      // Update PR count in profile
      await supabase
        .from('profiles')
        .update({ records_count: prIds.length })
        .eq('id', userId);

      return {
        success: true,
        prIds
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error generating PRs'
      };
    }
  }

  /**
   * Maps workout type to corresponding exercise types
   * @private
   */
  private mapWorkoutTypeToExerciseType(workoutType: WorkoutType): string[] {
    switch (workoutType) {
      case WorkoutType.STRENGTH:
        return ['strength', 'powerlifting', 'weightlifting'];
      case WorkoutType.CARDIO:
        return ['cardio', 'running', 'cycling'];
      case WorkoutType.FLEXIBILITY:
        return ['mobility', 'flexibility', 'yoga', 'stretching'];
      case WorkoutType.CALISTHENICS:
        return ['calisthenics', 'bodyweight', 'gymnastics'];
      case WorkoutType.HIIT:
        return ['hiit', 'circuit', 'crossfit'];
      case WorkoutType.SPORT:
        return ['sport', 'athletics', 'basketball', 'football', 'soccer'];
      case WorkoutType.MIXED:
      default:
        return []; // Empty array means all types
    }
  }

  /**
   * Generates a random weight based on workout type
   * @private
   */
  private generateRandomWeight(workoutType: WorkoutType): number {
    switch (workoutType) {
      case WorkoutType.STRENGTH:
        return Math.floor(Math.random() * 100) + 20; // 20-120kg
      case WorkoutType.CALISTHENICS:
        return Math.floor(Math.random() * 30); // 0-30kg (bodyweight plus small weights)
      case WorkoutType.FLEXIBILITY:
        return 0; // Flexibility exercises typically don't use weights
      case WorkoutType.CARDIO:
        return 0; // Cardio exercises typically don't use weights
      case WorkoutType.HIIT:
        return Math.floor(Math.random() * 20) + 5; // 5-25kg
      case WorkoutType.SPORT:
        return 0; // Sports typically don't track weights
      default:
        return Math.floor(Math.random() * 50) + 10; // 10-60kg
    }
  }

  /**
   * Generates random reps based on workout type
   * @private
   */
  private generateRandomReps(workoutType: WorkoutType): number {
    switch (workoutType) {
      case WorkoutType.STRENGTH:
        return Math.floor(Math.random() * 8) + 3; // 3-10 reps
      case WorkoutType.CALISTHENICS:
        return Math.floor(Math.random() * 15) + 5; // 5-20 reps
      case WorkoutType.FLEXIBILITY:
        return 1; // Flexibility exercises often track time instead of reps
      case WorkoutType.CARDIO:
        return 1; // Cardio exercises often track time/distance instead of reps
      case WorkoutType.HIIT:
        return Math.floor(Math.random() * 20) + 10; // 10-30 reps
      case WorkoutType.SPORT:
        return 1; // Sports typically track time/points instead of reps
      default:
        return Math.floor(Math.random() * 12) + 8; // 8-20 reps
    }
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

  /**
   * Get a random workout type
   * @private
   */
  private getRandomWorkoutType(): WorkoutType {
    const types = Object.values(WorkoutType);
    return types[Math.floor(Math.random() * types.length)];
  }

  /**
   * Get a random difficulty level
   * @private
   */
  private getRandomDifficulty(): ExerciseDifficulty {
    const difficulties = Object.values(ExerciseDifficulty);
    return difficulties[Math.floor(Math.random() * difficulties.length)];
  }
}

/**
 * Personal Record Data Generator
 * Simulates personal records for exercises
 */
import { supabase } from '@/integrations/supabase/client';
import { TransactionService } from '@/services/common/TransactionService';
import { toast } from 'sonner';
import { formatDateForDB, GeneratorOptions, GeneratorResult } from './index';

/**
 * Options for personal record generation
 */
export interface PROptions extends GeneratorOptions {
  /** Weight value for the PR */
  weight?: number;
  /** Previous weight value */
  previousWeight?: number;
  /** Date of the PR */
  recordDate?: Date;
  /** Whether to increment records_count in profile */
  updateProfileStats?: boolean;
}

/**
 * Options for generating a progression of PRs
 */
export interface PRProgressionOptions extends PROptions {
  /** Number of steps in the progression */
  steps: number;
  /** Starting weight value */
  startWeight?: number;
  /** Percentage increase between steps */
  increasePercentage?: number;
  /** Days between each progression step */
  daysBetweenRecords?: number;
  /** Type of progression pattern */
  progressionType?: 'linear' | 'stepped' | 'plateau' | 'breakthrough';
}

/**
 * Options for generating PRs across multiple exercises
 */
export interface MultiExercisePROptions extends PROptions {
  /** Number of exercises to generate PRs for */
  exerciseCount?: number;
  /** Specific exercise IDs to use */
  exerciseIds?: string[];
  /** Filter exercises by type */
  exerciseType?: string;
  /** Generate progression for each exercise */
  withProgression?: boolean;
  /** Progression options if withProgression is true */
  progressionOptions?: Omit<PRProgressionOptions, 'exerciseId'>;
}

/**
 * Result of PR generation operations
 */
export interface PRGenerationResult extends GeneratorResult {
  /** IDs of generated PRs */
  prIds?: string[];
}

/**
 * Personal record data generator for testing achievements
 */
export class PRGenerator {
  /** Default tag for identifying test data */
  private readonly DEFAULT_TEST_TAG = 'pr-test-data';

  /**
   * Generate a single personal record
   * @param userId User ID to generate PR for
   * @param exerciseId Exercise ID to generate PR for
   * @param options Configuration options
   * @returns Promise with generation result
   * 
   * @example
   * ```typescript
   * // Generate a basic PR
   * const result = await prGenerator.generatePR('user-123', 'exercise-456');
   * 
   * // Generate a PR with specific values
   * const result = await prGenerator.generatePR('user-123', 'exercise-456', {
   *   weight: 100,
   *   previousWeight: 90,
   *   recordDate: new Date('2023-05-15')
   * });
   * ```
   */
  async generatePR(
    userId: string,
    exerciseId: string,
    options: PROptions = {}
  ): Promise<PRGenerationResult> {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    if (!exerciseId) {
      return { success: false, error: 'Exercise ID is required' };
    }

    try {
      const {
        weight = 100,
        previousWeight = weight * 0.9, // Default to 90% of new weight
        recordDate = new Date(),
        updateProfileStats = true,
        isTestData = true,
        testDataTag = this.DEFAULT_TEST_TAG,
        silent = false
      } = options;

      // Create the PR within a transaction
      const result = await TransactionService.executeInTransaction(async () => {
        // Insert or update the PR
        const { data: pr, error: prError } = await supabase
          .from('personal_records')
          .upsert({
            user_id: userId,
            exercise_id: exerciseId,
            weight: weight,
            previous_weight: previousWeight,
            recorded_at: formatDateForDB(recordDate),
            metadata: isTestData ? { isTestData: true, tag: testDataTag } : undefined
          })
          .select()
          .single();

        if (prError || !pr) {
          throw new Error(`Failed to create PR: ${prError?.message || 'Unknown error'}`);
        }

        // Update profile if requested
        if (updateProfileStats) {
          // Get total PR count
          const { count } = await supabase
            .from('personal_records')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId);

          // Update records count
          await supabase
            .from('profiles')
            .update({ records_count: count || 1 })
            .eq('id', userId);
        }

        return {
          success: true,
          prIds: [pr.id]
        };
      }, 'generate_test_pr');

      if (!silent && result.success) {
        toast.success('Test PR generated', {
          description: `Created PR of ${weight}kg (previous: ${previousWeight}kg)`
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error generating PR';
      if (!options.silent) {
        toast.error('Failed to generate test PR', {
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
   * Generate a progression of increasing PRs for an exercise
   * @param userId User ID to generate PRs for
   * @param exerciseId Exercise ID to generate PRs for
   * @param options Progression configuration
   * @returns Promise with generation result
   * 
   * @example
   * ```typescript
   * // Generate a linear progression of 5 PRs
   * const result = await prGenerator.generatePRProgression('user-123', 'exercise-456', {
   *   steps: 5,
   *   startWeight: 80,
   *   increasePercentage: 5
   * });
   * 
   * // Generate a plateau pattern
   * const result = await prGenerator.generatePRProgression('user-123', 'exercise-456', {
   *   steps: 5,
   *   startWeight: 100,
   *   progressionType: 'plateau'
   * });
   * ```
   */
  async generatePRProgression(
    userId: string,
    exerciseId: string,
    options: PRProgressionOptions
  ): Promise<PRGenerationResult> {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    if (!exerciseId) {
      return { success: false, error: 'Exercise ID is required' };
    }

    if (!options.steps || options.steps <= 0) {
      return { success: false, error: 'Steps must be greater than 0' };
    }

    try {
      const {
        steps,
        startWeight = 50,
        increasePercentage = 5,
        daysBetweenRecords = 7,
        progressionType = 'linear',
        recordDate = new Date(),
        updateProfileStats = true,
        isTestData = true,
        testDataTag = this.DEFAULT_TEST_TAG,
        silent = false
      } = options;

      const prIds: string[] = [];
      let lastWeight = startWeight;
      
      // Clear any existing PRs for this exercise first
      await supabase
        .from('personal_records')
        .delete()
        .eq('user_id', userId)
        .eq('exercise_id', exerciseId)
        .contains('metadata', { isTestData: true, tag: testDataTag });

      // Create each PR in the progression
      for (let i = 0; i < steps; i++) {
        // Calculate date for this record (going backward from the provided date)
        const stepDate = new Date(recordDate);
        stepDate.setDate(stepDate.getDate() - ((steps - 1 - i) * daysBetweenRecords));
        
        // Calculate next weight based on progression type
        const previousWeight = lastWeight;
        let newWeight = lastWeight;
        
        switch (progressionType) {
          case 'linear':
            // Consistent percentage increase
            newWeight = lastWeight * (1 + increasePercentage / 100);
            break;
            
          case 'stepped':
            // Larger jumps with small steps
            if (i % 2 === 0) {
              newWeight = lastWeight * (1 + (increasePercentage * 1.5) / 100);
            } else {
              newWeight = lastWeight * (1 + (increasePercentage * 0.5) / 100);
            }
            break;
            
          case 'plateau':
            // Period of no progress followed by small jumps
            if (i % 3 === 0) {
              newWeight = lastWeight * (1 + increasePercentage / 100);
            }
            break;
            
          case 'breakthrough':
            // Small increases with occasional large breakthroughs
            if (i % 4 === 3) {
              newWeight = lastWeight * (1 + (increasePercentage * 3) / 100);
            } else {
              newWeight = lastWeight * (1 + (increasePercentage * 0.7) / 100);
            }
            break;
        }
        
        // Create the PR
        const result = await this.generatePR(userId, exerciseId, {
          weight: Math.round(newWeight * 10) / 10, // Round to 1 decimal place
          previousWeight: Math.round(previousWeight * 10) / 10,
          recordDate: stepDate,
          updateProfileStats: i === steps - 1 && updateProfileStats, // Only update profile on last PR
          isTestData,
          testDataTag,
          silent: true // Silence individual notifications
        });
        
        if (result.success && result.prIds) {
          prIds.push(...result.prIds);
        }
        
        // Update last weight for next iteration
        lastWeight = newWeight;
      }

      if (!silent) {
        toast.success('PR progression generated', {
          description: `Created ${prIds.length} PRs with ${progressionType} progression`
        });
      }

      // Return the result directly without using ServiceResponse
      return {
        success: true,
        prIds
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error generating PR progression';
      if (!options.silent) {
        toast.error('Failed to generate PR progression', {
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
   * Generate PRs for multiple exercises
   * @param userId User ID to generate PRs for
   * @param options Configuration options
   * @returns Promise with generation result
   * 
   * @example
   * ```typescript
   * // Generate PRs for 3 random exercises
   * const result = await prGenerator.generatePRsForMultipleExercises('user-123', {
   *   exerciseCount: 3
   * });
   * 
   * // Generate PRs for specific exercises with progression
   * const result = await prGenerator.generatePRsForMultipleExercises('user-123', {
   *   exerciseIds: ['ex-1', 'ex-2', 'ex-3'],
   *   withProgression: true,
   *   progressionOptions: {
   *     steps: 3,
   *     progressionType: 'linear'
   *   }
   * });
   * ```
   */
  async generatePRsForMultipleExercises(
    userId: string,
    options: MultiExercisePROptions = {}
  ): Promise<PRGenerationResult> {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    try {
      const {
        exerciseCount = 3,
        exerciseIds = [],
        exerciseType,
        withProgression = false,
        progressionOptions = { steps: 3 },
        isTestData = true,
        testDataTag = this.DEFAULT_TEST_TAG,
        silent = false
      } = options;

      // Get exercise IDs if not provided
      let targetExerciseIds = [...exerciseIds];
      if (targetExerciseIds.length === 0) {
        let query = supabase
          .from('exercises')
          .select('id')
          .order('created_at', { ascending: false });
          
        // Filter by type if specified
        if (exerciseType) {
          query = query.eq('type', exerciseType);
        }
        
        const { data: exercises } = await query.limit(50);
        
        if (!exercises || exercises.length === 0) {
          return { success: false, error: 'No exercises found' };
        }
        
        // Select random exercises
        const count = Math.min(exerciseCount, exercises.length);
        targetExerciseIds = this.getRandomElements(exercises, count).map(e => e.id);
      }

      if (targetExerciseIds.length === 0) {
        return { success: false, error: 'No valid exercise IDs' };
      }

      const allPrIds: string[] = [];

      // Generate PRs for each exercise
      for (const exerciseId of targetExerciseIds) {
        if (withProgression) {
          // Generate a progression for this exercise
          const result = await this.generatePRProgression(userId, exerciseId, {
            ...progressionOptions,
            isTestData,
            testDataTag,
            silent: true // Silence individual notifications
          });
          
          if (result.success && result.prIds) {
            allPrIds.push(...result.prIds);
          }
        } else {
          // Generate a single PR for this exercise
          const result = await this.generatePR(userId, exerciseId, {
            isTestData,
            testDataTag,
            silent: true // Silence individual notifications
          });
          
          if (result.success && result.prIds) {
            allPrIds.push(...result.prIds);
          }
        }
      }

      // Update profile records count to match total PRs
      await supabase
        .from('profiles')
        .update({ records_count: allPrIds.length })
        .eq('id', userId);

      if (!silent) {
        toast.success('Multiple PRs generated', {
          description: `Created ${allPrIds.length} PRs across ${targetExerciseIds.length} exercises`
        });
      }

      return {
        success: true,
        prIds: allPrIds
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error generating multiple PRs';
      if (!options.silent) {
        toast.error('Failed to generate multiple PRs', {
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
   * Remove all test-generated PRs for a user
   * @param userId User ID to clean up data for
   * @param options Cleanup options
   * @returns Promise with cleanup result
   * 
   * @example
   * ```typescript
   * // Clean up all test PRs
   * const result = await prGenerator.cleanupGeneratedPRs('user-123');
   * 
   * // Clean up with a specific test data tag
   * const result = await prGenerator.cleanupGeneratedPRs('user-123', {
   *   testDataTag: 'pr-progression',
   *   silent: true
   * });
   * ```
   */
  async cleanupGeneratedPRs(
    userId: string,
    options: { silent?: boolean; testDataTag?: string; updateProfileStats?: boolean } = {}
  ): Promise<GeneratorResult> {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    try {
      const { 
        silent = false, 
        testDataTag = this.DEFAULT_TEST_TAG,
        updateProfileStats = true
      } = options;

      // Find all test PRs
      const { data: prs, error: fetchError } = await supabase
        .from('personal_records')
        .select('id')
        .eq('user_id', userId)
        .contains('metadata', { isTestData: true, tag: testDataTag });
      
      if (fetchError) {
        throw new Error(`Failed to fetch test PRs: ${fetchError.message}`);
      }
      
      if (!prs || prs.length === 0) {
        return { success: true, ids: [] };
      }
      
      const prIds = prs.map(pr => pr.id);
      
      // Delete the PRs within a transaction
      await TransactionService.executeInTransaction(async () => {
        // Delete the PRs
        await supabase
          .from('personal_records')
          .delete()
          .in('id', prIds);
        
        // Update profile records count if requested
        if (updateProfileStats) {
          const { count } = await supabase
            .from('personal_records')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId);
          
          await supabase
            .from('profiles')
            .update({ records_count: count || 0 })
            .eq('id', userId);
        }
      }, 'cleanup_test_prs');
      
      if (!silent) {
        toast.success('Test PRs cleaned up', {
          description: `Removed ${prIds.length} test PRs`
        });
      }
      
      return {
        success: true,
        ids: prIds
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error cleaning up PRs';
      if (!options.silent) {
        toast.error('Failed to clean up test PRs', {
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

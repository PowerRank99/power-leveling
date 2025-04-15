
/**
 * Test Data Generator Service
 * Provides centralized access to all data generators
 */
import { createTestDataGenerators, TestDataGenerators } from './index';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CharacterClass } from './ClassGenerator';

/**
 * Service for centralized access to all test data generators
 */
export class TestDataGeneratorService {
  private static instance: TestDataGeneratorService;
  private generators: TestDataGenerators;

  private constructor() {
    this.generators = createTestDataGenerators();
  }

  /**
   * Get the singleton instance of the generator service
   */
  public static getInstance(): TestDataGeneratorService {
    if (!TestDataGeneratorService.instance) {
      TestDataGeneratorService.instance = new TestDataGeneratorService();
    }
    return TestDataGeneratorService.instance;
  }

  /**
   * Access all available generators
   */
  public getGenerators(): TestDataGenerators {
    return this.generators;
  }

  /**
   * Generate a standard set of test data for achievement testing
   * @param userId User ID to generate data for
   * @param options Configuration options
   */
  public async generateStandardTestData(
    userId: string,
    options: {
      includeWorkouts?: boolean;
      includeStreaks?: boolean;
      includePRs?: boolean;
      includeClasses?: boolean;
      includeActivities?: boolean;
      silent?: boolean;
    } = {}
  ): Promise<{ success: boolean; error?: string }> {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    try {
      const {
        includeWorkouts = true,
        includeStreaks = true,
        includePRs = true,
        includeClasses = true,
        includeActivities = true,
        silent = false
      } = options;

      // Get sample exercise IDs
      const { data: exercises } = await supabase
        .from('exercises')
        .select('id, type')
        .limit(10);

      if (!exercises || exercises.length === 0) {
        return { success: false, error: 'No exercises found in database' };
      }

      const strengthExercises = exercises
        .filter(e => ['strength', 'weightlifting', 'powerlifting'].includes(e.type))
        .map(e => e.id);

      const cardioExercises = exercises
        .filter(e => ['cardio', 'running', 'cycling'].includes(e.type))
        .map(e => e.id);

      if (!silent) {
        toast.info('Generating test data...', {
          description: 'This may take a moment'
        });
      }

      // Generate workouts if requested
      if (includeWorkouts) {
        await this.generators.workout.generateWorkoutSeries(userId, {
          count: 5,
          startDate: new Date(new Date().setDate(new Date().getDate() - 15)),
          consecutive: false,
          randomizeWorkouts: true,
          testDataTag: 'standard-test-data',
          silent: true
        });
      }

      // Generate streak if requested
      if (includeStreaks) {
        await this.generators.streak.generateStreak(userId, 3, {
          startDate: new Date(new Date().setDate(new Date().getDate() - 3)),
          testDataTag: 'standard-test-data',
          silent: true
        });
      }

      // Generate PRs if requested
      if (includePRs && strengthExercises.length > 0) {
        await this.generators.pr.generatePRsForMultipleExercises(userId, {
          exerciseIds: strengthExercises.slice(0, Math.min(3, strengthExercises.length)),
          withProgression: true,
          progressionOptions: {
            steps: 3,
            progressionType: 'linear'
          },
          testDataTag: 'standard-test-data',
          silent: true
        });
      }

      // Generate class changes if requested
      if (includeClasses) {
        await this.generators.class.simulateClassChangeHistory(userId, {
          sequence: [CharacterClass.GUERREIRO, CharacterClass.MONGE, CharacterClass.NINJA],
          daysBetweenChanges: 20,
          bypassCooldown: true,
          testDataTag: 'standard-test-data',
          silent: true
        });
      }

      // Generate activities if requested
      if (includeActivities) {
        await this.generators.activity.generateActivityMix(userId, {
          count: 3,
          startDate: new Date(new Date().setDate(new Date().getDate() - 10)),
          includePowerDays: true,
          testDataTag: 'standard-test-data',
          silent: true
        });
      }

      if (!silent) {
        toast.success('Test data generated', {
          description: 'Standard test data has been created for achievement testing'
        });
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error generating standard test data';
      if (!options.silent) {
        toast.error('Failed to generate standard test data', {
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
   * Clean up all test data for a user
   * @param userId User ID to clean up data for
   * @param options Cleanup options
   */
  public async cleanupAllTestData(
    userId: string,
    options: {
      silent?: boolean;
      testDataTag?: string;
    } = {}
  ): Promise<{ success: boolean; error?: string }> {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    try {
      const {
        silent = false,
        testDataTag = 'standard-test-data'
      } = options;

      if (!silent) {
        toast.info('Cleaning up test data...', {
          description: 'This may take a moment'
        });
      }

      // Clean up workouts
      await this.generators.workout.cleanupGeneratedWorkouts(userId, {
        testDataTag,
        silent: true
      });

      // Clean up PRs
      await this.generators.pr.cleanupGeneratedPRs(userId, {
        testDataTag,
        silent: true
      });

      // Clean up activities
      await this.generators.activity.cleanupActivityData(userId, {
        testDataTag,
        silent: true
      });

      // Reset class data
      await this.generators.class.cleanupClassData(userId, {
        silent: true
      });

      if (!silent) {
        toast.success('Test data cleaned up', {
          description: 'All test data has been removed'
        });
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error cleaning up test data';
      if (!options.silent) {
        toast.error('Failed to clean up test data', {
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

// Export a singleton instance
export const testDataGenerator = TestDataGeneratorService.getInstance();

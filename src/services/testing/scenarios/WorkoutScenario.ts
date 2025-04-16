
import { BaseScenario, ScenarioOptions, ScenarioResult } from './index';
import { supabase } from '@/integrations/supabase/client';
import { createTestDataGenerators } from '../generators';

export interface WorkoutScenarioOptions extends ScenarioOptions {
  workoutCount: number;
  achievementsToCheck: string[];
}

export class WorkoutScenario extends BaseScenario {
  private dataGenerators = createTestDataGenerators();
  
  constructor() {
    super(
      'workout-scenario',
      'Workout Achievement Tester',
      'Tests achievements related to workout completion and exercise variety',
      ['workout', 'exercise', 'achievements'],
      ['primeiro_treino', 'trio_na_semana', 'embalo_fitness']
    );
  }
  
  getConfigurationOptions(): Record<string, any> {
    const baseOptions = super.getConfigurationOptions();
    
    return {
      ...baseOptions,
      workoutCount: {
        type: 'number',
        label: 'Number of Workouts',
        default: 3,
        min: 1,
        max: 10,
        description: 'How many workouts to create'
      },
      achievementsToCheck: {
        type: 'multiselect',
        label: 'Achievements to Check',
        options: ['primeiro_treino', 'trio_na_semana', 'embalo_fitness'],
        default: ['primeiro_treino', 'trio_na_semana'],
        description: 'Which achievements to check for during the scenario'
      }
    };
  }
  
  async execute(userId: string, options?: ScenarioOptions): Promise<ScenarioResult> {
    this.startTime = performance.now();
    this.actions = [];
    this.achievementsUnlocked = [];
    
    try {
      const mergedOptions: Required<WorkoutScenarioOptions> = {
        speed: options?.speed || 'normal',
        silent: options?.silent || false,
        autoCleanup: options?.autoCleanup !== false,
        workoutCount: options?.workoutCount || 3,
        achievementsToCheck: options?.achievementsToCheck || ['primeiro_treino', 'trio_na_semana'],
        testDataTag: options?.testDataTag || 'test-data'
      };
      
      // Log start of scenario
      this.logAction('START_SCENARIO', `Starting workout scenario with ${mergedOptions.workoutCount} workouts`);
      
      // Create workouts
      for (let i = 0; i < mergedOptions.workoutCount; i++) {
        this.logAction('CREATE_WORKOUT', `Creating workout ${i + 1} of ${mergedOptions.workoutCount}`);
        
        // Use the workout generator to create a workout
        const result = await this.dataGenerators.workout.createWorkout(userId, {
          isTestData: true,
          testDataTag: mergedOptions.testDataTag,
          silent: mergedOptions.silent,
          exerciseCount: 3
        });
        
        if (!result.success) {
          this.logAction('ERROR', `Failed to create workout: ${result.error}`, false);
          return this.createResult(false, `Failed to create workout: ${result.error}`);
        }
        
        // Add delay between workouts based on speed
        await this.delayBySpeed(mergedOptions.speed);
      }
      
      // Check for achievement unlocks
      this.logAction('CHECK_ACHIEVEMENTS', `Checking for achievements: ${mergedOptions.achievementsToCheck.join(', ')}`);
      
      const unlockedAchievements = await this.checkAchievementUnlock(userId, mergedOptions.achievementsToCheck);
      
      if (unlockedAchievements.length > 0) {
        this.achievementsUnlocked = unlockedAchievements;
        this.logAction('ACHIEVEMENTS_UNLOCKED', `Unlocked ${unlockedAchievements.length} achievements`, true);
      } else {
        this.logAction('NO_ACHIEVEMENTS', 'No achievements were unlocked', false);
      }
      
      // Success result
      return this.createResult(true, `Created ${mergedOptions.workoutCount} workouts and unlocked ${unlockedAchievements.length} achievements`);
    } catch (error) {
      // Log error and return failure
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logAction('ERROR', errorMessage, false, errorMessage);
      return this.createResult(false, errorMessage);
    }
  }
  
  async cleanup(): Promise<boolean> {
    try {
      await this.dataGenerators.workout.cleanup(this.userId);
      return true;
    } catch (error) {
      console.error('Error cleaning up workout scenario:', error);
      return false;
    }
  }
}

// Register scenario with the runner
export const workoutScenario = new WorkoutScenario();

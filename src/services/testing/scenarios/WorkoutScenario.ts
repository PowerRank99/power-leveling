
import { BaseScenario, ScenarioOptions, ScenarioResult } from './index';

export interface WorkoutScenarioOptions extends ScenarioOptions {
  workoutCount: number;
  achievementsToCheck: string[];
}

export class WorkoutScenario extends BaseScenario {
  constructor() {
    super(
      'workout-scenario',
      'Workout Achievement Tester',
      'Tests achievements related to workout completion and exercise variety',
      ['workout', 'exercise', 'achievements']
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
        testDataTag: 'test-data'
      };
      
      // Log start of scenario
      this.logAction('START_SCENARIO', `Starting workout scenario with ${mergedOptions.workoutCount} workouts`);
      
      // Add implementation here
      
      // Success result
      return this.createResult(true);
    } catch (error) {
      // Log error and return failure
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logAction('ERROR', errorMessage, false, errorMessage);
      return this.createResult(false, errorMessage);
    }
  }
}

// Register scenario with the runner
export const workoutScenario = new WorkoutScenario();

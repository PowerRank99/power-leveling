/**
 * Power User Scenario
 * 
 * This scenario simulates a highly active user who regularly
 * trains and sets new personal records, focusing on mid to
 * high-tier achievements.
 */
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';
import { StandardizedAchievementService } from '@/services/rpg/achievements/StandardizedAchievementService';
import { supabase } from '@/integrations/supabase/client';
import { WorkoutType } from '../generators/WorkoutGenerator';
import { PRProgressionOptions } from '../generators/PRGenerator';
import { CharacterClass } from '../generators/ClassGenerator';
import { BaseScenario, ScenarioOptions, ScenarioResult, scenarioRunner } from './index';

/**
 * Power User Scenario configuration options
 */
export interface PowerUserScenarioOptions extends ScenarioOptions {
  /** How many workouts to simulate (default: 25) */
  workoutCount?: number;
  /** How many different exercises to set PRs for (default: 5) */
  prExerciseCount?: number;
  /** How many PRs per exercise (default: 3) */
  prsPerExercise?: number;
  /** Which class to simulate (default: Guerreiro) */
  characterClass?: CharacterClass;
  /** Difficulty level 1-3: easy, medium, hard (default: 2) */
  difficultyLevel?: 1 | 2 | 3;
}

/**
 * Simulates a power user's journey through the app,
 * focusing on mid to high-tier achievements
 */
export class PowerUserScenario extends BaseScenario {
  private totalActions: number = 0;
  private static readonly TEST_DATA_TAG = 'power-user-scenario';

  constructor() {
    super(
      'power-user-scenario',
      'Power User Journey',
      'Simulates a highly active user with many workouts and PRs targeting mid to high-tier achievements'
    );
  }

  /**
   * Get all achievements that should be unlocked by this scenario
   */
  public getRequiredAchievements(): string[] {
    return [
      // Workout count achievements
      'primeiro-treino',    // First workout
      'trio-na-semana',     // 3 workouts in a week
      'embalo-fitness',     // 7 total workouts
      '10-workouts',        // 10 workouts
      '25-workouts',        // 25 workouts
      
      // PR achievements
      'pr-first',           // First PR
      'pr-5',               // 5 PRs
      'pr-10',              // 10 PRs
      
      // XP achievements
      'xp-1000',            // 1000 XP
      
      // Level achievements
      'level-10',           // Level 10
      
      // Class-specific achievements may vary
    ];
  }

  /**
   * Get estimated execution time in milliseconds
   */
  public getEstimatedDuration(): number {
    return 30000; // 30 seconds
  }

  /**
   * Configure the difficulty level
   * This adjusts how many achievements to target
   */
  public configureDifficulty(level: 1 | 2 | 3): PowerUserScenarioOptions {
    const options: PowerUserScenarioOptions = {};
    
    switch (level) {
      case 1: // Easy
        options.workoutCount = 25;
        options.prExerciseCount = 3;
        options.prsPerExercise = 2;
        break;
      case 2: // Medium
        options.workoutCount = 50;
        options.prExerciseCount = 5;
        options.prsPerExercise = 3;
        break;
      case 3: // Hard
        options.workoutCount = 100;
        options.prExerciseCount = 10;
        options.prsPerExercise = 5;
        break;
    }
    
    return options;
  }

  /**
   * Get the total number of actions for progress tracking
   */
  protected getTotalActions(): number {
    return this.totalActions;
  }

  /**
   * Get configuration options specific to this scenario
   */
  public getConfigurationOptions(): Record<string, any> {
    return {
      workoutCount: {
        type: 'number',
        default: 25,
        min: 10,
        max: 200,
        label: 'Number of Workouts',
        description: 'How many workouts to generate'
      },
      prExerciseCount: {
        type: 'number',
        default: 5,
        min: 1,
        max: 20,
        label: 'PR Exercise Count',
        description: 'How many different exercises to set PRs for'
      },
      prsPerExercise: {
        type: 'number',
        default: 3,
        min: 1,
        max: 10,
        label: 'PRs per Exercise',
        description: 'How many PRs to generate for each exercise'
      },
      characterClass: {
        type: 'select',
        default: CharacterClass.GUERREIRO,
        options: Object.values(CharacterClass),
        label: 'Character Class',
        description: 'Which class to use for testing'
      },
      difficultyLevel: {
        type: 'select',
        default: 2,
        options: [
          { value: 1, label: 'Easy' },
          { value: 2, label: 'Medium' },
          { value: 3, label: 'Hard' }
        ],
        label: 'Difficulty Level',
        description: 'How challenging the scenario should be'
      }
    };
  }

  /**
   * Run the scenario
   */
  public async run(userId: string, options?: PowerUserScenarioOptions): Promise<ScenarioResult> {
    if (!userId) {
      return this.createResult(false, 'User ID is required');
    }

    this.startTime = Date.now();
    this.actions = [];
    this.achievementsUnlocked = [];

    // Configure options
    let config: Required<PowerUserScenarioOptions>;
    
    if (options?.difficultyLevel) {
      // Apply preset difficulty settings
      const difficultyOptions = this.configureDifficulty(options.difficultyLevel);
      config = {
        workoutCount: options.workoutCount || difficultyOptions.workoutCount || 25,
        prExerciseCount: options.prExerciseCount || difficultyOptions.prExerciseCount || 5,
        prsPerExercise: options.prsPerExercise || difficultyOptions.prsPerExercise || 3,
        characterClass: options.characterClass || CharacterClass.GUERREIRO,
        difficultyLevel: options.difficultyLevel,
        silent: options?.silent || false,
        speed: options?.speed || 0.5,
        autoCleanup: options?.autoCleanup || false,
        testDataTag: options?.testDataTag || PowerUserScenario.TEST_DATA_TAG
      };
    } else {
      // Use provided options or defaults
      config = {
        workoutCount: options?.workoutCount || 25,
        prExerciseCount: options?.prExerciseCount || 5,
        prsPerExercise: options?.prsPerExercise || 3,
        characterClass: options?.characterClass || CharacterClass.GUERREIRO,
        difficultyLevel: 2,
        silent: options?.silent || false,
        speed: options?.speed || 0.5,
        autoCleanup: options?.autoCleanup || false,
        testDataTag: options?.testDataTag || PowerUserScenario.TEST_DATA_TAG
      };
    }

    // Calculate total actions for progress tracking
    this.totalActions = 5 + // Setup actions
      1 + // Class selection
      1 + // Workout series generation
      1 + // PR generation
      1 + // XP checking
      1 + // Achievement checking
      1; // Finalization

    try {
      // Set character class
      this.logAction('SET_CLASS', `Setting character class to ${config.characterClass}`);
      await this.dataGenerator.getGenerators().class.simulateClassSelection(
        userId, 
        config.characterClass, 
        { bypassCooldown: true, silent: config.silent }
      );
      await this.delayBySpeed(1000, options);
      
      // Generate workout series
      this.logAction('GENERATE_WORKOUTS', `Generating ${config.workoutCount} workouts`);
      await this.dataGenerator.getGenerators().workout.generateWorkoutSeries(userId, {
        count: config.workoutCount,
        startDate: new Date(new Date().setDate(new Date().getDate() - 60)),
        consecutive: false,
        randomizeWorkouts: true,
        workoutType: WorkoutType.MIXED,
        testDataTag: config.testDataTag,
        silent: config.silent
      });
      await this.delayBySpeed(3000, options);
      
      // Generate personal records
      this.logAction('GENERATE_PRS', `Generating PRs for ${config.prExerciseCount} exercises`);
      
      // Get sample exercise IDs
      const { data: exercises } = await supabase
        .from('exercises')
        .select('id, type')
        .limit(config.prExerciseCount);
      
      if (!exercises || exercises.length === 0) {
        return this.createResult(false, 'No exercises found in database');
      }
      
      const exerciseIds = exercises.map(e => e.id);
      
      // Configure PR progression
      const progressionOptions: PRProgressionOptions = {
        steps: config.prsPerExercise,
        progressionType: 'linear',
        startWeight: 50
      };
      
      await this.dataGenerator.getGenerators().pr.generatePRsForMultipleExercises(userId, {
        exerciseIds,
        withProgression: true,
        progressionOptions,
        testDataTag: config.testDataTag,
        silent: config.silent
      });
      await this.delayBySpeed(2000, options);
      
      // Add some manual workouts for variety
      this.logAction('GENERATE_MANUAL_WORKOUTS', 'Adding manual workouts for variety');
      await this.dataGenerator.getGenerators().activity.generateActivityMix(userId, {
        count: 3,
        includePowerDays: true,
        testDataTag: config.testDataTag,
        silent: config.silent
      });
      await this.delayBySpeed(1500, options);
      
      // Check achievements
      this.logAction('CHECK_ACHIEVEMENTS', 'Checking for unlocked achievements');
      
      // Use the StandardizedAchievementService to check for achievements
      const workoutAchievements = await StandardizedAchievementService.checkWorkoutAchievements(userId);
      const recordAchievements = await StandardizedAchievementService.checkStreakAchievements(userId);
      
      if (workoutAchievements.success && workoutAchievements.data) {
        this.achievementsUnlocked.push(...workoutAchievements.data);
      }
      
      if (recordAchievements.success && recordAchievements.data) {
        this.achievementsUnlocked.push(...recordAchievements.data);
      }
      
      // Get achievement names for better logging
      const achievementNames: string[] = [];
      for (const id of this.achievementsUnlocked) {
        try {
          // Access the asyncGetAchievementName method that's patched onto this object
          const name = await (this as any).asyncGetAchievementName(id);
          achievementNames.push(name);
        } catch (error) {
          console.error('Error getting achievement name:', error);
          achievementNames.push(id); // Fallback to ID if name can't be retrieved
        }
      }
      
      this.logAction('ACHIEVEMENTS_UNLOCKED', `Unlocked ${achievementNames.length} achievements`, { achievements: achievementNames });
      
      return this.createResult(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logAction('ERROR', errorMessage, {}, false, errorMessage);
      return this.createResult(false, errorMessage);
    }
  }

  /**
   * Clean up all test data generated by this scenario
   */
  public async cleanup(userId: string, options?: { silent?: boolean }): Promise<boolean> {
    try {
      await this.dataGenerator.cleanupAllTestData(userId, {
        silent: options?.silent,
        testDataTag: PowerUserScenario.TEST_DATA_TAG
      });
      
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Register the scenario with the scenario runner
scenarioRunner.registerScenario(new PowerUserScenario());

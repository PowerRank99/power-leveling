/**
 * Class Progression Scenario
 * 
 * This scenario simulates progress with different character classes,
 * focusing on class-specific achievements and passive bonuses.
 */
import { supabase } from '@/integrations/supabase/client';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';
import { StandardizedAchievementService } from '@/services/rpg/achievements/StandardizedAchievementService';
import { WorkoutType } from '../generators/WorkoutGenerator';
import { CharacterClass } from '../generators/ClassGenerator';
import { ActivityType } from '../generators/ActivityGenerator';
import { BaseScenario, ScenarioOptions, ScenarioResult, scenarioRunner } from './index';

/**
 * Class Progression Scenario configuration options
 */
export interface ClassProgressionScenarioOptions extends ScenarioOptions {
  /** Which class to test (default: Guerreiro) */
  characterClass?: CharacterClass;
  /** Number of workouts to generate (default: 10) */
  workoutCount?: number;
  /** Whether to test passive abilities (default: true) */
  testPassives?: boolean;
  /** Whether to test class-specific achievements (default: true) */
  testAchievements?: boolean;
}

/**
 * Simulates progress with different character classes,
 * focusing on class-specific achievements and passive bonuses
 */
export class ClassProgressionScenario extends BaseScenario {
  private totalActions: number = 0;
  private static readonly TEST_DATA_TAG = 'class-progression-scenario';

  constructor() {
    super(
      'class-progression-scenario',
      'Class Progression Journey',
      'Simulates progress with different character classes, focusing on class-specific achievements and passive bonuses'
    );
  }

  /**
   * Get all achievements that should be unlocked by this scenario
   */
  public getRequiredAchievements(): string[] {
    return [
      'primeiro-treino',    // First workout
      'heroi-em-ascensao',  // Reach level 5
      // Class-specific achievements may vary
    ];
  }

  /**
   * Get estimated execution time in milliseconds
   */
  public getEstimatedDuration(): number {
    return 25000; // 25 seconds
  }

  /**
   * Get the total number of actions for progress tracking
   */
  protected getTotalActions(): number {
    return this.totalActions;
  }

  /**
   * Configure class-specific options
   */
  public configureClass(className: CharacterClass): ClassProgressionScenarioOptions {
    return {
      characterClass: className
    };
  }

  /**
   * Get configuration options specific to this scenario
   */
  public getConfigurationOptions(): Record<string, any> {
    return {
      characterClass: {
        type: 'select',
        default: CharacterClass.GUERREIRO,
        options: Object.values(CharacterClass),
        label: 'Character Class',
        description: 'Which class to use for testing'
      },
      workoutCount: {
        type: 'number',
        default: 10,
        min: 5,
        max: 50,
        label: 'Number of Workouts',
        description: 'How many workouts to generate'
      },
      testPassives: {
        type: 'boolean',
        default: true,
        label: 'Test Class Passives',
        description: 'Whether to test class passive abilities'
      },
      testAchievements: {
        type: 'boolean',
        default: true,
        label: 'Test Class Achievements',
        description: 'Whether to test class-specific achievements'
      }
    };
  }

  /**
   * Run the scenario
   */
  public async run(userId: string, options?: ClassProgressionScenarioOptions): Promise<ScenarioResult> {
    if (!userId) {
      return this.createResult(false, 'User ID is required');
    }

    this.startTime = Date.now();
    this.actions = [];
    this.achievementsUnlocked = [];

    // Configure options
    const config: Required<ClassProgressionScenarioOptions> = {
      characterClass: options?.characterClass || CharacterClass.GUERREIRO,
      workoutCount: options?.workoutCount || 10,
      testPassives: options?.testPassives !== false,
      testAchievements: options?.testAchievements !== false,
      silent: options?.silent || false,
      speed: options?.speed || 0.5,
      autoCleanup: options?.autoCleanup || false,
      testDataTag: options?.testDataTag || ClassProgressionScenario.TEST_DATA_TAG
    };

    // Calculate total actions for progress tracking
    this.totalActions = 5 + // Setup actions
      1 + // Class selection
      1 + // Workout series generation
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
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
        consecutive: false,
        randomizeWorkouts: true,
        workoutType: WorkoutType.MIXED,
        testDataTag: config.testDataTag,
        silent: config.silent
      });
      await this.delayBySpeed(3000, options);
      
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
      const achievementNames = this.achievementsUnlocked.map(id => {
        const achievement = AchievementUtils.getAchievementById(id);
        return achievement ? achievement.name : id;
      });
      
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
        testDataTag: ClassProgressionScenario.TEST_DATA_TAG
      });
      
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Register the scenario with the scenario runner
scenarioRunner.registerScenario(new ClassProgressionScenario());

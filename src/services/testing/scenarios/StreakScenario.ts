/**
 * Streak Scenario
 * 
 * This scenario focuses on testing streak-based achievements
 * by simulating consistent daily workouts and streak breaks.
 */
import { BaseScenario, ScenarioOptions, ScenarioResult } from './index';
import { WorkoutType } from '../generators/WorkoutGenerator';
import { CharacterClass } from '../generators/ClassGenerator';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';
import { StandardizedAchievementService } from '@/services/rpg/achievements/StandardizedAchievementService';

/**
 * Streak Scenario configuration options
 */
export interface StreakScenarioOptions extends ScenarioOptions {
  /** Maximum streak length to test (default: 7) */
  maxStreakDays?: number;
  /** Whether to simulate streak breaks (default: true) */
  includeStreakBreaks?: boolean;
  /** Pattern of streak days (1=workout, 0=no workout) */
  streakPattern?: number[];
  /** Whether to test class passives (default: true) */
  testClassPassives?: boolean;
  /** Character class to test passives (default: Bruxo) */
  characterClass?: CharacterClass.BRUXO | CharacterClass.MONGE;
}

/**
 * Simulates streak-based scenarios to test achievement triggers
 * and streak mechanics
 */
export class StreakScenario extends BaseScenario {
  private totalActions: number = 0;
  private static readonly TEST_DATA_TAG = 'streak-scenario';

  constructor() {
    super(
      'streak-scenario',
      'Streak Journey',
      'Simulates streak building, breaking, and recovery to test streak-based achievements'
    );
  }

  /**
   * Get all achievements that should be unlocked by this scenario
   */
  public getRequiredAchievements(): string[] {
    return [
      'trinca-poderosa',    // 3 consecutive days
      'streak-7-days'       // 7-day streak
      // Other streak achievements based on configuration
    ];
  }

  /**
   * Get estimated execution time in milliseconds
   */
  public getEstimatedDuration(): number {
    return 20000; // 20 seconds
  }

  /**
   * Get the total number of actions for progress tracking
   */
  protected getTotalActions(): number {
    return this.totalActions;
  }

  /**
   * Configure streak length options
   */
  public configureStreakLength(days: number): StreakScenarioOptions {
    return {
      maxStreakDays: days
    };
  }

  /**
   * Configure streak break pattern
   * 1 = workout day, 0 = rest day (streak break)
   */
  public simulateStreakBreaks(pattern: number[]): StreakScenarioOptions {
    return {
      streakPattern: pattern
    };
  }

  /**
   * Configure class passive testing
   */
  public testClassPassives(className: CharacterClass.BRUXO | CharacterClass.MONGE): StreakScenarioOptions {
    return {
      testClassPassives: true,
      characterClass: className
    };
  }

  /**
   * Get configuration options specific to this scenario
   */
  public getConfigurationOptions(): Record<string, any> {
    return {
      maxStreakDays: {
        type: 'number',
        default: 7,
        min: 3,
        max: 30,
        label: 'Max Streak Days',
        description: 'Maximum streak length to test'
      },
      includeStreakBreaks: {
        type: 'boolean',
        default: true,
        label: 'Include Streak Breaks',
        description: 'Whether to test streak breaking and recovery'
      },
      streakPattern: {
        type: 'string',
        default: '1111011111',
        label: 'Streak Pattern',
        description: 'Pattern of streak days (1=workout, 0=no workout)'
      },
      testClassPassives: {
        type: 'boolean',
        default: true,
        label: 'Test Class Passives',
        description: 'Whether to test class passive abilities related to streaks'
      },
      characterClass: {
        type: 'select',
        default: CharacterClass.BRUXO,
        options: [CharacterClass.BRUXO, CharacterClass.MONGE],
        label: 'Character Class',
        description: 'Which class passive to test (Bruxo or Monge)'
      }
    };
  }

  /**
   * Run the scenario
   */
  public async run(userId: string, options?: StreakScenarioOptions): Promise<ScenarioResult> {
    if (!userId) {
      return this.createResult(false, 'User ID is required');
    }

    this.startTime = Date.now();
    this.actions = [];
    this.achievementsUnlocked = [];

    // Configure options
    const config: Required<StreakScenarioOptions> = {
      maxStreakDays: options?.maxStreakDays || 7,
      includeStreakBreaks: options?.includeStreakBreaks !== false,
      streakPattern: options?.streakPattern || [],
      testClassPassives: options?.testClassPassives !== false,
      characterClass: options?.characterClass || CharacterClass.BRUXO,
      silent: options?.silent || false,
      speed: options?.speed || 0.5,
      autoCleanup: options?.autoCleanup || false,
      testDataTag: options?.testDataTag || StreakScenario.TEST_DATA_TAG
    };

    // Parse streak pattern from string if provided
    let pattern: number[] = [];
    if (typeof options?.streakPattern === 'string') {
      pattern = options.streakPattern.split('').map(c => c === '1' ? 1 : 0);
    } else if (Array.isArray(config.streakPattern) && config.streakPattern.length > 0) {
      pattern = config.streakPattern;
    } else if (config.includeStreakBreaks) {
      // Default pattern with a break in the middle
      pattern = Array(config.maxStreakDays + 3).fill(1);
      pattern[Math.floor(pattern.length / 2)] = 0; // Add a streak break in the middle
    } else {
      // Simple continuous streak
      pattern = Array(config.maxStreakDays).fill(1);
    }

    // Calculate total actions for progress tracking
    this.totalActions = 4 + // Setup actions
      (config.testClassPassives ? 1 : 0) + // Class selection
      1 + // Pattern generation
      1 + // Achievement checking
      1; // Finalization

    try {
      // Set character class if testing passives
      if (config.testClassPassives) {
        this.logAction('SET_CLASS', `Setting character class to ${config.characterClass}`);
        await this.dataGenerator.getGenerators().class.simulateClassSelection(
          userId, 
          config.characterClass, 
          { bypassCooldown: true, silent: config.silent }
        );
        await this.delayBySpeed(1000, options);
      }
      
      // Generate streak pattern
      this.logAction('GENERATE_STREAK', `Generating streak pattern with ${pattern.length} days`);
      
      // Convert pattern to string for logging
      const patternString = pattern.map(d => d === 1 ? '🏋️' : '❌').join(' ');
      this.logAction('STREAK_PATTERN', `Pattern: ${patternString}`, { pattern });
      
      await this.dataGenerator.getGenerators().streak.generateStreakPattern(userId, {
        pattern,
        startDate: new Date(new Date().setDate(new Date().getDate() - pattern.length)),
        workoutType: WorkoutType.MIXED,
        updateProfileStreak: true,
        isTestData: true,
        testDataTag: config.testDataTag,
        silent: config.silent
      });
      await this.delayBySpeed(2000, options);
      
      // Check streak achievements
      this.logAction('CHECK_ACHIEVEMENTS', 'Checking for streak achievements');
      
      // Use the StandardizedAchievementService to check for achievements
      const streakAchievements = await StandardizedAchievementService.checkStreakAchievements(userId);
      
      if (streakAchievements.success && streakAchievements.data) {
        this.achievementsUnlocked.push(...streakAchievements.data);
      }
      
      // If testing class passives, check for their effects
      if (config.testClassPassives) {
        if (config.characterClass === CharacterClass.BRUXO) {
          this.logAction('TEST_PASSIVE', 'Testing Bruxo passive: Pijama Arcano (streak preservation)');
          
          // Simulate a streak break and check if passive works
          await this.dataGenerator.getGenerators().streak.simulateStreakBreak(userId, {
            daysAgo: 1,
            // Bruxo passive should preserve most of the streak
            newStreakValue: Math.max(0, pattern.filter(p => p === 1).length - 1),
            silent: config.silent
          });
          
          await this.delayBySpeed(1000, options);
        } else if (config.characterClass === CharacterClass.MONGE) {
          this.logAction('TEST_PASSIVE', 'Testing Monge passive: Discípulo do Algoritmo (bonus streak XP)');
          // Add a check here for the Monge passive effect on XP
        }
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
      // Clean up streak-related data
      await this.dataGenerator.getGenerators().streak.cleanupStreakData(userId, {
        silent: options?.silent,
        testDataTag: StreakScenario.TEST_DATA_TAG,
        resetStreak: true
      });
      
      // Clean up class data if class passives were tested
      await this.dataGenerator.getGenerators().class.cleanupClassData(userId, {
        silent: options?.silent,
        resetToDefault: true
      });
      
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Register the scenario with the scenario runner
import { scenarioRunner } from './index';
scenarioRunner.registerScenario(new StreakScenario());

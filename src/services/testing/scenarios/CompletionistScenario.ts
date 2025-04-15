
/**
 * Completionist Scenario
 * 
 * This scenario attempts to unlock all achievements systematically,
 * from basic to advanced, optimizing the user journey.
 */
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';
import { StandardizedAchievementService } from '@/services/rpg/achievements/StandardizedAchievementService';
import { WorkoutType } from '../generators/WorkoutGenerator';
import { CharacterClass } from '../generators/ClassGenerator';
import { AchievementRank, AchievementCategory, Achievement } from '@/types/achievementTypes';
import { BaseScenario, ScenarioOptions, ScenarioResult, scenarioRunner } from './index';
import { AsyncAchievementAdapter } from '@/services/rpg/achievements/progress/AsyncAchievementAdapter';
import { ScenarioAchievementAdapter } from '@/services/rpg/achievements/progress/ScenarioAchievementAdapter';

/**
 * Completionist Scenario configuration options
 */
export interface CompletionistScenarioOptions extends ScenarioOptions {
  /** Percentage of achievements to target (default: 100) */
  completionTarget?: number;
  /** Whether to optimize the achievement order (default: true) */
  optimizeOrder?: boolean;
  /** Maximum rank to target (default: S) */
  maxRank?: AchievementRank;
  /** How many days of history to simulate (default: 90) */
  simulatedDays?: number;
}

/**
 * Attempts to unlock all achievements systematically
 */
export class CompletionistScenario extends BaseScenario {
  private totalActions: number = 0;
  private static readonly TEST_DATA_TAG = 'completionist-scenario';
  private achievementProgress: Record<string, { current: number; target: number; complete: boolean }> = {};

  constructor() {
    super(
      'completionist-scenario',
      'Completionist Journey',
      'Attempts to unlock all achievements systematically, from basic to advanced'
    );
  }

  /**
   * Get all achievements that should be unlocked by this scenario
   */
  public async getRequiredAchievements(): Promise<string[]> {
    // This scenario targets a large number of achievements
    // Get achievements filtered by rank if specified
    const achievements = await AchievementUtils.getAllAchievements();
    return achievements.map(a => a.id);
  }

  /**
   * Get estimated execution time in milliseconds
   */
  public getEstimatedDuration(): number {
    return 120000; // 2 minutes
  }

  /**
   * Get the total number of actions for progress tracking
   */
  protected getTotalActions(): number {
    return this.totalActions;
  }

  /**
   * Configure completion target percentage
   */
  public configureCompletionTarget(percent: number): CompletionistScenarioOptions {
    return {
      completionTarget: Math.max(1, Math.min(100, percent))
    };
  }

  /**
   * Calculate optimal achievement sequence
   */
  private async optimizeAchievementOrder(): Promise<string[]> {
    // Get all achievements
    const achievements = await AchievementUtils.getAllAchievements();
    
    // Sort by rank (easiest first)
    const rankOrder: Record<AchievementRank, number> = {
      'E': 1,
      'D': 2,
      'C': 3,
      'B': 4,
      'A': 5,
      'S': 6,
      'Unranked': 0
    };
    
    return [...achievements]
      .sort((a, b) => {
        // First sort by rank
        const rankDiff = rankOrder[a.rank as AchievementRank] - rankOrder[b.rank as AchievementRank];
        if (rankDiff !== 0) return rankDiff;
        
        // Then sort by requirement value (smaller first)
        return (a.requirements?.value || 0) - (b.requirements?.value || 0);
      })
      .map(a => a.id);
  }

  /**
   * Track achievement progress
   */
  private trackAchievementProgress(achievementId: string, current: number, target: number, complete: boolean): void {
    this.achievementProgress[achievementId] = { current, target, complete };
    
    // Update achievements unlocked list if complete
    if (complete && !this.achievementsUnlocked.includes(achievementId)) {
      this.achievementsUnlocked.push(achievementId);
    }
  }

  /**
   * Get configuration options specific to this scenario
   */
  public getConfigurationOptions(): Record<string, any> {
    return {
      completionTarget: {
        type: 'number',
        default: 100,
        min: 10,
        max: 100,
        label: 'Completion Target',
        description: 'Percentage of achievements to target'
      },
      optimizeOrder: {
        type: 'boolean',
        default: true,
        label: 'Optimize Order',
        description: 'Whether to optimize the achievement unlock order'
      },
      maxRank: {
        type: 'select',
        default: AchievementRank.S,
        options: Object.values(AchievementRank),
        label: 'Maximum Rank',
        description: 'Highest rank of achievements to target'
      },
      simulatedDays: {
        type: 'number',
        default: 90,
        min: 30,
        max: 365,
        label: 'Simulated Days',
        description: 'How many days of history to simulate'
      }
    };
  }

  /**
   * Run the scenario
   */
  public async run(userId: string, options?: CompletionistScenarioOptions): Promise<ScenarioResult> {
    if (!userId) {
      return this.createResult(false, 'User ID is required');
    }

    this.startTime = Date.now();
    this.actions = [];
    this.achievementsUnlocked = [];
    this.achievementProgress = {};

    // Configure options
    const config: Required<CompletionistScenarioOptions> = {
      completionTarget: options?.completionTarget || 100,
      optimizeOrder: options?.optimizeOrder !== false,
      maxRank: options?.maxRank || AchievementRank.S,
      simulatedDays: options?.simulatedDays || 90,
      silent: options?.silent || false,
      speed: options?.speed || 0.5,
      autoCleanup: options?.autoCleanup || false,
      testDataTag: options?.testDataTag || CompletionistScenario.TEST_DATA_TAG
    };

    // Get achievement list - safely await the promise
    let achievementsList: string[] = [];
    const requiredAchievements = await this.getRequiredAchievements();
    achievementsList = requiredAchievements;
    
    // Filter by rank if specified
    const rankOrder: Record<AchievementRank, number> = {
      'E': 1,
      'D': 2,
      'C': 3,
      'B': 4,
      'A': 5,
      'S': 6,
      'Unranked': 0
    };
    
    const allAchievements = await AchievementUtils.getAllAchievements();
    achievementsList = achievementsList.filter(id => {
      const achievement = allAchievements.find(a => a.id === id);
      if (!achievement) return false;
      
      return rankOrder[achievement.rank as AchievementRank] <= rankOrder[config.maxRank];
    });
    
    // Apply completion target
    const targetCount = Math.ceil((achievementsList.length * config.completionTarget) / 100);
    achievementsList = achievementsList.slice(0, targetCount);
    
    // Optimize order if requested
    if (config.optimizeOrder) {
      const optimizedList = await this.optimizeAchievementOrder();
      achievementsList = optimizedList.slice(0, targetCount);
    }

    // Calculate total actions for progress tracking
    this.totalActions = 5 + // Setup actions
      achievementsList.length + // One action per achievement
      5; // Finalization actions

    try {
      this.logAction('PREPARATION', `Targeting ${achievementsList.length} achievements (${config.completionTarget}%)`);
      
      // Generate a full workout history
      this.logAction('WORKOUT_HISTORY', `Generating workout history over ${config.simulatedDays} days`);
      
      // We'll need a large number of workouts
      const workoutCount = Math.min(200, Math.ceil(config.simulatedDays * 0.7)); // ~70% of days
      
      await this.dataGenerator.getGenerators().workout.generateWorkoutSeries(userId, {
        count: workoutCount,
        startDate: new Date(new Date().setDate(new Date().getDate() - config.simulatedDays)),
        consecutive: false,
        randomizeWorkouts: true,
        workoutType: WorkoutType.MIXED,
        testDataTag: config.testDataTag,
        silent: config.silent
      });
      await this.delayBySpeed(3000, options);
      
      // Generate personal records for variety of exercises
      this.logAction('PERSONAL_RECORDS', 'Generating personal records for multiple exercises');
      
      // Get the set of requirements to try to satisfy
      const workoutAchievements = await AchievementUtils.getAchievementsByCategory(AchievementCategory.WORKOUT);
      const prAchievements = await AchievementUtils.getAchievementsByCategory(AchievementCategory.PERSONAL_RECORD);
      const streakAchievements = await AchievementUtils.getAchievementsByCategory(AchievementCategory.STREAK);
      
      // Find the highest PR count requirement
      const highestPrCount = Math.max(
        ...prAchievements.map(a => a.requirements?.value || 0),
        10 // Minimum of 10 PRs
      );
      
      // Generate PRs
      await this.dataGenerator.getGenerators().pr.generatePRsForMultipleExercises(userId, {
        exerciseCount: Math.ceil(highestPrCount / 2), // Each exercise gets ~2 PRs
        withProgression: true,
        progressionOptions: {
          steps: 2,
          progressionType: 'linear'
        },
        testDataTag: config.testDataTag,
        silent: config.silent
      });
      await this.delayBySpeed(2000, options);
      
      // Find the highest streak requirement
      const highestStreakDays = Math.max(
        ...streakAchievements.map(a => a.requirements?.value || 0),
        7 // Minimum of 7 days
      );
      
      // Generate a streak
      this.logAction('GENERATE_STREAK', `Generating a ${highestStreakDays}-day streak`);
      await this.dataGenerator.getGenerators().streak.generateStreak(userId, highestStreakDays, {
        startDate: new Date(new Date().setDate(new Date().getDate() - highestStreakDays)),
        workoutType: WorkoutType.MIXED,
        updateProfileStreak: true,
        testDataTag: config.testDataTag,
        silent: config.silent
      });
      await this.delayBySpeed(2000, options);
      
      // Generate manual workouts
      this.logAction('MANUAL_WORKOUTS', 'Generating manual workouts for variety');
      await this.dataGenerator.getGenerators().activity.generateActivityMix(userId, {
        count: 10,
        includePowerDays: true,
        testDataTag: config.testDataTag,
        silent: config.silent
      });
      await this.delayBySpeed(1500, options);
      
      // Check for unlocked achievements
      this.logAction('CHECK_ACHIEVEMENTS', 'Checking for unlocked achievements');
      
      // Use the StandardizedAchievementService to check for achievement categories
      const workoutResults = await StandardizedAchievementService.checkWorkoutAchievements(userId);
      const streakResults = await StandardizedAchievementService.checkStreakAchievements(userId);
      
      if (workoutResults.success && workoutResults.data) {
        this.achievementsUnlocked.push(...workoutResults.data);
      }
      
      if (streakResults.success && streakResults.data) {
        this.achievementsUnlocked.push(...streakResults.data);
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
      
      // Calculate completion percentage
      const targetAchievements = new Set(achievementsList);
      const unlockedTargets = this.achievementsUnlocked.filter(id => targetAchievements.has(id));
      const completionPercentage = (unlockedTargets.length / targetAchievements.size) * 100;
      
      this.logAction(
        'COMPLETION_SUMMARY', 
        `Unlocked ${unlockedTargets.length}/${targetAchievements.size} target achievements (${completionPercentage.toFixed(1)}%)`,
        { achievements: this.achievementsUnlocked }
      );
      
      // Add a custom result property for the completion percentage
      return {
        ...this.createResult(true),
        completionPercentage,
        targetCount: targetAchievements.size,
        unlockedCount: unlockedTargets.length
      };
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
        testDataTag: CompletionistScenario.TEST_DATA_TAG
      });
      
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Register the scenario with the scenario runner
scenarioRunner.registerScenario(new CompletionistScenario());

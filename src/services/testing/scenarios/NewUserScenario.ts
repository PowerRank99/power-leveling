/**
 * New User Scenario
 * 
 * This scenario simulates a brand new user's journey, focusing on
 * the initial achievements they would earn when starting to use the app.
 */
import { supabase } from '@/integrations/supabase/client';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';
import { StandardizedAchievementService } from '@/services/rpg/achievements/StandardizedAchievementService';
import { WorkoutType } from '../generators/WorkoutGenerator';
import { CharacterClass } from '../generators/ClassGenerator';
import { ActivityType } from '../generators/ActivityGenerator';
import { BaseScenario, ScenarioOptions, ScenarioResult, scenarioRunner } from './index';

/**
 * New User Scenario configuration options
 */
export interface NewUserScenarioOptions extends ScenarioOptions {
  /** Number of workouts to create (default: 7) */
  workoutCount?: number;
  /** Number of consecutive days to train (default: 3) */
  streakDays?: number;
  /** Whether to include manual workout (default: true) */
  includeManualWorkout?: boolean;
  /** Whether to join a guild (default: true) */
  joinGuild?: boolean;
}

/**
 * Simulates a new user's journey through the app,
 * focusing on initial achievements (Rank E)
 */
export class NewUserScenario extends BaseScenario {
  private totalActions: number = 0;
  private static readonly TEST_DATA_TAG = 'new-user-scenario';

  constructor() {
    super(
      'new-user-scenario',
      'New User Journey',
      'Simulates a brand new user completing their first workouts and earning basic achievements'
    );
  }

  /**
   * Get all achievements that should be unlocked by this scenario
   */
  public getRequiredAchievements(): string[] {
    return [
      'primeiro-treino',    // First workout
      'trio-na-semana',     // 3 workouts in a week
      'embalo-fitness',     // 7 total workouts
      'trinca-poderosa',    // 3 consecutive days
      'manual-first',       // First manual workout
      'heroi-em-ascensao',  // Reach level 5
      'first-guild'         // Join first guild
    ];
  }

  /**
   * Get estimated execution time in milliseconds
   */
  public getEstimatedDuration(): number {
    return 15000; // 15 seconds
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
        default: 7,
        min: 1,
        max: 20,
        label: 'Number of Workouts',
        description: 'How many workouts to generate'
      },
      streakDays: {
        type: 'number',
        default: 3,
        min: 1,
        max: 7,
        label: 'Streak Days',
        description: 'Number of consecutive days to train'
      },
      includeManualWorkout: {
        type: 'boolean',
        default: true,
        label: 'Include Manual Workout',
        description: 'Whether to include manual workout'
      },
      joinGuild: {
        type: 'boolean',
        default: true,
        label: 'Join Guild',
        description: 'Whether to join a guild'
      }
    };
  }

  /**
   * Run the scenario
   */
  public async run(userId: string, options?: NewUserScenarioOptions): Promise<ScenarioResult> {
    if (!userId) {
      return this.createResult(false, 'User ID is required');
    }

    this.startTime = Date.now();
    this.actions = [];
    this.achievementsUnlocked = [];

    // Configure options
    const config: Required<NewUserScenarioOptions> = {
      workoutCount: options?.workoutCount || 7,
      streakDays: options?.streakDays || 3,
      includeManualWorkout: options?.includeManualWorkout !== false,
      joinGuild: options?.joinGuild !== false,
      silent: options?.silent || false,
      speed: options?.speed || 0.5,
      autoCleanup: options?.autoCleanup || false,
      testDataTag: options?.testDataTag || NewUserScenario.TEST_DATA_TAG
    };

    // Calculate total actions for progress tracking
    this.totalActions = config.workoutCount + 
      (config.includeManualWorkout ? 1 : 0) + 
      (config.joinGuild ? 1 : 0) + 
      5; // Additional actions for creating routine, checking achievements, etc.

    try {
      // Create a workout routine
      this.logAction('ROUTINE_CREATE', 'Creating workout routine with basic exercises');
      await this.delayBySpeed(1000, options);
      
      // Generate consecutive workouts
      this.logAction('STREAK_START', `Starting a ${config.streakDays}-day streak`);
      await this.dataGenerator.getGenerators().streak.generateStreak(userId, config.streakDays, {
        startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
        workoutType: WorkoutType.STRENGTH,
        updateProfileStreak: true,
        isTestData: true,
        testDataTag: config.testDataTag,
        silent: config.silent
      });
      await this.delayBySpeed(2000, options);
      
      // Generate additional workouts to reach the target count
      if (config.workoutCount > config.streakDays) {
        this.logAction('ADDITIONAL_WORKOUTS', `Generating ${config.workoutCount - config.streakDays} additional workouts`);
        await this.dataGenerator.getGenerators().workout.generateWorkoutSeries(userId, {
          count: config.workoutCount - config.streakDays,
          startDate: new Date(new Date().setDate(new Date().getDate() - 14)),
          consecutive: false,
          randomizeWorkouts: true,
          testDataTag: config.testDataTag,
          silent: config.silent
        });
        await this.delayBySpeed(2000, options);
      }
      
      // Create a manual workout if requested
      if (config.includeManualWorkout) {
        this.logAction('MANUAL_WORKOUT', 'Submitting a manual workout');
        await this.dataGenerator.getGenerators().activity.generateManualWorkout(userId, {
          description: 'Evening run',
          activityType: ActivityType.RUNNING,
          testDataTag: config.testDataTag,
          silent: config.silent
        });
        await this.delayBySpeed(1000, options);
      }
      
      // Join a guild if requested
      if (config.joinGuild) {
        this.logAction('JOIN_GUILD', 'Joining first guild');
        
        // Check if there are existing guilds or create one
        const { data: guilds } = await supabase
          .from('guilds')
          .select('id')
          .limit(1);
        
        let guildId: string | null = null;
        
        if (guilds && guilds.length > 0) {
          guildId = guilds[0].id;
        } else {
          // Create a test guild
          const { data: newGuild } = await supabase
            .from('guilds')
            .insert({
              name: 'Test Guild',
              description: 'A guild created for testing purposes',
              creator_id: userId
            })
            .select('id')
            .single();
          
          if (newGuild) {
            guildId = newGuild.id;
          }
        }
        
        if (guildId) {
          // Join the guild
          await supabase
            .from('guild_members')
            .insert({
              guild_id: guildId,
              user_id: userId,
              role: 'member'
            });
        }
        
        await this.delayBySpeed(1000, options);
      }
      
      // Check achievements
      this.logAction('CHECK_ACHIEVEMENTS', 'Checking for unlocked achievements');
      
      // We'll use the StandardizedAchievementService to check for achievements
      const workoutAchievements = await StandardizedAchievementService.checkWorkoutAchievements(userId);
      const streakAchievements = await StandardizedAchievementService.checkStreakAchievements(userId);
      
      if (workoutAchievements.success && workoutAchievements.data) {
        this.achievementsUnlocked.push(...workoutAchievements.data);
      }
      
      if (streakAchievements.success && streakAchievements.data) {
        this.achievementsUnlocked.push(...streakAchievements.data);
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
        testDataTag: NewUserScenario.TEST_DATA_TAG
      });
      
      // Additional cleanup for guilds if needed
      // This would require additional implementation
      
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Register the scenario with the scenario runner
scenarioRunner.registerScenario(new NewUserScenario());

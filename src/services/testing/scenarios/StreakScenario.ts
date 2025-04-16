
import { BaseScenario, ScenarioOptions, ScenarioResult } from './index';
import { supabase } from '@/integrations/supabase/client';
import { createTestDataGenerators } from '../generators';

export interface StreakScenarioOptions extends ScenarioOptions {
  streakDays: number;
  addGap: boolean;
  includeManualWorkouts: boolean;
}

export class StreakScenario extends BaseScenario {
  private generators = createTestDataGenerators();
  
  constructor() {
    super(
      'streak-scenario',
      'Streak Achievements',
      'Tests streak achievements by simulating workouts over consecutive days',
      ['streak', 'workout', 'achievement']
    );
  }
  
  getConfigurationOptions(): Record<string, any> {
    const baseOptions = super.getConfigurationOptions();
    
    return {
      ...baseOptions,
      streakDays: {
        type: 'number',
        label: 'Streak Days',
        default: 7,
        min: 1,
        max: 30,
        description: 'Number of consecutive days to create streak'
      },
      addGap: {
        type: 'boolean',
        label: 'Add Gap',
        default: false,
        description: 'Add a gap in the streak to test reset behavior'
      },
      includeManualWorkouts: {
        type: 'boolean',
        label: 'Include Manual Workouts',
        default: true,
        description: 'Include manual workouts in the streak'
      }
    };
  }
  
  async execute(userId: string, options?: ScenarioOptions): Promise<ScenarioResult> {
    this.startTime = performance.now();
    this.actions = [];
    this.achievementsUnlocked = [];
    
    try {
      const mergedOptions: Required<StreakScenarioOptions> = {
        speed: options?.speed || 'normal',
        silent: options?.silent || false,
        autoCleanup: options?.autoCleanup !== false,
        streakDays: options?.streakDays || 7,
        addGap: options?.addGap || false,
        includeManualWorkouts: options?.includeManualWorkouts !== false,
        testDataTag: options?.testDataTag || 'test-data'
      };
      
      // Log start of scenario
      this.logAction('START_SCENARIO', `Starting streak scenario with ${mergedOptions.streakDays} days`);
      
      // Get current date as baseline
      const today = new Date();
      
      // Create workouts for streak
      for (let i = 0; i < mergedOptions.streakDays; i++) {
        // Skip a day if adding a gap and at the midpoint
        if (mergedOptions.addGap && i === Math.floor(mergedOptions.streakDays / 2)) {
          this.logAction('ADD_GAP', 'Adding a gap day in the streak to test reset behavior');
          continue;
        }
        
        // Calculate workout date
        const workoutDate = new Date(today);
        workoutDate.setDate(today.getDate() - (mergedOptions.streakDays - 1) + i);
        
        if (i % 2 === 0 || !mergedOptions.includeManualWorkouts) {
          // Create regular workout on even days or if manual workouts are disabled
          await this.createRegularWorkout(userId, workoutDate, mergedOptions);
        } else {
          // Create manual workout on odd days if enabled
          await this.createManualSubmission(userId, workoutDate, mergedOptions);
        }
        
        // Add delay based on speed
        await this.delayBySpeed(mergedOptions.speed);
      }
      
      // Check for streak achievements
      this.logAction('CHECK_ACHIEVEMENTS', 'Checking for streak achievements');
      const streakAchievements = ['trinca_poderosa', 'semana_impecavel'];
      const unlockedAchievements = await this.checkAchievementUnlock(userId, streakAchievements);
      
      if (unlockedAchievements.length > 0) {
        this.achievementsUnlocked = unlockedAchievements;
        this.logAction('ACHIEVEMENTS_UNLOCKED', `Unlocked ${unlockedAchievements.length} streak achievements`, true);
      } else {
        this.logAction('NO_ACHIEVEMENTS', 'No streak achievements were unlocked', false);
      }
      
      // Verify the streak value in profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('streak, last_workout_at')
        .eq('id', userId)
        .single();
        
      if (profileError) {
        this.logAction('ERROR', `Error fetching profile: ${profileError.message}`, false);
      } else if (profile) {
        const expectedStreak = mergedOptions.addGap ? 
          Math.min(
            Math.floor(mergedOptions.streakDays / 2) + 1, 
            this.getDaysDifference(new Date(profile.last_workout_at), today) + 1
          ) :
          Math.min(mergedOptions.streakDays, this.getDaysDifference(new Date(profile.last_workout_at), today) + 1);
        
        this.logAction(
          profile.streak === expectedStreak ? 'STREAK_VERIFIED' : 'STREAK_MISMATCH',
          `User streak: ${profile.streak}, Expected: ${expectedStreak}`,
          profile.streak === expectedStreak
        );
      }
      
      // Return success result
      return this.createResult(true);
    } catch (error) {
      // Log error and return failure
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logAction('ERROR', errorMessage, false, errorMessage);
      return this.createResult(false, errorMessage);
    }
  }
  
  private async createRegularWorkout(userId: string, date: Date, options: Required<StreakScenarioOptions>): Promise<void> {
    this.logAction('CREATE_WORKOUT', `Creating workout for ${date.toISOString().split('T')[0]}`);
    
    const result = await this.generators.workout.generateWorkout(userId, {
      date,
      isTestData: true,
      testDataTag: options.testDataTag,
      silent: options.silent
    });
    
    if (!result.success) {
      throw new Error(`Failed to create workout: ${result.error}`);
    }
  }
  
  private async createManualSubmission(userId: string, date: Date, options: Required<StreakScenarioOptions>): Promise<void> {
    this.logAction('CREATE_MANUAL', `Creating manual workout for ${date.toISOString().split('T')[0]}`);
    
    const result = await this.generators.activity.generateManualWorkout(userId, {
      date,
      isTestData: true,
      testDataTag: options.testDataTag,
      silent: options.silent,
      activityType: ['running', 'yoga', 'swimming', 'cycling'][Math.floor(Math.random() * 4)]
    });
    
    if (!result.success) {
      throw new Error(`Failed to create manual workout: ${result.error}`);
    }
  }
  
  private getDaysDifference(date1: Date, date2: Date): number {
    // Normalize dates to midnight to avoid time issues
    const d1 = new Date(date1);
    d1.setHours(0, 0, 0, 0);
    const d2 = new Date(date2);
    d2.setHours(0, 0, 0, 0);
    
    // Calculate difference in days
    return Math.floor(Math.abs((d2.getTime() - d1.getTime()) / (24 * 60 * 60 * 1000)));
  }
  
  async cleanup(userId: string): Promise<boolean> {
    try {
      // Clean up workouts and manual workouts
      await this.generators.workout.cleanup(userId);
      await this.generators.activity.cleanup(userId);
      
      // Reset streak to 0
      await supabase
        .from('profiles')
        .update({
          streak: 0
        })
        .eq('id', userId);
      
      return true;
    } catch (error) {
      console.error('Error cleaning up streak scenario:', error);
      return false;
    }
  }
}

// Register scenario with the runner
export const streakScenario = new StreakScenario();

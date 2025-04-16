import { BaseScenario, ScenarioOptions, ScenarioResult } from './index';
import { supabase } from '@/integrations/supabase/client';
import { createTestDataGenerators } from '../generators';
import { toast } from 'sonner';

export interface StreakScenarioOptions extends ScenarioOptions {
  streakDays: number;
  withGaps: boolean;
  streakType: 'workout' | 'login' | 'mixed';
}

export class StreakScenario extends BaseScenario {
  private generators = createTestDataGenerators();
  
  constructor() {
    super(
      'streak-scenario',
      'Streak Achievement Tester',
      'Tests achievements related to workout streaks and consistency',
      ['streak', 'consistency', 'achievements']
    );
  }
  
  getConfigurationOptions(): Record<string, any> {
    const baseOptions = super.getConfigurationOptions();
    
    return {
      ...baseOptions,
      streakDays: {
        type: 'number',
        label: 'Streak Length',
        default: 7,
        min: 1,
        max: 30,
        description: 'Number of consecutive days to simulate'
      },
      withGaps: {
        type: 'boolean',
        label: 'Include Gaps',
        default: false,
        description: 'Whether to include gaps in the streak to test streak reset'
      },
      streakType: {
        type: 'select',
        label: 'Streak Type',
        options: [
          { value: 'workout', label: 'Workout Streak' },
          { value: 'login', label: 'Login Streak' },
          { value: 'mixed', label: 'Mixed Activity' }
        ],
        default: 'workout',
        description: 'Type of streak to simulate'
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
        withGaps: options?.withGaps || false,
        streakType: options?.streakType || 'workout',
        testDataTag: options?.testDataTag || 'test-data'
      };
      
      // Log start of scenario
      this.logAction('START_SCENARIO', `Starting streak scenario with ${mergedOptions.streakDays} days streak`);
      
      if (!mergedOptions.silent) {
        toast.info('Starting streak simulation', {
          description: `Simulating a ${mergedOptions.streakDays}-day streak`
        });
      }
      
      // Reset user streak to ensure clean state
      await this.resetUserStreak(userId);
      
      // Generate streak data
      if (mergedOptions.streakType === 'workout') {
        await this.generateWorkoutStreak(userId, mergedOptions);
      } else if (mergedOptions.streakType === 'login') {
        await this.generateLoginStreak(userId, mergedOptions);
      } else {
        await this.generateMixedStreak(userId, mergedOptions);
      }
      
      // Check for streak achievements
      const streakAchievements = await this.checkStreakAchievements(userId, mergedOptions.streakDays);
      
      // Log completion
      this.logAction('COMPLETE', `Streak scenario completed with ${streakAchievements.length} achievements unlocked`);
      
      if (!mergedOptions.silent) {
        toast.success('Streak simulation completed', {
          description: `Unlocked ${streakAchievements.length} achievements`
        });
      }
      
      // Return successful result with achievements
      return {
        success: true,
        executionTimeMs: performance.now() - this.startTime,
        actions: this.actions,
        achievementsUnlocked: this.achievementsUnlocked,
        completionPercentage: 100,
        unlockedCount: streakAchievements.length,
        targetCount: streakAchievements.length
      };
    } catch (error) {
      // Log error and return failure
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logAction('ERROR', errorMessage, false, errorMessage);
      
      if (!options?.silent) {
        toast.error('Streak simulation failed', {
          description: errorMessage
        });
      }
      
      return this.createResult(false, errorMessage);
    }
  }
  
  private async resetUserStreak(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          streak: 0,
          last_workout_at: null
        })
        .eq('id', userId);
        
      if (error) throw error;
      
      this.logAction('RESET_STREAK', 'Reset user streak to 0');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logAction('RESET_ERROR', message, false, message);
      throw error;
    }
  }
  
  private async generateWorkoutStreak(userId: string, options: Required<StreakScenarioOptions>): Promise<void> {
    try {
      const { streakDays, withGaps, speed } = options;
      
      // Calculate dates for the streak
      const dates = this.calculateStreakDates(streakDays, withGaps);
      
      // Generate workouts for each date
      for (let i = 0; i < dates.length; i++) {
        const date = dates[i];
        
        this.logAction('GENERATE_WORKOUT', `Generating workout for day ${i + 1} (${date.toISOString().split('T')[0]})`);
        
        // Use workout generator to create a workout for this date
        const result = await this.generators.workout.createWorkout(userId, {
          workoutDate: date,
          isTestData: true,
          testDataTag: options.testDataTag
        });
        
        if (!result.success) {
          throw new Error(result.error);
        }
        
        // Update profile streak directly
        await this.updateProfileStreak(userId, i + 1, date);
        
        // Check for streak achievements after each day
        await this.checkStreakAchievements(userId, i + 1);
        
        // Add delay based on speed
        await this.delayBySpeed(speed);
      }
      
      this.logAction('STREAK_COMPLETE', `Completed ${dates.length}-day streak`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logAction('GENERATE_STREAK_ERROR', message, false, message);
      throw error;
    }
  }
  
  private async generateLoginStreak(userId: string, options: Required<StreakScenarioOptions>): Promise<void> {
    try {
      const { streakDays, withGaps, speed } = options;
      
      // Calculate dates for the streak
      const dates = this.calculateStreakDates(streakDays, withGaps);
      
      // Generate login entries for each date
      for (let i = 0; i < dates.length; i++) {
        const date = dates[i];
        
        this.logAction('GENERATE_LOGIN', `Simulating login for day ${i + 1} (${date.toISOString().split('T')[0]})`);
        
        // Update last login date
        const { error } = await supabase
          .from('profiles')
          .update({
            last_login_at: date.toISOString()
          })
          .eq('id', userId);
          
        if (error) throw error;
        
        // Update profile streak directly
        await this.updateProfileStreak(userId, i + 1, date);
        
        // Check for streak achievements after each day
        await this.checkStreakAchievements(userId, i + 1);
        
        // Add delay based on speed
        await this.delayBySpeed(speed);
      }
      
      this.logAction('STREAK_COMPLETE', `Completed ${dates.length}-day login streak`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logAction('GENERATE_LOGIN_STREAK_ERROR', message, false, message);
      throw error;
    }
  }
  
  private async generateMixedStreak(userId: string, options: Required<StreakScenarioOptions>): Promise<void> {
    try {
      const { streakDays, withGaps, speed } = options;
      
      // Calculate dates for the streak
      const dates = this.calculateStreakDates(streakDays, withGaps);
      
      // Generate mixed activity for each date
      for (let i = 0; i < dates.length; i++) {
        const date = dates[i];
        const isEven = i % 2 === 0;
        
        if (isEven) {
          // Generate workout on even days
          this.logAction('GENERATE_WORKOUT', `Generating workout for day ${i + 1} (${date.toISOString().split('T')[0]})`);
          
          const result = await this.generators.workout.createWorkout(userId, {
            workoutDate: date,
            isTestData: true,
            testDataTag: options.testDataTag
          });
          
          if (!result.success) {
            throw new Error(result.error);
          }
        } else {
          // Generate manual workout on odd days
          this.logAction('GENERATE_MANUAL', `Generating manual workout for day ${i + 1} (${date.toISOString().split('T')[0]})`);
          
          const result = await this.generators.activity.createManualWorkout(userId, {
            activityDate: date,
            activityType: 'running',
            durationMinutes: 30,
            isTestData: true,
            testDataTag: options.testDataTag
          });
          
          if (!result.success) {
            throw new Error(result.error);
          }
        }
        
        // Update profile streak directly
        await this.updateProfileStreak(userId, i + 1, date);
        
        // Check for streak achievements after each day
        await this.checkStreakAchievements(userId, i + 1);
        
        // Add delay based on speed
        await this.delayBySpeed(speed);
      }
      
      this.logAction('STREAK_COMPLETE', `Completed ${dates.length}-day mixed activity streak`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logAction('GENERATE_MIXED_STREAK_ERROR', message, false, message);
      throw error;
    }
  }
  
  private calculateStreakDates(days: number, withGaps: boolean): Date[] {
    const dates: Date[] = [];
    const today = new Date();
    
    // Start from 'days' ago and work forward to today
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      // If we want gaps, skip some days
      if (withGaps && i > 0 && i % 3 === 0) {
        continue;
      }
      
      dates.push(date);
    }
    
    return dates;
  }
  
  private async updateProfileStreak(userId: string, streak: number, date: Date): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          streak: streak,
          last_workout_at: date.toISOString()
        })
        .eq('id', userId);
        
      if (error) throw error;
      
      this.logAction('UPDATE_STREAK', `Updated user streak to ${streak}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logAction('UPDATE_STREAK_ERROR', message, false, message);
      throw error;
    }
  }
  
  private async checkStreakAchievements(userId: string, currentStreak: number): Promise<string[]> {
    const streakAchievements = [
      { id: 'trinca-poderosa', requiredStreak: 3 },
      { id: 'embalo-fitness', requiredStreak: 5 },
      { id: 'semana-impecavel', requiredStreak: 7 },
      { id: 'mestre-da-consistencia', requiredStreak: 14 },
      { id: 'lendario', requiredStreak: 30 }
    ];
    
    const unlockedAchievements: string[] = [];
    
    for (const achievement of streakAchievements) {
      if (currentStreak >= achievement.requiredStreak) {
        const unlocked = await this.checkAchievementUnlock(userId, achievement.id);
        
        if (unlocked) {
          this.logAction('ACHIEVEMENT_UNLOCKED', `Unlocked streak achievement: ${achievement.id} (${achievement.requiredStreak} days)`);
          unlockedAchievements.push(achievement.id);
        }
      }
    }
    
    return unlockedAchievements;
  }
  
  async cleanup(userId: string): Promise<boolean> {
    try {
      this.logAction('CLEANUP', 'Cleaning up streak test data');
      
      // Reset streak
      await this.resetUserStreak(userId);
      
      // Clean up workouts
      await this.generators.workout.cleanup(userId, { silent: true });
      
      // Clean up manual workouts
      await this.generators.activity.cleanup(userId, { silent: true });
      
      this.logAction('CLEANUP_COMPLETE', 'Successfully cleaned up streak test data');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logAction('CLEANUP_ERROR', message, false, message);
      return false;
    }
  }
}

// Register scenario with the runner
export const streakScenario = new StreakScenario();

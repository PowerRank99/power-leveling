import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import { AchievementService } from '@/services/rpg/AchievementService';
import { Achievement, AchievementCategory, AchievementProgress, AchievementRank } from '@/types/achievementTypes';
import { ACHIEVEMENTS } from '@/constants/achievements';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';
import { EXERCISE_TYPES } from '@/services/rpg/constants/exerciseTypes';
import { XPService } from '@/services/rpg/XPService';
import { UnifiedAchievementChecker } from '@/services/rpg/achievements/UnifiedAchievementChecker';
import { TransactionService } from '@/services/common/TransactionService';

// Define interfaces for the testing service
export interface AchievementTestResult {
  achievementId: string;
  name: string;
  category: AchievementCategory;
  rank: AchievementRank | string;
  success: boolean;
  errorMessage?: string;
  testDurationMs: number;
  testedAt: Date;
}

export interface AchievementTestProgress {
  total: number;
  completed: number;
  successful: number;
  failed: number;
  currentTest?: string;
  isRunning: boolean;
}

export interface AchievementTestConfig {
  cleanup: boolean;
  useTransaction: boolean;
  verbose: boolean;
  timeout: number; // milliseconds
  maxRetries: number;
  categories?: AchievementCategory[];
  ranks?: AchievementRank[];
  includedAchievements?: string[];
  excludedAchievements?: string[];
}

export type AchievementTestProgressCallback = (progress: AchievementTestProgress) => void;
export type AchievementTestResultCallback = (result: AchievementTestResult) => void;

/**
 * Comprehensive service for testing achievements
 * Allows systematic testing of all achievement types in the system
 */
export class AchievementTestingService {
  // Default test configuration
  private static readonly DEFAULT_CONFIG: AchievementTestConfig = {
    cleanup: true,
    useTransaction: true,
    verbose: true,
    timeout: 10000, // 10 seconds
    maxRetries: 3,
  };

  private config: AchievementTestConfig;
  private testUserId: string | null = null;
  private progress: AchievementTestProgress = {
    total: 0,
    completed: 0,
    successful: 0,
    failed: 0,
    isRunning: false,
  };
  private results: AchievementTestResult[] = [];
  private progressCallback?: AchievementTestProgressCallback;
  private resultCallback?: AchievementTestResultCallback;
  private testSessionStartTime: Date | null = null;

  constructor(
    testUserId: string | null = null,
    config: Partial<AchievementTestConfig> = {}
  ) {
    this.testUserId = testUserId;
    this.config = { ...AchievementTestingService.DEFAULT_CONFIG, ...config };
  }

  /**
   * Set the test user ID
   */
  setTestUserId(userId: string): void {
    this.testUserId = userId;
  }

  /**
   * Update test configuration
   */
  updateConfig(config: Partial<AchievementTestConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Set progress callback
   */
  onProgress(callback: AchievementTestProgressCallback): void {
    this.progressCallback = callback;
  }

  /**
   * Set result callback
   */
  onResult(callback: AchievementTestResultCallback): void {
    this.resultCallback = callback;
  }

  /**
   * Run tests for all achievements matching the current configuration
   */
  async runAllTests(): Promise<ServiceResponse<AchievementTestResult[]>> {
    if (!this.testUserId) {
      return createErrorResponse(
        'Test user ID not set',
        'A valid user ID is required to run achievement tests',
        ErrorCategory.VALIDATION
      );
    }

    if (this.progress.isRunning) {
      return createErrorResponse(
        'Tests already running',
        'Wait for current test suite to complete before starting a new one',
        ErrorCategory.BUSINESS_LOGIC
      );
    }

    try {
      // Initialize test session
      this.testSessionStartTime = new Date();
      this.results = [];
      this.progress = {
        total: 0,
        completed: 0,
        successful: 0,
        failed: 0,
        isRunning: true,
      };

      // Get all achievements matching the configuration
      const achievements = this.getAchievementsToTest();
      this.progress.total = achievements.length;
      this.updateProgress();

      console.log(`[AchievementTestingService] Starting test suite for ${achievements.length} achievements`);

      // Run tests for each achievement
      for (const achievement of achievements) {
        this.progress.currentTest = achievement.name;
        this.updateProgress();

        const result = await this.testAchievement(achievement.id);
        this.results.push(result);

        // Update progress
        this.progress.completed++;
        if (result.success) {
          this.progress.successful++;
        } else {
          this.progress.failed++;
        }

        this.updateProgress();
        
        // Notify result callback
        if (this.resultCallback) {
          this.resultCallback(result);
        }
      }

      // Complete test session
      this.progress.isRunning = false;
      this.progress.currentTest = undefined;
      this.updateProgress();

      console.log(`[AchievementTestingService] Test suite completed: ${this.progress.successful}/${this.progress.total} passed`);

      return createSuccessResponse(this.results);
    } catch (error) {
      this.progress.isRunning = false;
      this.updateProgress();

      return createErrorResponse(
        'Test suite failed',
        `Exception in achievement test suite: ${(error as Error).message}`,
        ErrorCategory.EXCEPTION
      );
    }
  }

  /**
   * Run test for a specific achievement
   */
  async testAchievement(achievementId: string): Promise<AchievementTestResult> {
    if (!this.testUserId) {
      throw new Error('Test user ID not set');
    }

    const startTime = Date.now();
    let success = false;
    let errorMessage = '';

    try {
      const achievement = AchievementUtils.getAchievementById(achievementId);
      if (!achievement) {
        throw new Error(`Achievement with ID ${achievementId} not found`);
      }

      // Initialize result
      const result: AchievementTestResult = {
        achievementId,
        name: achievement.name,
        category: achievement.category as AchievementCategory,
        rank: achievement.rank as AchievementRank,
        success: false,
        testDurationMs: 0,
        testedAt: new Date(),
      };

      // Check if achievement is already awarded to avoid false positives
      await this.cleanupExistingAchievement(achievementId);

      // Use transaction if configured
      if (this.config.useTransaction) {
        await TransactionService.executeWithRetry(
          async () => {
            await this.executeAchievementTest(achievementId);
          },
          `test_achievement_${achievementId}`,
          this.config.maxRetries,
          `Failed to test achievement ${achievementId}`
        );
      } else {
        await this.executeAchievementTest(achievementId);
      }

      // Verify achievement was awarded
      const { data: userAchievements, error: fetchError } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', this.testUserId)
        .eq('achievement_id', achievementId)
        .maybeSingle();

      if (fetchError) {
        throw new Error(`Error verifying achievement award: ${fetchError.message}`);
      }

      success = !!userAchievements;
      if (!success) {
        errorMessage = 'Achievement was not awarded after test actions';
      }

      // Update result
      result.success = success;
      if (!success) {
        result.errorMessage = errorMessage;
      }
      result.testDurationMs = Date.now() - startTime;

      // Clean up if needed
      if (this.config.cleanup && success) {
        await this.cleanupExistingAchievement(achievementId);
      }

      if (this.config.verbose) {
        console.log(`[AchievementTestingService] Test for "${achievement.name}": ${success ? 'SUCCESS' : 'FAILED'}${errorMessage ? ` - ${errorMessage}` : ''}`);
      }

      return result;
    } catch (error) {
      const errorMsg = `Exception in achievement test: ${(error as Error).message}`;
      
      if (this.config.verbose) {
        console.error(`[AchievementTestingService] ${errorMsg}`);
      }

      return {
        achievementId,
        name: AchievementUtils.getAchievementById(achievementId)?.name || achievementId,
        category: AchievementUtils.getAchievementById(achievementId)?.category as AchievementCategory || AchievementCategory.WORKOUT,
        rank: AchievementUtils.getAchievementById(achievementId)?.rank as AchievementRank || AchievementRank.E,
        success: false,
        errorMessage: errorMsg,
        testDurationMs: Date.now() - startTime,
        testedAt: new Date(),
      };
    }
  }

  /**
   * Get test report with summary statistics
   */
  getTestReport(): {
    summary: {
      total: number;
      successful: number;
      failed: number;
      successRate: number;
      totalDurationMs: number;
    };
    results: AchievementTestResult[];
    failedTests: AchievementTestResult[];
  } {
    const failedTests = this.results.filter(r => !r.success);
    const totalDurationMs = this.results.reduce((sum, r) => sum + r.testDurationMs, 0);
    
    return {
      summary: {
        total: this.results.length,
        successful: this.results.filter(r => r.success).length,
        failed: failedTests.length,
        successRate: this.results.length > 0 
          ? this.results.filter(r => r.success).length / this.results.length 
          : 0,
        totalDurationMs,
      },
      results: this.results,
      failedTests,
    };
  }

  /**
   * Run tests for achievements in a specific category
   */
  async runCategoryTests(category: AchievementCategory): Promise<ServiceResponse<AchievementTestResult[]>> {
    const previousConfig = { ...this.config };
    this.config.categories = [category];
    
    const result = await this.runAllTests();
    
    // Restore previous config
    this.config = previousConfig;
    return result;
  }

  /**
   * Run tests for achievements of a specific rank
   */
  async runRankTests(rank: AchievementRank): Promise<ServiceResponse<AchievementTestResult[]>> {
    const previousConfig = { ...this.config };
    this.config.ranks = [rank];
    
    const result = await this.runAllTests();
    
    // Restore previous config
    this.config = previousConfig;
    return result;
  }

  // ----- Private helper methods -----

  /**
   * Update progress and notify callback if set
   */
  private updateProgress(): void {
    if (this.progressCallback) {
      this.progressCallback({ ...this.progress });
    }
  }

  /**
   * Get achievements to test based on current configuration
   */
  private getAchievementsToTest(): { id: string; name: string }[] {
    const allAchievements = AchievementUtils.getAllAchievements();
    
    return allAchievements
      .filter(a => {
        // Filter by category if specified
        if (this.config.categories && this.config.categories.length > 0) {
          if (!this.config.categories.includes(a.category as AchievementCategory)) {
            return false;
          }
        }
        
        // Filter by rank if specified
        if (this.config.ranks && this.config.ranks.length > 0) {
          if (!this.config.ranks.includes(a.rank as AchievementRank)) {
            return false;
          }
        }
        
        // Filter included/excluded achievements
        if (this.config.includedAchievements && this.config.includedAchievements.length > 0) {
          return this.config.includedAchievements.includes(a.id);
        }
        
        if (this.config.excludedAchievements && this.config.excludedAchievements.length > 0) {
          return !this.config.excludedAchievements.includes(a.id);
        }
        
        return true;
      })
      .map(a => ({ id: a.id, name: a.name }));
  }

  /**
   * Clean up existing achievement to prepare for testing
   */
  private async cleanupExistingAchievement(achievementId: string): Promise<void> {
    if (!this.testUserId) return;

    // Remove the achievement if it already exists
    const { error } = await supabase
      .from('user_achievements')
      .delete()
      .eq('user_id', this.testUserId)
      .eq('achievement_id', achievementId);

    if (error && this.config.verbose) {
      console.warn(`[AchievementTestingService] Error cleaning up achievement: ${error.message}`);
    }

    // Clear achievement progress
    const { error: progressError } = await supabase
      .from('achievement_progress')
      .delete()
      .eq('user_id', this.testUserId)
      .eq('achievement_id', achievementId);

    if (progressError && this.config.verbose) {
      console.warn(`[AchievementTestingService] Error cleaning up achievement progress: ${progressError.message}`);
    }
  }

  /**
   * Execute the specific test actions for an achievement
   */
  private async executeAchievementTest(achievementId: string): Promise<void> {
    if (!this.testUserId) {
      throw new Error('Test user ID not set');
    }

    const achievement = AchievementUtils.getAchievementById(achievementId);
    if (!achievement) {
      throw new Error(`Achievement with ID ${achievementId} not found`);
    }

    switch (achievement.category) {
      case AchievementCategory.WORKOUT:
        await this.testWorkoutAchievement(achievement);
        break;
      case AchievementCategory.STREAK:
        await this.testStreakAchievement(achievement);
        break;
      case AchievementCategory.RECORD:
        await this.testRecordAchievement(achievement);
        break;
      case AchievementCategory.MANUAL:
        await this.testManualWorkoutAchievement(achievement);
        break;
      case AchievementCategory.XP:
        await this.testXPAchievement(achievement);
        break;
      case AchievementCategory.LEVEL:
        await this.testLevelAchievement(achievement);
        break;
      case AchievementCategory.VARIETY:
        await this.testVarietyAchievement(achievement);
        break;
      case AchievementCategory.GUILD:
        await this.testGuildAchievement(achievement);
        break;
      default:
        // Try to force award the achievement directly
        await AchievementService.awardAchievement(this.testUserId, achievementId);
    }

    // Force check for achievement
    await UnifiedAchievementChecker.processCompletedWorkout(this.testUserId);
  }

  /**
   * Test workout-related achievement
   */
  private async testWorkoutAchievement(achievement: any): Promise<void> {
    if (!this.testUserId) return;

    // Implementation for "primeiro-treino" (first workout) achievement
    if (achievement.id === 'primeiro-treino') {
      await this.simulateWorkout(this.testUserId, {
        exerciseCount: 1,
        setCount: 3,
        durationMinutes: 30
      });
      return;
    }

    // Implementation for total workout count achievements
    if (achievement.id === 'total-7' || achievement.id.includes('total-')) {
      const requiredCount = parseInt(achievement.id.split('-')[1], 10) || 7;
      
      // Get current count
      const { data: profile } = await supabase
        .from('profiles')
        .select('workouts_count')
        .eq('id', this.testUserId)
        .single();
      
      const currentCount = profile?.workouts_count || 0;
      const neededWorkouts = Math.max(1, requiredCount - currentCount);
      
      // Simulate needed workouts
      for (let i = 0; i < neededWorkouts; i++) {
        await this.simulateWorkout(this.testUserId, {
          exerciseCount: 1,
          setCount: 3,
          durationMinutes: 30
        });
      }
      return;
    }

    // For all other workout achievements, simulate a standard workout
    await this.simulateWorkout(this.testUserId, {
      exerciseCount: 3,
      setCount: 4,
      durationMinutes: 45
    });
  }

  /**
   * Test streak-related achievement
   */
  private async testStreakAchievement(achievement: any): Promise<void> {
    if (!this.testUserId) return;

    // Get the required streak from the achievement ID (e.g., streak-7)
    const requiredStreak = parseInt(achievement.id.split('-')[1], 10) || 3;
    
    // Update the user's streak directly in the database
    const { error } = await supabase
      .from('profiles')
      .update({ streak: requiredStreak })
      .eq('id', this.testUserId);
      
    if (error) {
      throw new Error(`Error updating streak: ${error.message}`);
    }
    
    // Simulate a workout to trigger achievement check
    await this.simulateWorkout(this.testUserId, {
      exerciseCount: 1,
      setCount: 3,
      durationMinutes: 30
    });
  }

  /**
   * Test record-related achievement
   */
  private async testRecordAchievement(achievement: any): Promise<void> {
    if (!this.testUserId) return;

    // Create exercise for testing if PR is first
    if (achievement.id === 'pr-first') {
      // Create a personal record
      const { data: exercise } = await supabase
        .from('exercises')
        .select('id')
        .limit(1)
        .single();
        
      if (!exercise) {
        throw new Error('No exercise found for PR test');
      }
      
      const { error } = await supabase
        .from('personal_records')
        .insert({
          user_id: this.testUserId,
          exercise_id: exercise.id,
          weight: 100,
          previous_weight: 80,
          recorded_at: new Date().toISOString()
        });
        
      if (error) {
        throw new Error(`Error creating personal record: ${error.message}`);
      }
      
      return;
    }
    
    // For multi-record achievements (PR count)
    if (achievement.id.startsWith('pr-') && !isNaN(parseInt(achievement.id.split('-')[1], 10))) {
      const requiredCount = parseInt(achievement.id.split('-')[1], 10);
      
      // Get exercises for multiple PRs
      const { data: exercises } = await supabase
        .from('exercises')
        .select('id')
        .limit(requiredCount);
        
      if (!exercises || exercises.length < requiredCount) {
        throw new Error(`Not enough exercises found for PR test (needed ${requiredCount})`);
      }
      
      // Delete existing PRs
      await supabase
        .from('personal_records')
        .delete()
        .eq('user_id', this.testUserId);
      
      // Create multiple PRs
      for (let i = 0; i < requiredCount; i++) {
        await supabase
          .from('personal_records')
          .insert({
            user_id: this.testUserId,
            exercise_id: exercises[i].id,
            weight: 100 + i * 5,
            previous_weight: 80 + i * 5,
            recorded_at: new Date().toISOString()
          });
      }
      
      // Update PR count in profile
      await supabase
        .from('profiles')
        .update({ records_count: requiredCount })
        .eq('id', this.testUserId);
        
      return;
    }
  }

  /**
   * Test manual workout achievement
   */
  private async testManualWorkoutAchievement(achievement: any): Promise<void> {
    if (!this.testUserId) return;

    // For example: diario-do-suor (3 manual workouts)
    if (achievement.id === 'diario-do-suor') {
      // Delete existing manual workouts
      await supabase
        .from('manual_workouts')
        .delete()
        .eq('user_id', this.testUserId);
      
      // Create 3 manual workouts
      for (let i = 0; i < 3; i++) {
        await supabase
          .from('manual_workouts')
          .insert({
            user_id: this.testUserId,
            description: `Test manual workout ${i+1}`,
            activity_type: 'Test',
            photo_url: 'https://example.com/test.jpg',
            xp_awarded: 100,
            workout_date: new Date().toISOString(),
            is_power_day: false
          });
      }
      return;
    }
    
    // For other manual workout count achievements
    if (achievement.id.includes('manual-')) {
      const requiredCount = parseInt(achievement.id.split('-')[1], 10) || 5;
      
      // Delete existing manual workouts
      await supabase
        .from('manual_workouts')
        .delete()
        .eq('user_id', this.testUserId);
      
      // Create required manual workouts
      for (let i = 0; i < requiredCount; i++) {
        await supabase
          .from('manual_workouts')
          .insert({
            user_id: this.testUserId,
            description: `Test manual workout ${i+1}`,
            activity_type: 'Test',
            photo_url: 'https://example.com/test.jpg',
            xp_awarded: 100,
            workout_date: new Date().toISOString(),
            is_power_day: false
          });
      }
      return;
    }
  }

  /**
   * Test XP achievement
   */
  private async testXPAchievement(achievement: any): Promise<void> {
    if (!this.testUserId) return;

    // Extract required XP from achievement ID
    const requiredXP = parseInt(achievement.id.split('-')[1], 10) || 1000;
    
    // Update XP directly in profile
    const { error } = await supabase
      .from('profiles')
      .update({ xp: requiredXP })
      .eq('id', this.testUserId);
      
    if (error) {
      throw new Error(`Error updating XP: ${error.message}`);
    }
    
    // Award a small amount of XP to trigger achievement check
    await XPService.awardXP(this.testUserId, 10, 'achievement_test');
  }

  /**
   * Test level achievement
   */
  private async testLevelAchievement(achievement: any): Promise<void> {
    if (!this.testUserId) return;

    // Extract required level from achievement ID
    const requiredLevel = parseInt(achievement.id.split('-')[1], 10) || 5;
    
    // Update level directly in profile
    const { error } = await supabase
      .from('profiles')
      .update({ level: requiredLevel })
      .eq('id', this.testUserId);
      
    if (error) {
      throw new Error(`Error updating level: ${error.message}`);
    }
    
    // Simulate a workout to trigger achievement check
    await this.simulateWorkout(this.testUserId, {
      exerciseCount: 1,
      setCount: 1,
      durationMinutes: 10
    });
  }

  /**
   * Test variety achievement
   */
  private async testVarietyAchievement(achievement: any): Promise<void> {
    if (!this.testUserId) return;

    // For variety-3 (3 types of workouts)
    if (achievement.id === 'variety-3') {
      // Create 3 different types of workouts
      const workoutTypes = ['strength', 'cardio', 'flexibility'];
      
      for (const type of workoutTypes) {
        await this.simulateWorkout(this.testUserId, {
          exerciseCount: 1,
          setCount: 3,
          durationMinutes: 30,
          exerciseType: type
        });
      }
      return;
    }
    
    // For other variety achievements
    await this.simulateWorkout(this.testUserId, {
      exerciseCount: 5,
      setCount: 3,
      durationMinutes: 45,
      exerciseType: 'mixed'
    });
  }

  /**
   * Test guild achievement
   */
  private async testGuildAchievement(achievement: any): Promise<void> {
    if (!this.testUserId) return;

    // For first-guild (join first guild)
    if (achievement.id === 'primeira-guilda') {
      // Create a guild if needed
      let guildId: string;
      
      const { data: existingGuilds } = await supabase
        .from('guilds')
        .select('id')
        .limit(1);
        
      if (existingGuilds && existingGuilds.length > 0) {
        guildId = existingGuilds[0].id;
      } else {
        // Create a test guild
        const { data: newGuild, error } = await supabase
          .from('guilds')
          .insert({
            name: 'Test Guild',
            description: 'Guild for achievement testing',
            created_by: this.testUserId
          })
          .select('id')
          .single();
          
        if (error || !newGuild) {
          throw new Error(`Error creating test guild: ${error?.message}`);
        }
        
        guildId = newGuild.id;
      }
      
      // Delete any existing guild memberships
      await supabase
        .from('guild_members')
        .delete()
        .eq('user_id', this.testUserId);
      
      // Join the guild
      await supabase
        .from('guild_members')
        .insert({
          user_id: this.testUserId,
          guild_id: guildId,
          role: 'member'
        });
        
      return;
    }
    
    // For multiple-guilds (join 3+ guilds)
    if (achievement.id === 'multiple-guilds') {
      // Delete any existing guild memberships
      await supabase
        .from('guild_members')
        .delete()
        .eq('user_id', this.testUserId);
      
      // Create 3 guilds if needed
      for (let i = 0; i < 3; i++) {
        // Create a test guild
        const { data: newGuild, error } = await supabase
          .from('guilds')
          .insert({
            name: `Test Guild ${i+1}`,
            description: 'Guild for achievement testing',
            created_by: this.testUserId
          })
          .select('id')
          .single();
          
        if (error || !newGuild) {
          throw new Error(`Error creating test guild: ${error?.message}`);
        }
        
        // Join the guild
        await supabase
          .from('guild_members')
          .insert({
            user_id: this.testUserId,
            guild_id: newGuild.id,
            role: 'member'
          });
      }
      
      return;
    }
  }

  /**
   * Simulate a workout with the given parameters
   */
  private async simulateWorkout(
    userId: string, 
    params: {
      exerciseCount: number;
      setCount: number;
      durationMinutes: number;
      exerciseType?: string;
    }
  ): Promise<string> {
    const now = new Date();
    const startedAt = new Date(now.getTime() - params.durationMinutes * 60 * 1000);
    
    // Create the workout
    const { data: workout, error } = await supabase
      .from('workouts')
      .insert({
        user_id: userId,
        started_at: startedAt.toISOString(),
        completed_at: now.toISOString(),
        duration_seconds: params.durationMinutes * 60
      })
      .select('id')
      .single();
      
    if (error || !workout) {
      throw new Error(`Error creating workout: ${error?.message}`);
    }
    
    // Determine type of exercises to use
    let exerciseQuery = supabase.from('exercises').select('id, name, type');
    
    if (params.exerciseType === 'strength') {
      exerciseQuery = exerciseQuery.in('type', EXERCISE_TYPES.COMPOUND_LIFTS);
    } else if (params.exerciseType === 'cardio') {
      exerciseQuery = exerciseQuery.in('type', EXERCISE_TYPES.CARDIO_HIIT);
    } else if (params.exerciseType === 'flexibility') {
      exerciseQuery = exerciseQuery.in('type', EXERCISE_TYPES.FLEXIBILITY);
    }
    
    // Get exercises
    const { data: exercises } = await exerciseQuery.limit(params.exerciseCount);
    
    if (!exercises || exercises.length < params.exerciseCount) {
      throw new Error(`Not enough exercises of type ${params.exerciseType} found`);
    }
    
    // Create sets for each exercise
    for (let i = 0; i < exercises.length; i++) {
      for (let j = 0; j < params.setCount; j++) {
        await supabase
          .from('workout_sets')
          .insert({
            workout_id: workout.id,
            exercise_id: exercises[i].id,
            set_order: j + 1,
            reps: 10,
            weight: 50,
            completed: true,
            completed_at: new Date(startedAt.getTime() + (i * params.setCount + j) * 60 * 1000).toISOString()
          });
      }
    }
    
    // Update profile stats
    await supabase.rpc('increment_profile_counter', {
      user_id_param: userId,
      counter_name: 'workouts_count',
      increment_amount: 1
    });
    
    await supabase
      .from('profiles')
      .update({
        last_workout_at: now.toISOString()
      })
      .eq('id', userId);
    
    return workout.id;
  }
}

// Export specific category test runners for convenience
export const AchievementTestRunners = {
  /**
   * Run workout achievement tests
   */
  workouts: async (service: AchievementTestingService): Promise<ServiceResponse<AchievementTestResult[]>> => {
    return service.runCategoryTests(AchievementCategory.WORKOUT);
  },
  
  /**
   * Run streak achievement tests
   */
  streaks: async (service: AchievementTestingService): Promise<ServiceResponse<AchievementTestResult[]>> => {
    return service.runCategoryTests(AchievementCategory.STREAK);
  },
  
  /**
   * Run rank-specific tests
   */
  ranks: {
    rankE: async (service: AchievementTestingService): Promise<ServiceResponse<AchievementTestResult[]>> => {
      return service.runRankTests(AchievementRank.E);
    },
    rankD: async (service: AchievementTestingService): Promise<ServiceResponse<AchievementTestResult[]>> => {
      return service.runRankTests(AchievementRank.D);
    }
  }
};

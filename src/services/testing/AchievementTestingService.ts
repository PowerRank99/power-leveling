import { 
  Achievement, 
  AchievementCategory, 
  AchievementRank 
} from '@/types/achievementTypes';

import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, createSuccessResponse, createErrorResponse } from '@/services/common/ErrorHandlingService';
import { AchievementService } from '@/services/rpg/AchievementService';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';
import { EXERCISE_TYPES } from '@/services/rpg/constants/exerciseTypes';
import { XPService } from '@/services/rpg/XPService';
import { UnifiedAchievementChecker } from '@/services/rpg/achievements/UnifiedAchievementChecker';
import { TransactionService } from '@/services/common/TransactionService';
import { TestCoverageService } from './TestCoverageService';

export interface AchievementTestResult {
  achievementId: string;
  name: string;
  category: AchievementCategory | string;
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

  setTestUserId(userId: string): void {
    this.testUserId = userId;
  }

  updateConfig(config: Partial<AchievementTestConfig>): void {
    this.config = { ...this.config, ...config };
  }

  onProgress(callback: AchievementTestProgressCallback): void {
    this.progressCallback = callback;
  }

  onResult(callback: AchievementTestResultCallback): void {
    this.resultCallback = callback;
  }

  async runAllTests(): Promise<ServiceResponse<AchievementTestResult[]>> {
    if (!this.testUserId) {
      return createErrorResponse(
        'Test user ID not set',
        'A valid user ID is required to run achievement tests'
      );
    }

    if (this.progress.isRunning) {
      return createErrorResponse(
        'Tests already running',
        'Wait for current test suite to complete'
      );
    }

    try {
      TestCoverageService.clearCoverage();

      this.testSessionStartTime = new Date();
      this.results = [];
      this.progress = {
        total: 0,
        completed: 0,
        successful: 0,
        failed: 0,
        isRunning: true
      };

      const achievements = this.getAchievementsToTest();
      this.progress.total = achievements.length;
      this.updateProgress();

      if (this.config.useTransaction) {
        await supabase.rpc('begin_transaction');
      }

      try {
        for (const achievement of achievements) {
          this.progress.currentTest = achievement.name;
          this.updateProgress();

          const result = await this.testAchievement(achievement.id);
          this.results.push(result);

          if (result.success) {
            TestCoverageService.recordTestedAchievement(achievement.id);
            this.progress.successful++;
          } else {
            this.progress.failed++;
          }

          this.progress.completed++;
          this.updateProgress();

          if (this.resultCallback) {
            this.resultCallback(result);
          }
        }

        if (this.config.useTransaction) {
          await supabase.rpc('commit_transaction');
        }
      } catch (error) {
        if (this.config.useTransaction) {
          await supabase.rpc('rollback_transaction');
        }
        throw error;
      }

      const coverageReport = TestCoverageService.generateCoverageReport();
      console.log('Test Coverage Report:', coverageReport);

      this.progress.isRunning = false;
      this.progress.currentTest = undefined;
      this.updateProgress();

      return createSuccessResponse(this.results);
    } catch (error) {
      this.progress.isRunning = false;
      this.updateProgress();

      return createErrorResponse(
        'Test suite failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  async testAchievement(achievementId: string): Promise<AchievementTestResult> {
    if (!this.testUserId) {
      throw new Error('Test user ID not set');
    }

    const startTime = Date.now();

    try {
      const achievement = await AchievementUtils.getAchievementById(achievementId);
      if (!achievement) {
        throw new Error(`Achievement with ID ${achievementId} not found`);
      }

      const result: AchievementTestResult = {
        achievementId,
        name: achievement.name,
        category: achievement.category,
        rank: achievement.rank,
        success: false,
        testDurationMs: 0,
        testedAt: new Date(),
      };

      await this.cleanupExistingAchievement(achievementId);

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

      const { data: userAchievements, error: fetchError } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', this.testUserId)
        .eq('achievement_id', achievementId)
        .maybeSingle();

      if (fetchError) {
        throw new Error(`Error verifying achievement award: ${fetchError.message}`);
      }

      result.success = !!userAchievements;
      if (!result.success) {
        result.errorMessage = 'Achievement was not awarded after test actions';
      }

      result.testDurationMs = Date.now() - startTime;

      if (this.config.cleanup && result.success) {
        await this.cleanupExistingAchievement(achievementId);
      }

      if (this.config.verbose) {
        console.log(`[AchievementTestingService] Test for "${achievement.name}": ${result.success ? 'SUCCESS' : 'FAILED'}${result.errorMessage ? ` - ${result.errorMessage}` : ''}`);
      }

      return result;
    } catch (error) {
      const errorMsg = `Exception in achievement test: ${(error as Error).message}`;
      
      if (this.config.verbose) {
        console.error(`[AchievementTestingService] ${errorMsg}`);
      }

      return {
        achievementId,
        name: (await AchievementUtils.getAchievementById(achievementId))?.name || achievementId,
        category: (await AchievementUtils.getAchievementById(achievementId))?.category as AchievementCategory || AchievementCategory.WORKOUT,
        rank: (await AchievementUtils.getAchievementById(achievementId))?.rank as AchievementRank || AchievementRank.E,
        success: false,
        errorMessage: errorMsg,
        testDurationMs: Date.now() - startTime,
        testedAt: new Date(),
      };
    }
  }

  getTestReport(): {
    summary: {
      total: number;
      successful: number;
      failed: number;
      successRate: number;
      totalDurationMs: number;
      averageTestDurationMs: number;
      coverage: ReturnType<typeof TestCoverageService.generateCoverageReport>;
    };
    results: AchievementTestResult[];
    failedTests: AchievementTestResult[];
  } {
    const failedTests = this.results.filter(r => !r.success);
    const totalDurationMs = this.results.reduce((sum, r) => sum + r.testDurationMs, 0);
    const averageTestDurationMs = this.results.length > 0 ? totalDurationMs / this.results.length : 0;
    
    return {
      summary: {
        total: this.results.length,
        successful: this.results.filter(r => r.success).length,
        failed: failedTests.length,
        successRate: this.results.length > 0 
          ? this.results.filter(r => r.success).length / this.results.length 
          : 0,
        totalDurationMs,
        averageTestDurationMs,
        coverage: TestCoverageService.generateCoverageReport()
      },
      results: this.results,
      failedTests,
    };
  }

  async runCategoryTests(category: AchievementCategory): Promise<ServiceResponse<AchievementTestResult[]>> {
    const previousConfig = { ...this.config };
    this.config.categories = [category];
    
    const result = await this.runAllTests();
    
    this.config = previousConfig;
    return result;
  }

  async runRankTests(rank: AchievementRank): Promise<ServiceResponse<AchievementTestResult[]>> {
    const previousConfig = { ...this.config };
    this.config.ranks = [rank];
    
    const result = await this.runAllTests();
    
    this.config = previousConfig;
    return result;
  }

  private updateProgress(): void {
    if (this.progressCallback) {
      this.progressCallback({ ...this.progress });
    }
  }

  private getAchievementsToTest(): { id: string; name: string }[] {
    const allAchievements = AchievementUtils.getAllAchievementsSync();
    
    return allAchievements
      .filter(a => {
        if (this.config.categories && this.config.categories.length > 0) {
          if (!this.config.categories.includes(a.category as AchievementCategory)) {
            return false;
          }
        }
        
        if (this.config.ranks && this.config.ranks.length > 0) {
          if (!this.config.ranks.includes(a.rank as AchievementRank)) {
            return false;
          }
        }
        
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

  private async cleanupExistingAchievement(achievementId: string): Promise<void> {
    if (!this.testUserId) return;

    const { error } = await supabase
      .from('user_achievements')
      .delete()
      .eq('user_id', this.testUserId)
      .eq('achievement_id', achievementId);

    if (error && this.config.verbose) {
      console.warn(`[AchievementTestingService] Error cleaning up achievement: ${error.message}`);
    }

    const { error: progressError } = await supabase
      .from('achievement_progress')
      .delete()
      .eq('user_id', this.testUserId)
      .eq('achievement_id', achievementId);

    if (progressError && this.config.verbose) {
      console.warn(`[AchievementTestingService] Error cleaning up achievement progress: ${progressError.message}`);
    }
  }

  private async executeAchievementTest(achievementId: string): Promise<void> {
    if (!this.testUserId) {
      throw new Error('Test user ID not set');
    }

    const achievement = await AchievementUtils.getAchievementById(achievementId);
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
        await AchievementService.awardAchievement(this.testUserId, achievementId);
    }

    await UnifiedAchievementChecker.processCompletedWorkout(this.testUserId);
  }

  private async testWorkoutAchievement(achievement: any): Promise<void> {
    if (!this.testUserId) return;

    if (achievement.id === 'primeiro-treino') {
      await this.simulateWorkout(this.testUserId, {
        exerciseCount: 1,
        setCount: 3,
        durationMinutes: 30
      });
      return;
    }

    if (achievement.id === 'total-7' || achievement.id.includes('total-')) {
      const requiredCount = parseInt(achievement.id.split('-')[1], 10) || 7;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('workouts_count')
        .eq('id', this.testUserId)
        .single();
      
      const currentCount = profile?.workouts_count || 0;
      const neededWorkouts = Math.max(1, requiredCount - currentCount);
      
      for (let i = 0; i < neededWorkouts; i++) {
        await this.simulateWorkout(this.testUserId, {
          exerciseCount: 1,
          setCount: 3,
          durationMinutes: 30
        });
      }
      return;
    }

    await this.simulateWorkout(this.testUserId, {
      exerciseCount: 3,
      setCount: 4,
      durationMinutes: 45
    });
  }

  private async testStreakAchievement(achievement: any): Promise<void> {
    if (!this.testUserId) return;

    const requiredStreak = parseInt(achievement.id.split('-')[1], 10) || 3;
    
    const { error } = await supabase
      .from('profiles')
      .update({ streak: requiredStreak })
      .eq('id', this.testUserId);
      
    if (error) {
      throw new Error(`Error updating streak: ${error.message}`);
    }
    
    await this.simulateWorkout(this.testUserId, {
      exerciseCount: 1,
      setCount: 3,
      durationMinutes: 30
    });
  }

  private async testRecordAchievement(achievement: any): Promise<void> {
    if (!this.testUserId) return;

    if (achievement.id === 'pr-first') {
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
    
    if (achievement.id.startsWith('pr-') && !isNaN(parseInt(achievement.id.split('-')[1], 10))) {
      const requiredCount = parseInt(achievement.id.split('-')[1], 10);
      
      const { data: exercises } = await supabase
        .from('exercises')
        .select('id')
        .limit(requiredCount);
        
      if (!exercises || exercises.length < requiredCount) {
        throw new Error(`Not enough exercises found for PR test (needed ${requiredCount})`);
      }
      
      await supabase
        .from('personal_records')
        .delete()
        .eq('user_id', this.testUserId);
      
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
      
      await supabase
        .from('profiles')
        .update({ records_count: requiredCount })
        .eq('id', this.testUserId);
        
      return;
    }
  }

  private async testManualWorkoutAchievement(achievement: any): Promise<void> {
    if (!this.testUserId) return;

    if (achievement.id === 'diario-do-suor') {
      await supabase
        .from('manual_workouts')
        .delete()
        .eq('user_id', this.testUserId);
      
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
    
    if (achievement.id.includes('manual-')) {
      const requiredCount = parseInt(achievement.id.split('-')[1], 10) || 5;
      
      await supabase
        .from('manual_workouts')
        .delete()
        .eq('user_id', this.testUserId);
      
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

  private async testXPAchievement(achievement: any): Promise<void> {
    if (!this.testUserId) return;

    const requiredXP = parseInt(achievement.id.split('-')[1], 10) || 1000;
    
    const { error } = await supabase
      .from('profiles')
      .update({ xp: requiredXP })
      .eq('id', this.testUserId);
      
    if (error) {
      throw new Error(`Error updating XP: ${error.message}`);
    }
    
    await XPService.awardXP(this.testUserId, 10, 'achievement_test');
  }

  private async testLevelAchievement(achievement: any): Promise<void> {
    if (!this.testUserId) return;

    const requiredLevel = parseInt(achievement.id.split('-')[1], 10) || 5;
    
    const { error } = await supabase
      .from('profiles')
      .update({ level: requiredLevel })
      .eq('id', this.testUserId);
      
    if (error) {
      throw new Error(`Error updating level: ${error.message}`);
    }
    
    await this.simulateWorkout(this.testUserId, {
      exerciseCount: 1,
      setCount: 1,
      durationMinutes: 10
    });
  }

  private async testVarietyAchievement(achievement: any): Promise<void> {
    if (!this.testUserId) return;

    if (achievement.id === 'variety-3') {
      const workoutTypes = ['strength', 'cardio', 'flexibility'] as const;
      
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
    
    await this.simulateWorkout(this.testUserId, {
      exerciseCount: 5,
      setCount: 3,
      durationMinutes: 45,
      exerciseType: 'mixed'
    });
  }

  private async testGuildAchievement(achievement: any): Promise<void> {
    if (!this.testUserId) return;

    if (achievement.id === 'primeira-guilda') {
      let guildId: string;
      
      const { data: existingGuilds } = await supabase
        .from('guilds')
        .select('id')
        .limit(1);
        
      if (existingGuilds && existingGuilds.length > 0) {
        guildId = existingGuilds[0].id;
      } else {
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
      
      await supabase
        .from('guild_members')
        .delete()
        .eq('user_id', this.testUserId);
      
      await supabase
        .from('guild_members')
        .insert({
          user_id: this.testUserId,
          guild_id: guildId,
          role: 'member'
        });
        
      return;
    }
    
    if (achievement.id === 'multiple-guilds') {
      await supabase
        .from('guild_members')
        .delete()
        .eq('user_id', this.testUserId);
      
      for (let i = 0; i < 3; i++) {
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
    
    let exerciseQuery = supabase.from('exercises').select('id, name, type');
    
    if (params.exerciseType === 'strength') {
      exerciseQuery = exerciseQuery.in('type', EXERCISE_TYPES.COMPOUND_LIFTS);
    } else if (params.exerciseType === 'cardio') {
      exerciseQuery = exerciseQuery.in('type', EXERCISE_TYPES.CARDIO_HIIT);
    } else if (params.exerciseType === 'flexibility') {
      exerciseQuery = exerciseQuery.in('type', EXERCISE_TYPES.FLEXIBILITY);
    }
    
    const { data: exercises } = await exerciseQuery.limit(params.exerciseCount);
    
    if (!exercises || exercises.length < params.exerciseCount) {
      throw new Error(`Not enough exercises of type ${params.exerciseType} found`);
    }
    
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

try {
  await AchievementUtils.getAllAchievements();
} catch (error) {
  console.error('Failed to initialize achievement cache:', error);
}

export const AchievementTestRunners = {
  workouts: async (service: AchievementTestingService): Promise<ServiceResponse<AchievementTestResult[]>> => {
    return service.runCategoryTests(AchievementCategory.WORKOUT);
  },
  
  streaks: async (service: AchievementTestingService): Promise<ServiceResponse<AchievementTestResult[]>> => {
    return service.runCategoryTests(AchievementCategory.STREAK);
  },
  
  ranks: {
    rankE: async (service: AchievementTestingService): Promise<ServiceResponse<AchievementTestResult[]>> => {
      return service.runRankTests(AchievementRank.E);
    },
    rankD: async (service: AchievementTestingService): Promise<ServiceResponse<AchievementTestResult[]>> => {
      return service.runRankTests(AchievementRank.D);
    }
  }
};

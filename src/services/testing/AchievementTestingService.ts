import { supabase } from '@/integrations/supabase/client';
import { Achievement, AchievementCategory, AchievementRank } from '@/types/achievementTypes';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';
import { ErrorHandlingService, ServiceResponse, createErrorResponse, createSuccessResponse } from '@/services/common/ErrorHandlingService';

export interface AchievementTestResult {
  achievementId: string;
  name: string;
  category: string;
  rank: string;
  success: boolean;
  errorMessage?: string;
  testDurationMs: number;
  testedAt: Date;
}

export interface AchievementTestConfig {
  useCleanup: boolean;
  useTransaction: boolean;
  verbose: boolean;
}

export interface AchievementTestProgress {
  total: number;
  completed: number;
  successful: number;
  failed: number;
  isRunning: boolean;
  currentTest?: string;
}

type ErrorCategory = 'DATA_ERROR' | 'AUTH_ERROR' | 'API_ERROR' | 'VALIDATION_ERROR' | 'UNKNOWN_ERROR';

export class AchievementTestingService {
  private userId: string;
  private config: AchievementTestConfig;
  private progressCallback?: (progress: AchievementTestProgress) => void;
  private resultCallback?: (result: AchievementTestResult) => void;
  
  constructor(
    userId: string, 
    config: AchievementTestConfig = { 
      useCleanup: true, 
      useTransaction: true, 
      verbose: true 
    }
  ) {
    this.userId = userId;
    this.config = config;
  }
  
  onProgress(callback: (progress: AchievementTestProgress) => void) {
    this.progressCallback = callback;
    return this;
  }
  
  onResult(callback: (result: AchievementTestResult) => void) {
    this.resultCallback = callback;
    return this;
  }
  
  updateConfig(config: Partial<AchievementTestConfig>) {
    this.config = { ...this.config, ...config };
  }
  
  async testAchievement(achievementId: string): Promise<AchievementTestResult> {
    try {
      const achievement = await this.getAchievementById(achievementId);
      if (!achievement) {
        return {
          achievementId,
          name: 'Unknown Achievement',
          category: 'unknown',
          rank: 'unknown',
          success: false,
          errorMessage: 'Achievement not found',
          testDurationMs: 0,
          testedAt: new Date()
        };
      }
      
      if (this.progressCallback) {
        this.progressCallback({
          total: 1,
          completed: 0,
          successful: 0,
          failed: 0,
          isRunning: true,
          currentTest: achievement.name
        });
      }
      
      const startTime = performance.now();
      
      try {
        let success = false;
        let errorMessage = undefined;
        
        if (this.config.useTransaction) {
          try {
            await supabase.rpc('begin_transaction');
            
            const testResult = await this.executeAchievementTest(achievement);
            success = testResult.success;
            errorMessage = testResult.errorMessage;
            
            await supabase.rpc('rollback_transaction');
          } catch (err) {
            try {
              await supabase.rpc('rollback_transaction');
            } catch (rollbackErr) {
              console.error('Error rolling back transaction:', rollbackErr);
            }
            throw err;
          }
        } else {
          const testResult = await this.executeAchievementTest(achievement);
          success = testResult.success;
          errorMessage = testResult.errorMessage;
          
          if (this.config.useCleanup && success) {
            await this.cleanupAchievementTest(achievement);
          }
        }
        
        const endTime = performance.now();
        const testDurationMs = Math.round(endTime - startTime);
        
        const result: AchievementTestResult = {
          achievementId: achievement.id,
          name: achievement.name,
          category: achievement.category,
          rank: achievement.rank,
          success,
          errorMessage,
          testDurationMs,
          testedAt: new Date()
        };
        
        if (this.progressCallback) {
          this.progressCallback({
            total: 1,
            completed: 1,
            successful: success ? 1 : 0,
            failed: success ? 0 : 1,
            isRunning: false
          });
        }
        
        if (this.resultCallback) {
          this.resultCallback(result);
        }
        
        if (this.config.verbose) {
          console.log(`Test ${success ? 'PASSED' : 'FAILED'}: ${achievement.name} (${testDurationMs}ms)`);
          if (errorMessage) {
            console.error(`Error: ${errorMessage}`);
          }
        }
        
        return result;
      } catch (error) {
        const endTime = performance.now();
        const testDurationMs = Math.round(endTime - startTime);
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        const result: AchievementTestResult = {
          achievementId: achievement.id,
          name: achievement.name,
          category: achievement.category,
          rank: achievement.rank,
          success: false,
          errorMessage,
          testDurationMs,
          testedAt: new Date()
        };
        
        if (this.progressCallback) {
          this.progressCallback({
            total: 1,
            completed: 1,
            successful: 0,
            failed: 1,
            isRunning: false
          });
        }
        
        if (this.resultCallback) {
          this.resultCallback(result);
        }
        
        if (this.config.verbose) {
          console.error(`Test ERROR: ${achievement.name} (${testDurationMs}ms)`);
          console.error(error);
        }
        
        return result;
      }
    } catch (error) {
      return {
        achievementId,
        name: 'Error',
        category: 'error',
        rank: 'error',
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
        testDurationMs: 0,
        testedAt: new Date()
      };
    }
  }
  
  async runAllTests(): Promise<ServiceResponse<AchievementTestResult[]>> {
    try {
      const achievements = await AchievementUtils.getAllAchievements();
      return this.runTestsForAchievements(achievements);
    } catch (error) {
      return createErrorResponse(
        'Failed to run all tests',
        error instanceof Error ? error.message : 'Unknown error',
        'UNKNOWN_ERROR'
      );
    }
  }
  
  async runCategoryTests(category: AchievementCategory): Promise<ServiceResponse<AchievementTestResult[]>> {
    try {
      const achievements = await AchievementUtils.getAllAchievements();
      const categoryAchievements = achievements.filter(a => a.category === category);
      return this.runTestsForAchievements(categoryAchievements);
    } catch (error) {
      return createErrorResponse(
        `Failed to run tests for category ${category}`,
        error instanceof Error ? error.message : 'Unknown error',
        'UNKNOWN_ERROR'
      );
    }
  }
  
  async runRankTests(rank: AchievementRank): Promise<ServiceResponse<AchievementTestResult[]>> {
    try {
      const achievements = await AchievementUtils.getAllAchievements();
      const rankAchievements = achievements.filter(a => a.rank === rank);
      return this.runTestsForAchievements(rankAchievements);
    } catch (error) {
      return createErrorResponse(
        `Failed to run tests for rank ${rank}`,
        error instanceof Error ? error.message : 'Unknown error',
        'UNKNOWN_ERROR'
      );
    }
  }
  
  getTestReport() {
    return {
      summary: {
        total: 0,
        successful: 0,
        failed: 0,
        successRate: 0,
        coverage: {
          totalAchievements: 0,
          testedAchievements: 0,
          coveragePercentage: 0,
          byCategory: {},
          untestedAchievements: []
        }
      }
    };
  }
  
  private async runTestsForAchievements(achievements: Achievement[]): Promise<ServiceResponse<AchievementTestResult[]>> {
    if (!achievements.length) {
      return createSuccessResponse([]);
    }
    
    const results: AchievementTestResult[] = [];
    let completed = 0;
    let successful = 0;
    let failed = 0;
    
    if (this.progressCallback) {
      this.progressCallback({
        total: achievements.length,
        completed: 0,
        successful: 0,
        failed: 0,
        isRunning: true
      });
    }
    
    for (const achievement of achievements) {
      if (this.progressCallback) {
        this.progressCallback({
          total: achievements.length,
          completed,
          successful,
          failed,
          isRunning: true,
          currentTest: achievement.name
        });
      }
      
      const result = await this.testAchievement(achievement.id);
      results.push(result);
      
      completed++;
      if (result.success) {
        successful++;
      } else {
        failed++;
      }
    }
    
    if (this.progressCallback) {
      this.progressCallback({
        total: achievements.length,
        completed,
        successful,
        failed,
        isRunning: false
      });
    }
    
    return createSuccessResponse(results);
  }
  
  private async executeAchievementTest(achievement: Achievement): Promise<{ success: boolean; errorMessage?: string }> {
    try {
      if (achievement.category === AchievementCategory.WORKOUT_CATEGORY) {
        const requirements = achievement.requirements || {};
        const category = 'category' in requirements ? requirements.category : undefined;
        const count = 'count' in requirements ? requirements.count : 1;
        
        const testGenerator = new AchievementTestGenerator(this.userId);
        const testPlan = await testGenerator.generateTestPlan(achievement);
        
        if (!testPlan) {
          return { 
            success: false, 
            errorMessage: `No test plan available for achievement: ${achievement.name}` 
          };
        }
        
        const executionResult = await testPlan.execute();
        
        const verificationResult = await this.verifyAchievementAwarded(achievement.id);
        
        return { 
          success: verificationResult, 
          errorMessage: verificationResult ? undefined : 'Achievement was not awarded after test execution' 
        };
      }
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        errorMessage: error instanceof Error ? error.message : 'Unknown test execution error' 
      };
    }
  }
  
  private async cleanupAchievementTest(achievement: Achievement): Promise<void> {
    try {
      await supabase
        .from('user_achievements')
        .delete()
        .eq('user_id', this.userId)
        .eq('achievement_id', achievement.id);
        
      await supabase
        .from('achievement_progress')
        .delete()
        .eq('user_id', this.userId)
        .eq('achievement_id', achievement.id);
    } catch (error) {
      console.error(`Error cleaning up test for achievement ${achievement.name}:`, error);
    }
  }
  
  private async verifyAchievementAwarded(achievementId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', this.userId)
      .eq('achievement_id', achievementId)
      .maybeSingle();
      
    if (error) {
      throw new Error(`Error verifying achievement: ${error.message}`);
    }
    
    return !!data;
  }
  
  private async getAchievementById(achievementId: string): Promise<Achievement | null> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('id', achievementId)
        .maybeSingle();
        
      if (error) {
        throw new Error(`Error fetching achievement: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching achievement:', error);
      return null;
    }
  }
}

class AchievementTestGenerator {
  private userId: string;
  
  constructor(userId: string) {
    this.userId = userId;
  }
  
  getGenerators() {
    return [
      new WorkoutAchievementTestPlan(this.userId, null),
      new StreakAchievementTestPlan(this.userId, null),
      new RecordAchievementTestPlan(this.userId, null),
      new WorkoutCategoryTestPlan(this.userId, null)
    ];
  }
  
  async generateTestPlan(achievement: Achievement): Promise<AchievementTestPlan | null> {
    switch (achievement.category) {
      case AchievementCategory.WORKOUT:
        return new WorkoutAchievementTestPlan(this.userId, achievement);
        
      case AchievementCategory.STREAK:
        return new StreakAchievementTestPlan(this.userId, achievement);
        
      case AchievementCategory.RECORD:
        return new RecordAchievementTestPlan(this.userId, achievement);
        
      case AchievementCategory.WORKOUT_CATEGORY:
        return new WorkoutCategoryTestPlan(this.userId, achievement);
        
      default:
        return new DefaultAchievementTestPlan(this.userId, achievement);
    }
  }
}

abstract class AchievementTestPlan {
  protected userId: string;
  protected achievement: Achievement | null;
  
  constructor(userId: string, achievement: Achievement | null) {
    this.userId = userId;
    this.achievement = achievement;
  }
  
  abstract execute(): Promise<boolean>;
}

class DefaultAchievementTestPlan extends AchievementTestPlan {
  async execute(): Promise<boolean> {
    if (!this.achievement) return false;
    
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: this.userId,
          achievement_id: this.achievement.id,
          achieved_at: new Date().toISOString()
        });
        
      if (error) {
        throw new Error(`Error awarding achievement: ${error.message}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error executing default test plan:', error);
      return false;
    }
  }
}

class WorkoutAchievementTestPlan extends AchievementTestPlan {
  async execute(): Promise<boolean> {
    if (!this.achievement) return false;
    
    try {
      const requirements = this.achievement.requirements || { type: 'workout_count', value: 1 };
      
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: this.userId,
          started_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          completed_at: new Date().toISOString(),
          duration_seconds: 1800
        })
        .select('id')
        .single();
        
      if (workoutError || !workout) {
        throw new Error(`Error creating workout: ${workoutError?.message}`);
      }
      
      const { error: setError } = await supabase
        .from('workout_sets')
        .insert({
          workout_id: workout.id,
          exercise_id: '550e8400-e29b-41d4-a716-446655440000',
          set_order: 1,
          weight: 50,
          reps: 10,
          completed: true,
          completed_at: new Date().toISOString()
        });
        
      if (setError) {
        throw new Error(`Error creating workout set: ${setError.message}`);
      }
      
      const { error: profileError } = await supabase
        .rpc('increment_profile_counter', {
          user_id_param: this.userId,
          counter_name: 'workouts_count',
          increment_amount: 1
        });
        
      if (profileError) {
        throw new Error(`Error updating profile: ${profileError.message}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error executing workout test plan:', error);
      return false;
    }
  }
}

class StreakAchievementTestPlan extends AchievementTestPlan {
  async execute(): Promise<boolean> {
    if (!this.achievement) return false;
    
    try {
      const requirements = this.achievement.requirements || { type: 'streak', value: 3 };
      const streakValue = requirements.value || 3;
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          streak: streakValue,
          last_workout_at: new Date().toISOString()
        })
        .eq('id', this.userId);
        
      if (profileError) {
        throw new Error(`Error updating profile streak: ${profileError.message}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error executing streak test plan:', error);
      return false;
    }
  }
}

class RecordAchievementTestPlan extends AchievementTestPlan {
  async execute(): Promise<boolean> {
    if (!this.achievement) return false;
    
    try {
      const { data: exercise, error: exerciseError } = await supabase
        .from('exercises')
        .select('id')
        .limit(1)
        .maybeSingle();
        
      if (exerciseError) {
        throw new Error(`Error fetching exercise: ${exerciseError.message}`);
      }
      
      let exerciseId = exercise?.id;
      if (!exerciseId) {
        const { data: newExercise, error: newExerciseError } = await supabase
          .from('exercises')
          .insert({
            name: 'Test Bench Press',
            category: 'chest',
            type: 'strength',
            level: 'intermediate'
          })
          .select('id')
          .single();
          
        if (newExerciseError || !newExercise) {
          throw new Error(`Error creating exercise: ${newExerciseError?.message}`);
        }
        
        exerciseId = newExercise.id;
      }
      
      const { error: recordError } = await supabase
        .from('personal_records')
        .insert({
          user_id: this.userId,
          exercise_id: exerciseId,
          weight: 100,
          previous_weight: 90,
          recorded_at: new Date().toISOString()
        });
        
      if (recordError) {
        throw new Error(`Error creating personal record: ${recordError.message}`);
      }
      
      const { error: profileError } = await supabase
        .rpc('increment_profile_counter', {
          user_id_param: this.userId,
          counter_name: 'records_count',
          increment_amount: 1
        });
        
      if (profileError) {
        throw new Error(`Error updating profile: ${profileError.message}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error executing record test plan:', error);
      return false;
    }
  }
}

class WorkoutCategoryTestPlan extends AchievementTestPlan {
  async execute(): Promise<boolean> {
    if (!this.achievement) return false;
    
    try {
      const requirements = this.achievement.requirements || { type: 'workout_category', category: 'strength', count: 1 };
      
      const category = 'category' in requirements 
        ? requirements.category 
        : 'strength';
        
      const count = 'count' in requirements 
        ? requirements.count 
        : 1;
      
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: this.userId,
          started_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          completed_at: new Date().toISOString(),
          duration_seconds: 1800,
          type: category || 'strength'
        })
        .select('id')
        .single();
        
      if (workoutError || !workout) {
        throw new Error(`Error creating workout: ${workoutError?.message}`);
      }
      
      const { error: profileError } = await supabase
        .rpc('increment_profile_counter', {
          user_id_param: this.userId,
          counter_name: 'workouts_count',
          increment_amount: 1
        });
        
      if (profileError) {
        throw new Error(`Error updating profile: ${profileError.message}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error executing workout category test plan:', error);
      return false;
    }
  }
}


import { Achievement } from '@/types/achievementTypes';
import { AchievementProgressService } from '@/services/rpg/achievements/progress/AchievementProgressService';
import { ServiceResponse } from '@/services/common/ErrorHandlingService';

export interface TestResult {
  achievementId: string;
  success: boolean;
  error?: string;
  duration: number;
}

export class AchievementTestRunner {
  static async runTest(
    userId: string,
    achievement: Achievement,
    setupFn?: () => Promise<void>,
    cleanupFn?: () => Promise<void>
  ): Promise<TestResult> {
    const startTime = performance.now();
    
    try {
      if (setupFn) {
        await setupFn();
      }
      
      // Initialize achievement progress
      await AchievementProgressService.initializeMultipleProgress(userId, [{
        achievementId: achievement.id,
        targetValue: achievement.requirements.value
      }]);
      
      // Run achievement specific test logic here
      // This would be implemented by specific test runners
      
      const endTime = performance.now();
      
      if (cleanupFn) {
        await cleanupFn();
      }
      
      return {
        achievementId: achievement.id,
        success: true,
        duration: endTime - startTime
      };
      
    } catch (error) {
      return {
        achievementId: achievement.id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: performance.now() - startTime
      };
    }
  }
}

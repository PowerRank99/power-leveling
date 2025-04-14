
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AchievementService } from '@/services/rpg/AchievementService';
import { AchievementProgressService } from '@/services/rpg/achievements/AchievementProgressService';
import { WorkoutAchievementChecker } from '@/services/rpg/achievements/WorkoutAchievementChecker';
import { supabase } from '@/integrations/supabase/client';

// Mock all required dependencies
vi.mock('@/integrations/supabase/client');
vi.mock('@/services/rpg/achievements/AchievementProgressService');
vi.mock('@/services/rpg/achievements/WorkoutAchievementChecker');

describe('Achievement Flow Integration', () => {
  const mockUserId = 'test-user-id';
  const mockWorkoutId = 'test-workout-id';

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('Complete achievement flow', () => {
    it('should process workout completion and award achievements', async () => {
      // Mock successful workout completion
      vi.mocked(WorkoutAchievementChecker.checkAchievements).mockResolvedValue({
        success: true,
        data: ['primeiro-treino']
      });

      // Mock progress update
      vi.mocked(AchievementProgressService.updateWorkoutCountProgress).mockResolvedValue({
        success: true,
        data: true
      });

      const result = await AchievementService.checkWorkoutAchievements(mockUserId, mockWorkoutId);

      expect(result.success).toBe(true);
      expect(WorkoutAchievementChecker.checkAchievements).toHaveBeenCalledWith(mockUserId);
      expect(AchievementProgressService.updateWorkoutCountProgress).toHaveBeenCalled();
    });

    it('should handle transaction failures gracefully', async () => {
      // Mock database error
      vi.mocked(WorkoutAchievementChecker.checkAchievements).mockRejectedValue(new Error('DB Error'));

      const result = await AchievementService.checkWorkoutAchievements(mockUserId, mockWorkoutId);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should maintain data consistency on partial failures', async () => {
      // Mock successful achievement check but failed progress update
      vi.mocked(WorkoutAchievementChecker.checkAchievements).mockResolvedValue({
        success: true,
        data: ['primeiro-treino']
      });

      vi.mocked(AchievementProgressService.updateWorkoutCountProgress).mockRejectedValue(
        new Error('Progress Update Failed')
      );

      const result = await AchievementService.checkWorkoutAchievements(mockUserId, mockWorkoutId);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});

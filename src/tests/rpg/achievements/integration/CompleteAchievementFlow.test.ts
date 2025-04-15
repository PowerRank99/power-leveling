import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { AchievementManager } from '@/services/rpg/achievements/AchievementManager';
import { AchievementService } from '@/services/rpg/AchievementService';
import { AchievementProgressService } from '@/services/rpg/achievements/AchievementProgressService';

vi.mock('@/integrations/supabase/client');
vi.mock('@/services/rpg/AchievementService');
vi.mock('@/services/rpg/achievements/AchievementProgressService');

describe('Complete Achievement Flow Integration', () => {
  const mockUserId = 'test-user-id';
  const mockWorkoutId = 'test-workout-id';

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('Workout completion flow', () => {
    it('should process all achievement types when completing a workout', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: {
              workouts_count: 1,
              streak: 7
            },
            error: null
          })
        })
      } as any);

      // Process workout completion
      const result = await AchievementManager.processWorkoutCompletion(mockUserId, mockWorkoutId);

      expect(result.success).toBe(true);
      expect(AchievementService.checkAndAwardAchievements).toHaveBeenCalled();
      expect(AchievementProgressService.updateWorkoutCountProgress).toHaveBeenCalled();
    });

    it('should handle transaction failures', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockRejectedValue(new Error('Transaction failed'))
        })
      } as any);

      const result = await AchievementManager.processWorkoutCompletion(mockUserId, mockWorkoutId);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should maintain data consistency on partial success', async () => {
      // Mock successful achievement check but failed progress update
      vi.mocked(AchievementService.checkAndAwardAchievements)
        .mockResolvedValue({ success: true, data: true });
      vi.mocked(AchievementProgressService.updateWorkoutCountProgress)
        .mockRejectedValue(new Error('Progress update failed'));

      const result = await AchievementManager.processWorkoutCompletion(mockUserId, mockWorkoutId);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Achievement Progress Tracking', () => {
    it('should track incremental achievements properly', async () => {
      const progressUpdates = [
        { achievementId: 'workout-streak-7', currentValue: 5, targetValue: 7, isComplete: false },
        { achievementId: 'xp-milestone-1000', currentValue: 800, targetValue: 1000, isComplete: false }
      ];

      const result = await AchievementProgressService.updateMultipleProgressValues(mockUserId, progressUpdates);
      expect(result.success).toBe(true);
    });

    it('should handle achievement completion events', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: {
              workouts_count: 10,
              streak: 7,
              xp: 1000
            },
            error: null
          })
        })
      } as any);

      const result = await AchievementManager.processWorkoutCompletion(mockUserId, mockWorkoutId);
      expect(result.success).toBe(true);
      expect(AchievementService.checkAndAwardAchievements).toHaveBeenCalled();
    });
  });

  describe('Class Bonus Integration', () => {
    it('should apply class bonuses to achievement progress', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: {
              class: 'guerreiro',
              workouts_count: 1
            },
            error: null
          })
        })
      } as any);

      const result = await AchievementManager.processWorkoutCompletion(mockUserId, mockWorkoutId);
      expect(result.success).toBe(true);
      expect(AchievementProgressService.updateWorkoutCountProgress).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should handle missing user profile', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null
          })
        })
      } as any);

      const result = await AchievementManager.processWorkoutCompletion(mockUserId, mockWorkoutId);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle invalid achievement IDs', async () => {
      const result = await AchievementService.checkAndAwardAchievements(mockUserId, ['invalid-id']);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});

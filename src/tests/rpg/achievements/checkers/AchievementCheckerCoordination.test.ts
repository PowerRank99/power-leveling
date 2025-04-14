
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnifiedAchievementChecker } from '@/services/rpg/achievements/UnifiedAchievementChecker';
import { supabase } from '@/integrations/supabase/client';
import { AchievementService } from '@/services/rpg/AchievementService';

vi.mock('@/integrations/supabase/client');
vi.mock('@/services/rpg/AchievementService');

describe('Achievement Checker Coordination', () => {
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('checkers coordination', () => {
    it('should coordinate multiple achievement checks in processCompletedWorkout', async () => {
      // Mock workout achievements check
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: { workouts_count: 10, streak: 7, class: 'guerreiro' },
            error: null
          })
        })
      } as any);

      const result = await UnifiedAchievementChecker.processCompletedWorkout(mockUserId);
      
      expect(result.success).toBe(true);
      expect(result.data?.length).toBeGreaterThan(0);
    });

    it('should handle achievement check failures gracefully', async () => {
      // Mock a failure in one checker
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockRejectedValue(new Error('Checker failed'))
        })
      } as any);

      const result = await UnifiedAchievementChecker.processCompletedWorkout(mockUserId);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('data consistency', () => {
    it('should maintain achievement progress data consistency', async () => {
      // Setup mock data
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: { workouts_count: 5 },
            error: null
          })
        })
      } as any);

      // Process achievements
      await UnifiedAchievementChecker.processCompletedWorkout(mockUserId);

      // Verify appropriate services were called
      expect(AchievementService.checkAndAwardAchievements).toHaveBeenCalled();
    });
  });
});

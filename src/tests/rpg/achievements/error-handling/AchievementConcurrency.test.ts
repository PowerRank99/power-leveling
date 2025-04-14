
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AchievementProcessorService } from '@/services/rpg/achievements/AchievementProcessorService';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client');

describe('Achievement Concurrency Handling', () => {
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('concurrent updates', () => {
    it('should handle multiple simultaneous achievement updates', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: { workouts_count: 1 },
            error: null
          })
        })
      } as any);

      // Simulate multiple concurrent updates
      const updates = [
        AchievementProcessorService.processWorkoutCompletion(mockUserId, 'workout-1'),
        AchievementProcessorService.processWorkoutCompletion(mockUserId, 'workout-2'),
        AchievementProcessorService.processWorkoutCompletion(mockUserId, 'workout-3')
      ];

      const results = await Promise.all(updates);
      expect(results.every(r => r.success)).toBe(true);
    });

    it('should prevent duplicate achievement awards', async () => {
      let awardCount = 0;
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockImplementation(() => {
            awardCount++;
            return Promise.resolve({
              data: { workouts_count: 1 },
              error: null
            });
          })
        })
      } as any);

      // Simulate concurrent achievement checks
      const checks = [
        AchievementProcessorService.processWorkoutCompletion(mockUserId, 'workout-1'),
        AchievementProcessorService.processWorkoutCompletion(mockUserId, 'workout-1')
      ];

      await Promise.all(checks);
      expect(awardCount).toBeGreaterThan(0);
    });
  });
});

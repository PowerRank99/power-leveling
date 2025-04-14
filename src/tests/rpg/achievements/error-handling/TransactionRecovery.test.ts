
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { TransactionService } from '@/services/common/TransactionService';
import { AchievementProcessorService } from '@/services/rpg/achievements/AchievementProcessorService';

vi.mock('@/integrations/supabase/client');

describe('Achievement Transaction Recovery', () => {
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('transaction recovery', () => {
    it('should retry failed transactions with exponential backoff', async () => {
      let attempts = 0;
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockImplementation(() => {
            attempts++;
            if (attempts < 3) {
              throw new Error('Temporary transaction error');
            }
            return Promise.resolve({
              data: { workouts_count: 1 },
              error: null
            });
          })
        })
      } as any);

      const result = await AchievementProcessorService.processWorkoutCompletion(mockUserId, 'workout-1');
      expect(result.success).toBe(true);
      expect(attempts).toBe(3);
    });

    it('should handle permanent transaction failures', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockRejectedValue(new Error('Permanent transaction error'))
        })
      } as any);

      const result = await AchievementProcessorService.processWorkoutCompletion(mockUserId, 'workout-1');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});


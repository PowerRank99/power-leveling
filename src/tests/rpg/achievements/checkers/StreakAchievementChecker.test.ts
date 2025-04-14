
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StreakAchievementChecker } from '@/services/rpg/achievements/StreakAchievementChecker';
import { supabase } from '@/integrations/supabase/client';
import { AchievementService } from '@/services/rpg/AchievementService';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(),
      eq: vi.fn(),
      single: vi.fn()
    }))
  }
}));

vi.mock('@/services/rpg/AchievementService', () => ({
  AchievementService: {
    checkAndAwardAchievements: vi.fn()
  }
}));

describe('StreakAchievementChecker', () => {
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('checkAchievements', () => {
    it('should award streak achievements based on profile data', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { streak: 7 },
              error: null
            })
          })
        })
      } as any);

      const result = await StreakAchievementChecker.checkAchievements(mockUserId);
      expect(result.success).toBe(true);
      expect(AchievementService.checkAndAwardAchievements).toHaveBeenCalledWith(
        mockUserId,
        expect.arrayContaining(['streak-7'])
      );
    });

    it('should handle multiple streak achievements', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { streak: 14 },
              error: null
            })
          })
        })
      } as any);

      const result = await StreakAchievementChecker.checkAchievements(mockUserId);
      expect(result.success).toBe(true);
      expect(AchievementService.checkAndAwardAchievements).toHaveBeenCalledWith(
        mockUserId,
        expect.arrayContaining(['streak-7', 'streak-14'])
      );
    });

    it('should handle database errors', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: new Error('Database error')
            })
          })
        })
      } as any);

      const result = await StreakAchievementChecker.checkAchievements(mockUserId);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});

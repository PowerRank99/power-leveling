
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { XPAchievementChecker } from '@/services/rpg/achievements/XPAchievementChecker';
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

vi.mock('@/services/rpg/AchievementService');

describe('XPAchievementChecker', () => {
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('checkAchievements', () => {
    it('should award XP milestone achievements', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { xp: 5000, level: 10 },
              error: null
            })
          })
        })
      } as any);

      const result = await XPAchievementChecker.checkAchievements(mockUserId);
      expect(result.success).toBe(true);
      expect(AchievementService.checkAndAwardAchievements).toHaveBeenCalledWith(
        mockUserId,
        expect.arrayContaining(['xp-1000', 'xp-5000', 'level-10'])
      );
    });

    it('should handle missing user profile', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: null
            })
          })
        })
      } as any);

      const result = await XPAchievementChecker.checkAchievements(mockUserId);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
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

      const result = await XPAchievementChecker.checkAchievements(mockUserId);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});

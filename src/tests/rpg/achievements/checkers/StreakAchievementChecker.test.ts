
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
    it('should check streak achievements based on profile data', async () => {
      const mockProfile = {
        streak: 7
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockProfile, error: null })
          })
        })
      } as any);

      await StreakAchievementChecker.checkAchievements(mockUserId);

      expect(AchievementService.checkAndAwardAchievements).toHaveBeenCalledWith(
        mockUserId,
        expect.arrayContaining(['streak-7'])
      );
    });

    it('should handle multiple streak achievements', async () => {
      const mockProfile = {
        streak: 14
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockProfile, error: null })
          })
        })
      } as any);

      await StreakAchievementChecker.checkAchievements(mockUserId);

      expect(AchievementService.checkAndAwardAchievements).toHaveBeenCalledWith(
        mockUserId,
        expect.arrayContaining(['streak-7', 'streak-14'])
      );
    });

    it('should handle database errors', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: new Error('DB Error') })
          })
        })
      } as any);

      const result = await StreakAchievementChecker.checkAchievements(mockUserId);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});

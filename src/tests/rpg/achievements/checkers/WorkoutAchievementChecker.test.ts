
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkoutAchievementChecker } from '@/services/rpg/achievements/WorkoutAchievementChecker';
import { supabase } from '@/integrations/supabase/client';
import { AchievementService } from '@/services/rpg/AchievementService';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(),
      eq: vi.fn(),
      single: vi.fn(),
      count: vi.fn()
    }))
  }
}));

// Mock AchievementService
vi.mock('@/services/rpg/AchievementService', () => ({
  AchievementService: {
    checkAndAwardAchievements: vi.fn()
  }
}));

describe('WorkoutAchievementChecker', () => {
  const mockUserId = 'test-user-id';
  
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('checkAchievements', () => {
    it('should check first workout achievement', async () => {
      // Mock profile data
      const mockProfile = {
        workouts_count: 1,
        streak: 0
      };
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockProfile, error: null })
          })
        }),
        count: vi.fn()
      } as any);

      await WorkoutAchievementChecker.checkAchievements(mockUserId);

      expect(AchievementService.checkAndAwardAchievements).toHaveBeenCalledWith(
        mockUserId,
        expect.arrayContaining(['primeiro-treino'])
      );
    });

    it('should check streak achievements', async () => {
      const mockProfile = {
        workouts_count: 10,
        streak: 7
      };
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockProfile, error: null })
          })
        }),
        count: vi.fn()
      } as any);

      await WorkoutAchievementChecker.checkAchievements(mockUserId);

      expect(AchievementService.checkAndAwardAchievements).toHaveBeenCalledWith(
        mockUserId,
        expect.arrayContaining(['semana-impecavel'])
      );
    });

    it('should handle database errors gracefully', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: new Error('DB Error') })
          })
        }),
        count: vi.fn()
      } as any);

      const result = await WorkoutAchievementChecker.checkAchievements(mockUserId);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});

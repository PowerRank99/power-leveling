
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkoutCategoryChecker } from '@/services/rpg/achievements/workout/WorkoutCategoryChecker';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client');

describe('WorkoutCategoryChecker', () => {
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('checkWorkoutCategoryAchievements', () => {
    it('should award strength achievement for 10 strength workouts', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            not: vi.fn().mockResolvedValue({
              data: Array(10).fill({ category: 'strength' }),
              error: null
            })
          })
        })
      } as any);

      const achievementsToCheck: string[] = [];
      await WorkoutCategoryChecker.checkWorkoutCategoryAchievements(mockUserId, achievementsToCheck);
      expect(achievementsToCheck).toContain('forca-de-guerreiro');
    });

    it('should award cardio achievement for 10 cardio workouts', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            not: vi.fn().mockResolvedValue({
              data: Array(10).fill({ category: 'cardio' }),
              error: null
            })
          })
        })
      } as any);

      const achievementsToCheck: string[] = [];
      await WorkoutCategoryChecker.checkWorkoutCategoryAchievements(mockUserId, achievementsToCheck);
      expect(achievementsToCheck).toContain('cardio-sem-folego');
    });

    it('should handle database errors gracefully', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            not: vi.fn().mockResolvedValue({
              data: null,
              error: new Error('Database error')
            })
          })
        })
      } as any);

      const achievementsToCheck: string[] = [];
      await WorkoutCategoryChecker.checkWorkoutCategoryAchievements(mockUserId, achievementsToCheck);
      expect(achievementsToCheck).toHaveLength(0);
    });
  });
});

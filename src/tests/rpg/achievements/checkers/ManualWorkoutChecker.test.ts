
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ManualWorkoutChecker } from '@/services/rpg/achievements/workout/ManualWorkoutChecker';
import { supabase } from '@/integrations/supabase/client';
import { AchievementService } from '@/services/rpg/AchievementService';

vi.mock('@/integrations/supabase/client');
vi.mock('@/services/rpg/AchievementService');

describe('ManualWorkoutChecker', () => {
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('checkManualWorkoutAchievements', () => {
    it('should award achievement for completing 3 manual workouts', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: Array(3).fill({ id: 'workout-id' }),
            count: 3,
            error: null
          })
        })
      } as any);

      const result = await ManualWorkoutChecker.checkAchievements(mockUserId);
      expect(result.success).toBe(true);
      expect(AchievementService.checkAndAwardAchievements).toHaveBeenCalledWith(
        mockUserId,
        expect.arrayContaining(['diario-do-suor'])
      );
    });

    it('should handle database errors gracefully', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockRejectedValue(new Error('Database error'))
        })
      } as any);

      const result = await ManualWorkoutChecker.checkAchievements(mockUserId);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});


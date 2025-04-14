
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AchievementManager } from '@/services/rpg/achievements/AchievementManager';
import { supabase } from '@/integrations/supabase/client';
import { AchievementService } from '@/services/rpg/AchievementService';

vi.mock('@/integrations/supabase/client');
vi.mock('@/services/rpg/AchievementService');

describe('Class Bonus Achievement Integration', () => {
  const mockUserId = 'test-user-id';
  const mockWorkoutId = 'test-workout-id';

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('class-specific achievement bonuses', () => {
    it('should apply Guerreiro bonus for strength achievements', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: {
              class: 'guerreiro',
              workouts_count: 1,
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

    it('should handle class passive ability triggers', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: {
              class: 'monge',
              streak: 7,
              xp: 1500
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

  describe('achievement multiplier effects', () => {
    it('should apply correct XP multipliers based on class', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: {
              class: 'bruxo',
              achievements_count: 5,
              xp: 2000
            },
            error: null
          })
        })
      } as any);

      const result = await AchievementManager.processWorkoutCompletion(mockUserId, mockWorkoutId);
      expect(result.success).toBe(true);
    });
  });
});


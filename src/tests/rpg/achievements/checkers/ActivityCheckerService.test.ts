
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ActivityCheckerService } from '@/services/rpg/achievements/checkers/ActivityCheckerService';
import { supabase } from '@/integrations/supabase/client';
import { AchievementService } from '@/services/rpg/AchievementService';

vi.mock('@/integrations/supabase/client');
vi.mock('@/services/rpg/AchievementService');

describe('ActivityCheckerService', () => {
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('checkAchievements', () => {
    it('should award activity variety achievements', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: ['cardio', 'strength', 'mobility', 'sport', 'calisthenics'],
        error: null
      });

      const result = await ActivityCheckerService.checkActivityVarietyAchievements(mockUserId);
      expect(result.success).toBe(true);
      expect(AchievementService.checkAndAwardAchievements).toHaveBeenCalledWith(
        mockUserId,
        expect.arrayContaining(['activity-variety-3', 'activity-variety-5'])
      );
    });

    it('should handle insufficient activity types', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: ['cardio', 'strength'],
        error: null
      });

      const result = await ActivityCheckerService.checkActivityVarietyAchievements(mockUserId);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should handle database errors', async () => {
      vi.mocked(supabase.rpc).mockRejectedValue(new Error('Database error'));

      const result = await ActivityCheckerService.checkActivityVarietyAchievements(mockUserId);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});


import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecordCheckerService } from '@/services/rpg/achievements/checkers/RecordCheckerService';
import { supabase } from '@/integrations/supabase/client';
import { AchievementService } from '@/services/rpg/AchievementService';

vi.mock('@/integrations/supabase/client');
vi.mock('@/services/rpg/AchievementService');

describe('RecordCheckerService', () => {
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('checkAchievements', () => {
    it('should award personal record achievements', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: Array(10).fill({ id: 'record-id' }),
            count: 10,
            error: null
          })
        })
      } as any);

      const result = await RecordCheckerService.checkPersonalRecordAchievements(mockUserId);
      expect(result.success).toBe(true);
      expect(AchievementService.checkAndAwardAchievements).toHaveBeenCalledWith(
        mockUserId,
        expect.arrayContaining(['pr-first', 'pr-5', 'pr-10'])
      );
    });

    it('should handle no records', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [],
            count: 0,
            error: null
          })
        })
      } as any);

      const result = await RecordCheckerService.checkPersonalRecordAchievements(mockUserId);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should handle database errors', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockRejectedValue(new Error('Database error'))
        })
      } as any);

      const result = await RecordCheckerService.checkPersonalRecordAchievements(mockUserId);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});

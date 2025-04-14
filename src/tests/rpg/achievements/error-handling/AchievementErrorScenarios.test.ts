
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { AchievementProcessorService } from '@/services/rpg/achievements/AchievementProcessorService';
import { ErrorCategory, createErrorResponse } from '@/services/common/ErrorHandlingService';

vi.mock('@/integrations/supabase/client');

describe('Achievement Error Scenarios', () => {
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('Database errors', () => {
    it('should handle connection errors', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockRejectedValue(new Error('Connection failed'))
      } as any);

      const result = await AchievementProcessorService.processWorkoutCompletion(mockUserId, 'workout-id');
      expect(result.success).toBe(false);
      expect((result.error as any)?.category).toBe(ErrorCategory.DATABASE);
    });

    it('should handle timeout errors', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockRejectedValue(new Error('Request timeout'))
      } as any);

      const result = await AchievementProcessorService.processWorkoutCompletion(mockUserId, 'workout-id');
      expect(result.success).toBe(false);
      expect((result.error as any)?.category).toBe(ErrorCategory.NETWORK);
    });
  });

  describe('Data validation errors', () => {
    it('should handle invalid user ID', async () => {
      const result = await AchievementProcessorService.processWorkoutCompletion('', 'workout-id');
      expect(result.success).toBe(false);
      expect((result.error as any)?.category).toBe(ErrorCategory.VALIDATION);
    });

    it('should handle invalid achievement data', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: { invalid: 'data' },
          error: null
        })
      } as any);

      const result = await AchievementProcessorService.processWorkoutCompletion(mockUserId, 'workout-id');
      expect(result.success).toBe(false);
      expect((result.error as any)?.category).toBe(ErrorCategory.VALIDATION);
    });
  });

  describe('Transaction errors', () => {
    it('should handle partial transaction failures', async () => {
      const mockError = new Error('Transaction partially failed');
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockRejectedValue(mockError)
      } as any);

      const result = await AchievementProcessorService.processWorkoutCompletion(mockUserId, 'workout-id');
      expect(result.success).toBe(false);
      expect((result.error as any)?.category).toBe(ErrorCategory.DATABASE);
    });
  });
});


import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AchievementProgressService } from '@/services/rpg/achievements/AchievementProgressService';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      upsert: vi.fn(),
      select: vi.fn(),
      eq: vi.fn()
    }))
  }
}));

describe('AchievementProgressService', () => {
  const mockUserId = 'test-user-id';
  const mockAchievementId = 'test-achievement-id';

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('updateProgress', () => {
    it('should update progress successfully', async () => {
      const mockUpsertResponse = { data: { id: 1 }, error: null };
      vi.mocked(supabase.from().upsert).mockResolvedValue(mockUpsertResponse as any);

      const result = await AchievementProgressService.updateProgress(
        mockUserId,
        mockAchievementId,
        5,
        10,
        false
      );

      expect(result.success).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('achievement_progress');
      expect(supabase.from().upsert).toHaveBeenCalledWith({
        user_id: mockUserId,
        achievement_id: mockAchievementId,
        current_value: 5,
        target_value: 10,
        is_complete: false
      });
    });

    it('should handle errors appropriately', async () => {
      const mockError = new Error('Database error');
      vi.mocked(supabase.from().upsert).mockRejectedValue(mockError);

      const result = await AchievementProgressService.updateProgress(
        mockUserId,
        mockAchievementId,
        5,
        10,
        false
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to update achievement progress');
    });
  });

  describe('getProgress', () => {
    it('should fetch progress successfully', async () => {
      const mockProgress = {
        current_value: 5,
        target_value: 10,
        is_complete: false
      };
      
      vi.mocked(supabase.from().select).mockResolvedValue({ 
        data: [mockProgress],
        error: null
      } as any);

      const result = await AchievementProgressService.getProgress(
        mockUserId,
        mockAchievementId
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProgress);
      expect(supabase.from).toHaveBeenCalledWith('achievement_progress');
    });

    it('should handle missing progress data', async () => {
      vi.mocked(supabase.from().select).mockResolvedValue({ 
        data: [],
        error: null
      } as any);

      const result = await AchievementProgressService.getProgress(
        mockUserId,
        mockAchievementId
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });
  });
});

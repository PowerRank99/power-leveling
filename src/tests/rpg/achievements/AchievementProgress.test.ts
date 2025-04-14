
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AchievementProgressService } from '@/services/rpg/achievements/AchievementProgressService';
import { supabase } from '@/integrations/supabase/client';
import { ProgressBaseService } from '@/services/rpg/achievements/progress/ProgressBaseService';

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

// Mock ProgressBaseService since it contains the actual getProgress method
vi.mock('@/services/rpg/achievements/progress/ProgressBaseService', () => ({
  ProgressBaseService: {
    getProgress: vi.fn()
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
      vi.mocked(supabase.from).mockReturnValue({
        upsert: vi.fn().mockResolvedValue(mockUpsertResponse),
        select: vi.fn(),
        eq: vi.fn()
      } as any);

      const result = await AchievementProgressService.updateProgress(
        mockUserId,
        mockAchievementId,
        5,
        10,
        false
      );

      expect(result.success).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('achievement_progress');
    });

    it('should handle errors appropriately', async () => {
      const mockError = new Error('Database error');
      vi.mocked(supabase.from).mockReturnValue({
        upsert: vi.fn().mockRejectedValue(mockError),
        select: vi.fn(),
        eq: vi.fn()
      } as any);

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
      
      // Mock the ProgressBaseService.getProgress method
      vi.mocked(ProgressBaseService.getProgress).mockResolvedValue({ 
        success: true, 
        data: {
          id: '123',
          current: 5,
          total: 10,
          isComplete: false
        }
      });

      // Now we call a method that exists on the service via the facade
      const result = await AchievementProgressService.getAchievementProgress(
        mockUserId,
        mockAchievementId
      );

      expect(result.success).toBe(true);
      expect(ProgressBaseService.getProgress).toHaveBeenCalledWith(mockUserId, mockAchievementId);
    });

    it('should handle missing progress data', async () => {
      // Mock the response for null data
      vi.mocked(ProgressBaseService.getProgress).mockResolvedValue({
        success: true,
        data: null
      });

      // Use the correct method
      const result = await AchievementProgressService.getAchievementProgress(
        mockUserId,
        mockAchievementId
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
      expect(ProgressBaseService.getProgress).toHaveBeenCalledWith(mockUserId, mockAchievementId);
    });
  });
});

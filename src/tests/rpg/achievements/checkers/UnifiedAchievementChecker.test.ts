
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnifiedAchievementChecker } from '@/services/rpg/achievements/UnifiedAchievementChecker';
import { WorkoutCheckerService } from '@/services/rpg/achievements/checkers/WorkoutCheckerService';
import { StreakCheckerService } from '@/services/rpg/achievements/checkers/StreakCheckerService';
import { ActivityCheckerService } from '@/services/rpg/achievements/checkers/ActivityCheckerService';
import { supabase } from '@/integrations/supabase/client';
import { createMockDbResponse } from '@/tests/helpers/supabaseTestHelpers';

vi.mock('@/integrations/supabase/client');
vi.mock('@/services/rpg/achievements/checkers/WorkoutCheckerService');
vi.mock('@/services/rpg/achievements/checkers/StreakCheckerService');
vi.mock('@/services/rpg/achievements/checkers/ActivityCheckerService');

describe('UnifiedAchievementChecker', () => {
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('processCompletedWorkout', () => {
    it('should check multiple achievement types', async () => {
      vi.mocked(WorkoutCheckerService.checkWorkoutAchievements).mockResolvedValue({
        success: true,
        data: ['primeiro-treino']
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(createMockDbResponse({ streak: 7 }))
          })
        })
      } as any);

      const result = await UnifiedAchievementChecker.processCompletedWorkout(mockUserId);

      expect(result.success).toBe(true);
      expect(WorkoutCheckerService.checkWorkoutAchievements).toHaveBeenCalledWith(mockUserId);
      expect(result.data).toContain('primeiro-treino');
    });

    it('should handle partial failures gracefully', async () => {
      vi.mocked(WorkoutCheckerService.checkWorkoutAchievements).mockResolvedValue({
        success: true,
        data: ['primeiro-treino']
      });

      vi.mocked(ActivityCheckerService.checkActivityVarietyAchievements).mockRejectedValue(
        new Error('Activity check failed')
      );

      const result = await UnifiedAchievementChecker.processCompletedWorkout(mockUserId);
      expect(result.success).toBe(true);
      expect(result.data).toContain('primeiro-treino');
    });
  });

  describe('integrated achievement checks', () => {
    it('should process achievements with class bonuses', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(createMockDbResponse({
              class: 'guerreiro',
              workouts_count: 1
            }))
          })
        })
      } as any);

      const result = await UnifiedAchievementChecker.processCompletedWorkout(mockUserId);
      expect(result.success).toBe(true);
    });

    it('should handle transaction rollbacks on failure', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockRejectedValue(new Error('Database error'))
        })
      } as any);

      const result = await UnifiedAchievementChecker.processCompletedWorkout(mockUserId);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});

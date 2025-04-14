
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkoutCompletionService } from '@/services/workout/WorkoutCompletionService';
import { XPService } from '@/services/rpg/XPService';
import { StreakService } from '@/services/rpg/StreakService';
import { PersonalRecordService } from '@/services/rpg/PersonalRecordService';
import { createMockSupabaseClient } from '../helpers/supabaseTestHelpers';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: createMockSupabaseClient()
}));

vi.mock('@/services/rpg/XPService');
vi.mock('@/services/rpg/StreakService');
vi.mock('@/services/rpg/PersonalRecordService');

describe('Workout Lifecycle Integration Tests', () => {
  const mockWorkoutId = 'test-workout-id';
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    vi.resetAllMocks();
    
    // Setup mock implementations
    vi.mocked(supabase.from).mockImplementation((table) => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: mockWorkoutId, user_id: mockUserId },
            error: null
          })
        })
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: null
        })
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: null
        })
      })
    }));

    vi.mocked(XPService.awardWorkoutXP).mockResolvedValue(true);
    vi.mocked(StreakService.updateStreak).mockResolvedValue({ success: true });
    vi.mocked(PersonalRecordService.checkForPersonalRecords).mockResolvedValue({ 
      success: true, 
      data: [] 
    });
  });

  it('should process workout completion successfully', async () => {
    const result = await WorkoutCompletionService.finishWorkout(mockWorkoutId, 1800);
    
    expect(result).toBe(true);
    expect(XPService.awardWorkoutXP).toHaveBeenCalled();
    expect(StreakService.updateStreak).toHaveBeenCalled();
    expect(PersonalRecordService.checkForPersonalRecords).toHaveBeenCalled();
  });

  it('should handle transaction rollback on error', async () => {
    // Simulate a database error
    vi.mocked(supabase.from).mockImplementationOnce(() => ({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: new Error('Database error')
        })
      })
    }));

    const result = await WorkoutCompletionService.finishWorkout(mockWorkoutId, 1800);
    
    expect(result).toBe(false);
    expect(supabase.rpc).toHaveBeenCalledWith('rollback_transaction');
  });

  it('should handle workout discard correctly', async () => {
    const result = await WorkoutCompletionService.discardWorkout(mockWorkoutId);
    
    expect(result).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith('workout_sets');
    expect(supabase.from).toHaveBeenCalledWith('workouts');
  });
});

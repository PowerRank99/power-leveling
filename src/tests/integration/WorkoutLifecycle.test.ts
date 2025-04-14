
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkoutCompletionService } from '@/services/workout/WorkoutCompletionService';
import { XPService } from '@/services/rpg/XPService';
import { StreakService } from '@/services/rpg/StreakService';
import { PersonalRecordService } from '@/services/rpg/PersonalRecordService';
import { createMockSupabaseClient } from '../helpers/supabaseTestHelpers';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseResult } from '@/types/workout';

// Create a more comprehensive mock for the Supabase client
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
    
    // Setup mock implementations with complete return types
    vi.mocked(supabase.from).mockImplementation((table) => {
      // Create a properly typed mock PostgrestQueryBuilder
      return {
        url: '',
        headers: {},
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: mockWorkoutId, user_id: mockUserId },
              error: null
            })
          }),
          order: vi.fn().mockReturnValue({
            data: [],
            error: null
          })
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: null,
            error: null
          })
        }),
        upsert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: null,
            error: null
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
      } as any;
    });

    vi.mocked(XPService.awardWorkoutXP).mockResolvedValue(true);
    vi.mocked(StreakService.updateStreak).mockResolvedValue({ success: true });
    
    // Ensure PersonalRecordService mock returns a properly typed DatabaseResult
    vi.mocked(PersonalRecordService.checkForPersonalRecords).mockResolvedValue({ 
      success: true, 
      data: [],
      error: null
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
    // Simulate a database error with properly typed mock
    vi.mocked(supabase.from).mockImplementationOnce(() => ({
      url: '',
      headers: {},
      select: vi.fn(),
      insert: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: new Error('Database error')
        })
      }),
      delete: vi.fn()
    } as any));

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

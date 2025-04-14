
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { WorkoutCompletionService } from '@/services/workout/WorkoutCompletionService';
import { XPService } from '@/services/rpg/XPService';
import { StreakService } from '@/services/rpg/StreakService';
import { PersonalRecordService } from '@/services/rpg/PersonalRecordService';

// Mock the services
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: vi.fn(() => ({ data: null, error: null })),
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: null, error: null })),
          order: vi.fn(() => ({ data: null, error: null }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({ data: null, error: null }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({ data: null, error: null }))
      }))
    }))
  }
}));

vi.mock('@/services/rpg/XPService', () => ({
  XPService: {
    checkForPersonalRecords: vi.fn().mockResolvedValue(true),
    awardWorkoutXP: vi.fn().mockResolvedValue(true)
  }
}));

vi.mock('@/services/rpg/StreakService', () => ({
  StreakService: {
    updateStreak: vi.fn().mockResolvedValue({ success: true })
  }
}));

vi.mock('@/services/rpg/PersonalRecordService', () => ({
  PersonalRecordService: {
    checkForPersonalRecords: vi.fn().mockResolvedValue({ success: true, data: [] })
  }
}));

describe('Workout Completion Flow', () => {
  const mockWorkoutId = 'test-workout-id';
  const mockUserId = 'test-user-id';
  
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    
    // Setup mock responses
    vi.mocked(supabase.from).mockImplementation((table) => {
      if (table === 'workouts') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: mockWorkoutId, user_id: mockUserId, routine_id: 'test-routine-id' },
                error: null
              })
            })
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: null,
              error: null
            })
          })
        } as any;
      }
      if (table === 'workout_sets') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [
                  { 
                    id: 'set1', 
                    exercise_id: 'ex1', 
                    set_order: 1, 
                    weight: 50, 
                    reps: 10, 
                    completed: true
                  },
                  { 
                    id: 'set2', 
                    exercise_id: 'ex1', 
                    set_order: 2, 
                    weight: 50, 
                    reps: 10, 
                    completed: true
                  },
                  { 
                    id: 'set3', 
                    exercise_id: 'ex2', 
                    set_order: 1, 
                    weight: 70, 
                    reps: 8, 
                    completed: true
                  }
                ],
                error: null
              })
            })
          })
        } as any;
      }
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: mockUserId, streak: 3, class: 'Guerreiro' },
                error: null
              })
            })
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: null,
              error: null
            })
          })
        } as any;
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: null
            })
          })
        })
      } as any;
    });
  });
  
  it('should successfully complete a workout', async () => {
    const durationSeconds = 1800; // 30 minutes
    
    // Execute workout completion
    const result = await WorkoutCompletionService.finishWorkout(mockWorkoutId, durationSeconds);
    
    // Verify result
    expect(result).toBe(true);
    
    // Verify that transactions were used
    expect(supabase.rpc).toHaveBeenCalledWith('begin_transaction');
    expect(supabase.rpc).toHaveBeenCalledWith('commit_transaction');
    
    // Verify that workout was updated
    expect(supabase.from).toHaveBeenCalledWith('workouts');
    const updateMock = vi.mocked(supabase.from('workouts').update);
    expect(updateMock).toHaveBeenCalled();
    
    // Verify that personal records were checked
    expect(XPService.checkForPersonalRecords).toHaveBeenCalledWith(mockUserId, mockWorkoutId);
    
    // Verify that XP was awarded
    expect(XPService.awardWorkoutXP).toHaveBeenCalled();
  });
  
  it('should handle errors and rollback transaction', async () => {
    // Make the update fail
    vi.mocked(supabase.from).mockImplementation((table) => {
      if (table === 'workouts') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: mockWorkoutId, user_id: mockUserId, routine_id: 'test-routine-id' },
                error: null
              })
            })
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Test error' }
            })
          })
        } as any;
      }
      // Return default mock implementations for other tables
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: null
            }),
            order: vi.fn().mockResolvedValue({
              data: [],
              error: null
            })
          })
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null
          })
        })
      } as any;
    });
    
    // Execute workout completion
    const result = await WorkoutCompletionService.finishWorkout(mockWorkoutId, 1800);
    
    // Verify result
    expect(result).toBe(false);
    
    // Verify that rollback was called
    expect(supabase.rpc).toHaveBeenCalledWith('rollback_transaction');
  });
  
  it('should discard a workout correctly', async () => {
    // Execute workout discard
    const result = await WorkoutCompletionService.discardWorkout(mockWorkoutId);
    
    // Verify result
    expect(result).toBe(true);
    
    // Verify that workout sets were deleted
    expect(supabase.from).toHaveBeenCalledWith('workout_sets');
    const workoutSetsDeleteMock = vi.mocked(supabase.from('workout_sets').delete);
    expect(workoutSetsDeleteMock).toHaveBeenCalled();
    
    // Verify that workout was deleted
    expect(supabase.from).toHaveBeenCalledWith('workouts');
    const workoutsDeleteMock = vi.mocked(supabase.from('workouts').delete);
    expect(workoutsDeleteMock).toHaveBeenCalled();
  });
});

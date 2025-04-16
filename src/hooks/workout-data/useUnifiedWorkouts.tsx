
import { useState, useEffect, useCallback } from 'react';
import { RecentWorkout } from '../types/workoutDataTypes';
import { ManualWorkout } from '@/types/manualWorkoutTypes';
import { UnifiedWorkout, TrackedWorkout, ManualWorkout as UnifiedManualWorkout } from '@/types/unifiedWorkoutTypes';
import { ManualWorkoutService } from '@/services/workout/manual/ManualWorkoutService';
import { toast } from 'sonner';

export const useUnifiedWorkouts = (
  userId: string | undefined,
  trackedWorkouts: RecentWorkout[],
  loadMoreTrackedWorkouts: () => Promise<void>,
  hasMoreTrackedWorkouts: boolean,
  isLoadingMoreTracked: boolean
) => {
  const [manualWorkouts, setManualWorkouts] = useState<ManualWorkout[]>([]);
  const [unifiedWorkouts, setUnifiedWorkouts] = useState<UnifiedWorkout[]>([]);
  const [isLoadingManual, setIsLoadingManual] = useState(false);
  const [hasMoreWorkouts, setHasMoreWorkouts] = useState(hasMoreTrackedWorkouts);
  const [deletingManualWorkouts, setDeletingManualWorkouts] = useState<{[key: string]: boolean}>({});

  // Convert tracked workouts to unified format
  const convertTrackedToUnified = useCallback((tracked: RecentWorkout[]): TrackedWorkout[] => {
    return tracked.map(workout => ({
      id: workout.id,
      type: 'tracked',
      name: workout.name,
      date: workout.date,
      workoutDate: workout.date ? new Date(workout.date.split('/').reverse().join('-')).toISOString() : new Date().toISOString(),
      exercisesCount: workout.exercises_count,
      setsCount: workout.sets_count,
      prs: workout.prs,
      durationSeconds: workout.duration_seconds
    }));
  }, []);

  // Convert manual workouts to unified format
  const convertManualToUnified = useCallback((manual: ManualWorkout[]): UnifiedManualWorkout[] => {
    return manual.map(workout => ({
      id: workout.id,
      type: 'manual',
      date: new Date(workout.workoutDate).toLocaleDateString('pt-BR'),
      workoutDate: workout.workoutDate,
      description: workout.description,
      activityType: workout.activityType,
      photoUrl: workout.photoUrl,
      xpAwarded: workout.xpAwarded,
      isPowerDay: workout.isPowerDay
    }));
  }, []);

  // Load manual workouts
  const loadManualWorkouts = useCallback(async () => {
    if (!userId) return;
    
    try {
      setIsLoadingManual(true);
      const manualWorkoutsData = await ManualWorkoutService.getUserManualWorkouts(userId);
      setManualWorkouts(manualWorkoutsData);
    } catch (error) {
      console.error('Error loading manual workouts:', error);
    } finally {
      setIsLoadingManual(false);
    }
  }, [userId]);

  // Delete manual workout
  const deleteManualWorkout = useCallback(async (workoutId: string) => {
    if (!userId || deletingManualWorkouts[workoutId]) {
      return false;
    }
    
    try {
      setDeletingManualWorkouts(prev => ({ ...prev, [workoutId]: true }));
      
      const result = await ManualWorkoutService.deleteManualWorkout(userId, workoutId);
      
      if (result.success) {
        // Update local state
        setManualWorkouts(prevWorkouts => 
          prevWorkouts.filter(workout => workout.id !== workoutId)
        );
        
        toast.success('Treino manual excluído com sucesso');
        return true;
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error: any) {
      console.error('Error deleting manual workout:', error);
      toast.error('Erro ao excluir treino', {
        description: error.message || 'Não foi possível excluir o treino'
      });
      return false;
    } finally {
      setDeletingManualWorkouts(prev => ({ ...prev, [workoutId]: false }));
    }
  }, [userId, deletingManualWorkouts]);

  // Combine and sort workouts chronologically
  useEffect(() => {
    const trackedUnified = convertTrackedToUnified(trackedWorkouts);
    const manualUnified = convertManualToUnified(manualWorkouts);
    
    const combined = [...trackedUnified, ...manualUnified].sort((a, b) => {
      return new Date(b.workoutDate).getTime() - new Date(a.workoutDate).getTime();
    });
    
    setUnifiedWorkouts(combined);
  }, [trackedWorkouts, manualWorkouts, convertTrackedToUnified, convertManualToUnified]);

  // Update hasMoreWorkouts based on tracked workouts
  useEffect(() => {
    setHasMoreWorkouts(hasMoreTrackedWorkouts);
  }, [hasMoreTrackedWorkouts]);

  // Load more workouts
  const loadMoreWorkouts = async () => {
    if (isLoadingMoreTracked || !hasMoreTrackedWorkouts) return;
    await loadMoreTrackedWorkouts();
  };

  // Check if a manual workout is being deleted
  const isDeletingManualWorkout = useCallback((id: string) => {
    return deletingManualWorkouts[id] || false;
  }, [deletingManualWorkouts]);

  return {
    unifiedWorkouts,
    isLoadingManual,
    loadManualWorkouts,
    deleteManualWorkout,
    isDeletingManualWorkout,
    hasMoreWorkouts,
    isLoadingMoreTracked,
    loadMoreWorkouts
  };
};

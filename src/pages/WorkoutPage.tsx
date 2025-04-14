import React, { useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import AuthRequiredRoute from '@/components/AuthRequiredRoute';
import { useWorkoutData } from '@/hooks/useWorkoutData';
import ActionsBar from '@/components/workout/ActionsBar';
import { RoutineWithExercises } from '@/components/workout/types/Workout';
import { useAuth } from '@/hooks/useAuth';
import WorkoutErrorAlert from '@/components/workout/WorkoutErrorAlert';
import RoutinesSection from '@/components/workout/RoutinesSection';
import WorkoutHistorySection from '@/components/workout/WorkoutHistorySection';
import { useUnifiedWorkouts } from '@/hooks/workout-data/useUnifiedWorkouts';

const WorkoutPage = () => {
  const { user } = useAuth();
  const { 
    savedRoutines, 
    recentWorkouts, 
    isLoading, 
    refreshData, 
    error, 
    hasAttemptedLoad,
    deleteRoutine,
    deleteWorkout,
    isDeletingItem,
    hasMoreWorkouts,
    isLoadingMore,
    loadMoreWorkouts
  } = useWorkoutData();
  
  const {
    unifiedWorkouts,
    isLoadingManual,
    loadManualWorkouts,
    deleteManualWorkout,
    isDeletingManualWorkout,
    hasMoreWorkouts: hasMoreUnifiedWorkouts,
    isLoadingMoreTracked,
    loadMoreWorkouts: loadMoreUnifiedWorkouts
  } = useUnifiedWorkouts(
    user?.id,
    recentWorkouts,
    loadMoreWorkouts,
    hasMoreWorkouts,
    isLoadingMore
  );
  
  const routinesWithExercises: RoutineWithExercises[] = savedRoutines.map(routine => ({
    id: routine.id,
    name: routine.name,
    exercise_count: routine.exercises_count || 0,
    last_used_at: routine.last_used_at || null,
    created_at: routine.created_at || new Date().toISOString(),
    exercises: [] // Empty array as we don't have exercise details at this level
  }));
  
  const handleDeleteRoutine = async (id: string): Promise<void> => {
    await deleteRoutine(id);
  };
  
  const handleDeleteWorkout = async (id: string): Promise<void> => {
    const workout = unifiedWorkouts.find(w => w.id === id);
    
    if (workout?.type === 'manual') {
      await deleteManualWorkout(id);
    } else {
      await deleteWorkout(id);
    }
  };
  
  const isDeletingItemRecord = (id: string): boolean => {
    const workout = unifiedWorkouts.find(w => w.id === id);
    if (workout?.type === 'manual') {
      return isDeletingManualWorkout(id);
    }
    return isDeletingItem(id);
  };

  const isDeletingItemAsRecord: Record<string, boolean> = {};
  savedRoutines.forEach(routine => {
    isDeletingItemAsRecord[routine.id] = isDeletingItem(routine.id);
  });
  
  const handleManualWorkoutSuccess = () => {
    loadManualWorkouts();
  };
  
  useEffect(() => {
    const initialLoad = async () => {
      console.log("WorkoutPage: Initial data load");
      refreshData();
      if (user) {
        loadManualWorkouts();
      }
    };
    
    initialLoad();
  }, [refreshData, user, loadManualWorkouts]);
  
  const handleRetry = () => {
    console.log("Retrying data load");
    refreshData();
    loadManualWorkouts();
  };

  return (
    <AuthRequiredRoute>
      <div className="pb-20 min-h-screen bg-midnight-base">
        <PageHeader title="Treino" showBackButton={false} />
        
        <div className="p-4 space-y-6">
          <WorkoutErrorAlert error={error} onRetry={handleRetry} />
          
          <div className="premium-card p-4 shadow-subtle">
            <ActionsBar />
          </div>
          
          <RoutinesSection 
            routines={routinesWithExercises}
            isLoading={isLoading}
            onRetry={handleRetry}
            error={error}
            hasAttemptedLoad={hasAttemptedLoad}
            onDeleteRoutine={handleDeleteRoutine}
            isDeletingItem={isDeletingItemAsRecord}
          />
          
          <WorkoutHistorySection 
            unifiedWorkouts={unifiedWorkouts}
            isLoading={isLoading || isLoadingManual}
            onRetry={handleRetry}
            error={error}
            hasAttemptedLoad={hasAttemptedLoad}
            onDeleteWorkout={handleDeleteWorkout}
            isDeletingItem={isDeletingItemRecord}
            hasMoreWorkouts={hasMoreUnifiedWorkouts}
            isLoadingMore={isLoadingMoreTracked}
            onLoadMore={loadMoreUnifiedWorkouts}
            onManualWorkoutSuccess={handleManualWorkoutSuccess}
          />
        </div>
        
        <BottomNavBar />
      </div>
    </AuthRequiredRoute>
  );
};

export default WorkoutPage;

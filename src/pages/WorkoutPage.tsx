
import React, { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import AuthRequiredRoute from '@/components/AuthRequiredRoute';
import { useWorkoutData } from '@/hooks/useWorkoutData';
import ActionsBar from '@/components/workout/ActionsBar';
import { RoutineWithExercises } from '@/components/workout/types/Workout';
import { ManualWorkout } from '@/types/manualWorkoutTypes';
import { ManualWorkoutService } from '@/services/workout/manual/ManualWorkoutService';
import { useAuth } from '@/hooks/useAuth';
import WorkoutErrorAlert from '@/components/workout/WorkoutErrorAlert';
import RoutinesSection from '@/components/workout/RoutinesSection';
import WorkoutTabsSection from '@/components/workout/WorkoutTabsSection';

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
  
  const [manualWorkouts, setManualWorkouts] = useState<ManualWorkout[]>([]);
  const [isLoadingManual, setIsLoadingManual] = useState(false);
  const [activeTab, setActiveTab] = useState<'tracked' | 'manual'>('tracked');
  
  // Transform Routine[] to RoutineWithExercises[]
  const routinesWithExercises: RoutineWithExercises[] = savedRoutines.map(routine => ({
    id: routine.id,
    name: routine.name,
    exercise_count: routine.exercises_count || 0,
    last_used_at: routine.last_used_at || null,
    created_at: routine.created_at || new Date().toISOString(),
    exercises: [] // Empty array as we don't have exercise details at this level
  }));
  
  // Wrap deleteRoutine to match expected signature
  const handleDeleteRoutine = async (id: string): Promise<void> => {
    await deleteRoutine(id);
  };
  
  // Create a proper Record for isDeletingItem
  const isDeletingItemRecord: Record<string, boolean> = {};
  savedRoutines.forEach(routine => {
    isDeletingItemRecord[routine.id] = isDeletingItem(routine.id);
  });
  recentWorkouts.forEach(workout => {
    isDeletingItemRecord[workout.id] = isDeletingItem(workout.id);
  });
  
  // Load manual workouts
  const loadManualWorkouts = async () => {
    if (!user) return;
    
    try {
      setIsLoadingManual(true);
      const manualWorkoutsData = await ManualWorkoutService.getUserManualWorkouts(user.id);
      setManualWorkouts(manualWorkoutsData);
    } catch (error) {
      console.error('Error loading manual workouts:', error);
    } finally {
      setIsLoadingManual(false);
    }
  };
  
  // Handle successful manual workout submission
  const handleManualWorkoutSuccess = () => {
    loadManualWorkouts();
  };
  
  // Refresh all data when component mounts or user changes
  useEffect(() => {
    const initialLoad = async () => {
      console.log("WorkoutPage: Initial data load");
      refreshData();
      if (user) {
        loadManualWorkouts();
      }
    };
    
    initialLoad();
  }, [refreshData, user]);
  
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
            isDeletingItem={isDeletingItemRecord}
          />
          
          <WorkoutTabsSection 
            recentWorkouts={recentWorkouts}
            manualWorkouts={manualWorkouts}
            isLoading={isLoading}
            isLoadingManual={isLoadingManual}
            onRetry={handleRetry}
            error={error}
            hasAttemptedLoad={hasAttemptedLoad}
            onDeleteWorkout={deleteWorkout}
            isDeletingItem={isDeletingItem}
            hasMoreWorkouts={hasMoreWorkouts}
            isLoadingMore={isLoadingMore}
            onLoadMore={loadMoreWorkouts}
            onManualWorkoutSuccess={handleManualWorkoutSuccess}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
        
        <BottomNavBar />
      </div>
    </AuthRequiredRoute>
  );
};

export default WorkoutPage;


import React, { useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import AuthRequiredRoute from '@/components/AuthRequiredRoute';
import { useWorkoutData } from '@/hooks/useWorkoutData';
import ActionsBar from '@/components/workout/ActionsBar';
import RoutinesList from '@/components/workout/RoutinesList';
import WorkoutsList from '@/components/workout/WorkoutsList';

const WorkoutPage = () => {
  const { savedRoutines, recentWorkouts, isLoading, refreshData } = useWorkoutData();
  
  // Refresh data when component mounts
  useEffect(() => {
    refreshData();
  }, [refreshData]);
  
  return (
    <AuthRequiredRoute>
      <div className="pb-20">
        <PageHeader title="Treino" showBackButton={false} />
        
        <div className="p-4 bg-gray-50">
          <ActionsBar />
          
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">Rotinas Salvas</h2>
            <RoutinesList 
              routines={savedRoutines} 
              isLoading={isLoading} 
            />
          </div>
          
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Treinos Recentes</h2>
            <WorkoutsList 
              workouts={recentWorkouts} 
              isLoading={isLoading} 
            />
          </div>
        </div>
        
        <BottomNavBar />
      </div>
    </AuthRequiredRoute>
  );
};

export default WorkoutPage;

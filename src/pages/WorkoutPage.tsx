
import React, { useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import AuthRequiredRoute from '@/components/AuthRequiredRoute';
import { useWorkoutData } from '@/hooks/useWorkoutData';
import ActionsBar from '@/components/workout/ActionsBar';
import RoutinesList from '@/components/workout/RoutinesList';
import WorkoutsList from '@/components/workout/WorkoutsList';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const WorkoutPage = () => {
  const { 
    savedRoutines, 
    recentWorkouts, 
    isLoading, 
    refreshData, 
    error, 
    hasAttemptedLoad,
    deleteRoutine,
    deleteWorkout,
    isDeletingItem
  } = useWorkoutData();
  
  // Refresh data when component mounts
  useEffect(() => {
    const initialLoad = async () => {
      console.log("WorkoutPage: Initial data load");
      refreshData();
    };
    
    initialLoad();
  }, [refreshData]);
  
  const handleRetry = () => {
    console.log("Retrying data load");
    refreshData();
  };

  return (
    <AuthRequiredRoute>
      <div className="pb-20">
        <PageHeader title="Treino" showBackButton={false} />
        
        <div className="p-4 bg-gray-50 min-h-[80vh]">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro ao carregar dados</AlertTitle>
              <AlertDescription>
                {error}
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    onClick={handleRetry}
                    className="w-full"
                    size="sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" /> Tentar novamente
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          <ActionsBar />
          
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">Rotinas Salvas</h2>
            <RoutinesList 
              routines={savedRoutines} 
              isLoading={isLoading} 
              onRetry={handleRetry}
              error={error}
              hasAttemptedLoad={hasAttemptedLoad}
              onDeleteRoutine={deleteRoutine}
              isDeletingItem={isDeletingItem}
            />
          </div>
          
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Treinos Recentes</h2>
            <WorkoutsList 
              workouts={recentWorkouts} 
              isLoading={isLoading}
              onRetry={handleRetry}
              error={error}
              hasAttemptedLoad={hasAttemptedLoad}
              onDeleteWorkout={deleteWorkout}
              isDeletingItem={isDeletingItem}
            />
          </div>
        </div>
        
        <BottomNavBar />
      </div>
    </AuthRequiredRoute>
  );
};

export default WorkoutPage;


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
    isDeletingItem,
    hasMoreWorkouts,
    isLoadingMore,
    loadMoreWorkouts
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
      <div className="pb-20 min-h-screen bg-midnight-base">
        <PageHeader title="Treino" showBackButton={false} />
        
        <div className="p-4">
          {error && (
            <Alert variant="destructive" className="mb-4 bg-valor-15 border-valor-30 text-valor">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-orbitron">Erro ao carregar dados</AlertTitle>
              <AlertDescription className="font-sora">
                {error}
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    onClick={handleRetry}
                    className="w-full bg-midnight-elevated border-valor-30 text-text-primary hover:bg-valor-15"
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
            <h2 className="text-xl font-orbitron font-bold mb-4 text-text-primary">Rotinas Salvas</h2>
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
            <h2 className="text-xl font-orbitron font-bold mb-4 text-text-primary">Treinos Recentes</h2>
            <WorkoutsList 
              workouts={recentWorkouts} 
              isLoading={isLoading}
              onRetry={handleRetry}
              error={error}
              hasAttemptedLoad={hasAttemptedLoad}
              onDeleteWorkout={deleteWorkout}
              isDeletingItem={isDeletingItem}
              hasMoreWorkouts={hasMoreWorkouts}
              isLoadingMore={isLoadingMore}
              onLoadMore={loadMoreWorkouts}
            />
          </div>
        </div>
        
        <BottomNavBar />
      </div>
    </AuthRequiredRoute>
  );
};

export default WorkoutPage;

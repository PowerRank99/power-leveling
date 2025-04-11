
import React, { useEffect, useState } from 'react';
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
import { RoutineWithExercises } from '@/components/workout/types/Workout';
import ManualWorkoutDialog from '@/components/workout/manual/ManualWorkoutDialog';
import ManualWorkoutsList from '@/components/workout/manual/ManualWorkoutsList';
import { ManualWorkout, ManualWorkoutService } from '@/services/workout/ManualWorkoutService';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  
  // Refresh all data when component mounts
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
  
  const handleManualWorkoutSuccess = () => {
    loadManualWorkouts();
  };

  return (
    <AuthRequiredRoute>
      <div className="pb-20 min-h-screen bg-midnight-base">
        <PageHeader title="Treino" showBackButton={false} />
        
        <div className="p-4 space-y-6">
          {error && (
            <Alert variant="destructive" className="mb-4 bg-valor-15 border-valor-30 text-valor shadow-subtle">
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
          
          <div className="premium-card p-4 shadow-subtle">
            <ActionsBar />
          </div>
          
          <div className="premium-card p-4 shadow-subtle">
            <h2 className="text-xl font-orbitron font-bold mb-4 text-text-primary">Rotinas Salvas</h2>
            <RoutinesList 
              routines={routinesWithExercises} 
              isLoading={isLoading} 
              onRetry={handleRetry}
              error={error}
              hasAttemptedLoad={hasAttemptedLoad}
              onDeleteRoutine={handleDeleteRoutine}
              isDeletingItem={isDeletingItemRecord}
            />
          </div>
          
          <div className="premium-card p-4 shadow-subtle">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-orbitron font-bold text-text-primary">Treinos Recentes</h2>
              
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'tracked' | 'manual')} className="w-auto">
                <TabsList className="bg-midnight-elevated">
                  <TabsTrigger value="tracked" className="data-[state=active]:bg-arcane/20">
                    Registrados
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="data-[state=active]:bg-arcane/20">
                    Manuais
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <TabsContent value="tracked" className="mt-0">
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
            </TabsContent>
            
            <TabsContent value="manual" className="mt-0">
              <ManualWorkoutsList 
                workouts={manualWorkouts}
                isLoading={isLoadingManual}
              />
            </TabsContent>
            
            <div className="mt-4">
              <ManualWorkoutDialog onSuccess={handleManualWorkoutSuccess} />
            </div>
          </div>
        </div>
        
        <BottomNavBar />
      </div>
    </AuthRequiredRoute>
  );
};

export default WorkoutPage;

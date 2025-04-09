
import React, { useEffect } from 'react';
import AuthRequiredRoute from '@/components/AuthRequiredRoute';
import { useWorkoutData } from '@/hooks/useWorkoutData';
import ActionsBar from '@/components/workout/ActionsBar';
import RoutinesList from '@/components/workout/RoutinesList';
import WorkoutsList from '@/components/workout/WorkoutsList';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import WorkoutPageHeader from '@/components/workout/WorkoutPageHeader';
import EmptyState from '@/components/workout/EmptyState';
import { motion } from 'framer-motion';

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

  // Calculate last workout days
  const getLastWorkoutDays = () => {
    if (!recentWorkouts.length) return null;
    
    const lastWorkoutDate = new Date(recentWorkouts[0].date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastWorkoutDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <AuthRequiredRoute>
      <div className="pb-20 min-h-screen bg-gray-50">
        <WorkoutPageHeader 
          recentWorkoutCount={recentWorkouts.length}
          routineCount={savedRoutines.length}
          lastWorkoutDays={getLastWorkoutDays()}
        />
        
        <div className="p-4">
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
          
          <motion.div 
            className="mt-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <h2 className="text-xl font-bold mb-4 flex items-center">
                Rotinas Salvas
                {savedRoutines.length > 0 && (
                  <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {savedRoutines.length}
                  </span>
                )}
              </h2>
            </motion.div>
            
            {!isLoading && !error && hasAttemptedLoad && savedRoutines.length === 0 && (
              <EmptyState type="routines" />
            )}
            
            <RoutinesList 
              routines={savedRoutines} 
              isLoading={isLoading} 
              onRetry={handleRetry}
              error={error}
              hasAttemptedLoad={hasAttemptedLoad}
              onDeleteRoutine={deleteRoutine}
              isDeletingItem={isDeletingItem}
            />
          </motion.div>
          
          <motion.div 
            className="mt-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <h2 className="text-xl font-bold mb-4 flex items-center">
                Treinos Recentes
                {recentWorkouts.length > 0 && (
                  <span className="ml-2 text-sm bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    {recentWorkouts.length}
                  </span>
                )}
              </h2>
            </motion.div>
            
            {!isLoading && !error && hasAttemptedLoad && recentWorkouts.length === 0 && (
              <EmptyState type="workouts" />
            )}
            
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
          </motion.div>
        </div>
        
        <BottomNavBar />
      </div>
    </AuthRequiredRoute>
  );
};

export default WorkoutPage;

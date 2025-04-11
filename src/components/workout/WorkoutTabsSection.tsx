
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WorkoutsList from '@/components/workout/WorkoutsList';
import ManualWorkoutsList from '@/components/workout/manual/ManualWorkoutsList';
import ManualWorkoutDialog from '@/components/workout/manual/ManualWorkoutDialog';
import { RecentWorkout } from '@/hooks/useWorkoutData';
import { ManualWorkout } from '@/types/manualWorkoutTypes';

interface WorkoutTabsSectionProps {
  recentWorkouts: RecentWorkout[];
  manualWorkouts: ManualWorkout[];
  isLoading: boolean;
  isLoadingManual: boolean;
  onRetry: () => void;
  error: string | null;
  hasAttemptedLoad: boolean;
  onDeleteWorkout: (workoutId: string) => void;
  isDeletingItem: (id: string) => boolean;
  hasMoreWorkouts: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onManualWorkoutSuccess: () => void;
  activeTab: 'tracked' | 'manual';
  setActiveTab: (tab: 'tracked' | 'manual') => void;
}

const WorkoutTabsSection: React.FC<WorkoutTabsSectionProps> = ({
  recentWorkouts,
  manualWorkouts,
  isLoading,
  isLoadingManual,
  onRetry,
  error,
  hasAttemptedLoad,
  onDeleteWorkout,
  isDeletingItem,
  hasMoreWorkouts,
  isLoadingMore,
  onLoadMore,
  onManualWorkoutSuccess,
  activeTab,
  setActiveTab
}) => {
  return (
    <div className="premium-card p-4 shadow-subtle">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-orbitron font-bold text-text-primary">Treinos Recentes</h2>
        
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as 'tracked' | 'manual')} 
          className="w-auto"
        >
          <TabsList className="bg-midnight-elevated">
            <TabsTrigger value="tracked" className="data-[state=active]:bg-arcane/20">
              Registrados
            </TabsTrigger>
            <TabsTrigger value="manual" className="data-[state=active]:bg-arcane/20">
              Manuais
            </TabsTrigger>
          </TabsList>
        
          <TabsContent value="tracked" className="mt-0">
            <WorkoutsList 
              workouts={recentWorkouts} 
              isLoading={isLoading}
              onRetry={onRetry}
              error={error}
              hasAttemptedLoad={hasAttemptedLoad}
              onDeleteWorkout={onDeleteWorkout}
              isDeletingItem={isDeletingItem}
              hasMoreWorkouts={hasMoreWorkouts}
              isLoadingMore={isLoadingMore}
              onLoadMore={onLoadMore}
            />
          </TabsContent>
          
          <TabsContent value="manual" className="mt-0">
            <ManualWorkoutsList 
              workouts={manualWorkouts}
              isLoading={isLoadingManual}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="mt-4">
        <ManualWorkoutDialog onSuccess={onManualWorkoutSuccess} />
      </div>
    </div>
  );
};

export default WorkoutTabsSection;

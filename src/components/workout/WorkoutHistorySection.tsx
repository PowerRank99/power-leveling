
import React from 'react';
import { UnifiedWorkout } from '@/types/unifiedWorkoutTypes';
import UnifiedWorkoutsList from './UnifiedWorkoutsList';
import ManualWorkoutDialog from './manual/ManualWorkoutDialog';

interface WorkoutHistorySectionProps {
  unifiedWorkouts: UnifiedWorkout[];
  isLoading: boolean;
  onRetry: () => void;
  error: string | null;
  hasAttemptedLoad: boolean;
  onDeleteWorkout: (workoutId: string) => void;
  isDeletingItem: (id: string) => boolean;
  hasMoreWorkouts: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onManualWorkoutSuccess: () => void;
  className?: string;
}

const WorkoutHistorySection: React.FC<WorkoutHistorySectionProps> = ({
  unifiedWorkouts,
  isLoading,
  onRetry,
  error,
  hasAttemptedLoad,
  onDeleteWorkout,
  isDeletingItem,
  hasMoreWorkouts,
  isLoadingMore,
  onLoadMore,
  onManualWorkoutSuccess,
  className = ''
}) => {
  return (
    <div className={`premium-card p-4 shadow-subtle ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-orbitron font-bold text-text-primary">Histórico de Treinos</h2>
      </div>
      
      <div className="mb-6">
        <ManualWorkoutDialog onSuccess={onManualWorkoutSuccess} />
      </div>
      
      <UnifiedWorkoutsList 
        workouts={unifiedWorkouts}
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
    </div>
  );
};

export default WorkoutHistorySection;

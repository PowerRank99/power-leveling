
import React from 'react';
import WorkoutCard from '@/components/workout/WorkoutCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { RecentWorkout } from '@/hooks/useWorkoutData';
import { Button } from '@/components/ui/button';
import { RefreshCw, ChevronDown } from 'lucide-react';
import WorkoutContextMenu from '@/components/workout/WorkoutContextMenu';

interface WorkoutsListProps {
  workouts: RecentWorkout[];
  isLoading: boolean;
  onRetry: () => void;
  error: string | null;
  hasAttemptedLoad: boolean;
  onDeleteWorkout: (workoutId: string) => void;
  isDeletingItem: (id: string) => boolean;
  hasMoreWorkouts?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

const WorkoutsList: React.FC<WorkoutsListProps> = ({ 
  workouts, 
  isLoading,
  onRetry,
  error,
  hasAttemptedLoad,
  onDeleteWorkout,
  isDeletingItem,
  hasMoreWorkouts = false,
  isLoadingMore = false,
  onLoadMore
}) => {
  if (isLoading && !hasAttemptedLoad) {
    return <LoadingSpinner message="Carregando seus treinos..." />;
  }
  
  if (error) {
    return (
      <EmptyState 
        message="Não foi possível carregar seus treinos" 
        action={
          <Button 
            onClick={onRetry}
            variant="outline"
            className="mt-2"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Tentar novamente
          </Button>
        }
      />
    );
  }
  
  if (workouts.length === 0) {
    return (
      <EmptyState message="Você ainda não tem treinos registrados" />
    );
  }
  
  return (
    <div>
      <div className="space-y-4 mb-4">
        {workouts.map(workout => (
          <WorkoutContextMenu
            key={workout.id}
            workoutId={workout.id}
            workoutName={workout.name}
            onDeleteWorkout={onDeleteWorkout}
          >
            <WorkoutCard 
              id={workout.id}
              name={workout.name}
              date={workout.date}
              exercisesCount={workout.exercises_count}
              setsCount={workout.sets_count}
              prs={workout.prs}
              durationSeconds={workout.duration_seconds}
              isDeleting={isDeletingItem(workout.id)}
              onDelete={onDeleteWorkout}
            />
          </WorkoutContextMenu>
        ))}
      </div>
      
      {hasMoreWorkouts && onLoadMore && (
        <div className="flex justify-center mt-6 mb-2">
          <Button 
            onClick={onLoadMore}
            variant="outline"
            disabled={isLoadingMore}
            className="w-full max-w-sm"
          >
            {isLoadingMore ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" /> Carregando...
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" /> Carregar mais treinos
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default WorkoutsList;

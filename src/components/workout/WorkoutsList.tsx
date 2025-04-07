
import React from 'react';
import WorkoutCard from '@/components/workout/WorkoutCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { RecentWorkout } from '@/hooks/useWorkoutData';

interface WorkoutsListProps {
  workouts: RecentWorkout[];
  isLoading: boolean;
}

const WorkoutsList: React.FC<WorkoutsListProps> = ({ workouts, isLoading }) => {
  if (isLoading) {
    return <LoadingSpinner message="Carregando seus treinos..." />;
  }
  
  if (workouts.length === 0) {
    return (
      <EmptyState message="Você ainda não tem treinos registrados" />
    );
  }
  
  return (
    <>
      {workouts.map(workout => (
        <WorkoutCard 
          key={workout.id}
          id={workout.id}
          name={workout.name}
          date={workout.date}
          exercisesCount={workout.exercises_count}
          setsCount={workout.sets_count}
          prs={workout.prs}
          durationSeconds={workout.duration_seconds}
        />
      ))}
    </>
  );
};

export default WorkoutsList;

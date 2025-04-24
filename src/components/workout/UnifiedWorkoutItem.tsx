
import React from 'react';
import { UnifiedWorkout } from '@/types/unifiedWorkoutTypes';
import WorkoutCard from './WorkoutCard';

interface UnifiedWorkoutItemProps {
  workout: UnifiedWorkout;
  onDelete?: (id: string) => void;
  isDeletingItem?: (id: string) => boolean;
}

const UnifiedWorkoutItem: React.FC<UnifiedWorkoutItemProps> = ({
  workout,
  onDelete,
  isDeletingItem = () => false
}) => {
  if (workout.type === 'manual') {
    return (
      <WorkoutCard
        id={workout.id}
        name={`Treino Manual - ${workout.activityType || 'Atividade'}`}
        date={workout.date}
        exercisesCount={1}
        setsCount={0}
        isDeleting={isDeletingItem(workout.id)}
        onDelete={onDelete}
        workoutType="manual"
        xpAwarded={workout.xpAwarded}
      />
    );
  }
  
  return (
    <WorkoutCard
      id={workout.id}
      name={workout.name}
      date={workout.date}
      exercisesCount={workout.exercisesCount}
      setsCount={workout.setsCount}
      prs={workout.prs}
      durationSeconds={workout.durationSeconds}
      isDeleting={isDeletingItem(workout.id)}
      onDelete={onDelete}
      workoutType="tracked"
      xpAwarded={92} // Temporarily hardcode for testing
    />
  );
};

export default UnifiedWorkoutItem;

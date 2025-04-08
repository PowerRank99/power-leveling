
import React from 'react';
import WorkoutLoading from '@/components/workout/WorkoutLoading';
import WorkoutError from '@/components/workout/WorkoutError';
import EmptyExerciseState from '@/components/workout/EmptyExerciseState';
import WorkoutLayout from '@/components/workout/WorkoutLayout';
import { useWorkoutContext } from '@/contexts/WorkoutContext';

const WorkoutPageContent: React.FC = () => {
  const { 
    isLoading, 
    loadError, 
    exercises,
  } = useWorkoutContext();
  
  // If loading, show loading UI
  if (isLoading) {
    return <WorkoutLoading />;
  }
  
  // If there's an error, show error UI
  if (loadError) {
    return <WorkoutError errorMessage={loadError} />;
  }
  
  // If no exercises are found, show empty state
  if (!exercises || exercises.length === 0) {
    return <EmptyExerciseState />;
  }
  
  // Show the workout UI
  return <WorkoutLayout />;
};

export default WorkoutPageContent;

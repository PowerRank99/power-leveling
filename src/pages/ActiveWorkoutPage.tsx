
import React from 'react';
import { useWorkoutFlow } from '@/hooks/useWorkoutFlow';
import { WorkoutProvider } from '@/contexts/WorkoutContext';
import WorkoutPageContent from '@/components/workout/WorkoutPageContent';

const ActiveWorkoutPage = () => {
  const workoutFlow = useWorkoutFlow();
  
  return (
    <WorkoutProvider value={workoutFlow}>
      <WorkoutPageContent />
    </WorkoutProvider>
  );
};

export default ActiveWorkoutPage;

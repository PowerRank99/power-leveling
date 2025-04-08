
import React from 'react';
import FinishWorkoutButton from '@/components/workout/FinishWorkoutButton';
import { useWorkoutContext } from '@/contexts/WorkoutContext';

const WorkoutFooter: React.FC = () => {
  const { finishWorkout, isSubmitting, isLocalSubmitting } = useWorkoutContext();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-50 border-t border-gray-200">
      <FinishWorkoutButton 
        onFinish={finishWorkout}
        isFinishing={isSubmitting || isLocalSubmitting}
      />
    </div>
  );
};

export default WorkoutFooter;

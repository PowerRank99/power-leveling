
import React from 'react';
import WorkoutHeader from '@/components/workout/WorkoutHeader';
import WorkoutProgressBar from '@/components/workout/WorkoutProgressBar';
import WorkoutContent from '@/components/workout/WorkoutContent';
import WorkoutFooter from '@/components/workout/WorkoutFooter';
import { useWorkoutContext } from '@/contexts/WorkoutContext';

const WorkoutLayout: React.FC = () => {
  const { 
    currentExerciseIndex, 
    totalExercises, 
    formatTime, 
    elapsedTime, 
    finishWorkout,
    discardWorkout,
    isSubmitting,
    isLocalSubmitting
  } = useWorkoutContext();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <WorkoutHeader 
        onFinish={finishWorkout}
        onDiscard={discardWorkout}
        isFinishing={isSubmitting || isLocalSubmitting}
        elapsedTime={formatTime(elapsedTime)}
      />
      
      <WorkoutProgressBar
        currentExerciseIndex={currentExerciseIndex}
        totalExercises={totalExercises}
      />
      
      <WorkoutContent />
      
      <WorkoutFooter />
    </div>
  );
};

export default WorkoutLayout;

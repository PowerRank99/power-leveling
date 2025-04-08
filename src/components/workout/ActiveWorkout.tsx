
import React, { useEffect } from 'react';
import ExerciseHeader from '@/components/workout/ExerciseHeader';
import ExerciseNotes from '@/components/workout/ExerciseNotes';
import SetHeader from '@/components/workout/set/SetHeader';
import SetRow from '@/components/workout/set/SetRow';
import AddSetButton from '@/components/workout/AddSetButton';
import RestTimerDisplay from '@/components/workout/timer/RestTimerDisplay';
import { SetData } from '@/types/workoutTypes';

interface ActiveWorkoutProps {
  exerciseName: string;
  sets: Array<SetData>;
  exerciseIndex: number;
  onAddSet: () => void;
  onRemoveSet: (setIndex: number) => void;
  onCompleteSet: (index: number) => void;
  onUpdateSet: (index: number, data: { weight?: string; reps?: string }) => void;
  exerciseId: string;
  notes: string;
  onNotesChange: (value: string) => void;
  onTimerClick?: (exerciseId: string, exerciseName: string) => void;
  onStartTimer?: (exerciseId: string, exerciseName: string) => void;
  timerDuration?: number;
  loadExerciseTimer?: (exerciseId: string) => void;
  isTimerSaving?: boolean;
}

const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({ 
  exerciseName,
  sets,
  exerciseIndex,
  onAddSet,
  onRemoveSet,
  onCompleteSet,
  onUpdateSet,
  notes,
  onNotesChange,
  exerciseId,
  onTimerClick,
  onStartTimer,
  timerDuration = 90,
  loadExerciseTimer,
  isTimerSaving = false
}) => {
  console.log(`ActiveWorkout render: ${exerciseName} with ${sets.length} sets`);
  console.log(`Exercise ID: ${exerciseId}, Exercise Index: ${exerciseIndex}`);
  
  // Load exercise timer when mounted
  useEffect(() => {
    if (loadExerciseTimer && exerciseId) {
      loadExerciseTimer(exerciseId);
    }
  }, [exerciseId, loadExerciseTimer]);
  
  const handleWeightChange = (index: number, value: string) => {
    console.log(`Weight change for ${exerciseName}, set ${index}: ${value}`);
    onUpdateSet(index, { weight: value });
  };

  const handleRepsChange = (index: number, value: string) => {
    console.log(`Reps change for ${exerciseName}, set ${index}: ${value}`);
    onUpdateSet(index, { reps: value });
  };

  const handleSetCompletion = (index: number) => {
    console.log(`Set completion toggle for ${exerciseName}, set ${index}`);
    
    // Start rest timer when a set is completed
    if (!sets[index].completed && onStartTimer && exerciseId) {
      onStartTimer(exerciseId, exerciseName);
    }
    
    onCompleteSet(index);
  };
  
  const handleAddSet = () => {
    console.log(`Adding new set to ${exerciseName} (exerciseIndex: ${exerciseIndex})`);
    onAddSet();
  };
  
  const handleTimerClick = () => {
    if (onTimerClick && exerciseId) {
      onTimerClick(exerciseId, exerciseName);
    }
  };

  return (
    <div className="px-4 pt-4 pb-6">
      <div className="flex justify-between items-center">
        <ExerciseHeader exerciseName={exerciseName} />
        
        {onTimerClick && (
          <RestTimerDisplay
            durationSeconds={timerDuration}
            exerciseId={exerciseId}
            exerciseName={exerciseName}
            onTimerClick={handleTimerClick}
            onStartTimer={onStartTimer || (() => {})}
            isSaving={isTimerSaving}
          />
        )}
      </div>
      
      <ExerciseNotes notes={notes} onChange={onNotesChange} />

      <div className="mb-6">
        <SetHeader />

        {sets.map((set, index) => (
          <SetRow
            key={set.id}
            index={index}
            set={set}
            onComplete={() => handleSetCompletion(index)}
            onRemove={() => onRemoveSet(index)}
            onWeightChange={(value) => handleWeightChange(index, value)}
            onRepsChange={(value) => handleRepsChange(index, value)}
            showRemoveButton={sets.length > 1}
          />
        ))}

        <AddSetButton onAddSet={handleAddSet} />
      </div>
    </div>
  );
};

export default ActiveWorkout;

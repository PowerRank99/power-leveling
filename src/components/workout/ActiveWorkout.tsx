
import React from 'react';
import ExerciseHeader from '@/components/workout/ExerciseHeader';
import ExerciseNotes from '@/components/workout/ExerciseNotes';
import SetHeader from '@/components/workout/SetHeader';
import SetRow from '@/components/workout/set/SetRow';
import AddSetButton from '@/components/workout/AddSetButton';
import { SetData } from '@/components/workout/set/types';

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
  exerciseId
}) => {
  console.log(`ActiveWorkout render: ${exerciseName} with ${sets.length} sets`);
  console.log(`Exercise ID: ${exerciseId}, Exercise Index: ${exerciseIndex}`);
  
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
    onCompleteSet(index);
  };
  
  const handleAddSet = () => {
    console.log(`Adding new set to ${exerciseName} (exerciseIndex: ${exerciseIndex})`);
    onAddSet();
  };

  return (
    <div className="px-4 pt-4 pb-6">
      <ExerciseHeader exerciseName={exerciseName} />
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

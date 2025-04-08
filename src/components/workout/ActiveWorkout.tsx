
import React from 'react';
import ExerciseHeader from '@/components/workout/ExerciseHeader';
import ExerciseNotes from '@/components/workout/ExerciseNotes';
import SetHeader from '@/components/workout/SetHeader';
import SetRow from '@/components/workout/set/SetRow';
import AddSetButton from '@/components/workout/AddSetButton';

interface ActiveWorkoutProps {
  exerciseName: string;
  sets: Array<{
    id: string;
    weight: string;
    reps: string;
    completed: boolean;
    previous?: {
      weight: string;
      reps: string;
    };
  }>;
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
  onAddSet,
  onRemoveSet,
  onCompleteSet,
  onUpdateSet,
  notes,
  onNotesChange
}) => {
  const handleWeightChange = (index: number, value: string) => {
    onUpdateSet(index, { weight: value });
  };

  const handleRepsChange = (index: number, value: string) => {
    onUpdateSet(index, { reps: value });
  };

  const handleSetCompletion = (index: number) => {
    onCompleteSet(index);
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

        <AddSetButton onAddSet={onAddSet} />
      </div>
    </div>
  );
};

export default ActiveWorkout;


import React, { useState } from 'react';
import RestTimer from '@/components/workout/RestTimer';
import ExerciseHeader from '@/components/workout/ExerciseHeader';
import ExerciseNotes from '@/components/workout/ExerciseNotes';
import SetHeader from '@/components/workout/SetHeader';
import SetRow from '@/components/workout/SetRow';
import AddSetButton from '@/components/workout/AddSetButton';
import RestTimerToggle from '@/components/workout/RestTimerToggle';

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
  initialRestTimer?: {
    minutes: number;
    seconds: number;
  };
  onRestTimerChange?: (minutes: number, seconds: number) => void;
  isTimerSaving?: boolean;
}

const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({ 
  exerciseName,
  sets,
  onAddSet,
  onRemoveSet,
  onCompleteSet,
  onUpdateSet,
  notes,
  onNotesChange,
  initialRestTimer = { minutes: 1, seconds: 30 },
  onRestTimerChange,
  isTimerSaving = false
}) => {
  const [showDetailedTimer, setShowDetailedTimer] = useState(false);
  const [restTimeMinutes, setRestTimeMinutes] = useState(initialRestTimer.minutes);
  const [restTimeSeconds, setRestTimeSeconds] = useState(initialRestTimer.seconds);
  const [autoStartTimer, setAutoStartTimer] = useState(false);
  
  const handleWeightChange = (index: number, value: string) => {
    onUpdateSet(index, { weight: value });
  };

  const handleRepsChange = (index: number, value: string) => {
    onUpdateSet(index, { reps: value });
  };

  const handleSetCompletion = (index: number) => {
    onCompleteSet(index);
    // Auto-start rest timer when completing a set
    setShowDetailedTimer(true);
    setAutoStartTimer(true);
  };

  const handleRestComplete = () => {
    // Hide detailed timer when rest is complete but keep the timer visible
    setShowDetailedTimer(false);
    setAutoStartTimer(false);
  };
  
  const handleTimerChange = (minutes: number, seconds: number) => {
    setRestTimeMinutes(minutes);
    setRestTimeSeconds(seconds);
    
    if (onRestTimerChange) {
      onRestTimerChange(minutes, seconds);
    }
  };

  return (
    <div className="px-4 pt-4 pb-6">
      <ExerciseHeader exerciseName={exerciseName} />
      <ExerciseNotes notes={notes} onChange={onNotesChange} />

      <div className="mb-6">
        {showDetailedTimer ? (
          <RestTimer 
            minutes={restTimeMinutes} 
            seconds={restTimeSeconds} 
            onComplete={handleRestComplete} 
            onTimerChange={handleTimerChange}
            autoStart={autoStartTimer}
          />
        ) : (
          <RestTimerToggle 
            minutes={restTimeMinutes} 
            seconds={restTimeSeconds} 
            onShowTimer={() => setShowDetailedTimer(true)}
            isSaving={isTimerSaving}
          />
        )}
      </div>

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

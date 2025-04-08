
import React from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import ActiveWorkout from '@/components/workout/ActiveWorkout';
import { useWorkoutContext } from '@/contexts/WorkoutContext';

const WorkoutContent: React.FC = () => {
  const {
    exercises,
    addSet,
    removeSet,
    updateSet,
    notes,
    setNotes,
    restTimerSettings,
    handleRestTimerChange,
    isTimerSaving
  } = useWorkoutContext();
  
  const handleAddSet = async (exerciseIndex: number) => {
    try {
      const result = await addSet(exerciseIndex);
      console.log("Set added:", result ? "success" : "failed");
    } catch (error) {
      console.error("Error adding set:", error);
    }
  };
  
  const handleRemoveSet = async (exerciseIndex: number, setIndex: number) => {
    try {
      const result = await removeSet(exerciseIndex, setIndex);
      console.log("Set removed:", result ? "success" : "failed");
    } catch (error) {
      console.error("Error removing set:", error);
    }
  };
  
  const handleCompleteSet = async (exerciseIndex: number, setIndex: number) => {
    if (exercises[exerciseIndex]) {
      try {
        await updateSet(exerciseIndex, setIndex, { 
          completed: !exercises[exerciseIndex].sets[setIndex].completed 
        });
      } catch (error) {
        console.error("Error completing set:", error);
      }
    }
  };
  
  const handleUpdateSet = async (exerciseIndex: number, setIndex: number, data: { weight?: string; reps?: string }) => {
    try {
      await updateSet(exerciseIndex, setIndex, data);
    } catch (error) {
      console.error("Error updating set:", error);
    }
  };
  
  const handleNotesChange = (exerciseId: string, value: string) => {
    setNotes(prev => ({
      ...prev,
      [exerciseId]: value
    }));
  };
  
  return (
    <ScrollArea className="h-[calc(100vh-120px)] pb-20">
      <div className="p-4 pb-24">
        {exercises.map((exercise, exerciseIndex) => (
          <Card key={exercise.id} className="mb-8 bg-white shadow-sm border-0">
            <ActiveWorkout 
              exerciseName={exercise.name}
              sets={exercise.sets}
              exerciseIndex={exerciseIndex}
              onAddSet={() => handleAddSet(exerciseIndex)}
              onRemoveSet={(setIndex) => handleRemoveSet(exerciseIndex, setIndex)}
              onCompleteSet={(setIndex) => handleCompleteSet(exerciseIndex, setIndex)}
              onUpdateSet={(setIndex, data) => handleUpdateSet(exerciseIndex, setIndex, data)}
              exerciseId={exercise.id}
              notes={notes[exercise.id] || ''}
              onNotesChange={(value) => handleNotesChange(exercise.id, value)}
              initialRestTimer={restTimerSettings}
              onRestTimerChange={handleRestTimerChange}
              isTimerSaving={isTimerSaving}
            />
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

export default WorkoutContent;

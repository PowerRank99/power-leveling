
import React, { useState, useEffect } from 'react';
import { useExerciseRestTimer } from '@/hooks/useExerciseRestTimer';
import { WorkoutExercise } from '@/types/workoutTypes';
import FloatingTimer from './FloatingTimer';
import TimerSelectionModal from './TimerSelectionModal';

interface WorkoutTimerControlsProps {
  exercises: WorkoutExercise[];
}

const WorkoutTimerControls: React.FC<WorkoutTimerControlsProps> = ({ exercises }) => {
  // Timer hook
  const {
    timerState,
    timerSettings,
    showDurationSelector,
    setShowDurationSelector,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    addTime,
    formatTime: formatTimerTime,
    loadExerciseTimerDuration,
    updateTimerDuration
  } = useExerciseRestTimer();
  
  // State for timer modal
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [selectedExerciseName, setSelectedExerciseName] = useState<string | null>(null);
  const [exerciseTimers, setExerciseTimers] = useState<Record<string, number>>({});
  
  // Handle timer click for an exercise
  const handleTimerClick = (exerciseId: string, exerciseName: string) => {
    setSelectedExerciseId(exerciseId);
    setSelectedExerciseName(exerciseName);
    setShowDurationSelector(true);
  };
  
  // Handle timer duration selection
  const handleTimerDurationSelect = (duration: number) => {
    if (selectedExerciseId) {
      // Update the duration in our local state
      setExerciseTimers(prev => ({
        ...prev,
        [selectedExerciseId]: duration
      }));
      
      // Update in the timer state if it's the current timer
      updateTimerDuration(selectedExerciseId, duration);
    }
  };
  
  // Load exercise timer duration
  const handleLoadExerciseTimer = (exerciseId: string) => {
    // Fixed: Don't check the return value for truthiness
    loadExerciseTimerDuration(exerciseId)
      .then(duration => {
        if (typeof duration === 'number') {
          setExerciseTimers(prev => ({
            ...prev,
            [exerciseId]: duration
          }));
        }
      })
      .catch(error => {
        console.error(`Error loading timer for ${exerciseId}:`, error);
      });
  };
  
  // Load timer durations for all exercises on mount
  useEffect(() => {
    if (exercises && exercises.length > 0) {
      exercises.forEach(exercise => {
        handleLoadExerciseTimer(exercise.id);
      });
    }
  }, [exercises]);
  
  return (
    <>
      {/* Timer Selection Modal */}
      <TimerSelectionModal
        isOpen={showDurationSelector}
        onClose={() => setShowDurationSelector(false)}
        onSelectDuration={handleTimerDurationSelect}
        currentDuration={
          selectedExerciseId && exerciseTimers[selectedExerciseId] 
          ? exerciseTimers[selectedExerciseId] 
          : 90
        }
        exerciseName={selectedExerciseName || undefined}
      />
      
      {/* Floating Timer */}
      <FloatingTimer
        timerState={timerState}
        formatTime={formatTimerTime}
        onPause={pauseTimer}
        onResume={resumeTimer}
        onStop={stopTimer}
        onAddTime={addTime}
      />
    </>
  );
};

export default WorkoutTimerControls;


import React from 'react';
import { useParams } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useWorkoutManager } from '@/hooks/useWorkoutManager';
import { useWorkoutTimerController } from '@/hooks/useWorkoutTimerController';

// Imported Components
import WorkoutHeader from '@/components/workout/WorkoutHeader';
import WorkoutProgressBar from '@/components/workout/WorkoutProgressBar';
import WorkoutLoading from '@/components/workout/WorkoutLoading';
import WorkoutError from '@/components/workout/WorkoutError';
import EmptyExerciseState from '@/components/workout/EmptyExerciseState';
import ActiveWorkout from '@/components/workout/ActiveWorkout';
import FinishWorkoutButton from '@/components/workout/FinishWorkoutButton';
import FloatingTimer from '@/components/workout/timer/FloatingTimer';
import TimerSelectionModal from '@/components/workout/timer/TimerSelectionModal';

const ActiveWorkoutPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  // Use our comprehensive workout manager
  const {
    isLoading,
    loadError,
    exercises,
    currentExerciseIndex,
    totalExercises,
    handleUpdateSet,
    handleAddSet,
    handleRemoveSet,
    handleCompleteSet,
    handleNotesChange,
    finishWorkout,
    discardWorkout,
    formatTime,
    elapsedTime,
    isSubmitting,
    notes
  } = useWorkoutManager(id || '');
  
  // Use our timer controller
  const {
    timerState,
    showDurationSelector,
    setShowDurationSelector,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    addTime,
    formatTime: formatTimerTime,
    selectedExerciseId,
    selectedExerciseName,
    exerciseTimers,
    savingTimerDuration,
    handleTimerClick,
    handleTimerDurationSelect,
    handleLoadExerciseTimer,
    getExerciseTimerDuration
  } = useWorkoutTimerController(exercises);
  
  // Loading state
  if (isLoading) {
    return <WorkoutLoading />;
  }
  
  // Error state
  if (loadError) {
    return <WorkoutError errorMessage={loadError} />;
  }
  
  // Empty state
  if (!exercises || exercises.length === 0) {
    return <EmptyExerciseState />;
  }
  
  return (
    <div className="min-h-screen bg-midnight-deep">
      <WorkoutHeader 
        onFinish={finishWorkout}
        onDiscard={discardWorkout}
        isFinishing={isSubmitting}
        elapsedTime={formatTime(elapsedTime)}
      />
      
      <WorkoutProgressBar
        currentExerciseIndex={currentExerciseIndex}
        totalExercises={totalExercises}
      />
      
      <ScrollArea className="h-[calc(100vh-120px)] pb-20">
        <div className="p-4 pb-24">
          {exercises.map((exercise, exerciseIndex) => (
            <Card key={exercise.id} className="mb-8 premium-card shadow-subtle">
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
                onTimerClick={(exerciseId, exerciseName) => handleTimerClick(exerciseId, exerciseName)}
                onStartTimer={startTimer}
                timerDuration={getExerciseTimerDuration(exercise.id)}
                loadExerciseTimer={handleLoadExerciseTimer}
                isSavingTimer={savingTimerDuration[exercise.id] || false}
              />
            </Card>
          ))}
        </div>
      </ScrollArea>
      
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-midnight-base border-t border-divider">
        <FinishWorkoutButton 
          onFinish={finishWorkout}
          isFinishing={isSubmitting}
        />
      </div>
      
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
    </div>
  );
};

export default ActiveWorkoutPage;

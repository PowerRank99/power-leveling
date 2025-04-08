
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

// Import our new WorkoutManager hook
import { useWorkoutManager } from '@/hooks/useWorkoutManager';
import { useExerciseRestTimer } from '@/hooks/useExerciseRestTimer';

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
  const navigate = useNavigate();
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
  
  // Use our timer hook
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
    if (!user) return;
    
    loadExerciseTimerDuration(exerciseId).then(duration => {
      if (duration) {
        setExerciseTimers(prev => ({
          ...prev,
          [exerciseId]: duration
        }));
      }
    });
  };
  
  // Validate route parameters
  useEffect(() => {
    if (!id) {
      toast.error("Erro na rota", {
        description: "ID da rotina não encontrado na URL."
      });
      navigate('/treino');
    }
  }, [id, navigate]);
  
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
    <div className="min-h-screen bg-gray-50">
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
                onTimerClick={handleTimerClick}
                onStartTimer={startTimer}
                timerDuration={exerciseTimers[exercise.id] || 90}
                loadExerciseTimer={handleLoadExerciseTimer}
              />
            </Card>
          ))}
        </div>
      </ScrollArea>
      
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-50 border-t border-gray-200">
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

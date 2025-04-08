
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useWorkout } from '@/hooks/useWorkout';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

// Imported Components
import WorkoutHeader from '@/components/workout/WorkoutHeader';
import WorkoutProgressBar from '@/components/workout/WorkoutProgressBar';
import WorkoutLoading from '@/components/workout/WorkoutLoading';
import WorkoutError from '@/components/workout/WorkoutError';
import EmptyExerciseState from '@/components/workout/EmptyExerciseState';
import ActiveWorkout from '@/components/workout/ActiveWorkout';
import FinishWorkoutButton from '@/components/workout/FinishWorkoutButton';
import { Card } from '@/components/ui/card';

const ActiveWorkoutPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast: uiToast } = useToast();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);
  
  const {
    isLoading,
    loadError,
    exercises,
    currentExerciseIndex,
    totalExercises,
    updateSet,
    addSet,
    removeSet,
    finishWorkout,
    discardWorkout,
    formatTime,
    elapsedTime,
    restTimerSettings,
    handleRestTimerChange,
    isSubmitting,
    isTimerSaving
  } = useWorkout(id || '');
  
  useEffect(() => {
    if (!id) {
      toast.error("Erro na rota", {
        description: "ID da rotina não encontrado na URL."
      });
      navigate('/treino');
    }
  }, [id, navigate]);
  
  const handleAddSet = (exerciseIndex: number) => {
    addSet(exerciseIndex);
  };
  
  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    removeSet(exerciseIndex, setIndex);
  };
  
  const handleCompleteSet = (exerciseIndex: number, setIndex: number) => {
    if (exercises[exerciseIndex]) {
      updateSet(exerciseIndex, setIndex, { 
        completed: !exercises[exerciseIndex].sets[setIndex].completed 
      });
    }
  };
  
  const handleUpdateSet = (exerciseIndex: number, setIndex: number, data: { weight?: string; reps?: string }) => {
    updateSet(exerciseIndex, setIndex, data);
  };
  
  const handleNotesChange = (exerciseId: string, value: string) => {
    setNotes(prev => ({
      ...prev,
      [exerciseId]: value
    }));
  };
  
  const handleFinishWorkout = async () => {
    if (isLocalSubmitting || isSubmitting) {
      console.log("Already submitting, ignoring duplicate request");
      return;
    }

    try {
      setIsLocalSubmitting(true);
      console.log("Starting workout finish process...");
      const success = await finishWorkout();
      console.log("Finish workout result:", success);
      
      if (success) {
        toast.success("Treino Completo!", {
          description: "Seu treino foi salvo com sucesso.",
        });
        navigate('/treino');
      } else {
        toast.error("Erro ao finalizar treino", {
          description: "Ocorreu um erro ao salvar seu treino.",
        });
      }
    } catch (error) {
      console.error("Error in handleFinishWorkout:", error);
      toast.error("Erro ao finalizar treino", {
        description: "Ocorreu um erro ao salvar seu treino.",
      });
    } finally {
      setIsLocalSubmitting(false);
    }
  };

  const handleDiscardWorkout = async () => {
    if (isLocalSubmitting || isSubmitting) {
      console.log("Already submitting, ignoring duplicate request");
      return;
    }

    try {
      setIsLocalSubmitting(true);
      console.log("Starting workout discard process...");
      const success = await discardWorkout();
      console.log("Discard workout result:", success);
      
      if (success) {
        toast.info("Treino descartado", {
          description: "O treino foi descartado com sucesso.",
        });
        navigate('/treino');
      } else {
        toast.error("Erro ao descartar treino", {
          description: "Ocorreu um erro ao descartar o treino.",
        });
      }
    } catch (error) {
      console.error("Error discarding workout:", error);
      toast.error("Erro ao descartar treino", {
        description: "Não foi possível descartar o treino.",
      });
    } finally {
      setIsLocalSubmitting(false);
    }
  };
  
  // If loading, show loading UI
  if (isLoading) {
    return <WorkoutLoading />;
  }
  
  // If there's an error, show error UI
  if (loadError) {
    return <WorkoutError errorMessage={loadError} />;
  }
  
  // If no exercises are found, show empty state
  if (!exercises || exercises.length === 0) {
    return <EmptyExerciseState />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <WorkoutHeader 
        onFinish={handleFinishWorkout}
        onDiscard={handleDiscardWorkout}
        isFinishing={isSubmitting || isLocalSubmitting}
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
                initialRestTimer={restTimerSettings}
                onRestTimerChange={handleRestTimerChange}
                isTimerSaving={isTimerSaving}
              />
            </Card>
          ))}
        </div>
      </ScrollArea>
      
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-50 border-t border-gray-200">
        <FinishWorkoutButton 
          onFinish={handleFinishWorkout}
          isFinishing={isSubmitting || isLocalSubmitting}
        />
      </div>
    </div>
  );
};

export default ActiveWorkoutPage;

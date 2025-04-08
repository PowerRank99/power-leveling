
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useWorkout } from '@/hooks/useWorkout';

// Imported Components
import WorkoutHeader from '@/components/workout/WorkoutHeader';
import WorkoutProgressBar from '@/components/workout/WorkoutProgressBar';
import WorkoutLoading from '@/components/workout/WorkoutLoading';
import WorkoutError from '@/components/workout/WorkoutError';
import EmptyExerciseState from '@/components/workout/EmptyExerciseState';
import ActiveWorkout from '@/components/workout/ActiveWorkout';
import NextExercisePreview from '@/components/workout/NextExercisePreview';
import ExerciseNotes from '@/components/workout/ExerciseNotes';
import FinishWorkoutButton from '@/components/workout/FinishWorkoutButton';
import { Card, CardContent } from '@/components/ui/card';

const ActiveWorkoutPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [notes, setNotes] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);
  
  const {
    isLoading,
    loadError,
    currentExercise,
    nextExercise,
    currentExerciseIndex,
    totalExercises,
    updateSet,
    addSet,
    goToNextExercise,
    finishWorkout,
    formatTime,
    elapsedTime
  } = useWorkout(id || '');
  
  useEffect(() => {
    if (!id) {
      toast({
        title: "Erro na rota",
        description: "ID da rotina não encontrado na URL.",
        variant: "destructive"
      });
      navigate('/treino');
    }
  }, [id, toast, navigate]);
  
  const handleAddSet = () => {
    addSet();
  };
  
  const handleCompleteSet = (setIndex: number) => {
    if (currentExercise) {
      updateSet(setIndex, { completed: !currentExercise.sets[setIndex].completed });
    }
  };
  
  const handleUpdateSet = (setIndex: number, data: { weight?: string; reps?: string }) => {
    updateSet(setIndex, data);
  };
  
  const handleFinishWorkout = async () => {
    setIsFinishing(true);
    try {
      const success = await finishWorkout();
      if (success) {
        toast({
          title: "Treino Completo!",
          description: "Seu treino foi salvo com sucesso.",
        });
        navigate('/treino');
      } else {
        toast({
          title: "Erro ao finalizar treino",
          description: "Ocorreu um erro ao salvar seu treino.",
          variant: "destructive"
        });
      }
    } finally {
      setIsFinishing(false);
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
  
  // If no exercise is found, show empty state
  if (!currentExercise) {
    return <EmptyExerciseState />;
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <WorkoutHeader 
        onFinish={handleFinishWorkout}
        isFinishing={isFinishing}
      />
      
      <WorkoutProgressBar
        currentExerciseIndex={currentExerciseIndex}
        totalExercises={totalExercises}
      />
      
      <div className="p-4">
        <Card className="mb-4 bg-white shadow-sm border-0">
          <CardContent className="p-0">
            <ActiveWorkout 
              exerciseName={currentExercise.name}
              sets={currentExercise.sets}
              onAddSet={handleAddSet}
              onCompleteSet={handleCompleteSet}
              onUpdateSet={handleUpdateSet}
              elapsedTime={formatTime(elapsedTime)}
            />
          </CardContent>
        </Card>
      
        {nextExercise && (
          <Card className="mb-4 bg-white shadow-sm border-0">
            <CardContent className="p-4">
              <NextExercisePreview
                nextExercise={nextExercise}
                currentIndex={currentExerciseIndex}
                totalExercises={totalExercises}
                onSkip={goToNextExercise}
              />
            </CardContent>
          </Card>
        )}
        
        <Card className="mb-4 bg-white shadow-sm border-0">
          <CardContent className="p-4">
            <ExerciseNotes
              notes={notes}
              onNotesChange={setNotes}
            />
          </CardContent>
        </Card>
        
        <FinishWorkoutButton 
          onFinish={handleFinishWorkout}
          isFinishing={isFinishing}
        />
      </div>
    </div>
  );
};

export default ActiveWorkoutPage;

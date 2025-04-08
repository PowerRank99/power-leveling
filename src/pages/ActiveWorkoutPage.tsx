
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useWorkout } from '@/hooks/useWorkout';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const { toast } = useToast();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [isFinishing, setIsFinishing] = useState(false);
  
  const {
    isLoading,
    loadError,
    exercises,
    currentExerciseIndex,
    totalExercises,
    updateSet,
    addSet,
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
  
  const handleAddSet = (exerciseIndex: number) => {
    addSet(exerciseIndex);
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
  
  // If no exercises are found, show empty state
  if (!exercises || exercises.length === 0) {
    return <EmptyExerciseState />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <WorkoutHeader 
        onFinish={handleFinishWorkout}
        isFinishing={isFinishing}
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
                onCompleteSet={(setIndex) => handleCompleteSet(exerciseIndex, setIndex)}
                onUpdateSet={(setIndex, data) => handleUpdateSet(exerciseIndex, setIndex, data)}
                exerciseId={exercise.id}
                notes={notes[exercise.id] || ''}
                onNotesChange={(value) => handleNotesChange(exercise.id, value)}
              />
            </Card>
          ))}
        </div>
      </ScrollArea>
      
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-50 border-t border-gray-200">
        <FinishWorkoutButton 
          onFinish={handleFinishWorkout}
          isFinishing={isFinishing}
        />
      </div>
    </div>
  );
};

export default ActiveWorkoutPage;

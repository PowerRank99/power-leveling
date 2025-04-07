
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import ActiveWorkout from '@/components/workout/ActiveWorkout';
import { Menu, CheckCircle, AlertCircle } from 'lucide-react';
import { EditIcon } from '@/components/icons/NavIcons';
import { useWorkout } from '@/hooks/useWorkout';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

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
  
  const handleSkipExercise = () => {
    goToNextExercise();
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-fitblue border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Carregando treino...</p>
          <p className="text-gray-500 text-sm mt-2">Preparando seus exercícios</p>
        </div>
      </div>
    );
  }
  
  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Erro no Treino" />
        
        <div className="p-4">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro ao carregar treino</AlertTitle>
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
          
          <Button 
            onClick={() => navigate('/treino')}
            className="w-full mt-4"
          >
            Voltar para Treinos
          </Button>
        </div>
      </div>
    );
  }
  
  if (!currentExercise) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="Treino Atual" 
          rightContent={
            <button className="p-1">
              <Menu className="w-6 h-6" />
            </button>
          }
        />
        
        <div className="p-4 text-center">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Sem exercícios</AlertTitle>
            <AlertDescription>Nenhum exercício encontrado para esta rotina.</AlertDescription>
          </Alert>
          
          <Button 
            onClick={() => navigate('/treino')}
            className="mt-4"
          >
            Voltar para Treinos
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Treino Atual" 
        rightContent={
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFinishWorkout}
              disabled={isFinishing}
            >
              {isFinishing ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <CheckCircle className="w-6 h-6" />
              )}
            </Button>
            <Button
              variant="ghost" 
              size="icon"
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        }
      />
      
      <div className="bg-white p-2">
        <div className="flex justify-between items-center px-2">
          <div className="text-sm text-gray-500">
            Exercício {currentExerciseIndex + 1} de {totalExercises}
          </div>
          <div className="bg-fitblue-100 px-3 py-1 rounded-full text-xs text-fitblue font-medium">
            {Math.floor((currentExerciseIndex / totalExercises) * 100)}% completo
          </div>
        </div>
      </div>
      
      <ActiveWorkout 
        exerciseName={currentExercise.name}
        sets={currentExercise.sets}
        onAddSet={handleAddSet}
        onCompleteSet={handleCompleteSet}
        onUpdateSet={handleUpdateSet}
        elapsedTime={formatTime(elapsedTime)}
      />
      
      {/* Next Exercise Preview */}
      {nextExercise && (
        <div className="bg-white p-4 border-t border-gray-200 mt-4">
          <p className="text-gray-500 mb-2">Próximo Exercício</p>
          
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">{nextExercise.name}</h3>
              <p className="text-sm text-gray-500">{currentExerciseIndex + 2}/{totalExercises}</p>
            </div>
            
            <button 
              className="text-fitblue font-medium"
              onClick={handleSkipExercise}
            >
              Pular
            </button>
          </div>
        </div>
      )}
      
      {/* Exercise Notes */}
      <div className="p-4">
        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold">Anotações</h3>
            <EditIcon className="w-5 h-5 text-gray-400" />
          </div>
          
          <textarea 
            placeholder="Adicionar notas sobre o exercício..."
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 min-h-[100px]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>
      </div>
      
      {/* Finish Workout Button */}
      <div className="p-4">
        <Button 
          className="w-full bg-fitblue"
          onClick={handleFinishWorkout}
          disabled={isFinishing}
        >
          {isFinishing ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Finalizando...
            </>
          ) : (
            "Finalizar Treino"
          )}
        </Button>
      </div>
    </div>
  );
};

export default ActiveWorkoutPage;

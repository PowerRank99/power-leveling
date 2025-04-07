
import React from 'react';
import { Plus } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import ExerciseSearch from '@/components/workout/ExerciseSearch';
import SelectedExercisesList from '@/components/workout/SelectedExercisesList';
import { useRoutineCreation } from '@/hooks/useRoutineCreation';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const CreateRoutinePage: React.FC = () => {
  const { user } = useAuth();
  const {
    routineName,
    setRoutineName,
    isShowingSearch,
    setIsShowingSearch,
    selectedExercises,
    isSaving,
    error,
    addExercise,
    removeExercise,
    saveRoutine
  } = useRoutineCreation();

  const isButtonDisabled = isSaving || routineName.trim() === '' || selectedExercises.length === 0 || !user;

  return (
    <div className="pb-20">
      <PageHeader title="Criar Rotina" />

      <div className="p-4">
        {!user && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Autenticação necessária</AlertTitle>
            <AlertDescription>
              Você precisa estar logado para criar rotinas.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro ao salvar</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Input
          value={routineName}
          onChange={(e) => setRoutineName(e.target.value)}
          placeholder="Nome da rotina (ex: Treino A - Peito e Tríceps)"
          className="mb-4"
        />

        {/* List of selected exercises */}
        <SelectedExercisesList 
          exercises={selectedExercises} 
          onRemoveExercise={removeExercise} 
        />

        {/* Add exercises */}
        {isShowingSearch ? (
          <ExerciseSearch
            selectedExercises={selectedExercises}
            onAddExercise={addExercise}
            onClose={() => setIsShowingSearch(false)}
          />
        ) : (
          <Button 
            onClick={() => setIsShowingSearch(true)} 
            className="w-full mb-4 bg-fitblue-100 text-fitblue hover:bg-fitblue-200 border-none"
          >
            <Plus className="w-5 h-5 mr-2" /> Adicionar Exercício
          </Button>
        )}

        {/* Save routine button with better feedback */}
        <Button 
          className={`w-full ${isButtonDisabled ? 'bg-gray-400' : 'bg-fitblue'}`}
          onClick={saveRoutine}
          disabled={isButtonDisabled}
        >
          {isSaving ? (
            <>
              <span className="animate-spin mr-2">⏳</span> Salvando...
            </>
          ) : (
            'Salvar Rotina'
          )}
        </Button>

        {routineName.trim() === '' && (
          <p className="text-red-500 text-sm mt-2">Nome da rotina é obrigatório</p>
        )}
        
        {selectedExercises.length === 0 && (
          <p className="text-red-500 text-sm mt-2">Adicione pelo menos um exercício</p>
        )}
      </div>

      <BottomNavBar />
    </div>
  );
};

export default CreateRoutinePage;

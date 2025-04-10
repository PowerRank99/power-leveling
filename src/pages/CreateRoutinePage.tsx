
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
    <div className="pb-20 min-h-screen bg-midnight-base">
      <PageHeader title="Criar Rotina" showBackButton={true} />

      <div className="p-4">
        {!user && (
          <Alert variant="destructive" className="mb-4 bg-valor-15 border-valor-30 text-valor shadow-subtle">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-orbitron">Autenticação necessária</AlertTitle>
            <AlertDescription className="font-sora">
              Você precisa estar logado para criar rotinas.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4 bg-valor-15 border-valor-30 text-valor shadow-subtle">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-orbitron">Erro ao salvar</AlertTitle>
            <AlertDescription className="font-sora">{error}</AlertDescription>
          </Alert>
        )}

        <Input
          value={routineName}
          onChange={(e) => setRoutineName(e.target.value)}
          placeholder="Nome da rotina (ex: Treino A - Peito e Tríceps)"
          className="mb-4 bg-midnight-elevated border-divider text-text-primary placeholder:text-text-tertiary font-sora"
        />

        {/* List of selected exercises */}
        <div className="premium-card mb-4 shadow-subtle">
          <SelectedExercisesList 
            exercises={selectedExercises} 
            onRemoveExercise={removeExercise} 
          />
        </div>

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
            className="w-full mb-4 bg-arcane-15 text-arcane hover:bg-arcane-30 border border-arcane-30 font-sora shadow-glow-subtle"
          >
            <Plus className="w-5 h-5 mr-2" /> Adicionar Exercício
          </Button>
        )}

        {/* Save routine button with better feedback */}
        <Button 
          className={`w-full ${isButtonDisabled ? 'bg-midnight-elevated text-text-tertiary' : 'bg-arcane hover:bg-arcane-60 text-text-primary shadow-glow-subtle'} font-sora`}
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
          <p className="text-valor text-sm mt-2 font-sora">Nome da rotina é obrigatório</p>
        )}
        
        {selectedExercises.length === 0 && (
          <p className="text-valor text-sm mt-2 font-sora">Adicione pelo menos um exercício</p>
        )}
      </div>

      <BottomNavBar />
    </div>
  );
};

export default CreateRoutinePage;

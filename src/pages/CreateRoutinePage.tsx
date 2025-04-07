
import React from 'react';
import { Plus } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import ExerciseSearch from '@/components/workout/ExerciseSearch';
import SelectedExercisesList from '@/components/workout/SelectedExercisesList';
import { useRoutineCreation } from '@/hooks/useRoutineCreation';

const CreateRoutinePage: React.FC = () => {
  const {
    routineName,
    setRoutineName,
    isShowingSearch,
    setIsShowingSearch,
    selectedExercises,
    isSaving,
    addExercise,
    removeExercise,
    saveRoutine
  } = useRoutineCreation();

  return (
    <div className="pb-20">
      <PageHeader title="Criar Rotina" />

      <div className="p-4">
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

        {/* Save routine button */}
        <Button 
          className="w-full bg-fitblue"
          onClick={saveRoutine}
          disabled={isSaving || routineName.trim() === '' || selectedExercises.length === 0}
        >
          {isSaving ? 'Salvando...' : 'Salvar Rotina'}
        </Button>
      </div>

      <BottomNavBar />
    </div>
  );
};

export default CreateRoutinePage;

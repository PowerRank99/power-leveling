
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Trash2 } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { RoutineWithExercises } from '@/components/workout/types/Workout';
import { timeAgo } from '@/lib/formatters';

interface RoutinesListProps {
  routines: RoutineWithExercises[];
  isLoading: boolean;
  onRetry: () => void;
  error: string | null;
  hasAttemptedLoad: boolean;
  onDeleteRoutine: (id: string) => Promise<void>;
  isDeletingItem: Record<string, boolean>;
}

const RoutinesList: React.FC<RoutinesListProps> = ({
  routines,
  isLoading,
  onRetry,
  error,
  hasAttemptedLoad,
  onDeleteRoutine,
  isDeletingItem
}) => {
  const navigate = useNavigate();
  
  const handleStartRoutine = (routineId: string) => {
    navigate(`/treino/ativo/${routineId}`);
  };
  
  if (isLoading && !hasAttemptedLoad) {
    return <LoadingSpinner message="Carregando rotinas..." />;
  }
  
  if (routines.length === 0 && hasAttemptedLoad && !error) {
    return (
      <EmptyState 
        icon="ClipboardList"
        title="Nenhuma rotina salva"
        description="Crie uma rotina para começar seus treinos"
        action={
          <Button 
            onClick={() => navigate('/treino/criar')} 
            className="mt-4 bg-arcane hover:bg-arcane-60 text-text-primary shadow-glow-subtle border border-arcane-30"
          >
            <Plus className="mr-2 h-4 w-4" />
            Criar rotina
          </Button>
        }
      />
    );
  }
  
  return (
    <div className="space-y-4">
      {routines.map((routine) => (
        <Card key={routine.id} className="premium-card hover:premium-card-elevated transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-orbitron font-semibold text-text-primary">{routine.name}</h3>
                <p className="text-xs text-text-tertiary font-sora">
                  {routine.last_used_at 
                    ? `Usado ${timeAgo(routine.last_used_at)}` 
                    : `Criado ${timeAgo(routine.created_at)}`
                  }
                </p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-arcane-15 text-arcane font-space border border-arcane-30">
                {routine.exercise_count} exercícios
              </span>
            </div>
            
            <div className="mt-3">
              <ul className="text-sm text-text-secondary space-y-1 font-sora">
                {routine.exercises.slice(0, 3).map((exercise, index) => (
                  <li key={index} className="truncate">{exercise.name}</li>
                ))}
                {routine.exercises.length > 3 && (
                  <li className="text-text-tertiary">+ {routine.exercises.length - 3} mais</li>
                )}
              </ul>
            </div>
          </CardContent>
          
          <CardFooter className="p-0 border-t border-divider">
            <div className="w-full grid grid-cols-2">
              <Button 
                variant="ghost" 
                className="rounded-none py-4 text-arcane hover:bg-arcane-15 font-sora" 
                onClick={() => handleStartRoutine(routine.id)}
              >
                <Play className="h-4 w-4 mr-2" /> Iniciar
              </Button>
              <Button 
                variant="ghost" 
                className="rounded-none py-4 text-valor hover:bg-valor-15 font-sora" 
                onClick={() => onDeleteRoutine(routine.id)}
                disabled={isDeletingItem[routine.id]}
              >
                {isDeletingItem[routine.id] ? (
                  <>Excluindo...</>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" /> Excluir
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default RoutinesList;


import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, Plus } from 'lucide-react';

interface WorkoutErrorProps {
  errorMessage: string;
  onRetry?: () => void;
  routineId?: string;
}

const WorkoutError: React.FC<WorkoutErrorProps> = ({ errorMessage, onRetry, routineId }) => {
  const navigate = useNavigate();
  
  // Check if the error is related to missing exercises
  const isMissingExercisesError = errorMessage.includes('não possui exercícios');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Erro no Treino" />
      
      <div className="p-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar treino</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
        
        <div className="flex flex-col gap-2">
          {/* Show different actions based on the error type */}
          {isMissingExercisesError ? (
            <>
              <Button 
                onClick={() => routineId ? navigate(`/treino/editar/${routineId}`) : navigate('/treino')}
                className="w-full"
                variant="default"
              >
                <Plus className="w-4 h-4 mr-2" /> Adicionar Exercícios à Rotina
              </Button>
            </>
          ) : (
            onRetry && (
              <Button 
                onClick={onRetry}
                variant="outline"
                className="w-full"
              >
                Tentar novamente
              </Button>
            )
          )}
          
          <Button 
            onClick={() => navigate('/treino')}
            className="w-full mt-2"
            variant={isMissingExercisesError ? "outline" : "default"}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Treinos
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutError;

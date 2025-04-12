
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import { ErrorCategory } from '@/services/common/ErrorHandlingService';

interface WorkoutErrorProps {
  errorMessage: string;
  details?: string;
  category?: ErrorCategory;
}

/**
 * Full-page error display for workout errors
 */
const WorkoutError: React.FC<WorkoutErrorProps> = ({ 
  errorMessage, 
  details,
  category = ErrorCategory.UNKNOWN 
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-midnight-deep p-4 flex flex-col items-center justify-center">
      <ErrorDisplay
        title="Erro ao carregar treino"
        message={errorMessage}
        details={details}
        category={category}
        className="max-w-md w-full mb-4"
      />
      <Button 
        onClick={() => navigate('/treino')}
        className="bg-arcane hover:bg-arcane-60 text-text-primary font-sora shadow-glow-subtle"
      >
        Voltar para Treinos
      </Button>
    </div>
  );
};

export default WorkoutError;

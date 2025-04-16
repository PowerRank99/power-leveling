
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface WorkoutErrorProps {
  errorMessage: string;
}

const WorkoutError: React.FC<WorkoutErrorProps> = ({ errorMessage }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-midnight-deep p-4 flex flex-col items-center justify-center">
      <Alert variant="destructive" className="max-w-md w-full mb-4 bg-valor-15 border-valor-30 text-valor shadow-subtle">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="font-orbitron">Erro ao carregar treino</AlertTitle>
        <AlertDescription className="font-sora">
          {errorMessage}
        </AlertDescription>
      </Alert>
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

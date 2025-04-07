
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface WorkoutErrorProps {
  errorMessage: string;
}

const WorkoutError: React.FC<WorkoutErrorProps> = ({ errorMessage }) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Erro no Treino" />
      
      <div className="p-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar treino</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
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
};

export default WorkoutError;

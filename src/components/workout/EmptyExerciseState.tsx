
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Menu } from 'lucide-react';

const EmptyExerciseState: React.FC = () => {
  const navigate = useNavigate();
  
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
};

export default EmptyExerciseState;

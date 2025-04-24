
import React from 'react';
import { AlertCircle, BarChart2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const EmptyExerciseState: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-midnight-deep p-4 flex flex-col items-center justify-center">
      <div className="max-w-md w-full mb-6 text-center">
        <div className="w-16 h-16 rounded-full bg-arcane-15 flex items-center justify-center mx-auto mb-4">
          <BarChart2 className="h-8 w-8 text-arcane" />
        </div>
        <h2 className="text-2xl font-orbitron text-text-primary mb-2">Sem exercícios</h2>
        <p className="text-text-secondary font-sora mb-6">
          Esta rotina não possui exercícios. Adicione exercícios à rotina antes de iniciar um treino.
        </p>
      </div>
      
      <Alert variant="default" className="max-w-md w-full mb-6 bg-arcane-15 border-arcane-30 text-arcane shadow-subtle">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="font-orbitron">Dica</AlertTitle>
        <AlertDescription className="font-sora">
          Você pode criar uma nova rotina ou editar esta rotina adicionando exercícios.
        </AlertDescription>
      </Alert>
      
      <div className="flex gap-4">
        <Button 
          onClick={() => navigate('/treino')}
          variant="outline"
          className="bg-midnight-elevated border-divider text-text-secondary hover:bg-midnight-base hover:text-text-primary font-sora"
        >
          Voltar
        </Button>
        <Button 
          onClick={() => navigate('/rotinas/criar')}
          className="bg-arcane hover:bg-arcane-60 text-text-primary font-sora shadow-glow-subtle"
        >
          Criar Nova Rotina
        </Button>
      </div>
    </div>
  );
};

export default EmptyExerciseState;

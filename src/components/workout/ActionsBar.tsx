
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dumbbell, Plus } from 'lucide-react';

const ActionsBar = () => {
  const navigate = useNavigate();

  const handleCreateRoutine = () => {
    navigate('/rotinas/criar');
  };

  return (
    <div className="flex space-x-2">
      <Button 
        onClick={handleCreateRoutine}
        className="flex-1 bg-arcane hover:bg-arcane-60 text-text-primary shadow-glow-subtle border border-arcane-30 font-sora"
      >
        <Plus className="mr-2 h-5 w-5" />
        Nova Rotina
      </Button>
      
      <Button 
        onClick={() => navigate('/exercicios')}
        className="flex-1 bg-midnight-elevated hover:bg-arcane-15 text-text-primary border border-divider font-sora"
      >
        <Dumbbell className="mr-2 h-5 w-5 text-arcane" />
        Exercícios
      </Button>
    </div>
  );
};

export default ActionsBar;

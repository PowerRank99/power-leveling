
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dumbbell, Plus, List } from 'lucide-react';

const ActionsBar = () => {
  return (
    <div className="flex space-x-2">
      <Button 
        asChild 
        className="flex-1 bg-arcane hover:bg-arcane-60 text-text-primary shadow-glow-subtle border border-arcane-30 font-sora"
      >
        <Link to="/treino/criar">
          <Plus className="mr-2 h-5 w-5" />
          Nova Rotina
        </Link>
      </Button>
      
      <Button 
        asChild 
        className="flex-1 bg-midnight-elevated hover:bg-arcane-15 text-text-primary border border-divider font-sora"
      >
        <Link to="/exercicios">
          <Dumbbell className="mr-2 h-5 w-5 text-arcane" />
          Exercícios
        </Link>
      </Button>
    </div>
  );
};

export default ActionsBar;

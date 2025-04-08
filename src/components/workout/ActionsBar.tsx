
import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, ClipboardList, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ActionsBar = () => {
  return (
    <div className="flex gap-2 justify-between">
      <Link to="/treino/criar" className="flex-1">
        <Button 
          variant="default" 
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Rotina
        </Button>
      </Link>
      
      <Link to="/exercicios" className="flex-1">
        <Button 
          variant="outline"
          className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
        >
          <ClipboardList className="h-4 w-4 mr-2" />
          Exercícios
        </Button>
      </Link>
      
      <Link to="/configuracoes/timer" className="flex-shrink-0">
        <Button
          variant="outline"
          size="icon"
          className="border-blue-600 text-blue-600 hover:bg-blue-50 h-full"
          title="Configurações do Timer"
        >
          <Clock className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
};

export default ActionsBar;

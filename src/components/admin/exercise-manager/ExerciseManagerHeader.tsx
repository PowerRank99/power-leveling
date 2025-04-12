
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';

interface ExerciseManagerHeaderProps {
  exerciseCount: number;
  onRefresh: () => void;
}

const ExerciseManagerHeader: React.FC<ExerciseManagerHeaderProps> = ({
  exerciseCount,
  onRefresh
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-bold">Exercícios Cadastrados ({exerciseCount})</h3>
      <Button variant="outline" size="sm" onClick={onRefresh}>
        <RefreshCcw className="mr-2 h-4 w-4" />
        Atualizar
      </Button>
    </div>
  );
};

export default ExerciseManagerHeader;


import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { Menu, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WorkoutHeaderProps {
  onFinish: () => void;
  isFinishing: boolean;
}

const WorkoutHeader: React.FC<WorkoutHeaderProps> = ({ onFinish, isFinishing }) => {
  return (
    <PageHeader 
      title="Treino Atual" 
      rightContent={
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onFinish}
            disabled={isFinishing}
            title="Finalizar Treino"
          >
            {isFinishing ? (
              <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></div>
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
          </Button>
          <Button
            variant="ghost" 
            size="icon"
            title="Menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      }
    />
  );
};

export default WorkoutHeader;

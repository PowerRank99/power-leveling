
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
          >
            {isFinishing ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <CheckCircle className="w-6 h-6" />
            )}
          </Button>
          <Button
            variant="ghost" 
            size="icon"
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      }
    />
  );
};

export default WorkoutHeader;

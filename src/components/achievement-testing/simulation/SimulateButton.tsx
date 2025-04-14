
import React from 'react';
import { Button } from '@/components/ui/button';
import { Award } from 'lucide-react';

interface SimulateButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
}

const SimulateButton: React.FC<SimulateButtonProps> = ({ onClick, isLoading, disabled }) => {
  return (
    <Button 
      onClick={onClick} 
      disabled={isLoading || disabled}
      className="w-full mt-auto bg-arcane-60 hover:bg-arcane transition-colors"
    >
      {isLoading ? (
        <span className="flex items-center">
          <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-current rounded-full" />
          Simulating...
        </span>
      ) : (
        <span className="flex items-center">
          <Award className="mr-2 h-4 w-4" />
          Simulate Workout Completion
        </span>
      )}
    </Button>
  );
};

export default SimulateButton;

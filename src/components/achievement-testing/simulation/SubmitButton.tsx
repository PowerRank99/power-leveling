
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface SubmitButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ onClick, isLoading, disabled }) => {
  return (
    <Button 
      onClick={onClick} 
      disabled={isLoading || disabled}
      className="w-full mt-auto bg-arcane-60 hover:bg-arcane transition-colors"
    >
      {isLoading ? (
        <span className="flex items-center">
          <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-current rounded-full" />
          Submitting...
        </span>
      ) : (
        <span className="flex items-center">
          <Upload className="mr-2 h-4 w-4" />
          Submit Manual Workout
        </span>
      )}
    </Button>
  );
};

export default SubmitButton;

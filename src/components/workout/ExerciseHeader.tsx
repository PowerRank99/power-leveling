
import React from 'react';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExerciseHeaderProps {
  exerciseName: string;
}

const ExerciseHeader: React.FC<ExerciseHeaderProps> = ({ exerciseName }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center">
        <div className="w-12 h-12 bg-midnight-elevated rounded-md overflow-hidden mr-4 flex-shrink-0 flex items-center justify-center border border-divider/20">
          <img 
            src="/placeholder.svg" 
            alt={exerciseName} 
            className="w-8 h-8 object-contain opacity-70"
          />
        </div>
        <h2 className="text-xl font-bold font-orbitron text-text-primary">{exerciseName}</h2>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-text-secondary hover:text-arcane hover:bg-arcane-15"
      >
        <MoreVertical className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default ExerciseHeader;

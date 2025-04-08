
import React from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WorkoutHeaderProps {
  onFinish: () => void;
  isFinishing: boolean;
  elapsedTime: string;
}

const WorkoutHeader: React.FC<WorkoutHeaderProps> = ({ onFinish, isFinishing, elapsedTime }) => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center">
          <Button
            variant="ghost" 
            size="icon"
            className="mr-2"
            title="Back"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="text-gray-500">{elapsedTime}</div>
        </div>
        
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            title="Timer"
          >
            <Clock className="w-6 h-6" />
          </Button>
          
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white px-6"
            onClick={onFinish}
            disabled={isFinishing}
          >
            {isFinishing ? "Finalizando..." : "Finish"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutHeader;

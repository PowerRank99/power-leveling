
import React from 'react';
import { MoreVertical } from 'lucide-react';

interface ExerciseHeaderProps {
  exerciseName: string;
}

const ExerciseHeader: React.FC<ExerciseHeaderProps> = ({ exerciseName }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center">
        <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden mr-4 flex-shrink-0 flex items-center justify-center">
          <img 
            src="/placeholder.svg" 
            alt={exerciseName} 
            className="w-8 h-8 object-contain"
          />
        </div>
        <h2 className="text-xl font-bold">{exerciseName}</h2>
      </div>
      <button className="p-2">
        <MoreVertical className="w-5 h-5 text-gray-400" />
      </button>
    </div>
  );
};

export default ExerciseHeader;

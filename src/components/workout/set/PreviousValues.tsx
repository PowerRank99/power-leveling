
import React from 'react';
import { PreviousSetData } from '@/components/workout/set/types';

interface PreviousValuesProps {
  previous?: PreviousSetData;
}

const PreviousValues: React.FC<PreviousValuesProps> = ({ previous }) => {
  // If we have previous data, add a subtle animation to draw attention
  const hasData = Boolean(previous);
  
  return (
    <div className={`col-span-3 ${hasData ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-600'} text-sm font-ibm-plex tracking-wide ${hasData ? 'animate-fade-in' : ''}`}>
      {previous ? (
        <div className="flex items-center">
          <span className="font-medium">{previous.weight}</span>
          <span className="mx-0.5 opacity-80">kg</span>
          <span className="mx-0.5 opacity-80">×</span>
          <span className="font-medium">{previous.reps}</span>
        </div>
      ) : (
        <span className="opacity-60">-</span>
      )}
    </div>
  );
};

export default PreviousValues;

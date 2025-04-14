
import React from 'react';
import { PreviousSetData } from '@/types/workout';

interface PreviousValuesProps {
  previous?: PreviousSetData;
}

const PreviousValues: React.FC<PreviousValuesProps> = ({ previous }) => {
  // Ensure we're correctly displaying the previous values
  const weightValue = previous?.weight ? previous.weight : '-';
  const repsValue = previous?.reps ? previous.reps : '-';
  
  return (
    <div className="col-span-3 text-text-tertiary text-sm font-space">
      {previous ? `${weightValue}kg × ${repsValue}` : '-'}
    </div>
  );
};

export default PreviousValues;

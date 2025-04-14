
import React from 'react';
import { PreviousSetData } from '@/types/workoutTypes';

interface PreviousValuesProps {
  previous?: PreviousSetData;
}

const PreviousValues: React.FC<PreviousValuesProps> = ({ previous }) => {
  return (
    <div className="col-span-3 text-text-tertiary text-sm font-space">
      {previous ? `${previous.weight}kg × ${previous.reps}` : '-'}
    </div>
  );
};

export default PreviousValues;

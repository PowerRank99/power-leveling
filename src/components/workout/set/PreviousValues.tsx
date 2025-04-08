
import React from 'react';
import { PreviousSetData } from './types';

interface PreviousValuesProps {
  previous?: PreviousSetData;
}

/**
 * Component to display previous workout values
 */
const PreviousValues: React.FC<PreviousValuesProps> = ({ previous }) => {
  return (
    <div className="col-span-3 text-gray-500 text-sm">
      {previous ? `${previous.weight}kg × ${previous.reps}` : '-'}
    </div>
  );
};

export default PreviousValues;

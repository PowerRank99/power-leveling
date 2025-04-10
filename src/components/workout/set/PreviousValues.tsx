
import React from 'react';
import { PreviousSetData } from '@/components/workout/set/types';

interface PreviousValuesProps {
  previous?: PreviousSetData;
}

const PreviousValues: React.FC<PreviousValuesProps> = ({ previous }) => {
  return (
    <div className="col-span-3 text-gray-500 text-sm font-ibm-plex">
      {previous ? `${previous.weight}kg × ${previous.reps}` : '-'}
    </div>
  );
};

export default PreviousValues;

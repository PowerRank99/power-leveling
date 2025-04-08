
import React from 'react';
import { SetData } from '@/types/workoutTypes';
import PreviousValues from './PreviousValues';
import InputField from './InputField';
import CompleteButton from './CompleteButton';

interface SetRowContentProps {
  index: number;
  set: SetData;
  onComplete: () => void;
  onWeightChange: (value: string) => void;
  onRepsChange: (value: string) => void;
}

/**
 * Component responsible for rendering the content of a set row
 */
const SetRowContent: React.FC<SetRowContentProps> = ({
  index,
  set,
  onComplete,
  onWeightChange,
  onRepsChange
}) => {
  const isCompleted = set.completed;
  const rowClass = isCompleted ? "bg-gray-50" : "bg-white";

  return (
    <div className={`grid grid-cols-12 gap-2 items-center py-4 ${rowClass} border-b border-gray-100`}>
      <div className="col-span-1 font-bold text-gray-800">{index + 1}</div>
      
      <PreviousValues previous={set.previous} />
      
      <div className="col-span-3">
        <InputField
          value={set.weight}
          onChange={onWeightChange}
          inputMode="decimal"
          disabled={isCompleted}
        />
      </div>
      
      <div className="col-span-3">
        <InputField
          value={set.reps}
          onChange={onRepsChange}
          inputMode="numeric"
          disabled={isCompleted}
        />
      </div>
      
      <div className="col-span-2 flex justify-center gap-2">
        <CompleteButton 
          isCompleted={isCompleted} 
          onClick={onComplete} 
        />
      </div>
    </div>
  );
};

export default SetRowContent;

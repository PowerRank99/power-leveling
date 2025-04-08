
import React from 'react';
import { Check, Trash } from 'lucide-react';

interface SetRowProps {
  index: number;
  set: {
    id: string;
    weight: string;
    reps: string;
    completed: boolean;
    previous?: {
      weight: string;
      reps: string;
    };
  };
  onComplete: () => void;
  onRemove: () => void;
  onWeightChange: (value: string) => void;
  onRepsChange: (value: string) => void;
  showRemoveButton: boolean;
}

const SetRow: React.FC<SetRowProps> = ({
  index,
  set,
  onComplete,
  onRemove,
  onWeightChange,
  onRepsChange,
  showRemoveButton
}) => {
  const isCompleted = set.completed;
  const rowClass = isCompleted ? "bg-gray-50" : "bg-white";
  
  return (
    <div className={`grid grid-cols-12 gap-2 items-center py-4 ${rowClass} border-b border-gray-100`}>
      <div className="col-span-1 font-bold text-gray-800">{index + 1}</div>
      <div className="col-span-3 text-gray-500 text-sm">
        {set.previous ? `${set.previous.weight}kg × ${set.previous.reps}` : '-'}
      </div>
      
      <div className="col-span-3">
        <input
          type="text"
          className="w-full border border-gray-200 rounded p-2 text-center"
          value={set.weight}
          onChange={(e) => onWeightChange(e.target.value)}
        />
      </div>
      
      <div className="col-span-3">
        <input
          type="text"
          className="w-full border border-gray-200 rounded p-2 text-center"
          value={set.reps}
          onChange={(e) => onRepsChange(e.target.value)}
        />
      </div>
      
      <div className="col-span-2 flex justify-center gap-2">
        <button
          onClick={onComplete}
          className={`w-8 h-8 rounded-md flex items-center justify-center ${
            isCompleted
              ? 'bg-green-100 text-green-500'
              : 'border border-gray-300 bg-white'
          }`}
        >
          {isCompleted && <Check className="w-4 h-4" />}
        </button>
        
        {showRemoveButton && (
          <button
            onClick={onRemove}
            className="w-8 h-8 rounded-md flex items-center justify-center border border-gray-300 bg-white text-red-500 hover:bg-red-50"
          >
            <Trash className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SetRow;

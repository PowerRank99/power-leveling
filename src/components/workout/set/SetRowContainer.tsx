
import React, { useState } from 'react';
import { Check, Trash } from 'lucide-react';
import { SetData } from '@/types/workoutTypes';

interface SetRowContainerProps {
  index: number;
  set: SetData;
  onComplete: () => void;
  onRemove: () => void;
  onWeightChange: (value: string) => void;
  onRepsChange: (value: string) => void;
  showRemoveButton: boolean;
}

/**
 * Container component for set rows that handles layout and swipe functionality
 */
const SetRowContainer: React.FC<SetRowContainerProps> = ({
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
  const [swiping, setSwiping] = useState(false);
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setSwiping(true);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swiping || !showRemoveButton) return;
    
    const currentX = e.touches[0].clientX;
    const diff = startX - currentX;
    
    if (diff > 0) {
      setOffsetX(Math.min(80, diff));
    } else {
      setOffsetX(0);
    }
  };
  
  const handleTouchEnd = () => {
    setSwiping(false);
    
    if (offsetX > 40) {
      setOffsetX(80);
    } else {
      setOffsetX(0);
    }
  };
  
  const resetSwipe = () => {
    setOffsetX(0);
  };
  
  const handleDeleteClick = () => {
    onRemove();
    resetSwipe();
  };
  
  const handleInputWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onWeightChange(e.target.value);
  };
  
  const handleInputRepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onRepsChange(e.target.value);
  };
  
  return (
    <div className="relative overflow-hidden">
      <div 
        className={`grid grid-cols-12 gap-2 items-center py-4 ${rowClass} border-b border-gray-100`}
        style={{ 
          transform: `translateX(-${offsetX}px)`,
          transition: swiping ? 'none' : 'transform 0.3s ease'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="col-span-1 font-bold text-gray-800">{index + 1}</div>
        <div className="col-span-3 text-gray-500 text-sm">
          {set.previous ? `${set.previous.weight}kg × ${set.previous.reps}` : '-'}
        </div>
        
        <div className="col-span-3">
          <input
            type="text"
            inputMode="decimal"
            className="w-full border border-gray-200 rounded p-2 text-center"
            value={set.weight}
            onChange={handleInputWeightChange}
          />
        </div>
        
        <div className="col-span-3">
          <input
            type="text"
            inputMode="numeric"
            className="w-full border border-gray-200 rounded p-2 text-center"
            value={set.reps}
            onChange={handleInputRepsChange}
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
        </div>
      </div>
      
      {showRemoveButton && (
        <div 
          className="absolute top-0 right-0 h-full flex items-center bg-red-500 text-white"
          style={{ 
            width: '80px', 
            transform: offsetX > 0 ? 'translateX(0)' : 'translateX(80px)',
            transition: swiping ? 'none' : 'transform 0.3s ease'
          }}
          onClick={handleDeleteClick}
        >
          <div className="flex items-center justify-center w-full">
            <Trash className="w-5 h-5" />
          </div>
        </div>
      )}
    </div>
  );
};

export default SetRowContainer;

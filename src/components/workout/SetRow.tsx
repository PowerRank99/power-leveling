
import React, { useState, useEffect } from 'react';
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
  const [swiping, setSwiping] = useState(false);
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  
  // Add local state to ensure values are properly displayed
  const [weightValue, setWeightValue] = useState(set.weight);
  const [repsValue, setRepsValue] = useState(set.reps);
  
  // Update local state when props change
  useEffect(() => {
    setWeightValue(set.weight);
    setRepsValue(set.reps);
  }, [set.weight, set.reps]);
  
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWeightValue(value);
    onWeightChange(value);
  };
  
  const handleRepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRepsValue(value);
    onRepsChange(value);
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setSwiping(true);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swiping || !showRemoveButton) return;
    
    const currentX = e.touches[0].clientX;
    const diff = startX - currentX;
    
    // Only allow swiping left (positive diff)
    if (diff > 0) {
      setOffsetX(Math.min(80, diff)); // Limit the swipe distance
    } else {
      setOffsetX(0);
    }
  };
  
  const handleTouchEnd = () => {
    setSwiping(false);
    
    // If swiped more than 40px, show delete button
    if (offsetX > 40) {
      setOffsetX(80); // Fully reveal delete button
    } else {
      setOffsetX(0); // Reset position
    }
  };
  
  const resetSwipe = () => {
    setOffsetX(0);
  };
  
  const handleDeleteClick = () => {
    onRemove();
    resetSwipe();
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
            className="w-full border border-gray-200 rounded p-2 text-center"
            value={weightValue}
            onChange={handleWeightChange}
          />
        </div>
        
        <div className="col-span-3">
          <input
            type="text"
            className="w-full border border-gray-200 rounded p-2 text-center"
            value={repsValue}
            onChange={handleRepsChange}
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
      
      {/* Delete button that appears when swiped */}
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

export default SetRow;

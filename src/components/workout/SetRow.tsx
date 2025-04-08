import React, { useState, useEffect, useRef } from 'react';
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
  
  const [weightValue, setWeightValue] = useState(set.weight || '0');
  const [repsValue, setRepsValue] = useState(set.reps || '0');
  const isInitializedRef = useRef(false);
  const setIdRef = useRef(set.id);
  const previousValuesRef = useRef({weight: set.weight, reps: set.reps});
  const lastUserEditRef = useRef<number | null>(null);
  
  useEffect(() => {
    console.log(`[SetRow ${index}] Received props update - ID: ${set.id}, Weight: "${set.weight}", Reps: "${set.reps}"`);
    if (set.previous) {
      console.log(`[SetRow ${index}] Previous values - Weight: "${set.previous.weight}", Reps: "${set.previous.reps}"`);
    }
  }, [set, index]);
  
  useEffect(() => {
    if (set.id !== setIdRef.current) {
      console.log(`[SetRow] Set ID changed from ${setIdRef.current} to ${set.id}, reinitializing values`);
      setIdRef.current = set.id;
      isInitializedRef.current = false;
      lastUserEditRef.current = null;
    }
    
    if (!isInitializedRef.current) {
      console.log(`[SetRow ${index}] Initializing values - ID: ${set.id}`);
      console.log(`[SetRow ${index}] Input values - weight: "${set.weight}", reps: "${set.reps}"`);
      if (set.previous) {
        console.log(`[SetRow ${index}] Previous values - weight: "${set.previous.weight}", reps: "${set.previous.reps}"`);
      }
      
      let newWeightValue = set.weight;
      let newRepsValue = set.reps;
      
      if (!newWeightValue || newWeightValue === '0') {
        newWeightValue = set.previous?.weight && set.previous.weight !== '0' ? 
          set.previous.weight : '0';
      }
      
      if (!newRepsValue || newRepsValue === '0') {
        newRepsValue = set.previous?.reps && set.previous.reps !== '0' ? 
          set.previous.reps : '12';
      }
      
      console.log(`[SetRow ${index}] Setting initial values - weight: "${newWeightValue}", reps: "${newRepsValue}"`);
      
      setWeightValue(newWeightValue);
      setRepsValue(newRepsValue);
      previousValuesRef.current = {weight: newWeightValue, reps: newRepsValue};
      isInitializedRef.current = true;
    }
  }, [set.id, index, set.weight, set.reps, set.previous]);
  
  useEffect(() => {
    if (set.weight === previousValuesRef.current.weight && 
        set.reps === previousValuesRef.current.reps) {
      return;
    }
    
    const now = Date.now();
    if (lastUserEditRef.current && now - lastUserEditRef.current < 5000) {
      console.log(`[SetRow ${index}] Ignoring props update as user recently edited values`);
      return;
    }
    
    console.log(`[SetRow ${index}] Received updated values - weight: "${set.weight}", reps: "${set.reps}"`);
    
    if (set.weight && set.weight !== '0' && set.weight !== weightValue) {
      console.log(`[SetRow ${index}] Updating weight from "${weightValue}" to "${set.weight}"`);
      setWeightValue(set.weight);
      previousValuesRef.current.weight = set.weight;
    }
    
    if (set.reps && set.reps !== '0' && set.reps !== repsValue) {
      console.log(`[SetRow ${index}] Updating reps from "${repsValue}" to "${set.reps}"`);
      setRepsValue(set.reps);
      previousValuesRef.current.reps = set.reps;
    }
  }, [set.weight, set.reps, weightValue, repsValue, index]);
  
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log(`[SetRow ${index}] handleWeightChange - from "${weightValue}" to "${value}"`);
    setWeightValue(value);
    lastUserEditRef.current = Date.now();
    onWeightChange(value);
  };
  
  const handleRepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log(`[SetRow ${index}] handleRepsChange - from "${repsValue}" to "${value}"`);
    setRepsValue(value);
    lastUserEditRef.current = Date.now();
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
            value={weightValue}
            onChange={handleWeightChange}
          />
        </div>
        
        <div className="col-span-3">
          <input
            type="text"
            inputMode="numeric"
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

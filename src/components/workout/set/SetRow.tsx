
import React, { useState, useEffect, useRef } from 'react';
import { SetData } from '@/components/workout/set/types';
import SetRowContainer from './SetRowContainer';

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
  
  const handleWeightChange = (value: string) => {
    console.log(`[SetRow ${index}] handleWeightChange - from "${weightValue}" to "${value}"`);
    setWeightValue(value);
    lastUserEditRef.current = Date.now();
    onWeightChange(value);
  };
  
  const handleRepsChange = (value: string) => {
    console.log(`[SetRow ${index}] handleRepsChange - from "${repsValue}" to "${value}"`);
    setRepsValue(value);
    lastUserEditRef.current = Date.now();
    onRepsChange(value);
  };
  
  // Update our set data from local state
  const currentSetData: SetData = {
    ...set,
    weight: weightValue,
    reps: repsValue
  };

  return (
    <SetRowContainer
      index={index}
      set={currentSetData}
      onComplete={onComplete}
      onRemove={onRemove}
      onWeightChange={handleWeightChange}
      onRepsChange={handleRepsChange}
      showRemoveButton={showRemoveButton}
    />
  );
};

export default SetRow;

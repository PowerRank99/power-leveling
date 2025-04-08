
import { useState, useEffect, useRef } from 'react';
import { SetData } from '@/types/workoutTypes';

interface SetInputManagerProps {
  set: SetData;
  onWeightChange: (value: string) => void;
  onRepsChange: (value: string) => void;
}

interface SetInputManagerResult {
  weightValue: string;
  repsValue: string;
  handleWeightChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRepsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Custom hook to manage the state and synchronization of input fields
 */
const SetInputManager = ({
  set,
  onWeightChange,
  onRepsChange
}: SetInputManagerProps): SetInputManagerResult => {
  // Input field state
  const [weightValue, setWeightValue] = useState(set.weight || '0');
  const [repsValue, setRepsValue] = useState(set.reps || '0');
  
  // Reference tracking
  const isInitializedRef = useRef(false);
  const setIdRef = useRef(set.id);
  const previousValuesRef = useRef({weight: set.weight, reps: set.reps});
  const lastUserEditRef = useRef<number | null>(null);
  
  // Reset state when set ID changes (different set)
  useEffect(() => {
    if (set.id !== setIdRef.current) {
      console.log(`[SetInputManager] Set ID changed from ${setIdRef.current} to ${set.id}, reinitializing values`);
      setIdRef.current = set.id;
      isInitializedRef.current = false;
      lastUserEditRef.current = null;
    }
    
    if (!isInitializedRef.current) {
      console.log(`[SetInputManager] Initializing values - ID: ${set.id}`);
      console.log(`[SetInputManager] Input values - weight: "${set.weight}", reps: "${set.reps}"`);
      if (set.previous) {
        console.log(`[SetInputManager] Previous values - weight: "${set.previous.weight}", reps: "${set.previous.reps}"`);
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
      
      console.log(`[SetInputManager] Setting initial values - weight: "${newWeightValue}", reps: "${newRepsValue}"`);
      
      setWeightValue(newWeightValue);
      setRepsValue(newRepsValue);
      previousValuesRef.current = {weight: newWeightValue, reps: newRepsValue};
      isInitializedRef.current = true;
    }
  }, [set.id, set.weight, set.reps, set.previous]);
  
  // Sync with external data changes
  useEffect(() => {
    if (set.weight === previousValuesRef.current.weight && 
        set.reps === previousValuesRef.current.reps) {
      return;
    }
    
    const now = Date.now();
    if (lastUserEditRef.current && now - lastUserEditRef.current < 5000) {
      console.log(`[SetInputManager] Ignoring props update as user recently edited values`);
      return;
    }
    
    console.log(`[SetInputManager] Received updated values - weight: "${set.weight}", reps: "${set.reps}"`);
    
    if (set.weight && set.weight !== '0' && set.weight !== weightValue) {
      console.log(`[SetInputManager] Updating weight from "${weightValue}" to "${set.weight}"`);
      setWeightValue(set.weight);
      previousValuesRef.current.weight = set.weight;
    }
    
    if (set.reps && set.reps !== '0' && set.reps !== repsValue) {
      console.log(`[SetInputManager] Updating reps from "${repsValue}" to "${set.reps}"`);
      setRepsValue(set.reps);
      previousValuesRef.current.reps = set.reps;
    }
  }, [set.weight, set.reps, weightValue, repsValue]);
  
  // Input handlers
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log(`[SetInputManager] handleWeightChange - from "${weightValue}" to "${value}"`);
    setWeightValue(value);
    lastUserEditRef.current = Date.now();
    onWeightChange(value);
  };
  
  const handleRepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log(`[SetInputManager] handleRepsChange - from "${repsValue}" to "${value}"`);
    setRepsValue(value);
    lastUserEditRef.current = Date.now();
    onRepsChange(value);
  };
  
  return {
    weightValue,
    repsValue,
    handleWeightChange,
    handleRepsChange
  };
};

export default SetInputManager;

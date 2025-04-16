
import { useState, useEffect, useRef } from 'react';
import { SetData } from './types';

interface SetInputManagerProps {
  set: SetData;
  onWeightChange: (value: string) => void;
  onRepsChange: (value: string) => void;
}

/**
 * Custom hook to manage set input values and handle synchronization
 */
const SetInputManager = ({ set, onWeightChange, onRepsChange }: SetInputManagerProps) => {
  const [weightValue, setWeightValue] = useState(set.weight || '0');
  const [repsValue, setRepsValue] = useState(set.reps || '0');
  const isInitializedRef = useRef(false);
  const setIdRef = useRef(set.id);
  const previousValuesRef = useRef({ weight: set.weight, reps: set.reps });
  const lastUserEditRef = useRef<number | null>(null);
  
  // Initialize values on first render or when set ID changes
  useEffect(() => {
    if (set.id !== setIdRef.current) {
      console.log(`[SetInputManager] Set ID changed from ${setIdRef.current} to ${set.id}, reinitializing values`);
      setIdRef.current = set.id;
      isInitializedRef.current = false;
      lastUserEditRef.current = null;
    }
    
    if (!isInitializedRef.current) {
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
      
      setWeightValue(newWeightValue);
      setRepsValue(newRepsValue);
      previousValuesRef.current = { weight: newWeightValue, reps: newRepsValue };
      isInitializedRef.current = true;
    }
  }, [set.id, set.weight, set.reps, set.previous]);
  
  // Update local state if props change and no recent user edits
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
    
    if (set.weight && set.weight !== '0' && set.weight !== weightValue) {
      setWeightValue(set.weight);
      previousValuesRef.current.weight = set.weight;
    }
    
    if (set.reps && set.reps !== '0' && set.reps !== repsValue) {
      setRepsValue(set.reps);
      previousValuesRef.current.reps = set.reps;
    }
  }, [set.weight, set.reps, weightValue, repsValue]);
  
  // Handle weight change from UI
  const handleWeightChange = (value: string) => {
    console.log(`[SetInputManager] handleWeightChange - from "${weightValue}" to "${value}"`);
    setWeightValue(value);
    lastUserEditRef.current = Date.now();
    onWeightChange(value);
  };
  
  // Handle reps change from UI
  const handleRepsChange = (value: string) => {
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

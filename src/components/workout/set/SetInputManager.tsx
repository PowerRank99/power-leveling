
import { useState, useEffect, useRef } from 'react';
import { SetData } from '@/types/workout';

interface SetInputManagerProps {
  set: SetData;
  onWeightChange: (value: string) => void;
  onRepsChange: (value: string) => void;
}

/**
 * Custom hook to manage set input values and handle state synchronization
 */
const useSetInputValues = ({ set, onWeightChange, onRepsChange }: SetInputManagerProps) => {
  const [weightValue, setWeightValue] = useState(set.weight ? set.weight.toString() : '0');
  const [repsValue, setRepsValue] = useState(set.reps ? set.reps.toString() : '0');
  const isInitializedRef = useRef(false);
  const setIdRef = useRef(set.id);
  const previousValuesRef = useRef({ weight: set.weight?.toString(), reps: set.reps?.toString() });
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
      let newWeightValue = set.weight ? set.weight.toString() : '0';
      let newRepsValue = set.reps ? set.reps.toString() : '0';
      
      // Use previous values if current values are empty
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
    const currentWeight = set.weight ? set.weight.toString() : '0';
    const currentReps = set.reps ? set.reps.toString() : '0';
    
    if (currentWeight === previousValuesRef.current.weight && 
        currentReps === previousValuesRef.current.reps) {
      return;
    }
    
    const now = Date.now();
    if (lastUserEditRef.current && now - lastUserEditRef.current < 5000) {
      console.log(`[SetInputManager] Ignoring props update as user recently edited values`);
      return;
    }
    
    if (currentWeight && currentWeight !== '0' && currentWeight !== weightValue) {
      setWeightValue(currentWeight);
      previousValuesRef.current.weight = currentWeight;
    }
    
    if (currentReps && currentReps !== '0' && currentReps !== repsValue) {
      setRepsValue(currentReps);
      previousValuesRef.current.reps = currentReps;
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

/**
 * A component that manages the input state for workout sets
 */
const SetInputManager = (props: SetInputManagerProps) => {
  const {
    weightValue,
    repsValue,
    handleWeightChange,
    handleRepsChange
  } = useSetInputValues(props);
  
  return {
    weightValue,
    repsValue,
    handleWeightChange,
    handleRepsChange
  };
};

export default SetInputManager;

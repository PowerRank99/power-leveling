
import React from 'react';
import { SetData } from '@/types/workoutTypes';
import SetRowContainer from './SetRowContainer';
import SetInputManager from './SetInputManager';

interface SetRowProps {
  index: number;
  set: SetData;
  onComplete: () => void;
  onRemove: () => void;
  onWeightChange: (value: string) => void;
  onRepsChange: (value: string) => void;
  showRemoveButton: boolean;
}

/**
 * Component responsible for rendering a single set row with input management
 */
const SetRow: React.FC<SetRowProps> = ({
  index,
  set,
  onComplete,
  onRemove,
  onWeightChange,
  onRepsChange,
  showRemoveButton
}) => {
  // Use the SetInputManager to handle all input state management
  const {
    weightValue,
    repsValue,
    handleWeightChange,
    handleRepsChange
  } = SetInputManager({
    set,
    onWeightChange,
    onRepsChange
  });
  
  return (
    <SetRowContainer
      index={index}
      set={{
        ...set,
        weight: weightValue,
        reps: repsValue
      }}
      onComplete={onComplete}
      onRemove={onRemove}
      onWeightChange={handleWeightChange}
      onRepsChange={handleRepsChange}
      showRemoveButton={showRemoveButton}
    />
  );
};

export default SetRow;

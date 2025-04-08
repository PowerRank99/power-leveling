
import React from 'react';
import { SetData } from '@/types/workoutTypes';
import SwipeableRow from './SwipeableRow';
import SetRowContent from './SetRowContent';
import DeleteButton from './DeleteButton';

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
 * Container component that combines swipe functionality with set row content
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
  const handleSwipeTrigger = () => {
    console.log(`[SetRowContainer] Swipe triggered for set ${index}, calling onRemove`);
    onRemove();
  };

  return (
    <SwipeableRow
      swipeEnabled={showRemoveButton}
      onSwipeTrigger={handleSwipeTrigger}
      renderSwipeAction={({ offsetX, swiping, onClick }) => (
        <DeleteButton 
          offsetX={offsetX} 
          swiping={swiping} 
          onClick={onClick} 
        />
      )}
    >
      <SetRowContent
        index={index}
        set={set}
        onComplete={onComplete}
        onWeightChange={onWeightChange}
        onRepsChange={onRepsChange}
      />
    </SwipeableRow>
  );
};

export default SetRowContainer;

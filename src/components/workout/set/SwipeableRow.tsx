
import React, { useState, useCallback } from 'react';

interface SwipeableRowProps {
  children: React.ReactNode;
  onSwipeTrigger: () => void;
  swipeEnabled: boolean;
  renderSwipeAction: (props: { 
    offsetX: number; 
    swiping: boolean; 
    onClick: () => void 
  }) => React.ReactNode;
}

/**
 * Reusable component to handle touch swipe functionality
 */
const SwipeableRow: React.FC<SwipeableRowProps> = ({
  children,
  onSwipeTrigger,
  swipeEnabled,
  renderSwipeAction
}) => {
  const [swiping, setSwiping] = useState(false);
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!swipeEnabled) return;
    setStartX(e.touches[0].clientX);
    setSwiping(true);
    console.log('[SwipeableRow] Touch start detected');
  }, [swipeEnabled]);
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!swiping || !swipeEnabled) return;
    
    const currentX = e.touches[0].clientX;
    const diff = startX - currentX;
    
    if (diff > 0) {
      setOffsetX(Math.min(80, diff));
      console.log(`[SwipeableRow] Touch move, offsetX: ${Math.min(80, diff)}`);
    } else {
      setOffsetX(0);
    }
  }, [swiping, swipeEnabled, startX]);
  
  const handleTouchEnd = useCallback(() => {
    if (!swipeEnabled) return;
    setSwiping(false);
    
    console.log(`[SwipeableRow] Touch end, offsetX: ${offsetX}`);
    if (offsetX > 40) {
      setOffsetX(80);
    } else {
      setOffsetX(0);
    }
  }, [swipeEnabled, offsetX]);
  
  const resetSwipe = useCallback(() => {
    setOffsetX(0);
  }, []);
  
  const handleAction = useCallback(() => {
    console.log('[SwipeableRow] Action triggered, calling onSwipeTrigger');
    onSwipeTrigger();
    resetSwipe();
  }, [onSwipeTrigger, resetSwipe]);
  
  return (
    <div className="relative overflow-hidden">
      <div 
        style={{ 
          transform: `translateX(-${offsetX}px)`,
          transition: swiping ? 'none' : 'transform 0.3s ease'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
      
      {swipeEnabled && renderSwipeAction({
        offsetX,
        swiping,
        onClick: handleAction
      })}
    </div>
  );
};

export default SwipeableRow;

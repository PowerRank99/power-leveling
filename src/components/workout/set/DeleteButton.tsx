
import React from 'react';
import { Trash } from 'lucide-react';

interface DeleteButtonProps {
  offsetX: number;
  swiping: boolean;
  onClick: () => void;
}

/**
 * Delete button component that appears when swiping a set row
 */
const DeleteButton: React.FC<DeleteButtonProps> = ({ offsetX, swiping, onClick }) => {
  console.log(`[DeleteButton] Rendering with offsetX: ${offsetX}, swiping: ${swiping}`);
  
  return (
    <div 
      className="absolute top-0 right-0 h-full flex items-center bg-red-500 text-white"
      style={{ 
        width: '80px', 
        transform: offsetX > 0 ? 'translateX(0)' : 'translateX(80px)',
        transition: swiping ? 'none' : 'transform 0.3s ease'
      }}
      onClick={(e) => {
        e.stopPropagation(); // Prevent event bubbling
        console.log('[DeleteButton] Delete button clicked, calling onClick handler');
        onClick();
      }}
      role="button"
      aria-label="Delete set"
    >
      <div className="flex items-center justify-center w-full">
        <Trash className="w-5 h-5" />
      </div>
    </div>
  );
};

export default DeleteButton;

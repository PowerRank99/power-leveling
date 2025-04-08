
import React from 'react';
import { Check } from 'lucide-react';

interface CompleteButtonProps {
  isCompleted: boolean;
  onClick: () => void;
}

/**
 * Button component to mark a set as completed
 */
const CompleteButton: React.FC<CompleteButtonProps> = ({ isCompleted, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-8 h-8 rounded-md flex items-center justify-center ${
        isCompleted
          ? 'bg-green-100 text-green-500'
          : 'border border-gray-300 bg-white'
      }`}
      aria-label={isCompleted ? "Unmark as completed" : "Mark as completed"}
    >
      {isCompleted && <Check className="w-4 h-4" />}
    </button>
  );
};

export default CompleteButton;

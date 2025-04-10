
import React from 'react';
import { Check } from 'lucide-react';

interface CompleteButtonProps {
  isCompleted: boolean;
  onClick: () => void;
}

const CompleteButton: React.FC<CompleteButtonProps> = ({ isCompleted, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-8 h-8 rounded-md flex items-center justify-center transition-all duration-200 ${
        isCompleted
          ? 'bg-arcane-30 text-text-primary shadow-glow-subtle'
          : 'border border-divider bg-midnight-elevated hover:bg-arcane-15 hover:border-arcane-30'
      }`}
    >
      {isCompleted && <Check className="w-4 h-4" />}
    </button>
  );
};

export default CompleteButton;

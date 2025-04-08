
import React from 'react';
import { Plus } from 'lucide-react';

interface AddSetButtonProps {
  onAddSet: () => void;
}

const AddSetButton: React.FC<AddSetButtonProps> = ({ onAddSet }) => {
  return (
    <div className="flex gap-2 justify-center mt-4">
      <button 
        className="flex items-center justify-center py-2 px-3 bg-gray-100 rounded-md text-gray-700 font-medium"
        onClick={onAddSet}
      >
        <Plus className="w-5 h-5 mr-2" />
        Add Set
      </button>
    </div>
  );
};

export default AddSetButton;

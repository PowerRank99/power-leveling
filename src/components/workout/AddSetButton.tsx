
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AddSetButtonProps {
  onAddSet: () => void;
}

const AddSetButton: React.FC<AddSetButtonProps> = ({ onAddSet }) => {
  return (
    <div className="flex gap-2 justify-center mt-4">
      <Button 
        variant="outline"
        className="flex items-center justify-center py-2 px-3 bg-midnight-elevated border-divider hover:bg-arcane-15 hover:border-arcane-30 text-text-secondary hover:text-arcane"
        onClick={onAddSet}
      >
        <Plus className="w-5 h-5 mr-2" />
        Adicionar Série
      </Button>
    </div>
  );
};

export default AddSetButton;

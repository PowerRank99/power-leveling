
/**
 * Selection Controls Component
 * 
 * Provides controls for selecting and clearing achievements in the test interface.
 */
import React from 'react';
import { Button } from '@/components/ui/button';

interface SelectionControlsProps {
  selectedCount: number;
  selectAllVisible: () => void;
  clearSelection: () => void;
  filteredCount: number;
  resetFilters: () => void;
}

const SelectionControls: React.FC<SelectionControlsProps> = ({
  selectedCount,
  selectAllVisible,
  clearSelection,
  filteredCount,
  resetFilters,
}) => {
  return (
    <div className="flex space-x-2 text-sm justify-between border-t border-divider/20 pt-2">
      <div className="flex items-center">
        <span className="text-text-secondary mr-2">
          {selectedCount} selected
        </span>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={selectAllVisible}
          disabled={filteredCount === 0}
          className="h-8"
        >
          Select All
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearSelection}
          disabled={selectedCount === 0}
          className="h-8"
        >
          Clear
        </Button>
      </div>
      
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={resetFilters}
          className="h-8"
        >
          Reset Filters
        </Button>
      </div>
    </div>
  );
};

export default SelectionControls;


import React from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface TestControlPanelProps {
  selectedCount: number;
  onRunSelected: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  filteredCount: number;
  isLoading: boolean;
}

const TestControlPanel: React.FC<TestControlPanelProps> = ({
  selectedCount,
  onRunSelected,
  onSelectAll,
  onClearSelection,
  filteredCount,
  isLoading
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onSelectAll}
          disabled={filteredCount === 0 || isLoading}
        >
          Select All ({filteredCount})
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearSelection}
          disabled={selectedCount === 0 || isLoading}
        >
          Clear Selection
        </Button>
      </div>
      
      <Button
        variant="arcane"
        size="sm"
        onClick={onRunSelected}
        disabled={selectedCount === 0 || isLoading}
      >
        <Play className="mr-2 h-4 w-4" />
        Run Selected ({selectedCount})
      </Button>
    </div>
  );
};

export default TestControlPanel;

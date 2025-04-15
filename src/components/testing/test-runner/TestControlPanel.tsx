
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw, Check, Ban } from 'lucide-react';

interface TestControlPanelProps {
  selectedCount: number;
  onRunSelected: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  filteredCount: number;
  isLoading: boolean;
  onGenerateData?: () => void;
  onCleanupData?: () => void;
  showDataControls?: boolean;
}

const TestControlPanel: React.FC<TestControlPanelProps> = ({
  selectedCount,
  onRunSelected,
  onSelectAll,
  onClearSelection,
  filteredCount,
  isLoading,
  onGenerateData,
  onCleanupData,
  showDataControls = false
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
      <div className="space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onSelectAll}
          disabled={filteredCount === 0 || isLoading}
        >
          <Check className="mr-1 h-4 w-4" />
          Select All ({filteredCount})
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearSelection}
          disabled={selectedCount === 0 || isLoading}
        >
          <Ban className="mr-1 h-4 w-4" />
          Clear Selection
        </Button>
      </div>
      
      <div className="flex gap-2">
        {showDataControls && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onGenerateData}
              disabled={isLoading || !onGenerateData}
            >
              <RotateCcw className="mr-1 h-4 w-4" />
              Generate Test Data
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCleanupData}
              disabled={isLoading || !onCleanupData}
            >
              <Ban className="mr-1 h-4 w-4" />
              Cleanup Test Data
            </Button>
          </>
        )}
        
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
    </div>
  );
};

export default TestControlPanel;

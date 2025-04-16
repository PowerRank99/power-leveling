
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, X, Database, Trash2 } from 'lucide-react';

interface TestControlPanelProps {
  selectedCount: number;
  filteredCount: number;
  onRunSelected: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  isLoading: boolean;
  onGenerateData?: () => void;
  onCleanupData?: () => void;
  showDataControls?: boolean;
}

const TestControlPanel: React.FC<TestControlPanelProps> = ({
  selectedCount,
  filteredCount,
  onRunSelected,
  onSelectAll,
  onClearSelection,
  isLoading,
  onGenerateData,
  onCleanupData,
  showDataControls = false
}) => {
  return (
    <div className="flex flex-wrap gap-2 items-center justify-between p-2 border border-divider/30 rounded-md bg-midnight-card mb-4">
      <div className="flex items-center space-x-2">
        <Badge variant="outline" className="bg-midnight-elevated">
          {selectedCount} selected / {filteredCount} filtered
        </Badge>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={onSelectAll}
          disabled={isLoading || filteredCount === 0}
        >
          Select All Visible
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={onClearSelection}
          disabled={isLoading || selectedCount === 0}
        >
          <X className="mr-1 h-3 w-3" />
          Clear Selection
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        {showDataControls && (
          <>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onGenerateData}
              disabled={isLoading}
            >
              <Database className="mr-1 h-3 w-3" />
              Generate Test Data
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={onCleanupData}
              disabled={isLoading}
              className="text-valor hover:text-valor hover:bg-valor-15"
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Cleanup Data
            </Button>
          </>
        )}
        
        <Button 
          variant="arcane" 
          size="sm"
          onClick={onRunSelected}
          disabled={isLoading || selectedCount === 0}
        >
          <Play className="mr-1 h-3 w-3" />
          Run {selectedCount} Tests
        </Button>
      </div>
    </div>
  );
};

export default TestControlPanel;

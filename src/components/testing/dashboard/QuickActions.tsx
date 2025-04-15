
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw, Download } from 'lucide-react';
import { AchievementCategory } from '@/types/achievementTypes';

interface QuickActionsProps {
  onRunAllTests: () => void;
  onRunCategoryTests: (category: string) => void;
  onClearResults: () => void;
  onExportResults: () => void;
  isLoading: boolean;
  hasResults: boolean;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onRunAllTests,
  onRunCategoryTests,
  onClearResults,
  onExportResults,
  isLoading,
  hasResults
}) => {
  return (
    <Card className="bg-midnight-elevated border-divider/30">
      <CardHeader>
        <CardTitle className="text-lg font-orbitron text-text-primary">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            variant="arcane" 
            className="w-full"
            onClick={onRunAllTests}
            disabled={isLoading}
          >
            <Play className="mr-2 h-4 w-4" />
            Run All Tests
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            {Object.values(AchievementCategory).map((category) => (
              <Button
                key={category}
                variant="outline"
                onClick={() => onRunCategoryTests(category)}
                disabled={isLoading}
                className="text-sm bg-midnight-card border-arcane-30 text-text-primary hover:bg-arcane-15"
              >
                {category}
              </Button>
            ))}
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={onClearResults}
              disabled={isLoading || !hasResults}
              className="bg-midnight-card border-valor-30 text-text-primary hover:bg-valor-15"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Clear Results
            </Button>
            
            <Button
              variant="outline"
              onClick={onExportResults}
              disabled={isLoading || !hasResults}
              className="bg-midnight-card border-arcane-30 text-text-primary hover:bg-arcane-15"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Results
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;

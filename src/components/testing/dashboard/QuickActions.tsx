
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Download, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
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
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          variant="arcane" 
          className="w-full justify-start"
          onClick={onRunAllTests}
          disabled={isLoading}
        >
          <Play className="mr-2 h-4 w-4" />
          Run All Tests
        </Button>
        
        <Select 
          value={selectedCategory} 
          onValueChange={setSelectedCategory}
        >
          <SelectTrigger className="bg-midnight-elevated border-divider w-full">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.values(AchievementCategory).map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={() => selectedCategory !== 'all' && onRunCategoryTests(selectedCategory)}
          disabled={isLoading || selectedCategory === 'all'}
        >
          <Play className="mr-2 h-4 w-4" />
          Run Category Tests
        </Button>
        
        <Separator />
        
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={onClearResults}
          disabled={!hasResults}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clear All Results
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={onExportResults}
          disabled={!hasResults}
        >
          <Download className="mr-2 h-4 w-4" />
          Export Results
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActions;


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Layers } from 'lucide-react';
import { Achievement } from '@/types/achievementTypes';
import { AchievementTestResult } from '@/services/testing/AchievementTestingService';

interface TestCategoryBreakdownProps {
  achievements: Achievement[];
  testResults: AchievementTestResult[];
  onRunCategory: (category: string) => void;
}

const TestCategoryBreakdown: React.FC<TestCategoryBreakdownProps> = ({
  achievements,
  testResults,
  onRunCategory
}) => {
  const [expanded, setExpanded] = useState(false);
  
  // Group achievements by category
  const categoryCounts = achievements.reduce((acc, achievement) => {
    const category = achievement.category;
    if (!acc[category]) {
      acc[category] = { total: 0, tested: 0, passed: 0, failed: 0 };
    }
    
    acc[category].total++;
    
    const testResult = testResults.find(r => r.achievementId === achievement.id);
    if (testResult) {
      acc[category].tested++;
      if (testResult.success) {
        acc[category].passed++;
      } else {
        acc[category].failed++;
      }
    }
    
    return acc;
  }, {} as Record<string, { total: number; tested: number; passed: number; failed: number }>);
  
  // Sort categories by count
  const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1].total - a[1].total);
  
  // Limit to top 5 unless expanded
  const displayCategories = expanded 
    ? sortedCategories 
    : sortedCategories.slice(0, 5);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center">
          <Layers className="h-4 w-4 mr-1" />
          Category Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayCategories.map(([category, counts]) => (
          <div key={category} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm capitalize">{category}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRunCategory(category)}
                className="h-6 w-6 p-0"
              >
                <Play className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="w-full h-2 bg-midnight-elevated rounded-full overflow-hidden flex">
              {counts.passed > 0 && (
                <div 
                  className="h-full bg-green-500"
                  style={{ width: `${(counts.passed / counts.total) * 100}%` }}
                />
              )}
              
              {counts.failed > 0 && (
                <div 
                  className="h-full bg-red-500"
                  style={{ width: `${(counts.failed / counts.total) * 100}%` }}
                />
              )}
              
              {counts.tested < counts.total && (
                <div 
                  className="h-full bg-gray-500"
                  style={{ width: `${((counts.total - counts.tested) / counts.total) * 100}%` }}
                />
              )}
            </div>
            
            <div className="flex space-x-2 text-xs">
              <Badge variant="outline" className="px-1 py-0 text-xs">
                {counts.total} Total
              </Badge>
              
              {counts.passed > 0 && (
                <Badge variant="outline" className="px-1 py-0 text-xs text-green-500">
                  {counts.passed} Passed
                </Badge>
              )}
              
              {counts.failed > 0 && (
                <Badge variant="outline" className="px-1 py-0 text-xs text-red-500">
                  {counts.failed} Failed
                </Badge>
              )}
            </div>
          </div>
        ))}
        
        {sortedCategories.length > 5 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="w-full text-xs"
          >
            {expanded ? 'Show Less' : `Show ${sortedCategories.length - 5} More Categories`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default TestCategoryBreakdown;


import React from 'react';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, PlayCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import AchievementTestItem from './AchievementTestItem';
import { AchievementCategory } from '@/types/achievementTypes';
import { AchievementTestResult } from '@/services/testing/AchievementTestingService';

interface AchievementCategorySectionProps {
  category: string;
  achievements: any[];
  selectedAchievements: string[];
  onToggleSelect: (id: string) => void;
  onRunTest: (id: string) => void;
  onRunCategoryTests: (category: AchievementCategory) => void;
  testResults: AchievementTestResult[];
  isDisabled: boolean;
}

const AchievementCategorySection: React.FC<AchievementCategorySectionProps> = ({
  category,
  achievements,
  selectedAchievements,
  onToggleSelect,
  onRunTest,
  onRunCategoryTests,
  testResults,
  isDisabled
}) => {
  return (
    <Collapsible>
      <Card>
        <CollapsibleTrigger className="w-full text-left p-4 flex items-center justify-between">
          <div className="flex items-center">
            <ChevronRight className="h-5 w-5 mr-2 transition-transform data-[state=open]:rotate-90" />
            <h3 className="font-semibold">{category}</h3>
            <Badge variant="outline" className="ml-2">
              {achievements.length}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRunCategoryTests(category as AchievementCategory);
              }}
              disabled={isDisabled}
            >
              <PlayCircle className="h-4 w-4 mr-1" />
              Run
            </Button>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <Separator />
          <div className="p-4">
            <div className="space-y-2">
              {achievements.map(achievement => (
                <AchievementTestItem
                  key={achievement.id}
                  achievement={achievement}
                  isSelected={selectedAchievements.includes(achievement.id)}
                  testResult={testResults.find(r => r.achievementId === achievement.id)}
                  onToggleSelect={() => onToggleSelect(achievement.id)}
                  onRunTest={() => onRunTest(achievement.id)}
                  isDisabled={isDisabled}
                />
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default AchievementCategorySection;

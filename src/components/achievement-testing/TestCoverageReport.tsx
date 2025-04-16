
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

export interface TestCoverageReportData {
  totalAchievements: number;
  testedAchievements: number;
  coveragePercentage: number;
  byCategory: Record<string, { total: number; tested: number; coverage: number }>;
  untestedAchievements: Array<any>;
}

interface TestCoverageReportProps {
  coverage: TestCoverageReportData;
}

const TestCoverageReport: React.FC<TestCoverageReportProps> = ({ coverage }) => {
  if (!coverage) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-orbitron flex items-center">
          <ShieldCheck className="mr-2 h-5 w-5 text-success" />
          Test Coverage Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Total Coverage</span>
            <span className="font-medium">{coverage.coveragePercentage.toFixed(1)}%</span>
          </div>
          <Progress value={coverage.coveragePercentage} className="h-2" />
          <div className="text-xs text-text-secondary">
            {coverage.testedAchievements} of {coverage.totalAchievements} achievements tested
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Coverage by Category</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(coverage.byCategory).map(([category, stats]) => (
              <div key={category} className="p-2 border border-divider/20 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs">{category}</span>
                  <Badge variant={stats.coverage >= 80 ? "success" : "destructive"} className="text-xs">
                    {stats.coverage.toFixed(0)}%
                  </Badge>
                </div>
                <Progress value={stats.coverage} className="h-1" />
              </div>
            ))}
          </div>
        </div>

        {coverage.untestedAchievements && coverage.untestedAchievements.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center">
              <AlertTriangle className="mr-2 h-4 w-4 text-valor" />
              Untested Achievements
            </h4>
            <ScrollArea className="h-[100px] rounded-md border border-divider/30">
              <div className="p-2 space-y-1">
                {coverage.untestedAchievements.map(achievement => (
                  <div key={achievement.id} className="text-xs text-text-secondary flex items-center">
                    <Badge variant="outline" className="mr-2 px-1 py-0">
                      {achievement.category}
                    </Badge>
                    {achievement.name}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TestCoverageReport;

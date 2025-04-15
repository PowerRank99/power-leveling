
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Circle, 
  Unlock,
  Lock
} from 'lucide-react';

interface AchievementStatusChartProps {
  totalCount: number;
  unlockedCount: number;
  testedCount: number;
  passedCount: number;
  failedCount: number;
}

const AchievementStatusChart: React.FC<AchievementStatusChartProps> = ({
  totalCount,
  unlockedCount,
  testedCount,
  passedCount,
  failedCount
}) => {
  const lockedCount = totalCount - unlockedCount;
  const untestedCount = totalCount - testedCount;
  
  // Calculate percentages for the bar chart
  const unlockedPercent = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;
  const lockedPercent = 100 - unlockedPercent;
  
  const passedPercent = totalCount > 0 ? (passedCount / totalCount) * 100 : 0;
  const failedPercent = totalCount > 0 ? (failedCount / totalCount) * 100 : 0;
  const untestedPercent = 100 - passedPercent - failedPercent;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Achievement Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Unlocked vs Locked */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <div className="flex items-center">
              <Unlock className="h-3 w-3 text-arcane mr-1" />
              <span>Unlocked</span>
            </div>
            <span>{unlockedCount} ({Math.round(unlockedPercent)}%)</span>
          </div>
          
          <div className="w-full h-2 bg-midnight-elevated rounded-full overflow-hidden">
            <div 
              className="h-full bg-arcane"
              style={{ width: `${unlockedPercent}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs">
            <div className="flex items-center">
              <Lock className="h-3 w-3 text-text-tertiary mr-1" />
              <span>Locked</span>
            </div>
            <span>{lockedCount} ({Math.round(lockedPercent)}%)</span>
          </div>
        </div>
        
        {/* Test Status */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-xs">
            <span>Test Status</span>
            <span>{testedCount}/{totalCount} tested</span>
          </div>
          
          <div className="w-full h-4 bg-midnight-elevated rounded-full overflow-hidden flex">
            {passedPercent > 0 && (
              <div 
                className="h-full bg-green-500 flex items-center justify-center"
                style={{ width: `${passedPercent}%` }}
              >
                {passedPercent >= 10 && (
                  <CheckCircle className="h-2 w-2 text-white" />
                )}
              </div>
            )}
            
            {failedPercent > 0 && (
              <div 
                className="h-full bg-red-500 flex items-center justify-center"
                style={{ width: `${failedPercent}%` }}
              >
                {failedPercent >= 10 && (
                  <XCircle className="h-2 w-2 text-white" />
                )}
              </div>
            )}
            
            {untestedPercent > 0 && (
              <div 
                className="h-full bg-gray-500 flex items-center justify-center"
                style={{ width: `${untestedPercent}%` }}
              >
                {untestedPercent >= 10 && (
                  <Circle className="h-2 w-2 text-white" />
                )}
              </div>
            )}
          </div>
          
          <div className="flex space-x-4 text-xs">
            <div className="flex items-center">
              <Badge className="h-2 w-2 bg-green-500 mr-1" />
              <span>Passed: {passedCount}</span>
            </div>
            
            <div className="flex items-center">
              <Badge className="h-2 w-2 bg-red-500 mr-1" />
              <span>Failed: {failedCount}</span>
            </div>
            
            <div className="flex items-center">
              <Badge className="h-2 w-2 bg-gray-500 mr-1" />
              <span>Not Tested: {untestedCount}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementStatusChart;

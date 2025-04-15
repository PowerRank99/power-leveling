
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';

interface TestResultsSummaryProps {
  passed: number;
  failed: number;
  pending: number;
}

const TestResultsSummary: React.FC<TestResultsSummaryProps> = ({
  passed,
  failed,
  pending
}) => {
  const total = passed + failed + pending;
  
  // Calculate percentages
  const passedPercent = total > 0 ? Math.round((passed / total) * 100) : 0;
  const failedPercent = total > 0 ? Math.round((failed / total) * 100) : 0;
  const pendingPercent = total > 0 ? Math.round((pending / total) * 100) : 0;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Test Results Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-40">
          {/* Progress circles */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-28 h-28">
              {/* Background circle */}
              <div className="absolute inset-0 rounded-full border-8 border-midnight-elevated" />
              
              {/* Passed segment */}
              {passed > 0 && (
                <div 
                  className="absolute inset-0 rounded-full border-8 border-green-500" 
                  style={{ 
                    clipPath: `polygon(50% 50%, 50% 0%, ${passedPercent < 50 
                      ? `${50 + Math.tan(Math.PI * 2 * (passedPercent / 100)) * 50}% 0%` 
                      : '100% 0%, 100% 100%, 0% 100%, 0% 0%'})` 
                  }}
                />
              )}
              
              {/* Failed segment */}
              {failed > 0 && (
                <div 
                  className="absolute inset-0 rounded-full border-8 border-red-500" 
                  style={{ 
                    clipPath: `polygon(50% 50%, ${passedPercent < 50 
                      ? `${50 + Math.tan(Math.PI * 2 * (passedPercent / 100)) * 50}% 0%` 
                      : '100% 0%'}, ${(passedPercent + failedPercent) < 100 
                      ? `${50 + Math.cos(Math.PI * 2 * ((passedPercent + failedPercent) / 100)) * 50}% ${50 - Math.sin(Math.PI * 2 * ((passedPercent + failedPercent) / 100)) * 50}%` 
                      : '100% 100%, 0% 100%, 0% 0%'})` 
                  }}
                />
              )}
              
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-xs">
                <span className="font-bold text-lg">{total}</span>
                <span className="text-text-secondary">Tests</span>
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
            <div className="flex flex-col items-center">
              <div className="flex items-center mb-1">
                <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs">Passed</span>
              </div>
              <span className="font-semibold">{passed}</span>
              <span className="text-xs text-text-secondary">({passedPercent}%)</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="flex items-center mb-1">
                <XCircle className="h-3 w-3 text-red-500 mr-1" />
                <span className="text-xs">Failed</span>
              </div>
              <span className="font-semibold">{failed}</span>
              <span className="text-xs text-text-secondary">({failedPercent}%)</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="flex items-center mb-1">
                <HelpCircle className="h-3 w-3 text-gray-500 mr-1" />
                <span className="text-xs">Pending</span>
              </div>
              <span className="font-semibold">{pending}</span>
              <span className="text-xs text-text-secondary">({pendingPercent}%)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestResultsSummary;


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Download, Terminal, Database, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { useTestingDashboard } from '@/contexts/TestingDashboardContext';
import { toast } from 'sonner';

interface TestDebugTabProps {
  userId: string;
  logEntries: Array<{ timestamp: Date; action: string; details: string }>;
  onClearLogs: () => void;
}

const TestDebugTab: React.FC<TestDebugTabProps> = ({
  userId,
  logEntries,
  onClearLogs
}) => {
  const { 
    refreshUserAchievements, 
    isLoading 
  } = useTestingDashboard();
  
  const exportLogs = () => {
    const logContent = logEntries.map(entry => 
      `[${format(entry.timestamp, 'yyyy-MM-dd HH:mm:ss')}] ${entry.action}: ${entry.details}`
    ).join('\n');
    
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `achievement-test-logs-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Logs exported');
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          {/* Logs Panel */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg font-orbitron flex items-center">
                <Terminal className="mr-2 h-5 w-5 text-arcane" />
                Test Logs
              </CardTitle>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={exportLogs}
                  disabled={logEntries.length === 0}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onClearLogs}
                  disabled={logEntries.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px] border-t border-divider/30">
                {logEntries.length === 0 ? (
                  <div className="py-8 text-center text-text-tertiary">
                    <p>No test logs yet</p>
                    <p className="text-xs">Run some tests to see logs here</p>
                  </div>
                ) : (
                  <div className="p-3 space-y-1">
                    {logEntries.map((entry, index) => (
                      <div key={index} className="text-sm border-b border-divider/10 pb-1 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between text-xs text-text-tertiary mb-1">
                          <span className="font-mono">
                            {format(entry.timestamp, 'HH:mm:ss')}
                          </span>
                          <span className="font-semibold">
                            {entry.action}
                          </span>
                        </div>
                        <p className="text-text-secondary">
                          {entry.details}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          {/* Database Panel */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center">
                <Database className="mr-2 h-4 w-4 text-arcane" />
                Database Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline"
                onClick={() => refreshUserAchievements()}
                disabled={isLoading}
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Achievement Data
              </Button>
              
              <Button 
                variant="outline"
                className="w-full"
              >
                <Database className="mr-2 h-4 w-4" />
                View User Data
              </Button>
            </CardContent>
          </Card>
          
          {/* System Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">System Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">User ID:</span>
                  <span className="font-mono text-xs">{userId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Browser:</span>
                  <span>{navigator.userAgent.split(' ').slice(-1)[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Time:</span>
                  <span>{format(new Date(), 'HH:mm:ss')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Environment:</span>
                  <span>{import.meta.env.MODE}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TestDebugTab;

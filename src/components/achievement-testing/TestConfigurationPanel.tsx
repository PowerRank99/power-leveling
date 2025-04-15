
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { X, Save, Settings, RefreshCw } from 'lucide-react';
import { useTestingDashboard } from '@/contexts/TestingDashboardContext';
import { toast } from 'sonner';

interface TestConfigurationPanelProps {
  onClose: () => void;
}

const TestConfigurationPanel: React.FC<TestConfigurationPanelProps> = ({
  onClose
}) => {
  const { testService } = useTestingDashboard();
  
  // Configuration state
  const [useCleanup, setUseCleanup] = useState(true);
  const [useTransaction, setUseTransaction] = useState(true);
  const [verbose, setVerbose] = useState(true);
  const [timeout, setTimeout] = useState(10000); // 10 seconds
  const [maxRetries, setMaxRetries] = useState(3);
  
  const updateConfig = () => {
    if (!testService) {
      toast.error('Test service not available');
      return;
    }
    
    testService.updateConfig({
      cleanup: useCleanup,
      useTransaction,
      verbose,
      timeout,
      maxRetries
    });
    
    toast.success('Test configuration updated');
  };
  
  return (
    <Card className="border-arcane-30 shadow-glow-subtle">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-md font-orbitron flex items-center">
          <Settings className="mr-2 h-4 w-4 text-arcane" />
          Test Configuration
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="cleanup" className="cursor-pointer">Cleanup After Tests</Label>
                <Switch 
                  id="cleanup" 
                  checked={useCleanup}
                  onCheckedChange={setUseCleanup}
                />
              </div>
              <p className="text-xs text-text-tertiary">
                Clean up test data after each achievement test
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="transaction" className="cursor-pointer">Use Transactions</Label>
                <Switch 
                  id="transaction" 
                  checked={useTransaction}
                  onCheckedChange={setUseTransaction}
                />
              </div>
              <p className="text-xs text-text-tertiary">
                Run tests in database transactions for better isolation
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="verbose" className="cursor-pointer">Verbose Logging</Label>
                <Switch 
                  id="verbose" 
                  checked={verbose}
                  onCheckedChange={setVerbose}
                />
              </div>
              <p className="text-xs text-text-tertiary">
                Enable detailed logging during test execution
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timeout">Test Timeout (ms)</Label>
              <Input
                id="timeout"
                type="number"
                value={timeout}
                onChange={(e) => setTimeout(Number(e.target.value))}
                className="bg-midnight-elevated border-divider"
              />
              <p className="text-xs text-text-tertiary">
                Maximum time allowed for each test
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="retries">Maximum Retries</Label>
              <Input
                id="retries"
                type="number"
                value={maxRetries}
                onChange={(e) => setMaxRetries(Number(e.target.value))}
                className="bg-midnight-elevated border-divider"
              />
              <p className="text-xs text-text-tertiary">
                Number of times to retry failed tests
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2 justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="outline" onClick={updateConfig}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Update Config
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestConfigurationPanel;

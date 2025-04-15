
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

interface TestConfigurationPanelProps {
  useCleanup: boolean;
  useTransaction: boolean;
  verbose: boolean;
  onCleanupChange: (value: boolean) => void;
  onTransactionChange: (value: boolean) => void;
  onVerboseChange: (value: boolean) => void;
  onUpdateConfig: () => void;
  isLoading: boolean;
}

const TestConfigurationPanel: React.FC<TestConfigurationPanelProps> = ({
  useCleanup,
  useTransaction,
  verbose,
  onCleanupChange,
  onTransactionChange,
  onVerboseChange,
  onUpdateConfig,
  isLoading
}) => {
  return (
    <Card className="bg-midnight-card border-divider/30">
      <CardHeader>
        <CardTitle className="text-lg text-text-primary">Test Configuration</CardTitle>
        <CardDescription className="text-text-secondary">
          Configure how tests are executed and what happens after each test
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="cleanup" className="cursor-pointer text-text-primary">Cleanup After Tests</Label>
            <Switch 
              id="cleanup" 
              checked={useCleanup}
              onCheckedChange={onCleanupChange}
              disabled={isLoading}
            />
          </div>
          <p className="text-xs text-text-secondary">
            When enabled, test data will be cleaned up after each test to prevent interference between tests
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="transaction" className="cursor-pointer text-text-primary">Use Transactions</Label>
            <Switch 
              id="transaction" 
              checked={useTransaction}
              onCheckedChange={onTransactionChange}
              disabled={isLoading}
            />
          </div>
          <p className="text-xs text-text-secondary">
            When enabled, each test will run in a database transaction for better isolation
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="verbose" className="cursor-pointer text-text-primary">Verbose Logging</Label>
            <Switch 
              id="verbose" 
              checked={verbose}
              onCheckedChange={onVerboseChange}
              disabled={isLoading}
            />
          </div>
          <p className="text-xs text-text-secondary">
            Enable detailed logging to console during test execution
          </p>
        </div>
        
        <Button 
          variant="outline"
          className="w-full mt-4 bg-midnight-elevated border-arcane-30 text-text-primary hover:bg-arcane-15"
          onClick={onUpdateConfig}
          disabled={isLoading}
        >
          <Settings className="mr-2 h-4 w-4" />
          Update Configuration
        </Button>
      </CardContent>
    </Card>
  );
};

export default TestConfigurationPanel;


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
    <Card className="bg-midnight-elevated border-divider/30">
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg font-orbitron text-text-primary">Test Configuration</CardTitle>
        <CardDescription className="text-text-secondary">
          Configure how tests are executed and what happens after each test
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="cleanup" className="cursor-pointer text-text-primary hover:text-text-primary/90">
                Cleanup After Tests
              </Label>
              <Switch 
                id="cleanup" 
                checked={useCleanup}
                onCheckedChange={onCleanupChange}
                disabled={isLoading}
                className="data-[state=checked]:bg-arcane"
              />
            </div>
            <p className="text-xs text-text-secondary">
              When enabled, test data will be cleaned up after each test
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="transaction" className="cursor-pointer text-text-primary hover:text-text-primary/90">
                Use Transactions
              </Label>
              <Switch 
                id="transaction" 
                checked={useTransaction}
                onCheckedChange={onTransactionChange}
                disabled={isLoading}
                className="data-[state=checked]:bg-arcane"
              />
            </div>
            <p className="text-xs text-text-secondary">
              When enabled, each test will run in a database transaction
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="verbose" className="cursor-pointer text-text-primary hover:text-text-primary/90">
                Verbose Logging
              </Label>
              <Switch 
                id="verbose" 
                checked={verbose}
                onCheckedChange={onVerboseChange}
                disabled={isLoading}
                className="data-[state=checked]:bg-arcane"
              />
            </div>
            <p className="text-xs text-text-secondary">
              Enable detailed logging to console during test execution
            </p>
          </div>
        </div>
        
        <Button 
          variant="outline"
          className="w-full bg-midnight-card border-arcane-30 text-text-primary hover:bg-arcane-15 transition-colors"
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
